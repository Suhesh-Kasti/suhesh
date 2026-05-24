"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY, MOTION, COLORS } from "@/lib/design-tokens";
import Accordion from "@/components/mdx/Accordion";
import BrutalButton from "@/components/mdx/BrutalButton";
import IdeaNode from "@/components/mdx/IdeaNode";
import InteractiveCode from "@/components/mdx/InteractiveCode";
import FlipCard from "@/components/mdx/FlipCard";
import GlitchBox from "@/components/mdx/GlitchBox";
import ProgressChecklist from "@/components/mdx/ProgressChecklist";
import QuizCard from "@/components/mdx/QuizCard";
import CopyButton from "@/components/mdx/CopyButton";
import Marquee from "@/components/mdx/Marquee";
import DataBar from "@/components/mdx/DataBar";
import ConceptExplorer from "@/components/mdx/ConceptExplorer";

// ── Robust JSON block extraction (brace-matched, not regex) ──

function extractJsonBlock(text: string, key: string): string | null {
  const startMarker = `${key}={`;
  const idx = text.indexOf(startMarker);
  if (idx === -1) return null;

  let i = idx + startMarker.length;
  let depth = 1;
  let inString = false;
  let escaped = false;

  while (i < text.length && depth > 0) {
    const ch = text[i];
    if (escaped) { escaped = false; i++; continue; }
    if (ch === "\\") { escaped = true; i++; continue; }
    if (ch === '"' && !inString) { inString = true; i++; continue; }
    if (ch === '"' && inString) { inString = false; i++; continue; }
    if (!inString) {
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }
    i++;
  }
  if (depth > 0) return null; // unmatched braces

  return text.slice(idx + startMarker.length, i - 1); // exclude the closing }
}

function parseJsonArray(json: string): any[] {
  // Remove JSX-style trailing commas before ] that break JSON.parse
  const cleaned = json
    .replace(/,\s*(\]|\})/g, "$1")  // trailing commas
    .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // unquoted keys
  try {
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

const STORAGE_KEY = "mdx-preview-content";
const DEFAULT_CONTENT = `# My Security Note

## SQL Injection Discovery

I found a juicy SQLi endpoint today.

<Accordion title="The vulnerable payload" color="#ff2d95">
\`\`\`bash
curl 'https://target.com/api?id=1' OR '1'='1'
\`\`\`
</Accordion>

<BrutalButton color="#ffdd00">Exploit this</BrutalButton>

<IdeaNode color="blue">
Always test for blind SQLi — not everything echoes back.
</IdeaNode>

<DataBar
  title="Nmap scan speeds"
  data={[
    {"label":"T0 Paranoid","value":1},
    {"label":"T4 Aggressive","value":100},
    {"label":"T5 Insane","value":250}
  ]}
/>

<ConceptExplorer
  title="SQL Injection Flow"
  steps={[
    {"label":"Find entry point","content":"Look for user input reflected in SQL queries — login forms, search bars, URL params, API endpoints.","highlight":"Recon"},
    {"label":"Test for injection","content":"Add a single quote ' or double quote \" to break the SQL syntax. If you get an error, there's likely SQLi.","highlight":"Probe"},
    {"label":"Determine type","content":"Is it UNION-based, boolean blind, time-based blind, or error-based? Each needs different exploitation.","highlight":"Classify"},
    {"label":"Extract data","content":"Use UNION SELECT to pull database names → tables → columns → rows. Or automated tools like sqlmap.","highlight":"Exploit"}
  ]}
  color="#ff5500"
/>

<GlitchBox>
This is a glitch box. It glitches periodically.
</GlitchBox>

<FlipCard front="Click me" back="I flipped!" />

<Marquee speed={15}>This text scrolls infinitely</Marquee>

<CopyButton text="SELECT * FROM users" label="Copy SQL" />
`;

function parseMdxPreview(raw: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = raw.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (/^###\s/.test(line)) {
      nodes.push(
        <h3 key={key++} className="font-mono text-lg font-bold uppercase text-fg mt-6 mb-2" style={{ fontFamily: "var(--font-space-mono)" }}>{line.replace(/^###\s*/, "")}</h3>
      );
      i++; continue;
    }
    if (/^##\s/.test(line)) {
      nodes.push(
        <h2 key={key++} className="font-display text-2xl font-bold uppercase text-fg mt-8 mb-3" style={{ fontFamily: "var(--font-clash-display)" }}>{line.replace(/^##\s*/, "")}</h2>
      );
      i++; continue;
    }
    if (/^#\s/.test(line)) {
      nodes.push(
        <h1 key={key++} className="font-display text-3xl font-extrabold uppercase text-fg mt-10 mb-4 border-b-2 border-fg pb-2" style={{ fontFamily: "var(--font-clash-display)" }}>{line.replace(/^#\s*/, "")}</h1>
      );
      i++; continue;
    }

    // Blockquote
    if (/^>\s/.test(line)) {
      let content = line.replace(/^>\s?/, "");
      i++;
      while (i < lines.length && /^>\s/.test(lines[i])) {
        content += "\n" + lines[i].replace(/^>\s?/, "");
        i++;
      }
      nodes.push(
        <blockquote key={key++} className="my-4 border-l-[6px] border-spider-pink pl-4 py-1 font-sans text-sm italic" style={{ fontFamily: "var(--font-syne)" }}>{content}</blockquote>
      );
      continue;
    }

    // Code blocks
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      let code = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code += (code ? "\n" : "") + lines[i];
        i++;
      }
      i++;
      nodes.push(
        <div key={key++} className="my-4 border-2 border-fg shadow-brutal-sm overflow-hidden not-prose" style={{ backgroundColor: "var(--surf)" }}>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b-2 border-fg" style={{ backgroundColor: "var(--fg)", color: "var(--surf)" }}>
            <span className="flex gap-1"><span className="w-2 h-2" style={{ backgroundColor: "#ff1144" }} /><span className="w-2 h-2" style={{ backgroundColor: "#ffdd00" }} /><span className="w-2 h-2" style={{ backgroundColor: "#00dd44" }} /></span>
            <span className="font-mono text-2xs uppercase ml-2" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}>{lang || "code"}</span>
          </div>
          <pre className="font-mono text-xs p-3 overflow-x-auto whitespace-pre" style={{ fontFamily: "var(--font-space-mono)", color: "var(--fg)" }}>{code}</pre>
        </div>
      );
      continue;
    }

    // ConceptExplorer — multiline block
    if (/<ConceptExplorer/.test(line)) {
      let block = line;
      i++;
      while (i < lines.length && !lines[i].includes("</ConceptExplorer>")) {
        block += "\n" + lines[i];
        i++;
      }
      if (i < lines.length) { block += "\n" + lines[i]; i++; }

      const titleMatch = block.match(/title="([^"]*)"/);
      const colorMatch = block.match(/color="([^"]*)"/);
      const title = titleMatch?.[1] || "Concept";
      const color = colorMatch?.[1] || "#ff5500";

      const stepsJson = extractJsonBlock(block, "steps");
      const steps: Array<{label:string;content:string;highlight?:string}> = [];
      if (stepsJson) {
        const arr = parseJsonArray(`[${stepsJson}]`);
        for (const item of arr) {
          if (item.label && item.content) steps.push(item);
        }
      }
      if (steps.length === 0) steps.push({ label: "Example", content: "Add steps to see them here" });

      nodes.push(
        <ConceptExplorer key={key++} title={title} steps={steps} color={color} />
      );
      continue;
    }

    // DataBar — multiline block
    if (/<DataBar/.test(line)) {
      let block = line;
      i++;
      while (i < lines.length && !lines[i].includes("</DataBar>") && !lines[i].includes("/>")) {
        block += "\n" + lines[i];
        i++;
      }
      if (i < lines.length) { block += "\n" + lines[i]; i++; }

      const titleMatch = block.match(/title="([^"]*)"/);
      const title = titleMatch?.[1];

      const dataJson = extractJsonBlock(block, "data");
      let data: Array<{label:string;value:number;color?:string}> = [];
      if (dataJson) {
        const arr = parseJsonArray(`[${dataJson}]`);
        for (const item of arr) {
          if (item.label && typeof item.value === "number") data.push(item);
        }
      }

      nodes.push(
        <DataBar key={key++} title={title} data={data.length > 0 ? data : [{label:"Example",value:50}]} />
      );
      continue;
    }

    // Accordion component
    if (/<Accordion\s+title="([^"]*)"\s*(?:color="([^"]*)")?\s*>/.test(line)) {
      const m = line.match(/<Accordion\s+title="([^"]*)"\s*(?:color="([^"]*)")?\s*>/);
      if (m) {
        const title = m[1];
        const color = m[2] ?? "#ff2d95";
        let body = "";
        i++;
        while (i < lines.length && !lines[i].includes("</Accordion>")) {
          body += (body ? "\n" : "") + lines[i];
          i++;
        }
        i++;
        nodes.push(
          <Accordion key={key++} title={title} color={color}>{body}</Accordion>
        );
        continue;
      }
    }

    // BrutalButton component
    if (/<BrutalButton\s*(?:color="([^"]*)")?\s*>/.test(line)) {
      const m = line.match(/<BrutalButton\s*(?:color="([^"]*)")?\s*>(.*?)<\/BrutalButton>/);
      if (m) {
        nodes.push(<BrutalButton key={key++} color={m[1]}>{m[2]}</BrutalButton>);
        i++; continue;
      }
    }

    // IdeaNode
    if (/<IdeaNode\s+color="([^"]*)"\s*>/.test(line)) {
      const m = line.match(/<IdeaNode\s+color="([^"]*)"\s*>(.*?)<\/IdeaNode>/);
      if (m) {
        nodes.push(<IdeaNode key={key++} color={m[1]}>{m[2]}</IdeaNode>);
        i++; continue;
      }
    }

    // GlitchBox
    if (/<GlitchBox/.test(line)) {
      const m = line.match(/<GlitchBox\s*(?:color="([^"]*)")?\s*>(.*?)<\/GlitchBox>/);
      if (m) {
        nodes.push(<GlitchBox key={key++} color={m[1]}>{m[2]}</GlitchBox>);
        i++; continue;
      }
    }

    // FlipCard
    if (/<FlipCard/.test(line)) {
      const m = line.match(/<FlipCard\s+front="([^"]*)"\s+back="([^"]*)"\s*(?:color="([^"]*)")?\s*\/>/);
      if (m) {
        nodes.push(<FlipCard key={key++} front={m[1]} back={m[2]} color={m[3]} />);
        i++; continue;
      }
    }

    // Marquee
    if (/<Marquee/.test(line)) {
      const m = line.match(/<Marquee\s*(?:speed=\{(\d+)\})?\s*>(.*?)<\/Marquee>/);
      if (m) {
        nodes.push(<Marquee key={key++} speed={parseInt(m[1] ?? "20")}>{m[2]}</Marquee>);
        i++; continue;
      }
    }

    // CopyButton
    if (/<CopyButton\s+text="([^"]*)"\s*(?:label="([^"]*)")?\s*\/>/.test(line)) {
      const m = line.match(/<CopyButton\s+text="([^"]*)"\s*(?:label="([^"]*)")?\s*\/>/);
      if (m) {
        nodes.push(<CopyButton key={key++} text={m[1]} label={m[2]} />);
        i++; continue;
      }
    }

    // QuizCard
    if (/<QuizCard/.test(line)) {
      nodes.push(
        <div key={key++} className="my-4 border-2 border-fg p-4" style={{ borderColor: "#ffdd00", backgroundColor: "var(--surf)" }}>
          <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: "var(--font-space-mono)", color: "#ffdd00" }}>QuizCard Preview</span>
          <p className="font-sans text-xs text-fg-muted mt-1" style={{ fontFamily: "var(--font-syne)" }}>Quiz renders fully on the actual page</p>
        </div>
      );
      i += 6;
      continue;
    }

    // ProgressChecklist
    if (/<ProgressChecklist/.test(line)) {
      nodes.push(
        <div key={key++} className="my-4 border-2 border-fg p-4" style={{ borderColor: "#ff5500", backgroundColor: "var(--surf)" }}>
          <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: "var(--font-space-mono)", color: "#ff5500" }}>ProgressChecklist Preview</span>
          <p className="font-sans text-xs text-fg-muted mt-1" style={{ fontFamily: "var(--font-syne)" }}>Checklist renders fully on the actual page</p>
        </div>
      );
      i += 8;
      continue;
    }

    // InteractiveCode
    if (/<InteractiveCode/.test(line)) {
      let code = "";
      let lang = "bash";
      i++;
      while (i < lines.length && !lines[i].includes("</InteractiveCode>") && !lines[i].includes("/>")) {
        code += (code ? "\n" : "") + lines[i];
        i++;
      }
      i++;
      nodes.push(<InteractiveCode key={key++} defaultLanguage={lang} defaultValue={code} />);
      continue;
    }

    // HR
    if (/^---+$/.test(line)) {
      nodes.push(<hr key={key++} className="my-6 border-0 h-[2px] bg-fg" />);
      i++; continue;
    }

    // Table
    if (line.startsWith("|")) {
      let tableLines = [line];
      i++;
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headerLine = tableLines[0];
        const headers = headerLine.split("|").filter(Boolean).map(h => h.trim());
        const rows = tableLines.slice(2).map(r => r.split("|").filter(Boolean).map(c => c.trim()));
        nodes.push(
          <div key={key++} className="my-4 overflow-x-auto not-prose">
            <table className="w-full border-collapse border-2 border-fg font-mono text-xs shadow-brutal-sm" style={{ fontFamily: "var(--font-space-mono)" }}>
              <thead>
                <tr>{headers.map((h, hi) => <th key={hi} className="border-2 border-fg px-3 py-1.5 text-left font-bold uppercase text-2xs" style={{ backgroundColor: "var(--fg)", color: "var(--surf)", fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="border-2 border-fg px-3 py-1.5" style={{ fontFamily: "var(--font-space-mono)" }}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Bold/italic/code
    const boldLine = line.replace(/\*\*(.+?)\*\*/g, (_, text) => `<strong>${text}</strong>`);
    const emLine = boldLine.replace(/\*(.+?)\*/g, (_, text) => `<em>${text}</em>`);
    const codeLine = emLine.replace(/`(.+?)`/g, (_, text) =>
      `<code class="font-mono text-xs px-1 py-0.5 border" style="font-family:var(--font-space-mono);background-color:var(--fg);color:var(--surf);border-color:var(--fg)">${text}</code>`
    );

    if (line.trim() === "") {
      nodes.push(<div key={key++} className="h-3" />);
      i++; continue;
    }

    nodes.push(
      <p key={key++} className="font-sans text-sm leading-relaxed my-1" style={{ fontFamily: "var(--font-syne)", color: "var(--fg)" }}
        dangerouslySetInnerHTML={{ __html: codeLine }}
      />
    );
    i++;
  }

  return nodes;
}

export default function MdxPreviewTool() {
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      setInput(saved && saved.length > 0 ? saved : DEFAULT_CONTENT);
      setMounted(true);
    }
  }, []);

  // Auto-save to localStorage on changes (debounced)
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, input);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 1500);
    }, 500);
    return () => clearTimeout(timer);
  }, [input, mounted]);

  const previewNodes = useMemo(() => parseMdxPreview(input), [input]);

  const handleReset = useCallback(() => {
    setInput(DEFAULT_CONTENT);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  if (!mounted) {
    return <div className="border-2 border-fg p-8 text-center font-mono text-sm text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Loading editor...</div>;
  }

  return (
    <div className="border-2 border-fg shadow-brutal bg-surface">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-fg bg-fg text-surface">
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>MDX live preview</span>
          <motion.span
            className="font-mono text-2xs"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: savedIndicator ? "#00dd44" : "transparent" }}
            animate={{ opacity: savedIndicator ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            SAVED ✓
          </motion.span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xs text-white/50" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{input.length} chars</span>
          <button
            onClick={handleReset}
            className="font-mono text-2xs uppercase border border-white/30 px-2 py-0.5 hover:bg-white/10 transition-colors cursor-pointer"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Editor + Preview split */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-fg" style={{ minHeight: "85vh" }}>
        <div className="p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-full min-h-[85vh] bg-transparent border-2 border-fg font-mono text-sm p-3 resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
            style={{ color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
            placeholder="Type MDX content..."
            spellCheck={false}
          />
        </div>
        <div className="p-4 overflow-y-auto" style={{ backgroundColor: "var(--surf)", minHeight: "85vh", maxHeight: "90vh" }}>
          <div className="prose-brutal mx-auto">{previewNodes}</div>
        </div>
      </div>
    </div>
  );
}
