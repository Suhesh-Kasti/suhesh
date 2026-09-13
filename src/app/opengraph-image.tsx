import { ImageResponse } from "next/og";
import { homeCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/cards";

export const alt = "Suhesh Kasti — Application Security Engineer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(homeCard(), { ...OG_SIZE });
}
