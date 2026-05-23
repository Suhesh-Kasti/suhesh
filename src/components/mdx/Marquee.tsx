"use client";

import { ReactNode, useRef, useEffect, useCallback } from "react";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  color?: string;
}

export default function Marquee({ children, speed = 140, color }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const handleLinkEnter = useCallback(() => { pausedRef.current = true; }, []);
  const handleLinkLeave = useCallback(() => { pausedRef.current = false; }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const rafId = { current: 0 };
    let pos = 0;
    let copyWidth = 0;

    const timer = setTimeout(() => {
      const copies = track.querySelectorAll<HTMLSpanElement>(".marquee-copy");
      if (copies.length < 2) return;
      copyWidth = copies[0].offsetWidth;

      // Hook up link hover listeners
      const links = track.querySelectorAll("a");
      links.forEach((link) => {
        link.addEventListener("mouseenter", handleLinkEnter);
        link.addEventListener("mouseleave", handleLinkLeave);
      });

      const pxPerFrame = speed / 60;

      const animate = () => {
        if (!pausedRef.current && copyWidth > 0) {
          pos -= pxPerFrame;
          if (pos <= -copyWidth) {
            pos += copyWidth;
          }
        }
        track.style.transform = `translateX(${pos}px)`;
        rafId.current = requestAnimationFrame(animate);
      };

      rafId.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [children, speed, handleLinkEnter, handleLinkLeave]);

  return (
    <div
      className="my-6 border-2 border-fg overflow-hidden not-prose py-3"
      style={{ backgroundColor: "var(--surf)" }}
    >
      <div ref={trackRef} className="flex" style={{ width: "max-content", willChange: "transform", lineHeight: 1 }}>
        <span className="marquee-copy font-display text-lg uppercase font-bold whitespace-nowrap pr-12" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color }}>
          {children}
        </span>
        <span className="marquee-copy font-display text-lg uppercase font-bold whitespace-nowrap pr-12" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color }}>
          {children}
        </span>
        <span className="marquee-copy font-display text-lg uppercase font-bold whitespace-nowrap" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color }}>
          {children}
        </span>
      </div>
    </div>
  );
}
