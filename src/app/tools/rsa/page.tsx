"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck, faBolt } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

/**
 * RSA attack helper.
 *
 * RSA is named after Rivest, Shamir and Adleman. Everything here runs in the browser with
 * BigInt, so nothing is uploaded — which matters, because the values you paste are usually
 * a challenge's private key material. The attacks are textbook: they only work on keys that
 * are already broken (a small exponent, a modulus shared between users, or primes chosen
 * too close together), which is exactly what CTF challenges and real-world key audits look
 * for. Every loop is bounded so a large input cannot hang the page.
 */

const MAX_FERMAT_STEPS = 10_000;
const MAX_TRIAL_DIVISOR = 100_000;

const toBig = (value: string): bigint | null => {
  const cleaned = value.trim().replace(/[\s,_]/g, "");
  if (!cleaned) return null;
  try {
    if (/^0x[0-9a-f]+$/i.test(cleaned)) return BigInt(cleaned);
    if (/^\d+$/.test(cleaned)) return BigInt(cleaned);
    return null;
  } catch {
    return null;
  }
};

const modPow = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
  if (modulus === BigInt(1)) return BigInt(0);
  let result = BigInt(1);
  let b = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > BigInt(0)) {
    if (e & BigInt(1)) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e >>= BigInt(1);
  }
  return result;
};

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a < BigInt(0) ? -a : a;
  let y = b < BigInt(0) ? -b : b;
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
};

/** Extended Euclid: returns [g, x, y] with ax + by = g. */
const egcd = (a: bigint, b: bigint): [bigint, bigint, bigint] => {
  if (b === BigInt(0)) return [a, BigInt(1), BigInt(0)];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - (a / b) * y];
};

const modInverse = (a: bigint, m: bigint): bigint | null => {
  const [g, x] = egcd(((a % m) + m) % m, m);
  if (g !== BigInt(1)) return null;
  return ((x % m) + m) % m;
};

const isqrt = (value: bigint): bigint => {
  if (value < BigInt(0)) return -BigInt(1);
  if (value < BigInt(2)) return value;
  let x = value;
  let y = (x + BigInt(1)) / BigInt(2);
  while (y < x) {
    x = y;
    y = (x + value / x) / BigInt(2);
  }
  return x;
};

/** Exact integer e-th root, or null when the value is not a perfect power. */
const iroot = (value: bigint, degree: number): bigint | null => {
  if (value < BigInt(0) || degree < 1) return null;
  const n = BigInt(degree);
  let low = BigInt(0);
  let high = BigInt(1);
  while (high ** n <= value) high *= BigInt(2);
  while (low <= high) {
    const mid = (low + high) / BigInt(2);
    const powered = mid ** n;
    if (powered === value) return mid;
    if (powered < value) low = mid + BigInt(1);
    else high = mid - BigInt(1);
  }
  return null;
};

const toBytes = (value: bigint): number[] => {
  if (value === BigInt(0)) return [0];
  const bytes: number[] = [];
  let v = value;
  while (v > BigInt(0)) {
    bytes.unshift(Number(v & BigInt(0xff)));
    v >>= BigInt(8);
  }
  return bytes;
};

const asAscii = (value: bigint): string | null => {
  const bytes = toBytes(value);
  if (!bytes.length || bytes.some((b) => b < 9 || (b > 13 && b < 32) || b > 126)) return null;
  return bytes.map((b) => String.fromCharCode(b)).join("");
};

interface Finding {
  attack: string;
  detail: string;
  plaintext?: bigint;
  extra?: string;
}

const EXAMPLES: { label: string; hint: string; apply: () => { n: string; e: string; c: string; e2: string; c2: string } }[] = [
  {
    label: "textbook key",
    hint: "p=61, q=53, e=17 — the classic worked example",
    apply: () => ({ n: "3233", e: "17", c: "855", e2: "", c2: "" }),
  },
  {
    label: "small exponent",
    hint: "e=3 with no padding, so the ciphertext is a perfect cube",
    apply: () => ({ n: "1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007", e: "3", c: "4499538564677515723701107349779008033864529077853011417951945943863407469670999201413856887243722398540091730872579003938489184995888577194901782185173705411321885649302629", e2: "", c2: "" }),
  },
];

export default function RsaPage() {
  const [n, setN] = useLocalState("rsa-n", "");
  const [e, setE] = useLocalState("rsa-e", "");
  const [c, setC] = useLocalState("rsa-c", "");
  const [e2, setE2] = useLocalState("rsa-e2", "");
  const [c2, setC2] = useLocalState("rsa-c2", "");
  const { copied, copy } = useCopy();

  const values = useMemo(() => {
    const bigN = toBig(n);
    const bigE = toBig(e);
    const bigC = toBig(c);
    const bigE2 = toBig(e2);
    const bigC2 = toBig(c2);
    return { bigN, bigE, bigC, bigE2, bigC2 };
  }, [n, e, c, e2, c2]);

  const findings = useMemo<Finding[]>(() => {
    const { bigN, bigE, bigC, bigE2, bigC2 } = values;
    const found: Finding[] = [];
    if (!bigN || !bigE) return found;

    // 1. Small public exponent with no padding: the ciphertext is a plain integer power.
    if (bigC && bigE <= BigInt(11)) {
      const root = iroot(bigC, Number(bigE));
      if (root !== null) {
        found.push({
          attack: "Small exponent — exact root",
          detail: `c was a perfect ${bigE.toString()}th power, so no modulus reduction happened and the plaintext falls straight out.`,
          plaintext: root,
        });
      }
    }

    // 2. Common modulus: one n shared by two key pairs lets you combine both ciphertexts.
    if (bigN && bigC && bigE2 && bigC2) {
      const g = gcd(bigE, bigE2);
      const [, a, b] = egcd(bigE, bigE2);
      if (g === BigInt(1)) {
        let m: bigint | null = null;
        const ca = a < BigInt(0) ? modInverse(modPow(bigC, -a, bigN), bigN) : modPow(bigC, a, bigN);
        const cb = b < BigInt(0) ? modInverse(modPow(bigC2, -b, bigN), bigN) : modPow(bigC2, b, bigN);
        if (ca !== null && cb !== null) m = (ca * cb) % bigN;
        if (m !== null) {
          found.push({
            attack: "Common modulus",
            detail: "Two keys share the same n. Bézout coefficients on the two exponents let the plaintext be recovered without factoring.",
            plaintext: m,
          });
        }
      } else {
        found.push({
          attack: "Common modulus — needs work",
          detail: `gcd(e1, e2) = ${g.toString()}, so the plaintext is only recoverable as m^${g.toString()}. A low-exponent root on that may still finish the job.`,
        });
      }
    }

    if (!bigN) return found;

    // 3. Small factors: catches keys built from a weak prime.
    let divisor: bigint | null = null;
    for (let i = BigInt(2); i <= BigInt(MAX_TRIAL_DIVISOR); i += i === BigInt(2) ? BigInt(1) : BigInt(2)) {
      if (bigN % i === BigInt(0)) {
        divisor = i;
        break;
      }
    }
    if (divisor) {
      const other = bigN / divisor;
      found.push({
        attack: "Small factor",
        detail: `n is divisible by ${divisor.toString()}, found by trial division up to ${MAX_TRIAL_DIVISOR.toLocaleString()}.`,
        extra: `n = ${divisor.toString()} × ${other.toString()}`,
      });
    }

    // 4. Fermat: primes chosen too close together, so n is a difference of two squares.
    const root = isqrt(bigN);
    let a = root * root === bigN ? root : root + BigInt(1);
    for (let step = 0; step < MAX_FERMAT_STEPS; step += 1) {
      const b2 = a * a - bigN;
      const bRoot = isqrt(b2);
      if (bRoot * bRoot === b2) {
        const p = a - bRoot;
        const q = a + bRoot;
        if (p > BigInt(1) && q > BigInt(1)) {
          found.push({
            attack: "Fermat factorisation",
            detail: `p and q are too close: recovered after ${step.toString()} step(s) by writing n as the difference of two squares.`,
            extra: `p = ${p.toString()}\nq = ${q.toString()}`,
          });
        }
        break;
      }
      a += BigInt(1);
    }

    // 5. With both primes known, everything else is arithmetic.
    const p = found.find((f) => f.attack === "Fermat factorisation")?.extra?.match(/p = (\d+)/)?.[1];
    const q = found.find((f) => f.attack === "Fermat factorisation")?.extra?.match(/q = (\d+)/)?.[1];
    const smallFactor = found.find((f) => f.attack === "Small factor");
    const pc = divisor ?? (p ? BigInt(p) : null);
    const qc = divisor ? bigN / divisor : q ? BigInt(q) : null;
    if (pc && qc && bigC && bigE) {
      const phi = (pc - BigInt(1)) * (qc - BigInt(1));
      const d = modInverse(bigE, phi);
      if (d !== null) {
        found.push({
          attack: "Decrypt with recovered primes",
          detail: "With p and q in hand, φ(n) and d follow directly, so the ciphertext decrypts normally.",
          plaintext: modPow(bigC, d, bigN),
          extra: `φ(n) = ${phi.toString()}\nd = ${d.toString()}`,
        });
      }
    }
    void smallFactor;
    return found;
  }, [values]);

  const renderPlaintext = (value: bigint) => {
    const ascii = asAscii(value);
    const hex = value.toString(16);
    return (
      <div className="mt-2 space-y-1 font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
        <div className="break-all text-fg">decimal: {value.toString()}</div>
        <div className="break-all text-fg-muted">hex: {hex.length > 120 ? `${hex.slice(0, 120)}…` : hex}</div>
        {ascii && <div className="break-all text-fg">ascii: {ascii}</div>}
      </div>
    );
  };

  const field = (
    label: string,
    value: string,
    setValue: (next: string) => void,
    placeholder: string,
    hint?: string
  ) => (
    <label className="block">
      <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full border-2 border-fg bg-transparent px-3 py-2 font-mono text-xs text-fg placeholder:text-fg-muted/50 focus:outline-none"
        style={{ fontFamily: TYPOGRAPHY.fontMono }}
      />
      {hint && (
        <span className="mt-1 block font-sans text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
          {hint}
        </span>
      )}
    </label>
  );

  return (
    <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
      <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            RSA Attack Lab
          </h1>
          <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
          <span className="font-mono text-xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
            5 checks
          </span>
        </div>

        <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
          Paste a challenge&apos;s modulus, exponent and ciphertext. It looks for the broken-key cases that make RSA
          solvable without brute force, and decrypts outright when it recovers the primes.
        </p>

        <ToolHelp
          intro="RSA — Rivest, Shamir and Adleman, 1977. Security rests entirely on factoring n being hard. Break that assumption and every part of it falls over, which is why so many CTF challenges hand you a deliberately awful key."
          steps={[
            "Paste n, e and c. Add a second exponent and ciphertext when two keys share a modulus.",
            "Read the findings: each one names the weakness and why it applies.",
            "A recovered plaintext is shown as decimal, hex and ASCII where it is printable.",
            "If nothing fires, the key is not obviously broken — attack the padding instead.",
          ]}
          terms={[
            { term: "n — modulus", meaning: "The product of two primes, p × q. Public. Factoring it is the whole game." },
            { term: "e — public exponent", meaning: "Usually 65537. A tiny value like 3 breaks unpadded messages." },
            { term: "c — ciphertext", meaning: "The encrypted message: c = m^e mod n." },
            { term: "φ(n) — totient", meaning: "(p−1)(q−1). Knowing it gives you d, the private exponent." },
            { term: "d — private exponent", meaning: "The decryption key, the modular inverse of e mod φ(n)." },
            { term: "Small exponent", meaning: "With e=3 and no padding, c is just m³ — no modulus wrapped it, so a cube root wins." },
            { term: "Common modulus", meaning: "Two keys sharing one n. Bézout on the two exponents recovers m." },
            { term: "Fermat factorisation", meaning: "When p and q are close, n is a difference of two squares and factors instantly." },
          ]}
          notes={[
            "Bounded on purpose: trial division stops at 100,000 and Fermat at 10,000 steps, so nothing hangs.",
            "Nothing leaves the browser — the values you paste are never sent anywhere.",
            "Use it on challenges and on keys you are authorised to audit. These are published weaknesses, not exploits.",
          ]}
        />

        <div className="my-6 grid gap-4 border-2 border-fg p-4 sm:grid-cols-2">
          {field("n — modulus", n, setN, "e.g. 3233")}
          {field("e — public exponent", e, setE, "e.g. 17", "65537 is the norm; 3 is worth checking.")}
          {field("c — ciphertext", c, setC, "e.g. 855")}
          {field("e₂ — second exponent", e2, setE2, "optional", "Only for the common-modulus case.")}
          {field("c₂ — second ciphertext", c2, setC2, "optional")}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              title={example.hint}
              onClick={() => {
                const next = example.apply();
                setN(next.n);
                setE(next.e);
                setC(next.c);
                setE2(next.e2);
                setC2(next.c2);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg-muted/40 px-2.5 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
              try {example.label}
            </button>
          ))}
        </div>

        {values.bigN && values.bigE && (
          <div className="space-y-3">
            <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>
              {findings.length} finding{findings.length === 1 ? "" : "s"}
            </span>

            {findings.length === 0 && (
              <div className="border-2 p-4 font-mono text-xs" style={{ borderColor: COLORS.orange, color: COLORS.orange, fontFamily: TYPOGRAPHY.fontMono }}>
                No obvious weakness. The key is not broken in any of the easy ways — look at the padding, or at how the
                message was encrypted rather than the key itself.
              </div>
            )}

            {findings.map((finding) => (
              <div key={finding.attack} className="border-2 border-fg" style={{ boxShadow: `4px 4px 0px ${COLORS.green}` }}>
                <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                  <span className="font-display text-sm font-extrabold uppercase text-fg" style={{ fontFamily: TYPOGRAPHY.fontDisplay }}>
                    {finding.attack}
                  </span>
                  <span className="flex-1" />
                  {finding.plaintext !== undefined && (
                    <button
                      type="button"
                      onClick={() => copy(finding.plaintext!.toString())}
                      className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-2 py-0.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
                      style={{ fontFamily: TYPOGRAPHY.fontMono }}
                    >
                      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
                <div className="px-3 py-2">
                  <p className="font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                    {finding.detail}
                  </p>
                  {finding.extra && (
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-2xs text-fg" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {finding.extra}
                    </pre>
                  )}
                  {finding.plaintext !== undefined && renderPlaintext(finding.plaintext)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
