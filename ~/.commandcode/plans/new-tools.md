# Plan: MDX Preview Fix + New Cybersecurity Tools

## 1. Fix DataBar & ConceptExplorer Rendering in MDX Preview

**Problem:** The `MdxPreviewTool.tsx` and standalone `mdx-preview/page.tsx` parsers may not correctly handle JSON-like `data={[...]}` and `steps={[...]}` syntax inside multiline component tags — especially when keys contain special chars.

**Fix:** Both parsers need to properly handle:
- Multiline blocks with embedded curly braces `{}` and square brackets `[]`
- JSON property keys with double quotes (the current regex may fail on nested structures)
- Edge case: empty data/steps arrays
- Ensure both parsers (MdxPreviewTool and standalone page) use identical parsing logic

**Files:**
- `src/components/tools/MdxPreviewTool.tsx`
- `src/app/tools/mdx-preview/page.tsx`

**Approach:** Extract the DataBar and ConceptExplorer parser blocks into a shared utility function (e.g., a helper at the top of MdxPreviewTool.tsx that can also be used by the standalone page) so both stay in sync.

---

## 2. New Cybersecurity Tools (Standalone Pages)

Each tool gets: its own route `/tools/[slug]`, a page.tsx, a listing card on the tools hub, and brutalist styling.

### 2a. Hash Identifier — `/tools/hash-id`
**What it does:** Paste a hash string, it identifies the likely hash type based on length, character set, and format patterns.

**Detection rules:**
- MD5: 32 hex chars
- SHA-1: 40 hex chars
- SHA-256: 64 hex chars
- SHA-512: 128 hex chars
- bcrypt: starts with `$2a$`, `$2b$`, `$2y$`
- NTLM: 32 hex chars
- MySQL 4.1+: starts with `*` + 40 hex
- SHA-256 crypt: starts with `$5$`
- SHA-512 crypt: starts with `$6$`
- CRC32: 8 hex chars
- Base64: matches `[A-Za-z0-9+/=]+` pattern

**UI:** Paste area, "Identify" button, result in colored badge + confidence %. History of past identifications in localStorage.

**File:** `src/app/tools/hash-id/page.tsx`

---

### 2b. HTTP Header Analyzer — `/tools/headers`
**What it does:** Paste raw HTTP response headers, get a security analysis with color-coded results.

**Checks:**
- Missing security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Cookie flags: HttpOnly, Secure, SameSite
- Server info disclosure (Server, X-Powered-By headers)
- CORS headers analysis (ACAO, ACAC)
- Cache-Control analysis
- TLS info (Strict-Transport-Security max-age)

**UI:** Paste textarea, results rendered as a checklist-style report with green/yellow/red markers. Also has a "Fetch from URL" input to pull headers live.

**File:** `src/app/tools/headers/page.tsx`

---

### 2c. Hex Dump Analyzer — `/tools/hexdump`
**What it does:** Paste a hex dump (or raw hex), get highlighted analysis: ASCII decode, pattern detection, file magic bytes identification.

**Features:**
- Split view: hex on left, ASCII on right (classic xxd format)
- Highlight: null bytes, printable ASCII, control chars, repeated patterns
- Magic bytes detection: PNG, JPG, GIF, PDF, ELF, PE, ZIP, etc.
- Byte frequency histogram (mini bar chart)
- Entropy score

**UI:** Paste area, "Parse" button, dual-pane xxd-style output with color highlighting, magic bytes badge if detected.

**File:** `src/app/tools/hexdump/page.tsx`

---

### 2d. Subdomain Enum Lookup — `/tools/subdomains`
**What it does:** Client-side DNS check for common subdomains. Takes a domain, checks a list of ~50 common subdomains via public DNS-over-HTTPS API (Cloudflare's `1.1.1.1/dns-query`).

**Subdomain list:** www, mail, ftp, dev, staging, api, admin, blog, cdn, vpn, portal, test, remote, secure, webmail, ns1/ns2, etc.

**UI:** Domain input → "Scan" → animated results table with found/not-found status. Color-coded: found (green), not found (grey). Copy found subdomains button.

**File:** `src/app/tools/subdomains/page.tsx`

---

### 2e. Port Info Reference — `/tools/ports`
**What it does:** Interactive reference table of common ports with service descriptions, known vulnerabilities, and protocol info. Search/filter by port number or service name.

**Data:** Top ~100 common ports with service name, protocol (TCP/UDP), description, known associations (e.g., 3306 → MySQL, 6379 → Redis, 27017 → MongoDB).

**UI:** Searchable table, click a port → expand row with details. Copy port list button (e.g., "22,80,443,3306..."). **Bonus:** a `<DataBar>` component showing top 10 port frequency from common scans.

**File:** `src/app/tools/ports/page.tsx`

---

## 3. Update Tools Hub Listing

**File:** `src/components/ArtPlayground.tsx`

Add cards for all 5 new tools in the standalone cards grid (Section A). Format matches existing JWT/Payloads/MDX cards:
- Icon area, title, description, route link, color accent

Also: add DataBar and ConceptExplorer to the MDX Preview embedded mode's parser (already have imports, just verify they render inline).

---

## 4. Style Guidelines for New Tools

All new tools follow brutalist site aesthetic:
- `border-2 border-fg` containers
- Mono font headers, sans body text
- `var(--surf)` / `var(--fg)` CSS variables for theming
- `shadow-brutal` for cards
- Colored accent borders matching tool identity
- `<DataBar>` used where appropriate for data visualization
- `<ConceptExplorer>` used where step-by-step breakdown makes sense

---

## 5. Verification

1. Run `npx tsc --noEmit` — zero TypeScript errors
2. Run `npx next build` — clean build
3. Visit `/tools/hash-id`, `/tools/headers`, `/tools/hexdump`, `/tools/subdomains`, `/tools/ports` — each renders with full interaction
4. Visit `/tools` — all 8 tool cards visible (3 existing + 5 new)
5. Visit `/tools/mdx-preview` — paste DataBar and ConceptExplorer syntax, verify preview renders correctly
6. Deploy via `npx opennextjs-cloudflare build && deploy`
