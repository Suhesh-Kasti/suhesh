import { ImageResponse } from "next/og";

import { sectionCard, OG_CONTENT_TYPE, OG_SIZE, ACCENT } from "@/lib/og/cards";

export const alt = "About Suhesh Kasti";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(sectionCard({
      eyebrow: "ABOUT",
      title: "Who I am",
      subtitle: "Application security engineer working with F5 BIG-IP and web application firewalls, writing up everything I learn on the way.",
      chips: ["F5 BIG-IP", "Web Security", "Linux", "Networking"],
      accent: ACCENT.orange,
      footer: "SCHIZO · PORTFOLIO",
    }), { ...OG_SIZE });
}
