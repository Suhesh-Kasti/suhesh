"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface GlitchBoxProps {
  children: string;
  color?: string;
}

export default function GlitchBox({ children, color = "#ff2d95" }: GlitchBoxProps) {
  const [glitching, setGlitching] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const trigger = () => {
      setOffset({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 4 });
      setGlitching(true);
      setTimeout(() => setGlitching(false), 180);
    };
    const interval = setInterval(trigger, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="my-6 border-2 p-5 relative overflow-hidden not-prose cursor-pointer" style={{ borderColor: color, backgroundColor: "var(--surf)" }} data-cursor-label="Glitch me">
      {/* Main text */}
      <motion.div
        className="font-mono text-sm leading-relaxed relative z-20"
        style={{ fontFamily: TYPOGRAPHY.fontMono }}
        animate={glitching ? { x: offset.x, y: offset.y } : { x: 0, y: 0 }}
        transition={{ duration: 0.08 }}
      >
        {children}
      </motion.div>

      {/* Glitch channel overlays */}
      {glitching && (
        <>
          <motion.div
            className="absolute inset-0 z-10 font-mono text-sm leading-relaxed p-5 pointer-events-none select-none"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: color, clipPath: `inset(${30 + Math.random() * 20}% 0 ${40 + Math.random() * 10}% 0)`, transform: `translate(${-offset.x * 3}px, ${-offset.y}px)` }}
          >
            {children}
          </motion.div>
          <motion.div
            className="absolute inset-0 z-10 font-mono text-sm leading-relaxed p-5 pointer-events-none select-none"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: "#0055ff", clipPath: `inset(${50 + Math.random() * 15}% 0 ${10 + Math.random() * 10}% 0)`, transform: `translate(${offset.x * 3}px, ${offset.y}px)` }}
          >
            {children}
          </motion.div>
        </>
      )}

      {/* Scanline indicator */}
      <div className="absolute top-0 left-0 w-full h-[2px] z-30 pointer-events-none" style={{ backgroundColor: color, opacity: 0.6, transform: glitching ? "translateY(100%)" : "translateY(-100%)", transition: "transform 0.12s ease" }} />
    </div>
  );
}
