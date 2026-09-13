import Link from "next/link";
import { getPostMetas } from "@/lib/braindump";
import { typeConfig } from "@/lib/content-types";

/**
 * Picks the articles that share the most tags with the current one. This is the only
 * article-to-article link on the site, so it also does the SEO work of spreading
 * crawl equity across the archive instead of leaving every post linked only from the list.
 */
export function RelatedPosts({ slug, tags, limit = 4 }: { slug: string; tags: string[]; limit?: number }) {
  const related = getPostMetas()
    .filter((post) => post.slug !== slug)
    .map((post) => ({
      post,
      score: post.tags.filter((tag) => tags.includes(tag)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="max-w-5xl mx-auto px-6 md:px-12 mt-16">
      <h2
        id="related-heading"
        className="font-display text-2xl font-bold uppercase text-fg border-b-2 border-fg pb-2"
        style={{ fontFamily: "var(--font-clash-display)" }}
      >
        Read next
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {related.map(({ post }) => (
          <li key={post.slug}>
            <Link
              href={`/braindump/${post.slug}`}
              className="group block h-full border-2 border-fg p-4 transition-colors hover:bg-fg"
            >
              <span
                className="font-mono text-2xs uppercase text-fg-muted group-hover:text-surface/70"
                style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}
              >
                {post.date} · <span style={{ color: typeConfig(post.type).color }}>{typeConfig(post.type).label}</span>
              </span>
              <span
                className="mt-1 block font-display text-base font-bold uppercase text-fg group-hover:text-surface"
                style={{ fontFamily: "var(--font-clash-display)" }}
              >
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
