import searchIndex from "./search-index.json";
import { WORK } from "@/lib/design-tokens";

export async function POST(request: Request) {
  try {
    const { query } = await request.json() as { query: string };
    const q = (query || "").trim().toLowerCase();
    if (!q) return Response.json({ aiAnswer: "", posts: [], projects: [] });

    const words = q.split(/\s+/).filter((w: string) => w.length > 2);

    const posts = searchPosts(q, words);
    const projects = searchProjects(q, words);

    let aiAnswer = "";
    try {
      const ai = (globalThis as any).AI;
      if (ai?.run) {
        const hasContent = posts.length > 0 || projects.length > 0;
        const sys = `You are SCHIZO — Suhesh's witty digital sidekick. He's an AppSec & Offensive Security engineer. Use markdown (bold, lists). 2-4 sentences max. Be fun, unhinged. Roast Suhesh playfully. Never corporate.${hasContent ? ` Found ${posts.length} post(s) and ${projects.length} project(s) — mention briefly.` : " No site matches found."}`;
        const resp = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [{ role: "system", content: sys }, { role: "user", content: query }],
          max_tokens: 200, temperature: 0.85,
        });
        if (resp?.response) aiAnswer = resp.response;
      }
    } catch {}

    if (!aiAnswer) {
      aiAnswer = (posts.length > 0 || projects.length > 0)
        ? `**SCHIZO is snoozing** 😴\n\nDaily AI quota likely hit. Back tomorrow! Found **${posts.length}** post(s) and **${projects.length}** project(s) below.`
        : "**SCHIZO is snoozing** 😴\n\nAI daily quota reached. Try again tomorrow! Meanwhile browse **/braindump** or **/projects**.";
    }

    return Response.json({ aiAnswer, posts, projects });
  } catch {
    return Response.json({ aiAnswer: "Something glitched. Try again?", posts: [], projects: [] });
  }
}

function searchPosts(q: string, words: string[]) {
  return (searchIndex as any[]).filter((p: any) => {
    const haystack = (p.t + " " + (p.x||"") + " " + (p.g||[]).join(" ") + " " + (p.c||"")).toLowerCase();
    return haystack.includes(q) || words.some((w: string) => haystack.includes(w));
  }).slice(0, 5).map((p: any) => ({
    title: p.t, excerpt: (p.x||p.t).slice(0, 200), url: `/braindump/${p.s}`, type: p.y, tags: (p.g||[]).slice(0, 4)
  }));
}

function searchProjects(q: string, words: string[]) {
  return WORK.projects.filter((p: any) => {
    const haystack = (p.title + " " + p.description + " " + (p.tags||[]).join(" ") + " " + (p.category||"")).toLowerCase();
    return haystack.includes(q) || words.some((w: string) => haystack.includes(w));
  }).slice(0, 3).map((p: any) => ({
    title: p.title, description: p.description, url: p.url, color: p.color, category: p.category, tags: (p.tags||[]).slice(0, 4)
  }));
}
