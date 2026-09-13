import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faBookOpen, faFileCode, faFlask, faInfinity, faListCheck, faMap, faRoad } from "@fortawesome/free-solid-svg-icons";
import type { ContentType } from "@/lib/braindump";
import { COLORS } from "@/lib/design-tokens";

export interface ContentTypeConfig {
  label: string;
  color: string;
  textColor?: string;
  icon: IconDefinition;
  order: number;
}

/**
 * One source of truth for how each content type looks and what it is called, so the archive
 * page and the home-page preview can never drift apart. Checklist used to share orange with
 * labs, which made the two indistinguishable on the archive.
 */
export const TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  braindump: { label: "MAP", color: COLORS.pink, textColor: "var(--pink-text)", icon: faMap, order: 0 },
  roadmap: { label: "Roadmap", color: COLORS.teal, textColor: "var(--teal-text)", icon: faRoad, order: 1 },
  lab: { label: "Labs", color: COLORS.orange, textColor: "var(--orange-text)", icon: faFlask, order: 2 },
  cheatsheet: { label: "Cheatsheets", color: COLORS.green, textColor: "var(--green-text)", icon: faBookOpen, order: 3 },
  checklist: { label: "Checklists", color: COLORS.red, textColor: "var(--red-text)", icon: faListCheck, order: 4 },
  til: { label: "Byte-Sized", color: COLORS.blue, textColor: "var(--blue-text)", icon: faInfinity, order: 5 },
  blog: { label: "Deep Dives", color: COLORS.purple, textColor: "var(--purple-text)", icon: faFileCode, order: 6 },
};

/** Types shown in the home-page preview, one card each. */
export const PREVIEW_TYPES: ContentType[] = ["blog", "til", "checklist", "cheatsheet", "lab"];

export function typeConfig(type: string): ContentTypeConfig {
  return TYPE_CONFIG[type as ContentType] ?? TYPE_CONFIG.blog;
}

/** Links a type badge to the archive, pre-filtered — the same thing as clicking the filter there. */
export function typeFilterHref(type: string): string {
  return `/braindump?type=${encodeURIComponent(type)}`;
}
