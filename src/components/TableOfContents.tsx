"use client";

import { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

interface Heading {
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const parsed: Heading[] = [];
    for (const line of content.split("\n")) {
      const h2 = line.match(/^##\s+(.+)$/);
      const h3 = line.match(/^###\s+(.+)$/);
      if (h2) parsed.push({ text: h2[1], level: 2 });
      else if (h3) parsed.push({ text: h3[1], level: 3 });
    }
    setHeadings(parsed);
  }, [content]);

  const handleClick = useCallback((text: string) => {
    const all = document.querySelectorAll("h2, h3");
    for (const el of all) {
      if (el.textContent?.trim() === text) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      }
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between border-2 px-4 py-2.5 font-mono text-xs uppercase tracking-widest cursor-pointer"
          style={{ fontFamily: "var(--font-space-mono)", color: "var(--color-spider-pink)", borderColor: "var(--color-spider-pink)" }}
        >
          <span className="flex items-center gap-2"><FontAwesomeIcon icon={faBolt} /> On this page ({headings.length})</span>
          <span>{open ? "\u25B2" : "\u25BC"}</span>
        </button>
        {open && (
          <div className="border-2 border-t-0 p-3" style={{ borderColor: "var(--color-spider-pink)" }}>
            {headings.map((h, i) => (
              <button key={i} onClick={() => { handleClick(h.text); setOpen(false); }} className="block w-full text-left py-1.5 font-mono text-xs border-b border-dotted border-fg-muted/30 hover:text-spider-pink transition-colors cursor-pointer"
                style={{ paddingLeft: h.level === 3 ? "14px" : "0", fontFamily: "var(--font-space-mono)", color: "var(--fg-muted)" }}>
                {h.level === 3 && "> "}{h.text}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block border-l-[3px] pl-4 py-2" style={{ borderColor: "var(--color-spider-pink)" }}>
        <div className="flex items-center gap-2 mb-3 font-mono text-2xs uppercase tracking-widest" style={{ color: "var(--color-spider-pink)", fontFamily: "var(--font-space-mono)" }}>
          <FontAwesomeIcon icon={faBolt} /> On this page
        </div>
        <nav>
          {headings.map((h, i) => (
            <button key={i}
            onClick={() => handleClick(h.text)}
            className="block w-full text-left py-1.5 leading-snug font-mono text-xs border-b border-dotted border-fg-muted/30 hover:text-spider-pink transition-colors cursor-pointer"
            style={{
              paddingLeft: h.level === 3 ? "14px" : "0",
              fontFamily: "var(--font-space-mono)",
              color: "var(--fg-muted)",
            }}
          >
            {h.level === 3 && "> "}{h.text}
          </button>
        ))}
      </nav>
    </div>
  </>
  );
}
