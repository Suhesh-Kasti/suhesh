"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt, faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

/**
 * Binary unpacker.
 *
 * A hex dump shows you the bytes; unpacking tells you what they *mean*. The same four bytes
 * are 16909060 or 67305985 depending on byte order, or a small float, or a Unix timestamp —
 * and picking the wrong reading is how CTF reversing goes sideways. Everything here is local
 * and read-only: the bytes never leave the browser, and no parsing can execute anything.
 */

const MAX_BYTES = 4096;

const EXAMPLES = [
  { label: "uint32 (big-endian)", value: "01020304", hint: "Bytes in order: 0x01020304" },
  { label: "same bytes, little-endian", value: "04030201", hint: "The same set of bytes, read the other way round" },
  { label: "unix timestamp", value: "66000000", hint: "A little-endian 32-bit timestamp — 2024-03-24" },
  { label: "float 3.14", value: "c3f54840", hint: "IEEE-754 single precision, little-endian" },
];

/** Hex in any common shape: 0x prefixes, spaces, colons, commas, \x escapes. */
function parseHex(raw: string): Uint8Array | null {
  const cleaned = raw
    .replace(/\\x/gi, "")
    .replace(/0x/gi, "")
    .replace(/[\s,:;_\-]/g, "");
  if (!cleaned) return new Uint8Array();
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return null;
  const padded = cleaned.length % 2 ? `${cleaned}0` : cleaned;
  const bytes = new Uint8Array(padded.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(padded.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

const printable = (byte: number) => byte >= 32 && byte <= 126;

export default function UnpackPage() {
  const [raw, setRaw] = useLocalState("unpack-input", "66000000");
  const [littleEndian, setLittleEndian] = useLocalState("unpack-endian", true);
  const [offset, setOffset] = useLocalState("unpack-offset", "0");
  const [length, setLength] = useLocalState("unpack-length", "");
  const { copied, copy } = useCopy();

  const parsed = useMemo(() => parseHex(raw), [raw]);

  const slice = useMemo(() => {
    if (!parsed) return null;
    const start = Math.max(0, Number.parseInt(offset || "0", 10) || 0);
    const wanted = Number.parseInt(length || "", 10);
    const end = Number.isFinite(wanted) && wanted > 0 ? start + wanted : parsed.length;
    return parsed.slice(start, Math.min(end, parsed.length));
  }, [parsed, offset, length]);

  const reads = useMemo(() => {
    if (!slice || slice.length === 0) return [];
    // Copy into a standalone buffer so DataView reads are always aligned.
    const buffer = new ArrayBuffer(slice.length);
    const bytes = new Uint8Array(buffer);
    bytes.set(slice);
    const view = new DataView(buffer);
    const le = littleEndian;
    const rows: { label: string; value: string; note?: string }[] = [];

    const need = (n: number) => slice.length >= n;
    if (need(1)) {
      rows.push({ label: "uint8", value: String(view.getUint8(0)) });
      rows.push({ label: "int8", value: String(view.getInt8(0)) });
    }
    if (need(2)) {
      rows.push({ label: "uint16", value: String(view.getUint16(0, le)) });
      rows.push({ label: "int16", value: String(view.getInt16(0, le)) });
    }
    if (need(4)) {
      const u32 = view.getUint32(0, le);
      rows.push({ label: "uint32", value: String(u32) });
      rows.push({ label: "int32", value: String(view.getInt32(0, le)) });
      rows.push({ label: "float32", value: String(view.getFloat32(0, le)) });
      const seconds = u32;
      if (seconds > 946_684_800 && seconds < 2_208_988_800) {
        rows.push({
          label: "as unix time",
          value: new Date(seconds * 1000).toISOString().replace(".000Z", "Z"),
          note: "The uint32 reading looks like a plausible timestamp.",
        });
      }
    }
    if (need(8)) {
      const hi = view.getUint32(0, false);
      const lo = view.getUint32(4, false);
      const combined = le ? (BigInt(hi) << BigInt(32)) | BigInt(lo) : (BigInt(lo) << BigInt(32)) | BigInt(hi);
      rows.push({ label: "uint64", value: combined.toString() });
      rows.push({ label: "int64", value: view.getBigInt64(0, le).toString() });
      rows.push({ label: "float64", value: String(view.getFloat64(0, le)) });
      const ms = Number(combined);
      if (Number.isFinite(ms) && combined > BigInt(1_000_000_000_000) && combined < BigInt(4_000_000_000_000)) {
        rows.push({
          label: "as unix time (ms)",
          value: new Date(ms).toISOString().replace(".000Z", "Z"),
          note: "The uint64 reading looks like a millisecond timestamp.",
        });
      }
    }
    return rows;
  }, [slice, littleEndian]);

  const asText = useMemo(() => {
    if (!slice) return "";
    return [...slice].map((b) => (printable(b) ? String.fromCharCode(b) : ".")).join("");
  }, [slice]);

  const asJson = useMemo(() => {
    if (!slice || slice.length === 0) return null;
    const text = new TextDecoder().decode(slice);
    const trimmed = text.trim();
    if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return null;
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      return null;
    }
  }, [slice]);

  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const row = "flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-fg-muted/15 px-3 py-2 last:border-b-0";

  return (
    <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
      <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Binary Unpacker
          </h1>
          <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
          <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
            {slice ? slice.length : 0} bytes
          </span>
        </div>

        <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
          Paste hex and read it as the values it could represent — integers, floats, text and timestamps — in either
          byte order. A hex dump shows the bytes; this tells you what they mean.
        </p>

        <ToolHelp
          intro="Unpacking reads a binary layout the way the program that wrote it would. The same four bytes are 0x01020304 or 0x04030201 depending on byte order, and picking the wrong one is how reversing goes sideways."
          steps={[
            "Paste hex — spaces, colons, 0x prefixes and \\x escapes are all accepted.",
            "Flip endianness and watch which readings become plausible.",
            "Use offset and length to isolate one field of a struct instead of the whole buffer.",
            "Copy any reading, or the ASCII view, into your notes or a script.",
          ]}
          terms={[
            { term: "Endianness", meaning: "Byte order. Little-endian stores the least significant byte first, which is what x86 does." },
            { term: "uint / int", meaning: "Unsigned treats the top bit as value; signed treats it as a negative sign in two's complement." },
            { term: "float32 / float64", meaning: "IEEE-754. The bits are not a number line, so 3.14 is not a neat byte pattern." },
            { term: "Unix time", meaning: "Seconds since 1970. A plausible-looking timestamp often tells you the field's meaning." },
            { term: "Offset", meaning: "How far into the buffer to start reading — a struct's field positions are fixed." },
            { term: "Hex dump", meaning: "A byte-level view. Useful for spotting patterns, useless for values until you unpack it." },
          ]}
          notes={[
            "Capped at 4096 bytes so a huge paste cannot lock up the page.",
            "Nothing is uploaded and nothing is executed — the bytes are only ever read.",
            "If a reading looks meaningless in both byte orders, the field is probably a different width than you assumed.",
          ]}
        />

        <div className="my-6 border-2 border-fg">
          <textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            rows={3}
            spellCheck={false}
            placeholder="Paste hex, for example 66 00 00 00"
            className="w-full resize-y bg-transparent p-4 font-mono text-sm text-fg focus:outline-none"
            style={mono}
          />
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-fg px-3 py-2">
            <button
              type="button"
              onClick={() => setLittleEndian((value) => !value)}
              aria-pressed={littleEndian}
              className="cursor-pointer border-2 border-fg px-2.5 py-1 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
              style={mono}
            >
              {littleEndian ? "little-endian" : "big-endian"}
            </button>
            <input
              value={offset}
              onChange={(event) => setOffset(event.target.value)}
              placeholder="offset"
              className="w-20 border-2 border-fg-muted/40 px-2 py-1 font-mono text-2xs text-fg focus:border-fg focus:outline-none"
              style={mono}
            />
            <input
              value={length}
              onChange={(event) => setLength(event.target.value)}
              placeholder="length"
              className="w-20 border-2 border-fg-muted/40 px-2 py-1 font-mono text-2xs text-fg focus:border-fg focus:outline-none"
              style={mono}
            />
            <span className="flex-1" />
            <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
              {parsed ? `${parsed.length} bytes parsed` : "invalid hex"}
            </span>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              title={example.hint}
              onClick={() => {
                setRaw(example.value);
                setOffset("0");
                setLength("");
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg-muted/40 px-2.5 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
              style={mono}
            >
              <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
              try {example.label}
            </button>
          ))}
        </div>

        {!parsed && (
          <div className="mb-8 border-2 p-4 font-mono text-xs" style={{ ...mono, borderColor: COLORS.orange, color: COLORS.orange }}>
            That is not valid hex. Odd digit counts are padded, but every character must be 0-9 or a-f.
          </div>
        )}

        {parsed && slice && slice.length > MAX_BYTES && (
          <div className="mb-8 border-2 p-4 font-mono text-xs" style={{ ...mono, borderColor: COLORS.yellow, color: COLORS.yellow }}>
            Showing the first {MAX_BYTES} bytes. Use offset and length to look further in.
          </div>
        )}

        {reads.length > 0 && (
          <div className="mb-8 border-2 border-fg">
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
              <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Interpretations ({littleEndian ? "little" : "big"}-endian)
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => copy(reads.map((r) => `${r.label}: ${r.value}`).join("\n"))}
                className="inline-flex cursor-pointer items-center gap-1.5 border border-current px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
                style={mono}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                {copied ? "Copied" : "Copy all"}
              </button>
            </div>
            <div>
              {reads.map((reading) => (
                <div key={reading.label} className={row}>
                  <span className="w-28 shrink-0 font-mono text-xs font-bold uppercase text-fg" style={mono}>
                    {reading.label}
                  </span>
                  <span className="min-w-0 flex-1 break-all font-mono text-xs text-fg" style={mono}>
                    {reading.value}
                  </span>
                  {reading.note && (
                    <span className="w-full font-sans text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                      {reading.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {slice && slice.length > 0 && (
          <div className="space-y-4">
            <div className="border-2 border-fg">
              <div className="border-b-2 border-fg bg-fg px-3 py-2 font-mono text-2xs uppercase text-surface" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Bytes
              </div>
              <pre className="overflow-x-auto whitespace-pre p-4 font-mono text-2xs leading-relaxed text-fg" style={mono}>
                {(() => {
                  const lines: string[] = [];
                  for (let i = 0; i < slice.length; i += 16) {
                    const chunk = slice.slice(i, i + 16);
                    const hex = [...chunk].map((b) => b.toString(16).padStart(2, "0")).join(" ");
                    const text = [...chunk].map((b) => (printable(b) ? String.fromCharCode(b) : ".")).join("");
                    lines.push(`${(i + Number.parseInt(offset || "0", 10)).toString(16).padStart(6, "0")}  ${hex.padEnd(47)}  ${text}`);
                  }
                  return lines.join("\n");
                })()}
              </pre>
            </div>

            <div className="border-2 border-fg px-3 py-2">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                ASCII
              </span>
              <p className="mt-1 break-all font-mono text-xs text-fg" style={mono}>
                {asText}
              </p>
            </div>

            {asJson && (
              <div className="border-2 border-fg">
                <div className="border-b-2 border-fg bg-fg px-3 py-2 font-mono text-2xs uppercase text-surface" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  Decoded as JSON
                </div>
                <pre className="max-h-72 overflow-auto p-4 font-mono text-xs leading-relaxed text-fg" style={mono}>
                  {asJson}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
