#!/usr/bin/env node
/**
 * Keeps only the newest cache generations in the R2 bucket.
 *
 * Why: every deploy writes a full new generation of the incremental cache under its own
 * build-id prefix, and nothing removes the old ones. With occasional bursts of 20-40
 * deploys that grows quickly, while a time-based lifecycle rule cannot work at all when
 * deploys are sometimes six months apart — a window short enough for the bursts would
 * expire the live cache during the quiet periods and bring back Error 1102.
 *
 * It runs AFTER the new generation is populated, so the live cache is never missing.
 * By default it only reports; pass --apply to actually delete.
 *
 * Credentials (an R2 API token with Object Read & Write, plus the account id):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 * Without them it prints a note and exits 0, so it can never break a deploy.
 */
import { createHash, createHmac } from "node:crypto";

// The account id is already used for the cache purge locally, so accept either name.
const ACCOUNT = process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || "suhesh-next-cache";
const APPLY = process.argv.includes("--apply");
const KEEP = Number(process.env.R2_KEEP_GENERATIONS || 2);
const HOST = ACCOUNT ? `${ACCOUNT}.r2.cloudflarestorage.com` : "";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();

/** Minimal SigV4, which is what R2's S3-compatible endpoint expects. */
function signedHeaders(method, path, query, payload) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256(payload);

  const canonical = [
    method,
    path,
    query
      .split("&")
      .filter(Boolean)
      .map((pair) => {
        const [k, v = ""] = pair.split("=");
        return `${encodeURIComponent(k)}=${encodeURIComponent(decodeURIComponent(v))}`;
      })
      .sort()
      .join("&"),
    `host:${HOST}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    "",
    "host;x-amz-content-sha256;x-amz-date",
    payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${SECRET}`, dateStamp), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(toSign).digest("hex");

  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${KEY_ID}/${scope}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${signature}`,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
}

async function call(method, query, body = "") {
  const path = `/${BUCKET}`;
  const headers = signedHeaders(method, path, query, body);
  const res = await fetch(`https://${HOST}${path}${query ? `?${query}` : ""}`, { method, headers, body: body || undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${query || path} -> ${res.status} ${text.slice(0, 200)}`);
  return text;
}

/** Every object key in the bucket, following pagination. */
async function listAllKeys() {
  const keys = [];
  let token = "";
  for (;;) {
    const query = `list-type=2&max-keys=1000${token ? `&continuation-token=${encodeURIComponent(token)}` : ""}`;
    const xml = await call("GET", query);
    keys.push(...[...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]));
    const next = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
    if (!next) return keys;
    token = next[1];
  }
}

async function deleteKeys(keys) {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    const body = `<Delete>${batch.map((k) => `<Object><Key>${k}</Key></Object>`).join("")}</Delete>`;
    await call("POST", "delete", body);
  }
}

async function main() {
  if (!ACCOUNT || !KEY_ID || !SECRET) {
    console.log("prune-cache: R2 credentials not set, skipping (set R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY)");
    return;
  }

  const keys = await listAllKeys();
  const generations = new Map();
  for (const key of keys) {
    const generation = key.split("/")[0];
    if (!generation) continue;
    generations.set(generation, (generations.get(generation) || 0) + 1);
  }

  // Newest first, by object count as a proxy for a complete generation — the one just
  // populated always has the most objects of any single deploy.
  const ordered = [...generations.entries()].sort((a, b) => b[1] - a[1]);
  const keep = new Set(ordered.slice(0, KEEP).map(([name]) => name));
  const doomed = keys.filter((key) => !keep.has(key.split("/")[0]));

  console.log(`prune-cache: ${keys.length} objects in ${generations.size} generation(s); keeping ${keep.size}, ${doomed.length} to remove`);
  if (!doomed.length) return;
  if (!APPLY) {
    console.log("prune-cache: dry run — re-run with --apply to delete");
    return;
  }
  await deleteKeys(doomed);
  console.log(`prune-cache: removed ${doomed.length} objects`);
}

main().catch((error) => {
  // Never fail a deploy over cache housekeeping.
  console.log(`prune-cache: skipped (${error.message})`);
});
