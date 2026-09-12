"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

type Confidence = "high" | "medium" | "low";
type Category = "Fast hash" | "Password hash" | "Windows" | "Checksum" | "Encoding" | "Format";

interface Algorithm {
  name: string;
  category: Category;
  shape: string;
  test: RegExp;
  confidence: Confidence;
  why: string;
  hashcat?: string;
  john?: string;
}

const CONFIDENCE_COLOR: Record<Confidence, string> = { high: COLORS.green, medium: COLORS.yellow, low: COLORS.orange };
const CATEGORIES: Category[] = ["Fast hash", "Password hash", "Windows", "Checksum", "Encoding", "Format"];

const ALGORITHMS: Algorithm[] = [
  { name: "MD5", category: "Fast hash", shape: "32 hex characters", test: /^[a-f0-9]{32}$/i, confidence: "high", why: "128-bit digest, written as 32 hex characters.", hashcat: "-m 0", john: "raw-md5" },
  { name: "NTLM", category: "Windows", shape: "32 hex characters", test: /^[a-f0-9]{32}$/i, confidence: "medium", why: "Identical shape to MD5. Only the source tells them apart — a Windows SAM dump means NTLM.", hashcat: "-m 1000", john: "nt" },
  { name: "SHA-1", category: "Fast hash", shape: "40 hex characters", test: /^[a-f0-9]{40}$/i, confidence: "high", why: "160-bit digest. Deprecated for signatures but still everywhere.", hashcat: "-m 100", john: "raw-sha1" },
  { name: "SHA-224", category: "Fast hash", shape: "56 hex characters", test: /^[a-f0-9]{56}$/i, confidence: "high", why: "224-bit truncated SHA-2.", hashcat: "-m 1300" },
  { name: "SHA-256", category: "Fast hash", shape: "64 hex characters", test: /^[a-f0-9]{64}$/i, confidence: "high", why: "256-bit digest, the current default for integrity.", hashcat: "-m 1400", john: "raw-sha256" },
  { name: "SHA-384", category: "Fast hash", shape: "96 hex characters", test: /^[a-f0-9]{96}$/i, confidence: "high", why: "384-bit truncated SHA-2.", hashcat: "-m 10800" },
  { name: "SHA-512", category: "Fast hash", shape: "128 hex characters", test: /^[a-f0-9]{128}$/i, confidence: "high", why: "512-bit digest.", hashcat: "-m 1700", john: "raw-sha512" },
  { name: "CRC32", category: "Checksum", shape: "8 hex characters", test: /^[a-f0-9]{8}$/i, confidence: "medium", why: "Too short to be a real hash — usually a checksum.", hashcat: undefined, john: "crc32" },
  { name: "MySQL 4.1+", category: "Password hash", shape: "* followed by 40 hex", test: /^\*[A-F0-9]{40}$/i, confidence: "high", why: "The leading asterisk is MySQL's double-SHA1 password format.", hashcat: "-m 300" },
  { name: "bcrypt", category: "Password hash", shape: "$2a$ / $2b$ / $2y$ + cost + 53 chars", test: /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, confidence: "high", why: "The cost factor is embedded, which is why it is long. $2b$ is the current variant.", hashcat: "-m 3200", john: "bcrypt" },
  { name: "SHA-512 crypt", category: "Password hash", shape: "$6$ prefix", test: /^\$6\$/, confidence: "high", why: "Unix /etc/shadow format using SHA-512.", hashcat: "-m 1800", john: "sha512crypt" },
  { name: "SHA-256 crypt", category: "Password hash", shape: "$5$ prefix", test: /^\$5\$/, confidence: "high", why: "Unix /etc/shadow format using SHA-256.", hashcat: "-m 7400", john: "sha256crypt" },
  { name: "MD5 crypt", category: "Password hash", shape: "$1$ prefix", test: /^\$1\$/, confidence: "high", why: "Old Unix crypt format built on MD5.", hashcat: "-m 500", john: "md5crypt" },
  { name: "Argon2", category: "Password hash", shape: "$argon2id$ / argon2i / argon2d", test: /^\$argon2(id|i|d)\$/, confidence: "high", why: "Modern memory-hard password hash. The variant is in the prefix.", hashcat: "identify first", john: "argon2" },
  { name: "PHPass / WordPress", category: "Password hash", shape: "$P$ or $H$ prefix", test: /^\$[PH]\$/, confidence: "high", why: "Portable PHP hash used by WordPress and phpBB.", hashcat: "-m 400", john: "phpass" },
  { name: "Django PBKDF2", category: "Password hash", shape: "pbkdf2_sha256$…", test: /^pbkdf2_sha(256|1)\$/, confidence: "high", why: "Django's default password format, with iterations and salt inline.", hashcat: "-m 10000", john: "django" },
  { name: "LDAP {SHA}", category: "Password hash", shape: "{SHA} + base64", test: /^\{SHA\}[A-Za-z0-9+/=]+$/, confidence: "high", why: "Base64 of a raw SHA-1 digest, used by LDAP.", hashcat: "-m 101" },
  { name: "LDAP {SSHA}", category: "Password hash", shape: "{SSHA} + base64", test: /^\{SSHA\}[A-Za-z0-9+/=]+$/, confidence: "high", why: "Salted SHA-1 for LDAP.", hashcat: "-m 111" },
  { name: "JWT", category: "Format", shape: "three base64url segments", test: /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/, confidence: "high", why: "This is a JSON Web Token, not a hash. Decode and verify it in the JWT Debugger." },
  { name: "SHA-224 / SHA-256 (raw)", category: "Format", shape: "base64 of a digest", test: /^[A-Za-z0-9+/]{43}=$/, confidence: "low", why: "43 base64 characters decode to 32 bytes, which is a raw SHA-256 digest." },
  { name: "Base64", category: "Encoding", shape: "alphanumeric with +/= padding", test: /^[A-Za-z0-9+/]{16,}={0,2}$/, confidence: "low", why: "Looks encoded, not hashed. Decode it before you try to crack it." },
  { name: "DES crypt (legacy)", category: "Password hash", shape: "13 characters", test: /^[./0-9A-Za-z]{13}$/, confidence: "low", why: "Old 13-character Unix crypt hash. Trivially crackable today.", hashcat: "-m 1500", john: "descrypt" },
];

const EXAMPLES = [
  { label: "MD5", value: "5d41402abc4b2a76b9719d911017c592" },
  { label: "SHA-1", value: "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d" },
  { label: "SHA-256", value: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824" },
  { label: "bcrypt", value: "$2b$12$GhvMmNVjRW29ulnudl.LbuAnUtN.LMYWOsShMWzTOExE9MlCwWJ3u" },
  { label: "MySQL", value: "*94BDCEBE19083CE2A1F959FD02F964C7AF4CFC29" },
  { label: "NTLM", value: "8846f7eaee8fb117ad06bdd830b7586c" },
];

export default function HashIdPage() {
  const [input, setInput] = useLocalState("hashid-input", "");
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useLocalState<{ value: string; result: string }[]>("hashid-history", []);
  const { copied, copy } = useCopy();

  const matches = useMemo(() => {
    const value = input.trim();
    if (!value) return [];
    return ALGORITHMS.filter((algorithm) => algorithm.test.test(value)).sort(
      (a, b) => ({ high: 0, medium: 1, low: 2 })[a.confidence] - ({ high: 0, medium: 1, low: 2 })[b.confidence]
    );
  }, [input]);

  const reference = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ALGORITHMS.filter((algorithm) => {
      const categoryOk = category === "all" || algorithm.category === category;
      const searchOk = !query || algorithm.name.toLowerCase().includes(query) || algorithm.shape.toLowerCase().includes(query);
      return categoryOk && searchOk;
    });
  }, [category, search]);

  const remember = () => {
    const value = input.trim();
    if (!value || matches.length === 0) return;
    const entry = { value: value.slice(0, 90), result: matches[0].name };
    setHistory((prev) => [entry, ...prev.filter((item) => item.value !== entry.value)].slice(0, 12));
  };

  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const chip = "cursor-pointer border-2 px-2.5 py-1 font-mono text-2xs uppercase transition-colors";

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
              Hash Identifier
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              {ALGORITHMS.length} formats
            </span>
          </div>

          <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            Paste a digest and get the likely algorithms, why they match, and the exact hashcat mode to crack it with.
          </p>

          <ToolHelp
            intro="Identifiers read the shape of a digest: length, character set, and prefixes like $2b$ or {SSHA}. That narrows the field, it does not prove anything — several algorithms share a shape, so let the source decide."
            steps={[
              "Paste a hash; candidates appear as you type.",
              "Read the confidence badge, then the reason it matched.",
              "Copy the hashcat mode and crack it offline in an authorised lab.",
              "Use the reference table below to look up a format by shape.",
            ]}
            terms={[
              { term: "Fast hash", meaning: "MD5, SHA-1, SHA-2. Designed to be quick, so billions of guesses per second are possible." },
              { term: "Password hash", meaning: "bcrypt, Argon2, crypt. Deliberately slow and salted, so cracking is expensive." },
              { term: "Salt", meaning: "Random data stored with the hash. It defeats precomputed tables, not guessing." },
              { term: "Confidence", meaning: "High means the shape is unambiguous; low means other formats fit too." },
              { term: "Hashcat mode", meaning: "The -m number that tells hashcat which algorithm to expect." },
            ]}
            notes={[
              "Length alone cannot separate MD5 from NTLM. Context is the deciding factor.",
              "If it decodes cleanly from base64, it is probably encoded data rather than a hash.",
              "Always crack from a copy — never paste a live production hash into a third-party service.",
            ]}
          />

          <div className="my-6 border-2 border-fg" style={{ backgroundColor: "var(--surf)" }}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              spellCheck={false}
              placeholder="Paste a hash, for example 5d41402abc4b2a76b9719d911017c592"
              className="w-full resize-y bg-transparent p-4 font-mono text-sm text-fg focus:outline-none"
              style={mono}
            />
            <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-3 py-2">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                {input.trim().length} chars
              </span>
              <span className="flex-1" />
              {matches.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    copy(input.trim());
                    remember();
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
                  style={mono}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                  {copied ? "Copied" : "Copy hash"}
                </button>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => setInput(example.value)}
                className="cursor-pointer border-2 border-fg-muted/40 px-2.5 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                style={mono}
              >
                try {example.label}
              </button>
            ))}
          </div>

          {matches.length > 0 && (
            <div className="mb-8 space-y-3">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                {matches.length} candidate{matches.length === 1 ? "" : "s"}
              </span>
              {matches.map((match) => (
                <div key={match.name} className="border-2 border-fg" style={{ boxShadow: `4px 4px 0px ${CONFIDENCE_COLOR[match.confidence]}` }}>
                  <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                    <span className="font-display text-sm font-extrabold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>
                      {match.name}
                    </span>
                    <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: CONFIDENCE_COLOR[match.confidence], color: CONFIDENCE_COLOR[match.confidence] }}>
                      {match.confidence}
                    </span>
                    <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                      {match.category}
                    </span>
                    <span className="flex-1" />
                    {match.hashcat && (
                      <button
                        type="button"
                        onClick={() => copy(`hashcat ${match.hashcat} hash.txt wordlist.txt`)}
                        className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-2 py-0.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
                        style={mono}
                      >
                        <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                        hashcat {match.hashcat}
                      </button>
                    )}
                  </div>
                  <p className="px-3 py-2 font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                    {match.why}
                    {match.john ? ` John: ${match.john}.` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}

          {input.trim().length > 0 && matches.length === 0 && (
            <div className="mb-8 border-2 p-4 font-mono text-xs" style={{ ...mono, borderColor: COLORS.orange, color: COLORS.orange }}>
              Nothing matched. Check for trailing whitespace, or paste the full hash string from the dump.
            </div>
          )}

          <div className="border-2 border-fg">
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
              <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Format reference
              </span>
              <span className="flex-1" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="search formats..."
                spellCheck={false}
                className="w-40 border border-current bg-transparent px-2 py-0.5 font-mono text-2xs text-surface placeholder:text-surface/50 focus:outline-none"
                style={mono}
              />
            </div>
            <div className="flex flex-wrap gap-1.5 border-b-2 border-fg p-3">
              <button
                type="button"
                onClick={() => setCategory("all")}
                aria-pressed={category === "all"}
                className={`${chip} ${category === "all" ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                style={mono}
              >
                all
              </button>
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`${chip} ${category === item ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                  style={mono}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="divide-y divide-fg-muted/15">
              {reference.map((algorithm) => (
                <div key={algorithm.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                  <span className="w-36 shrink-0 font-mono text-xs font-bold uppercase text-fg" style={mono}>
                    {algorithm.name}
                  </span>
                  <span className="min-w-0 flex-1 font-mono text-2xs text-fg-muted" style={mono}>
                    {algorithm.shape}
                  </span>
                  <span className="shrink-0 font-mono text-2xs uppercase" style={{ ...mono, color: CONFIDENCE_COLOR[algorithm.confidence] }}>
                    {algorithm.confidence}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="mt-8">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Recent
              </span>
              <div className="mt-2 border-2 border-fg divide-y divide-fg-muted/15">
                {history.map((entry) => (
                  <button
                    key={entry.value}
                    type="button"
                    onClick={() => setInput(entry.value)}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-fg/[0.04]"
                  >
                    <code className="min-w-0 flex-1 truncate font-mono text-xs text-fg" style={mono}>
                      {entry.value}
                    </code>
                    <span className="shrink-0 font-mono text-2xs uppercase text-fg-muted" style={mono}>
                      {entry.result}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
