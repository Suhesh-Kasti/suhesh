import type { MetadataRoute } from "next";
import { getPostMetas } from "@/lib/braindump";
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

  const posts = getPostMetas();

  // Real publication dates, not build time, so search engines can tell what is new.
  const postEntries = posts.map((post) => ({
    url: `${BASE_URL}/braindump/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // The archive pages are linked from one another, but listing them makes discovery certain.
  const totalArchivePages = Math.ceil(posts.length / POSTS_PER_PAGE);
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
