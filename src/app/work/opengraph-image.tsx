import { ImageResponse } from "next/og";

import { sectionCard, OG_CONTENT_TYPE, OG_SIZE, ACCENT } from "@/lib/og/cards";

export const alt = "Featured work by Suhesh Kasti";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(sectionCard({
      eyebrow: "WORK",
      title: "Featured work",
      subtitle: "Projects, experiments and the security writeups that came out of them.",
      chips: ["Projects", "Writeups", "Experiments"],
      accent: ACCENT.green,
      footer: "SCHIZO · FEATURED WORK",
    }), { ...OG_SIZE });
}
