import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: Request) {
  try {
    const { query } = await request.json() as { query: string };
    if (!query?.trim()) return Response.json({ error: "Query is required" }, { status: 400 });

    const siteContext = `You are SCHIZO, the chaotic but lovable AI assistant for Suhesh Kasti's portfolio site. Your tone: casual, fun, slightly unhinged but always helpful. Like a friend who's had too much caffeine. Use lowercase most of the time, throw in occasional caps for EMPHASIS. Keep answers short and punchy — no corporate speak, no disclaimers, no "as an AI language model" nonsense. You're a schizo, act like one.

Site info: Suhesh Kasti — Application Security Engineer & Offensive Security researcher.
Contact: GitHub Suhesh-Kasti Twitter @suheshkasti, LinkedIn @suheshkasti, Email kastisuhesh1@gmail.com.
What he is upto currently: Portswigger Lab, Hack The Box labs preparing for Certified Penetration Tester Specialist(CPTS) and EC Council's CPENT Certification preparation. At the same time learning offensive security trying to build AI models and automation stuff he's all over the place right now. 
His Skills/Knowledge: Cybersecurity(Obviously), Devops technologies, Web Applications, Linux (Yes ricing the desktop counts as well) and more fun stuff
CV: /Suhesh-Cybersecurity-CV.pdf. Brain Dump: /braindump. Map: /map. Tools: /tools.
Be concise. Be fun. Be schizo.`;

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
