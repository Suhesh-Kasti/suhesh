"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faGlobe, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

type Severity = "high" | "medium" | "low";
type Status = "ok" | "weak" | "missing";

interface Check {
  name: string;
  severity: Severity;
  recommended: string;
  why: string;
  validate: (value: string | undefined, headers: Record<string, string>) => Status;
}

const SEVERITY_COLOR: Record<Severity, string> = { high: COLORS.red, medium: COLORS.orange, low: COLORS.yellow };
const STATUS_COLOR: Record<Status, string> = { ok: COLORS.green, weak: COLORS.orange, missing: COLORS.red };

const CHECKS: Check[] = [
  {
    name: "Strict-Transport-Security",
    severity: "high",
    recommended: "max-age=31536000; includeSubDomains; preload",
    why: "Forces HTTPS and blocks downgrade and cookie-stripping attacks. Without it the first request can be intercepted.",
    validate: (value) => {
      if (!value) return "missing";
      const maxAge = Number(value.match(/max-age=(\d+)/)?.[1] ?? 0);
      return maxAge >= 15552000 ? "ok" : "weak";
    },
  },
  {
    name: "Content-Security-Policy",
    severity: "high",
    recommended: "default-src 'self'; object-src 'none'; frame-ancestors 'none'",
    why: "The main defence against XSS: it whitelists where scripts, styles and frames may come from.",
    validate: (value) => {
      if (!value) return "missing";
      if (/unsafe-inline|unsafe-eval/.test(value)) return "weak";
      return "ok";
    },
  },
  {
    name: "X-Content-Type-Options",
    severity: "medium",
    recommended: "nosniff",
    why: "Stops browsers guessing content types, which is how uploads get executed as scripts.",
    validate: (value) => (!value ? "missing" : value.toLowerCase().includes("nosniff") ? "ok" : "weak"),
  },
  {
    name: "X-Frame-Options",
    severity: "medium",
    recommended: "DENY",
    why: "Blocks clickjacking by refusing to be embedded in a frame. CSP frame-ancestors is the modern equivalent.",
    validate: (value, headers) => {
      if (value) return /deny|sameorigin/i.test(value) ? "ok" : "weak";
      return headers["content-security-policy"]?.includes("frame-ancestors") ? "ok" : "missing";
    },
  },
  {
    name: "Referrer-Policy",
    severity: "low",
    recommended: "strict-origin-when-cross-origin",
    why: "Controls how much of your URL leaks to third parties in the Referer header.",
    validate: (value) => {
      if (!value) return "missing";
      return /unsafe-url|no-referrer-when-downgrade/i.test(value) ? "weak" : "ok";
    },
  },
  {
    name: "Permissions-Policy",
    severity: "low",
    recommended: "geolocation=(), camera=(), microphone=()",
    why: "Explicitly disables powerful browser features you do not use.",
    validate: (value) => (value ? "ok" : "missing"),
  },
  {
    name: "Cross-Origin-Opener-Policy",
    severity: "low",
    recommended: "same-origin",
    why: "Isolates your window from cross-origin openers, which shuts down a class of side-channel attacks.",
    validate: (value) => (value ? "ok" : "missing"),
  },
  {
    name: "Access-Control-Allow-Origin",
    severity: "medium",
    recommended: "reflect only origins you trust",
    why: "A wildcard on an endpoint that also allows credentials lets any site read the response.",
    validate: (value, headers) => {
      if (!value) return "ok";
      if (value.trim() === "*" && /true/i.test(headers["access-control-allow-credentials"] ?? "")) return "weak";
      if (value.trim() === "*") return "weak";
      return "ok";
    },
  },
  {
    name: "Set-Cookie",
    severity: "medium",
    recommended: "HttpOnly; Secure; SameSite=Lax",
    why: "Session cookies without HttpOnly can be stolen by XSS; without Secure they leak over HTTP; without SameSite they ride along on cross-site requests.",
    validate: (value) => {
      if (!value) return "ok";
      const missing = ["httponly", "secure", "samesite"].filter((flag) => !value.toLowerCase().includes(flag));
      return missing.length === 0 ? "ok" : "weak";
    },
  },
];

const DISCLOSURE = ["server", "x-powered-by", "x-aspnet-version", "x-generator", "via", "x-debug-token"];

function parseHeaders(raw: string): Record<string, string> {
  const headers: Record<string, string> = {};
  let current = "";
  for (const line of raw.split(/\r?\n/)) {
    if (line.trim() === "") break;
    if (/^\s/.test(line) && current) {
      headers[current] += ` ${line.trim()}`;
      continue;
    }
    const match = line.match(/^([\w-]+):\s*(.*)$/);
    if (match) {
      current = match[1].toLowerCase();
      headers[current] = headers[current] ? `${headers[current]}, ${match[2]}` : match[2];
    }
  }
  return headers;
}

export default function HeadersPage() {
  const [input, setInput] = useLocalState("headers-input", "");
  const [url, setUrl] = useLocalState("headers-url", "");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [fetchNote, setFetchNote] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const { copied, copy } = useCopy();

  const headers = useMemo(() => parseHeaders(input), [input]);
  const headerNames = Object.keys(headers);

  const results = useMemo(
    () => CHECKS.map((check) => ({ check, status: check.validate(headers[check.name.toLowerCase()], headers) })),
    [headers]
  );

  const passed = results.filter((item) => item.status === "ok").length;
  const score = Math.round((passed / CHECKS.length) * 100);
  const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 55 ? "C" : score >= 35 ? "D" : "F";
  const gradeColor = score >= 75 ? COLORS.green : score >= 55 ? COLORS.yellow : COLORS.red;

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return results.filter(({ check, status }) => {
      const filterOk = filter === "all" || status === filter;
      const searchOk = !query || check.name.toLowerCase().includes(query) || check.why.toLowerCase().includes(query);
      return filterOk && searchOk;
    });
  }, [results, filter, search]);

  const fetchHeaders = async () => {
    const raw = url.trim();
    if (!raw) return;
    const target = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    setFetching(true);
    setFetchNote(null);
    try {
      const response = await fetch(`/api/fetch-headers?url=${encodeURIComponent(target)}`);
      const data = (await response.json()) as {
        error?: string;
        url?: string;
        status?: number;
        statusText?: string;
        redirects?: number;
        headers?: { name: string; value: string }[];
      };
      if (!response.ok || data.error) {
        setFetchNote(data.error ?? "That request could not be completed.");
        return;
      }
      const lines = [`HTTP ${data.status} ${data.statusText ?? ""}`.trim()];
      for (const header of data.headers ?? []) lines.push(`${header.name}: ${header.value}`);
      setInput(lines.join("\n"));
      setFetchNote(
        `Fetched server-side — no CORS, so cookies and Server headers come through. Final URL: ${data.url}${
          data.redirects ? ` (${data.redirects} redirect${data.redirects > 1 ? "s" : ""} followed)` : ""
        }. Internal and private addresses are refused.`
      );
    } catch {
      setFetchNote("The fetch failed. Check the hostname, then paste the headers from devtools instead — Network tab, response headers.");
    } finally {
      setFetching(false);
    }
  };

  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const chip = "cursor-pointer border-2 px-2.5 py-1 font-mono text-2xs uppercase transition-colors";
  const buttonClass =
    "inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <h1 className="font-display text-3xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
              Header Analyzer
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              9 checks
            </span>
          </div>

          <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            Paste a response header block and get a graded audit: what is missing, what is weak, and the exact value to set.
          </p>

          <ToolHelp
            intro="Response headers are the browser's safety manual. A handful of them decide whether your site can be framed, sniffed or loaded over plain HTTP. Fetch a host directly, or paste what you get from curl -I and the devtools Network tab."
            steps={[
              "Fetch a host by name, or paste raw response headers.",
              "Read the grade, then work down the findings by severity.",
              "Copy the recommended value for each and set it at the edge or app layer.",
              "Re-fetch after deploying to confirm the score moved.",
            ]}
            terms={[
              { term: "HSTS", meaning: "Strict-Transport-Security. Forces HTTPS for max-age seconds and enables preload." },
              { term: "CSP", meaning: "Content-Security-Policy. Whitelists script and frame sources; the main XSS mitigation." },
              { term: "nosniff", meaning: "X-Content-Type-Options: nosniff. Stops browsers executing mislabelled uploads." },
              { term: "Clickjacking", meaning: "Tricking a user into clicking a hidden frame. Blocked by X-Frame-Options or frame-ancestors." },
              { term: "Info disclosure", meaning: "Server and X-Powered-By hand an attacker a version number for free." },
            ]}
            notes={[
              "Headers reduce impact, they do not fix the underlying bug — treat them as defence in depth.",
              "CSP containing unsafe-inline is nearly the same as having no CSP at all.",
              "A wildcard Access-Control-Allow-Origin with credentials is a data leak, not a convenience.",
            ]}
          />

          <div className="my-6 flex flex-col gap-2 sm:flex-row">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") fetchHeaders();
              }}
              spellCheck={false}
              placeholder="https://example.com"
              className="min-w-0 flex-1 border-2 border-fg bg-surface px-3 py-2 font-mono text-sm text-fg focus:outline-none"
              style={mono}
            />
            <button type="button" onClick={fetchHeaders} disabled={fetching || !url.trim()} className={buttonClass} style={mono}>
              <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
              {fetching ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {fetchNote && (
            <p className="mb-4 border-2 border-fg-muted/30 p-3 font-mono text-2xs leading-relaxed text-fg-muted" style={mono}>
              {fetchNote}
            </p>
          )}

          <div className="mb-6 border-2 border-fg" style={{ backgroundColor: "var(--surf)" }}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={8}
              spellCheck={false}
              placeholder={"HTTP/1.1 200 OK\ncontent-type: text/html\nstrict-transport-security: max-age=31536000\n..."}
              className="w-full resize-y bg-transparent p-4 font-mono text-xs leading-relaxed text-fg focus:outline-none"
              style={mono}
            />
            <div className="flex flex-wrap items-center gap-2 border-t-2 border-fg px-3 py-2">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                {headerNames.length} headers parsed
              </span>
              <span className="flex-1" />
              <button type="button" onClick={() => setInput("")} className={buttonClass} style={mono}>
                Clear
              </button>
            </div>
          </div>

          {headerNames.length > 0 && (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-4 border-2 border-fg p-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center border-2 border-fg font-display text-2xl font-extrabold text-[#0a0a0a]" style={{ fontFamily: TYPOGRAPHY.fontDisplay, backgroundColor: gradeColor }}>
                  {grade}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: gradeColor }}>
                    {score}% of checks passing
                  </span>
                  <p className="mt-1 font-sans text-xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                    {passed} of {CHECKS.length} security headers are set correctly.
                  </p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {(["all", "missing", "weak", "ok"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    aria-pressed={filter === option}
                    className={`${chip} ${filter === option ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                    style={mono}
                  >
                    {option}
                  </button>
                ))}
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="search headers..."
                  spellCheck={false}
                  className="min-w-0 flex-1 basis-40 border-2 border-fg bg-surface px-2 py-1 font-mono text-xs text-fg focus:outline-none"
                  style={mono}
                />
              </div>

              <div className="space-y-3">
                {visible.map(({ check, status }) => (
                  <div key={check.name} className="border-2 border-fg" style={{ boxShadow: status === "ok" ? "none" : `4px 4px 0px ${STATUS_COLOR[status]}` }}>
                    <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
                      <span className="font-mono text-xs font-bold uppercase text-fg" style={mono}>
                        {check.name}
                      </span>
                      <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: STATUS_COLOR[status], color: STATUS_COLOR[status] }}>
                        {status}
                      </span>
                      <span className="border px-1.5 py-0.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: SEVERITY_COLOR[check.severity], color: SEVERITY_COLOR[check.severity] }}>
                        {check.severity}
                      </span>
                      <span className="flex-1" />
                      {status !== "ok" && (
                        <button type="button" onClick={() => copy(check.recommended)} className={buttonClass} style={mono}>
                          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                          copy fix
                        </button>
                      )}
                    </div>
                    <p className="px-3 py-2 font-sans text-xs leading-snug text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                      {check.why}
                    </p>
                    {status !== "ok" && (
                      <p className="border-t border-fg-muted/15 px-3 py-2 font-mono text-2xs text-fg" style={mono}>
                        {check.recommended}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 border-2 border-fg">
                <div className="flex items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[10px]" />
                  <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                    All response headers
                  </span>
                </div>
                <div className="divide-y divide-fg-muted/15">
                  {headerNames.map((name) => {
                    const disclosing = DISCLOSURE.includes(name);
                    return (
                      <div key={name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                        <span className="w-56 shrink-0 break-all font-mono text-2xs uppercase" style={{ ...mono, color: disclosing ? COLORS.orange : "var(--fg)" }}>
                          {name}
                        </span>
                        <span className="min-w-0 flex-1 break-all font-mono text-2xs text-fg-muted" style={mono}>
                          {headers[name]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
