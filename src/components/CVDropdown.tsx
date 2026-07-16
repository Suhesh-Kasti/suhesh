"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface CVOption {
  label: string;
  href: string;
  color: string;
  description: string;
}

interface CVDropdownProps {
  variant?: "hero" | "about" | "footer";
  label?: string;
  options: ReadonlyArray<CVOption>;
}

export default function CVDropdown({ variant = "hero", label = "Download CV", options }: CVDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const syncPosition = useCallback(() => {
    const btn = containerRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;
    const r = btn.getBoundingClientRect();
    const isFooter = variant === "footer";
    panel.style.left = `${r.left}px`;
    panel.style.top = isFooter ? `${r.top - 8}px` : `${r.bottom + 8}px`;
    panel.style.transform = isFooter ? "translateY(-100%)" : "none";
    panel.style.width = `${Math.max(260, r.width)}px`;
  }, [variant]);

  useEffect(() => {
    if (!isOpen) return;
    syncPosition();
    window.addEventListener("scroll", syncPosition, true);
    window.addEventListener("resize", syncPosition);
    return () => {
      window.removeEventListener("scroll", syncPosition, true);
      window.removeEventListener("resize", syncPosition);
    };
  }, [isOpen, syncPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const isHero = variant === "hero";
  const isAbout = variant === "about";
  const isFooter = variant === "footer";

  const triggerButton = isHero ? (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="hero-action btn-brutal text-lg px-8 py-4 inline-flex items-center gap-2"
      data-cursor-label={label}
      style={{ fontFamily: "var(--font-clash-display)" }}
    >
      {label}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <FontAwesomeIcon icon={faChevronDown} className="text-sm" />
      </motion.span>
    </button>
  ) : isAbout ? (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="about-animate mt-6 inline-flex items-center gap-2 px-6 py-3 border-2 border-fg font-display font-bold uppercase text-sm text-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
      style={{ fontFamily: "var(--font-clash-display)", letterSpacing: "0.04em" }}
      data-cursor-label={label}
    >
      {label}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
      </motion.span>
    </button>
  ) : (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="font-mono text-xs uppercase text-fg-muted hover:text-fg hover:border-fg transition-colors px-2 py-1 border border-fg-muted/30 inline-flex items-center gap-1.5"
      style={{ fontFamily: "var(--font-space-mono)" }}
      data-cursor-label={label}
    >
      {label}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <FontAwesomeIcon icon={faChevronDown} className="text-2xs" />
      </motion.span>
    </button>
  );

  return (
    <div ref={containerRef} className="relative inline-block">
      {triggerButton}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scaleY: 0.9, y: isFooter ? 6 : -6 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.9, y: isFooter ? 6 : -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{ position: "fixed", zIndex: 9999, width: "260px" }}
            className="border-2 border-fg shadow-brutal bg-surface overflow-hidden"
          >
            {[...options].map((opt, i) => (
              <motion.a
                key={opt.label}
                href={opt.href}
                download
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="flex items-start gap-3 px-4 py-3 border-b border-fg-muted/20 last:border-b-0 hover:bg-fg transition-colors cursor-pointer group"
                onClick={() => setIsOpen(false)}
              >
                <span
                  className="shrink-0 w-3 h-3 mt-1.5 border-2"
                  style={{ borderColor: opt.color, backgroundColor: `${opt.color}20` }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="cv-label font-display text-sm font-extrabold uppercase transition-colors"
                      style={{ fontFamily: "var(--font-clash-display)", "--cv-color": opt.color } as React.CSSProperties}
                    >
                      {opt.label}
                    </span>
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="text-xs text-fg-muted opacity-0 group-hover:opacity-100 group-hover:text-surface transition-all"
                    />
                  </div>
                  <p className="text-xs leading-snug mt-0.5 font-medium text-fg-muted group-hover:text-surface/80 transition-colors" style={{ fontFamily: "var(--font-syne)" }}>
                    {opt.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
