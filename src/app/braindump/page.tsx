import type { Metadata } from "next";
import { getPostMetas } from "@/lib/braindump";
import BrainDumpList from "@/components/BrainDumpList";
import { ItemListStructuredData } from "@/components/ItemListStructuredData";

export const dynamic = "force-static";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "Brain Dump — Cybersecurity Writeups, Research & Deep Dives",
  description:
    "In-depth cybersecurity articles, penetration testing walkthroughs, CTF writeups, DNS and Linux guides, and security research by Suhesh Kasti. Practical knowledge from the trenches.",
  alternates: { canonical: `${BASE_URL}/braindump` },
  openGraph: {
    title: "Brain Dump — Cybersecurity Writeups, Research & Deep Dives",
    description:
      "In-depth cybersecurity articles, penetration testing walkthroughs, CTF writeups, DNS and Linux guides, and security research by Suhesh Kasti. Practical knowledge from the trenches.",
    url: `${BASE_URL}/braindump`,
    siteName: "SCHIZO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain Dump — Cybersecurity Writeups, Research & Deep Dives",
    description:
      "In-depth cybersecurity articles, penetration testing walkthroughs, CTF writeups, DNS and Linux guides, and security research by Suhesh Kasti. Practical knowledge from the trenches.",
  },
};

export default function BrainDumpPage() {
  const posts = getPostMetas();

  return (
    <>
      <ItemListStructuredData
        name="SCHIZO Brain Dump"
        description="Cybersecurity writeups, penetration testing walkthroughs, CTF solutions, DNS and Linux guides, and structured learning roadmaps."
        path="/braindump"
        items={posts.map((post) => ({ name: post.title, url: `/braindump/${post.slug}` }))}
      />
      <main className="flex-1 pt-16">
        <BrainDumpList posts={posts} page={1} />
      </main>
    </>
  );
}
