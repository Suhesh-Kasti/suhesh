"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEye, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { resolveAccent, tint } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface ClozeProps {
  title?: string;
  text: string;
  color?: string;
}

type Part = { type: "text" | "blank"; value: string; options?: string[] };

function parse(text: string): Part[] {
  const parts: Part[] = [];
  const pattern = /\{\{(.+?)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: "text", value: text.slice(last, match.index) });
    const options = match[1].split("|").map((option) => option.trim());
    parts.push({ type: "blank", value: options[0], options });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function Cloze({ title = "Active recall", text, color = "#00e5ff" }: ClozeProps) {
  const accent = resolveAccent(color);
  const parts = useMemo(() => parse(text), [text]);
  const blankCount = parts.filter((part) => part.type === "blank").length;
  const [answers, setAnswers] = useState<string[]>(() => Array(blankCount).fill(""));
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  let blankIndex = -1;
  const correctCount = parts.filter((part) => {
    if (part.type !== "blank") return false;
    blankIndex++;
    const given = normalize(answers[blankIndex] ?? "");
    return given.length > 0 && (part.options ?? [part.value]).some((option) => normalize(option) === given);
  }).length;

  const reset = () => {
    setAnswers(Array(blankCount).fill(""));
    setChecked(false);
    setRevealed(false);
  };

  blankIndex = -1;

  return (
    <div
      className="not-prose my-8 border-2 border-fg"
      style={{ boxShadow: `6px 6px 0px ${accent}`, backgroundColor: "var(--surf)" }}
    >
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-fg px-4 py-2"
        style={{ backgroundColor: tint(accent, "1a") }}
      >
        <span
          className="font-mono text-2xs font-bold uppercase"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: accent }}
        >
          {title}
        </span>
        <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          {blankCount} blank{blankCount === 1 ? "" : "s"}
        </span>
        <span className="min-w-0 flex-1" />
        {checked && !revealed && (
          <span
            className="font-mono text-2xs uppercase"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: correctCount === blankCount ? "#00dd44" : "#ff5500" }}
          >
            {correctCount}/{blankCount} correct
          </span>
        )}
      </div>

      <p
        className="px-4 py-5 font-sans text-sm leading-loose text-fg"
        style={{ fontFamily: TYPOGRAPHY.fontSans }}
      >
        {parts.map((part, index) => {
          if (part.type === "text") return <span key={index}>{part.value}</span>;
          const currentBlank = ++blankIndex;
          const given = answers[currentBlank] ?? "";
          const isCorrect = (part.options ?? [part.value]).some((option) => normalize(option) === normalize(given));
          const state = revealed || checked ? (isCorrect ? "correct" : "wrong") : "idle";
          return (
            <span key={index} className="inline-flex items-baseline">
              <input
                value={revealed ? part.value : given}
                onChange={(event) => {
                  const next = [...answers];
                  next[currentBlank] = event.target.value;
                  setAnswers(next);
                  setChecked(false);
                }}
                spellCheck={false}
                aria-label={`Blank ${currentBlank + 1}`}
                size={Math.max(6, (revealed ? part.value : given || part.value).length + 2)}
                className="mx-1 border-b-2 bg-transparent px-1 py-0.5 text-center font-mono text-sm focus:outline-none"
                style={{
                  fontFamily: TYPOGRAPHY.fontMono,
                  color: state === "correct" ? "#00dd44" : state === "wrong" ? "#ff5500" : "var(--fg)",
                  borderColor: state === "correct" ? "#00dd44" : state === "wrong" ? "#ff5500" : accent,
                }}
              />
            </span>
          );
        })}
      </p>

      <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-4 py-2">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
        >
          <FontAwesomeIcon icon={faCheck} className="text-[10px]" aria-hidden />
          Check
        </button>
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg-muted px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
        >
          <FontAwesomeIcon icon={faEye} className="text-[10px]" aria-hidden />
          {revealed ? "Hide" : "Reveal"}
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
        <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          try it before revealing
        </span>
      </div>
    </div>
  );
}
