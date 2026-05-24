"use client";

import { useState, useCallback, useMemo } from "react";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import DataBar from "@/components/mdx/DataBar";

const MAGIC_BYTES: Array<{ sig: string; name: string }> = [
  { sig: "89504e47", name: "PNG Image" },
  { sig: "ffd8ff", name: "JPEG Image" },
  { sig: "47494638", name: "GIF Image" },
  { sig: "25504446", name: "PDF Document" },
  { sig: "504b0304", name: "ZIP Archive / Office Doc" },
  { sig: "7f454c46", name: "ELF Executable (Linux)" },
  { sig: "4d5a", name: "PE Executable (Windows)" },
  { sig: "cafebabe", name: "Java Class / Mach-O Fat Binary" },
  { sig: "52617221", name: "RAR Archive" },
  { sig: "377abcaf", name: "7-Zip Archive" },
  { sig: "1f8b08", name: "GZIP Compressed" },
  { sig: "425a68", name: "BZIP2 Compressed" },
  { sig: "fd377a58", name: "XZ Compressed" },
  { sig: "000001ba", name: "MPEG Video" },
  { sig: "000001b3", name: "MPEG Video" },
  { sig: "494433", name: "MP3 Audio" },
  { sig: "52494646", name: "RIFF (WAV/AVI)" },
  { sig: "38425053", name: "PSD (Photoshop)" },
  { sig: "d0cf11e0", name: "MS Office Doc (OLE)" },
  { sig: "edabeedb", name: "RPM Package" },
];

interface HexRow {
  offset: string;
  hex: string[];
  ascii: string;
  highlights: number[]; // indices of non-printable bytes
}

function isPrintable(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7e;
}

function parseHexDump(raw: string): { rows: HexRow[]; magic: string | null; entropy: number } {
  // Strip "0x" prefixes, whitespace, non-hex chars from the input
  const cleaned = raw.replace(/0x/gi, "").replace(/[^0-9a-fA-F\n]/g, "");
  const hexBlocks = cleaned.split(/\n/).filter(Boolean);

  // Try each line as hex — flatten to byte array
  let allBytes: number[] = [];
  for (const block of hexBlocks) {
    const pairs = block.match(/.{1,2}/g);
    if (!pairs) continue;
    for (const pair of pairs) {
      const val = parseInt(pair, 16);
      if (!isNaN(val)) allBytes.push(val);
    }
  }

  if (allBytes.length === 0) return { rows: [], magic: null, entropy: 0 };

  // Magic bytes detection
  const firstHex = allBytes.slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
  let magic: string | null = null;
  for (const { sig, name } of MAGIC_BYTES) {
    if (firstHex.toLowerCase().startsWith(sig.toLowerCase())) {
      magic = name;
      break;
    }
  }

  // Entropy (Shannon)
  const freq = new Array(256).fill(0);
  for (const b of allBytes) freq[b]++;
  let entropy = 0;
  for (const f of freq) {
    if (f === 0) continue;
    const p = f / allBytes.length;
    entropy -= p * Math.log2(p);
  }

  // Build rows (16 bytes per row)
  const rows: HexRow[] = [];
  for (let i = 0; i < allBytes.length; i += 16) {
    const chunk = allBytes.slice(i, i + 16);
    rows.push({
      offset: i.toString(16).padStart(8, "0"),
      hex: chunk.map(b => b.toString(16).padStart(2, "0")),
      ascii: chunk.map(b => isPrintable(b) ? String.fromCharCode(b) : ".").join(""),
      highlights: chunk.map((b, j) => isPrintable(b) ? -1 : j),
    });
  }

  return { rows, magic, entropy };
}

export default function HexDumpPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof parseHexDump>>();

  const handleParse = useCallback(() => {
    setResult(parseHexDump(input));
  }, [input]);

  const entropyColor = useMemo(() => {
    if (!result) return "#888";
    if (result.entropy > 7) return "#ff2d95";
    if (result.entropy > 5) return "#ffdd00";
    return "#00dd44";
  }, [result]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 min-h-screen" style={{ backgroundColor: "var(--surf)" }}>
        <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase mb-2" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Hex Dump Analyzer
          </h1>
          <p className="font-mono text-sm text-fg-muted mb-10" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Paste raw hex and get magic bytes, entropy, and highlighted xxd-style output
          </p>

          <div className="border-2 border-fg bg-surface">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`4d5a900003000000...  (PE executable)\nor: 7f 45 4c 46 02 01 01 00...  (ELF binary)`}
              className="w-full bg-transparent p-5 font-mono text-xs resize-none focus:outline-none placeholder:text-fg-muted/40"
              style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)", minHeight: 100 }}
              spellCheck={false}
            />
            <div className="flex items-center justify-between px-5 py-3 border-t-2 border-fg bg-fg text-surface">
              <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                {input.replace(/\s/g, "").length / 2} bytes
              </span>
              <button
                onClick={handleParse}
                className="font-mono text-xs uppercase px-4 py-2 border-2 border-surface hover:bg-white/10 transition-colors cursor-pointer"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                Parse
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-8 space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border-2 border-fg p-4 bg-surface">
                  <span className="font-mono text-2xs uppercase tracking-label text-fg-muted block mb-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Magic Bytes</span>
                  <span className="font-mono text-sm font-bold" style={{ fontFamily: TYPOGRAPHY.fontMono, color: result.magic ? "#00dd44" : "var(--fg-muted)" }}>
                    {result.magic || "Not detected"}
                  </span>
                </div>
                <div className="border-2 border-fg p-4 bg-surface">
                  <span className="font-mono text-2xs uppercase tracking-label text-fg-muted block mb-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Entropy</span>
                  <span className="font-mono text-sm font-bold" style={{ fontFamily: TYPOGRAPHY.fontMono, color: entropyColor }}>
                    {result.entropy.toFixed(3)}
                  </span>
                </div>
                <div className="border-2 border-fg p-4 bg-surface">
                  <span className="font-mono text-2xs uppercase tracking-label text-fg-muted block mb-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Size</span>
                  <span className="font-mono text-sm font-bold" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>
                    {result.rows.length * 16} bytes
                  </span>
                </div>
              </div>

              {/* Hex dump output */}
              <div className="border-2 border-fg bg-brutal-black overflow-x-auto">
                <div className="px-3 py-2 border-b-2 border-fg bg-fg text-surface flex items-center gap-2">
                  <span className="flex gap-1"><span className="w-2 h-2" style={{ backgroundColor: "#ff1144" }} /><span className="w-2 h-2" style={{ backgroundColor: "#ffdd00" }} /><span className="w-2 h-2" style={{ backgroundColor: "#00dd44" }} /></span>
                  <span className="font-mono text-2xs uppercase ml-2" style={{ fontFamily: TYPOGRAPHY.fontMono }}>xxd-style output</span>
                </div>
                <div className="p-3 font-mono text-xs leading-relaxed" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                  {result.rows.map((row, ri) => (
                    <div key={ri} className="flex gap-4 hover:bg-white/5">
                      <span style={{ color: "#888" }}>{row.offset}</span>
                      <span className="flex gap-1 flex-1">
                        {row.hex.map((h, hi) => {
                          const byte = parseInt(h, 16);
                          const isNonPrintable = !isPrintable(byte);
                          const isNull = byte === 0;
                          return (
                            <span
                              key={hi}
                              style={{
                                color: isNull ? "#ff2d95" : isNonPrintable ? "#ff8800" : "#00dd44",
                              }}
                              title={`0x${h} = ${isPrintable(byte) ? String.fromCharCode(byte) : "non-printable"}`}
                            >
                              {h}
                            </span>
                          );
                        })}
                      </span>
                      <span style={{ color: "#00e5ff", minWidth: "10ch" }}>|{row.ascii}|</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Byte analysis DataBar */}
              {result.rows.length > 0 && (
                <div className="mt-4">
                  <span className="font-mono text-2xs uppercase tracking-label text-fg-muted block mb-2" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                    Byte Distribution Patterns
                  </span>
                  <DataBar
                    data={[
                      { label: "00 (Null)", value: result.rows.reduce((s, r) => s + r.hex.filter(h => h === "00").length, 0), color: "#ff2d95" },
                      { label: "FF (255)", value: result.rows.reduce((s, r) => s + r.hex.filter(h => h === "ff").length, 0), color: "#ff8800" },
                      { label: "Printable", value: result.rows.reduce((s, r) => s + r.hex.filter(h => { const b = parseInt(h, 16); return b >= 0x20 && b <= 0x7e; }).length, 0), color: "#00dd44" },
                      { label: "Other", value: result.rows.reduce((s, r) => s + r.hex.filter(h => { const b = parseInt(h, 16); const p = b >= 0x20 && b <= 0x7e; return !p && h !== "00" && h !== "ff"; }).length, 0), color: "#0055ff" },
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <SearchButton />
    </>
  );
}
