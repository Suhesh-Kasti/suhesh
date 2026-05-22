"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { COLORS, TYPOGRAPHY, MOTION } from "@/lib/design-tokens";
import EncoderTool from "@/components/tools/EncoderTool";
import PasswordTool from "@/components/tools/PasswordTool";
import CertDecoder from "@/components/tools/CertDecoder";

type Tool = "encoder" | "hash" | "regex" | "nmap-parse" | "multi-encoder" | "password" | "cert" | "mdx-preview";

const DECODER_ARTIFACTS = [
  "TWFuIGlzIGRpc3Rpbmd1aXNoZWQ=",
  "dGhpbmtpbmcsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24=",
  "YnV0IGJ5IHRoaXMgc2luZ3VsYXIgcGFzc2lvbg==",
];

export default function ArtPlayground() {
  const [tool, setTool] = useState<Tool>("encoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [hashType, setHashType] = useState("sha256");
  const [regexPattern, setRegexPattern] = useState("");
  const [regexFlags, setRegexFlags] = useState("gi");
  const [regexInput, setRegexInput] = useState("");
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [converted, setConverted] = useState(false);

  // Encoder/Decoder
  const handleEncode = useCallback(() => {
    try {
      setOutput(btoa(input));
      setConverted(true);
    } catch {
      setOutput("Invalid input for encoding");
    }
  }, [input]);

  const handleDecode = useCallback(() => {
    try {
      setOutput(atob(input));
      setConverted(true);
    } catch {
      setOutput("Invalid Base64 input");
    }
  }, [input]);

  // Hash generator
  const handleHash = useCallback(async () => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      let hash: ArrayBuffer;

      if (hashType === "sha256") {
        hash = await crypto.subtle.digest("SHA-256", data);
      } else if (hashType === "sha1") {
        hash = await crypto.subtle.digest("SHA-1", data);
      } else {
        hash = await crypto.subtle.digest("SHA-512", data);
      }

      const hex = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setOutput(hex);
      setConverted(true);
    } catch {
      setOutput("Error generating hash");
    }
  }, [input, hashType]);

  // Regex tester
  const handleRegex = useCallback(() => {
    try {
      const regex = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(regexInput.matchAll(regex));
      if (matches.length === 0) {
        setRegexMatches(["No matches found"]);
        return;
      }
      setRegexMatches(matches.map((m) => m[0]));
    } catch {
      setRegexMatches(["Invalid regex pattern"]);
    }
  }, [regexPattern, regexFlags, regexInput]);

  // Nmap output parser
  const handleNmapParse = useCallback(() => {
    try {
      const lines = input.split("\n");
      const ports: string[] = [];
      for (const line of lines) {
        const match = line.match(/(\d+)\/tcp\s+open/);
        if (match) {
          ports.push(match[1]);
        }
      }
      setOutput(
        ports.length > 0
          ? `Open Ports: ${ports.join(", ")}`
          : "No open TCP ports found in input"
      );
      setConverted(true);
    } catch {
      setOutput("Error parsing nmap output");
    }
  }, [input]);

  return (
    <section
      id="playground"
      className="relative w-full bg-surface py-20 md:py-32 section-divider overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center gap-4 mb-16">
          <h2
            className="font-display text-3xl md:text-5xl font-extrabold uppercase text-fg"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay }}
          >
            Cyber Tools
          </h2>
          <div className="flex-1 h-1 bg-fg" />
          <span
            className="font-mono text-xs uppercase text-fg-muted tracking-label"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
            }}
          >
            LAB
          </span>
        </div>

        {/* Standalone tool pages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: "JWT Debugger", href: "/tools/jwt", desc: "Decode, inspect, and detect JWT vulnerabilities", color: COLORS.pink },
            { label: "Payload Generator", href: "/tools/payloads", desc: "Reverse shells, XSS, SQLi payloads with variable fill", color: COLORS.blue },
            { label: "MDX Preview", href: "/tools/mdx-preview", desc: "Live MDX editor — see how your notes will render", color: COLORS.green },
          ].map((tool) => (
            <Link key={tool.href} href={tool.href} className="border-2 p-4 cursor-pointer group hover:shadow-brutal-lg transition-all" style={{ borderColor: tool.color, backgroundColor: "var(--surf)" }} data-cursor-label={tool.label}>
              <h3 className="font-display text-lg font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: tool.color }}>{tool.label}</h3>
              <p className="font-mono text-2xs text-fg-muted mt-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{tool.desc}</p>
            </Link>
          ))}
        </div>

        {/* Tool selector */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {([
            { id: "encoder" as Tool, label: "Base64 Encoder/Decoder", icon: "b64" },
            { id: "hash" as Tool, label: "Hash Generator", icon: "#" },
            { id: "regex" as Tool, label: "Regex Tester", icon: "/re/" },
            { id: "nmap-parse" as Tool, label: "Nmap Port Parser", icon: "nmap" },
            { id: "multi-encoder" as Tool, label: "Multi Encoder", icon: "enc" },
            { id: "password" as Tool, label: "Password Analyzer", icon: "pw" },
            { id: "cert" as Tool, label: "Cert Decoder", icon: "x509" },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTool(t.id);
                setInput("");
                setOutput("");
                setConverted(false);
              }}
              className={`font-mono text-xs md:text-sm uppercase px-4 py-2.5 border-2 transition-all cursor-pointer ${
                tool === t.id
                  ? "border-fg bg-fg text-surface"
                  : "border-fg-muted text-fg-muted hover:border-fg hover:text-fg"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tool canvas */}
        <div className="border-2 border-fg shadow-brutal bg-surface min-h-[300px]">
          {/* Tool header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b-2 border-fg bg-fg text-surface">
            <span className="flex gap-1.5">
              <span className="w-2.5 h-2.5 bg-brutal-red border border-surface" />
              <span className="w-2.5 h-2.5 bg-brutal-yellow border border-surface" />
              <span className="w-2.5 h-2.5 bg-brutal-green border border-surface" />
            </span>
            <span
              className="font-mono text-2xs uppercase tracking-label ml-2"
              style={{
                fontFamily: TYPOGRAPHY.fontMono,
                letterSpacing: TYPOGRAPHY.tracking.label,
              }}
            >
              {tool.replace("-", " ")}
            </span>
          </div>

          <div className="p-6 space-y-4">
            {/* Encoder/Decoder */}
            {tool === "encoder" && (
              <>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter text or Base64 to encode/decode..."
                  className="w-full bg-transparent border-2 border-fg font-mono text-sm text-fg p-4 min-h-[120px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  rows={5}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleEncode}
                    className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                    data-cursor-label="Encode"
                  >
                    Encode
                  </button>
                  <button
                    onClick={handleDecode}
                    className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                    data-cursor-label="Decode"
                  >
                    Decode
                  </button>
                </div>
              </>
            )}

            {/* Hash Generator */}
            {tool === "hash" && (
              <>
                <div className="flex gap-3">
                  {(["sha256", "sha1", "sha512"] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setHashType(h)}
                      className={`font-mono text-xs uppercase px-3 py-1.5 border-2 cursor-pointer transition-all ${
                        hashType === h
                          ? "border-brutal-blue bg-brutal-blue text-surface"
                          : "border-fg-muted text-fg-muted hover:border-fg"
                      }`}
                      style={{ fontFamily: TYPOGRAPHY.fontMono }}
                    >
                      {h.toUpperCase()}
                    </button>
                  ))}
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter text to hash..."
                  className="w-full bg-transparent border-2 border-fg font-mono text-sm text-fg p-4 min-h-[80px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  rows={3}
                />
                <button
                  onClick={handleHash}
                  className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  data-cursor-label="Generate Hash"
                >
                  Generate Hash
                </button>
              </>
            )}

            {/* Regex Tester */}
            {tool === "regex" && (
              <>
                <div className="flex gap-3">
                  <input
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    placeholder="/pattern/"
                    className="flex-1 bg-transparent border-2 border-fg font-mono text-sm text-fg px-4 py-2 focus:outline-none focus:border-brutal-blue transition-colors placeholder:text-fg-muted"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  />
                  <input
                    value={regexFlags}
                    onChange={(e) => setRegexFlags(e.target.value)}
                    placeholder="gi"
                    className="w-16 bg-transparent border-2 border-fg font-mono text-sm text-fg px-3 py-2 focus:outline-none focus:border-brutal-blue transition-colors"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  />
                </div>
                <textarea
                  value={regexInput}
                  onChange={(e) => setRegexInput(e.target.value)}
                  placeholder="Text to test regex against..."
                  className="w-full bg-transparent border-2 border-fg font-mono text-sm text-fg p-4 min-h-[80px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  rows={4}
                />
                <button
                  onClick={handleRegex}
                  className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  data-cursor-label="Test Regex"
                >
                  Test Pattern
                </button>
                {regexMatches.length > 0 && (
                  <div className="border-2 border-fg p-3 space-y-1 max-h-[200px] overflow-y-auto">
                    {regexMatches.map((match, i) => (
                      <div
                        key={i}
                        className="font-mono text-sm text-brutal-green"
                        style={{ fontFamily: TYPOGRAPHY.fontMono }}
                      >
                        [{i + 1}] {match}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Nmap Parser */}
            {tool === "nmap-parse" && (
              <>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Paste nmap grepable output...\nExample:\n22/tcp open ssh\n80/tcp open http\n443/tcp closed https`}
                  className="w-full bg-transparent border-2 border-fg font-mono text-sm text-fg p-4 min-h-[150px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  rows={6}
                />
                <button
                  onClick={handleNmapParse}
                  className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
                  style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  data-cursor-label="Parse Ports"
                >
                  Extract Ports
                </button>
              </>
            )}

            {/* Multi Encoder */}
            {tool === "multi-encoder" && <EncoderTool />}

            {/* Password Analyzer */}
            {tool === "password" && <PasswordTool />}

            {/* Certificate Decoder */}
            {tool === "cert" && <CertDecoder />}

            {/* Output (for simple tools) */}
            <AnimatePresence>
              {(output || (tool === "regex" && false)) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={MOTION.smooth}
                  className="border-2 border-brutal-green p-4 bg-brutal-green/5"
                >
                  <span
                    className="font-mono text-2xs uppercase text-brutal-green tracking-label block mb-2"
                    style={{
                      fontFamily: TYPOGRAPHY.fontMono,
                      letterSpacing: TYPOGRAPHY.tracking.label,
                    }}
                  >
                    Output
                  </span>
                  <pre
                    className="font-mono text-sm text-fg whitespace-pre-wrap break-all"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  >
                    {output}
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="mt-2 font-mono text-2xs uppercase text-fg-muted hover:text-fg cursor-pointer border border-fg-muted px-2 py-1 hover:border-fg transition-all"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                    data-cursor-label="Copy Output"
                  >
                    Copy to Clipboard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
