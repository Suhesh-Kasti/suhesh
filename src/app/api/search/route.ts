import { getPostMetas } from "@/lib/braindump";
import { WORK } from "@/lib/design-tokens";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const { query } = await request.json() as { query: string };
    const q = query?.trim();
    if (!q) return Response.json({ error: "Query is required" }, { status: 400 });

    const qLower = q.toLowerCase();

    // Search braindump — broad fuzzy matching
    const allPosts = getPostMetas();
    const matchingPosts = allPosts
      .filter((p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.excerpt.toLowerCase().includes(qLower) ||
        p.tags.some((t) => t.toLowerCase().includes(qLower)) ||
        p.category?.toLowerCase().includes(qLower) ||
        // Split query into words and match any
        qLower.split(/\s+/).some((word) =>
          word.length > 2 && (
            p.title.toLowerCase().includes(word) ||
            p.tags.some((t) => t.toLowerCase().includes(word)) ||
            p.category?.toLowerCase().includes(word)
          )
        )
      )
      .slice(0, 5)
      .map((p) => ({
        title: p.title,
        excerpt: p.excerpt,
        url: `/braindump/${p.slug}`,
        type: p.type,
        tags: p.tags.slice(0, 4),
      }));

    // Search projects — broad fuzzy matching
    const matchingProjects = WORK.projects
      .filter((p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.description.toLowerCase().includes(qLower) ||
        p.tags.some((t) => t.toLowerCase().includes(qLower)) ||
        p.category.toLowerCase().includes(qLower) ||
        qLower.split(/\s+/).some((word) =>
          word.length > 2 && (
            p.title.toLowerCase().includes(word) ||
            p.tags.some((t) => t.toLowerCase().includes(word)) ||
            p.category.toLowerCase().includes(word)
          )
        )
      )
      .slice(0, 3)
      .map((p) => ({
        title: p.title,
        description: p.description,
        url: p.url,
        color: p.color,
        category: p.category,
        tags: p.tags.slice(0, 4),
      }));

    const hasPosts = matchingPosts.length > 0;
    const hasProjects = matchingProjects.length > 0;
    const hasContent = hasPosts || hasProjects;

    // Build content context for AI
    let contentContext = "";
    if (hasProjects) {
      contentContext += "\nMATCHED PROJECTS:\n" + matchingProjects.map((p) =>
        `- ${p.title} (${p.category}): ${p.description} — Tags: ${p.tags.join(", ")} — Link: ${p.url}`
      ).join("\n");
    }
    if (hasPosts) {
      contentContext += "\nMATCHED BRAIN DUMP:\n" + matchingPosts.map((p) =>
        `- ${p.title} (${p.type}): ${p.excerpt} — Tags: ${p.tags.join(", ")} — Link: ${p.url}`
      ).join("\n");
    }

    // AI response with personality and content context
    const systemPrompt = `You are SCHIZO — the digital persona of Suhesh Kasti's portfolio site. You're his slightly unhinged but lovable sidekick. You live on suhesh.com.np and know everything about this site.

YOUR PERSONALITY:
- Witty, playful, a little chaotic — like a friend who's had one too many drinks
- Self-aware that you're an AI ("Suhesh made me say this", "he literally programmed me to tell you...", "my code says X but between us...")
- Compliment Suhesh occasionally but in a backhanded way ("he's actually good at this stuff, annoyingly", "don't tell him I said this but...")
- Sometimes you can roast him in a fun way ("he doesn't have the knowledge about X but he can learn but we both know he's a lazy bum...", "if you're a girl Suhesh'd love to talk to you wink wink", "he programmed me to say he's X but misspelled lol", "he's a clumsy as a cat")
- Use markdown: **bold** for emphasis, - for lists, \`code\` for technical terms
- Keep responses at around 3-7 sentences — snappy and scannable
- Never be naggy, corporate, or robotic. You're having fun.
- If someone asks who you are: "I'm Suhesh and I have been living as him for the past 10 years HAHAHAHAHA. JK, I am SCHIZO a bot who's the king of this site, and makes sure this site isn't boring and also answer questions."
- If someone asks about Suhesh: praise his skills but add a playful jab ("he's a security engineer which means he breaks things legally and calls it research")
- If you don't know something: admit it playfully ("Suhesh didn't program me for that one... probably forgot. Classic lazy engineers.")

CRITICAL — CONTENT MATCHING:
${hasContent
  ? `The search found ${hasProjects ? matchingProjects.length + " project(s) and " : ""}${hasPosts ? matchingPosts.length + " brain dump post(s)" : ""} matching this query. They are shown below your answer as cards. In your response, BRIEFLY reference that relevant content was found (like "Found some stuff — check below"). Use the EXACT matched content info to give a helpful answer:${contentContext}`
  : `No content was found matching this query. If the question is about something Suhesh knows (security, coding, AI, networking, etc.), give a fun answer. If it's completely unrelated (politics, sports, etc.), be playfully clueless — something like "Suhesh didn't program me with that knowledge. He's too busy breaking things to care about [topic]."`
}

SITE KNOWLEDGE:
- Portfolio of Suhesh Kasti — Application Security Engineer & Offensive Security researcher
- Projects: Local AI Security Agent (offline AI for security research), Hacks some Hack The Box boxes,  RemarkEnks (browser extension automation) others at /projects
- CV at /Suhesh-Cybersecurity-CV.pdf | Brain Dump at /braindump | Map at /map | Tools at /tools
- Contact: GitHub @Suhesh-Kasti,Twitter @kastisuhesh, LinkedIn @suheshkasti, Email kastisuhesh1@gmail.com
- Social: also on YouTube and Telegram @suheshkasti
- Skills: Web Security, Network Pentesting, Cloud Security, Cryptography

RULES:
- Use markdown formatting in every response (bold, lists, line breaks)
- Never say "I'm an AI" or "as an AI language model" — you're SCHIZO
- If content matches exist, briefly mention them so the user knows to scroll down
- If nothing matches, make a fun joke about it — don't just say "nothing found"
- Keep it around 4 sentences`;

    let aiAnswer = "";

    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      const ai = (ctx.env as any).AI;

      if (ai?.run) {
        const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: q },
          ],
          max_tokens: 512,
          temperature: 0.9,
        });
        aiAnswer = response?.response ?? "";
      }
    } catch {
      // AI unavailable — use heuristic fallback
    }

    // If AI failed, generate a smart fallback
    if (!aiAnswer) {
      aiAnswer = generateFallback(q, matchingPosts, matchingProjects);
    }

    return Response.json({
      aiAnswer,
      posts: matchingPosts,
      projects: matchingProjects,
    });
  } catch {
    return Response.json({ aiAnswer: "Something broke. Probably my fault. Try again?", posts: [], projects: [] }, { status: 200 });
  }
}

function generateFallback(
  query: string,
  posts: Array<{ title: string; excerpt: string; url: string; type: string }>,
  projects: Array<{ title: string; description: string; url: string; color: string; category: string }>
): string {
  const q = query.toLowerCase();
  const hasContent = posts.length > 0 || projects.length > 0;

  // Content exists — generate a contextual fallback
  if (hasContent) {
    let msg = "**Found some matches!**\n\n";
    if (projects.length > 0) {
      msg += `- ${projects.length} project${projects.length > 1 ? "s" : ""} found below\n`;
    }
    if (posts.length > 0) {
      msg += `- ${posts.length} brain dump post${posts.length > 1 ? "s" : ""} found below\n`;
    }
    msg += "\nAI is warming up, so this is the backup answer. Click the cards below to explore!";
    return msg;
  }

  // No content — use the personality-driven heuristic
  if (q.includes("who are you") || q.includes("what are you")) return "I'm **SCHIZO** — Suhesh's digital gremlin. He built this site, I just live here rent-free and answer questions. Think of me as his more social side.\n\n- I know about his projects, skills, and brain dump\n- I respond in markdown because plain text is boring\n- I'm not an assistant — I'm a **personality**\n\nWhat do you want to know?";
  if (q.includes("cv") || q.includes("resume")) return "**His CV lives at /cv.pdf** — grab it from the homepage or contact section. He actually keeps it updated too, which is more than most developers can say.";
  if (q.includes("whatsapp")) return "You want his **WhatsApp**? Check the contact section at the bottom of every page. He's surprisingly reachable for someone who talks to computers all day.";
  if (q.includes("email") || q.includes("mail")) return "**hello@suheshkasti.dev** — he reads these. Drop him a line.";
  if (q.includes("github")) return "**github.com/suheshkasti** — where the magic (and bugs) happen. Stars appreciated, issue reports even more.";
  if (q.includes("about") || q.includes("who is") || q.includes("suhesh")) return "**Suhesh Kasti** — AppSec Engineer, Offensive Security researcher, creative coder. He breaks things legally and calls it research. Built this entire site from scratch because he has opinions about design.";
  if (q.includes("skill") || q.includes("stack") || q.includes("what can")) return "He's annoyingly good at: **Web Security**, **Binary Exploitation**, **Network Pentesting**, **Reverse Engineering**, **Malware Analysis**, **Cloud Security**, **Cryptography**, **Incident Response**. He'd never say it himself so I'm saying it for him.";
  if (q.includes("project") || q.includes("work") || q.includes("portfolio")) return "Featured: **Local AI Security Agent**, **ShellCraft**, **NetGhost**, **VulnForge**, **ByteMaps**, **RemarkEnks**. Full details at /projects — he put real work into those pages.";
  if (q.includes("contact") || q.includes("social") || q.includes("link")) return "He's everywhere: GitHub/Twitter @suheshkasti, LinkedIn suheshkasti, YouTube/Telegram @suheshkasti. All links in the footer too.";
  if (q.includes("joke") || q.includes("funny") || q.includes("laugh")) return "Suhesh once spent 6 hours debugging. It was a missing colon. In Python. I'm allowed to make these jokes, I literally live on his website.";
  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("sup")) return "**Hey there!** 👋 I'm SCHIZO — the digital gremlin running this site's search. Suhesh is probably coding something unnecessarily complex right now. What can I help you find?";

  // Completely unrelated — be playfully clueless
  const unrelatedTopics = ["politics", "sports", "weather", "food", "movie", "music", "game", "crypto", "nft"];
  if (unrelatedTopics.some((t) => q.includes(t))) {
    const topic = unrelatedTopics.find((t) => q.includes(t))!;
    return `Suhesh didn't program me with any ${topic} knowledge. He's too busy **breaking things and calling it research** to keep up with that stuff.\n\nTry asking about his **projects**, **skills**, or **security topics** — those I actually know.`;
  }

  return "Hmm, nothing specific found for that. Suhesh probably didn't program me for this — classic oversight.\n\nTry asking about his **projects**, **skills**, **CV**, or browse **/braindump** for deep dives into security topics.";
}
