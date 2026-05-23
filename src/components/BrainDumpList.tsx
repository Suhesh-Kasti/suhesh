"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BrainDumpMeta, ContentType } from "@/lib/braindump";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faBookOpen, faListCheck, faInfinity, faFileCode, faMap } from "@fortawesome/free-solid-svg-icons";

const TYPE_CONFIG: Record<
  ContentType,
  { label: string; color: string; icon: typeof faFire; order: number }
> = {
  braindump: { label: "MAP", color: COLORS.pink, icon: faMap, order: 0 },
  cheatsheet: { label: "Cheatsheets", color: COLORS.green, icon: faBookOpen, order: 2 },
  checklist: { label: "Checklists", color: COLORS.orange, icon: faListCheck, order: 3 },
  til: { label: "Byte-Sized", color: COLORS.blue, icon: faInfinity, order: 4 },
  blog: { label: "Deep Dives", color: COLORS.purple, icon: faFileCode, order: 5 },
};

export default function BrainDumpList({ posts, filterTag }: { posts: BrainDumpMeta[]; filterTag?: string }) {
  const [activeType, setActiveType] = useState<ContentType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  // Check URL ?tag= on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = filterTag ?? params.get("tag");
    if (tag) setActiveTag(tag);
  }, [filterTag]);
  const PER_PAGE = 9;

  const types = useMemo(() => {
    const typeSet = new Set(posts.map((p) => p.type));
    return Array.from(typeSet).sort(
      (a, b) => (TYPE_CONFIG[a]?.order ?? 99) - (TYPE_CONFIG[b]?.order ?? 99)
    );
  }, [posts]);

  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    posts.forEach((p) => p.tags.forEach((t) => { tagCount[t] = (tagCount[t] ?? 0) + 1; }));
    return Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const typeMatch = activeType === "all" || post.type === activeType;
      const tagMatch = !activeTag || post.tags.includes(activeTag);
      const searchMatch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return typeMatch && tagMatch && searchMatch;
    });
  }, [posts, activeType, searchTerm, activeTag]);

  const totalPages = Math.ceil(filteredPosts.length / PER_PAGE);
  const pagedPosts = filteredPosts.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [activeType, searchTerm, activeTag]);

  if (posts.length === 0) {
    return (
      <section className="relative w-full py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h1
            className="font-display text-4xl md:text-6xl font-extrabold uppercase text-fg"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
          >
            Brain Dump
          </h1>
          <div className="w-full h-1 bg-fg my-6" />
          <p
            className="font-mono text-sm uppercase text-fg-muted"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            No posts yet. Drop .mdx files in /content/.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <h1
            className="font-display text-3xl md:text-5xl font-extrabold uppercase text-fg"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
          >
            Brain Dump
          </h1>
          <div className="flex-1 hidden sm:block h-1 bg-fg mx-4" />
          <span
            className="font-mono text-xs uppercase text-fg-muted tracking-label"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
            }}
          >
            {filteredPosts.length} / {posts.length} entries
          </span>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brain dump..."
              className="w-full bg-surface border-2 border-fg px-4 py-2.5 font-mono text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:border-brutal-pink transition-colors"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-fg-muted hover:text-fg px-2"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type filters only at top */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveType("all")}
              className={`font-mono text-xs uppercase px-3 py-2 border-2 transition-all cursor-pointer inline-flex items-center gap-1 ${
                activeType === "all"
                  ? "border-fg bg-fg text-surface"
                  : "border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
              }`}
              style={{
                fontFamily: TYPOGRAPHY.fontMono,
                letterSpacing: TYPOGRAPHY.tracking.mono,
              }}
            >
              All
            </button>

            {/* MAP link — always visible */}
            <Link
              href="/map"
              className="font-mono text-xs uppercase px-3 py-2 border-2 transition-all cursor-pointer inline-flex items-center gap-1 border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
              style={{
                fontFamily: TYPOGRAPHY.fontMono,
                letterSpacing: TYPOGRAPHY.tracking.mono,
                borderColor: COLORS.pink,
              }}
            >
              <FontAwesomeIcon icon={faMap} /> MAP
            </Link>

            {types
              .filter((type) => type !== "braindump")
              .map((type) => {
              const config = TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`font-mono text-xs uppercase px-3 py-2 border-2 transition-all cursor-pointer inline-flex items-center gap-1 ${
                    activeType === type
                      ? "border-fg bg-fg text-surface"
                      : "border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
                  }`}
                  style={{
                    fontFamily: TYPOGRAPHY.fontMono,
                    letterSpacing: TYPOGRAPHY.tracking.mono,
                    borderColor: activeType === type ? "var(--color-fg)" : config?.color,
                  }}
                >
                  <FontAwesomeIcon icon={config?.icon ?? faFileCode} /> {config?.label}
                </button>
              );
            })}
          </div>

          {/* Collapsible tag filter — only show when there are tags */}
          {allTags.length > 0 && (
            <details className="mt-2 group">
              <summary className="font-mono text-2xs uppercase text-fg-muted cursor-pointer hover:text-fg transition-colors inline-block" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                filter by tag ({allTags.length})
              </summary>
              <div className="flex gap-1 flex-wrap mt-2 pt-2 border-t border-fg-muted/20">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`font-mono text-2xs uppercase px-2 py-1 border transition-all cursor-pointer ${
                    !activeTag ? "border-fg bg-fg text-surface" : "border-fg-muted/30 text-fg-muted hover:border-fg"
                  }`}
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                >
                  all
                </button>
                {allTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`font-mono text-2xs uppercase px-2 py-1 border transition-all cursor-pointer ${
                      activeTag === tag
                        ? "border-fg bg-fg text-surface"
                        : "border-fg-muted/30 text-fg-muted hover:border-fg"
                    }`}
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  >
                    {tag} ({count})
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Post grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType + searchTerm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {pagedPosts.map((post) => {
              const config = TYPE_CONFIG[post.type];

              // Determine URL based on type
              const href = `/braindump/${post.slug}`;

              return (
                <Link
                  key={post.slug}
                  href={href}
                  className="block border-2 border-fg p-5 bg-surface group hover:shadow-brutal-lg transition-all cursor-pointer relative"
                  data-cursor-label={config?.label ?? "Read"}
                >
                  {/* Type badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="font-mono text-2xs uppercase tracking-label px-2 py-0.5 border"
                      style={{
                        fontFamily: TYPOGRAPHY.fontMono,
                        letterSpacing: TYPOGRAPHY.tracking.label,
                        borderColor: config?.color,
                        color: config?.color,
                      }}
                    >
                      <FontAwesomeIcon icon={config?.icon ?? faFileCode} /> {config?.label}
                    </span>
                    {post.category && (
                      <span
                        className="font-mono text-2xs uppercase text-fg-muted tracking-label"
                        style={{
                          fontFamily: TYPOGRAPHY.fontMono,
                          letterSpacing: TYPOGRAPHY.tracking.label,
                        }}
                      >
                        {post.category}
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <span
                    className="font-mono text-2xs uppercase text-fg-muted"
                    style={{
                      fontFamily: TYPOGRAPHY.fontMono,
                      letterSpacing: TYPOGRAPHY.tracking.label,
                    }}
                  >
                    {post.date}
                  </span>

                  {/* Title */}
                  <h2
                    className="mt-1 font-display text-lg font-bold uppercase text-fg group-hover:text-brutal-pink transition-colors leading-tight"
                    style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
                  >
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p
                    className="mt-2 text-sm leading-relaxed text-fg-muted line-clamp-2"
                    style={{ fontFamily: TYPOGRAPHY.fontSans }}
                  >
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-2xs uppercase text-fg-muted border border-fg-muted/50 px-1.5 py-0.5"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 4 && (
                      <span
                        className="font-mono text-2xs text-fg-muted"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        +{post.tags.length - 4}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p
              className="font-mono text-sm text-fg-muted uppercase"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              No entries match your filters. Try a different type or search term.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="font-mono text-xs uppercase px-4 py-2 border-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
            >
              Prev
            </button>
            <span className="font-mono text-xs text-fg-muted px-2" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="font-mono text-xs uppercase px-4 py-2 border-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
