import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/braindump";
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
  const braindumpSlugs = getAllSlugs();
  const braindumpEntries = braindumpSlugs.map((slug) => ({
    url: `${BASE_URL}/braindump/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projectSlugs = WORK.projects.map((p) => p.url.replace(/^\//, ""));
  const projectEntries = projectSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));

  return [...staticEntries, ...braindumpEntries, ...projectEntries];
}
