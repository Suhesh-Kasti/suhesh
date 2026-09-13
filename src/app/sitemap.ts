import type { MetadataRoute } from "next";
import { CONTENT_ENTRIES } from "@/lib/content-registry";
import { POSTS_PER_PAGE } from "@/lib/pagination";
import { INDEXABLE_TOOL_META } from "@/lib/tool-metadata";
import { WORK } from "@/lib/design-tokens";

const BASE_URL = "https://suhesh.com.np";

const STATIC_ROUTES = [
  { url: "/", priority: 1.0, changeFreq: "weekly" as const },
  { url: "/about", priority: 0.9, changeFreq: "monthly" as const },
  { url: "/braindump", priority: 0.9, changeFreq: "weekly" as const },
  { url: "/projects", priority: 0.8, changeFreq: "weekly" as const },
  { url: "/tools", priority: 0.8, changeFreq: "monthly" as const },
  { url: "/contact", priority: 0.7, changeFreq: "monthly" as const },
  { url: "/work", priority: 0.7, changeFreq: "monthly" as const },
  { url: "/map", priority: 0.8, changeFreq: "weekly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));

  // Real publication dates, not build time, so search engines can tell what is new.
  // Every screenshot in an article is declared here, which is what gets those images
  // into Google and Bing image search rather than only the page itself.
  const postEntries = CONTENT_ENTRIES.map((entry) => ({
    url: `${BASE_URL}/braindump/${entry.slug}`,
    lastModified: entry.date ? new Date(entry.date) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    ...(entry.images.length ? { images: entry.images.map((image) => `${BASE_URL}${image}`) } : {}),
  }));

  // The archive pages are linked from one another, but listing them makes discovery certain.
  const totalArchivePages = Math.ceil(CONTENT_ENTRIES.length / POSTS_PER_PAGE);
  const archiveEntries = Array.from({ length: Math.max(0, totalArchivePages - 1) }, (_, index) => ({
    url: `${BASE_URL}/braindump/page/${index + 2}`,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  const toolEntries = INDEXABLE_TOOL_META.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Only real project routes. WORK.projects also holds filtered list links such as
  // "/braindump?tag=htb", which are not pages and must never appear in the sitemap.
  const projectEntries = WORK.projects
    .map((project) => project.url)
    .filter((url) => /^\/projects\/[a-z0-9-]+$/.test(url))
    .map((url) => ({
      url: `${BASE_URL}${url}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticEntries, ...postEntries, ...archiveEntries, ...toolEntries, ...projectEntries];
}
