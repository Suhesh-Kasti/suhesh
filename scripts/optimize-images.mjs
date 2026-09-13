#!/usr/bin/env node
/**
 * Converts referenced raster images to WebP, caps their dimensions, and rewrites
 * every reference to the new file.
 *
 * Why this exists: the deploy target (Cloudflare Workers via OpenNext) has no image
 * transformation binding, so `next/image` passes the original file straight through.
 * A PNG screenshot exported at full width therefore reaches a phone unchanged. The
 * build is the only place left where we can shrink what a visitor downloads.
 *
 * Idempotent — on a normal build every image is already WebP and within the cap, so
 * this scans and exits without touching anything. It only does work for a newly
 * added PNG/JPG, or after the caps below change.
 *
 * Safety: an original is deleted only after its .webp replacement exists, and
 * references are rewritten only for conversions that succeeded. If no image tool is
 * available the script warns and exits 0, so a deploy is never blocked — the
 * unconverted image is simply served as-is.
 */
import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync, renameSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");

// Article screenshots are shown in a column that is ~1024px wide at its widest, so
// 1400 keeps them crisp on a 1.4x display without shipping a 3000px original.
// The portrait photos in admin/ are rendered as a small card and are the mobile LCP
// element, so they cap lower and compress harder.
const CAP_DEFAULT = 1400;
const CAP_ADMIN = 560;
const QUALITY = 85;
const QUALITY_ADMIN = 74;

const SCAN_DIRS = ["content", "src"];
const SCAN_EXTS = new Set([".mdx", ".md", ".ts", ".tsx", ".js", ".mjs", ".json"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".open-next", ".git", "generated"]);
const REF_RE = /\/(?:images\/[A-Za-z0-9_./@%()+-]+|logo-(?:white|dark))\.(?:png|jpe?g|webp|avif|gif)/gi;

function loadSharp() {
  const tries = [join(ROOT, "package.json"), join(ROOT, "node_modules", "next", "package.json")];
  for (const from of tries) {
    try {
      return createRequire(from)("sharp");
    } catch {
      /* try the next resolution root */
    }
  }
  return null;
}

const sharp = loadSharp();

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (SCAN_EXTS.has(extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

/** Every image referenced by content or source, keyed by its public-relative path. */
function collectReferences() {
  const refs = new Map();
  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      // Example paths inside code fences are not assets, so they are not scanned.
      const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
      for (const match of text.matchAll(REF_RE)) {
        const encoded = match[0];
        const decoded = decodeURIComponent(encoded);
        if (!refs.has(decoded)) refs.set(decoded, new Set());
        refs.get(decoded).add(encoded);
      }
    }
  }
  return refs;
}

function settingsFor(publicPath) {
  if (publicPath.startsWith("/images/admin/")) return { cap: CAP_ADMIN, quality: QUALITY_ADMIN };
  // Certificate images are shown as ~145px thumbnails; only the zoom needs more.
  if (publicPath.startsWith("/images/certificates/")) return { cap: 500, quality: 82 };
  // Nav logos render at 65x40, so 160px covers a retina display.
  if (/^\/logo-/.test(publicPath)) return { cap: 160, quality: 88 };
  return { cap: CAP_DEFAULT, quality: QUALITY };
}

async function convert(sharp, sourcePath, targetPath, cap, quality) {
  const tmp = `${targetPath}.tmp-${process.pid}`;
  const image = sharp(sourcePath, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const pipeline =
    meta.width && meta.width > cap ? image.resize({ width: cap, withoutEnlargement: true }) : image;
  await pipeline.webp({ quality, effort: 5, smartSubsample: true }).toFile(tmp);
  renameSync(tmp, targetPath);
}

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

/**
 * Writes the intrinsic size of every referenced image, keyed by the path the content
 * actually ends up referencing. BrutalImg reads this to emit width/height attributes,
 * which is what lets the browser reserve the right box before the file arrives.
 *
 * The file is committed, so a build never depends on this script having run. If sharp
 * is unavailable and the manifest is missing, an empty object is written so the
 * import in BrutalImg still resolves.
 */
async function writeManifest(refs, rewrites) {
  const target = join(ROOT, "src", "data", "image-manifest.json");
  if (!sharp) {
    if (!existsSync(target)) writeFileSync(target, "{}");
    return;
  }
  const renamed = new Map(
    rewrites.map(({ decoded }) => [decoded, decoded.replace(/\.(png|jpe?g)$/i, ".webp")])
  );
  const manifest = {};
  for (const decoded of refs.keys()) {
    const finalRef = renamed.get(decoded) ?? decoded;
    const file = join(PUBLIC_DIR, finalRef);
    if (!existsSync(file)) continue;
    try {
      const { width, height } = await sharp(file, { failOn: "none" }).metadata();
      if (width && height) manifest[finalRef] = [width, height];
    } catch {
      /* unreadable image, leave it without dimensions */
    }
  }
  writeFileSync(target, JSON.stringify(manifest));
  console.log(`optimize-images: manifest lists ${Object.keys(manifest).length} image(s)`);
}

async function main() {
  const refs = collectReferences();
  if (refs.size === 0) {
    console.log("optimize-images: no image references found");
    return;
  }

  const jobs = [];
  const missing = [];
  for (const [decoded, encodedForms] of refs) {
    const sourcePath = join(PUBLIC_DIR, decoded);
    if (!existsSync(sourcePath)) {
      missing.push(decoded);
      continue;
    }
    const ext = extname(decoded).toLowerCase();
    const isWebp = ext === ".webp";
    const targetPath = isWebp ? sourcePath : `${sourcePath.slice(0, -ext.length)}.webp`;

    const { cap, quality } = settingsFor(decoded);

    // PNG and JPEG are converted to WebP. AVIF and GIF are only measured — turning an
    // AVIF into a WebP would be a downgrade, and both already belong in the manifest
    // so new images still get width/height without anyone running anything.
    if (!/\.(png|jpe?g)$/i.test(decoded)) {
      if (!sharp || !/\.webp$/i.test(decoded)) continue;
      const meta = await sharp(sourcePath, { failOn: "none" }).metadata();
      if (meta.width && meta.width > cap) {
        jobs.push({ decoded, encodedForms, sourcePath, targetPath, cap, quality, rewrite: false });
      }
      continue;
    }

    jobs.push({ decoded, encodedForms, sourcePath, targetPath, cap, quality, rewrite: true });
  }

  if (missing.length) {
    console.log(`optimize-images: ${missing.length} referenced image(s) missing on disk:`);
    for (const m of missing.slice(0, 5)) console.log(`  - ${m}`);
    if (missing.length > 5) console.log(`  ...and ${missing.length - 5} more`);
  }

  if (jobs.length === 0) {
    await writeManifest(refs, []);
    console.log(`optimize-images: ${refs.size} images already WebP and within cap`);
    return;
  }

  if (!sharp) {
    console.log(`optimize-images: sharp unavailable, leaving ${jobs.length} image(s) as-is`);
    return;
  }

  let saved = 0;
  const rewrites = [];
  for (const job of jobs) {
    const before = statSync(job.sourcePath).size;
    try {
      await convert(sharp, job.sourcePath, job.targetPath, job.cap, job.quality);
    } catch (error) {
      console.log(`  FAILED ${job.decoded}: ${error.message}`);
      continue;
    }
    const after = statSync(job.targetPath).size;
    saved += Math.max(0, before - after);

    if (job.rewrite) {
      // Only now is it safe to drop the original: its replacement exists.
      unlinkSync(job.sourcePath);
      rewrites.push(job);
    }
    console.log(`  ${kb(before)} -> ${kb(after)}  ${job.decoded}`);
  }

  // Rewrite the references in every content and source file. The rewrite happens on
  // the encoded form as it was written in the file, so a filename containing a space
  // keeps its %20 encoding instead of being turned back into a literal space.
  if (rewrites.length) {
    const replacement = new Map();
    for (const { encodedForms } of rewrites) {
      for (const form of encodedForms) {
        replacement.set(form, form.replace(/\.(png|jpe?g)$/i, ".webp"));
      }
    }
    let filesTouched = 0;
    for (const dir of SCAN_DIRS) {
      for (const file of walk(join(ROOT, dir))) {
        let text = readFileSync(file, "utf8");
        const original = text;
        for (const [from, to] of replacement) {
          if (text.includes(from)) text = text.split(from).join(to);
        }
        if (text !== original) {
          writeFileSync(file, text);
          filesTouched += 1;
        }
      }
    }
    console.log(`optimize-images: rewrote references in ${filesTouched} file(s)`);
  }

  console.log(
    `optimize-images: ${jobs.length} image(s) processed, ${kb(saved)} saved (${relative(ROOT, PUBLIC_DIR)}/)`
  );
}

main().catch((error) => {
  // A broken image pipeline must never take the site down with it.
  console.log(`optimize-images: skipped (${error.message})`);
  process.exit(0);
});
