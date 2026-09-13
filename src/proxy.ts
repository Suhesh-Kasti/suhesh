import { NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

/**
 * A static CSP: the site ships no third-party scripts, so 'self' plus inline (used by
 * Next's bootstrap and inline style attributes) is enough. unsafe-eval is added in dev only.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Handlers must be real listeners, never inline attributes. React always attaches
  // listeners, so this costs nothing and closes the inline-attribute XSS path even
  // though script-src still needs 'unsafe-inline' for Next's own bootstrap scripts.
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://cloudflare-dns.com",
  // Two HTB writeups embed YouTube walkthroughs. Without this they fall back to
  // default-src 'self' and the players never load.
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

export function proxy() {
  const response = NextResponse.next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  // Static assets skip the proxy entirely: there is nothing for it to do to an image, a
  // font or a machine-readable file like /llms.txt or /rss.xml, and keeping them out of the
  // request path is cheaper.
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|ttf|otf|pdf|txt|xml|json|webmanifest|map)$).*)",
};
