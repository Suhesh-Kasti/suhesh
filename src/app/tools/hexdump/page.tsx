"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

const SIGNATURES: { hex: string; name: string; sample: string }[] = [
  { hex: "4d5a", name: "Windows PE / EXE", sample: "4d5a90000300000004000000ffff0000" },
  { hex: "7f454c46", name: "ELF binary", sample: "7f454c46020101000000000000000000" },
  { hex: "89504e470d0a1a0a", name: "PNG image", sample: "89504e470d0a1a0a0000000d49484452" },
  { hex: "ffd8ff", name: "JPEG image", sample: "ffd8ffe000104a46494600010100000100" },
  { hex: "474946383961", name: "GIF image", sample: "47494638396101000100800000ffffff" },
  { hex: "504b0304", name: "ZIP / Office / JAR", sample: "504b0304140000000800" },
  { hex: "25504446", name: "PDF document", sample: "255044462d312e370d0a25c7ec8fa20a" },
  { hex: "1f8b", name: "GZIP archive", sample: "1f8b08000000000000ff" },
  { hex: "52494646", name: "RIFF (WAV / AVI)", sample: "524946462400000057415645666d7420" },
  { hex: "d0cf11e0a1b11ae1", name: "Legacy Office / MSI", sample: "d0cf11e0a1b11ae10000000000000000" },
  { hex: "cafebabe", name: "Java class", sample: "cafebabe0000003400120a00" },
  { hex: "7b5c727466", name: "RTF document", sample: "7b5c727466315c616e7369" },
];

const PRINTABLE = /^[\x20-\x7e]$/;

function parseHex(raw: string): number[] {
  const cleaned = raw.replace(/0x/gi, " ").replace(/[^0-9a-fA-F]/g, " ");
  const tokens = cleaned.trim().split(/\s+/).filter(Boolean);
  const bytes: number[] = [];
  for (const token of tokens) {
    if (token.length <= 2) {
      bytes.push(parseInt(token, 16));
      continue;
    }
    for (let index = 0; index < token.length; index += 2) bytes.push(parseInt(token.slice(index, index + 2), 16));
  }
  return bytes;
}

function entropyOf(bytes: number[]): number {
  if (bytes.length === 0) return 0;
  const counts = new Array(256).fill(0);
  for (const byte of bytes) counts[byte]++;
  let entropy = 0;
  for (const count of counts) {
    if (count === 0) continue;
    const p = count / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function asciiOf(byte: number): string {
  return PRINTABLE.test(String.fromCharCode(byte)) ? String.fromCharCode(byte) : ".";
}

function hexOf(byte: number): string {
  return byte.toString(16).padStart(2, "0");
}

export default function HexdumpPage() {
  const [input, setInput] = useLocalState("hexdump-input", "");
  const [selected, setSelected] = useState<number | null>(null);
  const { copied, copy } = useCopy();

  const bytes = useMemo(() => parseHex(input), [input]);
  const entropy = useMemo(() => entropyOf(bytes), [bytes]);
  const printableRatio = useMemo(
    () => (bytes.length === 0 ? 0 : bytes.filter((byte) => PRINTABLE.test(String.fromCharCode(byte))).length / bytes.length),
    [bytes]
  );

  const signature = useMemo(() => {
    const head = bytes.slice(0, 12).map(hexOf).join("");
    return SIGNATURES.find((entry) => head.startsWith(entry.hex)) ?? null;
  }, [bytes]);

  const strings = useMemo(() => {
    const found: string[] = [];
    let current = "";
    for (const byte of bytes) {
      const char = String.fromCharCode(byte);
      if (PRINTABLE.test(char)) {
        current += char;
      } else {
        if (current.length >= 4) found.push(current);
        current = "";
      }
    }
    if (current.length >= 4) found.push(current);
    return [...new Set(found)].slice(0, 40);
  }, [bytes]);

  const rows = useMemo(() => {
    const output: { offset: number; bytes: number[] }[] = [];
    for (let index = 0; index < bytes.length; index += 16) output.push({ offset: index, bytes: bytes.slice(index, index + 16) });
    return output;
  }, [bytes]);

  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const buttonClass =
    "inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface";

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
              Hex Dump Analyzer
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              {bytes.length} bytes
            </span>
          </div>

          <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            Paste hex and read it the way a hex editor would: offsets, ASCII gutter, magic bytes, entropy and extractable strings.
          </p>

          <ToolHelp
            intro="A hex dump is raw bytes with their offsets and an ASCII gutter. The first bytes identify the real file type regardless of the extension, and the entropy tells you whether what follows is text, compressed or encrypted."
            steps={[
              "Paste hex with or without spaces, or straight from xxd or hexdump.",
              "Check the detected signature and the entropy reading.",
              "Click any byte to inspect its offset, decimal, hex and binary form.",
              "Copy extracted strings for use in your notes.",
            ]}
            terms={[
              { term: "Magic bytes", meaning: "The leading bytes that identify a format. Extensions lie, these do not." },
              { term: "Entropy", meaning: "Randomness from 0 to 8 bits per byte. Near 8 means compressed or encrypted; near 4 or below means text." },
              { term: "ASCII gutter", meaning: "The right-hand column showing the bytes as text, dots for non-printable." },
              { term: "Offset", meaning: "The byte position, shown in hex on the left." },
            ]}
            notes={[
              "Always verify an upload's magic bytes, not its name or its Content-Type.",
              "High entropy with no known signature is usually packed, compressed or encrypted data.",
              "Long readable runs in the gutter mean try strings next and read the whole file.",
            ]}
          />

          <div className="my-6 border-2 border-fg" style={{ backgroundColor: "var(--surf)" }}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={6}
              spellCheck={false}
              placeholder="7f454c46020101000000000000000000  or  4d5a900003000000..."
              className="w-full resize-y bg-transparent p-4 font-mono text-xs leading-relaxed text-fg focus:outline-none"
              style={mono}
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {SIGNATURES.slice(0, 6).map((entry) => (
              <button
                key={entry.hex}
                type="button"
                onClick={() => setInput(entry.sample)}
                className="cursor-pointer border-2 border-fg-muted/40 px-2.5 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                style={mono}
              >
                try {entry.name}
              </button>
            ))}
          </div>

          {bytes.length > 0 && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="border-2 border-fg p-3">
                  <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    File type
                  </span>
                  <p className="mt-1 font-mono text-sm" style={{ ...mono, color: signature ? COLORS.green : COLORS.orange }}>
                    {signature?.name ?? "no known signature"}
                  </p>
                </div>
                <div className="border-2 border-fg p-3">
                  <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    Entropy
                  </span>
                  <p className="mt-1 font-mono text-sm text-fg" style={mono}>
                    {entropy.toFixed(2)} / 8 bits
                  </p>
                  <div className="mt-2 h-2 w-full border border-fg-muted/30">
                    <div className="h-full" style={{ width: `${(entropy / 8) * 100}%`, backgroundColor: entropy > 7 ? COLORS.orange : entropy > 5 ? COLORS.yellow : COLORS.green }} />
                  </div>
                </div>
                <div className="border-2 border-fg p-3">
                  <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    Printable
                  </span>
                  <p className="mt-1 font-mono text-sm text-fg" style={mono}>
                    {Math.round(printableRatio * 100)}%
                  </p>
                  <p className="mt-1 font-mono text-2xs text-fg-muted" style={mono}>
                    {bytes.length} bytes parsed
                  </p>
                </div>
              </div>

              <div className="mb-6 border-2 border-fg">
                <div className="flex items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
                  <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                    xxd view
                  </span>
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => copy(bytes.map(hexOf).join(" "))}
                    className="inline-flex cursor-pointer items-center gap-1 border border-current px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
                    style={mono}
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                    copy hex
                  </button>
                </div>
                <div className="max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed" style={mono}>
                  {rows.map((row) => (
                    <div key={row.offset} className="flex gap-3 whitespace-nowrap">
                      <span className="text-fg-muted">{row.offset.toString(16).padStart(8, "0")}</span>
                      <span className="flex gap-1">
                        {row.bytes.map((byte, index) => {
                          const absolute = row.offset + index;
                          const active = selected === absolute;
                          return (
                            <button
                              key={absolute}
                              type="button"
                              onClick={() => setSelected(active ? null : absolute)}
                              className="cursor-pointer px-0.5 uppercase transition-colors"
                              style={{ color: byte === 0 ? "var(--fg-muted)" : "var(--fg)", backgroundColor: active ? "color-mix(in srgb, var(--pink) 25%, transparent)" : "transparent" }}
                              title={`offset ${absolute} · 0x${hexOf(byte)} · ${byte}`}
                            >
                              {hexOf(byte)}
                            </button>
                          );
                        })}
                      </span>
                      <span className="text-fg-muted">
                        {row.bytes.map((byte) => asciiOf(byte)).join("")}
                      </span>
                    </div>
                  ))}
                </div>
                {selected !== null && bytes[selected] !== undefined && (
                  <div className="flex flex-wrap items-center gap-4 border-t-2 border-fg px-3 py-2 font-mono text-2xs uppercase" style={mono}>
                    <span>
                      offset <span style={{ color: COLORS.pink }}>{selected}</span>
                    </span>
                    <span>
                      hex <span style={{ color: COLORS.pink }}>0x{hexOf(bytes[selected])}</span>
                    </span>
                    <span>
                      dec <span style={{ color: COLORS.pink }}>{bytes[selected]}</span>
                    </span>
                    <span>
                      bin <span style={{ color: COLORS.pink }}>{bytes[selected].toString(2).padStart(8, "0")}</span>
                    </span>
                    <span>
                      char <span style={{ color: COLORS.pink }}>{asciiOf(bytes[selected])}</span>
                    </span>
                  </div>
                )}
              </div>

              {strings.length > 0 && (
                <div className="mb-6 border-2 border-fg">
                  <div className="flex items-center gap-2 border-b-2 border-fg px-3 py-2">
                    <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                      Extracted strings ({strings.length})
                    </span>
                    <span className="flex-1" />
                    <button type="button" onClick={() => copy(strings.join("\n"))} className={buttonClass} style={mono}>
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                      copy all
                    </button>
                  </div>
                  <div className="max-h-56 overflow-auto divide-y divide-fg-muted/15">
                    {strings.map((value) => (
                      <div key={value} className="break-all px-3 py-1.5 font-mono text-xs text-fg" style={mono}>
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="border-2 border-fg">
            <div className="border-b-2 border-fg px-3 py-2">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Signature reference
              </span>
            </div>
            <div className="divide-y divide-fg-muted/15">
              {SIGNATURES.map((entry) => (
                <button
                  key={entry.hex}
                  type="button"
                  onClick={() => setInput(entry.sample)}
                  className="flex w-full cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2 text-left transition-colors hover:bg-fg/[0.04]"
                >
                  <span className="w-32 shrink-0 font-mono text-2xs uppercase" style={{ ...mono, color: COLORS.teal }}>
                    {entry.hex}
                  </span>
                  <span className="min-w-0 flex-1 font-sans text-xs text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                    {entry.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
