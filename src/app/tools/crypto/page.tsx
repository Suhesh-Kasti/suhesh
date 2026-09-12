"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

const mono = { fontFamily: TYPOGRAPHY.fontMono };
const inputClass = "w-full border-2 border-fg bg-surface px-3 py-2 font-mono text-sm text-fg focus:outline-none";
const buttonClass =
  "inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface disabled:cursor-not-allowed disabled:opacity-40";

const FREQUENCY: Record<string, number> = { e: 12.7, t: 9.1, a: 8.2, o: 7.5, i: 7.0, n: 6.7, s: 6.3, h: 6.1, r: 6.0, d: 4.3, l: 4.0, c: 2.8, u: 2.8, m: 2.4, w: 2.4, f: 2.2, g: 2.0, y: 2.0, p: 1.9, b: 1.5, v: 1.0, k: 0.8, j: 0.15, x: 0.15, q: 0.1, z: 0.07 };

function scoreText(text: string): number {
  let score = 0;
  for (const char of text.toLowerCase()) {
    if (FREQUENCY[char] !== undefined) score += FREQUENCY[char];
    else if (char === " ") score += 3;
    else if (/[a-z0-9]/.test(char)) score += 0.4;
    else if (char === "\n" || char === "\t") score += 0.2;
    else score -= 6;
  }
  return score;
}

function md5(bytes: Uint8Array): string {
  const shifts = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
  const constants = new Uint32Array(64);
  for (let i = 0; i < 64; i++) constants[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  const rotate = (value: number, count: number) => (value << count) | (value >>> (32 - count));

  const bitLength = bytes.length * 8;
  const padded = new Uint8Array((((bytes.length + 8) >> 6) << 6) + 64);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLength >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(bitLength / 4294967296), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const words = new Uint32Array(16);

  for (let chunk = 0; chunk < padded.length; chunk += 64) {
    for (let i = 0; i < 16; i++) words[i] = view.getUint32(chunk + i * 4, true);
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;
    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      f = (f + a + constants[i] + words[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + rotate(f, shifts[i])) >>> 0;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const output = new DataView(new ArrayBuffer(16));
  output.setUint32(0, a0, true);
  output.setUint32(4, b0, true);
  output.setUint32(8, c0, true);
  output.setUint32(12, d0, true);
  return [...new Uint8Array(output.buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha(algorithm: "SHA-1" | "SHA-256" | "SHA-512", text: string): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(input: string): Uint8Array {
  const cleaned = input.replace(/0x/gi, " ").replace(/[^0-9a-fA-F]/g, " ").trim();
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const bytes: number[] = [];
  for (const token of tokens) {
    if (token.length <= 2) bytes.push(parseInt(token, 16));
    else for (let i = 0; i < token.length; i += 2) bytes.push(parseInt(token.slice(i, i + 2), 16));
  }
  return Uint8Array.from(bytes.filter((byte) => !Number.isNaN(byte)));
}

function xorWithByte(bytes: Uint8Array, key: number): Uint8Array {
  const output = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) output[i] = bytes[i] ^ key;
  return output;
}

function printable(bytes: Uint8Array): string {
  return [...bytes].map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".")).join("");
}

function caesar(text: string, shift: number): string {
  return text.replace(/[a-z]/gi, (char) => {
    const base = char === char.toLowerCase() ? 97 : 65;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  });
}

type Tab = "hash" | "xor" | "caesar" | "frequency";
const ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-512"] as const;

export default function CryptoLabPage() {
  const [tab, setTab] = useLocalState<Tab>("crypto-tab", "hash");
  const [target, setTarget] = useLocalState("crypto-target", "");
  const [algorithm, setAlgorithm] = useLocalState<(typeof ALGORITHMS)[number]>("crypto-algorithm", "MD5");
  const [wordlist, setWordlist] = useLocalState("crypto-wordlist", "password\nadmin\nletmein\nschizo");
  const [mutate, setMutate] = useLocalState("crypto-mutate", true);
  const [cracked, setCracked] = useState<string | null>(null);
  const [tried, setTried] = useState(0);
  const [cracking, setCracking] = useState(false);
  const [cipher, setCipher] = useLocalState("crypto-cipher", "");
  const { copied, copy } = useCopy();

  const candidates = useMemo(() => {
    const base = wordlist.split(/\n/).map((word) => word.trim()).filter(Boolean);
    if (!mutate) return base;
    const leet: Record<string, string> = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7" };
    const out = new Set<string>();
    for (const word of base) {
      out.add(word);
      out.add(word[0].toUpperCase() + word.slice(1));
      out.add(word.toUpperCase());
      out.add(word.replace(/[aeiost]/gi, (char) => leet[char.toLowerCase()] ?? char));
      for (const year of ["2024", "2025", "2026"]) out.add(word + year);
      for (const digit of ["1", "12", "123", "!"]) out.add(word + digit);
    }
    return [...out];
  }, [wordlist, mutate]);

  const candidateHashes = useMemo(() => {
    const map = new Map<string, string>();
    for (const candidate of candidates) map.set(md5(new TextEncoder().encode(candidate)), candidate);
    return map;
  }, [candidates]);

  const crack = async () => {
    const wanted = target.trim().toLowerCase();
    if (!wanted) return;
    setCracking(true);
    setCracked(null);
    setTried(0);
    try {
      if (algorithm === "MD5") {
        const found = candidateHashes.get(wanted) ?? null;
        setTried(candidates.length);
        setCracked(found);
      } else {
        for (let index = 0; index < candidates.length; index++) {
          const digest = await sha(algorithm, candidates[index]);
          if (digest === wanted) {
            setCracked(candidates[index]);
            setTried(index + 1);
            setCracking(false);
            return;
          }
          if (index % 200 === 0) setTried(index + 1);
        }
        setTried(candidates.length);
      }
    } finally {
      setCracking(false);
    }
  };

  const xorBytes = useMemo(() => hexToBytes(cipher), [cipher]);
  const xorResults = useMemo(() => {
    if (xorBytes.length === 0) return [];
    return Array.from({ length: 256 }, (_, key) => {
      const text = printable(xorWithByte(xorBytes, key));
      return { key: key.toString(16).padStart(2, "0"), text, score: scoreText(text) };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [xorBytes]);

  const caesarResults = useMemo(() => {
    if (!cipher.trim()) return [];
    return Array.from({ length: 26 }, (_, shift) => {
      const text = caesar(cipher, shift);
      return { shift, text, score: scoreText(text) };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [cipher]);

  const frequency = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const char of cipher.toLowerCase()) {
      if (/[a-z]/.test(char)) {
        counts[char] = (counts[char] ?? 0) + 1;
        total++;
      }
    }
    return Object.entries(counts)
      .map(([letter, count]) => ({ letter, count, percent: total ? Math.round((count / total) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 14);
  }, [cipher]);

  const chip = "cursor-pointer border-2 px-2.5 py-1 font-mono text-2xs uppercase transition-colors";

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
              Crypto Lab
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              ctf toolbox
            </span>
          </div>

          <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            The crypto you actually meet in CTFs: crack a hash against a wordlist you build yourself, then break XOR, Caesar and letter frequencies. Everything runs in this tab.
          </p>

          <ToolHelp
            intro="CTF crypto is mostly guessing smarter. Wordlist attacks beat brute force, single-byte XOR falls to frequency scoring, and Caesar is just 26 guesses. Pick the tab for the problem in front of you."
            steps={[
              "Hash tab: paste a digest, choose the algorithm, and crack it against your wordlist.",
              "XOR tab: paste ciphertext as hex and read the best-scoring single-byte keys.",
              "Caesar tab: see all 26 shifts ranked by English likelihood.",
              "Frequency tab: compare letter counts against normal English to spot a substitution.",
            ]}
            terms={[
              { term: "Wordlist attack", meaning: "Trying likely passwords instead of every combination. Fast and often enough." },
              { term: "Mutation", meaning: "Leetspeak, capitalisation and appended years multiply your candidates cheaply." },
              { term: "Single-byte XOR", meaning: "The whole message is XORed with one byte. 256 guesses is nothing." },
              { term: "Scoring", meaning: "Ranking guesses by how English they look using letter frequencies." },
              { term: "Caesar / ROT", meaning: "A fixed alphabet shift. ROT13 is shift 13." },
            ]}
            notes={[
              "Build the wordlist from the challenge itself — names, product names and words in the description.",
              "If single-byte XOR gives nothing readable, try repeating-key XOR and look for the key length first.",
              "Hashes are computed locally, so nothing you paste leaves the browser.",
            ]}
          />

          <div className="mb-6 flex flex-wrap gap-1.5">
            {(["hash", "xor", "caesar", "frequency"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTab(option)}
                aria-pressed={tab === option}
                className={`${chip} ${tab === option ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                style={mono}
              >
                {option}
              </button>
            ))}
          </div>

          {tab === "hash" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    target hash
                  </span>
                  <input value={target} onChange={(event) => setTarget(event.target.value)} spellCheck={false} className={inputClass} style={mono} />
                </div>
                <div>
                  <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    algorithm
                  </span>
                  <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as (typeof ALGORITHMS)[number])} className={inputClass} style={mono}>
                    {ALGORITHMS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-2 border-fg">
                <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                  <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                    wordlist · {candidates.length} candidates
                  </span>
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setMutate((value) => !value)}
                    aria-pressed={mutate}
                    className={`${chip} ${mutate ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted"}`}
                    style={mono}
                  >
                    mutations
                  </button>
                </div>
                <textarea
                  value={wordlist}
                  onChange={(event) => setWordlist(event.target.value)}
                  rows={6}
                  spellCheck={false}
                  placeholder="one candidate per line"
                  className="w-full resize-y bg-transparent p-3 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                />
                <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-3 py-2">
                  <button type="button" onClick={crack} disabled={cracking || !target.trim()} className={buttonClass} style={mono}>
                    {cracking ? "Cracking..." : "Crack"}
                  </button>
                  <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    {tried} tried
                  </span>
                  <span className="flex-1" />
                  <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    {algorithm} runs in your browser
                  </span>
                </div>
              </div>

              {cracked && (
                <div className="border-2 p-3" style={{ borderColor: COLORS.green }}>
                  <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: COLORS.green }}>
                    cracked
                  </span>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <code className="font-mono text-lg text-fg" style={mono}>
                      {cracked}
                    </code>
                    <button type="button" onClick={() => copy(cracked)} className={buttonClass} style={mono}>
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                      copy
                    </button>
                  </div>
                </div>
              )}

              {!cracked && tried > 0 && !cracking && (
                <p className="border-2 p-3 font-mono text-xs" style={{ ...mono, borderColor: COLORS.orange, color: COLORS.orange }}>
                  No match in {tried} candidates. Add words from the challenge, or enable mutations.
                </p>
              )}
            </div>
          )}

          {(tab === "xor" || tab === "caesar" || tab === "frequency") && (
            <textarea
              value={cipher}
              onChange={(event) => setCipher(event.target.value)}
              rows={4}
              spellCheck={false}
              placeholder={tab === "xor" ? "ciphertext as hex, e.g. 1b37373331363f78151b7f2b783431333d" : "ciphertext"}
              className={inputClass}
              style={mono}
            />
          )}

          {tab === "xor" && xorResults.length > 0 && (
            <div className="mt-4 border-2 border-fg divide-y divide-fg-muted/15">
              {xorResults.map((result) => (
                <div key={result.key} className="flex flex-wrap items-center gap-3 px-3 py-2">
                  <span className="w-16 shrink-0 font-mono text-xs" style={{ ...mono, color: COLORS.pink }}>
                    0x{result.key}
                  </span>
                  <code className="min-w-0 flex-1 break-all font-mono text-xs text-fg" style={mono}>
                    {result.text}
                  </code>
                  <span className="shrink-0 font-mono text-2xs text-fg-muted" style={mono}>
                    {Math.round(result.score)}
                  </span>
                  <button type="button" onClick={() => copy(result.text)} className={buttonClass} style={mono}>
                    copy
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "caesar" && caesarResults.length > 0 && (
            <div className="mt-4 border-2 border-fg divide-y divide-fg-muted/15">
              {caesarResults.map((result) => (
                <div key={result.shift} className="flex flex-wrap items-center gap-3 px-3 py-2">
                  <span className="w-16 shrink-0 font-mono text-xs" style={{ ...mono, color: COLORS.pink }}>
                    shift {result.shift}
                  </span>
                  <code className="min-w-0 flex-1 break-all font-mono text-xs text-fg" style={mono}>
                    {result.text}
                  </code>
                  <span className="shrink-0 font-mono text-2xs text-fg-muted" style={mono}>
                    {Math.round(result.score)}
                  </span>
                  <button type="button" onClick={() => copy(result.text)} className={buttonClass} style={mono}>
                    copy
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "frequency" && frequency.length > 0 && (
            <div className="mt-4 border-2 border-fg divide-y divide-fg-muted/15">
              {frequency.map((entry) => (
                <div key={entry.letter} className="flex items-center gap-3 px-3 py-1.5">
                  <span className="w-8 shrink-0 font-mono text-sm uppercase" style={{ ...mono, color: COLORS.teal }}>
                    {entry.letter}
                  </span>
                  <div className="h-3 flex-1 border border-fg-muted/30">
                    <div className="h-full" style={{ width: `${Math.min(100, entry.percent * 4)}%`, backgroundColor: COLORS.teal }} />
                  </div>
                  <span className="w-20 shrink-0 text-right font-mono text-2xs text-fg-muted" style={mono}>
                    {entry.count} · {entry.percent}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
