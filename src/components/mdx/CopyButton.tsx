"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface CopyButtonProps {
  text: string;
  label?: string;
  preview?: boolean;
}

function deriveLabel(text: string): string {
  const first = text.trim().split("\n")[0].replace(/^[#/\s>]+/, "").trim();
  if (!first) return "Copy";
  return first.length > 38 ? `${first.slice(0, 38)}...` : first;
}

export default function CopyButton({ text, label, preview = false }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  const [expanded, setExpanded] = useState(true);
  const shown = label ?? (preview ? deriveLabel(text) : "Copy");
  const lines = text.split("\n").length;

  if (!preview) {
    return (
      <button
        type="button"
        onClick={() => copy(text)}
        className="cursor-pointer border border-fg-muted px-2 py-1 font-mono text-2xs uppercase text-fg-muted transition-all hover:border-fg hover:bg-fg hover:text-surface active:translate-x-0.5 active:translate-y-0.5"
        style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        data-cursor-label={copied ? "Copied!" : "Copy"}
      >
        {copied ? "[COPIED]" : `[${shown}]`}
      </button>
    );
  }

  return (
    <div className="not-prose my-4 border-2 border-fg">
      <div className="flex items-center gap-2 border-b-2 border-fg bg-fg px-3 py-1.5 text-surface">
        <span
          className="min-w-0 flex-1 truncate font-mono text-2xs uppercase"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          {shown}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 border border-current px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className="text-[9px] transition-transform"
            style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}
            aria-hidden
          />
          {lines} lines
        </button>
        <button
          type="button"
          onClick={() => copy(text)}
          className="inline-flex shrink-0 cursor-pointer items-center border border-current px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          {copied ? "[COPIED]" : "[COPY]"}
        </button>
      </div>
      {expanded && (
        <pre
          className="max-h-64 overflow-auto whitespace-pre p-3 font-mono text-xs leading-relaxed text-fg"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
        >
          {text}
        </pre>
      )}
    </div>
  );
}
