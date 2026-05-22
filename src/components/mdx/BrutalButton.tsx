"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

interface BrutalButtonProps {
  children: ReactNode;
  color?: string;
  size?: "sm" | "md" | "lg";
  reveal?: ReactNode;
}

const SIZE_MAP = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-6 py-3",
  lg: "text-lg px-8 py-4",
};

export default function BrutalButton({
  children,
  color = COLORS.yellow,
  size = "md",
  reveal,
}: BrutalButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleClick = () => {
    if (reveal) {
      setRevealed(!revealed);
    }
  };

  // Compute text color for contrast
  const textColor = color === "#ffdd00" || color === "#00dd44" ? "#0a0a0a" : "#ffffff";

  return (
    <div className="my-4 not-prose">
      <motion.button
        className={`inline-flex items-center gap-2 border-2 border-fg font-bold uppercase cursor-pointer select-none ${SIZE_MAP[size]}`}
        style={{
          fontFamily: TYPOGRAPHY.fontDisplay,
          letterSpacing: TYPOGRAPHY.tracking.wide,
          backgroundColor: color,
          color: textColor,
          textShadow: `1px 1px 0px rgba(0,0,0,0.25)`,
          boxShadow: pressed ? "1px 1px 0px var(--fg)" : "4px 4px 0px var(--fg)",
        }}
        onClick={handleClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        whileHover={{
          scale: 1.03,
          transition: { duration: 0.15, ease: "easeOut" },
        }}
        whileTap={{ scale: 0.95 }}
        data-cursor-label={revealed && reveal ? "Hide" : "Click me"}
      >
        <span className="text-lg leading-none">[</span>
        {children}
        {reveal && (
          <motion.span
            animate={{ rotate: revealed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm ml-1"
          >
            {revealed ? "\u25B2" : "\u25BC"}
          </motion.span>
        )}
        <span className="text-lg leading-none">]</span>
      </motion.button>

      <AnimatePresence>
        {revealed && reveal && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-2 border-fg p-5 bg-surface">
              <div className="font-mono text-sm leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                {reveal}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
