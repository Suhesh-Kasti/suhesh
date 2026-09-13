"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { COLORS, TYPOGRAPHY } from "@/lib/design-tokens";
import EncoderTool from "@/components/tools/EncoderTool";
import PasswordTool from "@/components/tools/PasswordTool";
import JoseTool from "@/components/tools/JoseTool";
import ToolHelp from "@/components/tools/ToolHelp";
import { CidrTool, MutatorTool, DefangTool, ChmodTool, CronTool } from "@/components/tools/SmallTools";

type Tool = "encoder" | "jose" | "nmap-parse" | "multi-encoder" | "password" | "timestamp" | "diff" | "json-fmt" | "ip" | "mutate" | "defang" | "chmod" | "cron";

const QUICK_HELP: Record<Tool, { intro: string; steps: string[]; terms: { term: string; meaning: string }[] }> = {
  encoder: {
    intro: "Base64 turns binary or text into plain ASCII so it survives a text-only channel. It is encoding, not encryption — anyone can decode it.",
    steps: ["Paste your text or Base64.", "Hit Encode or Decode.", "Copy the result."],
    terms: [
      { term: "Base64", meaning: "Represents 3 bytes as 4 ASCII characters. About 33 percent larger than the input." },
      { term: "Encoding vs encryption", meaning: "Encoding is reversible by anyone; encryption needs a key. Base64 has no key." },
      { term: "Padding", meaning: "Trailing = characters that fill out the last group of bytes." },
    ],
  },
  jose: {
    intro: "Inspect a JWT (JWS) or a JWE: decode the header and claims, verify a signature, or decrypt an encrypted token — all locally in your browser.",
    steps: ["Paste a 3-part JWS or 5-part JWE.", "Read the decoded header and payload.", "Choose the key type, paste the key, then verify or decrypt."],
    terms: [
      { term: "JWS", meaning: "Signed token — readable by anyone, tamper-evident." },
      { term: "JWE", meaning: "Encrypted token — unreadable without the key." },
      { term: "alg", meaning: "Header field naming the algorithm, e.g. HS256 or RS256." },
    ],
  },
  "nmap-parse": {
    intro: "Paste raw nmap output and pull the open TCP ports out of it — handy when you want a -p list for a follow-up scan.",
    steps: ["Paste the nmap output.", "Hit Extract Ports.", "Copy the comma-separated list."],
    terms: [
      { term: "Open port", meaning: "A service accepted the connection and is listening." },
      { term: "Filtered", meaning: "A firewall dropped the probe, so the state is unknown." },
    ],
  },
  "multi-encoder": {
    intro: "Chain encodings together when one layer is not enough to slip a payload past a filter.",
    steps: ["Enter your input.", "Stack the encodings you want.", "Copy the chained result."],
    terms: [
      { term: "URL encoding", meaning: "Turns reserved characters into %XX so they survive a URL." },
      { term: "Double encoding", meaning: "Encoding twice defeats filters that only decode once." },
      { term: "Hex", meaning: "Each byte as two hex characters." },
    ],
  },
  password: {
    intro: "Estimate how long a password would survive an offline attack, and see which choices actually improve it.",
    steps: ["Type or paste a password.", "Read the entropy and crack-time estimate.", "Try adding length versus symbols and watch the difference."],
    terms: [
      { term: "Entropy", meaning: "Bits of unpredictability. Every extra bit doubles the search space." },
      { term: "Length beats complexity", meaning: "Adding two characters usually helps more than swapping a letter for a symbol." },
      { term: "Offline attack", meaning: "The attacker has your hash and guesses at local GPU speed." },
    ],
  },
  timestamp: {
    intro: "Convert between Unix epoch seconds and human dates, both ways.",
    steps: ["Paste an epoch number or a date.", "Pick the direction.", "Copy the converted value."],
    terms: [
      { term: "Epoch", meaning: "Seconds since 1 January 1970 UTC." },
      { term: "Milliseconds", meaning: "Some APIs use ms — ten digits is seconds, thirteen is milliseconds." },
      { term: "UTC vs local", meaning: "Logs are usually UTC; your OS clock is usually local." },
    ],
  },
  diff: {
    intro: "Compare two blocks of text line by line to see exactly what changed.",
    steps: ["Paste the original on the left and the modified on the right.", "Hit Compare.", "Read additions and deletions."],
    terms: [
      { term: "Added line", meaning: "Present on the right only — highlighted green." },
      { term: "Deleted line", meaning: "Present on the left only — highlighted red." },
    ],
  },
  "json-fmt": {
    intro: "Pretty-print or minify JSON, and catch syntax errors before you paste it into a request.",
    steps: ["Paste JSON.", "Format to read it, or Minify to shrink it.", "Copy the result."],
    terms: [
      { term: "Minify", meaning: "Removes whitespace. Same data, smaller payload." },
      { term: "Trailing comma", meaning: "The most common cause of invalid JSON." },
    ],
  },
  ip: {
    intro: "IPv4 subnet maths, plus the alternative spellings of an address that WAFs and SSRF filters routinely miss.",
    steps: ["Enter an address with an optional /prefix.", "Read the network, broadcast and host range.", "Copy a decimal, hex or octal form to slip past a filter."],
    terms: [
      { term: "CIDR", meaning: "/24 means the first 24 bits are the network, leaving 8 bits of hosts." },
      { term: "Decimal IP", meaning: "127.0.0.1 as 2130706433 — the same address to the network stack." },
      { term: "Wildcard mask", meaning: "The inverse of the netmask, used by ACLs." },
      { term: "IPv6 mapped", meaning: "::ffff:127.0.0.1 is another way to write the same IPv4 address." },
    ],
  },
  mutate: {
    intro: "Turn a company name or a known password into a realistic candidate list — the mutations people actually use when they pick a password.",
    steps: ["Type one or more base words.", "Toggle the mutations you want.", "Copy or download the list and feed it to hashcat or hydra."],
    terms: [
      { term: "Leetspeak", meaning: "Replacing letters with lookalike digits: password becomes p4ssw0rd." },
      { term: "Rule-based attack", meaning: "The same idea baked into hashcat rules." },
      { term: "Candidate list", meaning: "A wordlist to try, not a guarantee. Size slows the attack." },
    ],
  },
  defang: {
    intro: "Defanging makes a URL, IP or email safe to paste into a report or chat without anyone accidentally clicking it.",
    steps: ["Paste the indicator.", "Copy the defanged version into your writeup.", "Refang when you need it clickable again."],
    terms: [
      { term: "Defang", meaning: "Breaking the syntax so it cannot be clicked: http becomes hxxp, dots become [.]." },
      { term: "Indicator (IOC)", meaning: "A URL, IP, domain or hash worth sharing with defenders." },
    ],
  },
  chmod: {
    intro: "Translate between octal and symbolic file permissions, and spot the special bits that turn a normal binary into a privilege escalation.",
    steps: ["Enter 3 or 4 octal digits.", "Read the symbolic form and the special bits.", "Copy a ready-to-run chmod command."],
    terms: [
      { term: "r w x", meaning: "Read is 4, write is 2, execute is 1. Add them per owner, group and other." },
      { term: "Setuid", meaning: "Runs as the file owner. On a root-owned binary this is a classic privesc." },
      { term: "Setgid / sticky", meaning: "Setgid inherits the group; sticky on a directory means only owners can delete their files." },
    ],
  },
  cron: {
    intro: "Decode a cron expression field by field, and know exactly when a scheduled job will fire — useful when you find a writable script in a root cron.",
    steps: ["Paste a 5-field cron expression.", "Read the meaning of each field.", "Look for jobs running as root on a file you can write to."],
    terms: [
      { term: "Field order", meaning: "minute, hour, day of month, month, day of week." },
      { term: "*", meaning: "Every value of that field." },
      { term: "*/n", meaning: "Every nth value, e.g. */5 in minutes is every five minutes." },
      { term: "1-5", meaning: "A range. In the weekday field, 1 is Monday." },
    ],
  },
};

// ── localStorage helpers ──
const LS_TOOL = "tool-active";
const LS_INPUT = "tool-input";
const LS_TS_INPUT = "tool-ts-input";
const LS_DIFF_LEFT = "tool-diff-left";
const LS_DIFF_RIGHT = "tool-diff-right";
const LS_JSON_INPUT = "tool-json-input";

function load(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return localStorage.getItem(key) ?? fallback;
}
function save(key: string, val: string) {
  if (typeof window !== "undefined") localStorage.setItem(key, val);
}

export default function ArtPlayground() {
  const [tool, setTool] = useState<Tool>(() => (load(LS_TOOL, "encoder") as Tool));
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState(() => load(LS_INPUT, ""));
  const [output, setOutput] = useState("");
  const [tsInput, setTsInput] = useState(() => load(LS_TS_INPUT, ""));
  const [tsResult, setTsResult] = useState("");
  const [diffLeft, setDiffLeft] = useState(() => load(LS_DIFF_LEFT, ""));
  const [diffRight, setDiffRight] = useState(() => load(LS_DIFF_RIGHT, ""));
  const [diffResult, setDiffResult] = useState<Array<{type:"same"|"add"|"del";text:string}>>([]);
  const [jsonInput, setJsonInput] = useState(() => load(LS_JSON_INPUT, ""));
  const [jsonResult, setJsonResult] = useState("");

  // Mark mounted and set up save-on-change for each state
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { save(LS_TOOL, tool); }, [tool]);
  useEffect(() => { if (mounted) save(LS_INPUT, input); }, [input, mounted]);
  useEffect(() => { save(LS_TS_INPUT, tsInput); }, [tsInput]);
  useEffect(() => { save(LS_DIFF_LEFT, diffLeft); }, [diffLeft]);
  useEffect(() => { save(LS_DIFF_RIGHT, diffRight); }, [diffRight]);
  useEffect(() => { save(LS_JSON_INPUT, jsonInput); }, [jsonInput]);

  const handleEncode = useCallback(() => { try { setOutput(btoa(input)); } catch { setOutput("Invalid input for encoding"); } }, [input]);
  const handleDecode = useCallback(() => { try { setOutput(atob(input)); } catch { setOutput("Invalid Base64 input"); } }, [input]);

  const handleNmapParse = useCallback(() => {
    const ports = input.split("\n").map(l => l.match(/(\d+)\/tcp\s+open/)).filter(Boolean).map(m => m![1]);
    setOutput(ports.length ? `Open Ports: ${ports.join(", ")}` : "No open TCP ports found");
  }, [input]);

  const handleTimestamp = useCallback((mode:"to-date"|"to-unix") => {
    try {
      if (mode === "to-date") {
        const ms = parseInt(tsInput) * (tsInput.length > 10 ? 1 : 1000);
        setTsResult(new Date(ms).toISOString().replace("T"," ").slice(0,19) + " UTC");
      } else {
        const d = new Date(tsInput);
        if (isNaN(d.getTime())) { setTsResult("Invalid date string"); return; }
        setTsResult(Math.floor(d.getTime()/1000).toString());
      }
    } catch { setTsResult("Conversion failed"); }
  }, [tsInput]);

  const handleDiff = useCallback(() => {
    // Character-level diff using longest common subsequence (LCS)
    function lcsMatrix(a: string, b: string): number[][] {
      const m = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          m[i][j] = a[i-1] === b[j-1] ? m[i-1][j-1] + 1 : Math.max(m[i-1][j], m[i][j-1]);
        }
      }
      return m;
    }

    function backtrack(m: number[][], a: string, b: string): Array<{type:"same"|"add"|"del";text:string}> {
      const result: typeof diffResult = [];
      let i = a.length, j = b.length;
      const buf: string[] = [];
      let mode: "same"|"add"|"del"|null = null;

      const flush = () => {
        if (!buf.length) return;
        result.unshift({ type: mode!, text: buf.reverse().join("") });
        buf.length = 0;
      };

      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i-1] === b[j-1]) {
          if (mode !== "same") { flush(); mode = "same"; }
          buf.push(a[i-1]);
          i--; j--;
        } else if (j > 0 && (i === 0 || m[i][j-1] >= m[i-1][j])) {
          if (mode !== "add") { flush(); mode = "add"; }
          buf.push(b[j-1]);
          j--;
        } else {
          if (mode !== "del") { flush(); mode = "del"; }
          buf.push(a[i-1]);
          i--;
        }
      }
      flush();
      return result;
    }

    const m = lcsMatrix(diffLeft, diffRight);
    setDiffResult(backtrack(m, diffLeft, diffRight));
  }, [diffLeft, diffRight]);

  const handleJsonFmt = useCallback(() => {
    try { setJsonResult(JSON.stringify(JSON.parse(jsonInput), null, 2)); }
    catch { setJsonResult("Invalid JSON"); }
  }, [jsonInput]);

  const clearTools = () => { setInput(""); setOutput(""); setTsResult(""); setDiffResult([]); setJsonResult(""); };

  const quickTools = [
    { id: "encoder" as Tool, label: "Base64 Encoder/Decoder", icon: "b64" },
    { id: "jose" as Tool, label: "JWT / JWE Inspector", icon: "jwt" },
    { id: "nmap-parse" as Tool, label: "Nmap Port Parser", icon: "nmap" },
    { id: "multi-encoder" as Tool, label: "Multi Encoder", icon: "enc" },
    { id: "password" as Tool, label: "Password Analyzer", icon: "pw" },
    { id: "timestamp" as Tool, label: "Timestamp", icon: "ts" },
    { id: "diff" as Tool, label: "Text Diff", icon: "<>" },
    { id: "json-fmt" as Tool, label: "JSON Fmt", icon: "{}" },
    { id: "ip" as Tool, label: "CIDR / IP", icon: "ip" },
    { id: "mutate" as Tool, label: "Wordlist Mutator", icon: "mut" },
    { id: "defang" as Tool, label: "Defang / Refang", icon: "ioc" },
    { id: "chmod" as Tool, label: "Chmod Calculator", icon: "rwx" },
    { id: "cron" as Tool, label: "Cron Explainer", icon: "cron" },
  ];

  const standaloneTools = [
    { label: "JWT Debugger", href: "/tools/jwt", desc: "Decode, inspect, and detect JWT vulnerabilities", color: COLORS.pink },
    { label: "Payload Generator", href: "/tools/payloads", desc: "Reverse shells, XSS, SQLi payloads with variable fill", color: COLORS.blue },
    { label: "Hash Identifier", href: "/tools/hash-id", desc: "Identify hash types — MD5, SHA, bcrypt, NTLM, and more", color: "#ff5500" },
    { label: "Recon Suite", href: "/tools/recon", desc: "DNS records, SPF/DMARC/DKIM posture and subdomain scanning in one place", color: "#00e5ff" },
    { label: "Header Analyzer", href: "/tools/headers", desc: "Paste or fetch HTTP headers — get a security audit", color: "#ff2d95" },
    { label: "Hex Dump Analyzer", href: "/tools/hexdump", desc: "Parse raw hex: magic bytes, entropy, xxd-style output", color: "#8800ff" },
    { label: "Port Reference", href: "/tools/ports", desc: "100+ common ports — search, filter by category, copy lists", color: "#00e5ff" },
    { label: "Reverse Shell Generator", href: "/tools/reverse-shell", desc: "Build bash, python, powershell, netcat payloads with a listener", color: "#00dd44" },
    { label: "CVSS 3.1 Calculator", href: "/tools/cvss", desc: "Score findings and copy the vector string for your report", color: "#ff1144" },
    { label: "Regex Lab", href: "/tools/regex", desc: "Colour-coded regex explainer — live matches, groups and a cheat sheet", color: "#ffdd00" },
    { label: "AI Injection Lab", href: "/tools/ai-injection", desc: "Prompt injection arsenal: extraction, RAG injection, tool abuse and defences", color: "#8800ff" },
    { label: "Crypto Lab", href: "/tools/crypto", desc: "CTF toolbox: hash cracking, XOR brute force, Caesar and frequency analysis", color: "#00dd44" },
    { label: "Cert Studio", href: "/tools/cert", desc: "Inspect PEM/DER/PKCS#12 chains, generate a CA, issue server and mTLS certs, sign CSRs", color: "#00e5ff" },
  ];

  return (
    <section id="playground" className="relative w-full bg-surface py-20 md:py-32 section-divider overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-extrabold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>Cyber Tools</h2>
          <div className="flex-1 h-1 bg-fg" />
          <span className="font-mono text-xs uppercase text-fg-muted tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>LAB</span>
        </div>

        {/* ═══════ QUICK TOOLS — toolbar + canvas on top ═══════ */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Quick Tools</span>
            <div className="flex-1 h-px bg-fg-muted/20" />
          </div>

          <div className="flex gap-2 mb-0 flex-wrap">
            {quickTools.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTool(t.id); clearTools(); }}
                className={`group relative font-mono text-xs md:text-sm uppercase px-3 py-2 border-2 transition-all cursor-pointer ${tool === t.id ? "border-fg bg-fg text-surface shadow-brutal-sm" : "border-fg-muted/30 text-fg-muted hover:border-fg hover:text-fg hover:shadow-brutal-sm"}`}
              >
                <span className="text-fg-muted/50 mr-1">{t.icon}</span>
                {t.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Quick tool canvas — collapses when hidden */}
        <AnimatePresence>
          {quickTools.some(t => t.id === tool) && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 40 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="border-2 border-fg shadow-brutal bg-surface overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-2 border-b-2 border-fg bg-fg text-surface">
                <span className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-brutal-red border border-surface" />
                  <span className="w-2.5 h-2.5 bg-brutal-yellow border border-surface" />
                  <span className="w-2.5 h-2.5 bg-brutal-green border border-surface" />
                </span>
                <span className="font-mono text-2xs uppercase tracking-label ml-2" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  {tool.replace("-", " ")}
                </span>
              </div>
              <div className="p-6 space-y-4">

                {/* Encoder/Decoder */}
                {tool === "encoder" && <>
                  <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text or Base64..." className="w-full bg-transparent border-2 border-fg font-mono text-sm text-fg p-4 min-h-[100px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }} rows={5} />
                  <div className="flex gap-3">
                    <button onClick={handleEncode} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Encode</button>
                    <button onClick={handleDecode} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Decode</button>
                  </div>
                  {output && <OutputBox output={output} />}
                </>}

                {/* JWT / JWS / JWE */}
                {tool === "jose" && <JoseTool />}

                {/* Nmap Parser */}
                {tool === "nmap-parse" && <>
                  <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste nmap output...\n22/tcp open ssh\n80/tcp open http`} className="w-full bg-transparent border-2 border-fg font-mono text-sm p-4 min-h-[120px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} rows={6} />
                  <button onClick={handleNmapParse} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Extract Ports</button>
                  {output && <OutputBox output={output} />}
                </>}

                {tool === "multi-encoder" && <EncoderTool />}
                {tool === "password" && <PasswordTool />}
                {/* Timestamp */}
                {tool === "timestamp" && <>
                  <input value={tsInput} onChange={e => setTsInput(e.target.value)} onKeyDown={e => { if (e.key==="Enter") handleTimestamp(tsInput.length>10?"to-date":"to-unix"); }} placeholder="1696118400 or 2023-10-01T00:00:00Z..." className="w-full bg-transparent border-2 border-fg font-mono text-sm px-4 py-3 focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} />
                  <div className="flex gap-3">
                    <button onClick={() => handleTimestamp("to-date")} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Unix → Date</button>
                    <button onClick={() => handleTimestamp("to-unix")} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Date → Unix</button>
                  </div>
                  {tsResult && <OutputBox output={tsResult} />}
                </>}

                {/* Text Diff */}
                {tool === "diff" && <>
                  <div className="grid grid-cols-2 gap-3">
                    <textarea value={diffLeft} onChange={e => setDiffLeft(e.target.value)} placeholder="Original text..." className="bg-transparent border-2 border-fg font-mono text-xs p-3 min-h-[120px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} rows={6} />
                    <textarea value={diffRight} onChange={e => setDiffRight(e.target.value)} placeholder="Modified text..." className="bg-transparent border-2 border-fg font-mono text-xs p-3 min-h-[120px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} rows={6} />
                  </div>
                  <button onClick={handleDiff} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Compare</button>
                  {diffResult.length > 0 && (
                    <div className="border-2 border-fg p-3 font-mono text-xs space-y-0.5 max-h-[200px] overflow-y-auto" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {diffResult.map((r,i) => (
                        <div key={i} className={r.type==="add"?"text-brutal-green-text":r.type==="del"?"text-brutal-red-text line-through":"text-fg-muted"}>
                          {r.type==="add"?"+ ":r.type==="del"?"- ":"  "}{r.text}
                        </div>
                      ))}
                    </div>
                  )}
                </>}

                {/* JSON Formatter */}
                {tool === "json-fmt" && <>
                  <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} onKeyDown={e => { if (e.key==="Enter"&&e.ctrlKey) handleJsonFmt(); }} placeholder='{"key":"value"}' className="w-full bg-transparent border-2 border-fg font-mono text-xs p-4 min-h-[120px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} rows={6} />
                  <div className="flex gap-3">
                    <button onClick={handleJsonFmt} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Format</button>
                    <button onClick={() => { try { setJsonInput(JSON.stringify(JSON.parse(jsonInput))); } catch {} }} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg-muted/30 hover:border-fg text-fg-muted hover:text-fg transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Minify</button>
                  </div>
                  {jsonResult && <OutputBox output={jsonResult} />}
                </>}

                {tool === "ip" && <CidrTool />}
                {tool === "mutate" && <MutatorTool />}
                {tool === "defang" && <DefangTool />}
                {tool === "chmod" && <ChmodTool />}
                {tool === "cron" && <CronTool />}

                <ToolHelp title="What is this?" intro={QUICK_HELP[tool].intro} steps={QUICK_HELP[tool].steps} terms={QUICK_HELP[tool].terms} />

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ STANDALONE TOOLS — dedicated pages ═══════ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Dedicated Tools</span>
            <div className="flex-1 h-px bg-fg-muted/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {standaloneTools.map(t => (
              <Link key={t.href} href={t.href} className="border-2 p-4 cursor-pointer group hover:shadow-brutal-lg transition-all" style={{ borderColor: t.color, backgroundColor: "var(--surf)" }}>
                <h3 className="font-display text-lg font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: t.color }}>{t.label}</h3>
                <p className="font-mono text-2xs text-fg-muted mt-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════ NOTEBOOK — personal MDX editor, kept separate from the tools ═══════ */}
        <div className="mt-16 border-2 border-fg p-6" style={{ backgroundColor: "var(--surf)", boxShadow: "8px 8px 0px var(--fg)" }}>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xs uppercase tracking-label text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Notebook</span>
            <div className="flex-1 h-px bg-fg-muted/20" />
          </div>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-extrabold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>MDX Preview</h3>
              <p className="mt-1 max-w-xl font-sans text-sm leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                My in-browser notes desk: write MDX with the widget snippets, watch it render live, then copy or download the file straight into the repo. Not a security tool — just where the notes get written.
              </p>
            </div>
            <Link
              href="/tools/mdx-preview"
              className="inline-flex shrink-0 items-center gap-2 border-2 border-fg bg-brutal-yellow px-6 py-3 font-display text-base font-extrabold uppercase text-[#0a0a0a] shadow-brutal transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm"
              style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
            >
              Open notebook
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

function OutputBox({ output }: { output: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-brutal-green p-4 bg-brutal-green/5">
      <span className="font-mono text-2xs uppercase text-brutal-green-text tracking-label block mb-2" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Output</span>
      <pre className="font-mono text-sm text-fg whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{output}</pre>
      <button onClick={() => navigator.clipboard.writeText(output)} className="mt-2 font-mono text-2xs uppercase text-fg-muted hover:text-fg cursor-pointer border border-fg-muted px-2 py-1 hover:border-fg transition-all" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Copy</button>
    </motion.div>
  );
}
