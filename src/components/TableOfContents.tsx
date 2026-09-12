"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [activeId, setActiveId] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (headings.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);

      let current = headings[0].id;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el && el.getBoundingClientRect().top <= 150) current = heading.id;
      }
      setActiveId(current);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const scrollTo = useCallback((id: string) => {
    setOpen(false);
    setActiveId(id);
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
    setTimeout(tryScroll, 260);
  }, []);

  const scrollTop = useCallback(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (headings.length === 0) return null;

  const activeHeading = headings.find((heading) => heading.id === activeId);
  const activeIndex = headings.findIndex((heading) => heading.id === activeId);
  const percent = Math.round(progress * 100);

  const renderList = (compact: boolean) => (
    <nav className={compact ? "space-y-0.5" : "grid grid-cols-1 gap-1 sm:grid-cols-2"}>
      {headings.map((heading, index) => {
        const isH3 = heading.level === 3;
        const active = heading.id === activeId;
        return (
          <button
            key={heading.id}
            onClick={() => scrollTo(heading.id)}
            title={heading.text}
            className={`flex w-full items-center gap-3 border-l-2 py-2 pr-3 text-left transition-colors ${
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

  return (
    <>
      <div className="sticky toc-bar z-30 border-b-2 border-fg bg-surface">
        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-fg/[0.03] md:px-6 md:py-3"
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

        <AnimatePresence>
          {open && (
            <motion.div
              className="hidden border-b-2 border-fg bg-surface lg:block"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <div className="mx-auto max-w-5xl px-6 py-5">
                <div className="mb-3 flex items-center justify-between gap-4">
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
                {renderList(false)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l-2 border-fg bg-surface shadow-brutal-xl lg:hidden"
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

              <div className="flex-1 overflow-y-auto overscroll-contain p-4">{renderList(true)}</div>

              <div className="flex shrink-0 items-center justify-between gap-3 border-t-2 border-fg px-5 py-3">
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
    </>
  );
}
