import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/braindump";
import { MdxContent } from "@/components/MdxContent";
import TableOfContents from "@/components/TableOfContents";
import { BlogPostingStructuredData } from "@/components/BlogPostingStructuredData";
import SeriesRoadmap from "@/components/SeriesRoadmap";
import { RelatedPosts } from "@/components/RelatedPosts";

export const dynamic = "force-static";
export const revalidate = false;

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const post = getPostBySlug(slugStr);
  if (!post) return { title: "Not Found" };

  const BASE_URL = "https://suhesh.com.np";
  const url = `${BASE_URL}/braindump/${slugStr}`;
  // Per-article share card (see src/app/og/[...slug]/route.tsx), rendered at build time.
  const ogImage = `${BASE_URL}/og/${slugStr}`;

  return {
    title: `${post.meta.title} — SCHIZO Brain Dump`,
    description: post.meta.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.meta.title,
      description: post.meta.excerpt,
      url,
      type: "article",
      publishedTime: post.meta.date,
      authors: ["Suhesh Kasti"],
      tags: post.meta.tags,
      siteName: "SCHIZO",
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.excerpt,
      images: [ogImage],
    },
  };
}

export default async function BrainDumpPost({ params }: Props) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const post = getPostBySlug(slugStr);

  if (!post) notFound();

  return (
    <>
      <BlogPostingStructuredData
        title={post.meta.title}
        description={post.meta.excerpt}
        date={post.meta.date}
        slug={slugStr}
        tags={post.meta.tags}
        section={post.meta.category}
        image={post.meta.image}
      />
      <main className="flex-1 pt-16">
        {post.meta.type === "roadmap" ? (
          <article className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <header className="mb-12">
              <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>
                LEARNING ROADMAP
              </span>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold uppercase text-fg leading-[1.05]" style={{ fontFamily: "var(--font-clash-display)" }}>
                {post.meta.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.meta.tags.map((tag) => (
                  <span key={tag} className="font-mono text-2xs uppercase text-fg-muted border border-fg-muted px-2 py-0.5" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <hr className="mt-8 border-0 h-[2px] bg-fg" />
            </header>

            <MdxContent slug={slugStr} />

            {post.meta.steps && <SeriesRoadmap steps={post.meta.steps} />}
          </article>
        ) : (
          <article className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <TableOfContents headings={post.headings} />
            <header className="mb-12">
              <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>
                {post.meta.date}
              </span>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold uppercase text-fg leading-[1.05]" style={{ fontFamily: "var(--font-clash-display)" }}>
                {post.meta.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.meta.tags.map((tag) => (
                  <span key={tag} className="font-mono text-2xs uppercase text-fg-muted border border-fg-muted px-2 py-0.5" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {tag}
                  </span>
                ))}
              </div>
              <hr className="mt-8 border-0 h-[2px] bg-fg" />
            </header>
            <MdxContent slug={slugStr} />
          </article>
        )}

        <RelatedPosts slug={slugStr} tags={post.meta.tags} />

        {post.meta.type !== "roadmap" && (
          <>
            <hr className="mt-16 max-w-5xl mx-auto border-0 h-[2px] bg-fg" />
            <nav className="max-w-5xl mx-auto px-6 md:px-12 mt-8 pb-16 flex justify-between items-center">
              <Link href="/braindump" className="font-mono text-xs uppercase text-fg hover:text-brutal-pink transition-colors" style={{ fontFamily: "var(--font-space-mono)" }}>
                ← All Posts
              </Link>
              <span className="font-mono text-2xs text-fg-muted uppercase" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>
                SCHIZO Brain Dump
              </span>
            </nav>
          </>
        )}
      </main>
    </>
  );
}
