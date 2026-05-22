"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { TYPOGRAPHY, COLORS, MOTION } from "@/lib/design-tokens";

interface JwtParts { header: any; payload: any; signature: string; raw: string; }

function parseJwt(token: string): JwtParts | null {
  try {
    const [headerB64, payloadB64, sig] = token.split(".");
    if (!headerB64 || !payloadB64 || !sig) return null;
    const header = JSON.parse(atob(headerB64.replace(/-/g, "+").replace(/_/g, "/")));
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    return { header, payload, signature: sig, raw: token };
  } catch { return null; }
}

function detectIssues(parts: JwtParts): string[] {
  const issues: string[] = [];
  if (parts.header.alg === "none") issues.push("DANGER: 'alg' is 'none' — signature bypass possible");
  if (parts.header.alg?.startsWith("HS") && parts.header.typ === "JWT") issues.push("INFO: HS algorithm used — asymmetric → symmetric confusion possible");
  if (parts.payload.exp && Date.now() / 1000 > parts.payload.exp) issues.push("WARN: Token is EXPIRED");
  if (!parts.payload.exp) issues.push("INFO: No expiration claim — token lives forever");
  if (!parts.payload.iat) issues.push("INFO: No issued-at claim");
  if (!parts.payload.sub && !parts.payload.iss) issues.push("INFO: No subject or issuer — token may be anonymous");
  return issues;
}

export default function JwtDebugger() {
  const [token, setToken] = useState("");
  const [parsed, setParsed] = useState<JwtParts | null>(null);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const handleParse = useCallback(() => {
    setError("");
    const result = parseJwt(token.trim());
    if (result) {
      setParsed(result);
    } else {
      setError("Invalid JWT format. Expected: header.payload.signature");
      setParsed(null);
    }
  }, [token]);

  const issues = parsed ? detectIssues(parsed) : [];

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative w-full py-20 md:py-32" style={{ backgroundColor: "var(--surf)" }}>
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4 mb-10">
              <h1 className="font-display text-3xl md:text-5xl font-extrabold uppercase" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>JWT Debugger</h1>
              <div className="flex-1 h-1" style={{ backgroundColor: "var(--fg)" }} />
              <span className="font-mono text-xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>jwt.io eat your heart out</span>
            </div>

            {/* Chaos background */}
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-[0.03] dark:opacity-[0.06]">
              {[...Array(30)].map((_, i) => (
                <motion.div key={i} className="absolute" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 4 + Math.random() * 8, height: 4 + Math.random() * 8, backgroundColor: COLORS.pink }}
                  animate={{ x: [(Math.random() - 0.5) * 100], y: [(Math.random() - 0.5) * 100], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 + Math.random() * 3, repeatType: "mirror" }} />
              ))}
            </div>

            {/* Input */}
            <div className="border-2 shadow-brutal mb-8" style={{ borderColor: "var(--fg)", backgroundColor: "var(--surf)" }}>
              <div className="px-4 py-2 border-b-2 flex items-center justify-between" style={{ borderColor: "var(--fg)", backgroundColor: "var(--fg)", color: "var(--surf)" }}>
                <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>paste JWT token</span>
              </div>
              <div className="p-4">
                <textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U" className="w-full bg-transparent border-2 font-mono text-sm p-3 min-h-[80px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted" style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }} rows={3} />
                <button onClick={handleParse} className="mt-3 font-mono text-xs uppercase px-4 py-2 border-2 hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ borderColor: "var(--fg)", color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}>Decode JWT</button>
                {error && <p className="mt-2 font-mono text-2xs text-brutal-red" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{error}</p>}
              </div>
            </div>

            {/* Results */}
            <AnimatePresence>
              {parsed && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Security Issues */}
                  {issues.length > 0 && (
                    <div className="border-2 p-4" style={{ borderColor: COLORS.red, backgroundColor: `${COLORS.red}10` }}>
                      <h3 className="font-mono text-xs uppercase font-bold mb-2" style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.red }}>Security Issues</h3>
                      {issues.map((issue, i) => (
                        <div key={i} className="font-mono text-2xs py-1" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>[!] {issue}</div>
                      ))}
                    </div>
                  )}

                  {/* Header + Payload side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border-2 p-4" style={{ borderColor: COLORS.blue }}>
                      <h3 className="font-mono text-xs uppercase font-bold mb-3" style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.blue }}>HEADER</h3>
                      <pre className="font-mono text-sm whitespace-pre-wrap" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>{JSON.stringify(parsed.header, null, 2)}</pre>
                    </div>
                    <div className="border-2 p-4" style={{ borderColor: COLORS.green }}>
                      <h3 className="font-mono text-xs uppercase font-bold mb-3" style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.green }}>PAYLOAD</h3>
                      <pre className="font-mono text-sm whitespace-pre-wrap" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>{JSON.stringify(parsed.payload, null, 2)}</pre>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="border-2 p-4" style={{ borderColor: COLORS.orange }}>
                    <h3 className="font-mono text-xs uppercase font-bold mb-2" style={{ fontFamily: TYPOGRAPHY.fontMono, color: COLORS.orange }}>SIGNATURE</h3>
                    <code className="font-mono text-sm break-all" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>{parsed.signature}</code>
                  </div>

                  {/* Raw toggle */}
                  <button onClick={() => setShowRaw(!showRaw)} className="font-mono text-2xs uppercase px-3 py-1.5 border cursor-pointer" style={{ borderColor: "var(--fg-muted)", color: "var(--fg-muted)", fontFamily: TYPOGRAPHY.fontMono }}>{showRaw ? "HIDE RAW" : "SHOW RAW TOKEN"}</button>
                  {showRaw && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-2 p-4 overflow-hidden" style={{ borderColor: "var(--fg)" }}>
                      <pre className="font-mono text-xs whitespace-pre-wrap break-all" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>{parsed.raw}</pre>
                      <button onClick={() => { navigator.clipboard.writeText(parsed.raw); setCopiedRaw(true); setTimeout(() => setCopiedRaw(false), 2000); }} className="mt-2 font-mono text-2xs uppercase px-2 py-0.5 border cursor-pointer" style={{ borderColor: "var(--fg-muted)", color: "var(--fg-muted)", fontFamily: TYPOGRAPHY.fontMono }}><FontAwesomeIcon icon={copiedRaw ? faCheck : faCopy} beatFade={copiedRaw} /></button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
      <SearchButton />
    </>
  );
}
