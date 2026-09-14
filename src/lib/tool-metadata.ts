import toolsJson from "@/data/tools.json";

/**
 * Dedicated tool pages. The data lives in src/data/tools.json so the build script can read
 * the exact same list when it writes llms.txt and the sitemap — one source of truth.
 */
export interface ToolMeta {
  summary?: string;
  color?: string;
  grid?: boolean;
  slug: string;
  name: string;
  /** Page title. Kept short — the root layout template appends " | SCHIZO". */
  title: string;
  description: string;
  /** Thin pages are kept out of the index. */
  noindex?: boolean;
}

export const TOOL_META: ToolMeta[] = toolsJson as ToolMeta[];

export const INDEXABLE_TOOL_META: ToolMeta[] = TOOL_META.filter((tool) => !tool.noindex);

export function getToolMeta(slug: string): ToolMeta | undefined {
  return TOOL_META.find((tool) => tool.slug === slug);
}
