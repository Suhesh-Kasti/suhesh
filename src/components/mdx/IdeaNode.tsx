"use client";

import { useRef, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faCopy,
  faCheck,
  faLightbulb,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { resolveAccent, tint, useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface IdeaNodeProps {
  children: ReactNode;
  color?: string;
  label?: string;
}

const VARIANTS = {
  warning: { icon: faTriangleExclamation, label: "Watch out" },
  tip: { icon: faLightbulb, label: "Tip" },
  info: { icon: faCircleInfo, label: "Note" },
};

function variantFor(accent: string) {
  if (["#ff2d95", "#ff1144", "#ff5500"].includes(accent)) return VARIANTS.warning;
  if (["#00dd44", "#ffdd00"].includes(accent)) return VARIANTS.tip;
  return VARIANTS.info;
}

export default function IdeaNode({ children, color = "pink", label }: IdeaNodeProps) {
  const accent = resolveAccent(color);
  const variant = variantFor(accent);
  const { copied, copy } = useCopy();
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <aside className="not-prose relative mx-auto my-10 w-full max-w-2xl sm:-rotate-1">
      <span
        className="absolute -top-2 left-8 z-20 h-4 w-4 rounded-full border-2 border-fg"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <span
        className="absolute -top-1 right-10 z-20 h-3 w-12 -rotate-6 opacity-50"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <span
        className="absolute -bottom-2 right-6 z-20 h-3 w-10 rotate-3 opacity-30"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div
        className="relative border-2 border-fg px-5 pb-4 pt-6"
        style={{ backgroundColor: tint(accent, "14"), boxShadow: `6px 6px 0px ${accent}` }}
      >
        <span
          aria-hidden
          className="absolute right-0 top-0 h-4 w-4 border-b-2 border-l-2 border-fg"
          style={{ background: `linear-gradient(225deg, var(--surf) 48%, ${accent} 52%)` }}
        />

        <div className="mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={variant.icon} className="text-xs" style={{ color: accent }} aria-hidden />
          <span
            className="font-mono text-2xs font-bold uppercase"
            style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: accent }}
          >
            {label ?? variant.label}
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => copy(bodyRef.current?.textContent ?? "")}
            aria-label={copied ? "Copied" : "Copy this note"}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:text-fg"
            style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" aria-hidden />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div
          ref={bodyRef}
          className="font-sans text-sm leading-relaxed text-fg [&_a]:underline [&_code]:border [&_code]:border-fg/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_strong]:font-extrabold [&_strong]:uppercase"
          style={{ fontFamily: TYPOGRAPHY.fontSans }}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}
