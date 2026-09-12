const BLOCKED_HOSTNAMES = ["localhost", "metadata.google.internal", "metadata", "instance-data"];

const BLOCKED_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa", ".test", ".invalid", ".example", ".lan", ".intranet"];

function isIpLiteral(hostname: string): boolean {
  if (hostname.startsWith("[")) return true;
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function ipv4IsPrivate(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a === 192 && b === 88 && parts[2] === 99) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51 && parts[2] === 100) return true;
  if (a === 203 && b === 0 && parts[2] === 113) return true;
  if (a >= 224) return true;
  return false;
}

function ipv6IsPrivate(ip: string): boolean {
  const value = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (value === "::" || value === "::1") return true;
  const mapped = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return ipv4IsPrivate(mapped[1]);
  if (value.startsWith("fc") || value.startsWith("fd")) return true;
  if (/^fe[89ab]/.test(value)) return true;
  if (value.startsWith("ff")) return true;
  if (value.startsWith("64:ff9b:") || value.startsWith("2001:db8")) return true;
  return false;
}

function ipIsPrivate(ip: string): boolean {
  return ip.includes(":") ? ipv6IsPrivate(ip) : ipv4IsPrivate(ip);
}

export function hostnameIsBlocked(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(host)) return true;
  if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  if (isIpLiteral(host)) return ipIsPrivate(host.replace(/^\[|\]$/g, ""));
  return false;
}

async function resolveIps(hostname: string): Promise<string[]> {
  const ips: string[] = [];
  for (const type of ["A", "AAAA"]) {
    try {
      const response = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`,
        {
          headers: { accept: "application/dns-json" },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (!response.ok) continue;
      const data = (await response.json()) as { Answer?: { type: number; data: string }[] };
      for (const answer of data.Answer ?? []) {
        if (answer.type === 1 || answer.type === 28) ips.push(answer.data);
      }
    } catch {
      // A failed resolution is treated as "no address", handled by the caller.
    }
  }
  return ips;
}

export interface SafeUrlResult {
  url?: URL;
  error?: string;
}

/**
 * Validates a user-supplied URL before the server fetches it.
 * Blocks non-http(s), non-web ports, internal hostnames and hosts that resolve to private addresses.
 */
export async function assertSafeUrl(raw: string): Promise<SafeUrlResult> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "That is not a valid URL." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "Only http:// and https:// URLs can be fetched." };
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    return { error: "Only standard web ports (80 and 443) are allowed." };
  }
  if (hostnameIsBlocked(url.hostname)) {
    return { error: "That host is not allowed (internal or private address)." };
  }
  if (!isIpLiteral(url.hostname)) {
    const ips = await resolveIps(url.hostname);
    if (ips.length === 0) return { error: "That hostname does not resolve." };
    if (ips.some((ip) => ipIsPrivate(ip))) {
      return { error: "That hostname resolves to a private address and is not allowed." };
    }
  }
  return { url };
}

/**
 * Only accept calls made from this site's own pages. Browsers stamp every request with
 * Sec-Fetch-Site; curl and scripts send neither that nor a matching Origin/Referer.
 */
export function isSameOrigin(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin";
  const host = request.headers.get("host");
  if (!host) return false;
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!source) return false;
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

export function clientKey(request: Request, scope: string): string {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${ip}`;
}

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 4000;

/** Best-effort per-isolate limiter. Pair with a Cloudflare WAF rate-limiting rule in production. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) buckets.clear();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((time) => now - time < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  return true;
}
