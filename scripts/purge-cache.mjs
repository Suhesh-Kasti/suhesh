#!/usr/bin/env node
/**
 * Purges the Cloudflare cache as the final step of a deploy.
 *
 * Why this exists: the image optimiser rewrites references rather than hashing URLs,
 * so a replaced screenshot keeps its filename. Cloudflare and browsers then keep
 * serving the old bytes until the TTL expires, and the previous .png responses now
 * 404. Purging makes invalidation part of the deploy instead of a dashboard visit.
 *
 * Credentials, in order of preference:
 *   CF_PURGE_TOKEN  a token scoped to Zone → Cache Purge → Purge
 *   CF_API_TOKEN    reused if you gave your existing token that permission too
 * and CF_ZONE_ID for the zone. They can live in the environment, or in .env.local,
 * .dev.vars or .env — whichever you already use. Real environment variables always
 * win over the files.
 *
 * Without usable credentials it does nothing and says so, and a failed purge is
 * reported without failing the deploy, so this can never block a release.
 */
import { existsSync, readFileSync } from "node:fs";

/** Minimal KEY=value reader so a token can live in a file without a dotenv dependency. */
function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i.exec(line);
    if (!match) continue;
    const value = match[2].trim().replace(/^['"]|['"]$/g, "");
    // A real environment variable always wins over a file.
    if (!value || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = value;
  }
}

for (const file of [".env.local", ".dev.vars", ".env"]) loadEnvFile(file);

const ZONE_ID = process.env.CF_ZONE_ID;
const API_TOKEN = process.env.CF_PURGE_TOKEN || process.env.CF_API_TOKEN;

async function main() {
  if (!ZONE_ID || !API_TOKEN) {
    console.log("purge-cache: CF_ZONE_ID and CF_PURGE_TOKEN (or CF_API_TOKEN) not set, skipping");
    return;
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ purge_everything: true }),
    }
  );

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    const detail = body?.errors?.map((error) => error.message).join("; ") || response.statusText;
    console.log(`purge-cache: failed (${response.status}) ${detail}`);
    // A token without the Cache Purge permission is the likely cause here.
    if (response.status === 403) {
      console.log("purge-cache: that token needs Zone → Cache Purge → Purge for this zone");
    }
    return;
  }

  console.log("purge-cache: purged everything");
}

main().catch((error) => {
  console.log(`purge-cache: skipped (${error.message})`);
});
