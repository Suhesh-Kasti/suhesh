"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION, MOTION, TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import ThemeToggle from "@/components/ThemeToggle";

const STAGGER_DELAY = 0.06;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const { links, logoText } = NAVIGATION;

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      lastY = y;
      setScrolledDown(y > 120 && delta > 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const hidden = scrolledDown && !isOpen;

  useEffect(() => {
    document.documentElement.classList.toggle("nav-hidden", hidden);
    return () => document.documentElement.classList.remove("nav-hidden");
  }, [hidden]);

  return (
    <header
      className="fixed left-0 top-0 z-50 w-full border-b-2 border-fg bg-surface transition-transform duration-300 ease-out"
      style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-fg hover:text-brutal-pink transition-colors"
          data-cursor-label="Home"
        >
          <Image src="/logo-dark.png" alt="SCHIZO" width={210} height={129} priority className="hidden h-10 w-auto dark:block" />
          <Image src="/logo-white.png" alt="SCHIZO" width={210} height={129} priority className="block h-10 w-auto dark:hidden" />
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
              {[
                { size: 18, left: "8%", top: "14%", color: COLORS.pink, duration: 4 },
                { size: 26, left: "26%", top: "62%", color: COLORS.blue, duration: 4.5 },
                { size: 14, left: "42%", top: "28%", color: COLORS.pink, duration: 5 },
                { size: 30, left: "58%", top: "70%", color: COLORS.blue, duration: 5.5 },
                { size: 22, left: "71%", top: "20%", color: COLORS.pink, duration: 6 },
                { size: 16, left: "84%", top: "55%", color: COLORS.blue, duration: 6.5 },
                { size: 28, left: "16%", top: "82%", color: COLORS.blue, duration: 7 },
                { size: 20, left: "90%", top: "34%", color: COLORS.pink, duration: 7.5 },
              ].map((square, i) => (
                <motion.div
                  key={`sq-${i}`}
                  className="absolute border-2 opacity-[0.06]"
                  style={{
                    width: square.size,
                    height: square.size,
                    left: square.left,
                    top: square.top,
                    borderColor: square.color,
                  }}
                  animate={{ rotate: [0, 90, 0], scale: [0.8, 1.1, 0.8] }}
                  transition={{ repeat: Infinity, duration: square.duration, ease: "linear" }}
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
                {logoText} · menu
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
