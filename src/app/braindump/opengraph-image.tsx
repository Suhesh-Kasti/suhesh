import { ImageResponse } from "next/og";
import { getPostMetas } from "@/lib/braindump";
import { archiveCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/cards";

export const alt = "SCHIZO Brain Dump";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(archiveCard(getPostMetas().length), { ...OG_SIZE });
}
