import type { MetadataRoute } from "next";

/**
 * AI assistants are deliberately allowed here: the whole point of the brain dump is to be
 * read and cited. Only the API surface is closed off, so crawlers cannot burn the AI quota.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
  "meta-externalagent",
  "Amazonbot",
  "YouBot",
  "AI2Bot",
];

const DISALLOW = ["/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: "https://suhesh.com.np/sitemap.xml",
    host: "https://suhesh.com.np",
  };
}
