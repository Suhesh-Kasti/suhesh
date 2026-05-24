"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface IdeaNodeProps {
  children: string;
  color?: string;
}

export default function IdeaNode({ children, color = "#ffdd00" }: IdeaNodeProps) {
  const [spins, setSpins] = useState(0);

  return (
    <div className="relative my-8 not-prose group">
      <motion.div
        className="relative max-w-md mx-auto p-5 cursor-pointer font-sans text-sm leading-relaxed transition-shadow hover:shadow-brutal-lg"
        style={{
          border: `3px solid ${color}`,
          boxShadow: `6px 6px 0px ${color}`,
          backgroundColor: "var(--surf)",
          fontFamily: TYPOGRAPHY.fontSans,
          color: "var(--fg)",
        }}
        whileTap={{ scale: 0.98, boxShadow: `2px 2px 0px ${color}` }}
        onClick={() => setSpins((s) => s + 1)}
        data-cursor-label="Click to spin"
      >
        {/* Pushpin */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 border-2"
          style={{ borderColor: color, backgroundColor: color }}
        />
        {/* Tape strip */}
        <div
          className="absolute -top-1 left-6 w-10 h-2 opacity-30 rotate-[-10deg]"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute -top-1 right-6 w-8 h-2 opacity-20 rotate-[8deg]"
          style={{ backgroundColor: color }}
        />

        <div className="mt-2 [&_strong]:font-extrabold [&_strong]:uppercase [&_strong]:block [&_strong]:text-lg [&_strong]:mb-1">
          <span
            className="absolute left-1 top-0 font-mono text-lg font-bold"
            style={{ color }}
          >
            &gt;
          </span>
          <span className="pl-4 block">{children}</span>
        </div>

        <div className="mt-3 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-1"
              style={{ backgroundColor: color, opacity: 0.3 + i * 0.1, flex: 1 }}
            />
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span
            className="font-mono text-2xs uppercase tracking-label group-hover:opacity-100 opacity-50 transition-opacity"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: `${color}99` }}
          >
            spins: {spins}
          </span>
          <motion.span
            className="font-mono text-2xs uppercase tracking-label"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color }}
            animate={{ rotate: spins * 360 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            ★
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
