"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
}

export default function Marquee({ children, speed = 20, direction = "left" }: MarqueeProps) {
  const xStart = direction === "left" ? "0%" : "-50%";
  const xEnd = direction === "left" ? "-50%" : "0%";

  return (
    <div className="my-6 border-2 border-fg overflow-hidden not-prose py-3 relative" style={{ backgroundColor: "var(--surf)" }}>
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: [xStart, xEnd] }}
        transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
      >
        <span className="font-display text-lg uppercase font-bold" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{children}</span>
        <span className="font-display text-lg uppercase font-bold opacity-40" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{children}</span>
        <span className="font-display text-lg uppercase font-bold opacity-70" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{children}</span>
        <span className="font-display text-lg uppercase font-bold opacity-30" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{children}</span>
        <span className="font-display text-lg uppercase font-bold opacity-60" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{children}</span>
      </motion.div>
    </div>
  );
}
