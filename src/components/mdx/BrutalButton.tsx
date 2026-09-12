"use client";

import { useRef, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { contrastText, resolveAccent, tint, useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface BrutalButtonProps {
  children: ReactNode;
  color?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  copy?: string;
}

const SIZE_MAP = {
  sm: "text-xs px-4 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

export default function BrutalButton({
  children,
  color = "#ffdd00",
  size = "md",
  href,
  copy,
}: BrutalButtonProps) {
  const accent = resolveAccent(color);
  const onAccent = contrastText(accent);
  const { copied, copy: copyToClipboard } = useCopy();
  const bodyRef = useRef<HTMLDivElement>(null);

  const actionClass = `inline-flex items-center gap-2 border-2 border-fg font-bold uppercase shadow-brutal transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer ${SIZE_MAP[size]}`;
  const actionStyle = {
    fontFamily: TYPOGRAPHY.fontDisplay,
    letterSpacing: TYPOGRAPHY.tracking.wide,
    backgroundColor: accent,
    color: onAccent,
  };

  if (href) {
    return (
      <div className="not-prose my-5">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClass}
          style={actionStyle}
          data-cursor-label="Open link"
        >
          {children}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" aria-hidden />
        </a>
      </div>
    );
  }

  if (copy) {
    const copyText = () => copyToClipboard(copy || bodyRef.current?.textContent || "");
    return (
      <div className="not-prose my-5">
        <div
          role="button"
          tabIndex={0}
          onClick={copyText}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              copyText();
            }
          }}
          className={actionClass}
          style={actionStyle}
          data-cursor-label={copied ? "Copied" : "Copy"}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-xs" aria-hidden />
          <div ref={bodyRef} className="[&_p]:m-0 [&_p]:inline">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="not-prose my-5 flex items-stretch border-2 border-fg"
      style={{ backgroundColor: tint(accent, "12") }}
    >
      <span className="w-1.5 shrink-0" style={{ backgroundColor: accent }} aria-hidden />
      <div
        className="px-4 py-3 font-sans text-sm font-bold leading-relaxed text-fg [&_p]:m-0 [&_p]:max-w-none [&_p]:text-sm [&_p]:font-bold [&_p]:leading-relaxed"
        style={{ fontFamily: TYPOGRAPHY.fontSans }}
      >
        {children}
      </div>
    </div>
  );
}
