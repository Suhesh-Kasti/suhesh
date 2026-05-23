"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface FlipCardProps {
  front?: string;
  back?: string;
  color?: string;
}

export default function FlipCard({ front, back, color = "#ff2d95" }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="my-6 cursor-pointer not-prose"
      style={{ perspective: "800px", width: "100%", maxWidth: "400px", height: "160px" }}
      onClick={() => setFlipped(!flipped)}
      data-cursor-label={flipped ? "Flip back" : "Flip"}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 border-2 flex items-center justify-center p-4"
          style={{
            borderColor: color,
            backgroundColor: "var(--surf)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="font-display text-lg font-bold uppercase text-center" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>{front}</div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 border-2 flex items-center justify-center p-4"
          style={{
            borderColor: color,
            backgroundColor: color + "10",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="font-mono text-sm text-center" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{back}</div>
        </div>
      </motion.div>
    </div>
  );
}
