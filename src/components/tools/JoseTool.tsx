"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faLockOpen, faShieldHalved, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { compactDecrypt, compactVerify, decodeProtectedHeader, importJWK, importPKCS8, importSPKI } from "jose";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import { useLocalState } from "@/lib/useLocalState";

type KeyKind = "secret" | "secret-b64" | "pem-public" | "pem-private" | "jwk";

const JWS_ALGS = ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512", "EdDSA"];
const JWE_ALGS = ["dir", "RSA-OAEP", "RSA-OAEP-256", "A128GCM", "A192GCM", "A256GCM", "ECDH-ES", "ECDH-ES+A128KW"];

function base64UrlToText(part: string): string {
  try {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((part.length + 3) % 4);
    return decodeURIComponent(
      Array.from(atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return "";
  }
}

function secretToBytes(text: string, base64url: boolean): Uint8Array {
  if (!base64url) return new TextEncoder().encode(text);
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export default function JoseTool() {
  const [token, setToken] = useLocalState("jose-token", "");
  const [keyKind, setKeyKind] = useLocalState<KeyKind>("jose-keykind", "secret");
  const [keyText, setKeyText] = useLocalState("jose-key", "");
  const [alg, setAlg] = useLocalState("jose-alg", "");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [plaintext, setPlaintext] = useState("");
  // Captured once per mount: expiry is judged against the moment the token was opened.
  const [nowSeconds] = useState(() => Math.floor(Date.now() / 1000));

  const parts = token.trim().split(".").filter(Boolean);
  const kind = parts.length === 5 ? "JWE" : parts.length === 3 ? "JWS" : null;
  const header = useMemo(() => {
    if (!kind) return null;
    try {
      return decodeProtectedHeader(token.trim()) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [token, kind]);
  const headerAlg = typeof header?.alg === "string" ? header.alg : "";
  const effectiveAlg = alg || headerAlg;

  const payload = useMemo(() => {
    if (kind !== "JWS" || !parts[1]) return null;
    const text = base64UrlToText(parts[1]);
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  }, [kind, parts]);

  const claims = useMemo<Record<string, unknown> | null>(() => {
    if (kind !== "JWS" || !parts[1]) return null;
    try {
      return JSON.parse(base64UrlToText(parts[1])) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [kind, parts]);

  const issues = useMemo<{ level: "high" | "medium" | "info"; text: string }[]>(() => {
    const found: { level: "high" | "medium" | "info"; text: string }[] = [];
    if (!kind || !header) return found;
    const algorithm = typeof header.alg === "string" ? header.alg : "";
    if (algorithm.toLowerCase() === "none") found.push({ level: "high", text: "alg is 'none' — anyone can forge this token. Reject it server-side." });
    if (algorithm.startsWith("HS")) found.push({ level: "info", text: "Symmetric HMAC: the same secret signs and verifies. If a server also accepts RS/ES with a public key, watch for RS256-to-HS256 confusion." });
    if (!header.kid && algorithm.startsWith("RS")) found.push({ level: "info", text: "No 'kid' header — key rotation will be awkward." });
    if (claims) {
      const now = nowSeconds;
      if (typeof claims.exp === "number" && claims.exp < now) found.push({ level: "medium", text: "Token is expired (exp is in the past)." });
      if (typeof claims.exp !== "number") found.push({ level: "medium", text: "No 'exp' claim — this token never expires." });
      if (typeof claims.iat !== "number") found.push({ level: "info", text: "No 'iat' claim — you cannot tell when it was issued." });
      if (typeof claims.nbf === "number" && claims.nbf > now) found.push({ level: "info", text: "Token is not valid yet (nbf is in the future)." });
      if (typeof claims.aud !== "string" && typeof claims.iss !== "string") found.push({ level: "info", text: "No 'aud' or 'iss' — the token is not scoped to an audience or issuer." });
    }
    return found;
  }, [kind, header, claims]);

  const run = async () => {
    if (!kind) return;
    setBusy(true);
    setStatus(null);
    setPlaintext("");
    try {
      if (kind === "JWS") {
        const algorithm = effectiveAlg || "HS256";
        let key: CryptoKey | Uint8Array;
        if (keyKind === "secret" || keyKind === "secret-b64") key = secretToBytes(keyText, keyKind === "secret-b64");
        else if (keyKind === "pem-public") key = await importSPKI(keyText, algorithm);
        else if (keyKind === "pem-private") key = await importPKCS8(keyText, algorithm);
        else key = await importJWK(JSON.parse(keyText), algorithm);
        const { payload: verified } = await compactVerify(token.trim(), key as never);
        const text = new TextDecoder().decode(verified);
        setPlaintext(text);
        setStatus({ ok: true, message: `Signature valid (${algorithm})` });
      } else {
        const algorithm = effectiveAlg || "RSA-OAEP";
        let key: CryptoKey | Uint8Array;
        if (keyKind === "secret" || keyKind === "secret-b64") key = secretToBytes(keyText, keyKind === "secret-b64");
        else if (keyKind === "pem-private") key = await importPKCS8(keyText, algorithm);
        else if (keyKind === "pem-public") key = await importSPKI(keyText, algorithm);
        else key = await importJWK(JSON.parse(keyText), algorithm);
        const { plaintext: decrypted } = await compactDecrypt(token.trim(), key as never);
        const text = new TextDecoder().decode(decrypted);
        setPlaintext(text);
        setStatus({ ok: true, message: `Decrypted (${algorithm})` });
      }
    } catch (reason) {
      setStatus({ ok: false, message: reason instanceof Error ? reason.message : "Operation failed" });
    } finally {
      setBusy(false);
    }
  };

  const isJws = kind === "JWS";
  const algs = isJws ? JWS_ALGS : JWE_ALGS;
  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const inputClass = "w-full border-2 border-fg bg-surface p-3 font-mono text-xs text-fg focus:outline-none";

  return (
    <div className="space-y-4">
      <textarea
        value={token}
        onChange={(event) => setToken(event.target.value)}
        spellCheck={false}
        rows={4}
        placeholder="Paste a JWS (3 parts) or a JWE (5 parts)..."
        className={inputClass}
        style={mono}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
          Detected
        </span>
        <span
          className="border-2 px-2 py-0.5 font-mono text-2xs uppercase"
          style={{ ...mono, borderColor: kind ? COLORS.green : "#ff5500", color: kind ? COLORS.green : "#ff5500" }}
        >
          {kind ?? "unknown"}
        </span>
        {headerAlg && (
          <span className="border-2 border-fg-muted/40 px-2 py-0.5 font-mono text-2xs uppercase text-fg-muted" style={mono}>
            alg: {headerAlg}
          </span>
        )}
        {parts.length > 0 && parts.length !== 3 && parts.length !== 5 && (
          <span className="font-mono text-2xs uppercase" style={{ ...mono, color: "#ff5500" }}>
            expected 3 or 5 segments
          </span>
        )}
      </div>

      {header && (
        <div className="border-2 border-fg">
          <div className="border-b-2 border-fg px-3 py-1.5">
            <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
              {isJws ? "Header" : "JWE header"}
            </span>
          </div>
          <pre className="overflow-auto p-3 font-mono text-xs text-fg" style={mono}>
            {JSON.stringify(header, null, 2)}
          </pre>
        </div>
      )}

      {payload !== null && (
        <div className="border-2 border-fg">
          <div className="border-b-2 border-fg px-3 py-1.5">
            <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
              Payload
            </span>
          </div>
          <pre className="max-h-56 overflow-auto p-3 font-mono text-xs text-fg" style={mono}>
            {payload}
          </pre>
        </div>
      )}

      {issues.length > 0 && (
        <div className="border-2 border-fg">
          <div className="border-b-2 border-fg px-3 py-1.5">
            <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
              What stands out
            </span>
          </div>
          <ul className="space-y-1.5 p-3">
            {issues.map((issue, index) => (
              <li key={index} className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 shrink-0"
                  style={{ backgroundColor: issue.level === "high" ? "#ff1144" : issue.level === "medium" ? "#ff5500" : "#00e5ff" }}
                />
                <span className="font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                  {issue.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-2 border-fg p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
            Key type
          </span>
          {[
            { id: "secret" as KeyKind, label: "secret" },
            { id: "secret-b64" as KeyKind, label: "secret (base64url)" },
            { id: "pem-public" as KeyKind, label: "PEM public" },
            { id: "pem-private" as KeyKind, label: "PEM private" },
            { id: "jwk" as KeyKind, label: "JWK" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setKeyKind(option.id)}
              aria-pressed={keyKind === option.id}
              className={`cursor-pointer border-2 px-2 py-1 font-mono text-2xs uppercase transition-colors ${keyKind === option.id ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
              style={mono}
            >
              {option.label}
            </button>
          ))}
        </div>

        <textarea
          value={keyText}
          onChange={(event) => setKeyText(event.target.value)}
          spellCheck={false}
          rows={4}
          placeholder={keyKind === "secret" || keyKind === "secret-b64" ? "your-secret" : keyKind === "jwk" ? '{"kty":"oct","k":"..."}' : "-----BEGIN PUBLIC KEY-----"}
          className={inputClass}
          style={mono}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={alg}
            onChange={(event) => setAlg(event.target.value)}
            className="border-2 border-fg bg-surface px-2 py-1 font-mono text-2xs uppercase text-fg focus:outline-none"
            style={mono}
          >
            <option value="">{headerAlg ? `auto (${headerAlg})` : "auto"}</option>
            {algs.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={run}
            disabled={!kind || busy}
            className="inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface disabled:cursor-not-allowed disabled:opacity-40"
            style={mono}
          >
            <FontAwesomeIcon icon={isJws ? faShieldHalved : faLockOpen} className="text-[10px]" />
            {isJws ? "Verify signature" : "Decrypt"}
          </button>
        </div>

        {status && (
          <div
            className="mt-3 flex items-start gap-2 border-2 p-2.5"
            style={{ borderColor: status.ok ? COLORS.green : "#ff5500", color: status.ok ? COLORS.green : "#ff5500" }}
          >
            <FontAwesomeIcon icon={status.ok ? faCheck : faTriangleExclamation} className="mt-0.5 text-xs" />
            <span className="font-mono text-xs" style={mono}>
              {status.message}
            </span>
          </div>
        )}

        {plaintext && (
          <pre className="mt-3 max-h-56 overflow-auto border-2 border-fg p-3 font-mono text-xs text-fg" style={mono}>
            {plaintext}
          </pre>
        )}
      </div>

      <p className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
        decoding happens in your browser. keys never leave this tab.
      </p>
    </div>
  );
}
