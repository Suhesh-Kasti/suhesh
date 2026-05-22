import type { Metadata } from "next";
import { getPostMetas } from "@/lib/braindump";
import Navbar from "@/components/Navbar";
import MindMap from "@/components/MindMap";

export const metadata: Metadata = {
  title: "Knowledge Map — Explore All Content Visually",
  description:
    "Interactive mindmap of all SCHIZO content. Browse blog posts, cheatsheets, checklists, and TILs in an expandable tree structure. Find cybersecurity knowledge fast.",
};

export default function MapPage() {
  const posts = getPostMetas();

  return (
    <div className="h-screen overflow-hidden pt-16">
      <Navbar />
      <MindMap posts={posts} />
    </div>
  );
}
