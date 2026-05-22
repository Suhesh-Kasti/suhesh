import Link from "next/link";
import { getPostMetas } from "@/lib/braindump";

export default function BrainDumpPreview() {
  const posts = getPostMetas().slice(0, 5);

  if (posts.length === 0) return null;

  return (
    <section id="notes" className="relative w-full bg-surface py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold uppercase text-fg" style={{ fontFamily: "var(--font-clash-display)" }}>
            Brain Dump
          </h2>
          <div className="flex-1 h-1 bg-fg" />
          <Link
            href="/braindump"
            className="font-mono text-xs uppercase text-fg hover:text-brutal-pink transition-colors whitespace-nowrap"
            style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.05em" }}
            data-cursor-label="View All Posts"
          >
            All Posts →
          </Link>
          <Link
            href="/map"
            className="font-mono text-xs uppercase text-brutal-pink hover:text-fg transition-colors whitespace-nowrap border border-brutal-pink px-2 py-0.5"
            style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.05em" }}
            data-cursor-label="Knowledge Map"
          >
            MAP
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/braindump/${post.slug}`}
              className="block border-2 border-fg p-6 bg-surface group hover:shadow-brutal-lg transition-all cursor-pointer"
              data-cursor-label="Read"
            >
              <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>
                {post.date}
              </span>
              <h3 className="mt-2 font-display text-lg font-bold uppercase text-fg group-hover:text-brutal-pink transition-colors leading-tight" style={{ fontFamily: "var(--font-clash-display)" }}>
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted line-clamp-3" style={{ fontFamily: "var(--font-syne)" }}>
                {post.excerpt}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="font-mono text-2xs uppercase text-fg-muted border border-fg-muted px-2 py-0.5" style={{ fontFamily: "var(--font-space-mono)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
