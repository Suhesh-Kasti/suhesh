import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/braindump";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { BlogPostingStructuredData } from "@/components/BlogPostingStructuredData";

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

  const url = `https://suhesh.com.np/braindump/${slugStr}`;

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
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta.title,
      description: post.meta.excerpt,
      images: ["/og-image.png"],
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
      />
      <Navbar />
      <main className="flex-1 pt-16">
        <article className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
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

          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:font-extrabold prose-headings:uppercase
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b-2 prose-h2:border-fg prose-h2:pb-2
              prose-h3:text-lg prose-h3:font-mono prose-h3:mt-8 prose-h3:mb-3
              prose-p:font-sans prose-p:leading-relaxed prose-p:my-4
              prose-a:text-brutal-pink prose-a:underline prose-a:decoration-brutal-pink/50
              prose-code:font-mono prose-code:text-sm prose-code:bg-fg/10 prose-code:px-1.5 prose-code:py-0.5
              prose-pre:bg-fg/5 prose-pre:border-2 prose-pre:border-fg
              prose-img:border-2 prose-img:border-fg
              prose-strong:text-fg prose-strong:font-extrabold
              prose-ul:font-sans prose-li:my-1
              prose-blockquote:border-l-4 prose-blockquote:border-brutal-pink prose-blockquote:pl-4
              [&_details]:my-4 [&_summary]:cursor-pointer [&_summary]:font-mono"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <hr className="mt-16 border-0 h-[2px] bg-fg" />
          <nav className="mt-8 flex justify-between items-center">
            <a href="/braindump" className="font-mono text-xs uppercase text-fg hover:text-brutal-pink transition-colors" style={{ fontFamily: "var(--font-space-mono)" }}>
              ← All Posts
            </a>
            <span className="font-mono text-2xs text-fg-muted uppercase" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>
              SCHIZO Brain Dump
            </span>
          </nav>
        </article>
      </main>
      <SearchButton />
    </>
  );
}
