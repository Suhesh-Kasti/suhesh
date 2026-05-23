"use client";

import { useState, Children, isValidElement, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";

interface TabsProps {
  children?: ReactNode;
  color?: string;
}

export default function Tabs({ children, color = COLORS.pink }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = Children.toArray(children)
    .filter((child) => isValidElement(child))
    .map((child) => {
      const el = child as React.ReactElement<any>;
      return {
        label: el.props.label ?? el.props["data-label"] ?? "",
        children: el.props.children,
      };
    })
    .filter((tab) => tab.label);

  if (tabs.length === 0) return null;

  return (
    <div className="my-6 border-2 border-fg not-prose">
      <div className="flex border-b-2 border-fg overflow-x-auto">
        {tabs.map((tab, index) => (
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
          style={{ fontFamily: TYPOGRAPHY.fontSans }}
        >
          {tabs[activeIndex].children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
