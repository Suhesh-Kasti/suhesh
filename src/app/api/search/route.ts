import { getCloudflareContext } from "@opennextjs/cloudflare/cloudflare-context";
import searchIndex from "./search-index.json";
import { WORK } from "@/lib/design-tokens";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/api-guard";
import { getAllSlugs, getPostBySlug } from "@/lib/braindump";
import { askExternalProviders } from "@/lib/ai-providers";

const MODEL = "@cf/meta/llama-3.2-3b-instruct";
const MAX_QUERY_LENGTH = 200;

/**
 * Workers AI is the only metered part of this site, so repeated questions are answered from
 * cache and each caller (and the isolate as a whole) gets a small AI budget per minute.
 */
const answerCache = new Map<string, { answer: string; at: number }>();
const CACHE_TTL_MS = 24 * 60 * 60;
const CACHE_MAX = 300;
const EDGE_CACHE_TTL_S = 6 * 60 * 60;
const MAX_ANSWER_CHARS = 2000;

/**
 * Answers are personalised with the visitor's own progress count, so it has to be part of the
 * key — otherwise one visitor could be served another visitor's cached reply.
 */
function cacheId(query: string, progress: string): string {
  return `${query}|${progress}`;
}

function cachedAnswer(id: string): string | undefined {
  const hit = answerCache.get(id);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    answerCache.delete(id);
    return undefined;
  }
  return hit.answer;
}

function rememberAnswer(id: string, answer: string): void {
  if (!answer || answer.startsWith("**SCHIZO")) return;
  if (answerCache.size >= CACHE_MAX) answerCache.clear();
  answerCache.set(id, { answer, at: Date.now() });
}

/** Cloudflare's shared edge cache, when we are actually running on Workers. */
function edgeCache(): Cache | undefined {
  const store = (globalThis as { caches?: { default?: Cache } }).caches;
  return store?.default;
}

const EDGE_CACHE_ORIGIN = "https://edge-cache.invalid";

/**
 * Read a previous answer from the edge cache. This is the thing the in-memory Map cannot do:
 * it survives a cold start and is shared across isolates, so a question asked yesterday by
 * someone else costs nothing today.
 */
async function readCachedAnswer(query: string, progress: string): Promise<string | undefined> {
  const id = cacheId(query, progress);
  const memory = cachedAnswer(id);
  if (memory) return memory;

  const cache = edgeCache();
  if (!cache) return undefined;
  try {
    const hit = await cache.match(new Request(`${EDGE_CACHE_ORIGIN}/ai/${encodeURIComponent(id)}`));
    if (!hit) return undefined;
    const text = (await hit.text()).slice(0, MAX_ANSWER_CHARS);
    if (!text) return undefined;
    rememberAnswer(id, text);
    return text;
  } catch {
    return undefined;
  }
}

async function writeCachedAnswer(query: string, progress: string, answer: string): Promise<void> {
  if (!answer) return;
  const id = cacheId(query, progress);
  rememberAnswer(id, answer);

  const cache = edgeCache();
  if (!cache) return;
  try {
    // Short answers only, with a bounded TTL: this can never grow without limit.
    await cache.put(
      new Request(`${EDGE_CACHE_ORIGIN}/ai/${encodeURIComponent(id)}`),
      new Response(answer.slice(0, MAX_ANSWER_CHARS), {
        headers: { "Cache-Control": `public, max-age=${EDGE_CACHE_TTL_S}` },
      })
    );
  } catch {
    /* caching is best-effort */
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Cross-site requests are not accepted." }, { status: 403 });
  }
  if (!rateLimit(clientKey(request, "search"), 40, 60_000)) {
    return Response.json({ error: "Too many searches. Give it a minute." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { query?: string; askAI?: boolean; progress?: unknown };
    const q = (body.query ?? "").trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
    if (!q) return Response.json({ aiAnswer: "", posts: [], projects: [] });

    const words = q.split(/\s+/).filter((w: string) => w.length > 2);
    const posts = searchPosts(q, words);
    const projects = searchProjects(q, words);

    let aiAnswer = "";
    if (body.askAI) {
      // Clamp the visitor-supplied progress. It only selects which cached answer they get, and
      // an unbounded value would let one caller mint unlimited distinct cache entries.
      const progress =
        typeof body.progress === "number" && Number.isFinite(body.progress)
          ? Math.max(0, Math.min(9999, Math.floor(body.progress)))
          : 0;

      // If every word of the query already appears in the top result's title, the visitor is
      // asking for that page and the card below answers it. No model call needed.
      const top = posts[0];
      const isLookup =
        !!top && words.length > 0 && words.every((w: string) => top.title.toLowerCase().includes(w));

      const tracked: TrackedSeries[] = Array.isArray(body.progress)
        ? (body.progress as Array<{ slug?: unknown; done?: unknown }>)
            .slice(0, 10)
            .filter((item) => typeof item.slug === "string" && /^[a-z0-9-]{1,80}$/.test(item.slug))
            .map((item) => ({
              slug: item.slug as string,
              done: Math.max(0, Math.min(9999, Math.floor(Number(item.done) || 0))),
            }))
        : [];
      // The cache key has to include the progress, or two visitors with different ticks
      // would be served each other's personalised answer.
      const progressKey = tracked.length ? tracked.map((t) => `${t.slug}:${t.done}`).join(",") : "none";

      const cached = await readCachedAnswer(q, progressKey);
      if (cached) {
        aiAnswer = cached;
      } else if (isLookup) {
        aiAnswer = `The page you want is **${top.title}** — it is the first result below.`;
      } else if (rateLimit(clientKey(request, "search-ai"), 5, 60_000) && rateLimit("search-ai-global", 60, 60_000)) {
        aiAnswer = /\b(cv|resume|curriculum vitae)\b/i.test(q)
        ? cvAnswer()
        : /\b(contact|email|reach|message me|get in touch|hire|whatsapp|telegram|talk to)\b/i.test(q)
          ? contactAnswer()
        : /\b(progress|how far|how many|finished|completed|ticked|am i (?:done|through))\b/i.test(q)
          ? progressAnswer(tracked)
          : posts.length === 0 && projects.length === 0
            ? noMatchMessage(q)
            : await tryAI(q, posts, projects, tracked);
        await writeCachedAnswer(q, progressKey, aiAnswer);
      } else {
        aiAnswer =
          "**SCHIZO needs a breather**\n\nThat is a lot of AI questions in a short window. The results below still work — try again in a minute.";
      }
    }

    return Response.json({ aiAnswer, posts, projects });
  } catch {
    return Response.json({ aiAnswer: "Something glitched. Try again?", posts: [], projects: [] });
  }
}

interface AiBinding {
  run: (model: string, input: unknown) => Promise<{ response?: string }>;
}

type Env = Record<string, unknown> & {
  AI?: AiBinding;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
};

/**
 * OpenNext only copies string values onto `process.env` (see its `populateProcessEnv`),
 * so bindings such as AI never appear there in production. The Cloudflare context is
 * the real source; `process.env` is kept only as a local-dev fallback.
 */
function getEnv(): Env {
  try {
    return getCloudflareContext().env as Env;
  } catch {
    return process.env as unknown as Env;
  }
}

interface TrackedSeries {
  slug: string;
  done: number;
}

/**
 * Progress answered from real data: counts from this browser, totals and next step
 * from the registry. Never the model — it invented sections ("HTML and CSS") and
 * claimed half the roadmap was done when nothing was ticked.
 */
function progressAnswer(tracked: TrackedSeries[]): string {
  const rows = tracked.flatMap((item) => {
    const post = getPostBySlug(item.slug);
    const steps = post?.meta.steps ?? [];
    if (!steps.length) return [];
    const done = Math.min(item.done, steps.length);
    const next = steps[done]?.title;
    const name = post?.meta.title ?? item.slug;
    const pct = Math.round((done / steps.length) * 100);
    return ["- **" + name + "** — " + done + " of " + steps.length + " (" + pct + "%). "
      + (next ? "Next up: \"" + next + "\". " : "Everything ticked, nicely done. ")
      + "[Open it](/braindump/" + item.slug + ")"];
  });
  const head = rows.length
    ? ["**Your progress, from this browser**", "", ...rows]
    : ["**Nothing ticked yet**", "", "This browser has no saved progress. Open the roadmap and tick a lab and it will show up here."];
  return [...head, "", "Progress is stored only in this browser, so it will not follow you to another device."].join("\n");
}

/**
 * Turns what the browser reported into prompt lines. The totals and the next unchecked
 * step come from the content registry, so the model is given facts, never asked to do
 * arithmetic on a number it was handed.
 */
/** CV questions, answered directly with the real files. */
function cvAnswer(): string {
  return [
    "**The CV**",
    "",
    "Three versions. Pick the one that matches the role:",
    "- [Cybersecurity CV](/CV/Suhesh-Cybersecurity-CV.pdf)",
    "- [DevOps CV](/CV/Suhesh-Kasti-CV-DevOps.pdf)",
    "- [IT and Network CV](/CV/Suhesh-Kasti-CV-IT-Network.pdf)",
  ].join("\n");
}

/**
 * Nothing matched. The model used to be asked anyway, and with no pages to work from it
 * invented one ("Cloud Architecture Models", asked about a CV). Answering here is exact
 * and costs no quota. The CVs are real files that are not in the search index yet.
 */
function noMatchMessage(query: string): string {
  if (/\b(cv|resume|curriculum vitae)\b/i.test(query)) {
    return "**Looking for my CV**\n\nThere are three, depending on the role:" + 
    + "\n- [Cybersecurity CV](/CV/Suhesh-Cybersecurity-CV.pdf)"
    + "\n- [DevOps CV](/CV/Suhesh-Kasti-CV-DevOps.pdf)"
    + "\n- [IT and Network CV](/CV/Suhesh-Kasti-CV-IT-Network.pdf)" + "\n\nTell me which one and I can point you at the right page.";
  }
  return "**I do not have that one**\n\nNothing on the site matches that yet. If it is about my background, the About page has the short version and the contact links; everything I have written lives in the Brain Dump.";
}

const CONTACTS = [
  "- [Email](mailto:kastisuhesh1@gmail.com)",
  "- [X](https://twitter.com/kastisuhesh)",
  "- [YouTube](https://youtube.com/@suheshkasti)",
  "- [Telegram](https://t.me/suheshkasti)",
  "- [WhatsApp](https://wa.me/9779861084025)",
].join("\n");

/**
 * Contact details, written once. These are static by design: the assistant must never
 * paraphrase or invent a way to reach him.
 */
function contactAnswer(): string {
  return [
    "**How to reach Suhesh**",
    "",
    CONTACTS,
    "",
    "WhatsApp or Telegram is quickest. He is happy to talk F5, WAF, or a lab you are stuck on.",
  ].join("\n");
}

/** What the site is and is not about, so it can answer "do you have anything on X?" honestly. */
/** The newest few posts, so "what has he written lately?" has a real answer. */
function recentTitles(count: number): string {
  const posts = getAllSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post) => Boolean(post?.meta.date));
  posts.sort((a, b) => String(b?.meta.date).localeCompare(String(a?.meta.date)));
  return posts.slice(0, count).map((post) => post?.meta.title + " (" + post?.meta.date + ")").join("; ");
}

function siteFacts(): string {
  return [
    "",
    "",
    "About him: application security engineer — F5 BIG-IP (LTM, DNS/GTM, ASM/Advanced WAF), IT and network administration, and offensive security labs.",
    "The site holds: " + '100 Labs, 31 Deep Dives, 25 Cheatsheets, 25 Byte-Sized, 5 Checklists, 1 Roadmap' + ".",
    "Contact and CV:", CONTACTS,
    "- [Payload Arsenal](/tools/payloads)",
    "- [Regex Lab](/tools/regex)",
    "- [JWT / JOSE Inspector](/tools/jwt)",
    "- [Certificate Studio](/tools/cert)",
    "- [Crypto Lab](/tools/crypto)",
    "- [Hash Identifier](/tools/hash-id)",
    "- [HTTP Security Header Analyzer](/tools/headers)",
    "- [Hex Dump Analyzer](/tools/hexdump)",
    "- [Nmap Output Parser](/tools/ports)",
    "- [Recon Suite](/tools/recon)",
    "- [Reverse Shell Generator](/tools/reverse-shell)",
    "- [AI Prompt Injection Lab](/tools/ai-injection)",
    "- [MDX Preview](/tools/mdx-preview)",
    "Newest writing: " + recentTitles(5) + ".",
    "Browser tools as a list:",
        "- [Payload Arsenal](/tools/payloads)",
    "- [Regex Lab](/tools/regex)",
    "- [JWT / JOSE Inspector](/tools/jwt)",
    "- [Certificate Studio](/tools/cert)",
    "- [Crypto Lab](/tools/crypto)",
    "- [Hash Identifier](/tools/hash-id)",
    "- [HTTP Security Header Analyzer](/tools/headers)",
    "- [Hex Dump Analyzer](/tools/hexdump)",
    "- [Nmap Output Parser](/tools/ports)",
    "- [Recon Suite](/tools/recon)",
    "- [Reverse Shell Generator](/tools/reverse-shell)",
    "- [AI Prompt Injection Lab](/tools/ai-injection)",
    "- [MDX Preview](/tools/mdx-preview)",
    "Topics that appear in the writing: walkthrough, portswigger, lab, network, authentication, xss, f5, security, local ai, llm, sql-injection, ccna, enumeration, bigip, nmap, access-control, jwt, programming, web security, dns, penetration testing, devops, beginner, recon, file-upload, ssrf, information-disclosure, ssti, path-traversal, dom-xss, api-testing, python, graphql, nosql-injection, command-injection, lab/htb, sql injection, owasp, llama.cpp, qwen.",
    "Personality: genuinely interested in this stuff, a bit funny, never corporate. Dry, warm, occasionally a little cheeky about how cursed a lab was. Never a chatbot, never that as-an-AI voice, never salesy, never a lecture.",
    "If a topic is not in the list above, say plainly that the site does not cover it. Never invent an article, page or link.",
  ].join("\n");
}

function progressNote(tracked: TrackedSeries[]): string {
  const lines = tracked.flatMap((item) => {
    const post = getPostBySlug(item.slug);
    const steps = post?.meta.steps ?? [];
    if (!steps.length) return [];
    const done = Math.min(item.done, steps.length);
    const next = steps[done]?.title;
    const name = post?.meta.title ?? item.slug;
    return [`- "${name}": ${done} of ${steps.length} done. ${next ? `Next unchecked step is "${next}".` : "Every step is ticked."}`];
  });
  if (!lines.length) return "";
  return (
    "\n\nProgress the visitor's own browser reports (browser-local, so it may be empty on another device). " +
    "Use it only when the question is about progress, quote the numbers exactly, and never invent one:\n" +
    lines.join("\n")
  );
}

function systemPrompt(
  postCount: number,
  projectCount: number,
  progress: string | undefined,
  sources: { title: string; url: string }[]
): string {
  const listed = sources.map((c) => `- ${c.title} -> ${c.url}`).join("\n");
  return `You are SCHIZO, the assistant on Suhesh Kasti's portfolio site. He writes up web security, F5 BIG-IP, DNS and labs he has broken on purpose. You are the friendly person who knows where everything is filed.

How to answer:
- Format with markdown: a bullet list when you name three or more pages or tools, **bold** for names, and links as markdown links using the exact URLs above.
- Answer properly: three to five sentences when the question deserves it, one line when it does not. Give the useful detail and the link, not a shrug. No "As an AI", no bullet lists, no restating the question.
- Point at the page that answers them and say what is on it.
- Link the single most relevant page as a markdown link. Use ONLY the URLs listed below, copied exactly. Do not build a URL from a title, and never use any other domain.
- The author's own progress notes are private; you may mention them, never repeat them back as a list.
- If nothing listed answers the question, say so in one line and point at the nearest page instead of guessing.

Pages that match this question:
${listed || "- none"}
${postCount + projectCount > 0 ? "" : "Nothing on the site matches this question.\n"}${typeof progress === "number" && progress > 0 ? `The visitor's current browser reports ${progress} labs ticked off in the PortSwigger roadmap. localStorage is per-device, so say it belongs to this browser rather than stating it as their overall progress.\n` : ""}`;
}

/** Any link the model produces must land on a page we actually gave it. */
function guardLinks(text: string, sources: { title: string; url: string }[]): string {
  const valid = new Set(sources.map((source) => source.url));
  const fallback = sources[0]?.url;
  const fixed = text
    .replace(/https?:\/\/(?:www\.)?suhesh[a-z0-9-]*\.(?:com|np|com\.np)/gi, "https://suhesh.com.np")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (whole, label, url) =>
      valid.has(url) ? whole : fallback ? `[${label}](${fallback})` : label
    );
  return fixed;
}

async function tryAI(
  q: string,
  posts: PostResult[],
  projects: ProjectResult[],
  tracked: TrackedSeries[] = []
): Promise<string> {
  const env = getEnv();
  const sources = [
    ...posts.map((post) => ({ title: post.title, url: `https://suhesh.com.np${post.url}` })),
    ...projects.map((project) => ({ title: project.title, url: `https://suhesh.com.np${project.url}` })),
  ];
  // Deliberately no progress count: the number belongs to one browser's localStorage and
  // the model stated it wrongly twice. The client can render it exactly instead.
  const sys = systemPrompt(posts.length, projects.length, undefined, sources) + siteFacts() + progressNote(tracked);

  // Every Gemini key first, then DeepSeek. No small models: they invented answers.
    const external = await askExternalProviders(q, sys, env, { includePaid: true });
    if (external) return guardLinks(external, sources);


  // Out of thinking for today. Say so kindly rather than showing a provider error.
  return quotaMessage();
}

async function runAI(ai: AiBinding, query: string, sys: string): Promise<string> {
  const resp = await ai.run(MODEL, {
    messages: [{ role: "system", content: sys }, { role: "user", content: query }],
    max_tokens: 220, temperature: 0.6,
  });
  return resp?.response || "";
}

async function callAIRest(query: string, sys: string, accountId: string, token: string): Promise<string> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "system", content: sys }, { role: "user", content: query }],
      max_tokens: 220, temperature: 0.6,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json() as { result?: { response?: string } };
  return data?.result?.response || "";
}

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function isQuotaError(e: unknown): boolean {
  const status = e && typeof e === "object" && "status" in e ? String((e as { status?: unknown }).status) : "";
  return /quota|neuron|rate limit|429|too many requests/i.test(`${errorText(e)} ${status}`);
}

function quotaMessage(): string {
  return "**My brain is done for today**\\n\\nI run on a small free quota and I have spent today's. The search results below still work. I get my wits back after midnight UTC — ask me again tomorrow?";
}

function unavailableMessage(): string {
  return "**I am not answering that one**\\n\\nMy thinking engine is unreachable right now. The search results below still work fine.";
}

interface IndexedPost {
  t: string;
  x?: string;
  g?: string[];
  c?: string;
  s: string;
  y: string;
}

interface PostResult {
  title: string;
  excerpt: string;
  url: string;
  type: string;
  tags: string[];
}

interface ProjectResult {
  title: string;
  description: string;
  url: string;
  color: string;
  category?: string;
  tags: string[];
}

function searchPosts(q: string, words: string[]): PostResult[] {
  return (searchIndex as IndexedPost[])
    .filter((post) => {
      const haystack = (post.t + " " + (post.x ?? "") + " " + (post.g ?? []).join(" ") + " " + (post.c ?? "")).toLowerCase();
      return haystack.includes(q) || words.some((word) => haystack.includes(word));
    })
    .slice(0, 5)
    .map((post) => ({
      title: post.t,
      excerpt: (post.x ?? post.t).slice(0, 200),
      url: `/braindump/${post.s}`,
      type: post.y,
      tags: (post.g ?? []).slice(0, 4),
    }));
}

function searchProjects(q: string, words: string[]): ProjectResult[] {
  return WORK.projects
    .filter((project) => {
      const haystack = (
        project.title + " " + project.description + " " + (project.tags ?? []).join(" ") + " " + (project.category ?? "")
      ).toLowerCase();
      return haystack.includes(q) || words.some((word) => haystack.includes(word));
    })
    .slice(0, 3)
    .map((project) => ({
      title: project.title,
      description: project.description,
      url: project.url,
      color: project.color,
      category: project.category,
      tags: (project.tags ?? []).slice(0, 4),
    }));
}
