import { CONTENT_ENTRIES, HEADINGS_MAP, type TocHeading } from "./content-registry";

export type ContentType = "blog" | "til" | "cheatsheet" | "checklist" | "braindump" | "roadmap" | "lab";

export interface SeriesStep {
  title: string;
  slug: string;
  description: string;
}

export interface BrainDumpMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  type: ContentType;
  category?: string;
  image?: string;
  steps?: SeriesStep[];
}

export interface BrainDumpPost {
  meta: BrainDumpMeta;
  headings: TocHeading[];
}

export function getAllSlugs(): string[] {
  return CONTENT_ENTRIES.map((e) => e.slug);
}

export function getPostBySlug(slug: string): BrainDumpPost | null {
  const entry = CONTENT_ENTRIES.find((e) => e.slug === slug);
  if (!entry) return null;

  return {
    meta: {
      slug: entry.slug,
      title: entry.title,
      date: entry.date,
      tags: entry.tags,
      excerpt: entry.excerpt,
      type: entry.type as ContentType,
      category: entry.category,
      image: entry.image,
      steps: entry.steps,
    },
    headings: HEADINGS_MAP[slug] ?? [],
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
    image: entry.image,
    steps: entry.steps,
  }));
}
