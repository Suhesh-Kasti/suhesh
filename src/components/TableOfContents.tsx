"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faXmark } from "@fortawesome/free-solid-svg-icons";

interface Heading {
  text: string;
  level: number;
  id: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseHeadings(content: string): Heading[] {
  const parsed: Heading[] = [];
  for (const line of content.split("\n")) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    if (h2) parsed.push({ text: h2[1], level: 2, id: slugify(h2[1]) });
    else if (h3) parsed.push({ text: h3[1], level: 3, id: slugify(h3[1]) });
  }
  return parsed;
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = parseHeadings(content);
  const [open, setOpen] = useState(false);

  const scrollTo = useCallback((id: string) => {
    // Close the panel first so layout settles, then scroll
    setOpen(false);
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 100, behavior: "smooth" });
      } else if (attempts < 10) {
        attempts++;
        setTimeout(tryScroll, 80);
      }
    };
    // Wait for collapse animation to finish
    setTimeout(tryScroll, 300);
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      {/* ====== STICKY BAR — unified desktop + mobile, relative for dropdown ====== */}
      <div className="sticky top-16 z-30 border-b-2 border-fg bg-surface">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 font-mono text-xs uppercase tracking-widest cursor-pointer hover:bg-fg/[0.03] transition-colors"
          style={{ fontFamily: "var(--font-space-mono)", color: "var(--color-spider-pink)" }}
        >
          <span className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBolt} /> On this page
          </span>
          <span className="text-fg-muted">{headings.length} sections · {open ? "collapse" : "expand"}</span>
        </button>

        {/* Desktop: dropdown grid */}  
        <AnimatePresence>
          {open && (
            <motion.div
              className="hidden lg:block border-b-2 border-fg bg-surface overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-w-5xl mx-auto px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2">
                  {headings.map((h, i) => {
                    const isH3 = h.level === 3;
                    return (
                      <button
                        key={i}
                        onClick={() => scrollTo(h.id)}
                        className="text-left py-1.5 cursor-pointer border-l-2 border-transparent hover:border-spider-pink transition-all"
                        style={{
                          paddingLeft: isH3 ? "1.5rem" : "0.5rem",
                          fontFamily: "var(--font-space-mono)",
                        }}
                      >
                        <span className="text-xs leading-snug text-fg-muted hover:text-spider-pink block">
                          {isH3 && <span className="text-fg-muted/40 mr-1">└</span>}
                          {h.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-fg-muted/20 flex justify-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="font-mono text-xs uppercase text-fg-muted hover:text-fg transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    collapse ↑
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ====== Mobile backdrop + slide-in panel ====== */}
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
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l-2 border-fg bg-surface shadow-brutal-xl flex flex-col lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b-2 border-fg shrink-0">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBolt} className="text-sm" style={{ color: "var(--color-spider-pink)" }} />
                  <h2 className="font-display text-lg font-extrabold uppercase text-fg" style={{ fontFamily: "var(--font-clash-display)" }}>On this page</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="font-mono text-xs uppercase px-3 py-1.5 border-2 border-fg hover:bg-fg hover:text-surface transition-colors cursor-pointer flex items-center gap-1.5"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  <FontAwesomeIcon icon={faXmark} /> Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                <nav className="space-y-0.5">
                  {headings.map((h, i) => {
                    const isH3 = h.level === 3;
                    return (
                      <button
                        key={i}
                        onClick={() => scrollTo(h.id)}
                        className="block w-full text-left py-2 px-3 transition-all cursor-pointer border-l-2 border-transparent hover:border-fg-muted/30 hover:bg-fg/5"
                        style={{ paddingLeft: isH3 ? "1.75rem" : "0.75rem", fontFamily: "var(--font-space-mono)" }}
                      >
                        <span className="text-xs leading-snug text-fg-muted">
                          {isH3 && <span className="text-fg-muted/40 mr-1">└</span>}
                          {h.text}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              <div className="px-5 py-3 border-t-2 border-fg shrink-0 bg-fg/[0.02]">
                <span className="font-mono text-2xs uppercase text-fg-muted tracking-label" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.12em" }}>
                  {headings.length} sections · jump anywhere
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
