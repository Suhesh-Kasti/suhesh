import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import unwrapImages from "rehype-unwrap-images";
import { getPostBySlug, getAllSlugs } from "@/lib/braindump";
import { mdxComponents } from "@/components/mdx";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import TableOfContents from "@/components/TableOfContents";
import { BlogPostingStructuredData } from "@/components/BlogPostingStructuredData";

export const dynamic = "force-static";

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

  let content: React.ReactNode;
  try {
    const result = await compileMDX({
      source: post.content,
      components: mdxComponents,
      options: { parseFrontmatter: false, mdxOptions: { rehypePlugins: [unwrapImages] } },
    });
    content = result.content;
  } catch (e) {
    console.error(`MDX compile error for ${slugStr}:`, e);
    content = <div className="font-mono text-sm text-red-500 border-2 border-red-500 p-4">Failed to render this page. The MDX may have invalid syntax.</div>;
  }

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
        <article className="max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-10">
            <div>
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

              <div className="[&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24" id="post-content">
                {content}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents content={post.content} />
              </div>
            </aside>
          </div>

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
