"use client";

import { useState, useCallback, useMemo } from "react";
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

// Rough parser: converts MDX-like content to React elements
// Recognizes our custom component tags and basic markdown
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
      i++; // skip closing ```
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
        i++; // skip closing
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

    // QuizCard — simplified preview
    if (/<QuizCard/.test(line)) {
      nodes.push(
        <div key={key++} className="my-4 border-2 border-fg p-4" style={{ borderColor: "#ffdd00", backgroundColor: "var(--surf)" }}>
          <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: "var(--font-space-mono)", color: "#ffdd00" }}>QuizCard Preview</span>
          <p className="font-sans text-xs text-fg-muted mt-1" style={{ fontFamily: "var(--font-syne)" }}>Quiz renders fully on the actual page</p>
        </div>
      );
      i += 6; // skip quiz block
      continue;
    }

    // ProgressChecklist — simplified preview
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

    // Horizontal rule
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

    // Bold text
    const boldLine = line.replace(/\*\*(.+?)\*\*/g, (_, text) => `<strong>${text}</strong>`);
    const emLine = boldLine.replace(/\*(.+?)\*/g, (_, text) => `<em>${text}</em>`);
    const codeLine = emLine.replace(/`(.+?)`/g, (_, text) =>
      `<code class="font-mono text-xs px-1 py-0.5 border" style="font-family:var(--font-space-mono);background-color:var(--fg);color:var(--surf);border-color:var(--fg)">${text}</code>`
    );

    // Empty line
    if (line.trim() === "") {
      nodes.push(<div key={key++} className="h-3" />);
      i++; continue;
    }

    // Regular paragraph
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
  const [input, setInput] = useState(`# My Security Note

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

| Tool | Purpose |
|------|---------|
| sqlmap | Automated SQLi detection |
| BurpSuite | Manual testing proxy |

<GlitchBox>
This is a glitch box. It glitches periodically.
</GlitchBox>

<FlipCard front="Click me" back="I flipped!" />

<Marquee speed={15}>This text scrolls infinitely</Marquee>

<CopyButton text="SELECT * FROM users" label="Copy SQL" />
`);

  const previewNodes = useMemo(() => parseMdxPreview(input), [input]);

  return (
    <div className="border-2 border-fg shadow-brutal bg-surface">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-fg bg-fg text-surface">
        <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>MDX live preview</span>
        <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>editor</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-fg">
        {/* Left: editor */}
        <div className="p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[70vh] bg-transparent border-2 border-fg font-mono text-sm p-3 resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
            style={{ color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
            placeholder="Type MDX content..."
            spellCheck={false}
          />
        </div>
        {/* Right: preview */}
        <div className="p-4 h-[70vh] overflow-y-auto" style={{ backgroundColor: "var(--surf)" }}>
          <div className="prose-brutal mx-auto">{previewNodes}</div>
        </div>
      </div>
    </div>
  );
}
