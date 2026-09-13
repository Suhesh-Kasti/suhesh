import { ImageResponse } from "next/og";
import { TOOL_META } from "@/lib/tool-metadata";
import { toolsCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/cards";

export const alt = "Free browser-based security tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(toolsCard(TOOL_META.map((tool) => tool.name)), { ...OG_SIZE });
}
