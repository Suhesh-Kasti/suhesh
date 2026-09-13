"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faBolt, faChevronDown, faChevronUp, faXmark } from "@fortawesome/free-solid-svg-icons";

interface Heading {
  text: string;
  level: number;
  id: string;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll spy. The setters bail out when the value has not moved, because re-rendering the
  // list mid-animation is what made the panel open jitter.
  useEffect(() => {
    if (headings.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const nextProgress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      setProgress((prev) => (Math.abs(prev - nextProgress) < 0.002 ? prev : nextProgress));

      let current = headings[0].id;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el && el.getBoundingClientRect().top <= 150) current = heading.id;
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  // Close on Escape, or on a click outside both the bar and the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (barRef.current?.contains(target) || drawerRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  // Lock the page behind the mobile drawer so it cannot scroll (and so the navbar's
  // hide-on-scroll logic is not tripped while the reader is browsing the list).
  useEffect(() => {
    if (!open) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) return;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [open]);

  const scrollTo = useCallback((id: string) => {
    setOpen(false);
    setActiveId(id);
    // No timeout needed: the panel is an overlay, so closing it does not move the page.
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 110, behavior: "smooth" });
      } else if (attempts < 10) {
        attempts++;
        setTimeout(tryScroll, 80);
      }
    };
    tryScroll();
  }, []);

  const scrollTop = useCallback(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (headings.length === 0) return null;

  const activeHeading = headings.find((heading) => heading.id === activeId);
  const activeIndex = headings.findIndex((heading) => heading.id === activeId);
  const percent = Math.round(progress * 100);

  // One column, always. Numbered items read top to bottom instead of spreading across a row.
  const renderList = () => (
    <nav className="flex flex-col gap-0.5">
      {headings.map((heading, index) => {
        const isH3 = heading.level === 3;
        const active = heading.id === activeId;
        return (
          <button
            key={heading.id}
            onClick={() => scrollTo(heading.id)}
            title={heading.text}
            className={`flex w-full cursor-pointer items-center gap-3 border-l-2 py-2 pr-3 text-left transition-colors ${
              active
                ? "border-spider-pink bg-fg/[0.05]"
                : "border-transparent hover:border-fg-muted/40 hover:bg-fg/[0.03]"
            }`}
            style={{ paddingLeft: isH3 ? "1.75rem" : "0.75rem" }}
          >
            <span
              className="font-mono text-2xs tabular-nums"
              style={{
                fontFamily: "var(--font-space-mono)",
                color: active ? "var(--pink)" : "var(--fg-muted)",
                opacity: isH3 ? 0.6 : 1,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`min-w-0 flex-1 truncate text-xs leading-snug ${active ? "font-bold" : ""}`}
              style={{ fontFamily: "var(--font-space-mono)", color: active ? "var(--pink)" : "var(--fg-muted)" }}
            >
              {heading.text}
            </span>
            {active && (
              <span className="h-1.5 w-1.5 shrink-0 rotate-45" style={{ backgroundColor: "var(--pink)" }} aria-hidden />
            )}
          </button>
        );
      })}
    </nav>
  );

  const drawer = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-brutal-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={drawerRef}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l-2 border-fg bg-surface shadow-brutal-xl sm:max-w-sm lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex shrink-0 items-center justify-between border-b-2 border-fg px-5 py-4">
              <div className="flex min-w-0 items-center gap-2">
                <FontAwesomeIcon icon={faBolt} className="text-sm" style={{ color: "var(--pink)" }} />
                <h2
                  className="truncate font-display text-lg font-extrabold uppercase text-fg"
                  style={{ fontFamily: "var(--font-clash-display)" }}
                >
                  On this page
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-xs uppercase transition-colors hover:bg-fg hover:text-surface"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <FontAwesomeIcon icon={faXmark} /> Close
              </button>
            </div>

            <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--fg) 12%, transparent)" }}>
              <div className="h-full" style={{ width: `${percent}%`, backgroundColor: "var(--pink)" }} />
            </div>

            <div className="toc-scroll flex-1 overflow-y-auto overscroll-contain p-4">{renderList()}</div>

            <div
              className="flex shrink-0 items-center justify-between gap-3 border-t-2 border-fg px-5 pt-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              <span
                className="font-mono text-2xs uppercase text-fg-muted"
                style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}
              >
                {percent}% read
              </span>
              <button
                onClick={scrollTop}
                className="inline-flex cursor-pointer items-center gap-1.5 border border-fg-muted/40 px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}
              >
                <FontAwesomeIcon icon={faArrowUp} className="text-[9px]" />
                Back to top
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div ref={barRef} className="sticky toc-bar z-30 border-b-2 border-fg bg-surface">
        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-fg/[0.03] md:px-6 md:py-3"
        >
          <FontAwesomeIcon icon={faBolt} className="shrink-0 text-sm" style={{ color: "var(--pink)" }} />
          <span
            className="hidden shrink-0 font-mono text-2xs uppercase sm:inline"
            style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em", color: "var(--pink)" }}
          >
            On this page
          </span>
          <span
            className="min-w-0 flex-1 truncate font-mono text-xs"
            style={{ fontFamily: "var(--font-space-mono)", color: "var(--fg)" }}
          >
            {activeHeading
              ? `${String(activeIndex + 1).padStart(2, "0")} / ${activeHeading.text}`
              : `${headings.length} sections`}
          </span>
          <span
            className="hidden shrink-0 font-mono text-2xs uppercase text-fg-muted sm:inline"
            style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}
          >
            {percent}%
          </span>
          <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="shrink-0 text-xs text-fg-muted" />
        </button>

        <div className="h-[3px] w-full" style={{ backgroundColor: "color-mix(in srgb, var(--fg) 12%, transparent)" }}>
          <div
            className="h-full"
            style={{ width: `${percent}%`, backgroundColor: "var(--pink)", transition: "width 140ms linear" }}
          />
        </div>

        {/* Desktop panel. It is an absolute overlay rather than an in-flow block: animating the
            height used to reflow the article, which jittered and shifted the scroll position
            enough to trip the navbar's hide-on-scroll logic. */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute left-0 right-0 top-full z-20 hidden border-b-2 border-fg bg-surface shadow-brutal-lg lg:block"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 pb-3 pt-4">
                <span
                  className="min-w-0 truncate font-mono text-2xs uppercase text-fg-muted"
                  style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}
                >
                  {activeHeading ? `Reading: ${activeHeading.text}` : "Jump to a section"}
                </span>
                <button
                  onClick={scrollTop}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border border-fg-muted/40 px-2 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                  style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}
                >
                  <FontAwesomeIcon icon={faArrowUp} className="text-[9px]" />
                  Top
                </button>
              </div>

              {/* The scroll container spans the whole panel so the scrollbar sits at the edge,
                  and the fade makes a long list read as continuing instead of being chopped. */}
              <div className="relative">
                <div className="toc-scroll max-h-[55vh] overflow-y-auto overscroll-contain">
                  <div className="mx-auto max-w-5xl px-6 pb-7 pt-1">
                    <div className="max-w-3xl">{renderList()}</div>
                  </div>
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-8"
                  style={{ background: "linear-gradient(to top, var(--surf), transparent)" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The drawer is portalled to <body>. The page wrapper sets will-change/transform while
          it bounces, and a transformed ancestor makes position:fixed resolve against the page
          instead of the viewport — which is what made the drawer scroll the whole site. */}
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
