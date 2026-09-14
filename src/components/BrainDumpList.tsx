"use client";

import { Fragment, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { BrainDumpMeta, ContentType } from "@/lib/braindump";
import { POSTS_PER_PAGE, archivePageHref } from "@/lib/pagination";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import { TYPE_CONFIG } from "@/lib/content-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash,
  faFileCode, faMap, faRoad, faXmark } from "@fortawesome/free-solid-svg-icons";


/** Which platform a lab belongs to. Slugs are the dependable signal; tags only cover some. */
function labPlatform(post: { slug: string; tags: string[] }): string {
  const slug = post.slug.toLowerCase();
  if (slug.includes("portswigger")) return "PortSwigger";
  if (slug.includes("htb")) return "Hack The Box";
  if (slug.includes("tryhackme") || slug.includes("thm")) return "TryHackMe";
  const tag = post.tags.find((t) => t.toLowerCase().startsWith("lab/"));
  if (tag) return tag.slice(4).toUpperCase();
  return "Other labs";
}

export default function BrainDumpList({
  posts,
  page = 1,
  filterTag,
}: {
  posts: BrainDumpMeta[];
  page?: number;
  filterTag?: string;
}) {
  const [activeType, setActiveType] = useState<ContentType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  // "NOT" inverts the type filter, so picking Labs with NOT on hides labs instead.
  const [excludeType, setExcludeType] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  // Only used while a client-side filter is active; the unfiltered archive paginates by path.
  const [clientPage, setClientPage] = useState(0);

  // Opening the tag panel is tracked so the chips row can animate in below the search bar.
  const [tagsOpen, setTagsOpen] = useState(false);

  // Check URL ?tag= and ?type= on mount, so a link from elsewhere (a type badge, for example)
  // lands on the same filtered view you would get by clicking the filter here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tag = filterTag ?? params.get("tag");
    if (tag) setActiveTag(tag);
    const type = params.get("type");
    if (type && type in TYPE_CONFIG) setActiveType(type as ContentType);
  }, [filterTag]);
  const PER_PAGE = POSTS_PER_PAGE;

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
      const typeMatch =
        activeType === "all"
          ? true
          : excludeType
            ? post.type !== activeType
            : post.type === activeType;
      const tagMatch = !activeTag || post.tags.includes(activeTag);
      const searchMatch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const platformMatch = !activePlatform || labPlatform(post) === activePlatform;
      return typeMatch && tagMatch && searchMatch && platformMatch;
    });
  }, [posts, activeType, excludeType, activePlatform, searchTerm, activeTag]);

  // A client filter changes the result set entirely, so paging falls back to client-side
  // buttons; the default (unfiltered) archive pages by URL so every page is crawlable.
  const isFiltering =
    activeType !== "all" || searchTerm !== "" || activeTag !== null || activePlatform !== null;
  const archiveTotalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const totalPages = isFiltering ? Math.ceil(filteredPosts.length / PER_PAGE) : archiveTotalPages;
  const PER_PLATFORM_PREVIEW = 6;
  /** Heading colours per platform, so a group is identifiable at a glance. */
  /** Group order in the labs view. TryHackMe deliberately sits last. */
  const PLATFORM_ORDER = ["PortSwigger", "Hack The Box", "TryHackMe"];

  const PLATFORM_COLORS: Record<string, string> = {
    PortSwigger: "#ff5500",
    "Hack The Box": "#00dd44",
    TryHackMe: "#ff1144",
  };

  const groupedLabs =
    activeType === "lab" && !excludeType && !activePlatform && !searchTerm && !activeTag;
  const visiblePosts = isFiltering
    ? filteredPosts.slice(clientPage * PER_PAGE, (clientPage + 1) * PER_PAGE)
    : posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  type Row =
    | { kind: "header"; platform: string; count: number }
    | { kind: "post"; post: BrainDumpMeta };
  const rows: Row[] = groupedLabs
    ? (() => {
        const buckets = new Map<string, BrainDumpMeta[]>();
        for (const post of filteredPosts) {
          const platform = labPlatform(post);
          buckets.set(platform, [...(buckets.get(platform) ?? []), post]);
        }
        const rank = (name: string) => {
          const index = PLATFORM_ORDER.indexOf(name);
          return index === -1 ? PLATFORM_ORDER.length : index;
        };
        return [...buckets.entries()]
          .sort((a, b) => rank(a[0]) - rank(b[0]))
          .flatMap(([platform, group]) => [
          { kind: "header" as const, platform, count: group.length },
            ...group.slice(0, PER_PLATFORM_PREVIEW).map((post) => ({ kind: "post" as const, post })),
          ]);
      })()
    : visiblePosts.map((post) => ({ kind: "post" as const, post }));

  // Page numbers to render: the first, the last, and a small window around the current page.
  // The rest collapse into an ellipsis. Every page stays reachable — neighbours chain one into
  // the next and the first/last links reach both ends — so crawlers can still walk the archive.
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 2
  );

  // Reset page when filters change
  useEffect(() => { setClientPage(0); }, [activeType, excludeType, activePlatform, searchTerm, activeTag]);

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
            {filteredPosts.length} / {posts.length} entries{excludeType ? " · excluding" : ""}
          </span>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col gap-3 mb-10">
          {/* Row 1: a compact search so the type filters can sit on one line beside it on
              wider screens, and wrap neatly into rows on phones. */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex w-full items-center sm:w-52 sm:shrink-0 lg:w-60">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search brain dump..."
                aria-label="Search brain dump"
                className="w-full bg-surface border-2 border-fg px-4 py-2.5 pr-10 font-mono text-sm text-fg placeholder:text-fg-muted focus:outline-none focus:border-brutal-pink transition-colors"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer px-2 font-mono text-fg-muted transition-colors hover:text-fg"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

          {/* Type filters only at top */}
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 [&>*]:shrink-0 xl:flex-1">
            {/* Inverts the type filter: Labs + ! shows everything except labs. */}
            <button
              onClick={() => {
                if (activeType === "all") {
                  setActiveType("lab");
                  setExcludeType(true);
                } else {
                  setExcludeType((value) => !value);
                }
              }}
              aria-pressed={excludeType}
              aria-label={excludeType ? "Excluding the selected type" : "Exclude the selected type"}
              title="NOT — hide the selected type"
              className={`inline-flex w-8 shrink-0 cursor-pointer items-center justify-center border-2 py-1.5 transition-all xl:py-2 ${
                excludeType
                  ? "border-[var(--red)] bg-[var(--red)] text-[#0a0a0a]"
                  : "border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
              }`}
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              <FontAwesomeIcon icon={faEyeSlash} className="text-[11px]" />
            </button>

            <button
              onClick={() => setActiveType("all")}
              className={`font-mono text-2xs uppercase px-2.5 py-1.5 border-2 transition-all cursor-pointer inline-flex items-center gap-1 xl:px-2 xl:py-1.5 xl:text-xs ${
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
              className="font-mono text-2xs uppercase px-2.5 py-1.5 border-2 transition-all cursor-pointer inline-flex items-center gap-1 xl:px-2 xl:py-1.5 xl:text-xs border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
              style={{
                fontFamily: TYPOGRAPHY.fontMono,
                letterSpacing: TYPOGRAPHY.tracking.mono,
                borderColor: COLORS.pink,
              }}
            >
              <FontAwesomeIcon icon={faMap} /> MAP
            </Link>

            {/* ROADMAP link — filters to series type */}
            <button
              onClick={() => { setActiveType(activeType === "roadmap" ? "all" : "roadmap"); setActivePlatform(null); }}
              className={`font-mono text-2xs uppercase px-2.5 py-1.5 border-2 transition-all cursor-pointer inline-flex items-center gap-1 xl:px-2 xl:py-1.5 xl:text-xs ${
                activeType === "roadmap"
                  ? "border-fg bg-fg text-surface"
                  : "border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
              }`}
              style={{
                fontFamily: TYPOGRAPHY.fontMono,
                letterSpacing: TYPOGRAPHY.tracking.mono,
                borderColor: activeType === "roadmap" ? "var(--color-fg)" : COLORS.teal,
              }}
            >
              <FontAwesomeIcon icon={faRoad} /> ROADMAP
            </button>

            {types
              .filter((type) => type !== "braindump" && type !== "roadmap")
              .map((type) => {
              const config = TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  onClick={() => { setActiveType(type); setActivePlatform(null); }}
                  className={`font-mono text-2xs uppercase px-2.5 py-1.5 border-2 transition-all cursor-pointer inline-flex items-center gap-1 xl:px-2 xl:py-1.5 xl:text-xs ${
                    excludeType && activeType === type
                      ? "border-[var(--red)] bg-[var(--red)] text-[#0a0a0a]"
                      : activeType === type
                        ? "border-fg bg-fg text-surface"
                        : "border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
                  }`}
                  style={{
                    fontFamily: TYPOGRAPHY.fontMono,
                    letterSpacing: TYPOGRAPHY.tracking.mono,
                    borderColor:
                      excludeType && activeType === type ? "var(--red)" : activeType === type ? "var(--color-fg)" : config?.color,
                  }}
                >
                  <FontAwesomeIcon icon={config?.icon ?? faFileCode} /> {config?.label}
                </button>
              );
            })}
          </div>
          </div>

          {/* Tag filter lives on its own full-width row, so opening it never squeezes the
              search field, and the search folds to an icon while it is open. */}
          {allTags.length > 0 && (
            <div>
              <button
                onClick={() => setTagsOpen((open) => !open)}
                aria-expanded={tagsOpen}
                className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:text-fg"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                filter by tag ({allTags.length})
                {activeTag && (
                  <span className="border border-fg bg-fg px-1.5 py-0.5 text-surface">{activeTag}</span>
                )}
                <span className={`transition-transform duration-200 ${tagsOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              <AnimatePresence initial={false}>
                {tagsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex flex-wrap gap-1 border-t border-fg-muted/20 pt-2 [&>*]:shrink-0">
                      <button
                        onClick={() => setActiveTag(null)}
                        className={`cursor-pointer border px-2 py-1 font-mono text-2xs uppercase transition-all ${
                          !activeTag
                            ? "border-fg bg-fg text-surface"
                            : "border-fg-muted/30 text-fg-muted hover:border-fg"
                        }`}
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        all
                      </button>
                      {allTags.map(([tag, count]) => (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                          className={`cursor-pointer border px-2 py-1 font-mono text-2xs uppercase transition-all ${
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Post grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeType}-${searchTerm}-${isFiltering ? clientPage : page}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {rows.map((row) => {
              if (row.kind === "header") {
                const color = PLATFORM_COLORS[row.platform] ?? "var(--fg)";
                return (
                  <div key={`head-${row.platform}`} className="col-span-full mt-6 flex items-center gap-3 first:mt-0">
                    <span
                      className="font-mono text-xs font-bold uppercase tracking-label"
                      style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color }}
                    >
                      {row.platform}
                    </span>
                    <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {row.count}
                    </span>
                    <span className="h-[2px] flex-1" style={{ backgroundColor: color, opacity: 0.35 }} />
                    <button
                      onClick={() => setActivePlatform(row.platform)}
                      className="cursor-pointer font-mono text-2xs uppercase transition-opacity hover:opacity-70"
                      style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color }}
                    >
                      view more →
                    </button>
                  </div>
                );
              }
              const post = row.post;
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
                    className="mt-1 font-display text-lg font-bold uppercase text-fg group-hover:text-brutal-pink-text transition-colors leading-tight"
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
          isFiltering ? (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setClientPage(Math.max(0, clientPage - 1))}
                disabled={clientPage === 0}
                className="font-mono text-xs uppercase px-4 py-2 border-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
              >
                Prev
              </button>
              <span className="font-mono text-xs text-fg-muted px-2" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                {clientPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setClientPage(Math.min(totalPages - 1, clientPage + 1))}
                disabled={clientPage >= totalPages - 1}
                className="font-mono text-xs uppercase px-4 py-2 border-2 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
              >
                Next
              </button>
            </div>
          ) : (
            /* Real links, not buttons: every archive page is reachable by following the HTML,
               which is what lets crawlers walk the whole archive instead of stopping at page 1. */
            <nav
              aria-label="Archive pages"
              className="flex flex-wrap items-center justify-center gap-2 mt-12"
            >
              {page > 1 ? (
                <Link
                  href={archivePageHref(page - 1)}
                  rel="prev"
                  className="font-mono text-xs uppercase px-4 py-2 border-2 transition-all hover:bg-fg hover:text-surface"
                  style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
                >
                  Prev
                </Link>
              ) : (
                <span
                  className="font-mono text-xs uppercase px-4 py-2 border-2 opacity-30"
                  style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
                >
                  Prev
                </span>
              )}

              {visiblePages.map((pageNumber, index) => {
                const previous = visiblePages[index - 1];
                const gap = previous !== undefined && pageNumber - previous > 1;
                const isCurrent = pageNumber === page;
                return (
                  <Fragment key={pageNumber}>
                    {gap && (
                      <span
                        aria-hidden="true"
                        className="select-none px-1 font-mono text-xs text-fg-muted"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        …
                      </span>
                    )}
                    <Link
                      href={archivePageHref(pageNumber)}
                      aria-current={isCurrent ? "page" : undefined}
                      aria-label={`Page ${pageNumber}`}
                      className={`min-w-9 border-2 text-center font-mono text-xs uppercase transition-all ${
                        isCurrent
                          ? "border-fg bg-fg px-3 py-2 text-surface"
                          : "border-fg-muted/40 px-3 py-2 text-fg-muted hover:border-fg hover:bg-fg hover:text-surface"
                      }`}
                      style={{ fontFamily: TYPOGRAPHY.fontMono }}
                    >
                      {pageNumber}
                    </Link>
                  </Fragment>
                );
              })}

              {page < totalPages ? (
                <Link
                  href={archivePageHref(page + 1)}
                  rel="next"
                  className="font-mono text-xs uppercase px-4 py-2 border-2 transition-all hover:bg-fg hover:text-surface"
                  style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
                >
                  Next
                </Link>
              ) : (
                <span
                  className="font-mono text-xs uppercase px-4 py-2 border-2 opacity-30"
                  style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
                >
                  Next
                </span>
              )}
            </nav>
          )
        )}
      </div>
    </section>
  );
}
