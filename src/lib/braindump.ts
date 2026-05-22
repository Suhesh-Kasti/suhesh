import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ContentType = "blog" | "til" | "cheatsheet" | "checklist" | "braindump";

export interface BrainDumpMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  type: ContentType;
  category?: string;
}

export interface BrainDumpPost {
  meta: BrainDumpMeta;
  content: string;
  rawPath: string;
}

const CONTENT_DIRS: { dir: string; type: ContentType }[] = [
  { dir: "braindump", type: "braindump" },
  { dir: "blog", type: "blog" },
  { dir: "til", type: "til" },
  { dir: "cheatsheets", type: "cheatsheet" },
  { dir: "checklists", type: "checklist" },
];

const BASE_DIR = path.join(process.cwd(), "content");

function readMdxFiles(dir: string): string[] {
  const fullPath = path.join(BASE_DIR, dir);
  if (!fs.existsSync(fullPath)) return [];

  const results: string[] = [];
  const walk = (d: string) => {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && !entry.name.startsWith("_")) {
          walk(entryPath);
        }
      } else if (entry.name.endsWith(".mdx") && !entry.name.startsWith("_")) {
        results.push(entryPath);
      }
    }
  };
  walk(fullPath);
  return results;
}

export function getAllSlugs(): string[] {
  const slugs: string[] = [];
  for (const { dir } of CONTENT_DIRS) {
    const files = readMdxFiles(dir);
    for (const file of files) {
      const relPath = path.relative(path.join(BASE_DIR, dir), file);
      const slug = relPath.replace(/\.(mdx|md)$/, "").replace(/\\/g, "/");
      slugs.push(slug);
    }
  }
  return slugs;
}

function formatDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value;
  return "";
}

export function getPostBySlug(slug: string): BrainDumpPost | null {
  for (const { dir, type } of CONTENT_DIRS) {
    for (const ext of [".mdx", ".md"]) {
      const filePath = path.join(BASE_DIR, dir, `${slug}${ext}`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);

        return {
          meta: {
            slug,
            title: data.title ?? slug.replace(/-/g, " "),
            date: formatDate(data.date),
            tags: data.tags ?? data.til_tags ?? data.cheatsheet_tags ?? data.checklist_tags ?? [],
            excerpt: data.description ?? data.excerpt ?? "",
            type,
            category: data.category ?? data.categories?.[0] ?? data.til_categories?.[0] ?? data.cheatsheet_categories?.[0] ?? data.checklist_categories?.[0] ?? data.folder ?? "",
          },
          content,
          rawPath: filePath,
        };
      }
    }
  }
  return null;
}

export function getAllPosts(): BrainDumpPost[] {
  const slugs = getAllSlugs();

  return slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BrainDumpPost => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.meta.date).getTime();
      const dateB = new Date(b.meta.date).getTime();
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateB - dateA;
    });
}

export function getPostMetas(): BrainDumpMeta[] {
  return getAllPosts().map((p) => p.meta);
}

export function getPostsByType(type: ContentType): BrainDumpPost[] {
  return getAllPosts().filter((p) => p.meta.type === type);
}

export function getPostMetasByType(type: ContentType): BrainDumpMeta[] {
  return getPostsByType(type).map((p) => p.meta);
}
