"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import type { SeriesStep } from "@/lib/braindump";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircle } from "@fortawesome/free-solid-svg-icons";

interface PhaseDivider {
  label: string;
  color: string;
  startIndex: number;
  endIndex: number;
}

const PHASES: PhaseDivider[] = [
  { label: "Information Disclosure", color: COLORS.pink, startIndex: 0, endIndex: 5 },
  { label: "Access Control & IDOR", color: COLORS.orange, startIndex: 5, endIndex: 13 },
  { label: "Cross-Site Scripting", color: COLORS.blue, startIndex: 13, endIndex: 25 },
  { label: "DOM-Based XSS", color: COLORS.purple, startIndex: 25, endIndex: 30 },
  { label: "Authentication & Brute Force", color: COLORS.green, startIndex: 30, endIndex: 40 },
  { label: "SQL Injection", color: COLORS.red, startIndex: 40, endIndex: 50 },
  { label: "SSRF", color: COLORS.teal, startIndex: 50, endIndex: 55 },
  { label: "Command Injection", color: COLORS.orange, startIndex: 55, endIndex: 59 },
  { label: "Path Traversal", color: COLORS.yellow, startIndex: 59, endIndex: 64 },
  { label: "File Upload", color: COLORS.blue, startIndex: 64, endIndex: 69 },
  { label: "Server-Side Template Injection", color: COLORS.purple, startIndex: 69, endIndex: 74 },
  { label: "JWT Attacks", color: COLORS.pink, startIndex: 74, endIndex: 82 },
  { label: "NoSQL Injection", color: COLORS.teal, startIndex: 82, endIndex: 86 },
  { label: "GraphQL", color: COLORS.red, startIndex: 86, endIndex: 90 },
  { label: "API Testing", color: COLORS.green, startIndex: 90, endIndex: 95 },
];

interface SeriesRoadmapProps {
  steps: SeriesStep[];
}

export default function SeriesRoadmap({ steps }: SeriesRoadmapProps) {
  // Starts empty and fills in after mount. Reading localStorage inside the state initialiser
  // made the first client render disagree with the server's (0 vs the saved count), which is
  // what triggered the hydration mismatch and made React rebuild the tree.
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("roadmap-progress");
      if (saved) setCompleted(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleStep = (index: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      try {
        localStorage.setItem("roadmap-progress", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const resetProgress = () => {
    setCompleted(new Set());
    try {
      localStorage.removeItem("roadmap-progress");
    } catch {}
  };

  const doneCount = completed.size;
  const percent = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mt-16 border-2 border-fg bg-surface relative overflow-hidden">
      {/* Top bar */}
      <div className="sticky top-16 z-10 border-b-2 border-fg bg-surface px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs uppercase tracking-label"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
            }}
          >
            Progress: {doneCount}/{steps.length} ({percent}%)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-3 border border-fg bg-surface hidden sm:block">
            <motion.div
              className="h-full"
              style={{ backgroundColor: COLORS.teal }}
              initial={{ width: "0%" }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <button
            onClick={resetProgress}
            className="font-mono text-2xs uppercase text-fg-muted hover:text-fg border border-fg-muted/30 px-2 py-1 transition-colors cursor-pointer"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Step list */}
      <div className="p-6 md:p-10">
        {PHASES.map((phase, pi) => {
          const phaseSteps = steps.slice(phase.startIndex, phase.endIndex);
          if (phaseSteps.length === 0) return null;
          const phaseCompleted = phaseSteps.filter(
            (_, i) => completed.has(phase.startIndex + i)
          ).length;
          const phasePercent = Math.round((phaseCompleted / phaseSteps.length) * 100);

          return (
            <div key={pi} className="mb-10 last:mb-0">
              {/* Phase header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-[2px]" style={{ backgroundColor: `${phase.color}40` }} />
                <span
                  className="font-display text-sm uppercase font-bold whitespace-nowrap"
                  style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: phase.color }}
                >
                  {phase.label}
                </span>
                <span
                  className="font-mono text-2xs whitespace-nowrap"
                  style={{ fontFamily: TYPOGRAPHY.fontMono, color: `${phase.color}80` }}
                >
                  {phaseCompleted}/{phaseSteps.length} &middot; {phasePercent}%
                </span>
                <div
                  className="flex-1 h-[2px]"
                  style={{ backgroundColor: `${phase.color}40` }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-1">
                {phaseSteps.map((step, i) => {
                  const globalIndex = phase.startIndex + i;
                  const isDone = completed.has(globalIndex);

                  return (
                    <motion.div
                      key={step.slug}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: globalIndex * 0.005, duration: 0.15 }}
                      className="flex items-center gap-3 px-3 py-2 border border-transparent hover:border-fg-muted/30 transition-colors group"
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleStep(globalIndex)}
                        className="shrink-0 w-5 h-5 border-2 flex items-center justify-center cursor-pointer transition-all"
                        style={{
                          borderColor: isDone ? phase.color : "var(--fg-muted)",
                          backgroundColor: isDone ? `${phase.color}15` : "transparent",
                          color: isDone ? phase.color : "var(--fg-muted)",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={isDone ? faCheck : faCircle}
                          className={isDone ? "text-2xs" : "text-3xs"}
                        />
                      </button>

                      {/* Step number */}
                      <span
                        className="font-mono text-2xs shrink-0 w-6 text-right"
                        style={{
                          fontFamily: TYPOGRAPHY.fontMono,
                          color: isDone ? `${phase.color}60` : "var(--fg-muted)",
                        }}
                      >
                        {globalIndex + 1}
                      </span>

                      {/* Title + desc */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/braindump/${step.slug}`}
                            className={`font-mono text-sm hover:text-brutal-pink-text transition-colors truncate ${isDone ? "line-through opacity-50" : ""}`}
                            style={{ fontFamily: TYPOGRAPHY.fontMono }}
                          >
                            {step.title}
                          </Link>
                        </div>
                        {step.description && !isDone && (
                          <p
                            className="text-2xs leading-relaxed text-fg-muted mt-0.5 truncate"
                            style={{ fontFamily: TYPOGRAPHY.fontSans }}
                          >
                            {step.description}
                          </p>
                        )}
                      </div>

                      {/* View button */}
                      <Link
                        href={`/braindump/${step.slug}`}
                        className="shrink-0 font-mono text-2xs uppercase text-fg-muted hover:text-fg opacity-0 group-hover:opacity-100 transition-all border border-fg-muted/30 px-2 py-0.5"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        View
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
