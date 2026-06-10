"use client";

import { useCallback, useEffect, useRef } from "react";

const STIFFNESS = 0.07;
const DAMPING = 0.77;
const THROTTLE_MS = 700;

export default function ScrollSnapHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSpringing = useRef(false);
  const lastSnap = useRef(0);
  const raf = useRef(0);
  const scrollY = useRef(0);
  const velocity = useRef(0);
  const target = useRef(0);

  const spring = useCallback(() => {
    const current = scrollY.current;
    const t = target.current;
    velocity.current += (t - current) * STIFFNESS;
    velocity.current *= DAMPING;
    const next = current + velocity.current;
    scrollY.current = next;
    window.scrollTo(0, Math.round(next));
    if (Math.abs(velocity.current) > 0.04 || Math.abs(t - next) > 0.5) {
      raf.current = requestAnimationFrame(spring);
    } else {
      window.scrollTo(0, t);
      scrollY.current = t;
      velocity.current = 0;
      isSpringing.current = false;
    }
  }, []);

  const snapTo = useCallback(
    (y: number) => {
      if (isSpringing.current) return;
      target.current = y;
      isSpringing.current = true;
      scrollY.current = window.scrollY;
      velocity.current = 0;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(spring);
    },
    [spring],
  );

  const atTop = useCallback(() => window.scrollY < window.innerHeight * 0.15, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const now = Date.now();

      if (isSpringing.current) {
        e.preventDefault();
        return;
      }

      // Only snap when near the top
      if (sy > vh * 0.15 && e.deltaY > 0) return; // scrolling down past hero: free
      if (sy < vh * 0.85 && e.deltaY < 0) return; // scrolling up above 1vh: free
      if (Math.abs(e.deltaY) < 10) return;
      if (now - lastSnap.current < THROTTLE_MS) return;

      e.preventDefault();

      if (e.deltaY > 0) {
        // snap down one viewport from top
        snapTo(vh);
      } else {
        // snap back to top
        snapTo(0);
      }
      lastSnap.current = now;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [snapTo]);

  // touch
  useEffect(() => {
    let startY = 0;
    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      const vh = window.innerHeight;
      const sy = window.scrollY;
      const now = Date.now();
      if (isSpringing.current) return;
      const diff = startY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 30) return;
      if (diff > 0 && sy > vh * 0.15) return; // down past hero: free
      if (diff < 0 && sy < vh * 0.85) return; // up above 1vh: free
      if (now - lastSnap.current < THROTTLE_MS) return;

      if (diff > 0) snapTo(vh);
      else snapTo(0);
      lastSnap.current = now;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [snapTo]);

  // keyboard: only intercept when near top
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const vh = window.innerHeight;
      const sy = window.scrollY;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (sy > vh * 0.15) return; // free scroll
        e.preventDefault();
        snapTo(vh);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (sy < vh * 0.85) return; // free scroll
        e.preventDefault();
        snapTo(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [snapTo]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return <>{children}</>;
}
