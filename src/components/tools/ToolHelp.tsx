"use client";

import { useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faChevronDown, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { TYPOGRAPHY } from "@/lib/design-tokens";

export interface HelpTerm {
  term: string;
  meaning: string;
}

export interface HelpExample {
  label: string;
  value?: string;
  detail?: string;
}

interface ToolHelpProps {
  title?: string;
  intro: string;
  steps?: string[];
  terms?: HelpTerm[];
  examples?: HelpExample[];
  notes?: string[];
  defaultOpen?: boolean;
  children?: ReactNode;
}

/** Inline term with a hover explanation. */
export function InfoTerm({ term, meaning, children }: { term: string; meaning: string; children?: ReactNode }) {
  return (
    <span className="group relative inline-block cursor-help border-b border-dashed border-fg-muted/60">
      {children ?? term}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-50 mb-1 hidden w-64 border-2 border-fg p-2 shadow-brutal group-hover:block"
        style={{ backgroundColor: "var(--surf)" }}
      >
        <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--pink)" }}>
          {term}
        </span>
        <span className="mt-1 block font-sans text-xs leading-snug text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
          {meaning}
        </span>
      </span>
    </span>
  );
}

export default function ToolHelp({
  title = "How to use",
  intro,
  steps = [],
  terms = [],
  examples = [],
  notes = [],
  defaultOpen = false,
  children,
}: ToolHelpProps) {
  const [open, setOpen] = useState(defaultOpen);
  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const heading = "font-mono text-2xs uppercase text-fg-muted";

  return (
    <div className="not-prose my-6 border-2 border-fg" style={{ backgroundColor: "var(--surf)" }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors"
        style={{ backgroundColor: "color-mix(in srgb, var(--fg) 6%, transparent)" }}
        data-cursor-label={open ? "Hide help" : "Show help"}
      >
        <FontAwesomeIcon icon={faBookOpen} className="text-xs" style={{ color: "var(--pink)" }} />
        <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--pink)" }}>
          {title}
        </span>
        <span className="flex-1" />
        <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
          {open ? "hide" : "learn"}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="text-2xs text-fg-muted transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="space-y-5 border-t-2 border-fg p-4">
          <p className="font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            {intro}
          </p>

          {steps.length > 0 && (
            <div>
              <span className={heading} style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                How to use it
              </span>
              <ol className="mt-2 space-y-1.5">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-2 font-sans text-sm leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                    <span className="font-mono text-2xs" style={{ ...mono, color: "var(--pink)" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {examples.length > 0 && (
            <div>
              <span className={heading} style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Examples
              </span>
              <div className="mt-2 space-y-2">
                {examples.map((example) => (
                  <div key={example.label} className="border border-fg-muted/30 p-2.5">
                    <span className="font-mono text-2xs uppercase text-fg" style={{ ...mono }}>
                      {example.label}
                    </span>
                    {example.value && (
                      <pre className="mt-1 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-fg-muted" style={mono}>
                        {example.value}
                      </pre>
                    )}
                    {example.detail && (
                      <p className="mt-1 font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                        {example.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {terms.length > 0 && (
            <div>
              <span className={heading} style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Glossary
              </span>
              <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {terms.map((item) => (
                  <div key={item.term} className="border-l-2 border-fg-muted/30 pl-2.5">
                    <span className="font-mono text-2xs uppercase" style={{ ...mono, color: "var(--pink)" }}>
                      {item.term}
                    </span>
                    <p className="mt-0.5 font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                      {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notes.length > 0 && (
            <div>
              <span className={heading} style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Good to know
              </span>
              <ul className="mt-2 space-y-1.5">
                {notes.map((note, index) => (
                  <li key={index} className="flex gap-2 font-sans text-sm leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                    <FontAwesomeIcon icon={faLightbulb} className="mt-1 text-[10px]" style={{ color: "#ffdd00" }} />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {children}
        </div>
      )}
    </div>
  );
}
