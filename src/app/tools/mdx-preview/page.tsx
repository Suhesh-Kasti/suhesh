"use client";

import { useState, useMemo, useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import MdxNotesToolbar from "@/components/tools/MdxNotesToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import Accordion from "@/components/mdx/Accordion";
import BrutalButton from "@/components/mdx/BrutalButton";
import IdeaNode from "@/components/mdx/IdeaNode";
import InteractiveCode from "@/components/mdx/InteractiveCode";
import FlipCard from "@/components/mdx/FlipCard";
import GlitchBox from "@/components/mdx/GlitchBox";
import Marquee from "@/components/mdx/Marquee";
import CopyButton from "@/components/mdx/CopyButton";
import DataBar from "@/components/mdx/DataBar";
import ConceptExplorer, { type ConceptStep } from "@/components/mdx/ConceptExplorer";
import CommandBuilder, { type CommandOption } from "@/components/mdx/CommandBuilder";
import Terminal from "@/components/mdx/Terminal";
import Cloze from "@/components/mdx/Cloze";
import SelfExplain from "@/components/mdx/SelfExplain";
import Sequence from "@/components/mdx/Sequence";
import MatchPairs, { type MatchPair } from "@/components/mdx/MatchPairs";
import QuizCard, { type QuizQuestion } from "@/components/mdx/QuizCard";
import ProgressChecklist from "@/components/mdx/ProgressChecklist";
import Mermaid from "@/components/mdx/Mermaid";

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
  if (depth > 0) return null;
  return text.slice(idx + startMarker.length, i - 1);
}

function parseJsonArray<T = unknown>(json: string): T[] {
  const trimmed = json.trim();
  const candidate = trimmed.startsWith("[") ? trimmed : `[${trimmed}]`;
  const cleaned = candidate
    .replace(/,\s*(\]|\})/g, "$1")
    .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function extractAttribute(text: string, key: string): string | null {
  const match = text.match(
    new RegExp(`${key}=(?:\\{\`([\\s\\S]*?)\`\\}|\\{"([\\s\\S]*?)"\\}|"([^"]*)")`)
  );
  return match ? (match[1] ?? match[2] ?? match[3] ?? null) : null;
}

function parseStringArray(json: string): string[] {
  const trimmed = json.trim();
  const candidate = trimmed.startsWith("[") ? trimmed : `[${trimmed}]`;
  const cleaned = candidate.replace(/,\s*(\]|\})/g, "$1");
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
}

const STORAGE_KEY = "mdx-preview-content-v3";
const DEFAULT_MDX = `# Notes From a Very Normal Developer

A completely serious document about absolutely nothing in particular.

<IdeaNode color="green">**This page is a playground.** Every block below is a real widget. Poke them. The middle bar resizes, and the expand icons go fullscreen.</IdeaNode>

> There are two hard problems in computer science: cache invalidation, naming things, and off-by-one errors.

## The mandatory diagram

<Mermaid
  title="How I debug"
  color="#00e5ff"
  chart={\`flowchart TD
    A["It does not work"] --> B["That is weird"]
    B --> C["It works now"]
    C --> D["I changed nothing"]
    D --> E["I changed everything"]
    E --> A
  \`}
/>

<Marquee speed={4} color="#00e5ff">DO NOT TOUCH IT · IT WORKS · DO NOT TOUCH IT</Marquee>

## The order of operations

<Sequence
  title="Allegedly the correct order"
  color="#00dd44"
  steps={[
    "Read the error message",
    "Ignore the error message",
    "Change random things",
    "It works somehow",
    "Never touch it again"
  ]}
/>

## Vocabulary

<MatchPairs
  title="Professional terminology"
  color="#8800ff"
  pairs={[
    {"term": "Works on my machine", "match": "Four words that ended a thousand arguments"},
    {"term": "Quick fix", "match": "A change that will still be here in 2038"},
    {"term": "Temporary", "match": "Permanent, but with more guilt"}
  ]}
/>

## Fill in the blanks

<Cloze
  title="Complete the sentence"
  color="#00e5ff"
  text="It works on my {{machine}}. The bug is a {{feature}}. I will fix it {{tomorrow}}."
/>

## Explain yourself

<SelfExplain
  color="#ffdd00"
  prompt="Explain to a rubber duck why you added that console.log."
  model="Because staring at the code was not working and the duck does not judge. It was removed three commits later, quietly."
/>

## Watch it run

<Terminal
  title="inspiration"
  command="npm run dev"
  output={"ready - started server on 0.0.0.0:3000\\ncompiled with 0 warnings\\n... 47 warnings\\ncompiled successfully, probably"}
  color="#00cc55"
/>

## Build a command you will never run

<CommandBuilder
  title="The nuclear option"
  command="npm install"
  target="left-pad"
  color="#ff1144"
  options={[
    {"flag":"--force","label":"Ignore all warnings","on":true},
    {"flag":"--legacy-peer-deps","label":"Summon ancient chaos"}
  ]}
/>

## Spot the bug

<Accordion title="This function is fine, trust me" color="#ff2d95">
\`\`\`js
function isEven(n) {
  return n % 2 === 1; // wait
}
\`\`\`
It is not fine. Nothing here is fine.
</Accordion>

## Quiz night

<QuizCard
  title="Professional standards"
  color="#ffdd00"
  questions={[
    {"question":"How many attempts does it take to fix a typo?","options":["One","Three","Always one more","Rewrite the file"],"correct":2,"explanation":"The typo is never the one you can see."},
    {"question":"What does a successful build mean?","options":["It works","Ship it","Nobody knows","All of the above"],"correct":3,"explanation":"A build is just confidence in a trench coat."}
  ]}
/>

## Numbers

<DataBar
  title="Time spent per line of code"
  data={[
    {"label":"Writing","value":5},
    {"label":"Debugging","value":85},
    {"label":"Pretending to know why","value":10}
  ]}
/>

## The five stages

<ConceptExplorer
  title="The five stages of a bug fix"
  color="#ff5500"
  steps={[
    {"label":"Denial","content":"That cannot be my code. It was my code.","highlight":"Denial"},
    {"label":"Anger","content":"Who wrote this? It was me. Last Tuesday.","highlight":"Anger"},
    {"label":"Bargaining","content":"One more console.log and the truth will appear.","highlight":"Bargaining"},
    {"label":"Acceptance","content":"It was a missing await. It is always a missing await.","highlight":"Acceptance"}
  ]}
/>

## Flashcard

<FlipCard front="What is the fastest way to find a bug?" back="Tell someone else that it is finished." color="#ff2d95" />

## The sacred command

<CopyButton text="git commit -m 'fix stuff'" label="Copy git" />

It works on my machine. Bold like **this**, italic like *this*, and inline code like \`git push --force\`.

| Excuse | Translation |
|--------|-------------|
| Legacy code | I am scared of it |
| Minor refactor | I rewrote everything |
| Should be quick | See you next week |

## The verdict

<GlitchBox color="#ffdd00">
Verdict: it works on my machine. That is all that matters.
</GlitchBox>

<BrutalButton color="#00dd44">No production databases were harmed in the making of these notes.</BrutalButton>

## Run your notes

<InteractiveCode defaultLanguage="javascript">
console.log("it works. do not touch it.")
</InteractiveCode>

---

<ProgressChecklist checklistId="nmap-host-discovery" />
`;

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

    // ── ConceptExplorer block ──
    if (/<ConceptExplorer/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !lines[i].includes("</ConceptExplorer>") && !lines[i].includes("/>")) { block += "\n" + lines[i]; i++; }
      if (i < lines.length) { block += "\n" + lines[i]; i++; }
      const titleMatch = block.match(/title="([^"]*)"/);
      const colorMatch = block.match(/color="([^"]*)"/);
      const stepsJson = extractJsonBlock(block, "steps");
      const steps: Array<{label:string;content:string;highlight?:string}> = [];
      if (stepsJson) {
        const arr = parseJsonArray<ConceptStep>(stepsJson);
        for (const item of arr) if (item.label && item.content) steps.push(item);
      }
      if (steps.length === 0) steps.push({ label: "Example", content: "Add steps to see them here" });
      nodes.push(<ConceptExplorer key={key++} title={titleMatch?.[1] || "Concept"} steps={steps} color={colorMatch?.[1] || "#ff5500"} />);
      continue;
    }

    // ── DataBar multiline block ──
    if (/<DataBar/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !lines[i].includes("</DataBar>") && !lines[i].includes("/>")) { block += "\n" + lines[i]; i++; }
      if (i < lines.length) { block += "\n" + lines[i]; i++; }
      const titleMatch = block.match(/title="([^"]*)"/);
      const dataJson = extractJsonBlock(block, "data");
      const data: Array<{label:string;value:number;color?:string}> = [];
      if (dataJson) {
        const arr = parseJsonArray<{ label: string; value: number; color?: string }>(dataJson);
        for (const item of arr) {
          if (typeof item.label === "string" && typeof item.value === "number") data.push(item);
        }
      }
      nodes.push(<DataBar key={key++} title={titleMatch?.[1]} data={data.length > 0 ? data : [{label:"Example",value:50}]} />);
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

    if (/<CommandBuilder/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      const optionsJson = extractJsonBlock(block, "options");
      const parsed = optionsJson ? parseJsonArray<CommandOption>(optionsJson) : [];
      const options = parsed.filter((o) => o.flag && o.label);
      if (options.length > 0) {
        nodes.push(
          <CommandBuilder
            key={key++}
            title={extractAttribute(block, "title") ?? "Command builder"}
            command={extractAttribute(block, "command") ?? ""}
            target={extractAttribute(block, "target") ?? ""}
            targetLabel={extractAttribute(block, "targetLabel") ?? "target"}
            suffix={extractAttribute(block, "suffix") ?? ""}
            color={extractAttribute(block, "color") ?? "#00dd44"}
            options={options}
          />
        );
        continue;
      }
    }

    if (/<Terminal/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      nodes.push(
        <Terminal
          key={key++}
          title={extractAttribute(block, "title") ?? "shell"}
          command={extractAttribute(block, "command") ?? ""}
          output={extractAttribute(block, "output") ?? ""}
          color={extractAttribute(block, "color") ?? "#00dd44"}
        />
      );
      continue;
    }

    if (/<Cloze/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      const text = extractAttribute(block, "text");
      if (text) {
        nodes.push(
          <Cloze key={key++} title={extractAttribute(block, "title") ?? "Active recall"} text={text} color={extractAttribute(block, "color") ?? "#00e5ff"} />
        );
        continue;
      }
    }

    if (/<SelfExplain/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      const prompt = extractAttribute(block, "prompt");
      const model = extractAttribute(block, "model");
      if (prompt && model) {
        nodes.push(<SelfExplain key={key++} prompt={prompt} model={model} color={extractAttribute(block, "color") ?? "#ffdd00"} />);
        continue;
      }
    }

    if (/<Sequence/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      const stepsJson = extractJsonBlock(block, "steps");
      const stepList = stepsJson ? parseStringArray(stepsJson) : [];
      if (stepList.length > 0) {
        nodes.push(
          <Sequence key={key++} title={extractAttribute(block, "title") ?? "Put it in order"} steps={stepList} color={extractAttribute(block, "color") ?? "#00dd44"} />
        );
        continue;
      }
    }

    if (/<MatchPairs/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      const pairsJson = extractJsonBlock(block, "pairs");
      const parsedPairs = pairsJson ? parseJsonArray<MatchPair>(pairsJson) : [];
      const pairList = parsedPairs
        .filter((pair) => pair.term && pair.match)
        .map((pair) => ({ term: String(pair.term), match: String(pair.match) }));
      if (pairList.length > 0) {
        nodes.push(
          <MatchPairs key={key++} title={extractAttribute(block, "title") ?? "Match them up"} pairs={pairList} color={extractAttribute(block, "color") ?? "#8800ff"} />
        );
        continue;
      }
    }

    if (/<Mermaid/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      const chart = extractAttribute(block, "chart");
      if (chart) {
        nodes.push(
          <Mermaid
            key={key++}
            title={extractAttribute(block, "title") ?? "Diagram"}
            color={extractAttribute(block, "color") ?? "#00e5ff"}
            chart={chart}
          />
        );
        continue;
      }
    }

    if (/<BrutalButton/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("</BrutalButton>")) { block += "\n" + lines[i]; i++; }
      if (block.includes("</BrutalButton>")) {
        const color = extractAttribute(block, "color");
        const body = block.replace(/^[\s\S]*?<BrutalButton[^>]*>/, "").replace(/<\/BrutalButton>[\s\S]*$/, "").trim();
        nodes.push(<BrutalButton key={key++} color={color ?? undefined}>{body}</BrutalButton>);
        continue;
      }
    }

    if (/<IdeaNode/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("</IdeaNode>")) { block += "\n" + lines[i]; i++; }
      if (block.includes("</IdeaNode>")) {
        const color = extractAttribute(block, "color");
        const body = block.replace(/^[\s\S]*?<IdeaNode[^>]*>/, "").replace(/<\/IdeaNode>[\s\S]*$/, "").trim();
        nodes.push(<IdeaNode key={key++} color={color ?? undefined}>{body}</IdeaNode>);
        continue;
      }
    }

    if (/<GlitchBox/.test(line)) {
      let block = line; i++;
      while (i < lines.length && !block.includes("</GlitchBox>")) { block += "\n" + lines[i]; i++; }
      if (block.includes("</GlitchBox>")) {
        const color = extractAttribute(block, "color");
        const label = extractAttribute(block, "label");
        const body = block.replace(/^[\s\S]*?<GlitchBox[^>]*>/, "").replace(/<\/GlitchBox>[\s\S]*$/, "").trim();
        nodes.push(<GlitchBox key={key++} color={color ?? undefined} label={label ?? undefined}>{body}</GlitchBox>);
        continue;
      }
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
      let block = line; i++;
      while (i < lines.length && !block.includes("/>")) { block += "\n" + lines[i]; i++; }
      const questionsJson = extractJsonBlock(block, "questions");
      const parsedQuestions = questionsJson ? parseJsonArray<QuizQuestion>(questionsJson) : [];
      const questions = parsedQuestions.filter((item) => item.question && Array.isArray(item.options));
      if (questions.length > 0) {
        nodes.push(
          <QuizCard key={key++} title={extractAttribute(block, "title") ?? "Quick quiz"} color={extractAttribute(block, "color") ?? "#ffdd00"} questions={questions} />
        );
        continue;
      }
    }

    if (/<ProgressChecklist/.test(line)) {
      const checklistId = extractAttribute(line, "checklistId");
      if (checklistId) {
        nodes.push(<ProgressChecklist key={key++} checklistId={checklistId} />);
        i++;
        continue;
      }
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
      const tableLines = [line]; i++;
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

export default function MdxPreviewPage() {
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pane, setPane] = useState<null | "editor" | "preview">(null);
  const [split, setSplit] = useLocalState("mdx-split", 50);
  const [mobileTab, setMobileTab] = useLocalState<"editor" | "preview">("mdx-tab", "editor");
  const [isWide, setIsWide] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { copied: mdxCopied, copy: copyMdx } = useCopy();
  const historyRef = useRef<string[]>([]);
  const cursorRef = useRef(-1);
  const skipPush = useRef(false);

  const applyEdit = (transform: (value: string, start: number, end: number) => { next: string; caret: number }) => {
    const element = textareaRef.current;
    const start = element?.selectionStart ?? input.length;
    const end = element?.selectionEnd ?? input.length;
    const { next, caret } = transform(input, start, end);
    setInput(next);
    requestAnimationFrame(() => {
      const target = textareaRef.current;
      if (!target) return;
      target.focus();
      target.setSelectionRange(caret, caret);
    });
  };

  const wrapSelection = (before: string, after = before) => {
    applyEdit((value, start, end) => {
      const selected = value.slice(start, end);
      return { next: value.slice(0, start) + before + selected + after + value.slice(end), caret: start + before.length + selected.length + after.length };
    });
  };

  const insertSnippet = (snippet: string) => {
    applyEdit((value, start, end) => {
      const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
      return { next: value.slice(0, start) + prefix + snippet + value.slice(end), caret: start + prefix.length + snippet.length };
    });
  };

  const downloadMdx = () => {
    const blob = new Blob([input], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "notes.mdx";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importMdx = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const stats = useMemo(() => {
    const trimmed = input.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    return { words, chars: input.length, lines: input.split("\n").length, minutes: Math.max(1, Math.round(words / 200)) };
  }, [input]);

  // Coalesced undo history: toolbar insertions also land here, so undo works
  // even though programmatic edits would normally break the native undo stack.
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      if (skipPush.current) {
        skipPush.current = false;
        return;
      }
      const stack = historyRef.current;
      if (stack[cursorRef.current] === input) return;
      historyRef.current = [...stack.slice(0, cursorRef.current + 1), input].slice(-300);
      cursorRef.current = historyRef.current.length - 1;
    }, 400);
    return () => clearTimeout(timer);
  }, [input, mounted]);

  const undo = () => {
    if (cursorRef.current <= 0) return;
    cursorRef.current -= 1;
    skipPush.current = true;
    setInput(historyRef.current[cursorRef.current]);
  };

  const redo = () => {
    if (cursorRef.current >= historyRef.current.length - 1) return;
    cursorRef.current += 1;
    skipPush.current = true;
    setInput(historyRef.current[cursorRef.current]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const active = document.activeElement as HTMLElement | null;
      const inTool = active === textareaRef.current || !!containerRef.current?.contains(active);
      if (!inTool) return;
      const key = event.key.toLowerCase();

      // Let the browser handle copy, cut and paste natively.
      if (key === "c" || key === "x" || key === "v" || key === "a") return;

      if (key === "z" && event.shiftKey) {
        event.preventDefault();
        redo();
      } else if (key === "z" || key === "u") {
        event.preventDefault();
        undo();
      } else if (key === "y" || key === "r") {
        event.preventDefault();
        redo();
      } else if (key === "b") {
        event.preventDefault();
        wrapSelection("**");
      } else if (key === "i") {
        event.preventDefault();
        wrapSelection("*");
      } else if (key === "k") {
        event.preventDefault();
        wrapSelection("[", "](https://)");
      } else if (key === "s") {
        event.preventDefault();
        downloadMdx();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    setInput(saved && saved.length > 0 ? saved : DEFAULT_MDX);
    setMounted(true);

    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => localStorage.setItem(STORAGE_KEY, input), 500);
    return () => clearTimeout(timer);
  }, [input, mounted]);

  useEffect(() => {
    if (!pane) return;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPane(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [pane]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((event.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(78, Math.max(22, percent)));
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setSplit]);

  // While the pointer is over the tool, never let the page scroll — the panes
  // are the only thing that moves. Stops the "scroll up and the whole site
  // jumps" behaviour when the inner pane has nothing left to scroll.
  useEffect(() => {
    // Fullscreen locks the page already, so leave wheel events completely alone
    // there — the panes must scroll natively.
    if (pane) return;
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (event: WheelEvent) => {
      let node = event.target as HTMLElement | null;
      while (node && node !== container) {
        const overflowY = getComputedStyle(node).overflowY;
        if (overflowY === "auto" || overflowY === "scroll") {
          const canScroll = event.deltaY > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 1 : node.scrollTop > 0;
          if (canScroll) return;
          break;
        }
        node = node.parentElement;
      }
      event.preventDefault();
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [pane, isWide, mobileTab, mounted]);

  const { nodes: previewNodes, error } = useMemo(() => {
    try {
      return { nodes: parseMdxPreview(input), error: null as string | null };
    } catch (parseError) {
      return { nodes: [], error: parseError instanceof Error ? parseError.message : "Could not parse this document" };
    }
  }, [input]);

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-sm text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Loading editor...</div>;
  }

  const fullEditor = pane === "editor";
  const fullPreview = pane === "preview";
  const showEditor = pane === "editor" || (!pane && (isWide || mobileTab === "editor"));
  const showPreview = pane === "preview" || (!pane && (isWide || mobileTab === "preview"));
  const buttonClass =
    "inline-flex cursor-pointer items-center gap-1 border border-current px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70";

  const content = (
    <main className="flex-1 pt-16">
      <section className="w-full pt-10 pb-6">
        <div className="mx-auto max-w-full px-4 md:px-12">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
              MDX Preview
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              notebook
            </span>
          </div>
          <p className="mt-3 font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.1em" }}>
            drag the divider to resize · expand for fullscreen · Esc exits · autosaved in your browser
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-full px-4 pb-12 md:px-12">
        {!pane && (
          <div className="mb-2 flex gap-1.5 lg:hidden">
            {(["editor", "preview"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMobileTab(tab)}
                aria-pressed={mobileTab === tab}
                className={`flex-1 cursor-pointer border-2 px-3 py-2 font-mono text-2xs uppercase transition-colors ${
                  mobileTab === tab ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted"
                }`}
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                {tab === "editor" ? "write" : "preview"}
              </button>
            ))}
          </div>
        )}

        <div
          ref={containerRef}
          className={
            pane
              ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface lg:flex-row"
              : "flex h-[72vh] min-h-[420px] flex-col overflow-hidden lg:h-[calc(100dvh-13rem)] lg:flex-row"
          }
          style={pane ? ({ height: "100dvh" } as CSSProperties) : undefined}
        >
          {showEditor && (
            <div
              className="flex min-h-0 flex-1 flex-col border-2 border-fg"
              style={!pane && isWide ? { flexBasis: `${split}%`, flexGrow: 0, flexShrink: 0 } : undefined}
            >
              <div className="flex shrink-0 items-center gap-2 border-b-2 border-fg px-3 py-1.5" style={{ backgroundColor: "var(--fg)", color: "var(--surf)" }}>
                <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  input.mdx
                </span>
                <span className="hidden font-mono text-2xs opacity-70 sm:inline" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                  {input.split("\n").length} lines
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => setPane(fullEditor ? null : "editor")}
                  className={buttonClass}
                  aria-label={fullEditor ? "Exit fullscreen editor" : "Fullscreen editor"}
                >
                  <FontAwesomeIcon icon={fullEditor ? faCompress : faExpand} className="text-[10px]" />
                </button>
              </div>
              <MdxNotesToolbar
                onWrap={wrapSelection}
                onSnippet={insertSnippet}
                onCopy={() => copyMdx(input)}
                onDownload={downloadMdx}
                onImport={importMdx}
                onLoadStory={() => setInput(DEFAULT_MDX)}
                copied={mdxCopied}
                stats={stats}
              />
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-h-0 w-full flex-1 resize-none overscroll-contain bg-transparent p-4 font-mono text-sm focus:outline-none"
                style={{ color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
                placeholder="Type MDX content..."
                spellCheck={false}
              />
            </div>
          )}

          {!pane && isWide && (
            <div
              onPointerDown={(event) => {
                dragging.current = true;
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
                event.preventDefault();
              }}
              className="hidden w-2 shrink-0 cursor-col-resize lg:block"
              style={{ backgroundColor: "color-mix(in srgb, var(--fg) 22%, transparent)" }}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize editor and preview"
            />
          )}

          {showPreview && (
            <div className={`flex min-h-0 flex-1 flex-col border-2 border-fg ${!pane && isWide ? "lg:border-l-0" : ""}`}>
              <div className="flex shrink-0 items-center gap-2 border-b-2 border-fg px-3 py-1.5" style={{ backgroundColor: "var(--fg)", color: "var(--surf)" }}>
                <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  preview
                </span>
                <span className="hidden font-mono text-2xs opacity-70 sm:inline" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                  live render
                </span>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => setPane(fullPreview ? null : "preview")}
                  className={buttonClass}
                  aria-label={fullPreview ? "Exit fullscreen preview" : "Fullscreen preview"}
                >
                  <FontAwesomeIcon icon={fullPreview ? faCompress : faExpand} className="text-[10px]" />
                </button>
              </div>
              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fg-muted/40 md:p-6"
                tabIndex={0}
                style={{ backgroundColor: "var(--surf)" }}
              >
                {error ? (
                  <div className="border-2 p-4 font-mono text-xs" style={{ borderColor: "#ff5500", color: "#ff5500", fontFamily: TYPOGRAPHY.fontMono }}>
                    Could not render: {error}
                  </div>
                ) : (
                  <div className="mx-auto max-w-[68ch]">{previewNodes}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );

  return pane ? createPortal(content, document.body) : content;
}
