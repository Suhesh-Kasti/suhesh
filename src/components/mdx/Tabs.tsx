"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";

interface Tab {
  label: string;
  children: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  color?: string;
}

export default function Tabs({ tabs, color = COLORS.pink }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeTabs = Array.isArray(tabs) ? tabs : [];
  if (safeTabs.length === 0) return null;

  return (
    <div className="my-6 border-2 border-fg not-prose">
      <div className="flex border-b-2 border-fg overflow-x-auto">
        {safeTabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveIndex(index)}
            className={`font-mono text-xs uppercase px-4 py-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 border-r border-fg-muted/30 last:border-r-0 ${
              index === activeIndex
                ? "bg-fg text-surface font-bold"
                : "bg-surface text-fg-muted hover:text-fg hover:bg-fg/5 dark:hover:bg-fg/10"
            }`}
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.mono,
            }}
            data-cursor-label={tab.label}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-4 text-sm leading-relaxed text-fg"
        >
          <div
            className="[&_p]:font-sans [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-fg [&_p]:my-2 [&_code]:font-mono [&_code]:text-brutal-green [&_code]:bg-surface-invert [&_code]:text-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:my-3 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:text-brutal-green [&_pre]:bg-brutal-black [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-fg [&_table]:w-full [&_table]:border-collapse [&_table]:border-2 [&_table]:border-fg [&_table]:font-mono [&_table]:text-sm [&_th]:border-2 [&_th]:border-fg [&_th]:bg-fg [&_th]:text-surface [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-bold [&_th]:uppercase [&_th]:text-xs [&_td]:border [&_td]:border-fg-muted [&_td]:px-3 [&_td]:py-1.5"
            style={{ fontFamily: TYPOGRAPHY.fontSans }}
          >
            {tabs[activeIndex].children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
