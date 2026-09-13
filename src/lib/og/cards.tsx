import type { ReactElement } from "react";

/**
 * Share cards (OpenGraph / Twitter) rendered with next/og at build time.
 *
 * Satori is not a browser: every container needs an explicit `display: flex`, there is no
 * grid, and long strings are truncated here in JS rather than with CSS ellipsis. Keep that
 * in mind before editing the layouts below.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const INK = "#0a0a0a";
const PAPER = "#fafaf5";
const MUTED = "#6b6b6b";

export const ACCENT = {
  pink: "#ff2d95",
  green: "#00dd44",
  orange: "#ff5500",
  blue: "#0055ff",
  teal: "#00e5ff",
  purple: "#8800ff",
  yellow: "#ffdd00",
  red: "#ff1144",
};

/** Matches the type colours used on the site itself, so a card reads like its article. */
const TYPE_ACCENT: Record<string, string> = {
  braindump: ACCENT.purple,
  roadmap: ACCENT.teal,
  lab: ACCENT.orange,
  cheatsheet: ACCENT.green,
  checklist: ACCENT.blue,
  til: ACCENT.yellow,
  blog: ACCENT.pink,
};

const TYPE_LABEL: Record<string, string> = {
  braindump: "MIND MAP",
  roadmap: "ROADMAP",
  lab: "LAB WALKTHROUGH",
  cheatsheet: "CHEATSHEET",
  checklist: "CHECKLIST",
  til: "TIL",
  blog: "ARTICLE",
};

/** Colours for the dedicated tools, so no two tool cards look alike. */
export const TOOL_ACCENTS = [
  ACCENT.orange,
  ACCENT.green,
  ACCENT.teal,
  ACCENT.pink,
  ACCENT.blue,
  ACCENT.purple,
  ACCENT.yellow,
  ACCENT.red,
];

export function clamp(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function typeAccent(type: string): string {
  return TYPE_ACCENT[type] ?? ACCENT.pink;
}

export function typeLabel(type: string): string {
  return TYPE_LABEL[type] ?? "ARTICLE";
}

/** Thick ink frame, an accent band and corner blocks — the brutalist identity, shared. */
function Frame({ accent, children }: { accent: string; children: ReactElement | ReactElement[] }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        position: "relative",
        padding: 56,
      }}
    >
      <div style={{ position: "absolute", top: 22, left: 22, right: 22, bottom: 22, border: `6px solid ${INK}` }} />
      <div style={{ position: "absolute", top: 22, left: 22, width: 380, height: 14, background: accent }} />
      <div style={{ position: "absolute", bottom: 22, right: 22, width: 220, height: 14, background: INK }} />
      <div style={{ position: "absolute", bottom: 22, right: 242, width: 90, height: 14, background: accent }} />
      <div style={{ position: "absolute", top: 22, right: 22, width: 62, height: 62, background: accent }} />

      <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, padding: "26px 30px 26px 30px" }}>
        {children}
      </div>
    </div>
  );
}

function BrandRow({ accent, right }: { accent: string; right: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", width: 34, height: 34, background: INK, color: PAPER, alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900 }}>
          S
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 900, letterSpacing: 2, color: INK }}>SCHIZO</div>
      </div>
      <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 2, color: accent }}>{right}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {items.map((item) => (
        <div
          key={item}
          style={{
            display: "flex",
            border: `3px solid ${INK}`,
            padding: "8px 16px",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 1,
            color: INK,
            background: PAPER,
          }}
        >
          {clamp(item, 26).toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function Footer({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "auto" }}>
      <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 1, color: MUTED }}>{left}</div>
      <div style={{ display: "flex", fontSize: 22, fontWeight: 900, letterSpacing: 1, color: INK }}>{right}</div>
    </div>
  );
}

/* ── Home ───────────────────────────────────────────────────────────────── */

export function homeCard(): ReactElement {
  return (
    <Frame accent={ACCENT.pink}>
      <BrandRow accent={ACCENT.pink} right="suhesh.com.np" />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 54 }}>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: INK }}>
          SUHESH KASTI
        </div>
        <div style={{ display: "flex", width: 300, height: 12, background: ACCENT.pink, marginTop: 18 }} />
        <div style={{ display: "flex", fontSize: 34, fontWeight: 900, letterSpacing: 3, color: INK, marginTop: 20 }}>
          APPLICATION SECURITY ENGINEER
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: MUTED, marginTop: 16, maxWidth: 920 }}>
          Writing down what I break — F5 BIG-IP, WAF and DNS, one lab at a time.
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 34 }}>
        <Chips items={["F5 BIG-IP", "WAF", "Network Security", "Linux", "Pentesting"]} />
      </div>

      <Footer left="PORTFOLIO · BRAIN DUMP · SECURITY TOOLS" right="https://suhesh.com.np" />
    </Frame>
  );
}

/* ── Article ────────────────────────────────────────────────────────────── */

export function articleCard(post: {
  title: string;
  type: string;
  category?: string;
  tags: string[];
  date: string;
  excerpt?: string;
  readingTime?: number;
}): ReactElement {
  const accent = typeAccent(post.type);
  const label = typeLabel(post.type);
  const blurb = post.excerpt ? clamp(post.excerpt, 118) : "";

  return (
    <Frame accent={accent}>
      <BrandRow accent={accent} right="suhesh.com.np" />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
        <div style={{ display: "flex", background: accent, border: `3px solid ${INK}`, padding: "8px 18px", fontSize: 22, fontWeight: 900, letterSpacing: 2, color: INK }}>
          {label}
        </div>
        {post.category ? (
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 1, color: MUTED }}>
            {clamp(post.category, 30).toUpperCase()}
          </div>
        ) : null}
        <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 1, color: MUTED }}>
          {post.date}
          {post.readingTime ? ` · ${post.readingTime} MIN READ` : ""}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: post.title.length > 70 ? 48 : post.title.length > 44 ? (blurb ? 56 : 62) : blurb ? 68 : 76,
          fontWeight: 900,
          lineHeight: 1.06,
          letterSpacing: -1,
          color: INK,
          marginTop: 26,
          maxWidth: 980,
        }}
      >
        {clamp(post.title, 108)}
      </div>

      {blurb ? (
        <div style={{ display: "flex", fontSize: 26, fontWeight: 500, lineHeight: 1.35, color: MUTED, marginTop: 20, maxWidth: 980 }}>
          {blurb}
        </div>
      ) : (
        <></>
      )}

      <div style={{ display: "flex", marginTop: blurb ? 24 : 30 }}>
        <Chips items={post.tags.slice(0, 4)} />
      </div>

      <Footer left="SCHIZO BRAIN DUMP" right="Read it: suhesh.com.np/braindump" />
    </Frame>
  );
}

/* ── Brain dump index ───────────────────────────────────────────────────── */

export function archiveCard(count: number): ReactElement {
  return (
    <Frame accent={ACCENT.purple}>
      <BrandRow accent={ACCENT.purple} right="suhesh.com.np" />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 48 }}>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: INK }}>
          BRAIN DUMP
        </div>
        <div style={{ display: "flex", width: 300, height: 12, background: ACCENT.purple, marginTop: 18 }} />
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: MUTED, marginTop: 22, maxWidth: 900 }}>
          {count} writeups — penetration testing, DNS, Linux, CTF walkthroughs and the mistakes in between.
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 34 }}>
        <Chips items={["Labs", "Cheatsheets", "Checklists", "TILs", "Roadmaps"]} />
      </div>

      <Footer left="EVERYTHING I GOT THROUGH" right="https://suhesh.com.np/braindump" />
    </Frame>
  );
}

/* ── Tools index ────────────────────────────────────────────────────────── */

export function toolsCard(names: string[]): ReactElement {
  return (
    <Frame accent={ACCENT.teal}>
      <BrandRow accent={ACCENT.teal} right="suhesh.com.np" />

      <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: INK }}>
          SECURITY TOOLS
        </div>
        <div style={{ display: "flex", width: 300, height: 12, background: ACCENT.teal, marginTop: 16 }} />
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: MUTED, marginTop: 18 }}>
          Free, and everything runs in your browser. Nothing is uploaded.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 }}>
        {names.slice(0, 12).map((name) => (
          <div key={name} style={{ display: "flex", border: `3px solid ${INK}`, padding: "6px 14px", fontSize: 20, fontWeight: 700, color: INK }}>
            {clamp(name, 26).toUpperCase()}
          </div>
        ))}
      </div>

      <Footer left="PAYLOADS · JWT · CERTIFICATES · RECON" right="https://suhesh.com.np/tools" />
    </Frame>
  );
}

/* ── Single tool ────────────────────────────────────────────────────────── */

export function toolCard(tool: {
  name: string;
  title: string;
  description: string;
  accent: string;
  eyebrow: string;
}): ReactElement {
  return (
    <Frame accent={tool.accent}>
      <BrandRow accent={tool.accent} right="free · in-browser" />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 46 }}>
        <div style={{ display: "flex", background: tool.accent, border: `3px solid ${INK}`, padding: "8px 18px", fontSize: 22, fontWeight: 900, letterSpacing: 2, color: INK }}>
          {tool.eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 1, color: MUTED }}>SECURITY TOOL</div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: tool.name.length > 26 ? 62 : 78,
          fontWeight: 900,
          lineHeight: 1.04,
          letterSpacing: -1,
          color: INK,
          marginTop: 24,
          maxWidth: 980,
        }}
      >
        {clamp(tool.name, 46)}
      </div>

      <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: MUTED, marginTop: 20, maxWidth: 940, lineHeight: 1.3 }}>
        {clamp(tool.description, 170)}
      </div>

      <Footer left={clamp(tool.title, 60).toUpperCase()} right={`suhesh.com.np/tools`} />
    </Frame>
  );
}

/* ── Generic section ────────────────────────────────────────────────────── */

export function sectionCard({
  eyebrow,
  title,
  subtitle,
  chips,
  accent,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  chips: string[];
  accent: string;
  footer: string;
}): ReactElement {
  return (
    <Frame accent={accent}>
      <BrandRow accent={accent} right="suhesh.com.np" />

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 52 }}>
        <div style={{ display: "flex", background: accent, border: `3px solid ${INK}`, padding: "8px 18px", fontSize: 22, fontWeight: 900, letterSpacing: 2, color: INK }}>
          {eyebrow}
        </div>
      </div>

      <div style={{ display: "flex", fontSize: 92, fontWeight: 900, lineHeight: 1, letterSpacing: -2, color: INK, marginTop: 24 }}>
        {clamp(title, 30).toUpperCase()}
      </div>

      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: MUTED, marginTop: 20, maxWidth: 940 }}>
        {clamp(subtitle, 150)}
      </div>

      <div style={{ display: "flex", marginTop: 30 }}>
        <Chips items={chips} />
      </div>

      <Footer left={footer} right="https://suhesh.com.np" />
    </Frame>
  );
}
