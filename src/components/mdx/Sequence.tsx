"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { resolveAccent, seededShuffle, tint } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface SequenceProps {
  title?: string;
  steps: string[];
  color?: string;
}

export default function Sequence({ title = "Put it in order", steps = [], color = "#00dd44" }: SequenceProps) {
  const accent = resolveAccent(color);
  const order = useMemo(() => seededShuffle(steps.map((_, index) => index), steps.join("|")), [steps]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const pool = order.filter((index) => !placed.includes(index));
  const complete = placed.length === steps.length;

  const reset = () => {
    setPlaced([]);
    setChecked(false);
  };

  return (
    <div className="not-prose my-8 border-2 border-fg bg-surface" style={{ boxShadow: `6px 6px 0px ${accent}` }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-fg px-4 py-2" style={{ backgroundColor: tint(accent, "1a") }}>
        <span className="font-mono text-2xs font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: accent }}>
          {title}
        </span>
        <span className="min-w-0 flex-1" />
        <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          {placed.length}/{steps.length} placed
        </span>
      </div>

      <div className="space-y-2 px-4 py-4">
        {steps.map((_, slot) => {
          const pairIndex = placed[slot];
          const filled = pairIndex !== undefined;
          const correct = filled && pairIndex === slot;
          return (
            <div key={slot} className="flex items-stretch gap-2">
              <span
                className="grid w-8 shrink-0 place-items-center border-2 border-fg font-mono text-2xs font-bold"
                style={{ backgroundColor: accent, color: "#0a0a0a", fontFamily: TYPOGRAPHY.fontMono }}
              >
                {slot + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!filled) return;
                  setPlaced((prev) => prev.filter((_, i) => i !== slot));
                  setChecked(false);
                }}
                className={`flex min-w-0 flex-1 items-center border-2 px-3 py-2 text-left font-sans text-sm transition-colors ${filled ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  fontFamily: TYPOGRAPHY.fontSans,
                  borderColor: checked && filled ? (correct ? "#00dd44" : "#ff5500") : "var(--fg)",
                  borderStyle: filled ? "solid" : "dashed",
                  backgroundColor: filled ? "var(--surf)" : "transparent",
                  color: filled ? "var(--fg)" : "var(--fg-muted)",
                }}
              >
                {filled ? steps[pairIndex] : "drop a step here"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 border-t-2 border-fg px-4 py-3">
        {pool.length === 0 ? (
          <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            all steps placed
          </span>
        ) : (
          pool.map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setPlaced((prev) => [...prev, index]);
                setChecked(false);
              }}
              className="cursor-pointer border-2 border-fg-muted px-3 py-1.5 font-sans text-xs text-fg transition-colors hover:border-fg hover:bg-fg hover:text-surface"
              style={{ fontFamily: TYPOGRAPHY.fontSans }}
            >
              {steps[index]}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-4 py-2">
        <button
          type="button"
          onClick={() => setChecked(true)}
          disabled={!complete}
          className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface disabled:cursor-not-allowed disabled:opacity-40"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
        >
          <FontAwesomeIcon icon={faCheck} className="text-[10px]" aria-hidden />
          Check order
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg-muted px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" aria-hidden />
          Reset
        </button>
        {checked && (
          <span
            className="font-mono text-2xs uppercase"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: placed.every((value, slot) => value === slot) ? "#00dd44" : "#ff5500" }}
          >
            {placed.every((value, slot) => value === slot) ? "correct sequence" : "green = right slot, orange = wrong"}
          </span>
        )}
      </div>
    </div>
  );
}
