"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";
import { CHECKLIST_REGISTRY, type ChecklistItem } from "./checklist-data";

interface ProgressChecklistProps {
  checklistId: string;
  title?: string;
  items?: ChecklistItem[];
  children?: ReactNode;
}

export default function ProgressChecklist({
  checklistId,
  title,
  items: propItems,
  children,
}: ProgressChecklistProps) {
  const storageKey = `checklist-${checklistId}`;
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Use registry items by default, fall back to prop items
  const registryData = CHECKLIST_REGISTRY[checklistId];
  const safeItems = propItems?.length ? propItems : (registryData?.items ?? []);
  const displayTitle = title ?? registryData?.title ?? "";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setChecked(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        localStorage.setItem(storageKey, JSON.stringify([...next]));
        return next;
      });
    },
    [storageKey]
  );

  const reset = useCallback(() => {
    setChecked(new Set());
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const completed = checked.size;
  const total = safeItems.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  if (safeItems.length === 0) return null;

  return (
    <div className="my-8 border-2 border-fg shadow-brutal not-prose">
      {/* Header */}
      <div className="border-b-2 border-fg px-4 py-3 bg-fg text-surface flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-2xs uppercase tracking-label"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
            }}
          >
            Checklist
          </span>
          {title && (
            <span
              className="font-display text-sm font-bold uppercase"
              style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
            >
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            {completed}/{total}
          </span>
          <button
            onClick={reset}
            className="font-mono text-2xs uppercase opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
            }}
            data-cursor-label="Reset"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-surface border-b-2 border-fg">
        <motion.div
          className="h-full"
          style={{ backgroundColor: COLORS.green }}
          animate={{ width: `${progress}%` }}
          transition={MOTION.smooth}
        />
      </div>

      {/* Items */}
      <ul className="divide-y divide-fg-muted/20">
        {safeItems.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <li key={item.id}>
              <label
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isChecked
                    ? "bg-brutal-green/5 dark:bg-brutal-green/10"
                    : "hover:bg-fg/5 dark:hover:bg-fg/10"
                }`}
                data-cursor-label={isChecked ? "Uncheck" : "Check"}
              >
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(item.id)}
                    className="sr-only"
                  />
                  <motion.div
                    className={`w-5 h-5 border-2 flex items-center justify-center ${
                      isChecked
                        ? "border-brutal-green bg-brutal-green text-surface"
                        : "border-fg bg-surface"
                    }`}
                    whileTap={{ scale: 0.85 }}
                  >
                    {isChecked && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="font-mono text-xs font-bold"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                </div>
                <div className="min-w-0">
                  <span
                    className={`font-mono text-sm ${
                      isChecked
                        ? "text-fg-muted line-through"
                        : "text-fg"
                    }`}
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  >
                    {item.label}
                  </span>
                  {item.detail && !isChecked && (
                    <p
                      className="mt-0.5 text-xs text-fg-muted"
                      style={{ fontFamily: TYPOGRAPHY.fontSans }}
                    >
                      {item.detail}
                    </p>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {children}
    </div>
  );
}
