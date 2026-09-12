"use client";

import { useEffect, useRef } from "react";

const STIFFNESS = 0.09;
const DAMPING = 0.86;
const RESISTANCE = 0.18;
const MAX_OFFSET = 48;

export default function OverscrollBounce({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const spring = () => {
      velocity.current += (0 - offset.current) * STIFFNESS;
      velocity.current *= DAMPING;
      offset.current += velocity.current;

      if (Math.abs(offset.current) < 0.3 && Math.abs(velocity.current) < 0.3) {
        offset.current = 0;
        velocity.current = 0;
        rafId.current = 0;
        if (wrapperRef.current) {
          wrapperRef.current.style.transform = "";
          wrapperRef.current.style.willChange = "auto";
        }
        return;
      }

      offset.current = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, offset.current));
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translateY(${offset.current}px)`;
      }
      rafId.current = requestAnimationFrame(spring);
    };

    const startSpring = () => {
      if (rafId.current) return;
      if (wrapperRef.current) {
        wrapperRef.current.style.willChange = "transform";
      }
      rafId.current = requestAnimationFrame(spring);
    };

    const handleWheel = (e: WheelEvent) => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      // Page cannot scroll (fullscreen panes, modals, locked body): never intercept.
      if (maxScroll <= 0) return;

      // Let any nested scroller handle its own wheel before we consider bouncing.
      let node = e.target as HTMLElement | null;
      while (node && node !== document.documentElement) {
        const overflowY = getComputedStyle(node).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          const canScrollDown = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
          const canScrollUp = node.scrollTop > 0;
          if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) return;
        }
        node = node.parentElement;
      }

      const scrollTop = window.scrollY;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop >= maxScroll - 1;

      if (atTop && e.deltaY < 0) {
        e.preventDefault();
        const impulse = Math.abs(e.deltaY) * RESISTANCE;
        offset.current = Math.min(MAX_OFFSET, offset.current + impulse);
        velocity.current += impulse * 0.15;
        startSpring();
      } else if (atBottom && e.deltaY > 0) {
        e.preventDefault();
        const impulse = e.deltaY * RESISTANCE;
        offset.current = Math.max(-MAX_OFFSET, offset.current - impulse);
        velocity.current -= impulse * 0.15;
        startSpring();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(rafId.current);
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = "";
        wrapperRef.current.style.willChange = "auto";
      }
    };
  }, []);

  return <div ref={wrapperRef}>{children}</div>;
}
