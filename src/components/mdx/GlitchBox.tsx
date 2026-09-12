"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { resolveAccent, useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface GlitchBoxProps {
  children: ReactNode;
  color?: string;
  label?: string;
  intensity?: "light" | "heavy";
}

export default function GlitchBox({
  children,
  color = "#ffdd00",
  label = "READOUT",
  intensity = "light",
}: GlitchBoxProps) {
  const accent = resolveAccent(color);
  const { copied, copy } = useCopy();
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="glitch-panel not-prose my-8 overflow-hidden border-2"
      style={{ "--glitch-accent": accent } as CSSProperties}
    >
      <div className="glitch-panel-bar flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
        <span className="glitch-dot" aria-hidden />
        <span
          className="font-mono text-2xs font-bold uppercase"
          style={{
            fontFamily: TYPOGRAPHY.fontMono,
            letterSpacing: TYPOGRAPHY.tracking.label,
            color: accent,
          }}
        >
          {label}
        </span>
        <span className="flex-1" />
        <span className="glitch-meter hidden items-end sm:inline-flex" aria-hidden>
          {Array.from({ length: intensity === "heavy" ? 7 : 5 }).map((_, i) => (
            <span key={i} style={{ height: `${4 + ((i * 5) % 12)}px` }} />
          ))}
        </span>
        <button
          type="button"
          onClick={() => copy(bodyRef.current?.textContent ?? "")}
          aria-label={copied ? "Copied" : "Copy readout"}
          className="glitch-copy inline-flex shrink-0 cursor-pointer items-center gap-1 px-1.5 py-0.5 font-mono text-2xs uppercase"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" aria-hidden />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="glitch-scanlines">
        <div
          ref={bodyRef}
          className="glitch-readout px-4 py-4 font-mono text-sm leading-relaxed"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
