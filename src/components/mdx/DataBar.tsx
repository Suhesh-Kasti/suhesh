"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface DataBarProps {
  title?: string;
  data: BarItem[];
}

const DEFAULT_COLORS = ["#ff5500", "#00dd44", "#0055ff", "#ffdd00", "#ff2d95", "#8800ff", "#00e5ff", "#ff8800"];

export default function DataBar({ title, data }: DataBarProps) {
  const [visible, setVisible] = useState(false);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const colors = data.map((d, i) => d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]);

  return (
    <div className="not-prose my-6 p-5 border-2 border-fg bg-surface">
      {title && (
        <h4
          className="font-mono text-sm uppercase font-bold mb-3 text-fg-muted"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
        >
          {title}
        </h4>
      )}

      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.label} className="group">
            <div className="flex justify-between mb-1">
              <span
                className="font-mono text-xs uppercase text-fg"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                {item.label}
              </span>
              <span
                className="font-mono text-xs font-bold"
                style={{ fontFamily: TYPOGRAPHY.fontMono, color: colors[i] }}
              >
                {item.value}
              </span>
            </div>
            <div className="h-4 border border-fg-muted/30 bg-brutal-black/10 overflow-hidden">
              <motion.div
                className="h-full"
                style={{ backgroundColor: colors[i] }}
                initial={{ width: 0 }}
                animate={{ width: visible ? `${(item.value / maxVal) * 100}%` : "0%" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                onAnimationComplete={() => i === data.length - 1 && setVisible(true)}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setVisible(p => !p)}
        className="mt-3 font-mono text-2xs uppercase text-fg-muted hover:text-fg border border-fg-muted/30 px-2 py-1 transition-colors cursor-pointer"
        style={{ fontFamily: TYPOGRAPHY.fontMono }}
      >
        {visible ? "hide" : "show"} bars
      </button>
    </div>
  );
}
