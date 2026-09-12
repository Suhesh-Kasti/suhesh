"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faRotateLeft, faEye } from "@fortawesome/free-solid-svg-icons";
import { contrastText, hashText, resolveAccent, tint } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

type Review = "unseen" | "got" | "review";

interface FlipCardProps {
  front?: ReactNode;
  back?: ReactNode;
  color?: string;
}

export default function FlipCard({ front, back, color = "#ff2d95" }: FlipCardProps) {
  const accent = resolveAccent(color);
  const onAccent = contrastText(accent);
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [review, setReview] = useState<Review>("unseen");
  const cardRef = useRef<HTMLDivElement>(null);
  const storageKey = useRef("");

  useEffect(() => {
    const text = cardRef.current?.textContent ?? "";
    if (!text) return;
    storageKey.current = `selfcheck:${hashText(text)}`;
    try {
      const saved = localStorage.getItem(storageKey.current) as Review | null;
      if (saved) setReview(saved);
    } catch {}
  }, []);

  const toggle = () => {
    setFlipped((f) => !f);
    setRevealed(true);
  };

  const mark = (value: Review) => {
    setReview(value);
    setFlipped(false);
    try {
      if (storageKey.current) localStorage.setItem(storageKey.current, value);
    } catch {}
  };

  return (
    <div className="not-prose my-8">
      <div style={{ perspective: "1400px" }}>
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-label={flipped ? "Hide answer" : "Reveal answer"}
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggle();
            }
          }}
          className="grid cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.2, 1.1, 0.3, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="col-start-1 row-start-1 flex flex-col gap-4 border-2 border-fg p-5 shadow-brutal"
            style={{ backfaceVisibility: "hidden", backgroundColor: "var(--surf)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center border-2 border-fg font-mono text-2xs font-bold"
                style={{ backgroundColor: accent, color: onAccent, fontFamily: TYPOGRAPHY.fontMono }}
              >
                Q
              </span>
              <span
                className="font-mono text-2xs uppercase text-fg-muted"
                style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
              >
                Self-check
              </span>
              <span className="flex-1" />
              {review === "got" && (
                <span className="font-mono text-2xs uppercase" style={{ color: "#00dd44", fontFamily: TYPOGRAPHY.fontMono }}>
                  known
                </span>
              )}
            </div>

            <div
              className="flex min-h-[80px] items-center justify-center text-center font-display text-lg font-bold uppercase text-fg"
              style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
            >
              {front}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-fg-muted">
              <FontAwesomeIcon icon={faEye} className="text-[10px]" aria-hidden />
              <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                click to reveal the answer
              </span>
            </div>
          </div>

          <div
            className="col-start-1 row-start-1 flex flex-col gap-4 border-2 p-5 shadow-brutal"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: accent,
              backgroundColor: tint(accent, "12"),
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center border-2 font-mono text-2xs font-bold"
                style={{
                  backgroundColor: accent,
                  color: onAccent,
                  borderColor: accent,
                  fontFamily: TYPOGRAPHY.fontMono,
                }}
              >
                A
              </span>
              <span
                className="font-mono text-2xs uppercase"
                style={{ color: accent, fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
              >
                Answer
              </span>
            </div>

            <div
              className="flex min-h-[80px] items-center justify-center text-center font-sans text-sm leading-relaxed text-fg"
              style={{ fontFamily: TYPOGRAPHY.fontSans }}
            >
              {back}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {revealed ? (
          <>
            <button
              type="button"
              onClick={() => mark("got")}
              className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
              style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
            >
              <FontAwesomeIcon icon={faCheck} className="text-[10px]" aria-hidden />
              I got it
            </button>
            <button
              type="button"
              onClick={() => mark("review")}
              className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg-muted px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
              style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.mono }}
            >
              <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" aria-hidden />
              Review later
            </button>
          </>
        ) : (
          <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Answer it in your head first, then reveal.
          </span>
        )}
        {revealed && review !== "unseen" && (
          <span
            className="font-mono text-2xs uppercase"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
              color: review === "got" ? "#00dd44" : "#ff5500",
            }}
          >
            {review === "got" ? "Saved as known" : "Saved for review"}
          </span>
        )}
      </div>
    </div>
  );
}
