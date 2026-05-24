"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";
import { parseSimpleMarkdown } from "@/lib/markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBook, faFileCode, faLightbulb, faClipboardCheck, faBrain, faWrench } from "@fortawesome/free-solid-svg-icons";

const PLACEHOLDERS = [
  "AI-powered search...",
  "Talk to me like a friend",
  "You're talking directly to schizo ... a SCHIZO",
  "Ask me anything, I'm chill..I think",
  "Type your question, press enter",
  "I'm listening... kinda",
  "You're still just looking at me??",
  "still looking....",
  "Still Looking.........",
  "STILL LOOKING?????????????",
  "Did Someone tell you you're looking gorgeous today??",
  "Don't worry I wont either",
  "You still here???",
  "Okay let's medidate together",
  "BREATHE IN.....",
  "BREATHE OUT........",
  "BREATHE IN.....",
  "BREATHE OUT........",
  "Maybe...you are in love with me",
  "Can't blame you, I am that adorable ;-)",
  "But sadly for you, I'm just an ..",
];

interface SearchResults {
  aiAnswer: string;
  posts: Array<{
    title: string;
    excerpt: string;
    url: string;
    type: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    url: string;
    color: string;
    category: string;
  }>;
}

const TYPE_ICONS: Record<string, typeof faBook> = {
  blog: faBook,
  til: faLightbulb,
  cheatsheet: faFileCode,
  checklist: faClipboardCheck,
  braindump: faBrain,
};

const TYPE_LABELS: Record<string, string> = {
  blog: "Deep Dive",
  til: "Byte-Sized",
  cheatsheet: "Cheatsheet",
  checklist: "Checklist",
  braindump: "Brain Dump",
};

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setLoading(false);
        return;
      }
    } catch {
      // fallback
    }

    // Fallback: show empty state with AI queue message
    setResults({ aiAnswer: "Search is warming up. Try again in a moment!", posts: [], projects: [] });
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isOpen && document.activeElement === document.body) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length === 0) {
      setResults(null);
      setLoading(false);
    }
  }, [query, isOpen]);

  const hasAnyResults = results && (results.aiAnswer || results.posts.length > 0 || results.projects.length > 0);

  return (
    <>
      {/* Floating search button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 border-2 border-fg bg-brutal-yellow text-brutal-black font-mono text-xl font-bold shadow-brutal hover:shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        data-cursor-label="Search"
        aria-label="Open search"
      >
        ?
      </motion.button>

      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-brutal-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={MOTION.snappy}
            >
              <div className="w-full max-w-2xl border-2 border-fg bg-surface shadow-brutal-lg">
                {/* Input bar */}
                <div className="flex items-center border-b-2 border-fg px-4 relative">
                  <span className="font-mono text-fg-muted mr-3 text-lg">?</span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch(query);
                      }}
                      placeholder=""
                      className="w-full bg-transparent text-fg font-sans text-lg py-4 focus:outline-none placeholder:text-transparent relative z-10"
                      style={{ fontFamily: TYPOGRAPHY.fontSans }}
                      autoFocus
                    />
                    {!query && (
                      <div className="absolute inset-0 flex items-center pointer-events-none z-0 overflow-hidden">
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={placeholderIdx}
                            initial={{ y: 22, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -22, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="text-lg text-fg-muted"
                            style={{ fontFamily: TYPOGRAPHY.fontSans }}
                          >
                            {PLACEHOLDERS[placeholderIdx]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleSearch(query)}
                    className="font-mono text-xs text-fg hover:text-brutal-pink ml-2 px-3 py-1 border border-fg hover:border-brutal-pink transition-colors cursor-pointer"
                    aria-label="Search"
                  >
                    GO
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="font-mono text-fg-muted hover:text-brutal-pink ml-2 text-sm px-2 py-1 border border-fg-muted hover:border-brutal-pink transition-colors cursor-pointer"
                    aria-label="Close search"
                  >
                    ESC
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Loading */}
                  {loading && (
                    <div className="p-8 text-center">
                      <motion.div
                        className="inline-flex gap-1"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <span className="w-2 h-2 bg-brutal-pink" />
                        <span className="w-2 h-2 bg-brutal-yellow" />
                        <span className="w-2 h-2 bg-brutal-blue" />
                      </motion.div>
                      <p className="mt-3 font-mono text-xs text-fg-muted uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                        Thinking...
                      </p>
                    </div>
                  )}

                  {/* Empty state */}
                  {!loading && !hasAnyResults && query.length > 0 && (
                    <div className="p-8 text-center">
                      <p className="font-mono text-sm text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                        Nothing found. Try a different query?
                      </p>
                    </div>
                  )}

                  {/* Suggestions (no query yet) */}
                  {!loading && !hasAnyResults && query.length === 0 && (
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px bg-fg-muted/30" />
                        <span className="font-mono text-2xs uppercase text-fg-muted tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                          try asking
                        </span>
                        <div className="flex-1 h-px bg-fg-muted/30" />
                      </div>
                      {[
                        "How to download CV?",
                        "WhatsApp number",
                        "Skills and expertise",
                        "Tell me about the projects",
                        "Contact info",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => { setQuery(suggestion); handleSearch(suggestion); }}
                          className="block w-full text-left font-sans text-sm text-fg-muted hover:text-fg border-l-2 border-fg-muted hover:border-brutal-pink pl-3 py-1 transition-all cursor-pointer"
                          style={{ fontFamily: TYPOGRAPHY.fontSans }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results */}
                  {!loading && hasAnyResults && (
                    <div>
                      {/* AI Answer */}
                      {results!.aiAnswer && (
                        <div className="border-b-2 border-fg p-5" style={{ backgroundColor: `${COLORS.pink}05` }}>
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-4 h-4 border"
                              style={{ borderColor: COLORS.pink, backgroundColor: `${COLORS.pink}20` }}
                            />
                            <span
                              className="font-mono text-2xs uppercase tracking-label"
                              style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: COLORS.pink }}
                            >
                              AI Response
                            </span>
                          </div>
                          <div
                            className="font-sans text-sm leading-relaxed text-fg space-y-2"
                            style={{ fontFamily: TYPOGRAPHY.fontSans }}
                            dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(results!.aiAnswer) }}
                          />
                        </div>
                      )}

                      {/* Projects matches */}
                      {results!.projects.length > 0 && (
                        <div className="border-b-2 border-fg p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-4 h-4 border"
                              style={{ borderColor: COLORS.yellow, backgroundColor: `${COLORS.yellow}20` }}
                            />
                            <span
                              className="font-mono text-2xs uppercase tracking-label"
                              style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: COLORS.yellow }}
                            >
                              Projects
                            </span>
                            <span className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                              {results!.projects.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {results!.projects.map((p, i) => (
                              <motion.div
                                key={p.url}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <Link
                                  href={p.url}
                                  className="group flex items-start gap-3 p-3 border-2 border-fg-muted/20 hover:border-fg transition-all cursor-pointer"
                                  style={{ borderLeftColor: p.color, borderLeftWidth: 4 }}
                                >
                                  <FontAwesomeIcon icon={faWrench} className="text-xs mt-0.5 shrink-0" style={{ color: p.color }} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="font-mono text-xs font-bold uppercase group-hover:text-brutal-pink transition-colors"
                                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                                      >
                                        {p.title}
                                      </span>
                                      <span
                                        className="font-mono text-2xs uppercase text-fg-muted"
                                        style={{ fontFamily: TYPOGRAPHY.fontMono, color: p.color }}
                                      >
                                        {p.category}
                                      </span>
                                    </div>
                                    <p
                                      className="mt-0.5 text-xs text-fg-muted line-clamp-2"
                                      style={{ fontFamily: TYPOGRAPHY.fontSans }}
                                    >
                                      {p.description}
                                    </p>
                                  </div>
                                  <span className="text-fg-muted group-hover:text-brutal-pink shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                  </span>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Brain Dump matches */}
                      {results!.posts.length > 0 && (
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-4 h-4 border"
                              style={{ borderColor: COLORS.green, backgroundColor: `${COLORS.green}20` }}
                            />
                            <span
                              className="font-mono text-2xs uppercase tracking-label"
                              style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: COLORS.green }}
                            >
                              Brain Dump
                            </span>
                            <span className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                              {results!.posts.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {results!.posts.map((p, i) => {
                              const icon = TYPE_ICONS[p.type] ?? faBook;
                              const label = TYPE_LABELS[p.type] ?? p.type;
                              return (
                                <motion.div
                                  key={p.url}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                >
                                  <Link
                                    href={p.url}
                                    className="group flex items-start gap-3 p-3 border-2 border-fg-muted/20 hover:border-fg transition-all cursor-pointer"
                                  >
                                    <FontAwesomeIcon icon={icon} className="text-xs mt-0.5 shrink-0" style={{ color: COLORS.green }} />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="font-mono text-xs font-bold uppercase group-hover:text-brutal-pink transition-colors"
                                          style={{ fontFamily: TYPOGRAPHY.fontMono }}
                                        >
                                          {p.title}
                                        </span>
                                        <span
                                          className="font-mono text-2xs uppercase text-fg-muted border border-fg-muted/30 px-1.5 py-0.5"
                                          style={{ fontFamily: TYPOGRAPHY.fontMono }}
                                        >
                                          {label}
                                        </span>
                                      </div>
                                      <p
                                        className="mt-0.5 text-xs text-fg-muted line-clamp-2"
                                        style={{ fontFamily: TYPOGRAPHY.fontSans }}
                                      >
                                        {p.excerpt}
                                      </p>
                                    </div>
                                    <span className="text-fg-muted group-hover:text-brutal-pink shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all">
                                      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                    </span>
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
