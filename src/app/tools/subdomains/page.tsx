"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SearchButton from "@/components/SearchButton";
import { TYPOGRAPHY } from "@/lib/design-tokens";

const COMMON_SUBDOMAINS = [
  "www", "mail", "ftp", "dev", "staging", "api", "admin", "blog", "cdn",
  "vpn", "portal", "test", "remote", "secure", "webmail", "ns1", "ns2",
  "shop", "store", "app", "status", "docs", "support", "help", "login",
  "auth", "sso", "dashboard", "my", "m", "mobile", "beta", "intranet",
  "uat", "qa", "sandbox", "mx", "smtp", "pop", "imap", "dns", "git",
  "svn", "jenkins", "ci", "monitor", "metrics", "grafana", "kibana",
];

interface SubResult {
  subdomain: string;
  full: string;
  found: boolean;
  ip?: string;
}

async function checkSubdomain(domain: string, sub: string): Promise<SubResult> {
  const full = `${sub}.${domain}`;
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${full}&type=A`, {
      headers: { Accept: "application/dns-json" },
    });
    const data = await res.json();
    const found = data.Answer && data.Answer.length > 0;
    return {
      subdomain: sub,
      full,
      found,
      ip: found ? data.Answer[0].data : undefined,
    };
  } catch {
    return { subdomain: sub, full, found: false };
  }
}

export default function SubdomainsPage() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<SubResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleScan = useCallback(async () => {
    const d = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    if (!d) return;

    setScanning(true);
    setResults([]);
    setProgress(0);

    const batchSize = 5;
    const found: SubResult[] = [];

    for (let i = 0; i < COMMON_SUBDOMAINS.length; i += batchSize) {
      const batch = COMMON_SUBDOMAINS.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(sub => checkSubdomain(d, sub)));
      found.push(...batchResults);
      setResults([...found]);
      setProgress(((i + batchSize) / COMMON_SUBDOMAINS.length) * 100);
    }

    // Sort: found first
    setResults(found.sort((a, b) => (b.found ? 1 : 0) - (a.found ? 1 : 0)));
    setScanning(false);
  }, [domain]);

  const foundCount = results.filter(r => r.found).length;

  const handleCopyFound = useCallback(() => {
    const list = results.filter(r => r.found).map(r => r.full).join("\n");
    navigator.clipboard.writeText(list);
  }, [results]);

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16 min-h-screen" style={{ backgroundColor: "var(--surf)" }}>
        <section className="py-16 px-6 md:px-12 max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold uppercase mb-2" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Subdomain Scanner
          </h1>
          <p className="font-mono text-sm text-fg-muted mb-2" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            DNS lookup for {COMMON_SUBDOMAINS.length} common subdomains via Cloudflare DNS
          </p>
          <p className="font-mono text-2xs text-fg-muted/50 mb-10" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            No auth, no rate limit abuse — just DNS queries
          </p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleScan(); }}
              placeholder="example.com"
              className="flex-1 bg-transparent border-2 border-fg px-5 py-3 font-mono text-sm placeholder:text-fg-muted/50 focus:outline-none focus:border-brutal-pink transition-colors"
              style={{ fontFamily: TYPOGRAPHY.fontMono, color: "var(--fg)" }}
              spellCheck={false}
            />
            <button
              onClick={handleScan}
              disabled={scanning || !domain.trim()}
              className="font-mono text-xs uppercase px-6 py-3 border-2 border-fg hover:bg-fg hover:text-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: TYPOGRAPHY.fontMono }}
            >
              {scanning ? `${Math.round(progress)}%` : "Scan"}
            </button>
          </div>

          {/* Progress bar */}
          {scanning && (
            <div className="h-1 border border-fg-muted/30 mb-6 overflow-hidden">
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${progress}%`, backgroundColor: "#ff5500" }}
              />
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-mono text-xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                  {foundCount}/{results.length} found · {COMMON_SUBDOMAINS.length} checked
                </span>
                {foundCount > 0 && (
                  <button
                    onClick={handleCopyFound}
                    className="font-mono text-2xs uppercase px-2 py-1 border border-fg-muted/30 hover:border-fg transition-colors cursor-pointer"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  >
                    Copy found
                  </button>
                )}
              </div>

              <div className="border-2 border-fg divide-y-2 divide-fg-muted/20">
                {results.map((r, i) => (
                  <div
                    key={r.subdomain}
                    className="flex items-center justify-between px-4 py-2"
                    style={{ opacity: r.found ? 1 : 0.4 }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2 h-2 shrink-0"
                        style={{ backgroundColor: r.found ? "#00dd44" : "#888" }}
                      />
                      <span
                        className="font-mono text-xs"
                        style={{ fontFamily: TYPOGRAPHY.fontMono, color: r.found ? "var(--fg)" : "var(--fg-muted)" }}
                      >
                        {r.full}
                      </span>
                    </div>
                    <span className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                      {r.found ? r.ip : "N/A"}
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
