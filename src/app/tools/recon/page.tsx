"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faDownload, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { useLocalState } from "@/lib/useLocalState";
import ToolHelp from "@/components/tools/ToolHelp";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"] as const;
type RecordType = (typeof RECORD_TYPES)[number];
type Tab = "records" | "email" | "subdomains";

interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface Finding {
  level: "high" | "medium" | "info" | "good";
  text: string;
}

interface SubResult {
  name: string;
  type: string;
  value: string;
  interesting: boolean;
}

const LEVEL_COLOR: Record<Finding["level"], string> = { high: COLORS.red, medium: COLORS.orange, info: COLORS.teal, good: COLORS.green };

// One master list; "common" is the highest-signal slice, "extended" is everything.
const NAMES = [
  // web / apps
  "www", "www2", "www3", "web", "web1", "web2", "app", "apps", "portal", "my", "home", "m", "mobile",
  "shop", "store", "cart", "checkout", "pay", "billing", "payments", "account", "accounts", "profile",
  "login", "signin", "sso", "auth", "oauth", "id", "identity", "register", "signup", "verify",
  // environments
  "dev", "develop", "development", "staging", "stage", "stg", "test", "testing", "tst", "qa", "uat",
  "preprod", "preview", "beta", "alpha", "canary", "demo", "sandbox", "sbx", "lab", "labs", "poc",
  "old", "legacy", "archive", "backup", "bak", "temp", "tmp", "new", "v2", "v3", "next",
  // api / services
  "api", "api2", "api-v1", "api-v2", "apis", "graphql", "gql", "rest", "rpc", "ws", "wss", "socket",
  "gateway", "edge", "origin", "proxy", "lb", "router", "gw", "auth-api", "internal-api", "partner-api",
  // admin / ops
  "admin", "administrator", "manage", "management", "console", "cpanel", "whm", "dashboard", "panel",
  "ops", "operation", "ops-team", "noc", "helpdesk", "servicedesk", "itsm", "ticket", "support",
  "status", "health", "monitor", "monitoring", "metrics", "analytics", "stats", "logs", "logging",
  "grafana", "kibana", "prometheus", "nagios", "zabbix", "sentry", "datadog", "newrelic", "uptime",
  // dev tooling
  "git", "gitlab", "github", "bitbucket", "gitea", "gogs", "svn", "jenkins", "ci", "cd", "build",
  "builds", "bamboo", "teamcity", "circleci", "drone", "argocd", "argo", "spinnaker", "nexus",
  "artifactory", "jfrog", "sonar", "sonarqube", "review", "reviews", "gerrit", "code", "repo",
  "registry", "docker", "registry-1", "harbor", "quay", "packages", "npm", "pypi", "maven", "publish",
  // infra
  "k8s", "kubernetes", "cluster", "rancher", "openshift", "okd", "consul", "vault", "nomad",
  "terraform", "ansible", "puppet", "chef", "salt", "pulumi", "cloud", "aws", "azure", "gcp",
  "s3", "storage", "blob", "backups", "snapshot", "nfs", "cifs", "smb", "ftp", "sftp", "ftps",
  // mail
  "mail", "mail2", "smtp", "smtps", "imap", "pop", "pop3", "webmail", "mx", "mx1", "mx2", "email",
  "exchange", "owa", "autodiscover", "relay", "lists", "list", "newsletter", "em", "campaign",
  // dns / network
  "ns", "ns1", "ns2", "ns3", "dns", "dns1", "dns2", "resolver", "ntp", "time", "ldap", "ldaps",
  "ad", "dc", "dc1", "dc2", "radius", "tacacs", "dhcp", "ipam", "netbox", "router", "switch",
  "firewall", "fw", "vpn", "vpn2", "openvpn", "wireguard", "remote", "rdp", "citrix", "vdi",
  "bastion", "jump", "jumpserver", "teleport", "guacamole", "ssh", "shell", "term", "terminal",
  // data
  "db", "db1", "db2", "database", "mysql", "postgres", "postgresql", "mssql", "oracle", "sql",
  "redis", "mongo", "mongodb", "cassandra", "couchdb", "elastic", "elasticsearch", "opensearch",
  "clickhouse", "influx", "influxdb", "rabbitmq", "kafka", "zookeeper", "mq", "queue", "etl",
  "warehouse", "bi", "reports", "reporting", "data", "datalake", "lake", "airflow", "spark",
  // security
  "waf", "ids", "ips", "siem", "soc", "scanner", "nessus", "qualys", "burp", "acunetix",
  "tenable", "crowdstrike", "sentinel", "defender", "carbonblack", "splunk", "arcsight", "qradar",
  "secrets", "keys", "certs", "pki", "ca", "ocsp", "crl", "mfa", "2fa", "duo", "okta", "onelogin",
  // content / media
  "cdn", "cdn1", "cdn2", "static", "static1", "assets", "assets2", "img", "images", "image",
  "media", "video", "videos", "stream", "streaming", "live", "tv", "files", "file", "download",
  "downloads", "upload", "uploads", "docs", "doc", "documentation", "wiki", "confluence", "kb",
  "help", "support-docs", "developer", "developers", "devdocs", "api-docs", "swagger", "redoc",
  // business
  "blog", "news", "press", "media-kit", "about", "company", "careers", "career", "jobs", "job",
  "apply", "recruiting", "hr", "people", "team", "partners", "partner", "affiliate", "reseller",
  "investors", "ir", "finance", "legal", "compliance", "security", "trust", "privacy", "gdpr",
  // comms / collab
  "meet", "meeting", "vc", "zoom", "teams", "chat", "im", "slack", "mattermost", "rocket", "jitsi",
  "conference", "call", "phone", "voip", "pbx", "asterisk", "sms", "push", "notify", "alerts",
  // misc / legacy bait
  "test1", "test2", "test3", "dev1", "dev2", "stage1", "staging2", "prod", "production", "prod1",
  "prod2", "live", "www-old", "oldsite", "site", "site2", "web02", "server", "server1", "host",
  "host1", "node", "node1", "node2", "instance", "vm", "vm1", "cloud1", "backup1", "legacy2",
  "internal", "intranet", "extranet", "private", "secret", "hidden", "test-admin", "dev-admin",
  "staging-admin", "jenkins-dev", "gitlab-dev", "grafana-dev", "kibana-dev", "phpmyadmin", "pma",
  "adminer", "dbadmin", "sqladmin", "webmin", "plesk", "directadmin", "zabbix-dev", "prometheus-dev",
];

const UNIQUE = [...new Set(NAMES)];
const COMMON = UNIQUE.slice(0, 130);
const EXTENDED = UNIQUE;

const INTERESTING = ["dev", "staging", "stage", "test", "qa", "uat", "preprod", "demo", "sandbox", "old", "new", "backup", "internal", "intranet", "admin", "jenkins", "git", "vault", "kibana", "grafana", "nexus", "sonar"];
const DKIM_SELECTORS = ["default", "google", "selector1", "selector2", "k1", "mail", "s1", "dkim"];

async function dnsQuery(name: string, type: string): Promise<DohAnswer[]> {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`,
    { headers: { accept: "application/dns-json" } }
  );
  if (!response.ok) throw new Error(`DNS query failed with HTTP ${response.status}`);
  const data = (await response.json()) as { Answer?: DohAnswer[] };
  return data.Answer ?? [];
}

export default function ReconSuitePage() {
  const [domain, setDomain] = useLocalState("recon-domain", "");
  const [tab, setTab] = useLocalState<Tab>("recon-tab", "records");
  const [records, setRecords] = useLocalState<Partial<Record<RecordType, string[]>>>("recon-records", {});
  const [findings, setFindings] = useState<Finding[]>([]);
  const [wordlist, setWordlist] = useLocalState<"common" | "extended">("recon-wordlist", "common");
  const [subs, setSubs] = useLocalState<SubResult[]>("recon-subs", []);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<"all" | "interesting">("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const cancelled = useRef(false);
  const { copied, copy } = useCopy();

  const names = wordlist === "common" ? COMMON : EXTENDED;
  const base = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const runRecon = useCallback(async () => {
    if (!base) return;
    setScanning(true);
    setError(null);
    const collected: Partial<Record<RecordType, string[]>> = {};
    const found: Finding[] = [];
    try {
      for (const type of RECORD_TYPES) {
        const answers = await dnsQuery(base, type);
        const values = [...new Set(answers.map((answer) => answer.data.trim()))];
        if (values.length > 0) collected[type] = values;
      }
      setRecords(collected);

      const wildcard = await dnsQuery(`wildcard-${Date.now().toString(36)}.${base}`, "A");
      if (wildcard.length > 0) found.push({ level: "info", text: "Wildcard DNS is enabled — every subdomain resolves, so brute-force hits are noise." });

      const txt = collected.TXT ?? [];
      const spf = txt.find((value) => value.toLowerCase().startsWith("v=spf1"));
      if (!spf) found.push({ level: "medium", text: "No SPF record. Anyone can send mail claiming to be this domain." });
      else if (/[+]all|\?all/i.test(spf)) found.push({ level: "high", text: "SPF ends in +all or ?all, so it restricts nothing." });
      else if (spf.split(/\s+/).filter((part) => /^(include|a|mx|ptr|exists|ip4|ip6|redirect)/.test(part)).length > 10)
        found.push({ level: "info", text: "SPF exceeds 10 lookups, so some receivers treat it as a permanent error." });
      else found.push({ level: "good", text: "SPF record present and restrictive." });

      const dmarcAnswers = await dnsQuery(`_dmarc.${base}`, "TXT");
      const dmarc = dmarcAnswers.map((answer) => answer.data).find((value) => value.toLowerCase().includes("v=dmarc1"));
      if (!dmarc) found.push({ level: "medium", text: "No DMARC record — spoofed mail is neither reported nor blocked." });
      else if (/p=none/i.test(dmarc)) found.push({ level: "info", text: "DMARC is p=none: monitoring only, nothing is blocked yet." });
      else found.push({ level: "good", text: "DMARC present and enforcing." });

      const dkim: string[] = [];
      for (const selector of DKIM_SELECTORS) {
        const answers = await dnsQuery(`${selector}._domainkey.${base}`, "TXT");
        if (answers.some((answer) => answer.data.length > 20)) dkim.push(selector);
      }
      found.push(
        dkim.length > 0
          ? { level: "good", text: `DKIM key found for selector(s): ${dkim.join(", ")}.` }
          : { level: "info", text: "No DKIM key on the common selectors — it may use a custom selector." }
      );
      if (!collected.MX) found.push({ level: "info", text: "No MX records: this domain does not receive mail, so mail protections matter less." });
      setFindings(found);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lookup failed");
    } finally {
      setScanning(false);
    }
  }, [base, setRecords]);

  const runSubdomains = useCallback(async () => {
    if (!base) return;
    cancelled.current = false;
    setScanning(true);
    setProgress(0);
    setSubs([]);
    const found: SubResult[] = [];
    for (let index = 0; index < names.length; index += 8) {
      if (cancelled.current) break;
      const batch = names.slice(index, index + 8);
      const settled = await Promise.all(
        batch.map(async (label) => {
          try {
            const answers = await dnsQuery(`${label}.${base}`, "A");
            const cnames = answers.length === 0 ? await dnsQuery(`${label}.${base}`, "CNAME") : [];
            if (answers.length > 0) return { name: `${label}.${base}`, type: "A", value: answers[0].data, interesting: INTERESTING.includes(label) };
            if (cnames.length > 0) return { name: `${label}.${base}`, type: "CNAME", value: cnames[0].data, interesting: true };
            return null;
          } catch {
            return null;
          }
        })
      );
      for (const item of settled) if (item) found.push(item);
      setSubs([...found]);
      setProgress(Math.round(((index + batch.length) / names.length) * 100));
    }
    setScanning(false);
  }, [base, names, setSubs]);

  const visibleSubs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subs
      .filter((result) => (filter === "all" ? true : result.interesting))
      .filter((result) => !query || result.name.toLowerCase().includes(query) || result.value.toLowerCase().includes(query));
  }, [subs, filter, search]);

  const present = RECORD_TYPES.filter((type) => (records[type]?.length ?? 0) > 0);
  const allText = [
    ...present.flatMap((type) => (records[type] ?? []).map((value) => `${type}\t${value}`)),
    ...subs.map((result) => `${result.type}\t${result.name}\t${result.value}`),
  ].join("\n");

  const download = () => {
    const blob = new Blob([allText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `recon-${base || "scan"}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
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
              Recon Suite
            </h1>
            <div className="h-1 flex-1" style={{ backgroundColor: "var(--fg)" }} />
            <span className="font-mono text-xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label, color: "var(--fg-muted)" }}>
              dns · email · subdomains
            </span>
          </div>

          <p className="mb-2 font-sans text-sm leading-relaxed text-fg" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
            Everything you need before opening a browser: every DNS record, whether the mail can be spoofed, and which subdomains resolve.
          </p>

          <ToolHelp
            intro="Recon starts with DNS. Records tell you who hosts the site and who handles mail; SPF and DMARC decide whether anyone can send mail as the domain; subdomains are the extra doors people forget to lock. All lookups go to Cloudflare's DNS-over-HTTPS resolver."
            steps={[
              "Enter a domain and run the recon — records and findings come back together.",
              "Check the findings panel: missing DMARC is a reportable, low-risk issue.",
              "Switch to the Subdomains tab and scan; interesting names are flagged.",
              "Export everything as a text file for your notes.",
            ]}
            terms={[
              { term: "A / AAAA", meaning: "The IPv4 and IPv6 addresses serving the domain." },
              { term: "MX", meaning: "Who receives email for the domain." },
              { term: "TXT", meaning: "Free-form records, where SPF, DMARC and verification tokens live." },
              { term: "NS", meaning: "The authoritative name servers — who really controls the zone." },
              { term: "SPF", meaning: "TXT record listing who may send mail. Must end in -all or ~all to restrict anything." },
              { term: "DMARC", meaning: "Policy at _dmarc telling receivers what to do with failing mail." },
              { term: "DKIM", meaning: "Public key at <selector>._domainkey that signs outgoing mail." },
              { term: "Subdomain takeover", meaning: "A dangling CNAME lets anyone claim the name on a third-party service." },
            ]}
            notes={[
              "Test a random subdomain first — if it resolves, wildcard DNS is on and the results are noise.",
              "SPF ending in +all is worse than no SPF: it authorises the whole internet.",
              "Reuse the subdomain list as an nmap input file once hosts are resolved.",
            ]}
          />

          <div className="my-6 flex flex-col gap-2 sm:flex-row">
            <input
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runRecon();
              }}
              spellCheck={false}
              placeholder="example.com"
              className="min-w-0 flex-1 border-2 border-fg bg-surface px-3 py-2 font-mono text-sm text-fg focus:outline-none"
              style={mono}
            />
            <button type="button" onClick={runRecon} disabled={scanning || !base} className={buttonClass} style={mono}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[10px]" />
              {scanning ? "Working..." : "Run recon"}
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-1.5">
            {(["records", "email", "subdomains"] as const).map((option) => (
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
            <span className="flex-1" />
            {allText && (
              <>
                <button type="button" onClick={() => copy(allText)} className={buttonClass} style={mono}>
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                  copy all
                </button>
                <button type="button" onClick={download} className={buttonClass} style={mono}>
                  <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
                  .txt
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="mb-6 border-2 p-3 font-mono text-xs" style={{ ...mono, borderColor: COLORS.red, color: COLORS.red }}>
              {error}
            </div>
          )}

          {tab === "records" && (
            <div className="space-y-4">
              {present.length === 0 && (
                <p className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  no records yet — run the recon
                </p>
              )}
              {present.map((type) => {
                const values = records[type] ?? [];
                return (
                  <div key={type} className="border-2 border-fg">
                    <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg bg-fg px-3 py-2 text-surface">
                      <span className="font-mono text-2xs uppercase" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                        {type} · {values.length}
                      </span>
                      <span className="flex-1" />
                      <button
                        type="button"
                        onClick={() => copy(values.join("\n"))}
                        className="inline-flex cursor-pointer items-center gap-1 border border-current px-2 py-0.5 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
                        style={mono}
                      >
                        <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                        copy
                      </button>
                    </div>
                    <ul className="divide-y divide-fg-muted/15">
                      {values.map((value) => (
                        <li key={value} className="break-all px-3 py-2 font-mono text-xs text-fg" style={mono}>
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "email" && (
            <div className="border-2 border-fg">
              <div className="border-b-2 border-fg px-3 py-2">
                <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                  Mail posture
                </span>
              </div>
              <ul className="divide-y divide-fg-muted/15">
                {findings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2 px-3 py-2">
                    <span className="mt-1 h-2 w-2 shrink-0" style={{ backgroundColor: LEVEL_COLOR[finding.level] }} />
                    <span className="font-sans text-xs leading-snug" style={{ fontFamily: TYPOGRAPHY.fontSans, color: LEVEL_COLOR[finding.level] }}>
                      {finding.text}
                    </span>
                  </li>
                ))}
                {findings.length === 0 && (
                  <li className="px-3 py-4 font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    run the recon to check SPF, DMARC and DKIM
                  </li>
                )}
              </ul>
            </div>
          )}

          {tab === "subdomains" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {(["common", "extended"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setWordlist(option)}
                    aria-pressed={wordlist === option}
                    className={`${chip} ${wordlist === option ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                    style={mono}
                  >
                    {option} ({option === "common" ? COMMON.length : EXTENDED.length})
                  </button>
                ))}
                <button type="button" onClick={() => (scanning ? (cancelled.current = true) : runSubdomains())} disabled={!base} className={buttonClass} style={mono}>
                  {scanning ? "Stop" : "Scan subdomains"}
                </button>
                {scanning && (
                  <div className="flex min-w-32 flex-1 items-center gap-2">
                    <div className="h-2 flex-1 border border-fg-muted/30">
                      <div className="h-full transition-[width] duration-200" style={{ width: `${progress}%`, backgroundColor: COLORS.green }} />
                    </div>
                    <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                      {progress}%
                    </span>
                  </div>
                )}
              </div>

              {subs.length > 0 && (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {(["all", "interesting"] as const).map((option) => (
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
                      placeholder="search results..."
                      spellCheck={false}
                      className="min-w-0 flex-1 basis-40 border-2 border-fg bg-surface px-2 py-1 font-mono text-xs text-fg focus:outline-none"
                      style={mono}
                    />
                    <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                      {subs.length} resolved
                    </span>
                  </div>

                  <div className="border-2 border-fg divide-y divide-fg-muted/15">
                    {visibleSubs.map((result) => (
                      <div key={result.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2">
                        <span className="min-w-0 flex-1 break-all font-mono text-xs text-fg" style={mono}>
                          {result.name}
                        </span>
                        <span className="shrink-0 border px-1.5 font-mono text-2xs uppercase" style={{ ...mono, borderColor: result.type === "CNAME" ? COLORS.pink : COLORS.teal, color: result.type === "CNAME" ? COLORS.pink : COLORS.teal }}>
                          {result.type}
                        </span>
                        <span className="w-full break-all font-mono text-2xs text-fg-muted sm:w-auto" style={mono}>
                          {result.value}
                        </span>
                      </div>
                    ))}
                    {visibleSubs.length === 0 && (
                      <p className="px-3 py-4 font-mono text-2xs uppercase text-fg-muted" style={mono}>
                        nothing matches that filter
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
