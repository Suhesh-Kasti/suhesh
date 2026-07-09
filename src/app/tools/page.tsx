import type { Metadata } from "next";
import ArtPlayground from "@/components/ArtPlayground";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "CyberTools — Interactive Security Tools & Playground",
  description:
    "Interactive cybersecurity tools and playground: JWT debugger, XSS payload generator, MDX editor, and more. Hands-on security tools for developers and researchers.",
  alternates: { canonical: `${BASE_URL}/tools` },
  openGraph: {
    title: "CyberTools — Interactive Security Tools & Playground",
    description:
      "Interactive cybersecurity tools and playground: JWT debugger, XSS payload generator, MDX editor, and more. Hands-on security tools for developers and researchers.",
    url: `${BASE_URL}/tools`,
    siteName: "SCHIZO",
    images: [
      {
        url: `${BASE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SCHIZO — Suhesh Kasti's cybersecurity portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberTools — Interactive Security Tools & Playground",
    description:
      "Interactive cybersecurity tools and playground: JWT debugger, XSS payload generator, MDX editor, and more. Hands-on security tools for developers and researchers.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function ToolsPage() {
  return (
    <>
      <main className="flex-1 pt-16">
        <ArtPlayground />
      </main>
    </>
  );
}
