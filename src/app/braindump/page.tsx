import type { Metadata } from "next";
import { getPostMetas } from "@/lib/braindump";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import BrainDumpList from "@/components/BrainDumpList";

export const metadata: Metadata = {
  title: "Brain Dump — Cybersecurity Writeups, Research & Deep Dives",
  description:
    "In-depth cybersecurity articles, exploit walkthroughs, CTF writeups, malware analysis deep dives, and security research by Suhesh Kasti. Practical knowledge from the trenches of offensive security.",
};

export default function BrainDumpPage() {
  const posts = getPostMetas();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <BrainDumpList posts={posts} />
      </main>
      <SearchButton />
    </>
  );
}
