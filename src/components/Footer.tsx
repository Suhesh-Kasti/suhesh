"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TYPOGRAPHY, SOCIAL } from "@/lib/design-tokens";
import { motion } from "framer-motion";

const QUOTES = [
  "SCHIZO",
  "APP\\SEC",
  "0x5UH35H",
  "BITS FLIPPED",
  "STACK SMASHED",
  "HEAP SPRAYED",
  "RCE ACHIEVED",
  "SHELL POPPED",
  "NULL DEREF'D",
  "PWNED",
  ";; SEGFAULT",
  "> /DEV/NULL",
  "CHMOD 777",
  "PKT CAPTURED",
  "0DAY FOUND",
  "PATCH TUESDAY SURVIVOR",
  "BGP HIJACKED",
  "DNS POISONED",
  "YES THIS CHANGED",
  "NO YOU AREN'T SEEING THINGS",
];

function GlitchFooter() {
  const [text, setText] = useState("SCHIZO");
  const [glitching, setGlitching] = useState(false);
  const [showText, setShowText] = useState("SCHIZO");
  const year = new Date().getFullYear();

  useEffect(() => {
    const interval = setInterval(() => {
      const newQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setText(newQuote);
      setGlitching(true);
      setTimeout(() => {
        setShowText(newQuote);
        setGlitching(false);
      }, 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      className="font-mono text-2xs uppercase inline-block"
      style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}
      animate={glitching ? { x: [-2, 2, -1, 0] } : {}}
      transition={{ duration: 0.1 }}
    >
      &copy; {year} {showText}
    </motion.span>
  );
}

const FOOTER_LINKS = [
  { label: "Projects", href: "/projects" },
  { label: "Brain Dump", href: "/braindump" },
  { label: "Cyber Tools", href: "/tools" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "CV Download", href: "/Suhesh-Cybersecurity-CV.pdf" },
];

export default function Footer() {

  return (
    <footer className="w-full border-t-2 border-fg bg-surface mt-auto">
      {/* Funky decorative top bar */}
      <div className="h-1 w-full flex">
        {["var(--pink)", "var(--blue)", "var(--yellow)", "var(--green)", "var(--orange)", "var(--purple)", "var(--cyan)", "var(--red)"].map((c, i) => (
          <motion.div
            key={i}
            className="flex-1 h-full"
            style={{ backgroundColor: c }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.15 }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-3xl font-extrabold uppercase text-fg hover:text-spider-pink transition-colors" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>
              SCHIZO
            </Link>
            <p className="mt-2 font-mono text-2xs uppercase text-fg-muted tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
              Suhesh Kasti &mdash; AppSec &amp; Offensive Security
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-2xs uppercase text-fg-muted tracking-label mb-3" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Navigate</h4>
            <ul className="space-y-1.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-mono text-xs uppercase text-fg hover:text-spider-pink transition-colors" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}>
                    <span className="text-spider-pink mr-1">▸</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-mono text-2xs uppercase text-fg-muted tracking-label mb-3" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Connect</h4>
            <ul className="space-y-1.5">
              {Object.entries(SOCIAL).slice(0, 5).map(([key, social]) => (
                <li key={key}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase text-fg hover:text-spider-pink transition-colors" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}>
                    <span className="text-spider-blue mr-1">◆</span> {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-fg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <GlitchFooter />
          <motion.p className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Press <kbd className="px-1 border border-fg-muted">/</kbd> to search
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
