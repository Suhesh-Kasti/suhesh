import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    const { query } = await request.json() as { query: string };
    if (!query?.trim()) return Response.json({ error: "Query is required" }, { status: 400 });

    const siteContext = "Site: SCHIZO - Suhesh Kasti's portfolio. Role: AppSec & Offensive Security. Contact: GitHub/Twitter @suheshkasti, LinkedIn suheshkasti, Email hello@suheshkasti.dev. Projects: Local AI Security Agent, ShellCraft, NetGhost, VulnForge, ByteMaps, RemarkEnks. CV: /cv.pdf. Brain Dump: /braindump. Map: /map. Tools: /tools. Answer concisely.";

    const { env } = getCloudflareContext();
    const ai = (env as Record<string, any>).AI;

    if (!ai) {
      return Response.json(
        { error: "AI binding not found. Check wrangler configuration." },
        { status: 500 }
      );
    }

    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: siteContext },
        { role: "user", content: query },
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const answer = response?.response ?? "Sorry, couldn't process that.";
    return Response.json({ answer });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
