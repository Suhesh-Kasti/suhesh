"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY, MOTION } from "@/lib/design-tokens";

interface CertFields {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
  san: string[];
  algorithm: string;
  keySize: string;
}

function parseCert(pem: string): CertFields | null {
  try {
    const b64 = pem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g, "");
    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    // Extract minimal fields via regex on PEM text
    const subjectMatch = pem.match(/Subject:\s*(.+)/i);
    const issuerMatch = pem.match(/Issuer:\s*(.+)/i);
    const notBefore = pem.match(/Not Before:\s*(.+)/i);
    const notAfter = pem.match(/Not After\s*:\s*(.+)/i);
    const serialMatch = pem.match(/Serial Number:\s*([0-9A-Fa-f:]+)/i);
    const fingerprint = pem.match(/SHA256 Fingerprint[=:]\s*([0-9A-Fa-f:]+)/i);
    const sanMatch = pem.match(/DNS:([^\s,]+)/g);
    const algoMatch = pem.match(/Signature Algorithm:\s*(.+)/i);
    const keyMatch = pem.match(/Public[ -]Key:\s*\(?(\d+)\s*bit/i);

    return {
      subject: subjectMatch?.[1] ?? "Could not parse",
      issuer: issuerMatch?.[1] ?? "Could not parse",
      validFrom: notBefore?.[1]?.trim() ?? "Unknown",
      validTo: notAfter?.[1]?.trim() ?? "Unknown",
      serialNumber: serialMatch?.[1]?.replace(/:/g, "") ?? "Unknown",
      fingerprint: fingerprint?.[1]?.replace(/:/g, "").toLowerCase() ?? "Unknown",
      san: sanMatch?.map((s) => s.replace("DNS:", "")) ?? [],
      algorithm: algoMatch?.[1] ?? "Unknown",
      keySize: keyMatch?.[1] ?? "Unknown",
    };
  } catch {
    return null;
  }
}

export default function CertDecoder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CertFields | null>(null);
  const [error, setError] = useState("");

  const handleDecode = useCallback(() => {
    setError("");
    const parsed = parseCert(input);
    if (parsed) {
      setResult(parsed);
    } else {
      setError("Could not parse certificate. Paste PEM format (openssl x509 -text output).");
      setResult(null);
    }
  }, [input]);

  return (
    <div className="border-2 border-fg shadow-brutal bg-surface">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-fg bg-fg text-surface">
        <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>certificate decoder</span>
        <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>x509</span>
      </div>
      <div className="p-4 space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste output of:\nopenssl s_client -connect example.com:443 2>/dev/null | openssl x509 -text\n\nOr paste a PEM certificate directly...`}
          className="w-full bg-transparent border-2 border-fg font-mono text-sm p-3 min-h-[120px] resize-none focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
          style={{ color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
          rows={5}
        />
        <button onClick={handleDecode} className="font-mono text-2xs uppercase px-4 py-1.5 border border-fg hover:bg-fg hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>Decode Certificate</button>

        {error && <div className="font-mono text-2xs text-brutal-red border border-brutal-red/30 px-2 py-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{error}</div>}

        {result && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-brutal-green p-3 bg-brutal-green/5 space-y-2 font-mono text-xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            {[
              ["Subject", result.subject],
              ["Issuer", result.issuer],
              ["Valid From", result.validFrom],
              ["Valid To", result.validTo],
              ["Serial", result.serialNumber],
              ["SHA256 Fingerprint", result.fingerprint],
              ["Algorithm", result.algorithm],
              ["Key Size", `${result.keySize} bits`],
              ["SANs", result.san.join(", ") || "None"],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-fg-muted shrink-0 whitespace-nowrap">{label}:</span>
                <span className="text-fg break-all" style={{ color: "var(--fg)" }}>{value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
