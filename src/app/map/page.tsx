import type { Metadata } from "next";
import { getPostMetas } from "@/lib/braindump";
import MindMap from "@/components/MindMap";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "Knowledge Map — Explore All Content Visually",
  description:
    "Interactive mindmap of all SCHIZO content. Browse blog posts, cheatsheets, checklists, and TILs in an expandable tree structure. Find cybersecurity knowledge fast.",
  alternates: { canonical: `${BASE_URL}/map` },
  openGraph: {
    title: "Knowledge Map — Explore All Content Visually",
    description:
      "Interactive mindmap of all SCHIZO content. Browse blog posts, cheatsheets, checklists, and TILs in an expandable tree structure. Find cybersecurity knowledge fast.",
    url: `${BASE_URL}/map`,
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
    title: "Knowledge Map — Explore All Content Visually",
    description:
      "Interactive mindmap of all SCHIZO content. Browse blog posts, cheatsheets, checklists, and TILs in an expandable tree structure. Find cybersecurity knowledge fast.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function MapPage() {
  const posts = getPostMetas();

  return (
    <div className="h-screen overflow-hidden pt-16">
      <MindMap posts={posts} />
    </div>
  );
}
