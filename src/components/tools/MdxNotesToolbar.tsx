"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faCheck,
  faCode,
  faCopy,
  faDownload,
  faHeading,
  faItalic,
  faLink,
  faListUl,
  faMinus,
  faPlus,
  faTable,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface MdxNotesToolbarProps {
  onWrap: (before: string, after?: string) => void;
  onSnippet: (snippet: string) => void;
  onCopy: () => void;
  onDownload: () => void;
  onImport: (file: File) => void;
  onLoadStory: () => void;
  copied: boolean;
  stats: { words: number; chars: number; lines: number; minutes: number };
}

const SNIPPETS: { label: string; snippet: string }[] = [
  { label: "IdeaNode", snippet: `<IdeaNode color="green">\nNote text here.\n</IdeaNode>\n\n` },
  { label: "Accordion", snippet: `<Accordion title="Section title" color="#00cc55">\nContent here.\n</Accordion>\n\n` },
  { label: "Code block", snippet: "```bash\ncommand --flag\n```\n\n" },
  { label: "Cloze", snippet: `<Cloze\n  title="Active recall"\n  text="The answer is {{42}}."\n/>\n\n` },
  { label: "QuizCard", snippet: `<QuizCard\n  title="Checkpoint"\n  questions={[\n    {"question":"Question?","options":["A","B"],"correct":0,"explanation":"Why."}\n  ]}\n/>\n\n` },
  { label: "Mermaid", snippet: "<Mermaid\n  title=\"Diagram\"\n  chart={`flowchart TD\n    A[\"Start\"] --> B[\"End\"]\n  `}\n/>\n\n" },
  { label: "CommandBuilder", snippet: `<CommandBuilder\n  title="Builder"\n  command="nmap"\n  target="10.10.10.10"\n  options={[\n    {"flag":"-sV","label":"Version detection","on":true}\n  ]}\n/>\n\n` },
  { label: "Terminal", snippet: `<Terminal\n  title="shell"\n  command="whoami"\n  output={"root"}\n/>\n\n` },
  { label: "FlipCard", snippet: `<FlipCard front="Question?" back="Answer." color="#ff2d95" />\n\n` },
  { label: "MatchPairs", snippet: `<MatchPairs\n  title="Match them"\n  pairs={[\n    {"term":"Term","match":"Definition"}\n  ]}\n/>\n\n` },
  { label: "Table", snippet: "| Column | Column |\n|--------|--------|\n| value | value |\n\n" },
  { label: "Divider", snippet: "\n---\n\n" },
];

export default function MdxNotesToolbar({
  onWrap,
  onSnippet,
  onCopy,
  onDownload,
  onImport,
  onLoadStory,
  copied,
  stats,
}: MdxNotesToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const element = detailsRef.current;
    if (!element) return;
    const onToggle = () => setMenuOpen(element.open);
    element.addEventListener("toggle", onToggle);
    return () => element.removeEventListener("toggle", onToggle);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => {
      detailsRef.current?.removeAttribute("open");
      setMenuOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const button =
    "inline-flex cursor-pointer items-center gap-1 border border-fg-muted/40 px-2 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg";

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b-2 border-fg px-3 py-2" style={{ backgroundColor: "color-mix(in srgb, var(--fg) 5%, transparent)" }}>
      <button type="button" className={button} onClick={() => onWrap("## ", "")} aria-label="Heading" data-cursor-label="Heading">
        <FontAwesomeIcon icon={faHeading} className="text-[10px]" />
      </button>
      <button type="button" className={button} onClick={() => onWrap("**")} aria-label="Bold" data-cursor-label="Bold">
        <FontAwesomeIcon icon={faBold} className="text-[10px]" />
      </button>
      <button type="button" className={button} onClick={() => onWrap("*")} aria-label="Italic" data-cursor-label="Italic">
        <FontAwesomeIcon icon={faItalic} className="text-[10px]" />
      </button>
      <button type="button" className={button} onClick={() => onWrap("`")} aria-label="Inline code" data-cursor-label="Inline code">
        <FontAwesomeIcon icon={faCode} className="text-[10px]" />
      </button>
      <button type="button" className={button} onClick={() => onWrap("[", "](https://)")} aria-label="Link" data-cursor-label="Link">
        <FontAwesomeIcon icon={faLink} className="text-[10px]" />
      </button>
      <button type="button" className={button} onClick={() => onWrap("- ", "")} aria-label="List" data-cursor-label="List">
        <FontAwesomeIcon icon={faListUl} className="text-[10px]" />
      </button>
      <button type="button" className={button} onClick={() => onSnippet("| Column | Column |\n|--------|--------|\n| value | value |\n\n")} aria-label="Table" data-cursor-label="Table">
        <FontAwesomeIcon icon={faTable} className="text-[10px]" />
      </button>
      <button type="button" className={button} onClick={() => onSnippet("\n---\n\n")} aria-label="Divider" data-cursor-label="Divider">
        <FontAwesomeIcon icon={faMinus} className="text-[10px]" />
      </button>

      <details ref={detailsRef} className="relative">
        <summary className={`${button} list-none`} data-cursor-label="Insert widget">
          <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
          widget
        </summary>
        <div className="absolute left-0 top-full z-40 mt-1 max-h-72 w-56 overflow-auto border-2 border-fg bg-surface shadow-brutal">
          {SNIPPETS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(event) => {
                onSnippet(item.snippet);
                (event.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
              }}
              className="block w-full cursor-pointer px-3 py-1.5 text-left font-mono text-2xs uppercase text-fg-muted transition-colors hover:bg-fg hover:text-surface"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </details>

      <span className="mx-1 hidden h-4 w-px bg-fg-muted/30 sm:block" />

      <button
        type="button"
        className={button}
        onClick={onCopy}
        data-cursor-label="Copy MDX"
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
        {copied ? "copied" : "copy mdx"}
      </button>
      <button type="button" className={button} onClick={onDownload} data-cursor-label="Download .mdx">
        <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
        .mdx
      </button>
      <button type="button" className={button} onClick={() => fileRef.current?.click()} data-cursor-label="Import .mdx">
        <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
        import
      </button>
      <button type="button" className={button} onClick={onLoadStory} data-cursor-label="Load story">
        example
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".mdx,.md,.markdown,text/markdown,text/plain"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImport(file);
          event.target.value = "";
        }}
      />

      <span className="flex-1" />

      <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
        {stats.words}w · {stats.lines}L · {stats.minutes} min
      </span>
    </div>
  );
}
