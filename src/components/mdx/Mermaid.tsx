"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCode,
  faCompress,
  faCopy,
  faExpand,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { resolveAccent, useCopy } from "@/lib/mdx-ui";
import { useTheme } from "@/components/ThemeProvider";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface MermaidProps {
  chart: string;
  title?: string;
  color?: string;
}

let renderCounter = 0;

async function renderDiagram(chart: string, isDark: boolean, accent: string): Promise<string> {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    fontFamily: "var(--font-space-mono), ui-monospace, monospace",
    flowchart: { useMaxWidth: true, htmlLabels: true },
    sequence: { useMaxWidth: true },
    gantt: { useMaxWidth: true },
    themeVariables: {
      fontSize: "14px",
      background: "transparent",
      primaryColor: accent,
      primaryTextColor: "#0a0a0a",
      primaryBorderColor: "#0a0a0a",
      secondaryColor: isDark ? "#1b1b22" : "#f0f0e8",
      secondaryTextColor: isDark ? "#f0f0f8" : "#0a0a0a",
      tertiaryColor: isDark ? "#12121a" : "#f5f5ee",
      tertiaryTextColor: isDark ? "#f0f0f8" : "#0a0a0a",
      lineColor: isDark ? "#f0f0f8" : "#0a0a0a",
      textColor: isDark ? "#f0f0f8" : "#0a0a0a",
      nodeBorder: "#0a0a0a",
      clusterBkg: isDark ? "#16161d" : "#f2f2ea",
      clusterBorder: isDark ? "#f0f0f8" : "#0a0a0a",
      edgeLabelBackground: isDark ? "#111118" : "#fafaf5",
    },
  });
  const id = `schizo-mermaid-${(renderCounter++).toString(36)}-${Date.now().toString(36)}`;
  const { svg } = await mermaid.render(id, chart.trim());
  return svg;
}

export default function Mermaid({ chart, title = "Diagram", color = "#00e5ff" }: MermaidProps) {
  const accent = resolveAccent(color);
  const { isDark } = useTheme();
  const { copied, copy } = useCopy();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showSource, setShowSource] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    renderDiagram(chart, isDark, accent)
      .then((result) => {
        if (!cancelled) {
          setSvg(result);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not render this diagram");
      });
    return () => {
      cancelled = true;
    };
  }, [chart, isDark, accent]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const renderCanvas = (isFull: boolean) => (
    <div
      data-full={isFull ? "true" : undefined}
      className={`mermaid-viewport relative flex min-h-[180px] w-full cursor-grab touch-pan-y items-center justify-center p-4 active:cursor-grabbing ${isFull ? "h-full overflow-auto" : "max-h-[62vh] overflow-auto"}`}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse") return;
        drag.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        setPan({ x: event.clientX - drag.current.x, y: event.clientY - drag.current.y });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerLeave={() => {
        drag.current = null;
      }}
      onWheel={(event) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        setZoom((value) => Math.min(3, Math.max(0.4, value - event.deltaY * 0.0015)));
      }}
      onDoubleClick={reset}
    >
      {error ? (
        <div className="border-2 p-4 font-mono text-xs" style={{ borderColor: "#ff5500", color: "#ff5500", fontFamily: TYPOGRAPHY.fontMono }}>
          {error}
        </div>
      ) : svg ? (
        <div
          className="mx-auto w-full max-w-[860px] origin-center transition-transform duration-75"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex min-h-[160px] items-center justify-center font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          rendering diagram...
        </div>
      )}
    </div>
  );

  const controls = (
    <>
      <button
        type="button"
        onClick={() => setZoom((value) => Math.min(3, value + 0.2))}
        aria-label="Zoom in"
        className="inline-flex cursor-pointer items-center border border-current px-2 py-0.5 transition-opacity hover:opacity-70"
      >
        <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="text-[10px]" />
      </button>
      <button
        type="button"
        onClick={() => setZoom((value) => Math.max(0.4, value - 0.2))}
        aria-label="Zoom out"
        className="inline-flex cursor-pointer items-center border border-current px-2 py-0.5 transition-opacity hover:opacity-70"
      >
        <FontAwesomeIcon icon={faMagnifyingGlassMinus} className="text-[10px]" />
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label="Reset view"
        className="inline-flex cursor-pointer items-center border border-current px-2 py-0.5 transition-opacity hover:opacity-70"
      >
        <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" />
      </button>
      <button
        type="button"
        onClick={() => setShowSource((value) => !value)}
        aria-pressed={showSource}
        aria-label="Toggle source"
        className="inline-flex cursor-pointer items-center border border-current px-2 py-0.5 transition-opacity hover:opacity-70"
      >
        <FontAwesomeIcon icon={faCode} className="text-[10px]" />
      </button>
      <button
        type="button"
        onClick={() => copy(chart.trim())}
        aria-label={copied ? "Copied" : "Copy diagram source"}
        className="inline-flex cursor-pointer items-center border border-current px-2 py-0.5 transition-opacity hover:opacity-70"
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
      </button>
      <button
        type="button"
        onClick={() => setFullscreen((value) => !value)}
        aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen diagram"}
        className="inline-flex cursor-pointer items-center border border-current px-2 py-0.5 transition-opacity hover:opacity-70"
      >
        <FontAwesomeIcon icon={fullscreen ? faCompress : faExpand} className="text-[10px]" />
      </button>
    </>
  );

  const header = (
    <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-1.5" style={{ backgroundColor: accent, color: "#0a0a0a" }}>
      <span className="min-w-0 flex-1 truncate font-mono text-2xs font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
        {title}
      </span>
      {controls}
    </div>
  );

  return (
    <>
      <div className="not-prose my-8 border-2 border-fg bg-surface" style={{ boxShadow: `6px 6px 0px ${accent}` }}>
        {header}
        {!fullscreen && renderCanvas(false)}
        {showSource && (
          <pre className="max-h-56 overflow-auto border-t-2 border-fg p-3 font-mono text-xs leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {chart.trim()}
          </pre>
        )}
        <div className="border-t-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          drag to pan · ctrl+scroll to zoom · double-click to reset
        </div>
      </div>

      {fullscreen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex flex-col bg-surface" style={{ height: "100dvh" } as CSSProperties}>
            {header}
            <div className="min-h-0 flex-1 overflow-hidden">{renderCanvas(true)}</div>
          </div>,
          document.body
        )}
    </>
  );
}
