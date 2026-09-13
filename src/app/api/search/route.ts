import { getCloudflareContext } from "@opennextjs/cloudflare/cloudflare-context";
import searchIndex from "./search-index.json";
import { WORK } from "@/lib/design-tokens";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/api-guard";

const MODEL = "@cf/meta/llama-3.2-3b-instruct";
const MAX_QUERY_LENGTH = 200;

/**
 * Workers AI is the only metered part of this site, so repeated questions are answered from
 * cache and each caller (and the isolate as a whole) gets a small AI budget per minute.
 */
const answerCache = new Map<string, { answer: string; at: number }>();
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX = 300;
const EDGE_CACHE_TTL_S = 6 * 60 * 60;
const MAX_ANSWER_CHARS = 2000;

/**
 * Answers are personalised with the visitor's own progress count, so it has to be part of the
 * key — otherwise one visitor could be served another visitor's cached reply.
 */
function cacheId(query: string, progress: number): string {
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
async function readCachedAnswer(query: string, progress: number): Promise<string | undefined> {
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

async function writeCachedAnswer(query: string, progress: number, answer: string): Promise<void> {
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
    const body = (await request.json()) as { query?: string; askAI?: boolean; progress?: number };
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

      const cached = await readCachedAnswer(q, progress);
      if (cached) {
        aiAnswer = cached;
      } else if (isLookup) {
        aiAnswer = `The page you want is **${top.title}** — it is the first result below.`;
      } else if (rateLimit(clientKey(request, "search-ai"), 5, 60_000) && rateLimit("search-ai-global", 60, 60_000)) {
        aiAnswer = await tryAI(q, posts, projects, progress);
        await writeCachedAnswer(q, progress, aiAnswer);
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

function systemPrompt(
  postCount: number,
  projectCount: number,
  progress: number | undefined,
  sources: { title: string; url: string }[]
): string {
  const listed = sources.map((c) => `- ${c.title} -> ${c.url}`).join("\n");
  return `You are SCHIZO, the assistant on Suhesh Kasti's portfolio site. He writes up web security, F5 BIG-IP, DNS and labs he has broken on purpose. You are the friendly person who knows where everything is filed.

How to answer:
- Two or three sentences, plain words. Warm and a bit dry-witted, never corporate, never a chatbot. No "As an AI", no bullet lists, no restating the question.
- Point at the page that answers them and say what is on it.
- Link the single most relevant page as a markdown link. Use ONLY the URLs listed below, copied exactly. Do not build a URL from a title, and never use any other domain.
- The author's own progress notes are private; you may mention them, never repeat them back as a list.
- If nothing listed answers the question, say so in one line and point at the nearest page instead of guessing.

Pages that match this question:
${listed || "- none"}
${postCount + projectCount > 0 ? "" : "Nothing on the site matches this question.\n"}${typeof progress === "number" && progress > 0 ? `The visitor has ticked off ${progress} labs in the PortSwigger roadmap (their own browser data, sent only for this question).\n` : ""}`;
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
  progress?: number
): Promise<string> {
  const env = getEnv();
  const sources = [
    ...posts.map((post) => ({ title: post.title, url: `https://suhesh.com.np${post.url}` })),
    ...projects.map((project) => ({ title: project.title, url: `https://suhesh.com.np${project.url}` })),
  ];
  const sys = systemPrompt(posts.length, projects.length, progress, sources);

  if (env.AI && typeof env.AI.run === "function") {
    try {
      const answer = await runAI(env.AI, q, sys);
      if (answer) return guardLinks(answer, sources);
    } catch (e: unknown) {
      console.error("Workers AI binding failed:", errorText(e));
      if (isQuotaError(e)) return quotaMessage();
    }
  }

  const accountId = env.CF_ACCOUNT_ID || process.env.CF_ACCOUNT_ID;
  const token = env.CF_API_TOKEN || process.env.CF_API_TOKEN;
  if (accountId && token) {
    try {
      const answer = await callAIRest(q, sys, accountId, token);
      if (answer) return guardLinks(answer, sources);
    } catch (e: unknown) {
      console.error("Workers AI REST failed:", errorText(e));
      if (isQuotaError(e)) return quotaMessage();
    }
  } else {
    console.error("AI unavailable: no AI binding and no CF_ACCOUNT_ID/CF_API_TOKEN");
  }

  return unavailableMessage();
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
  return "**SCHIZO is snoozing**\n\nThe free Cloudflare AI quota is used up for today. It resets at midnight UTC. The search results below still work.";
}

function unavailableMessage(): string {
  return "**SCHIZO tripped on a wire**\n\nAI is unreachable right now. The search results below still work.";
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
