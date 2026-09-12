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

function cachedAnswer(query: string): string | undefined {
  const hit = answerCache.get(query);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    answerCache.delete(query);
    return undefined;
  }
  return hit.answer;
}

function rememberAnswer(query: string, answer: string): void {
  if (!answer || answer.startsWith("**SCHIZO")) return;
  if (answerCache.size >= CACHE_MAX) answerCache.clear();
  answerCache.set(query, { answer, at: Date.now() });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Cross-site requests are not accepted." }, { status: 403 });
  }
  if (!rateLimit(clientKey(request, "search"), 40, 60_000)) {
    return Response.json({ error: "Too many searches. Give it a minute." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { query?: string; askAI?: boolean };
    const q = (body.query ?? "").trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
    if (!q) return Response.json({ aiAnswer: "", posts: [], projects: [] });

    const words = q.split(/\s+/).filter((w: string) => w.length > 2);
    const posts = searchPosts(q, words);
    const projects = searchProjects(q, words);

    let aiAnswer = "";
    if (body.askAI) {
      const cached = cachedAnswer(q);
      if (cached) {
        aiAnswer = cached;
      } else if (rateLimit(clientKey(request, "search-ai"), 5, 60_000) && rateLimit("search-ai-global", 60, 60_000)) {
        aiAnswer = await tryAI(q, posts, projects);
        rememberAnswer(q, aiAnswer);
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

function systemPrompt(postCount: number, projectCount: number): string {
  const hasContent = postCount > 0 || projectCount > 0;
  return `You are SCHIZO — Suhesh's witty digital sidekick. He's an AppSec & Offensive Security engineer. Use markdown (bold, lists). 2-4 sentences max. Be fun, unhinged. Roast Suhesh playfully. Never corporate.${
    hasContent
      ? ` Found ${postCount} post(s) and ${projectCount} project(s) — mention briefly.`
      : " No site matches found."
  }`;
}

async function tryAI(q: string, posts: PostResult[], projects: ProjectResult[]): Promise<string> {
  const env = getEnv();
  const sys = systemPrompt(posts.length, projects.length);

  if (env.AI && typeof env.AI.run === "function") {
    try {
      const answer = await runAI(env.AI, q, sys);
      if (answer) return answer;
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
      if (answer) return answer;
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
    max_tokens: 200, temperature: 0.85,
  });
  return resp?.response || "";
}

async function callAIRest(query: string, sys: string, accountId: string, token: string): Promise<string> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "system", content: sys }, { role: "user", content: query }],
      max_tokens: 200, temperature: 0.85,
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
