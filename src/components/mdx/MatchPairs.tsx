"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { resolveAccent, seededShuffle, tint } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

export interface MatchPair {
  term: string;
  match: string;
}

interface MatchPairsProps {
  title?: string;
  pairs?: MatchPair[];
  color?: string;
}

export default function MatchPairs({ title = "Match them up", pairs = [], color = "#8800ff" }: MatchPairsProps) {
  const accent = resolveAccent(color);
  const shuffled = useMemo(() => seededShuffle(pairs.map((_, index) => index), pairs.map((pair) => pair.term).join("|")), [pairs]);
  const [selected, setSelected] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);

  const pickMatch = (pairIndex: number) => {
    if (selected === null) return;
    if (selected === pairIndex) {
      setMatched((prev) => new Set(prev).add(pairIndex));
      setSelected(null);
    } else {
      setWrong(pairIndex);
      setSelected(null);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const reset = () => {
    setMatched(new Set());
    setSelected(null);
    setWrong(null);
  };

  const done = pairs.length > 0 && matched.size === pairs.length;

  return (
    <div className="not-prose my-8 border-2 border-fg bg-surface" style={{ boxShadow: `6px 6px 0px ${accent}` }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-fg px-4 py-2" style={{ backgroundColor: tint(accent, "1a") }}>
        <span className="font-mono text-2xs font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: accent }}>
          {title}
        </span>
        <span className="min-w-0 flex-1" />
        <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, color: done ? "#00dd44" : "var(--fg-muted)" }}>
          {matched.size}/{pairs.length} matched
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2">
        <div className="space-y-2">
          {pairs.map((pair, index) => {
            const isMatched = matched.has(index);
            const isSelected = selected === index;
            return (
              <button
                key={pair.term}
                type="button"
                onClick={() => {
                  if (isMatched) return;
                  setSelected(index);
                  setWrong(null);
                }}
                disabled={isMatched}
                className="flex w-full cursor-pointer items-center gap-2 border-2 px-3 py-2 text-left font-mono text-xs transition-colors disabled:cursor-default"
                style={{
                  fontFamily: TYPOGRAPHY.fontMono,
                  borderColor: isMatched ? "#00dd44" : isSelected ? accent : "var(--fg)",
                  backgroundColor: isMatched ? "color-mix(in srgb, #00dd44 12%, transparent)" : isSelected ? tint(accent, "1c") : "var(--surf)",
                  color: "var(--fg)",
                }}
              >
                {isMatched && <FontAwesomeIcon icon={faCheck} className="text-[10px]" style={{ color: "#00dd44" }} aria-hidden />}
                {pair.term}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {shuffled.map((pairIndex) => {
            const pair = pairs[pairIndex];
            const isMatched = matched.has(pairIndex);
            const isWrong = wrong === pairIndex;
            return (
              <button
                key={pair.match}
                type="button"
                onClick={() => pickMatch(pairIndex)}
                disabled={isMatched}
                className="flex w-full cursor-pointer items-center border-2 px-3 py-2 text-left font-sans text-xs leading-snug transition-colors disabled:cursor-default"
                style={{
                  fontFamily: TYPOGRAPHY.fontSans,
                  borderColor: isWrong ? "#ff5500" : isMatched ? "#00dd44" : "var(--fg-muted)",
                  backgroundColor: isWrong ? "color-mix(in srgb, #ff5500 14%, transparent)" : isMatched ? "color-mix(in srgb, #00dd44 12%, transparent)" : "var(--surf)",
                  color: "var(--fg)",
                  opacity: isMatched ? 0.75 : 1,
                }}
              >
                {pair.match}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-4 py-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg-muted px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" aria-hidden />
          Reset
        </button>
        <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          {selected === null ? "pick a term, then its match" : "now pick the matching definition"}
        </span>
      </div>
    </div>
  );
}
