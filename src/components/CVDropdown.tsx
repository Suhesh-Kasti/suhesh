"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faDownload } from "@fortawesome/free-solid-svg-icons";

interface CVOption {
  label: string;
  href: string;
  color: string;
  description: string;
}

interface CVDropdownProps {
  variant?: "hero" | "about" | "footer";
  label?: string;
  options: ReadonlyArray<CVOption>;
}

export default function CVDropdown({ variant = "hero", label = "Download CV", options }: CVDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; width: number; openUp: boolean } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLButtonElement>(null);
  const frame = useRef(0);

  const primary = options[0];
  const isHero = variant === "hero";
  const isAbout = variant === "about";

  const updatePosition = useCallback(() => {
    const element = triggerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left), window.innerWidth - width - 12);
    const openUp = rect.bottom + 320 > window.innerHeight && rect.top > 320;
    setPos({
      left,
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      width,
      openUp,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        updatePosition();
      });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        caretRef.current?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (document.getElementById("cv-versions-panel")?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [open, updatePosition]);

  const primaryClass = isHero
    ? "inline-flex items-center gap-2 border-2 border-fg bg-brutal-yellow px-7 py-4 font-display text-lg font-extrabold uppercase text-[#0a0a0a] shadow-brutal transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
    : isAbout
      ? "inline-flex items-center gap-2 border-2 border-fg px-5 py-2.5 font-display text-sm font-bold uppercase text-fg transition-colors hover:bg-fg hover:text-surface"
      : "inline-flex items-center gap-1.5 border border-fg-muted/30 px-2 py-1 font-mono text-xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg";

  const caretClass = isHero
    ? "inline-flex items-center border-2 border-l-0 border-fg bg-brutal-yellow px-3 text-[#0a0a0a] shadow-brutal transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none"
    : isAbout
      ? "inline-flex items-center border-2 border-l-0 border-fg px-3 text-fg transition-colors hover:bg-fg hover:text-surface"
      : "inline-flex items-center border border-l-0 border-fg-muted/30 px-1.5 py-1 text-fg-muted transition-colors hover:border-fg hover:text-fg";

  return (
    <div ref={triggerRef} className={`relative inline-block align-middle ${isAbout ? "mt-6" : ""}`}>
      <div className="inline-flex items-stretch">
        <a
          href={primary.href}
          download
          className={primaryClass}
          style={{
            fontFamily: isHero || isAbout ? TYPOGRAPHY.fontDisplay : TYPOGRAPHY.fontMono,
            letterSpacing: isHero || isAbout ? TYPOGRAPHY.tracking.wide : TYPOGRAPHY.tracking.label,
          }}
          data-cursor-label={label}
        >
          <FontAwesomeIcon icon={faDownload} className={isHero ? "text-base" : "text-xs"} />
          {label}
        </a>

        <button
          ref={caretRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Other CV versions"
          className={caretClass}
          data-cursor-label="CV versions"
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className={isHero ? "text-sm" : "text-2xs"}
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s ease" }}
          />
        </button>
      </div>

      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="cv-versions-panel"
            role="menu"
            className="border-2 border-fg shadow-brutal-xl"
            style={
              {
                position: "fixed",
                left: pos.left,
                top: pos.top,
                width: pos.width,
                zIndex: 9999,
                transform: pos.openUp ? "translateY(-100%)" : undefined,
                backgroundColor: "var(--surf)",
                animation: "cv-panel-in 140ms ease-out",
              } as CSSProperties
            }
          >
            <div className="flex items-center gap-2 border-b-2 border-fg bg-fg px-3 py-1.5 text-surface">
              <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
              <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                CV versions
              </span>
            </div>

            <div className="max-h-[min(60vh,320px)] overflow-y-auto p-1.5">
              {options.map((option, index) => (
                <a
                  key={option.label}
                  href={option.href}
                  download
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-2.5 px-2.5 py-2 transition-colors hover:bg-fg"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 border-2" style={{ borderColor: option.color, backgroundColor: `${option.color}33` }} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display text-xs font-extrabold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: option.color }}>
                        {option.label}
                      </span>
                      {index === 0 && (
                        <span className="border px-1 font-mono text-2xs uppercase" style={{ borderColor: option.color, color: option.color, fontFamily: TYPOGRAPHY.fontMono }}>
                          recommended
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block font-sans text-2xs leading-snug text-fg-muted transition-colors group-hover:text-surface/80" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                      {option.description}
                    </span>
                  </span>
                  <FontAwesomeIcon icon={faDownload} className="mt-1 text-[10px] text-fg-muted opacity-0 transition-opacity group-hover:text-surface group-hover:opacity-100" />
                </a>
              ))}
            </div>

            <p className="border-t border-fg-muted/20 px-3 py-2 font-sans text-2xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
              Not sure? The standard CV covers both roles.
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}
