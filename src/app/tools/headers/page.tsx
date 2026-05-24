"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

interface HeaderCheck {
  header: string;
  status: "ok" | "warn" | "missing" | "info";
  message: string;
}

function analyzeHeaders(raw: string): HeaderCheck[] {
  const lines = raw.split("\n").filter(l => l.trim());
  const headers: Record<string, string> = {};

  for (const line of lines) {
    // HTTP response status line
    if (/^HTTP\/[\d.]+\s+(\d{3})/.test(line)) {
      const code = line.match(/^HTTP\/[\d.]+\s+(\d{3})/)![1];
      headers["_status"] = code;
      continue;
    }
    const m = line.match(/^([\w-]+):\s*(.+)/i);
    if (m) {
      headers[m[1].toLowerCase()] = m[2].trim();
    }
  }

  const checks: HeaderCheck[] = [];

  // Status line
  if (headers["_status"]) {
    const code = parseInt(headers["_status"]);
    checks.push({
      header: "HTTP Status",
      status: code < 400 ? "ok" : "warn",
      message: `Response code ${code}${code >= 400 ? " — indicates an error or redirect" : ""}`,
    });
  }

  // Security headers
  const securityHeaders = {
    "content-security-policy": { name: "CSP", missing: "No Content-Security-Policy — XSS protection missing" },
    "strict-transport-security": { name: "HSTS", missing: "No HSTS — connections may be downgraded to HTTP" },
    "x-frame-options": { name: "X-Frame-Options", missing: "Missing — page can be iframed (clickjacking risk)" },
    "x-content-type-options": { name: "X-Content-Type-Options", missing: "Missing — MIME sniffing possible" },
    "referrer-policy": { name: "Referrer-Policy", missing: "Missing — referrer info may leak" },
    "permissions-policy": { name: "Permissions-Policy", missing: "Missing — no browser feature restrictions" },
  };

  for (const [key, info] of Object.entries(securityHeaders)) {
    if (headers[key]) {
      checks.push({ header: info.name, status: "ok", message: headers[key] });
    } else {
      checks.push({ header: info.name, status: "missing", message: info.missing });
    }
  }

  // Cookie analysis
  const setCookie = headers["set-cookie"];
  if (setCookie) {
    const hasHttpOnly = /httponly/i.test(setCookie);
    const hasSecure = /secure/i.test(setCookie || "");
    const hasSameSite = /samesite/i.test(setCookie || "");

    checks.push({
      header: "Set-Cookie: HttpOnly",
      status: hasHttpOnly ? "ok" : "warn",
      message: hasHttpOnly ? "Cookie has HttpOnly flag" : "Missing HttpOnly — JS can access cookie (XSS risk)",
    });
    checks.push({
      header: "Set-Cookie: Secure",
      status: hasSecure ? "ok" : "warn",
      message: hasSecure ? "Cookie has Secure flag" : "Missing Secure — cookie sent over HTTP",
    });
    checks.push({
      header: "Set-Cookie: SameSite",
      status: hasSameSite ? "ok" : "warn",
      message: hasSameSite ? "Cookie has SameSite attribute" : "Missing SameSite — CSRF protection reduced",
    });
  } else {
    checks.push({ header: "Cookies", status: "info", message: "No Set-Cookie headers found" });
  }

  // Server info disclosure
  if (headers["server"]) {
    checks.push({ header: "Server", status: "info", message: `Discloses: ${headers["server"]} — may help attackers fingerprint` });
  }
  if (headers["x-powered-by"]) {
    checks.push({ header: "X-Powered-By", status: "info", message: `Discloses: ${headers["x-powered-by"]} — reveals tech stack` });
  }

  // CORS
  if (headers["access-control-allow-origin"]) {
    checks.push({
      header: "CORS: ACAO",
      status: headers["access-control-allow-origin"] === "*" ? "warn" : "info",
      message: `Access-Control-Allow-Origin: ${headers["access-control-allow-origin"]}`,
    });
  }

  // Cache
  if (headers["cache-control"]) {
    checks.push({ header: "Cache-Control", status: "info", message: headers["cache-control"] });
  }

  return checks;
}

const STATUS_COLORS: Record<string, string> = {
  ok: "#00dd44",
  warn: "#ffdd00",
  missing: "#ff2d95",
  info: "#0055ff",
};

const STATUS_LABELS: Record<string, string> = {
  ok: "GOOD",
  warn: "WARN",
  missing: "MISSING",
  info: "INFO",
};

const EXAMPLE_HEADERS = `HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000
Server: nginx/1.24.0
Cache-Control: no-store
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax`;

export default function HeadersPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<HeaderCheck[]>([]);
  const [url, setUrl] = useState("");

  const handleAnalyze = useCallback(() => {
    setResults(analyzeHeaders(input));
  }, [input]);

  const handleFetch = useCallback(async () => {
    if (!url.trim()) return;
    try {
      const res = await fetch(url.trim());
      const headers: string[] = [];
      headers.push(`HTTP/${res.status < 200 ? "2" : "1.1"} ${res.status} ${res.statusText}`);
      res.headers.forEach((val, key) => headers.push(`${key}: ${val}`));
      const text = headers.join("\n");
      setInput(text);
      setResults(analyzeHeaders(text));
    } catch {
      setResults([{ header: "Error", status: "missing", message: "Failed to fetch headers — check URL" }]);
    }
  }, [url]);

  const ok = results.filter(r => r.status === "ok").length;
  const warn = results.filter(r => r.status === "warn").length;
  const missing = results.filter(r => r.status === "missing").length;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 min-h-screen" style={{ backgroundColor: "var(--surf)" }}>
        <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase mb-2" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            HTTP Header Analyzer
          </h1>
          <p className="font-mono text-sm text-fg-muted mb-6" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Paste raw HTTP response headers or fetch from URL
          </p>

          {/* URL fetch bar */}
          <div className="flex gap-2 mb-6">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 bg-transparent border-2 border-fg px-4 py-2 font-mono text-sm placeholder:text-fg-muted/50 focus:outline-none focus:border-brutal-pink transition-colors"
              style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}
              spellCheck={false}
            />
            <button
              onClick={handleFetch}
              className="font-mono text-xs uppercase px-4 py-2 border-2 border-fg hover:bg-fg hover:text-surface transition-colors cursor-pointer"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              Fetch
            </button>
          </div>

          <div className="border-2 border-fg bg-surface">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={EXAMPLE_HEADERS}
              className="w-full bg-transparent p-5 font-mono text-sm resize-none focus:outline-none placeholder:text-fg-muted/40"
              style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)", minHeight: 180 }}
              spellCheck={false}
            />
            <div className="flex items-center justify-between px-5 py-3 border-t-2 border-fg bg-fg text-surface">
              <span className="font-mono text-2xs uppercase" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                {input.split("\n").length} lines
              </span>
              <button
                onClick={handleAnalyze}
                className="font-mono text-xs uppercase px-4 py-2 border-2 border-surface hover:bg-white/10 transition-colors cursor-pointer"
                style={{ fontFamily: TYPOGRAPHY.fontMono }}
              >
                Analyze
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-8">
              {/* Summary bar */}
              <div className="flex gap-3 mb-4">
                {ok > 0 && <span className="font-mono text-2xs px-2 py-0.5 border" style={{ fontFamily: TYPOGRAPHY.fontMono, borderColor: STATUS_COLORS.ok, color: STATUS_COLORS.ok }}>{ok} OK</span>}
                {warn > 0 && <span className="font-mono text-2xs px-2 py-0.5 border" style={{ fontFamily: TYPOGRAPHY.fontMono, borderColor: STATUS_COLORS.warn, color: STATUS_COLORS.warn }}>{warn} WARN</span>}
                {missing > 0 && <span className="font-mono text-2xs px-2 py-0.5 border" style={{ fontFamily: TYPOGRAPHY.fontMono, borderColor: STATUS_COLORS.missing, color: STATUS_COLORS.missing }}>{missing} MISSING</span>}
              </div>

              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="border-2 border-fg p-3 bg-surface flex items-start gap-3"
                  >
                    <span
                      className="font-mono text-2xs uppercase shrink-0 px-2 py-0.5 border mt-0.5"
                      style={{
                        fontFamily: TYPOGRAPHY.fontMono,
                        borderColor: STATUS_COLORS[r.status],
                        color: STATUS_COLORS[r.status],
                      }}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-xs font-bold block" style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}>
                        {r.header}
                      </span>
                      <p className="font-sans text-xs text-fg-muted mt-1" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                        {r.message}
                      </p>
                    </div>
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
