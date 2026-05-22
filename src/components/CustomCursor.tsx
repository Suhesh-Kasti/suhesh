"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

function hasTouch(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");
  const [clicking, setClicking] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const visible = useRef(true);
  const touchActive = useRef(false);

  useEffect(() => {
    const touch = hasTouch();
    setIsTouch(touch);
    setMounted(true);
    if (!touch) {
      document.body.classList.add("cursor-none");
    }
    return () => {
      document.body.classList.remove("cursor-none");
    };
  }, []);

  useEffect(() => {
    if (isTouch || !mounted) return;
    const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max));

    const onMove = (e: MouseEvent) => {
      if (touchActive.current) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPos({
        x: clamp(e.clientX, vw),
        y: clamp(e.clientY, vh),
      });
    };

    const onOver = (e: MouseEvent) => {
      if (touchActive.current) return;
      const el = (e.target as HTMLElement).closest?.("a, button, [data-cursor-label]") as HTMLElement;
      if (el) {
        setHovering(true);
        setLabel(el.dataset.cursorLabel ?? "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };

    const onOut = () => { setHovering(false); setLabel(""); };
    const onEnter = () => { visible.current = true; };
    const onLeave = () => { visible.current = false; };
    const onDown = () => { if (!touchActive.current) setClicking(true); };
    const onUp = () => setClicking(false);

    // Touch detection — when user touches screen, flag it so mouse events are ignored
    const onTouchStart = () => {
      touchActive.current = true;
      setClicking(false);
      setHovering(false);
    };
    // After a delay with no touch, re-enable cursor
    const onTouchEnd = () => {
      setTimeout(() => { touchActive.current = false; }, 500);
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isTouch, mounted]);

  const size = 14;
  const ringSize = 38;

  if (!mounted || isTouch) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed z-[999999]"
        style={{
          left: 0,
          top: 0,
          width: ringSize,
          height: ringSize,
          border: "2px solid #ff2d95",
          borderRadius: "0%",
        }}
        animate={{
          x: pos.x - ringSize / 2,
          y: pos.y - ringSize / 2,
          rotate: hovering ? 135 : clicking ? 90 : 0,
          scale: clicking ? 0.8 : hovering ? 1.1 : 1,
          borderWidth: hovering ? "3px" : "2px",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 18, mass: 0.3 }}
      />

      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed z-[999999]"
        style={{
          width: size,
          height: size,
          borderRadius: "0%",
        }}
        animate={{
          x: pos.x - size / 2,
          y: pos.y - size / 2,
          backgroundColor: hovering ? "#ffdd00" : clicking ? "#ff1144" : "#ff2d95",
          scale: clicking ? 1.3 : hovering ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.2 }}
      />

      {/* Label badge */}
      <motion.div
        className="pointer-events-none fixed z-[99999] font-mono text-2xs uppercase tracking-label font-bold px-2 py-1 border-2 whitespace-nowrap shadow-brutal-sm"
        style={{ borderColor: "#ff2d95", backgroundColor: "var(--surf)", color: "var(--fg)" }}
        animate={{
          x: pos.x - 14,
          y: pos.y + 26,
          opacity: hovering && label ? 1 : 0,
          scale: hovering && label ? 1 : 0.8,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      >
        {label}
      </motion.div>
    </>
  );
}
