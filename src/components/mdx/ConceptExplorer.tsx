"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

interface ConceptStep {
  label: string;
  content: string;
  highlight?: string; // key term to emphasise
}

interface ConceptExplorerProps {
  title: string;
  steps: ConceptStep[];
  color?: string;
}

export default function ConceptExplorer({ title, steps, color = "#ff5500" }: ConceptExplorerProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  const go = (dir: 1 | -1) => {
    setStep(s => Math.max(0, Math.min(steps.length - 1, s + dir)));
  };

  return (
    <div className="not-prose my-8 border-2 border-fg bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b-2 border-fg" style={{ backgroundColor: `${color}15` }}>
        <div
          className="w-8 h-8 border-2 flex items-center justify-center font-mono text-sm font-bold shrink-0"
          style={{ borderColor: color, color, fontFamily: TYPOGRAPHY.fontMono }}
        >
          {step + 1}/{steps.length}
        </div>
        <div>
          <h4
            className="font-mono text-xs uppercase font-bold"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color }}
          >
            {title}
          </h4>
          <p
            className="font-mono text-2xs text-fg-muted uppercase tracking-label mt-0.5"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            {current.label}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative overflow-hidden" style={{ minHeight: 120 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-5 font-sans text-sm leading-relaxed text-fg"
            style={{ fontFamily: TYPOGRAPHY.fontSans }}
          >
            {current.highlight && (
              <span
                className="inline-block font-mono text-xs uppercase font-bold px-2 py-0.5 border mb-3 mr-2"
                style={{ borderColor: color, color, fontFamily: TYPOGRAPHY.fontMono }}
              >
                {current.highlight}
              </span>
            )}
            {current.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots + nav */}
      <div className="border-t-2 border-fg p-4 flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          disabled={step === 0}
          className="font-mono text-xs uppercase border border-fg-muted/30 px-3 py-1 transition-all hover:border-fg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
          aria-label="Previous step"
        >
          ← Prev
        </button>

        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="w-2.5 h-2.5 border transition-all cursor-pointer"
              style={{
                borderColor: color,
                backgroundColor: i === step ? color : "transparent",
              }}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          disabled={step === steps.length - 1}
          className="font-mono text-xs uppercase border border-fg-muted/30 px-3 py-1 transition-all hover:border-fg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
          aria-label="Next step"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
