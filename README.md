# SCHIZO — Suhesh Kasti's Portfolio & Knowledge Vault

**[→ suhesh.com.np](https://suhesh.com.np)**

A creative space where **offensive security meets art**. Portfolio, brain dump, cheatsheets, checklists, interactive tools, and a knowledge map — all wrapped in tactile brutalist design.

---

## What's Inside

| Section | Description |
|---|---|
| **Portfolio** | 9 cybersecurity projects — AI security agents, exploitation tools, network recon, binary visualization |
| **Brain Dump** | 40+ articles: blog posts, TILs, cheatsheets, checklists — filterable by type and tag |
| **Knowledge Map** | Interactive visual tree of all content — tap to expand, click to read |
| **CyberTools** | JWT debugger, XSS payload generator, MDX preview editor |
| **AI Search** | Free-form search powered by Cloudflare Workers AI (`llama-3.1-8b-instruct`) |
| **404 Page** | Silly, quirky, and full of easter eggs — click around |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion + GSAP |
| Content | MDX (`next-mdx-remote`) |
| Hosting | Cloudflare Pages (free) |
| AI Search | Cloudflare Workers AI (free) |
| Fonts | Clash Display, Syne, Space Mono |

---

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

Build for production:

```bash
npm run build
npm run start
```

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # Root layout + SEO metadata
│   ├── about/            # /about
│   ├── braindump/        # /braindump + /braindump/[slug]
│   ├── projects/         # /projects + 9 sub-pages
│   ├── map/              # /map — interactive knowledge map
│   ├── tools/            # /tools + JWT, payloads, MDX preview
│   ├── contact/          # /contact
│   └── not-found.tsx     # 404 page
├── components/           # React components
│   ├── mdx/              # MDX component overrides (tables, code, images)
│   ├── Navbar.tsx        # Brutalist nav with fullscreen mobile overlay
│   ├── CustomCursor.tsx  # Animated cursor (desktop only)
│   ├── MindMap.tsx       # Canvas-based knowledge map
│   ├── ImageGallery.tsx  # Project image galleries
│   ├── SearchButton.tsx  # AI-powered floating search
│   └── ...               # 20+ more components
├── lib/
│   ├── braindump.ts      # MDX content pipeline
│   └── design-tokens.ts  # All config: colors, type, motion, content
content/                  # MDX content files
├── blog/                 # 11 blog posts
├── braindump/            # 3 deep-dive articles
├── til/                  # 14 today-i-learned entries
├── cheatsheets/          # 17 command references
└── checklists/           # 4 interactive checklists
functions/
└── api/search.ts         # Cloudflare Workers AI search endpoint
```

---

## Design Philosophy

**Tactile Brutalism.** Hard borders, zero border-radius, offset box shadows, kinetic typography. The site feels physical — like you could touch the buttons. No soft gradients, no rounded corners, no generic SaaS templates.

Read the design writeup: [Designing Tactile Brutalism for the Web](https://suhesh.com.np/braindump/tactile-brutalism-design)

---

## Deployment

Deployed on **Cloudflare Pages** with **Workers AI** for search. Total cost: **$0/month**.

See [DOCUMENTATION.md](./DOCUMENTATION.md) for the complete deployment guide — GitHub push → Cloudflare Pages → Workers AI → D1 → custom domain setup.

---

## Author

**Suhesh Kasti** — Application Security Engineer & Offensive Security Researcher

- GitHub: [@suheshkasti](https://github.com/suheshkasti)
- LinkedIn: [suheshkasti](https://linkedin.com/in/suheshkasti)
- Twitter: [@suheshkasti](https://twitter.com/suheshkasti)

---

## License

MIT — use the code, learn from it, build cooler stuff.
