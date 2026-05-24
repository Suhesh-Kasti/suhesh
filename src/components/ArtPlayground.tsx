"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { COLORS, TYPOGRAPHY, MOTION } from "@/lib/design-tokens";
import EncoderTool from "@/components/tools/EncoderTool";
import PasswordTool from "@/components/tools/PasswordTool";
import CertDecoder from "@/components/tools/CertDecoder";

type Tool = "encoder" | "hash" | "regex" | "nmap-parse" | "multi-encoder" | "password" | "cert" | "timestamp" | "diff" | "json-fmt";

export default function ArtPlayground() {
  const [tool, setTool] = useState<Tool>("encoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [hashType, setHashType] = useState("sha256");
  const [regexPattern, setRegexPattern] = useState("");
  const [regexFlags, setRegexFlags] = useState("gi");
  const [regexInput, setRegexInput] = useState("");
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [tsInput, setTsInput] = useState("");
  const [tsResult, setTsResult] = useState("");
  const [diffLeft, setDiffLeft] = useState("");
  const [diffRight, setDiffRight] = useState("");
  const [diffResult, setDiffResult] = useState<Array<{type:"same"|"add"|"del";text:string}>>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonResult, setJsonResult] = useState("");

  const handleEncode = useCallback(() => { try { setOutput(btoa(input)); } catch { setOutput("Invalid input for encoding"); } }, [input]);
  const handleDecode = useCallback(() => { try { setOutput(atob(input)); } catch { setOutput("Invalid Base64 input"); } }, [input]);

  const handleHash = useCallback(async () => {
    try {
      const data = new TextEncoder().encode(input);
      let hash: ArrayBuffer;
      if (hashType === "sha256") hash = await crypto.subtle.digest("SHA-256", data);
      else if (hashType === "sha1") hash = await crypto.subtle.digest("SHA-1", data);
      else hash = await crypto.subtle.digest("SHA-512", data);
      setOutput(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join(""));
    } catch { setOutput("Error generating hash"); }
  }, [input, hashType]);

  const handleRegex = useCallback(() => {
    try {
      const r = new RegExp(regexPattern, regexFlags);
      const m = Array.from(regexInput.matchAll(r));
      setRegexMatches(m.length ? m.map(x => x[0]) : ["No matches found"]);
    } catch { setRegexMatches(["Invalid regex pattern"]); }
  }, [regexPattern, regexFlags, regexInput]);

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
    const left = diffLeft.split("\n"), right = diffRight.split("\n");
    const rSet = new Set(right);
    const result: typeof diffResult = [];
    for (const l of left) result.push({ type: rSet.has(l) ? "same" : "del", text: l });
    const lSet = new Set(left);
    for (const r of right) if (!lSet.has(r)) result.push({ type: "add", text: r });
    setDiffResult(result);
  }, [diffLeft, diffRight]);

  const handleJsonFmt = useCallback(() => {
    try { setJsonResult(JSON.stringify(JSON.parse(jsonInput), null, 2)); }
    catch { setJsonResult("Invalid JSON"); }
  }, [jsonInput]);

  const clearTools = () => { setInput(""); setOutput(""); setRegexMatches([]); setTsResult(""); setDiffResult([]); setJsonResult(""); };

  const quickTools = [
    { id: "encoder" as Tool, label: "Base64 Encoder/Decoder", icon: "b64" },
    { id: "hash" as Tool, label: "Hash Generator", icon: "#" },
    { id: "regex" as Tool, label: "Regex Tester", icon: "/re/" },
    { id: "nmap-parse" as Tool, label: "Nmap Port Parser", icon: "nmap" },
    { id: "multi-encoder" as Tool, label: "Multi Encoder", icon: "enc" },
    { id: "password" as Tool, label: "Password Analyzer", icon: "pw" },
    { id: "cert" as Tool, label: "Cert Decoder", icon: "x509" },
    { id: "timestamp" as Tool, label: "Timestamp", icon: "ts" },
    { id: "diff" as Tool, label: "Text Diff", icon: "<>" },
    { id: "json-fmt" as Tool, label: "JSON Fmt", icon: "{}" },
  ];

  const standaloneTools = [
    { label: "JWT Debugger", href: "/tools/jwt", desc: "Decode, inspect, and detect JWT vulnerabilities", color: COLORS.pink },
    { label: "Payload Generator", href: "/tools/payloads", desc: "Reverse shells, XSS, SQLi payloads with variable fill", color: COLORS.blue },
    { label: "MDX Preview", href: "/tools/mdx-preview", desc: "Live MDX editor — see how your notes will render", color: COLORS.green },
    { label: "Hash Identifier", href: "/tools/hash-id", desc: "Identify hash types — MD5, SHA, bcrypt, NTLM, and more", color: "#ff5500" },
    { label: "Header Analyzer", href: "/tools/headers", desc: "Paste or fetch HTTP headers — get a security audit", color: "#ff2d95" },
    { label: "Hex Dump Analyzer", href: "/tools/hexdump", desc: "Parse raw hex: magic bytes, entropy, xxd-style output", color: "#8800ff" },
    { label: "Subdomain Scanner", href: "/tools/subdomains", desc: "DNS lookup for 50+ common subdomains via Cloudflare DNS", color: "#0055ff" },
    { label: "Port Reference", href: "/tools/ports", desc: "100+ common ports — search, filter by category, copy lists", color: "#00e5ff" },
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

                {/* Hash Generator */}
                {tool === "hash" && <>
                  <div className="flex gap-3">
                    {(["sha256","sha1","sha512"] as const).map(h => (
                      <button key={h} onClick={() => setHashType(h)} className={`font-mono text-xs uppercase px-3 py-1.5 border-2 cursor-pointer transition-all ${hashType===h?"border-brutal-blue bg-brutal-blue text-surface":"border-fg-muted text-fg-muted hover:border-fg"}`} style={{ fontFamily: TYPOGRAPHY.fontMono }}>{h.toUpperCase()}</button>
                    ))}
                  </div>
                  <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to hash..." className="w-full bg-transparent border-2 border-fg font-mono text-sm text-fg p-4 min-h-[80px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }} rows={3} />
                  <button onClick={handleHash} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Generate Hash</button>
                  {output && <OutputBox output={output} />}
                </>}

                {/* Regex Tester */}
                {tool === "regex" && <>
                  <div className="flex gap-3">
                    <input value={regexPattern} onChange={e => setRegexPattern(e.target.value)} placeholder="/pattern/" className="flex-1 bg-transparent border-2 border-fg font-mono text-sm px-4 py-2 focus:outline-none focus:border-brutal-blue transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} />
                    <input value={regexFlags} onChange={e => setRegexFlags(e.target.value)} placeholder="gi" className="w-16 bg-transparent border-2 border-fg font-mono text-sm px-3 py-2 focus:outline-none focus:border-brutal-blue transition-colors" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} />
                  </div>
                  <textarea value={regexInput} onChange={e => setRegexInput(e.target.value)} placeholder="Text to test regex against..." className="w-full bg-transparent border-2 border-fg font-mono text-sm p-4 min-h-[80px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} rows={4} />
                  <button onClick={handleRegex} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Test Pattern</button>
                  {regexMatches.length > 0 && (
                    <div className="border-2 border-fg p-3 space-y-1 max-h-[200px] overflow-y-auto">
                      {regexMatches.map((m,i) => <div key={i} className="font-mono text-sm text-brutal-green" style={{ fontFamily: TYPOGRAPHY.fontMono }}>[{i+1}] {m}</div>)}
                    </div>
                  )}
                </>}

                {/* Nmap Parser */}
                {tool === "nmap-parse" && <>
                  <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={`Paste nmap output...\n22/tcp open ssh\n80/tcp open http`} className="w-full bg-transparent border-2 border-fg font-mono text-sm p-4 min-h-[120px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }} rows={6} />
                  <button onClick={handleNmapParse} className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Extract Ports</button>
                  {output && <OutputBox output={output} />}
                </>}

                {tool === "multi-encoder" && <EncoderTool />}
                {tool === "password" && <PasswordTool />}
                {tool === "cert" && <CertDecoder />}

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
                        <div key={i} className={r.type==="add"?"text-brutal-green":r.type==="del"?"text-brutal-red line-through":"text-fg-muted"}>
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

      </div>
    </section>
  );
}

function OutputBox({ output }: { output: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-brutal-green p-4 bg-brutal-green/5">
      <span className="font-mono text-2xs uppercase text-brutal-green tracking-label block mb-2" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>Output</span>
      <pre className="font-mono text-sm text-fg whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{output}</pre>
      <button onClick={() => navigator.clipboard.writeText(output)} className="mt-2 font-mono text-2xs uppercase text-fg-muted hover:text-fg cursor-pointer border border-fg-muted px-2 py-1 hover:border-fg transition-all" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Copy</button>
    </motion.div>
  );
}
