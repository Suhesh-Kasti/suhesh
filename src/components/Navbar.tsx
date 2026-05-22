"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION, MOTION, TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import ThemeToggle from "@/components/ThemeToggle";

const STAGGER_DELAY = 0.06;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { links, logoText } = NAVIGATION;

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b-2 border-fg bg-surface">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-fg hover:text-brutal-pink transition-colors"
          data-cursor-label="Home"
        >
          <img src="/logo-dark.png" alt="SCHIZO" className="h-10 w-auto hidden dark:block" />
          <img src="/logo-white.png" alt="SCHIZO" className="h-10 w-auto block dark:hidden" />
          <span
            className="font-display text-2xl font-extrabold uppercase tracking-tight"
            style={{
              fontFamily: TYPOGRAPHY.fontDisplay,
              letterSpacing: TYPOGRAPHY.tracking.tight,
            }}
          >
            {logoText}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <ul className="flex items-center gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-sm uppercase tracking-wide text-fg px-4 py-2 border-2 border-transparent hover:border-fg hover:shadow-brutal-sm transition-all"
                  style={{
                    fontFamily: TYPOGRAPHY.fontMono,
                    letterSpacing: TYPOGRAPHY.tracking.mono,
                  }}
                  data-cursor-label={link.label}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-4 pl-4 border-l-2 border-fg">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex flex-col gap-1.5 p-2.5 border-2 border-fg hover:shadow-brutal-sm transition-shadow z-50"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            data-cursor-label={isOpen ? "Close" : "Menu"}
          >
            <motion.span
              className="block h-0.5 w-6 bg-fg origin-center"
              animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={MOTION.snappy}
            />
            <motion.span
              className="block h-0.5 w-6 bg-fg"
              animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={MOTION.snappy}
            />
            <motion.span
              className="block h-0.5 w-6 bg-fg origin-center"
              animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={MOTION.snappy}
            />
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Background with diagonal stripes */}
            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: "var(--surf)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Diagonal accent stripes */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    top: 0,
                    left: `${15 + i * 15}%`,
                    width: "3px",
                    height: "120%",
                    backgroundColor: i % 3 === 0 ? COLORS.pink : i % 3 === 1 ? COLORS.yellow : COLORS.blue,
                    opacity: 0.08,
                    transform: "rotate(12deg)",
                    transformOrigin: "top left",
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                />
              ))}
              {/* Floating squares */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`sq-${i}`}
                  className="absolute border-2 opacity-[0.06]"
                  style={{
                    width: 12 + Math.random() * 20,
                    height: 12 + Math.random() * 20,
                    left: `${5 + Math.random() * 85}%`,
                    top: `${5 + Math.random() * 85}%`,
                    borderColor: i % 2 === 0 ? COLORS.pink : COLORS.blue,
                  }}
                  animate={{ rotate: [0, 90, 0], scale: [0.8, 1.1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "linear" }}
                />
              ))}
            </motion.div>

            {/* Close button area */}
            <div className="relative z-10 h-16 shrink-0" />

            {/* Navigation links */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pb-16">
              <ul className="flex flex-col gap-3">
                {links.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -30, opacity: 0 }}
                    transition={{ delay: 0.1 + index * STAGGER_DELAY, duration: 0.3, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3"
                    >
                      {/* Number badge */}
                      <span
                        className="font-mono text-2xs text-fg-muted w-6 shrink-0 text-right"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {/* Arrow */}
                      <motion.span
                        className="font-mono text-fg-muted group-hover:text-brutal-pink transition-colors shrink-0"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                        animate={{ x: 0 }}
                        whileHover={{ x: 4 }}
                      >
                        →
                      </motion.span>
                      {/* Link text with underline animation */}
                      <span className="relative">
                        <span
                          className="font-display text-3xl font-extrabold uppercase text-fg group-hover:text-brutal-pink transition-colors"
                          style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
                        >
                          {link.label}
                        </span>
                        <motion.span
                          className="absolute -bottom-1 left-0 h-1 bg-brutal-pink"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.2 }}
                        />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Footer bar */}
            <motion.div
              className="relative z-10 border-t-2 border-fg px-8 py-4 flex items-center justify-between"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <span
                className="font-mono text-2xs uppercase text-fg-muted"
                style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
              >
                {logoText} // menu
              </span>
              <span
                className="font-mono text-2xs text-fg-muted/50"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                press ESC or tap link to close
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
