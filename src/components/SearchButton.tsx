"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SEARCH, TYPOGRAPHY, MOTION, COLORS, SITE, SOCIAL, WORK } from "@/lib/design-tokens";

interface SearchResult {
  type: "answer" | "link" | "error";
  content: string;
  url?: string;
}

const SITE_INDEX = `
Site: ${SITE.name} - ${SITE.realName}'s portfolio
Role: ${SITE.role}
Description: ${SITE.description}

Contact:
${Object.entries(SOCIAL)
  .map(([k, v]) => `${v.label}: ${v.handle} (${v.url})`)
  .join("\n")}

Projects:
${WORK.projects.map((p) => `- ${p.title} (${p.category}): ${p.description} Tags: ${p.tags.join(", ")}`).join("\n")}

CV: Available at /cv.pdf (download link on the homepage and contact section)
About: ${SITE.realName}, Application Security Engineer & Offensive Security researcher
`;

function localSearch(query: string): SearchResult {
  const q = query.toLowerCase();

  if (q.includes("cv") || q.includes("resume") || q.includes("download cv")) {
    return { type: "link", content: "Download my CV directly:", url: "/cv.pdf" };
  }
  if (q.includes("whatsapp") || q.includes("wa")) {
    return { type: "link", content: `Reach me on WhatsApp: ${SOCIAL.whatsapp.handle}`, url: SOCIAL.whatsapp.url };
  }
  if (q.includes("telegram") || q.includes("tg")) {
    return { type: "link", content: `Message me on Telegram: ${SOCIAL.telegram.handle}`, url: SOCIAL.telegram.url };
  }
  if (q.includes("email") || q.includes("mail")) {
    return { type: "link", content: `Email me: ${SOCIAL.email.handle}`, url: SOCIAL.email.url };
  }
  if (q.includes("phone") || q.includes("call") || q.includes("number")) {
    return { type: "link", content: `Call me: ${SOCIAL.phone.handle}`, url: SOCIAL.phone.url };
  }
  if (q.includes("github") || q.includes("code") || q.includes("repo")) {
    return { type: "link", content: `Check out my GitHub: ${SOCIAL.github.handle}`, url: SOCIAL.github.url };
  }
  if (q.includes("linkedin") || q.includes("linked")) {
    return { type: "link", content: `Connect on LinkedIn: ${SOCIAL.linkedin.handle}`, url: SOCIAL.linkedin.url };
  }
  if (q.includes("youtube") || q.includes("video")) {
    return { type: "link", content: `Watch on YouTube: ${SOCIAL.youtube.handle}`, url: SOCIAL.youtube.url };
  }
  if (q.includes("twitter") || q.includes("x.com")) {
    return { type: "link", content: `Follow on Twitter: ${SOCIAL.twitter.handle}`, url: SOCIAL.twitter.url };
  }
  if (q.includes("about") || q.includes("who") || q.includes("suhesh") || q.includes("bio")) {
    return { type: "answer", content: `I'm ${SITE.realName}, an ${SITE.role}. ${SITE.description} I specialize in web security, binary exploitation, network pentesting, reverse engineering, and malware analysis.` };
  }
  if (q.includes("work") || q.includes("project") || q.includes("portfolio")) {
    const projects = WORK.projects.map(p => p.title).join(", ");
    return { type: "answer", content: `My featured projects: ${projects}. Check them out at /work or scroll to the Featured Work section on the homepage.` };
  }
  if (q.includes("tools") || q.includes("playground") || q.includes("lab") || q.includes("cyber tool") || q.includes("base64") || q.includes("hash") || q.includes("regex") || q.includes("nmap parse")) {
    return { type: "link", content: "Cyber Tools lab — Base64 encoder/decoder, hash generator, regex tester, and Nmap port parser.", url: "/#playground" };
  }
  if (q.includes("cheatsheet") || q.includes("reference") || q.includes("commands")) {
    return { type: "link", content: "Cheatsheets: Docker, Nmap, SQLMap, Linux — all with copy buttons and quick quizzes.", url: "/braindump" };
  }
  if (q.includes("checklist") || q.includes("procedure")) {
    return { type: "link", content: "Interactive checklists — passive enumeration, Nmap engagement, F5 update. Progress auto-saves.", url: "/braindump" };
  }
  if (q.includes("til") || q.includes("byte") || q.includes("quick tip")) {
    return { type: "link", content: "Byte-sized TILs — single-concept technical nuggets with interactive components.", url: "/braindump" };
  }
  if (q.includes("skill") || q.includes("stack") || q.includes("tech")) {
    return { type: "answer", content: "Skills: Web Security (95%), Binary Exploitation (90%), Network Pentesting (88%), Reverse Engineering (85%), Malware Analysis (82%), Cloud Security (80%), Cryptography (78%), Incident Response (85%)." };
  }
  if (q.includes("contact") || q.includes("reach") || q.includes("connect")) {
    return { type: "link", content: "All ways to reach me — scroll to the Connect section.", url: "/#contact" };
  }
  if (q.includes("summarize") || q.includes("summary") || q.includes("overview")) {
    return { type: "answer", content: SITE_INDEX };
  }

  return { type: "answer", content: "Try asking about: my CV, WhatsApp, email, projects, skills, brain dump, or contact info." };
}

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
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
        setResults([{ type: "answer", content: data.answer }]);
        setLoading(false);
        return;
      }
    } catch {
      // Fall back to local search
    }

    const result = localSearch(q.trim());
    setResults([result as SearchResult]);
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
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen, handleSearch]);

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
              className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={MOTION.snappy}
            >
              <div className="w-full max-w-2xl border-2 border-fg bg-surface shadow-brutal-lg">
                {/* Search input */}
                <div className="flex items-center border-b-2 border-fg px-4">
                  <span className="font-mono text-fg-muted mr-3">?</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={SEARCH.placeholder}
                    className="flex-1 bg-transparent text-fg font-sans text-lg py-4 focus:outline-none placeholder:text-fg-muted"
                    style={{ fontFamily: TYPOGRAPHY.fontSans }}
                    autoFocus
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="font-mono text-fg-muted hover:text-brutal-pink ml-2 text-sm px-2 py-1 border border-fg-muted hover:border-brutal-pink transition-colors"
                    aria-label="Close search"
                  >
                    ESC
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {loading && (
                    <div className="p-6 text-center">
                      <span
                        className="font-mono text-sm text-fg-muted animate-pulse"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        {SEARCH.loadingText}
                      </span>
                    </div>
                  )}

                  {!loading && results.length === 0 && query.length > 0 && (
                    <div className="p-6 text-center">
                      <span
                        className="font-mono text-sm text-fg-muted"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        {SEARCH.noResults}
                      </span>
                    </div>
                  )}

                  {!loading && results.length === 0 && query.length === 0 && (
                    <div className="p-6 space-y-3">
                      <p
                        className="font-mono text-xs text-fg-muted uppercase tracking-label"
                        style={{
                          fontFamily: TYPOGRAPHY.fontMono,
                          letterSpacing: TYPOGRAPHY.tracking.label,
                        }}
                      >
                        Try asking:
                      </p>
                      {[
                        "How to download CV?",
                        "WhatsApp number",
                        "Skills and expertise",
                        "Summarize the site",
                        "Contact info",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuery(suggestion)}
                          className="block w-full text-left font-sans text-sm text-fg-muted hover:text-fg border-l-2 border-fg-muted hover:border-brutal-pink pl-3 py-1 transition-all"
                          style={{ fontFamily: TYPOGRAPHY.fontSans }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {!loading &&
                    results.map((result, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-fg-muted/20 last:border-b-0 p-6"
                      >
                        <span
                          className="font-mono text-2xs uppercase text-brutal-pink tracking-label"
                          style={{
                            fontFamily: TYPOGRAPHY.fontMono,
                            letterSpacing: TYPOGRAPHY.tracking.label,
                          }}
                        >
                          {result.type === "answer" ? "Answer" : "Link"}
                        </span>
                        <p
                          className="mt-2 text-sm leading-relaxed text-fg"
                          style={{ fontFamily: TYPOGRAPHY.fontSans }}
                        >
                          {result.content}
                        </p>
                        {result.url && (
                          <a
                            href={result.url}
                            className="inline-block mt-3 font-mono text-xs uppercase text-fg border-2 border-fg px-3 py-1 hover:bg-fg hover:text-surface transition-all"
                            style={{
                              fontFamily: TYPOGRAPHY.fontMono,
                              letterSpacing: TYPOGRAPHY.tracking.mono,
                            }}
                            target={result.url.startsWith("http") ? "_blank" : undefined}
                            rel={result.url.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            Open →
                          </a>
                        )}
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
