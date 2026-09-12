"use client";

import type { CSSProperties, ReactNode } from "react";
import { resolveAccent, tint } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface MarqueeProps {
  children: ReactNode;
  speed?: number | string;
  color?: string;
}

export default function Marquee({ children, speed = 4, color = "#0055ff" }: MarqueeProps) {
  const accent = resolveAccent(color);
  const rate = typeof speed === "number" ? speed : parseFloat(speed);
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 4;
  const duration = Math.min(90, Math.max(14, 120 / safeRate));

  return (
    <div
      className="marquee-strip not-prose my-6 overflow-hidden border-y-2 border-fg"
      style={
        {
          backgroundColor: tint(accent, "16"),
          borderTopColor: accent,
          "--marquee-duration": `${duration}s`,
        } as CSSProperties
      }
    >
      <div className="marquee-track flex w-max items-center py-3">
        {[0, 1, 2, 3].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy > 0}
            className="flex shrink-0 items-center gap-3 whitespace-nowrap pr-12 font-display text-base font-bold uppercase text-fg sm:text-lg [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-2"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay, letterSpacing: TYPOGRAPHY.tracking.tight }}
          >
            {children}
            <span className="inline-block h-2 w-2 shrink-0 rotate-45" style={{ backgroundColor: accent }} aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
