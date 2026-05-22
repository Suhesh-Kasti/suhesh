"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  color?: string;
}

export default function Accordion({
  title,
  children = null,
  defaultOpen = false,
  color = COLORS.pink,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="my-3 border-2 border-fg not-prose overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface text-fg hover:bg-fg/5 dark:hover:bg-fg/10 transition-colors cursor-pointer text-left"
        data-cursor-label={isOpen ? "Collapse" : "Expand"}
      >
        <span
          className="font-mono text-xs uppercase font-bold tracking-label"
          style={{
            fontFamily: TYPOGRAPHY.fontMono,
            letterSpacing: TYPOGRAPHY.tracking.label,
          }}
        >
          {title}
        </span>
        <motion.span
          className="font-mono text-sm"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={MOTION.snappy}
          style={{ color }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={MOTION.smooth}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t-2 border-fg bg-fg/[0.02] dark:bg-fg/[0.03] text-sm leading-relaxed text-fg">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
