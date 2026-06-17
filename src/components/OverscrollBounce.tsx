"use client";

import { useEffect, useRef } from "react";

const STIFFNESS = 0.08;
const DAMPING = 0.82;
const RESISTANCE = 0.35;
const MAX_OFFSET = 120;

export default function OverscrollBounce({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
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
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
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
