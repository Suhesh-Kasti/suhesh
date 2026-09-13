import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostMetas } from "@/lib/braindump";
import { POSTS_PER_PAGE } from "@/lib/pagination";
import BrainDumpList from "@/components/BrainDumpList";

const BASE_URL = "https://suhesh.com.np";

/** Every archive page is prerendered. Page 1 lives at /braindump, so only 2..N are generated. */
export const dynamicParams = false;

export function generateStaticParams() {
  const totalPages = Math.ceil(getPostMetas().length / POSTS_PER_PAGE);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

interface Props {
  params: Promise<{ page: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const description = `Page ${page} of the SCHIZO brain dump — cybersecurity writeups, penetration testing walkthroughs, DNS and Linux guides, and cheatsheets by Suhesh Kasti.`;

  return {
    title: `Brain Dump — Page ${page}`,
    description,
    alternates: { canonical: `${BASE_URL}/braindump/page/${page}` },
    openGraph: {
      title: `Brain Dump — Page ${page}`,
      description,
      url: `${BASE_URL}/braindump/page/${page}`,
      siteName: "SCHIZO",
    },
    twitter: {
      card: "summary_large_image",
      title: `Brain Dump — Page ${page}`,
      description,
    },
  };
}

export default async function BrainDumpArchivePage({ params }: Props) {
  const { page } = await params;
  const posts = getPostMetas();
  const pageNumber = Number(page);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > totalPages) {
    notFound();
  }

  return (
    <main className="flex-1 pt-16">
      <BrainDumpList posts={posts} page={pageNumber} />
    </main>
  );
}
