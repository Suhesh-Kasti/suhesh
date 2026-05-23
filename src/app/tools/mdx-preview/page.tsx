"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import Accordion from "@/components/mdx/Accordion";
import BrutalButton from "@/components/mdx/BrutalButton";
import IdeaNode from "@/components/mdx/IdeaNode";
import InteractiveCode from "@/components/mdx/InteractiveCode";
import FlipCard from "@/components/mdx/FlipCard";
import GlitchBox from "@/components/mdx/GlitchBox";
import Marquee from "@/components/mdx/Marquee";
import CopyButton from "@/components/mdx/CopyButton";

function parseMdxPreview(raw: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const lines = raw.split("\n");
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^###\s/.test(line)) {
      nodes.push(<h3 key={key++} className="font-mono text-lg font-bold uppercase text-fg mt-6 mb-2" style={{ fontFamily: "var(--font-space-mono)" }}>{line.replace(/^###\s*/, "")}</h3>);
      i++; continue;
    }
    if (/^##\s/.test(line)) {
      nodes.push(<h2 key={key++} className="font-display text-2xl font-bold uppercase text-fg mt-8 mb-3" style={{ fontFamily: "var(--font-clash-display)" }}>{line.replace(/^##\s*/, "")}</h2>);
      i++; continue;
    }
    if (/^#\s/.test(line)) {
      nodes.push(<h1 key={key++} className="font-display text-3xl font-extrabold uppercase text-fg mt-10 mb-4 border-b-2 border-fg pb-2" style={{ fontFamily: "var(--font-clash-display)" }}>{line.replace(/^#\s*/, "")}</h1>);
      i++; continue;
    }

    if (/^>\s/.test(line)) {
      let content = line.replace(/^>\s?/, "");
      i++;
      while (i < lines.length && /^>\s/.test(lines[i])) { content += "\n" + lines[i].replace(/^>\s?/, ""); i++; }
      nodes.push(<blockquote key={key++} className="my-4 border-l-[6px] border-spider-pink pl-4 py-1 font-sans text-sm italic" style={{ fontFamily: "var(--font-syne)" }}>{content}</blockquote>);
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      let code = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code += (code ? "\n" : "") + lines[i]; i++; }
      i++;
      nodes.push(
        <div key={key++} className="my-4 border-2 border-fg shadow-brutal-sm overflow-hidden" style={{ backgroundColor: "var(--surf)" }}>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b-2 border-fg" style={{ backgroundColor: "var(--fg)", color: "var(--surf)" }}>
            <span className="flex gap-1"><span className="w-2 h-2" style={{ backgroundColor: "#ff1144" }} /><span className="w-2 h-2" style={{ backgroundColor: "#ffdd00" }} /><span className="w-2 h-2" style={{ backgroundColor: "#00dd44" }} /></span>
            <span className="font-mono text-2xs uppercase ml-2" style={{ fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}>{lang || "code"}</span>
          </div>
          <pre className="font-mono text-xs p-3 overflow-x-auto whitespace-pre" style={{ fontFamily: "var(--font-space-mono)", color: "var(--fg)" }}>{code}</pre>
        </div>
      );
      continue;
    }

    if (/<Accordion\s+title="([^"]+)"\s*(?:color="([^"]+)")?\s*>/.test(line)) {
      const m = line.match(/<Accordion\s+title="([^"]+)"\s*(?:color="([^"]+)")?\s*>/);
      if (m) {
        let body = ""; i++;
        while (i < lines.length && !lines[i].includes("</Accordion>")) { body += (body ? "\n" : "") + lines[i]; i++; }
        i++;
        nodes.push(<Accordion key={key++} title={m[1]} color={m[2] ?? "#ff2d95"}>{body}</Accordion>);
        continue;
      }
    }

    if (/<BrutalButton/.test(line)) {
      const m = line.match(/<BrutalButton\s*(?:color="([^"]+)")?\s*>(.*?)<\/BrutalButton>/);
      const revealMatch = line.match(/<BrutalButton\s*(?:color="([^"]+)")?\s*reveal="([^"]*)"\s*>(.*?)<\/BrutalButton>/);
      if (revealMatch) {
        nodes.push(<BrutalButton key={key++} color={revealMatch[1]} reveal={<span>{revealMatch[2]}</span>}>{revealMatch[3]}</BrutalButton>);
        i++; continue;
      }
      if (m) { nodes.push(<BrutalButton key={key++} color={m[1]}>{m[2]}</BrutalButton>); i++; continue; }
    }

    if (/<IdeaNode/.test(line)) {
      const m = line.match(/<IdeaNode\s+color="([^"]+)"\s*>(.*?)<\/IdeaNode>/);
      if (m) { nodes.push(<IdeaNode key={key++} color={m[1]}>{m[2]}</IdeaNode>); i++; continue; }
    }

    if (/<GlitchBox/.test(line)) {
      const m = line.match(/<GlitchBox\s*(?:color="([^"]+)")?\s*>(.*?)<\/GlitchBox>/);
      if (m) { nodes.push(<GlitchBox key={key++} color={m[1]}>{m[2]}</GlitchBox>); i++; continue; }
    }

    if (/<FlipCard/.test(line)) {
      const m = line.match(/<FlipCard\s+front="([^"]+)"\s+back="([^"]+)"\s*(?:color="([^"]+)")?\s*\/>/);
      if (m) { nodes.push(<FlipCard key={key++} front={m[1]} back={m[2]} color={m[3]} />); i++; continue; }
    }

    if (/<Marquee/.test(line)) {
      const m = line.match(/<Marquee\s*(?:speed=\{(\d+)\})?\s*>(.*?)<\/Marquee>/);
      if (m) { nodes.push(<Marquee key={key++} speed={parseInt(m[1] ?? "20")}>{m[2]}</Marquee>); i++; continue; }
    }

    if (/<CopyButton\s+text="([^"]+)"\s*(?:label="([^"]+)")?\s*\/>/.test(line)) {
      const m = line.match(/<CopyButton\s+text="([^"]+)"\s*(?:label="([^"]+)")?\s*\/>/);
      if (m) { nodes.push(<CopyButton key={key++} text={m[1]} label={m[2]} />); i++; continue; }
    }

    if (/<QuizCard/.test(line)) {
      nodes.push(<div key={key++} className="my-4 border-2 p-4" style={{ borderColor: "#ffdd00", backgroundColor: "var(--surf)" }}><span className="font-mono text-2xs uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "#ffdd00" }}>[QuizCard — renders on page]</span></div>);
      i += 6; continue;
    }

    if (/<ProgressChecklist/.test(line)) {
      nodes.push(<div key={key++} className="my-4 border-2 p-4" style={{ borderColor: "#ff5500", backgroundColor: "var(--surf)" }}><span className="font-mono text-2xs uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "#ff5500" }}>[ProgressChecklist — renders on page]</span></div>);
      i += 8; continue;
    }

    if (/<InteractiveCode/.test(line)) {
      let code = ""; i++;
      while (i < lines.length && !lines[i].includes("</InteractiveCode>") && !lines[i].includes("/>")) { code += (code ? "\n" : "") + lines[i]; i++; }
      i++;
      nodes.push(<InteractiveCode key={key++} defaultLanguage="bash" defaultValue={code} />);
      continue;
    }

    if (/^---+$/.test(line)) { nodes.push(<hr key={key++} className="my-6 border-0 h-[2px] bg-fg" />); i++; continue; }

    if (line.startsWith("|")) {
      let tableLines = [line]; i++;
      while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split("|").filter(Boolean).map(h => h.trim());
        const rows = tableLines.slice(2).map(r => r.split("|").filter(Boolean).map(c => c.trim()));
        nodes.push(
          <div key={key++} className="my-4 overflow-x-auto">
            <table className="w-full border-collapse border-2 border-fg font-mono text-xs shadow-brutal-sm" style={{ fontFamily: "var(--font-space-mono)" }}>
              <thead><tr>{headers.map((h, hi) => <th key={hi} className="border-2 border-fg px-3 py-1.5 text-left font-bold uppercase text-2xs" style={{ backgroundColor: "var(--fg)", color: "var(--surf)", fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em" }}>{h}</th>)}</tr></thead>
              <tbody>{rows.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="border-2 border-fg px-3 py-1.5" style={{ fontFamily: "var(--font-space-mono)" }}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    const processed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="font-mono text-xs px-1 py-0.5 border" style="font-family:var(--font-space-mono);background-color:var(--fg);color:var(--surf)">$1</code>');

    if (line.trim() === "") { nodes.push(<div key={key++} className="h-3" />); i++; continue; }

    nodes.push(<p key={key++} className="font-sans text-sm leading-relaxed my-1" style={{ fontFamily: "var(--font-syne)", color: "var(--fg)" }} dangerouslySetInnerHTML={{ __html: processed }} />);
    i++;
  }

  return nodes;
}

const DEFAULT_MDX = `# My Security Note

## SQL Injection Discovery

I found a juicy SQLi endpoint today while testing an API.

<Accordion title="The vulnerable payload" color="#ff2d95">
\`\`\`bash
curl 'https://target.com/api?id=1' OR '1'='1'
\`\`\`
</Accordion>

<BrutalButton color="#ffdd00">Exploit this</BrutalButton>

<IdeaNode color="blue">
Always test for blind SQLi — not everything echoes back. Use **time-based** or **boolean-based** techniques.
</IdeaNode>

<GlitchBox>
This content glitches periodically. Perfect for highlighting warnings or gotchas.
</GlitchBox>

| Tool | Purpose |
|------|---------|
| sqlmap | Automated SQLi detection |
| BurpSuite | Manual testing proxy |

<Marquee speed={15}>PATCH YOUR INPUTS — PARAMETERIZE YOUR QUERIES — PATCH YOUR INPUTS</Marquee>

<CopyButton text="SELECT * FROM users" label="Copy SQL" />

<FlipCard front="What is blind SQLi?" back="Injection attacks which are performed by notorius but blind hackers." />
`;

export default function MdxPreviewPage() {
  const [input, setInput] = useState(DEFAULT_MDX);
  const previewNodes = useMemo(() => parseMdxPreview(input), [input]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative w-full py-20" style={{ backgroundColor: "var(--surf)" }}>
          <div className="max-w-full mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4 mb-10">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>MDX Preview</h1>
              <div className="flex-1 h-1" style={{ backgroundColor: "var(--fg)" }} />
              <span className="font-mono text-xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>live editor</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" style={{ minHeight: "80vh" }}>
              {/* Left: Editor */}
              <div className="border-2 border-fg" style={{ backgroundColor: "var(--surf)" }}>
                <div className="px-4 py-2 border-b-2 border-fg flex items-center justify-between" style={{ backgroundColor: "var(--fg)", color: "var(--surf)" }}>
                  <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>input.mdx</span>
                  <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{input.split("\n").length} lines</span>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-[80vh] bg-transparent font-mono text-sm p-4 resize-none focus:outline-none placeholder:text-fg-muted"
                  style={{ color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
                  placeholder="Type MDX content..."
                  spellCheck={false}
                />
              </div>

              {/* Right: Preview */}
              <div className="border-2 border-fg border-l-0" style={{ backgroundColor: "var(--surf)" }}>
                <div className="px-4 py-2 border-b-2 border-fg flex items-center justify-between" style={{ backgroundColor: "var(--fg)", color: "var(--surf)" }}>
                  <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>preview</span>
                  <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>live render</span>
                </div>
                <div className="h-[80vh] overflow-y-auto p-6" style={{ backgroundColor: "var(--surf)" }}>
                  <div className="max-w-[68ch] mx-auto">{previewNodes}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SearchButton />
    </>
  );
}
