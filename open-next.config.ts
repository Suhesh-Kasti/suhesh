import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// Prerendered pages are stored in R2 instead of being re-rendered on every request.
// Without this the Worker rebuilds each page per visit, which is what exhausted the CPU
// budget and returned Error 1102 to real visitors. Requires R2 enabled and the bucket
// named in wrangler.toml to exist, or the deploy fails at the cache-populate step.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
