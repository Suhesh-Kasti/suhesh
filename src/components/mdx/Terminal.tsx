"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { resolveAccent } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface TerminalProps {
  title?: string;
  command: string;
  output: string;
  color?: string;
  prompt?: string;
}

export default function Terminal({
  title = "shell",
  command,
  output,
  color = "#00dd44",
  prompt = "user@schizo",
}: TerminalProps) {
  const accent = resolveAccent(color);
  const [typed, setTyped] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const run = () => {
    if (timer.current) clearTimeout(timer.current);
    setTyped(0);
    setRunning(true);
    const step = Math.max(1, Math.ceil(output.length / 80));
    let shown = 0;
    const tick = () => {
      shown = Math.min(output.length, shown + step);
      setTyped(shown);
      if (shown < output.length) {
        timer.current = setTimeout(tick, 16);
      } else {
        timer.current = null;
        setRunning(false);
      }
    };
    timer.current = setTimeout(tick, 140);
  };

  const reset = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setTyped(0);
    setRunning(false);
  };

  const started = typed > 0 || running;

  return (
    <div
      className="terminal not-prose my-8 overflow-hidden border-2 border-fg"
      style={{ "--term-accent": accent, backgroundColor: "#0b0b0f" } as CSSProperties}
    >
      <div className="terminal-bar flex flex-wrap items-center gap-2 px-3 py-2">
        <span className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ff1144" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ffdd00" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#00dd44" }} />
        </span>
        <span
          className="min-w-0 flex-1 truncate font-mono text-2xs uppercase"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: accent }}
        >
          {title}
        </span>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="terminal-btn inline-flex cursor-pointer items-center gap-1.5 border px-2 py-0.5 font-mono text-2xs uppercase disabled:opacity-40"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          <FontAwesomeIcon icon={faPlay} className="text-[9px]" aria-hidden />
          Run
        </button>
        <button
          type="button"
          onClick={reset}
          className="terminal-btn inline-flex cursor-pointer items-center gap-1.5 border px-2 py-0.5 font-mono text-2xs uppercase"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-[9px]" aria-hidden />
          Clear
        </button>
      </div>

      <div className="px-4 py-4 font-mono text-xs leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
        <div className="whitespace-pre-wrap break-all">
          <span style={{ color: accent }}>{prompt}</span>
          <span style={{ color: "#8a8a95" }}>:~$ </span>
          <span style={{ color: "#e8e8ee" }}>{command}</span>
        </div>
        {started && (
          <pre className="mt-2 whitespace-pre-wrap break-all" style={{ color: "#c8c8d2" }}>
            {output.slice(0, typed)}
            {running && <span className="terminal-cursor" />}
          </pre>
        )}
      </div>
    </div>
  );
}
