import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeSlug from "rehype-slug";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CONTENT_DIRS = [
  { dir: "blog", type: "blog" },
  { dir: "til", type: "til" },
  { dir: "cheatsheets", type: "cheatsheet" },
  { dir: "checklists", type: "checklist" },
  { dir: "braindump", type: "braindump" },
  { dir: "series", type: "roadmap" },
  { dir: "labs", type: "lab" },
];

const BASE_DIR = path.join(ROOT, "content");
const GENERATED_DIR = path.join(ROOT, "src", "generated");
const MDX_DIR = path.join(GENERATED_DIR, "mdx");

function walkDir(dir) {
  const fullPath = path.join(BASE_DIR, dir);
  if (!fs.existsSync(fullPath)) return [];
  const results = [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".") && !entry.name.startsWith("_")) {
        results.push(...walkDir(path.join(dir, entry.name)));
      }
    } else if (
      (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) &&
      !entry.name.startsWith("_")
    ) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string") return value.split("T")[0];
  return "";
}

/**
 * Collects the h2/h3 headings from the compiled tree. Running this after rehype-slug means
 * the TOC gets exactly the headings that end up in the HTML, with their real anchor ids —
 * no phantom entries from code fences, no missed headings nested in components.
 */
function collectHeadings(tree) {
  const headings = [];
  const textOf = (node) => {
    if (node.type === "text") return node.value;
    return (node.children ?? []).map(textOf).join("");
  };
  const walk = (node) => {
    if (node && node.type === "element") {
      const level = /^h([23])$/.exec(node.tagName ?? "");
      if (level && node.properties?.id) {
        headings.push({
          level: Number(level[1]),
          id: String(node.properties.id),
          text: textOf(node).replace(/\s+/g, " ").trim(),
        });
      }
    }
    for (const child of node?.children ?? []) walk(child);
  };
  walk(tree);
  return headings;
}

function headingCollector() {
  return (tree) => {
    capturedHeadings = collectHeadings(tree);
  };
}

let capturedHeadings = [];

function safeName(slug, index) {
  const cleaned = slug
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${String(index).padStart(3, "0")}-${cleaned || "post"}.mjs`;
}

const allEntries = [];
const headingsMap = {};
const rawContentMap = {};
const generatedModules = [];
let compileFailures = 0;

fs.rmSync(MDX_DIR, { recursive: true, force: true });
fs.mkdirSync(MDX_DIR, { recursive: true });

for (const { dir, type } of CONTENT_DIRS) {
  const files = walkDir(dir);
  for (const file of files) {
    const filePath = path.join(BASE_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const relPath = path.relative(dir, file);
    const slug = relPath.replace(/\.(mdx|md)$/, "").replace(/\\/g, "/");

    const tags = Array.isArray(data.tags) ? data.tags : [];

    rawContentMap[slug] = content;

    // Compile to a plain ESM module at build time. No eval and no runtime MDX
    // compiler: the output is bundled like any other module, which keeps it
    // working on runtimes (Cloudflare Workers) that forbid dynamic code evaluation.
    const fileName = safeName(slug, generatedModules.length);
    capturedHeadings = [];
    try {
      const compiled = await compile(
        { value: content, path: filePath },
        {
          outputFormat: "program",
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeUnwrapImages, rehypeSlug, headingCollector],
        }
      );
      const source = String(compiled);
      if (!source.includes("export default")) {
        throw new Error("compiled output has no default export");
      }
      fs.writeFileSync(path.join(MDX_DIR, fileName), source);
      generatedModules.push({ slug, fileName });
      headingsMap[slug] = capturedHeadings;
    } catch (err) {
      compileFailures += 1;
      console.error(`Failed to compile ${slug}: ${err.message}`);
    }

    // Screenshots referenced from the body, cover first and deduped. The sitemap lists
    // these so article images are eligible for image search, not just the page.
    const bodyImages = Array.from(
      content.matchAll(/(?:!\[[^\]]*\]\(|src=")(\/images\/[^)"\s]+)/g),
      (match) => decodeURIComponent(match[1])
    );
    const images = Array.from(new Set([data.image, ...bodyImages].filter(Boolean)));

    allEntries.push({
      slug,
      title: data.title ?? slug.replace(/-/g, " "),
      date: formatDate(data.date),
      tags,
      excerpt: data.description ?? data.excerpt ?? "",
      type,
      category: data.category ?? data.categories?.[0] ?? "",
      image: data.image ?? "",
      images,
      steps: Array.isArray(data.steps) ? data.steps : [],
      platform: data.platform ?? "",
      difficulty: data.difficulty ?? "",
    });
  }
}

if (compileFailures > 0) {
  console.error(`\n${compileFailures} article(s) failed to compile.`);
  process.exit(1);
}

allEntries.sort((a, b) => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  if (isNaN(dateA) || isNaN(dateB)) return 0;
  return dateB - dateA;
});

// ── Generated MDX module registry ──
const barrel = [
  "// Auto-generated by scripts/generate-content-registry.mjs",
  "// Do not edit manually.",
  "",
  ...generatedModules.map((m, i) => `import MDX_${i} from "./mdx/${m.fileName}";`),
  "",
  "export const MDX_CONTENT = {",
  ...generatedModules.map((m, i) => `  ${JSON.stringify(m.slug)}: MDX_${i},`),
  "};",
  "",
].join("\n");

const declarations = `// Auto-generated by scripts/generate-content-registry.mjs
// Do not edit manually.

import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";

export type MdxComponent = ComponentType<{ components?: MDXComponents }>;

export declare const MDX_CONTENT: Record<string, MdxComponent>;
`;

fs.writeFileSync(path.join(GENERATED_DIR, "mdx-registry.mjs"), barrel);
fs.writeFileSync(path.join(GENERATED_DIR, "mdx-registry.d.mts"), declarations);

// ── Metadata registry ──
const metadataPath = path.join(ROOT, "src", "lib", "content-registry.ts");
fs.writeFileSync(metadataPath, `// Auto-generated by scripts/generate-content-registry.mjs
// Do not edit manually.

export interface RegistryEntry {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  type: string;
  category: string;
  image: string;
  images: string[];
  steps?: { title: string; slug: string; description: string }[];
  platform?: string;
  difficulty?: string;
}

export interface TocHeading {
  text: string;
  level: number;
  id: string;
}

export const CONTENT_ENTRIES: RegistryEntry[] = ${JSON.stringify(allEntries)};

export const HEADINGS_MAP: Record<string, TocHeading[]> = ${JSON.stringify(headingsMap)};
`);

console.log(`Content registry written (${allEntries.length} posts, ${generatedModules.length} MDX modules)`);

// Write search index for API route — compact format
const searchEntries = allEntries.map((e) => ({
  s: e.slug,
  t: e.title,
  x: (e.excerpt || "").slice(0, 200),
  g: e.tags.slice(0, 6),
  y: e.type,
  c: e.category,
}));
const searchPath = path.join(ROOT, "src", "app", "api", "search", "search-index.json");
fs.writeFileSync(searchPath, JSON.stringify(searchEntries));
console.log(`Search index written (${searchEntries.length} entries, ${JSON.stringify(searchEntries).length} bytes)`);

// ── AI + feed artifacts ──
// Written as static files instead of rendered routes: the Cloudflare worker re-renders every
// route on request, so anything produced here costs nothing at runtime and never touches fs.
const PUBLIC_DIR = path.join(ROOT, "public");
const SITE = "https://suhesh.com.np";

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "tools.json"), "utf-8")).filter(
  (tool) => !tool.noindex
);

const SITE_SUMMARY =
  "Application security engineer and offensive security researcher. Long-form, practical writing on web exploitation, exploit development, malware analysis and CTF — plus free browser-based security tools that run entirely in the browser.";

const llms = [
  "# SCHIZO — Suhesh Kasti",
  "",
  `> ${SITE_SUMMARY}`,
  "",
  "Everything here is free to read, quote and cite. Prefer linking to the canonical URL of each page.",
  "",
  "## Core pages",
  "",
  `- [Home](${SITE}): portfolio, selected projects and latest writing`,
  `- [About](${SITE}/about): background, experience and certifications`,
  `- [Projects](${SITE}/projects): security engineering projects`,
  `- [Tools](${SITE}/tools): free browser-based security utilities`,
  `- [Contact](${SITE}/contact): how to get in touch`,
  `- [Full text](${SITE}/llms-full.txt): every article in one plain-text file`,
  "",
  "## Tools",
  "",
  ...tools.map((tool) => `- [${tool.name}](${SITE}/tools/${tool.slug}): ${tool.description}`),
  "",
  `## Writing (${allEntries.length} articles)`,
  "",
  ...allEntries.map(
    (entry) => `- [${entry.title}](${SITE}/braindump/${entry.slug}): ${entry.excerpt || entry.title}`
  ),
  "",
].join("\n");

fs.writeFileSync(path.join(PUBLIC_DIR, "llms.txt"), llms);

const llmsFullBlocks = allEntries.map((entry) => {
  const header = [`# ${entry.title}`, "", `URL: ${SITE}/braindump/${entry.slug}`, `Published: ${entry.date}`];
  if (entry.tags.length > 0) header.push(`Tags: ${entry.tags.join(", ")}`);
  return [...header, "", rawContentMap[entry.slug] ?? ""].join("\n");
});

const llmsFull = [
  "# SCHIZO — Suhesh Kasti (full text)",
  "",
  `> ${SITE_SUMMARY}`,
  "",
  `Complete text of all ${allEntries.length} articles. Index: ${SITE}/llms.txt`,
  "",
  llmsFullBlocks.join("\n\n---\n\n"),
  "",
].join("\n");

fs.writeFileSync(path.join(PUBLIC_DIR, "llms-full.txt"), llmsFull);

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const newestDate = allEntries
  .map((entry) => entry.date)
  .filter(Boolean)
  .sort()
  .at(-1);

const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  "<channel>",
  "<title>SCHIZO — Suhesh Kasti</title>",
  `<link>${SITE}</link>`,
  `<description>${escapeXml(SITE_SUMMARY)}</description>`,
  "<language>en</language>",
  "<copyright>Suhesh Kasti</copyright>",
  `<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />`,
  newestDate ? `<lastBuildDate>${new Date(newestDate).toUTCString()}</lastBuildDate>` : "",
  ...allEntries.flatMap((entry) => [
    "<item>",
    `<title>${escapeXml(entry.title)}</title>`,
    `<link>${SITE}/braindump/${entry.slug}</link>`,
    `<guid isPermaLink="true">${SITE}/braindump/${entry.slug}</guid>`,
    `<description>${escapeXml(entry.excerpt || entry.title)}</description>`,
    entry.date ? `<pubDate>${new Date(entry.date).toUTCString()}</pubDate>` : "",
    ...entry.tags.map((tag) => `<category>${escapeXml(tag)}</category>`),
    "</item>",
  ]),
  "</channel>",
  "</rss>",
  "",
]
  .filter(Boolean)
  .join("\n");

fs.writeFileSync(path.join(PUBLIC_DIR, "rss.xml"), rss);

console.log(
  `AI + feed artifacts written (llms.txt ${llms.length}B, llms-full.txt ${llmsFull.length}B, rss.xml ${rss.length}B, ${allEntries.length} items)`
);
