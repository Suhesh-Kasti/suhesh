import { ImageResponse } from "next/og";

import { sectionCard, OG_CONTENT_TYPE, OG_SIZE, ACCENT } from "@/lib/og/cards";

export const alt = "Projects by Suhesh Kasti";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(sectionCard({
      eyebrow: "PROJECTS",
      title: "Things I built",
      subtitle: "A local AI security agent, browser automation, web experiments and desktop tooling — built alongside application security work.",
      chips: ["AI Agent", "Automation", "Web Experiments", "Tooling"],
      accent: ACCENT.blue,
      footer: "SCHIZO · FEATURED WORK",
    }), { ...OG_SIZE });
}
