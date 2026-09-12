"use client";

import JoseTool from "@/components/tools/JoseTool";
import ToolHelp, { InfoTerm } from "@/components/tools/ToolHelp";
import { TYPOGRAPHY } from "@/lib/design-tokens";

const ALGORITHMS = [
  ["HS256 / 384 / 512", "HMAC", "One shared secret signs and verifies. Simple, but every service that can verify can also forge."],
  ["RS256 / 384 / 512", "RSA", "Private key signs, public key verifies. Good for many verifiers."],
  ["PS256 / 384 / 512", "RSA-PSS", "Like RS but with a randomised padding scheme."],
  ["ES256 / 384 / 512", "ECDSA", "Smaller keys and signatures than RSA, same idea."],
  ["EdDSA", "Ed25519", "Modern elliptic-curve signatures, fast and compact."],
  ["none", "No signature", "Danger. Any client can write its own claims. Always reject."],
];

export default function JwtDebuggerPage() {
  const mono = { fontFamily: TYPOGRAPHY.fontMono };

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
              JWT Debugger
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              decode · verify · decrypt
            </span>
          </div>

          <p className="mb-8 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            Paste a <InfoTerm term="JWS" meaning="JSON Web Signature — three parts (header.payload.signature). Anyone can read it; the signature only proves it was not modified.">JWS</InfoTerm> or a{" "}
            <InfoTerm term="JWE" meaning="JSON Web Encryption — five parts. The payload is encrypted, so you need a key to read it.">JWE</InfoTerm> and inspect it. Decoding needs no key —{" "}
            <strong className="font-extrabold uppercase">verifying and decrypting</strong> do, and that happens entirely in your browser.
          </p>

          <JoseTool />

          <ToolHelp
            intro="A JWT is three base64url chunks joined by dots: header.payload.signature. The header names the algorithm, the payload carries the claims, and the signature proves nobody edited the first two parts. A JWS is signed (readable by anyone), a JWE is encrypted (unreadable until you decrypt it)."
            steps={[
              "Paste a token. The tool detects whether it is a JWS (3 segments) or a JWE (5 segments).",
              "Read the decoded protected header and payload — this needs no key at all.",
              "For a JWS, pick the key type, paste the secret / public key / JWK, then hit Verify signature.",
              "For a JWE, paste the matching private key or symmetric secret, then hit Decrypt.",
              "Watch the What stands out panel for common token mistakes before you trust it.",
            ]}
            terms={[
              { term: "JWT", meaning: "JSON Web Token — a signed or encrypted JSON blob passed between services, usually as a Bearer token." },
              { term: "JWS", meaning: "JSON Web Signature. Three parts. Integrity only — the contents are not secret." },
              { term: "JWE", meaning: "JSON Web Encryption. Five parts. Confidentiality — you need a key to read the payload." },
              { term: "Protected header", meaning: "Base64url JSON that names the algorithm (alg), key id (kid), and content type (typ)." },
              { term: "Claim", meaning: "A payload field: sub is the subject, iss the issuer, aud the audience, exp the expiry, iat when it was issued, nbf when it becomes valid." },
              { term: "alg: none", meaning: "Means no signature at all. If a server accepts it, anybody can mint admin tokens." },
              { term: "kid", meaning: "Key ID. Tells the verifier which key in a JWKS to use, so keys can rotate." },
              { term: "JWK / JWKS", meaning: "JSON Web Key / Set — keys as JSON, often published at /.well-known/jwks.json." },
            ]}
            examples={[
              { label: "HS256 — shared secret", detail: "Pick key type 'secret' and paste the same string the server signs with." },
              { label: "RS256 — public key", detail: "Verify with a PEM public key, or fetch the JWKS entry matching the token's kid." },
              { label: "JWE — RSA-OAEP + A256GCM", value: "eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ....", detail: "Five segments. Paste the PEM private key and decrypt." },
            ]}
            notes={[
              "Decoding is not verifying. A readable payload proves nothing on its own.",
              "Reject alg: none, and pin the algorithms you accept — otherwise an attacker can swap RS256 for HS256 and sign with your public key as the HMAC secret.",
              "exp, iat and nbf are Unix seconds, not milliseconds.",
              "A JWS protects integrity; a JWE also protects confidentiality. They can be combined (nested JWT).",
            ]}
          >
            <div>
              <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Algorithm families
              </span>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full border-collapse font-mono text-xs" style={mono}>
                  <thead>
                    <tr>
                      {["alg", "family", "what it means"].map((head) => (
                        <th key={head} className="border-b-2 border-fg px-2 py-1.5 text-left font-bold uppercase text-2xs text-fg">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ALGORITHMS.map(([alg, family, meaning]) => (
                      <tr key={alg}>
                        <td className="border-b border-fg-muted/15 px-2 py-1.5 text-fg">{alg}</td>
                        <td className="border-b border-fg-muted/15 px-2 py-1.5" style={{ color: "#00e5ff" }}>
                          {family}
                        </td>
                        <td className="border-b border-fg-muted/15 px-2 py-1.5 font-sans text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                          {meaning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ToolHelp>
        </section>
      </main>
    </>
  );
}
