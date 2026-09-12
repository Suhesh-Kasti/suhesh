import type { Metadata } from "next";
import { getPostMetas } from "@/lib/braindump";
import BrainDumpList from "@/components/BrainDumpList";
import { ItemListStructuredData } from "@/components/ItemListStructuredData";

export const dynamic = "force-static";

const BASE_URL = "https://suhesh.com.np";

export const metadata: Metadata = {
  title: "Brain Dump — Cybersecurity Writeups, Research & Deep Dives",
  description:
    "In-depth cybersecurity articles, exploit walkthroughs, CTF writeups, malware analysis deep dives, and security research by Suhesh Kasti. Practical knowledge from the trenches of offensive security.",
  alternates: { canonical: `${BASE_URL}/braindump` },
  openGraph: {
    title: "Brain Dump — Cybersecurity Writeups, Research & Deep Dives",
    description:
      "In-depth cybersecurity articles, exploit walkthroughs, CTF writeups, malware analysis deep dives, and security research by Suhesh Kasti. Practical knowledge from the trenches of offensive security.",
    url: `${BASE_URL}/braindump`,
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
    title: "Brain Dump — Cybersecurity Writeups, Research & Deep Dives",
    description:
      "In-depth cybersecurity articles, exploit walkthroughs, CTF writeups, malware analysis deep dives, and security research by Suhesh Kasti. Practical knowledge from the trenches of offensive security.",
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function BrainDumpPage() {
  const posts = getPostMetas();

  return (
    <>
      <ItemListStructuredData
        name="SCHIZO Brain Dump"
        description="Cybersecurity writeups, exploit walkthroughs, CTF solutions, malware analysis and structured learning roadmaps."
        path="/braindump"
        items={posts.map((post) => ({ name: post.title, url: `/braindump/${post.slug}` }))}
      />
      <main className="flex-1 pt-16">
        <BrainDumpList posts={posts} page={1} />
      </main>
    </>
  );
}
