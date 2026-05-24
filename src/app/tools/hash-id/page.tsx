"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import DataBar from "@/components/mdx/DataBar";

const STORAGE_KEY = "hash-id-history";

interface HashResult {
  name: string;
  confidence: "high" | "medium" | "low";
  detail: string;
}

function identifyHash(input: string): HashResult[] {
  const s = input.trim();
  if (!s) return [];

  const results: HashResult[] = [];

  // Length-based + pattern detection
  if (/^[a-f0-9]{32}$/i.test(s)) {
    results.push({ name: "MD5", confidence: "high", detail: "32 hex characters" });
    results.push({ name: "NTLM", confidence: "medium", detail: "Same format as MD5 — needs context" });
  }
  if (/^[a-f0-9]{40}$/i.test(s)) {
    results.push({ name: "SHA-1", confidence: "high", detail: "40 hex characters" });
    results.push({ name: "MySQL 4.1+", confidence: "low", detail: "If starts with *, otherwise SHA-1" });
  }
  if (s.startsWith("*") && /^\*[a-f0-9]{40}$/i.test(s)) {
    results.push({ name: "MySQL 4.1+", confidence: "high", detail: "Asterisk prefix + 40 hex chars" });
  }
  if (/^[a-f0-9]{64}$/i.test(s)) {
    results.push({ name: "SHA-256", confidence: "high", detail: "64 hex characters" });
  }
  if (/^[a-f0-9]{96}$/i.test(s)) {
    results.push({ name: "SHA-384", confidence: "high", detail: "96 hex characters" });
  }
  if (/^[a-f0-9]{128}$/i.test(s)) {
    results.push({ name: "SHA-512", confidence: "high", detail: "128 hex characters" });
  }
  if (/^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/.test(s)) {
    results.push({ name: "bcrypt", confidence: "high", detail: "$2a$/2b$/2y$ format with cost factor" });
  }
  if (/^\$5\$/.test(s)) {
    results.push({ name: "SHA-256 Crypt", confidence: "high", detail: "$5$ prefix (Unix crypt)" });
  }
  if (/^\$6\$/.test(s)) {
    results.push({ name: "SHA-512 Crypt", confidence: "high", detail: "$6$ prefix (Unix crypt)" });
  }
  if (/^[a-f0-9]{8}$/i.test(s)) {
    results.push({ name: "CRC32", confidence: "medium", detail: "8 hex characters — could be a short checksum" });
  }
  if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length % 4 === 0 && s.length > 20) {
    results.push({ name: "Base64", confidence: "medium", detail: "Alphanumeric with +/= padding, length divisible by 4" });
  }
  if (/^[a-f0-9]{56}$/i.test(s)) {
    results.push({ name: "SHA-224", confidence: "high", detail: "56 hex characters" });
  }
  if (/^\$argon2/.test(s)) {
    const variant = s.includes("$argon2id$") ? "Argon2id" : s.includes("$argon2i$") ? "Argon2i" : "Argon2d";
    results.push({ name: variant, confidence: "high", detail: "Argon2 format — modern password hashing" });
  }
  if (/^[a-f0-9]{34}$/i.test(s)) {
    results.push({ name: "CRC32B", confidence: "low", detail: "34 hex chars (unusual length)" });
  }
  if (s.startsWith("$P$") || s.startsWith("$H$")) {
    results.push({ name: "phpass / WordPress", confidence: "high", detail: "$P$ or $H$ prefix (PHPass)" });
  }
  if (s.startsWith("{SHA}")) {
    results.push({ name: "LDAP {SHA}", confidence: "high", detail: "{SHA} prefix — Base64(SHA-1)" });
  }
  if (s.startsWith("{SSHA}")) {
    results.push({ name: "LDAP {SSHA}", confidence: "high", detail: "{SSHA} prefix — salted SHA-1" });
  }
  if (s.startsWith("sha256$") || s.startsWith("sha512$")) {
    results.push({ name: "Django / Werkzeug", confidence: "high", detail: "Django-style algorithm$salt$hash format" });
  }

  if (results.length === 0) {
    results.push({ name: "Unknown", confidence: "low", detail: `Unrecognized format — ${s.length} chars, check manually` });
  }

  return results.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "#00dd44",
  medium: "#ffdd00",
  low: "#ff2d95",
};

export default function HashIdPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<HashResult[]>([]);
  const [history, setHistory] = useState<{hash:string;result:string}[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHistory(JSON.parse(saved));
    setMounted(true);
  }, []);

  const handleIdentify = useCallback(() => {
    const r = identifyHash(input);
    setResults(r);
    if (input.trim() && r.length > 0) {
      const entry = { hash: input.trim().slice(0, 80), result: r[0].name };
      const updated = [entry, ...history.filter(h => h.hash !== entry.hash)].slice(0, 20);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [input, history]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 min-h-screen" style={{ backgroundColor: "var(--surf)" }}>
        <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase mb-2" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Hash Identifier
          </h1>
          <p className="font-mono text-sm text-fg-muted mb-10" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Paste a hash and I&apos;ll tell you what it might be
          </p>

          <div className="border-2 border-fg bg-surface">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleIdentify(); } }}
              placeholder="Paste a hash here... (e.g., 5d41402abc4b2a76b9719d911017c592)"
              className="w-full bg-transparent p-5 font-mono text-sm resize-none focus:outline-none placeholder:text-fg-muted/50"
              style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)", minHeight: 100 }}
              spellCheck={false}
            />
            <div className="flex items-center justify-between px-5 py-3 border-t-2 border-fg bg-fg text-surface">
              <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                {input.length} chars
              </span>
              <button
                onClick={handleIdentify}
                className="font-mono text-xs uppercase px-4 py-2 border-2 border-surface hover:bg-white/10 transition-colors cursor-pointer"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                Identify
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="font-mono text-xs uppercase text-fg-muted tracking-label mb-4" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Possible Types
              </h3>
              {results.map((r, i) => (
                <div
                  key={i}
                  className="border-2 border-fg p-4 bg-surface flex items-start gap-4"
                >
                  <div
                    className="w-3 h-3 mt-1 shrink-0"
                    style={{ backgroundColor: CONFIDENCE_COLORS[r.confidence] }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>
                        {r.name}
                      </span>
                      <span
                        className="font-mono text-2xs uppercase px-2 py-0.5 border"
                        style={{
                          fontFamily: TYPOGRAPHY.fontMono,
                          borderColor: CONFIDENCE_COLORS[r.confidence],
                          color: CONFIDENCE_COLORS[r.confidence],
                        }}
                      >
                        {r.confidence}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                      {r.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          {history.length > 0 && mounted && (
            <div className="mt-12">
              <h3 className="font-mono text-xs uppercase text-fg-muted tracking-label mb-4" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                History
              </h3>
              <div className="border-2 border-fg divide-y-2 divide-fg">
                {history.slice(0, 10).map((h, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2">
                    <code className="font-mono text-xs text-fg truncate max-w-[60%]" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {h.hash}
                    </code>
                    <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {h.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      <SearchButton />
    </>
  );
}
