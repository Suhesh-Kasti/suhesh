import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getPostMetas, type BrainDumpMeta } from "@/lib/braindump";
import { PREVIEW_TYPES, typeConfig, typeFilterHref } from "@/lib/content-types";

export default function BrainDumpPreview() {
  const posts = getPostMetas();

  // One card per type — the newest of each — rather than five posts from whichever type
  // happened to publish most recently.
  const featured = PREVIEW_TYPES.map((type) => posts.find((post) => post.type === type)).filter(
    (post): post is BrainDumpMeta => Boolean(post)
  );

  if (featured.length === 0) return null;

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
          {featured.map((post) => {
            const config = typeConfig(post.type);

            return (
              <div
                key={post.slug}
                className="relative border-2 border-fg p-6 bg-surface group hover:shadow-brutal-lg transition-all"
                data-cursor-label="Read"
              >
                {/* The whole card opens the article... */}
                <Link href={`/braindump/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title}>
                  <span className="sr-only">{post.title}</span>
                </Link>

                <div className="pointer-events-none relative">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* ...except the badge, which opens the archive filtered to this type. */}
                    <Link
                      href={typeFilterHref(post.type)}
                      aria-label={`All ${config.label} on the brain dump`}
                      className="pointer-events-auto relative z-20 inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
                      style={{
                        fontFamily: "var(--font-space-mono)",
                        letterSpacing: "0.12em",
                        borderColor: config.color,
                        color: config.color,
                      }}
                    >
                      <FontAwesomeIcon icon={config.icon} /> {config.label}
                    </Link>
                    <span
                      className="font-mono text-2xs uppercase tracking-label text-fg-muted"
                      style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}
                    >
                      {post.date}
                    </span>
                  </div>

                  <h3
                    className="mt-3 font-display text-lg font-bold uppercase text-fg group-hover:text-brutal-pink transition-colors leading-tight"
                    style={{ fontFamily: "var(--font-clash-display)" }}
                  >
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted line-clamp-3" style={{ fontFamily: "var(--font-syne)" }}>
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-2xs uppercase text-fg-muted border border-fg-muted px-2 py-0.5"
                        style={{ fontFamily: "var(--font-space-mono)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
