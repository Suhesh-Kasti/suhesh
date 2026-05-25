"use client";

import { useEffect, useState, useRef, useCallback } from "react";

function hasTouch(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const hoveringRef = useRef(false);
  const clickingRef = useRef(false);
  const activeRef = useRef(false);
  const [label, setLabel] = useState("");
  const [mounted, setMounted] = useState(false);

  // Animation loop
  const animate = useCallback(() => {
    const p = posRef.current;
    const t = targetRef.current;
    const h = hoveringRef.current;
    const c = clickingRef.current;

    // Tighter lerp for responsiveness
    p.x += (t.x - p.x) * 0.55;
    p.y += (t.y - p.y) * 0.55;

    const ring = ringRef.current;
    const dot = dotRef.current;
    const lbl = labelRef.current;

    if (ring) {
      ring.style.transform = `translate3d(${p.x - 19}px, ${p.y - 19}px, 0) rotate(${h ? 135 : c ? 90 : 0}deg) scale(${c ? 0.8 : h ? 1.1 : 1})`;
      ring.style.borderWidth = h ? "3px" : "2px";
    }
    if (dot) {
      dot.style.transform = `translate3d(${p.x - 6}px, ${p.y - 6}px, 0) scale(${c ? 1.4 : h ? 0.5 : 1})`;
      dot.style.backgroundColor = h ? "#ffdd00" : c ? "#ff1144" : "#ff2d95";
    }
    if (lbl) {
      lbl.style.transform = `translate3d(${p.x - 16}px, ${p.y + 28}px, 0) scale(${h && label ? 1 : 0.7})`;
      lbl.style.opacity = h && label ? "1" : "0";
    }

    const idle = Math.abs(p.x - t.x) < 0.1 && Math.abs(p.y - t.y) < 0.1 && !c;
    if (idle) {
      activeRef.current = false;
    } else {
      requestAnimationFrame(animate);
    }
  }, [label]);

  const wake = useCallback(() => {
    if (!activeRef.current) {
      activeRef.current = true;
      requestAnimationFrame(animate);
    }
  }, [animate]);

  useEffect(() => {
    if (hasTouch()) return;
    setMounted(true);
    document.body.classList.add("cursor-none");

    // Single pointermove handler — position + hover in one shot
    const onMove = (e: PointerEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      const el = (e.target as HTMLElement).closest?.("a, button, [data-cursor-label]") as HTMLElement | null;
      const nowHover = !!el;
      if (nowHover !== hoveringRef.current) {
        hoveringRef.current = nowHover;
        setLabel(el?.dataset.cursorLabel ?? "");
      }
      wake();
    };

    const onDown = () => { clickingRef.current = true; wake(); };
    const onUp = () => { clickingRef.current = false; wake(); };
    const onLeave = () => { if (ringRef.current) ringRef.current.style.opacity = "0"; if (dotRef.current) dotRef.current.style.opacity = "0"; };
    const onEnter = () => { if (ringRef.current) ringRef.current.style.opacity = "1"; if (dotRef.current) dotRef.current.style.opacity = "1"; };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      document.body.classList.remove("cursor-none");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [wake]);

  if (!mounted) return null;

  return (
    <>
      <div ref={ringRef} className="pointer-events-none fixed z-[999999] will-change-transform" style={{ left: 0, top: 0, width: 38, height: 38, border: "2px solid #ff2d95" }} />
      <div ref={dotRef} className="pointer-events-none fixed z-[999999] will-change-transform" style={{ left: 0, top: 0, width: 12, height: 12, backgroundColor: "#ff2d95" }} />
      <div ref={labelRef} className="pointer-events-none fixed z-[99999] font-mono text-2xs uppercase font-bold px-2 py-1 border-2 border-[#ff2d95] whitespace-nowrap shadow-brutal-sm opacity-0 will-change-transform" style={{ backgroundColor: "var(--surf)", color: "var(--fg)" }}>{label}</div>
    </>
  );
}
