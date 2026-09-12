"use client";

import { useCallback, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

type Tab = "inspect" | "generate";
type Preset = "ca" | "server" | "client";
type ForgeExtensions = Parameters<import("node-forge").pki.Certificate["setExtensions"]>[0];

interface CertInfo {
  pem: string;
  subject: string;
  issuer: string;
  serial: string;
  notBefore: string;
  notAfter: string;
  expired: boolean;
  notYetValid: boolean;
  sigAlg: string;
  keyType: string;
  keySize: string;
  sans: string[];
  keyUsage: string[];
  eku: string[];
  isCa: boolean;
  fingerprint: string;
  selfSigned: boolean;
  signedBy: string;
  signatureValid: boolean | null;
}

interface KeyInfo {
  type: string;
  size: string;
  pem: string;
  matches: string[];
}

interface ParseResult {
  format: string;
  certs: CertInfo[];
  keys: KeyInfo[];
  csrSubject?: string;
  csrSans?: string[];
  notes: string[];
}

const SIGNATURE_OIDS: Record<string, string> = {
  "1.2.840.113549.1.1.5": "sha1WithRSA",
  "1.2.840.113549.1.1.11": "sha256WithRSA",
  "1.2.840.113549.1.1.12": "sha384WithRSA",
  "1.2.840.113549.1.1.13": "sha512WithRSA",
  "1.2.840.10045.4.3.2": "ecdsa-with-SHA256",
  "1.2.840.10045.4.3.3": "ecdsa-with-SHA384",
  "1.2.840.10045.4.3.4": "ecdsa-with-SHA512",
};

const KEY_USAGE_FIELDS: [string, string][] = [
  ["digitalSignature", "digitalSignature"],
  ["nonRepudiation", "nonRepudiation"],
  ["keyEncipherment", "keyEncipherment"],
  ["dataEncipherment", "dataEncipherment"],
  ["keyAgreement", "keyAgreement"],
  ["keyCertSign", "keyCertSign"],
  ["cRLSign", "cRLSign"],
  ["encipherOnly", "encipherOnly"],
  ["decipherOnly", "decipherOnly"],
];

const EXT_KEY_USAGE_FIELDS: [string, string][] = [
  ["serverAuth", "serverAuth"],
  ["clientAuth", "clientAuth"],
  ["codeSigning", "codeSigning"],
  ["emailProtection", "emailProtection"],
  ["timeStamping", "timeStamping"],
  ["ocspSigning", "ocspSigning"],
];

const SAN_TYPES: Record<number, string> = { 1: "email", 2: "DNS", 6: "URI", 7: "IP" };

function binaryFromBase64(base64: string): string {
  return atob(base64.replace(/\s+/g, ""));
}

function describeSubject(attributes: readonly { name?: string; shortName?: string; value?: unknown }[]): string {
  const order = ["CN", "OU", "O", "L", "ST", "C", "E"];
  const parts = attributes
    .map((attribute) => {
      const key = attribute.shortName ?? attribute.name ?? "?";
      return { key, value: typeof attribute.value === "string" ? attribute.value : "" };
    })
    .filter((part) => part.value);
  parts.sort((a, b) => {
    const indexA = order.indexOf(a.key);
    const indexB = order.indexOf(b.key);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  return parts.map((part) => `${part.key}=${part.value}`).join(", ") || "(empty)";
}

function formatDate(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export default function CertStudioPage() {
  const [tab, setTab] = useLocalState<Tab>("cert-tab", "inspect");
  const [input, setInput] = useLocalState("cert-input", "");
  const [password, setPassword] = useLocalState("cert-password", "");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [preset, setPreset] = useLocalState<Preset>("cert-preset", "server");
  const [keyBits, setKeyBits] = useLocalState("cert-bits", "2048");
  const [commonName, setCommonName] = useLocalState("cert-cn", "example.local");
  const [organization, setOrganization] = useLocalState("cert-org", "");
  const [country, setCountry] = useLocalState("cert-country", "IN");
  const [days, setDays] = useLocalState("cert-days", "365");
  const [sans, setSans] = useLocalState("cert-sans", "example.local, localhost, 127.0.0.1");
  const [caCertPem, setCaCertPem] = useLocalState("cert-ca-cert", "");
  const [caKeyPem, setCaKeyPem] = useLocalState("cert-ca-key", "");
  const [exportPassword, setExportPassword] = useLocalState("cert-export-pass", "changeit");
  const [csrPem, setCsrPem] = useLocalState("cert-csr", "");
  const [artifacts, setArtifacts] = useState<{ label: string; value: string; filename: string }[]>([]);
  const [generating, setGenerating] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const { copied, copy } = useCopy();

  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const chip = "cursor-pointer border-2 px-2.5 py-1 font-mono text-2xs uppercase transition-colors";
  const buttonClass =
    "inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface disabled:cursor-not-allowed disabled:opacity-40";

  const analyze = useCallback(async () => {
    const raw = input.trim();
    if (!raw) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const forge = await import("node-forge");
      const notes: string[] = [];
      const certs: CertInfo[] = [];
      const keys: KeyInfo[] = [];
      let format = "PEM";
      let csrSubject: string | undefined;
      let csrSans: string[] | undefined;

      const readCert = (cert: import("node-forge").pki.Certificate): CertInfo => {
        const now = Date.now();
        const notBefore = cert.validity.notBefore;
        const notAfter = cert.validity.notAfter;
        const sanExtension = cert.getExtension("subjectAltName") as { altNames?: { type: number; value?: string; ip?: string }[] } | undefined;
        const sansList = (sanExtension?.altNames ?? []).map(
          (entry) => `${SAN_TYPES[entry.type] ?? entry.type}:${entry.value ?? entry.ip ?? ""}`
        );
        const keyUsageExtension = cert.getExtension("keyUsage") as Record<string, boolean> | undefined;
        const ekuExtension = cert.getExtension("extKeyUsage") as Record<string, boolean> | undefined;
        const basicConstraints = cert.getExtension("basicConstraints") as { cA?: boolean } | undefined;
        const publicKey = cert.publicKey as { n?: { bitLength: () => number }; type?: string };
        const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();

        return {
          pem: forge.pki.certificateToPem(cert),
          subject: describeSubject(cert.subject.attributes),
          issuer: describeSubject(cert.issuer.attributes),
          serial: cert.serialNumber,
          notBefore: formatDate(notBefore),
          notAfter: formatDate(notAfter),
          expired: notAfter.getTime() < now,
          notYetValid: notBefore.getTime() > now,
          sigAlg: SIGNATURE_OIDS[cert.signatureOid] ?? cert.signatureOid,
          keyType: publicKey.type === "rsa" || publicKey.n ? "RSA" : "EC/other",
          keySize: publicKey.n ? `${publicKey.n.bitLength()} bit` : "unknown",
          sans: sansList,
          keyUsage: keyUsageExtension ? KEY_USAGE_FIELDS.filter(([field]) => keyUsageExtension[field]).map(([, label]) => label) : [],
          eku: ekuExtension ? EXT_KEY_USAGE_FIELDS.filter(([field]) => ekuExtension[field]).map(([, label]) => label) : [],
          isCa: Boolean(basicConstraints?.cA),
          fingerprint: forge.md.sha256.create().update(der).digest().toHex().match(/.{2}/g)?.join(":").toUpperCase() ?? "",
          selfSigned: cert.subject.hash === cert.issuer.hash,
          signedBy: "",
          signatureValid: null,
        };
      };

      const certBlocks = [...raw.matchAll(/-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g)];
      const keyBlocks = [...raw.matchAll(/-----BEGIN ([A-Z ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/g)];
      const csrBlocks = [...raw.matchAll(/-----BEGIN CERTIFICATE REQUEST-----([\s\S]*?)-----END CERTIFICATE REQUEST-----/g)];

      if (certBlocks.length > 0) {
        for (const block of certBlocks) certs.push(readCert(forge.pki.certificateFromPem(block[0])));
      }
      for (const block of keyBlocks) {
        if (block[1] === "ENCRYPTED PRIVATE KEY") {
          notes.push("An encrypted PKCS#8 key is present. node-forge cannot read that container here — decrypt it with openssl first.");
          continue;
        }
        try {
          const key = forge.pki.privateKeyFromPem(block[0]) as import("node-forge").pki.rsa.PrivateKey;
          keys.push({
            type: block[1].includes("RSA") ? "RSA" : "Private key",
            size: key.n ? `${key.n.bitLength()} bit` : "unknown",
            pem: block[0],
            matches: [],
          });
        } catch {
          notes.push("A private key block could not be parsed.");
        }
      }
      for (const block of csrBlocks) {
        const csr = forge.pki.certificationRequestFromPem(block[0]);
        csrSubject = describeSubject(csr.subject.attributes);
        const extension = csr.getAttribute({ name: "extensionRequest" }) as { extensions?: { name?: string; altNames?: { type: number; value?: string; ip?: string }[] }[] } | undefined;
        const alt = extension?.extensions?.find((item) => item.name === "subjectAltName");
        csrSans = (alt?.altNames ?? []).map((entry) => `${SAN_TYPES[entry.type] ?? entry.type}:${entry.value ?? entry.ip ?? ""}`);
        notes.push(`Certificate signing request found for ${csrSubject}. It is not a certificate yet.`);
      }

      if (certBlocks.length === 0 && keyBlocks.length === 0 && csrBlocks.length === 0) {
        const looksBase64 = /^[A-Za-z0-9+/=\s]+$/.test(raw);
        if (!looksBase64) throw new Error("That does not look like PEM, base64 or a DER/PKCS#12 blob.");
        const binary = binaryFromBase64(raw);
        let parsed = false;
        try {
          const asn1 = forge.asn1.fromDer(binary);
          try {
            const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password);
            format = "PKCS#12 (base64)";
            parsed = true;
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] ?? [];
            for (const bag of certBags) if (bag.cert) certs.push(readCert(bag.cert));
            const keyBags = [
              ...(p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] ?? []),
              ...(p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] ?? []),
            ];
            for (const bag of keyBags) {
              const key = bag.key as import("node-forge").pki.rsa.PrivateKey | undefined;
              if (key) keys.push({ type: "RSA (PKCS#12)", size: key.n ? `${key.n.bitLength()} bit` : "unknown", pem: forge.pki.privateKeyToPem(key), matches: [] });
            }
            if (certs.length === 0) notes.push("The PKCS#12 container opened but holds no certificates.");
          } catch {
            const cert = forge.pki.certificateFromAsn1(asn1);
            format = "DER (base64)";
            parsed = true;
            certs.push(readCert(cert));
          }
        } catch {
          if (!parsed) throw new Error("Could not parse that blob. If it is a PKCS#12 file, check the password.");
        }
      }

      for (const key of keys) {
        try {
          const privateKey = forge.pki.privateKeyFromPem(key.pem) as import("node-forge").pki.rsa.PrivateKey;
          for (const cert of certs) {
            const publicKey = forge.pki.certificateFromPem(cert.pem).publicKey as import("node-forge").pki.rsa.PublicKey;
            if (privateKey.n && publicKey.n && privateKey.n.compareTo(publicKey.n) === 0) {
              key.matches.push(cert.subject);
            }
          }
        } catch {
          // A key that cannot be re-parsed simply reports no match.
        }
      }

      for (const cert of certs) {
        for (const other of certs) {
          if (other === cert) continue;
          if (cert.issuer === other.subject) {
            cert.signedBy = other.subject;
            try {
              const child = forge.pki.certificateFromPem(cert.pem);
              const parent = forge.pki.certificateFromPem(other.pem);
              cert.signatureValid = parent.verify(child);
            } catch {
              cert.signatureValid = null;
            }
            break;
          }
        }
        if (!cert.signedBy && cert.selfSigned) cert.signedBy = "itself (self-signed)";
      }

      setResult({ format, certs, keys, csrSubject, csrSans, notes });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not parse that input.");
    } finally {
      setBusy(false);
    }
  }, [input, password]);

  const onFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const head = new TextDecoder().decode(bytes.slice(0, 64));
    if (head.includes("-----BEGIN")) setInput(new TextDecoder().decode(bytes));
    else setInput(btoa(String.fromCharCode(...bytes)));
    setResult(null);
    setError(null);
  };

  const buildExtensions = (altNames: { type: number; value?: string; ip?: string }[], isCa: boolean): ForgeExtensions => {
    return [
      { name: "basicConstraints", cA: isCa, critical: true },
      {
        name: "keyUsage",
        digitalSignature: true,
        keyEncipherment: !isCa,
        keyCertSign: isCa,
        cRLSign: isCa,
        critical: true,
      },
      { name: "extKeyUsage", serverAuth: preset === "server", clientAuth: preset === "client", codeSigning: false },
      { name: "subjectAltName", altNames },
      { name: "subjectKeyIdentifier" },
    ] as ForgeExtensions;
  };

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setArtifacts([]);
    try {
      const forge = await import("node-forge");
      await new Promise((resolve) => setTimeout(resolve, 60));

      const bits = Number(keyBits);
      const keys = forge.pki.rsa.generateKeyPair({ bits, e: 0x10001 });
      const cert = forge.pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(8)).replace(/^0+/, "") || "01";

      const attributes: { name: string; value: string }[] = [{ name: "commonName", value: commonName || "example.local" }];
      if (organization) attributes.push({ name: "organizationName", value: organization });
      if (country) attributes.push({ name: "countryName", value: country });

      const now = new Date();
      cert.validity.notBefore = now;
      cert.validity.notAfter = new Date(now.getTime() + Math.max(1, Number(days) || 365) * 86400000);
      cert.setSubject(attributes);

      const isCa = preset === "ca";
      const altNames = isCa
        ? []
        : sans
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) =>
              /^\d{1,3}(\.\d{1,3}){3}$/.test(entry) ? { type: 7, ip: entry } : { type: 2, value: entry }
            );

      let issuerCertPem = "";
      if (caCertPem.trim() && caKeyPem.trim() && !isCa) {
        const caCert = forge.pki.certificateFromPem(caCertPem.trim());
        const caKey = forge.pki.privateKeyFromPem(caKeyPem.trim()) as import("node-forge").pki.rsa.PrivateKey;
        cert.setIssuer(caCert.subject.attributes);
        const extensions = buildExtensions(altNames, false);
        extensions.push({
          name: "authorityKeyIdentifier",
          keyIdentifier: caCert.generateSubjectKeyIdentifier().getBytes(),
        });
        cert.setExtensions(extensions);
        cert.sign(caKey, forge.md.sha256.create());
        issuerCertPem = forge.pki.certificateToPem(caCert);
      } else {
        cert.setIssuer(attributes);
        cert.setExtensions(buildExtensions(altNames, isCa));
        cert.sign(keys.privateKey, forge.md.sha256.create());
      }

      const certPem = forge.pki.certificateToPem(cert);
      const keyPem = forge.pki.privateKeyToPem(keys.privateKey);
      const name = (commonName || "cert").replace(/[^a-zA-Z0-9.-]/g, "_");
      const chain = issuerCertPem ? `${certPem}\n${issuerCertPem}` : certPem;

      const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, issuerCertPem ? [cert, forge.pki.certificateFromPem(issuerCertPem)] : [cert], exportPassword || "", {
        algorithm: "3des",
      });
      const p12Base64 = forge.util.encode64(forge.asn1.toDer(p12Asn1).getBytes());

      setArtifacts([
        { label: "Certificate (PEM)", value: certPem, filename: `${name}.crt` },
        { label: "Private key (PEM — keep secret)", value: keyPem, filename: `${name}.key` },
        ...(issuerCertPem ? [{ label: "Full chain (PEM)", value: chain, filename: `${name}-chain.crt` }] : []),
        { label: `PKCS#12 bundle (password: ${exportPassword || "empty"})`, value: p12Base64, filename: `${name}.p12.b64` },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Key generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const signCsr = async () => {
    if (!csrPem.trim()) return;
    setGenerating(true);
    setError(null);
    setArtifacts([]);
    try {
      const forge = await import("node-forge");
      await new Promise((resolve) => setTimeout(resolve, 60));
      const csr = forge.pki.certificationRequestFromPem(csrPem.trim());
      if (!csr.verify()) throw new Error("The CSR signature does not verify — it may be corrupted.");

      let issuerSubject = csr.subject.attributes;
      let signerKey: import("node-forge").pki.rsa.PrivateKey;
      let signerCert: import("node-forge").pki.Certificate | null = null;

      if (caCertPem.trim() && caKeyPem.trim()) {
        signerCert = forge.pki.certificateFromPem(caCertPem.trim());
        issuerSubject = signerCert.subject.attributes;
        signerKey = forge.pki.privateKeyFromPem(caKeyPem.trim()) as import("node-forge").pki.rsa.PrivateKey;
      } else {
        const keys = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
        signerKey = keys.privateKey;
        const selfSigned = forge.pki.createCertificate();
        selfSigned.publicKey = keys.publicKey;
        selfSigned.serialNumber = "01";
        const now = new Date();
        selfSigned.validity.notBefore = now;
        selfSigned.validity.notAfter = new Date(now.getTime() + 3650 * 86400000);
        selfSigned.setSubject([{ name: "commonName", value: "Temporary Signing CA" }]);
        selfSigned.setIssuer([{ name: "commonName", value: "Temporary Signing CA" }]);
        selfSigned.setExtensions([
          { name: "basicConstraints", cA: true, critical: true },
          { name: "keyUsage", keyCertSign: true, cRLSign: true, critical: true },
        ]);
        selfSigned.sign(keys.privateKey, forge.md.sha256.create());
        signerCert = selfSigned;
        setArtifacts((current) => [
          ...current,
          { label: "Temporary signing CA (PEM)", value: forge.pki.certificateToPem(selfSigned), filename: "temp-ca.crt" },
        ]);
      }

      const cert = forge.pki.createCertificate();
      if (!csr.publicKey) throw new Error("That CSR has no public key.");
      cert.publicKey = csr.publicKey;
      cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(8)).replace(/^0+/, "") || "01";
      const now = new Date();
      cert.validity.notBefore = now;
      cert.validity.notAfter = new Date(now.getTime() + Math.max(1, Number(days) || 365) * 86400000);
      cert.setSubject(csr.subject.attributes);
      cert.setIssuer(issuerSubject);
      cert.setExtensions([
        { name: "basicConstraints", cA: false, critical: true },
        { name: "keyUsage", digitalSignature: true, keyEncipherment: true, critical: true },
        { name: "extKeyUsage", serverAuth: preset !== "client", clientAuth: preset === "client" },
        { name: "subjectKeyIdentifier" },
        { name: "authorityKeyIdentifier", keyIdentifier: signerCert.generateSubjectKeyIdentifier().getBytes() },
      ]);
      cert.sign(signerKey, forge.md.sha256.create());

      setArtifacts((current) => [
        ...current,
        { label: "Signed certificate (PEM)", value: forge.pki.certificateToPem(cert), filename: "signed.crt" },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Signing failed.");
    } finally {
      setGenerating(false);
    }
  };

  const download = (filename: string, value: string) => {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const field = (label: string, value: string, setter: (next: string) => void, placeholder = "") => (
    <label className="block">
      <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => setter(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full border-2 border-fg bg-surface px-2 py-1.5 font-mono text-xs text-fg focus:outline-none"
        style={mono}
      />
    </label>
  );

  return (
    <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
      <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Cert Studio
          </h1>
          <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
          <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
            x.509 · mtls · pki
          </span>
        </div>

        <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
          Read any certificate, see who signed it, and mint your own PKI in the browser: a root CA, server and client (mTLS) certs, plus CSR signing and PKCS#12 export.
        </p>

        <ToolHelp
          intro="X.509 is a chain of trust: a CA signs a leaf certificate, and the client verifies the signature against the CA. Everything here runs locally with node-forge — no key ever leaves the tab, which is exactly why the private key you generate should still be treated as sensitive."
          steps={[
            "Inspect tab: paste PEM, base64 DER or a base64 PKCS#12 (.p12/.pfx) blob and read the chain.",
            "Generate tab: pick Root CA, Server or Client, fill the subject and SANs, then generate.",
            "To sign with your own CA, paste the CA certificate and its private key first.",
            "Sign a CSR by pasting it — the certificate is issued with the CSR's subject and key.",
          ]}
            terms={[
              { term: "PEM", meaning: "Base64 wrapped in -----BEGIN/END----- lines. The common text format." },
              { term: "DER", meaning: "The same data in raw binary. Paste it base64-encoded here." },
              { term: "PKCS#12 / .p12 / .pfx", meaning: "A password-protected bundle holding a key, its certificate and the chain." },
              { term: "SAN", meaning: "Subject Alternative Name — the DNS names and IPs the certificate is valid for. Modern clients ignore CN." },
              { term: "Key usage / EKU", meaning: "What the key may do (sign, encrypt) and for what purpose (serverAuth, clientAuth)." },
              { term: "mTLS", meaning: "Mutual TLS: the client also presents a certificate, issued with clientAuth EKU." },
              { term: "CSR", meaning: "Certificate Signing Request — a public key plus subject, signed by the requester's own key." },
              { term: "Self-signed", meaning: "Subject equals issuer. Nothing above it vouches for it, so clients warn unless you trust it explicitly." },
            ]}
            notes={[
              "Generate the root CA first, keep its key offline, and sign leaves with it.",
              "Client certificates need clientAuth in EKU or the server will reject them.",
              "A SHA-1 signature means the certificate is legacy; use SHA-256 or better.",
              "Treat generated keys as sensitive: they exist in this browser tab and in your clipboard.",
            ]}
          />

        <div className="mb-6 flex flex-wrap gap-1.5">
          {(["inspect", "generate"] as const).map((option) => (
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

        {error && (
          <p className="mb-4 border-2 p-3 font-mono text-xs" style={{ ...mono, borderColor: COLORS.red, color: COLORS.red }}>
            {error}
          </p>
        )}

        {tab === "inspect" && (
          <div className="space-y-4">
            <div className="border-2 border-fg">
              <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  paste PEM · base64 DER · base64 PKCS#12
                </span>
                <span className="flex-1" />
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pem,.crt,.cer,.der,.p12,.pfx,.csr,.key,application/x-pkcs12"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void onFile(file);
                  }}
                />
                <button type="button" onClick={() => fileRef.current?.click()} className={buttonClass} style={mono}>
                  <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
                  upload file
                </button>
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={7}
                spellCheck={false}
                placeholder="-----BEGIN CERTIFICATE-----&#10;MIIB...&#10;-----END CERTIFICATE-----"
                className="w-full resize-y bg-transparent p-3 font-mono text-xs text-fg focus:outline-none"
                style={mono}
              />
              <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-3 py-2">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="PKCS#12 password (if any)"
                  spellCheck={false}
                  className="min-w-0 flex-1 basis-40 border-2 border-fg bg-surface px-2 py-1 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                />
                <button type="button" onClick={analyze} disabled={busy || !input.trim()} className={buttonClass} style={mono}>
                  {busy ? "Reading..." : "Analyse"}
                </button>
                <button type="button" onClick={() => { setInput(""); setResult(null); setError(null); }} className={buttonClass} style={mono}>
                  clear
                </button>
              </div>
            </div>

            {result && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 border-2 border-fg p-3">
                  <span className="font-mono text-2xs uppercase" style={{ ...mono, color: COLORS.teal }}>
                    format: {result.format}
                  </span>
                  <span className="font-mono text-2xs uppercase" style={{ ...mono, color: COLORS.green }}>
                    {result.certs.length} certificate{result.certs.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-mono text-2xs uppercase" style={{ ...mono, color: COLORS.orange }}>
                    {result.keys.length} private key{result.keys.length === 1 ? "" : "s"}
                  </span>
                </div>

                {result.csrSubject && (
                  <div className="border-2 p-3" style={{ borderColor: COLORS.yellow }}>
                    <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: COLORS.yellow }}>
                      certificate signing request
                    </span>
                    <p className="mt-1 break-all font-mono text-xs text-fg" style={mono}>
                      {result.csrSubject}
                    </p>
                    {result.csrSans && result.csrSans.length > 0 && (
                      <p className="mt-1 break-all font-mono text-2xs text-fg-muted" style={mono}>
                        SANs: {result.csrSans.join(", ")}
                      </p>
                    )}
                    <p className="mt-2 font-sans text-xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                      Paste this into the Generate tab and sign it to turn it into a certificate.
                    </p>
                    <button type="button" onClick={() => { setCsrPem(input); setTab("generate"); }} className={`${buttonClass} mt-2`} style={mono}>
                      use in generate tab
                    </button>
                  </div>
                )}

                {result.certs.map((cert, index) => (
                  <div key={index} className="border-2 border-fg">
                    <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                      <span className="min-w-0 flex-1 break-all font-mono text-xs font-bold text-fg" style={mono}>
                        {cert.subject}
                      </span>
                      {cert.isCa && (
                        <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: COLORS.pink, color: COLORS.pink }}>
                          CA
                        </span>
                      )}
                      {cert.expired ? (
                        <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: COLORS.red, color: COLORS.red }}>
                          expired
                        </span>
                      ) : cert.notYetValid ? (
                        <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: COLORS.orange, color: COLORS.orange }}>
                          not yet valid
                        </span>
                      ) : (
                        <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: COLORS.green, color: COLORS.green }}>
                          in date
                        </span>
                      )}
                      {cert.selfSigned && (
                        <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: COLORS.yellow, color: COLORS.yellow }}>
                          self-signed
                        </span>
                      )}
                    </div>

                    <dl className="divide-y divide-fg-muted/15">
                      {[
                        ["Issued to", cert.subject],
                        ["Issued by", cert.issuer],
                        ["Signed by (in this bundle)", cert.signedBy || "not present — chain is incomplete"],
                        ["Signature check", cert.signatureValid === null ? (cert.selfSigned ? "self-signed" : "parent not in bundle") : cert.signatureValid ? "verified against parent" : "FAILED — signature does not match"],
                        ["Serial", cert.serial],
                        ["Valid from", cert.notBefore],
                        ["Valid to", cert.notAfter],
                        ["Signature algorithm", cert.sigAlg],
                        ["Public key", `${cert.keyType} ${cert.keySize}`],
                        ["Key usage", cert.keyUsage.join(", ") || "(none)"],
                        ["Extended key usage", cert.eku.join(", ") || "(none)"],
                        ["Subject Alt Names", cert.sans.join(", ") || "(none)"],
                        ["SHA-256 fingerprint", cert.fingerprint],
                      ].map(([label, value]) => (
                        <div key={label} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-3">
                          <dt className="w-56 shrink-0 font-mono text-2xs uppercase text-fg-muted" style={mono}>
                            {label}
                          </dt>
                          <dd className="min-w-0 flex-1 break-all font-mono text-xs text-fg" style={mono}>
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="flex flex-wrap gap-2 border-t-2 border-fg px-3 py-2">
                      <button type="button" onClick={() => copy(cert.pem)} className={buttonClass} style={mono}>
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                        copy PEM
                      </button>
                      <button type="button" onClick={() => download("certificate.crt", cert.pem)} className={buttonClass} style={mono}>
                        <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                        .crt
                      </button>
                    </div>
                  </div>
                ))}

                {result.keys.map((key, index) => (
                  <div key={index} className="border-2" style={{ borderColor: COLORS.orange }}>
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                      <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: COLORS.orange }}>
                        private key · {key.type} {key.size}
                      </span>
                    </div>
                    <p className="border-t px-3 py-2 font-mono text-2xs" style={{ ...mono, borderColor: COLORS.orange, color: key.matches.length > 0 ? COLORS.green : "var(--fg-muted)" }}>
                      {key.matches.length > 0 ? `public key matches: ${key.matches.join(" | ")}` : "no certificate in this input matches this key"}
                    </p>
                    <div className="flex flex-wrap gap-2 border-t px-3 py-2" style={{ borderColor: COLORS.orange }}>
                      <button type="button" onClick={() => copy(key.pem)} className={buttonClass} style={mono}>
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                        copy key
                      </button>
                      <button type="button" onClick={() => download("private.key", key.pem)} className={buttonClass} style={mono}>
                        <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                        .key
                      </button>
                    </div>
                  </div>
                ))}

                {result.notes.length > 0 && (
                  <ul className="border-2 border-fg-muted/30 p-3">
                    {result.notes.map((note) => (
                      <li key={note} className="font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "generate" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {([
                { id: "ca", label: "Root CA" },
                { id: "server", label: "Server cert" },
                { id: "client", label: "Client cert (mTLS)" },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPreset(option.id)}
                  aria-pressed={preset === option.id}
                  className={`${chip} ${preset === option.id ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                  style={mono}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="border-l-4 pl-3 font-sans text-xs leading-relaxed text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans, borderLeftColor: COLORS.teal }}>
              {preset === "ca"
                ? "A root CA signs other certificates. Give it a long validity, then paste its certificate and key below to issue leaves with it."
                : preset === "server"
                  ? "A server certificate gets serverAuth. Set the SANs to the hostnames clients connect to — browsers ignore the CN."
                  : "A client certificate gets clientAuth and is presented by your service, for example curl --cert or an nginx ssl_client_certificate setup."}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field("Common name (CN)", commonName, setCommonName, "example.local")}
              {field("Organization (O)", organization, setOrganization, "optional")}
              {field("Country (C)", country, setCountry, "IN")}
              {field("Validity (days)", days, setDays, "365")}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  RSA key size
                </span>
                <select
                  value={keyBits}
                  onChange={(event) => setKeyBits(event.target.value)}
                  className="w-full border-2 border-fg bg-surface px-2 py-1.5 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                >
                  <option value="2048">2048 bit</option>
                  <option value="3072">3072 bit</option>
                  <option value="4096">4096 bit (slow in a browser)</option>
                </select>
              </label>
              {field("PKCS#12 export password", exportPassword, setExportPassword, "changeit")}
            </div>

            {preset !== "ca" && (
              <label className="block">
                <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  Subject Alt Names (comma separated — DNS names and IPs)
                </span>
                <input
                  value={sans}
                  onChange={(event) => setSans(event.target.value)}
                  spellCheck={false}
                  className="w-full border-2 border-fg bg-surface px-2 py-1.5 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                />
              </label>
            )}

            <div className="grid grid-cols-1 gap-3">
              <label className="block">
                <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  Signing CA certificate (PEM) — optional, leave empty to self-sign
                </span>
                <textarea
                  value={caCertPem}
                  onChange={(event) => setCaCertPem(event.target.value)}
                  rows={3}
                  spellCheck={false}
                  placeholder="-----BEGIN CERTIFICATE-----"
                  className="w-full resize-y border-2 border-fg bg-surface p-2 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  Signing CA private key (PEM, unencrypted)
                </span>
                <textarea
                  value={caKeyPem}
                  onChange={(event) => setCaKeyPem(event.target.value)}
                  rows={3}
                  spellCheck={false}
                  placeholder="-----BEGIN PRIVATE KEY-----"
                  className="w-full resize-y border-2 border-fg bg-surface p-2 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                />
              </label>
            </div>

            <button type="button" onClick={generate} disabled={generating} className={buttonClass} style={mono}>
              {generating ? "Generating keys..." : `Generate ${preset === "ca" ? "root CA" : preset === "server" ? "server certificate" : "client certificate"}`}
            </button>

            <div className="border-2 border-fg">
              <div className="border-b-2 border-fg px-3 py-2">
                <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  Sign a certificate signing request
                </span>
              </div>
              <textarea
                value={csrPem}
                onChange={(event) => setCsrPem(event.target.value)}
                rows={4}
                spellCheck={false}
                placeholder="-----BEGIN CERTIFICATE REQUEST-----"
                className="w-full resize-y bg-transparent p-3 font-mono text-xs text-fg focus:outline-none"
                style={mono}
              />
              <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-3 py-2">
                <button type="button" onClick={signCsr} disabled={generating || !csrPem.trim()} className={buttonClass} style={mono}>
                  {generating ? "Signing..." : "Sign CSR"}
                </button>
                <span className="font-sans text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                  Uses the CA above, or a throwaway CA if none is set.
                </span>
              </div>
            </div>

            {artifacts.length > 0 && (
              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <div key={artifact.label} className="border-2 border-fg">
                    <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                      <span className="min-w-0 flex-1 font-mono text-2xs uppercase text-fg" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                        {artifact.label}
                      </span>
                      <button type="button" onClick={() => copy(artifact.value)} className={buttonClass} style={mono}>
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                        copy
                      </button>
                      <button type="button" onClick={() => download(artifact.filename, artifact.value)} className={buttonClass} style={mono}>
                        <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                        {artifact.filename.split(".").pop()}
                      </button>
                    </div>
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-2xs leading-relaxed text-fg-muted" style={mono}>
                      {artifact.value.length > 1200 ? `${artifact.value.slice(0, 1200)}\n...(truncated on screen, the copy and download are complete)` : artifact.value}
                    </pre>
                  </div>
                ))}
                <p className="font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                  Quick check with openssl: <code style={mono}>openssl x509 -in cert.crt -noout -text</code> or test mTLS with{" "}
                  <code style={mono}>openssl s_client -connect host:443 -cert client.crt -key client.key</code>.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
