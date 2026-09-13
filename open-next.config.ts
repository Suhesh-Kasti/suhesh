import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache: it needs R2, and R2 is not enabled on this account. The deploy
// fails at the populate step while this is set, so it stays off until R2 is turned on.
export default defineCloudflareConfig({});
