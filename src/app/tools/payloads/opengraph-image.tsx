import { ImageResponse } from "next/og";
import { getToolMeta } from "@/lib/tool-metadata";
import { toolCard, OG_CONTENT_TYPE, OG_SIZE, TOOL_ACCENTS } from "@/lib/og/cards";

export const alt = "Free browser-based security tool";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  const tool = getToolMeta("payloads");

  return new ImageResponse(
    toolCard({
      name: tool?.name ?? "Security Tool",
      title: tool?.title ?? "Security Tool",
      description: tool?.description ?? "",
      accent: TOOL_ACCENTS[0],
      eyebrow: "PAYLOADS",
    }),
    { ...OG_SIZE }
  );
}
