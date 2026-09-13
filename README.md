# suhesh

**[suhesh.com.np](https://suhesh.com.np)** — my personal security research site and knowledge base.

Portfolio, a written archive of everything I learn, browser tools, and a knowledge map — statically rendered and deployed to Cloudflare Workers for nothing a month.

---

## What's in here

| | |
|---|---|
| **Portfolio** | Security projects, with the writeups behind them |
| **Brain Dump** | 187 articles — 31 deep dives, 25 byte-sized notes, 25 cheatsheets, 5 checklists, 100 lab writeups |
| **Knowledge Map** | Zoomable map of every article, grouped by topic |
| **CyberTools** | 14 tools that run entirely in the browser — JWT debugger, CVSS calculator, payload encoders, hash identifier, reverse shell builder, HTTP header analyser and more |
| **Ask** | Retrieval over my own articles, answered by Cloudflare Workers AI |
| **Feeds** | RSS, plus `llms.txt` so language models can find my writing |

---

## Stack

| Layer | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Motion | Framer Motion, GSAP |
| Content | MDX compiled to ESM at build time |
| Hosting | Cloudflare Workers via OpenNext |
| AI | Cloudflare Workers AI |

---

## Running it

```bash
npm install
npm run dev          # → http://localhost:3000
```

`npm run dev` and `npm run build` both run `scripts/generate-content-registry.mjs` first. It scans `content/`, parses frontmatter, compiles every `.mdx` file to a plain ESM module in `src/generated/`, and writes the content registry the app reads. Nothing is parsed at request time.

```bash
npm run build        # production build
npm run lint         # eslint
npm run deploy       # build + deploy to Cloudflare Workers
```

---

## Writing content

Articles live in `content/`, and the folder determines the type:

```
content/
├── blog/            # long-form deep dives
├── til/             # byte-sized single-idea notes
├── cheatsheets/     # command and reference sheets
├── checklists/      # step-by-step procedures
├── labs/            # lab and CTF writeups
└── series/          # multi-part series and roadmaps
```

Frontmatter:

```yaml
---
title: "Understanding DNSSEC"
date: "2026-03-14"
tags: ["dns", "networking", "security"]
excerpt: "One sentence, 110-160 characters, used for cards and search results."
type: blog
category: Networking
---

# Understanding DNSSEC

Body in MDX — tables, callouts, tabs and interactive widgets all work.
```

Lab writeups add `platform` and `difficulty`. Dates drive ordering everywhere, so they need to be real.

### Images

Images go in `public/images/content/<article-slug>/`, and are referenced with an absolute path and real alt text:

```mdx
![The local hosts file open in a text editor, with a name pointed at an IP by hand](/images/content/dns101/hosts_file.png)
```

Every image lives in the folder of the article that uses it. If one is genuinely shared between articles, it goes in `public/images/content/shared/`. Nothing sits loose at the root of `public/`. Alt text describes what the image shows — it's what gets the image into Google and Bing image search, so filenames and "screenshot" aren't good enough.

### A note on the MDX pipeline

MDX is compiled at build time, never evaluated in the browser. This is deliberate: the production CSP doesn't allow `unsafe-eval`, and Cloudflare's Workers runtime bans `new Function` outright. Compiling to ESM at build time is what keeps the strict CSP and the edge runtime both working.

---

## Structure

```
src/
├── app/                  # App Router routes
│   ├── braindump/        # archive, paginated paths, [slug] articles
│   ├── tools/            # 14 browser tools
│   ├── map/              # knowledge map
│   ├── og/               # per-route social cards
│   └── sitemap.ts        # sitemap, including article cover images
├── components/           # UI, MDX overrides, structured data
├── lib/                  # content registry, design tokens, shared config
├── generated/            # build output — compiled MDX (gitignored)
├── data/tools.json       # single source of truth for tools + their pages
└── proxy.ts              # security headers and CSP
content/                  # 187 articles
scripts/                  # content registry and MDX compiler
```

---

## Notes on the build

- **Strict CSP, no `unsafe-eval`.** Security headers are set in `src/proxy.ts` and verified against the built output.
- **The AI endpoint is quota-aware.** Exact-title matches return a pointer with no model call at all, responses are capped, and the expensive path is edge-cached and rate-limited per client and globally. Requests are checked for same-origin before anything else runs.
- **No accounts, no tracking.** Article progress lives in `localStorage` and only ever travels as a count, so the assistant can personalise a reply without the site storing anything about you.
- **Stateless.** Everything is prerendered; there's no database to fall over.

---

## About me

I'm Suhesh Kasti — a security engineer in Nepal. I've spent 2.5 years running F5 BIG-IP ASM/WAF in production, was a Security Research Analyst at SecurityPal, and earlier did tech support. Around 3+ years in IT overall.

Right now I'm working through the **HTB CPTS** certification and learning mobile pentesting on the side. This site is where I write down what I learn — if a note here helped you, that's the whole point of publishing it.

- Website: [suhesh.com.np](https://suhesh.com.np)
- GitHub: [@Suhesh-Kasti](https://github.com/Suhesh-Kasti)
- LinkedIn: [suheshkasti](https://linkedin.com/in/suheshkasti)
- X: [@Kasti_Suhesh](https://x.com/Kasti_Suhesh)
- Telegram: [@suheshkasti](https://t.me/suheshkasti)
- Email: kastisuhesh1@gmail.com

---

## License

MIT — the code is here to be read, borrowed and improved. The writing and images are mine; please link back rather than reposting.
