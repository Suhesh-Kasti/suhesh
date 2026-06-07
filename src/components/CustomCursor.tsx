"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const S = { ring: 36, dot: 8 };

export default function CustomCursor() {
  const [hover, setHover] = useState(false);
  const [click, setClick] = useState(false);
  const [label, setLabel] = useState("");
  const [ready, setReady] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Position only — light spring, fluid
  const x = useSpring(mx, { stiffness: 250, damping: 32, mass: 0.6 });
  const y = useSpring(my, { stiffness: 250, damping: 32, mass: 0.6 });

  // Offsets are simple math — no spring needed
  const rx = useTransform(x, (v) => v - S.ring / 2);
  const ry = useTransform(y, (v) => v - S.ring / 2);
  const dx = useTransform(x, (v) => v - S.dot / 2);
  const dy = useTransform(y, (v) => v - S.dot / 2);
  const lx = useTransform(x, (v) => v - 16);
  const ly = useTransform(y, (v) => v + 26);

  useEffect(() => {
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    mx.set(window.innerWidth / 2);
    my.set(window.innerHeight / 2);

    const s = document.createElement("style");
    s.textContent = "html.cc,html.cc *{cursor:none!important}";
    document.head.appendChild(s);
    document.documentElement.classList.add("cc");
    setReady(true);

    let prev: Element | null = null;

    const mv = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      const el = e.target as Element | null;
      if (el !== prev) {
        prev = el;
        const a = el?.closest?.("[data-cursor-label]") as HTMLElement | null;
        setHover(!!a);
        setLabel(a?.dataset.cursorLabel ?? "");
      }
    };

    const dn = () => setClick(true);
    const up = () => setClick(false);

    window.addEventListener("pointermove", mv, { passive: true });
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);

    return () => {
      document.documentElement.classList.remove("cc");
      s.remove();
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
    };
  }, [mx, my]);

  if (!ready) return null;

  const h = hover;
  const c = click;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 999999, pointerEvents: "none",
          width: S.ring, height: S.ring,
          x: rx, y: ry,
          borderStyle: "solid",
        }}
        animate={{
          borderColor: c ? "#ff1144" : h ? "#ffdd00" : "#ff2d95",
          borderWidth: c || h ? 3 : 2,
          rotate: c ? 90 : h ? 135 : 0,
          scale: c ? 0.8 : h ? 1.15 : 1,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 28, mass: 0.5 }}
      />
      {/* Inner dot */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 999999, pointerEvents: "none",
          width: S.dot, height: S.dot,
          x: dx, y: dy,
        }}
        animate={{
          backgroundColor: c ? "#ff1144" : h ? "#ffdd00" : "#ff2d95",
          scale: c ? 1.5 : h ? 0.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 28, mass: 0.5 }}
      />
      {/* Label badge */}
      <motion.div
        animate={{ opacity: h && label ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 999999, pointerEvents: "none",
          x: lx, y: ly,
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: 9, textTransform: "uppercase", fontWeight: 700,
          padding: "4px 8px", whiteSpace: "nowrap",
          border: "2px solid #ff2d95",
          backgroundColor: "var(--surf)", color: "var(--fg)",
          boxShadow: "4px 4px 0 rgba(255,45,149,0.3)",
        }}
      >
        {label}
      </motion.div>
    </>
  );
}
