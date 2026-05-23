import { CONTENT_ENTRIES, COMPILED_MAP, RAW_CONTENT_MAP } from "./content-registry";

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
  compiledSource: string;
  rawContent: string;
}

export function getAllSlugs(): string[] {
  return CONTENT_ENTRIES.map((e) => e.slug);
}

export function getPostBySlug(slug: string): BrainDumpPost | null {
  const entry = CONTENT_ENTRIES.find((e) => e.slug === slug);
  if (!entry) return null;
  const compiledSource = COMPILED_MAP[slug];
  const rawContent = RAW_CONTENT_MAP[slug];
  if (!compiledSource) return null;

  return {
    meta: {
      slug: entry.slug,
      title: entry.title,
      date: entry.date,
      tags: entry.tags,
      excerpt: entry.excerpt,
      type: entry.type as ContentType,
      category: entry.category,
    },
    compiledSource,
    rawContent,
  };
}

export function getPostMetas(): BrainDumpMeta[] {
  return CONTENT_ENTRIES.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    date: entry.date,
    tags: entry.tags,
    excerpt: entry.excerpt,
    type: entry.type as ContentType,
    category: entry.category,
  }));
}

export function getPostsByType(type: ContentType): BrainDumpMeta[] {
  return CONTENT_ENTRIES
    .filter((e) => e.type === type)
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      date: entry.date,
      tags: entry.tags,
      excerpt: entry.excerpt,
      type: entry.type as ContentType,
      category: entry.category,
    }));
}

export function getPostMetasByType(type: ContentType): BrainDumpMeta[] {
  return getPostsByType(type);
}
