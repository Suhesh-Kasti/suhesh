"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faPen } from "@fortawesome/free-solid-svg-icons";
import { hashText, resolveAccent, tint } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface SelfExplainProps {
  prompt: string;
  model: string;
  color?: string;
  title?: string;
}

function countWords(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function SelfExplain({ prompt, model, color = "#ffdd00", title = "Explain it back" }: SelfExplainProps) {
  const accent = resolveAccent(color);
  const [answer, setAnswer] = useState("");
  const [showModel, setShowModel] = useState(false);
  const storageKey = useRef("");

  useEffect(() => {
    storageKey.current = `self-explain:${hashText(prompt)}`;
    try {
      const saved = localStorage.getItem(storageKey.current);
      if (saved) setAnswer(saved);
    } catch {}
  }, [prompt]);

  useEffect(() => {
    if (!storageKey.current) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey.current, answer);
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [answer]);

  const words = countWords(answer);

  return (
    <div className="not-prose my-8 border-2 border-fg bg-surface" style={{ boxShadow: `6px 6px 0px ${accent}` }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-fg px-4 py-2" style={{ backgroundColor: tint(accent, "1c") }}>
        <FontAwesomeIcon icon={faPen} className="text-xs" style={{ color: accent }} aria-hidden />
        <span className="font-mono text-2xs font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: accent }}>
          {title}
        </span>
        <span className="min-w-0 flex-1" />
        <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          {words} words
        </span>
      </div>

      <div className="px-4 pt-4">
        <p className="font-sans text-sm font-bold leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
          {prompt}
        </p>
        <p className="mt-1 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          Write it in your own words first — that is what makes it stick.
        </p>
      </div>

      <div className="px-4 pb-4 pt-3">
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          spellCheck={false}
          rows={5}
          placeholder="Your explanation..."
          className="w-full resize-y border-2 border-fg bg-surface p-3 font-sans text-sm leading-relaxed text-fg focus:outline-none"
          style={{
            fontFamily: TYPOGRAPHY.fontSans,
            backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, color-mix(in srgb, var(--fg) 10%, transparent) 27px, color-mix(in srgb, var(--fg) 10%, transparent) 28px)`,
            lineHeight: "28px",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-4 py-3">
        <button
          type="button"
          onClick={() => setShowModel((value) => !value)}
          className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
        >
          <FontAwesomeIcon icon={faLightbulb} className="text-[10px]" aria-hidden />
          {showModel ? "Hide model answer" : "Compare with model answer"}
        </button>
        {answer.length > 0 && !showModel && (
          <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            autosaved in your browser
          </span>
        )}
      </div>

      {showModel && (
        <div className="border-t-2 p-4" style={{ borderColor: accent, backgroundColor: tint(accent, "12") }}>
          <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, color: accent, letterSpacing: TYPOGRAPHY.tracking.label }}>
            Model answer
          </span>
          <p className="mt-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            {model}
          </p>
        </div>
      )}
    </div>
  );
}
