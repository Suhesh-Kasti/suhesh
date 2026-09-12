"use client";

import { useMemo, useState } from "react";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import { useLocalState } from "@/lib/useLocalState";

type TokenKind = "literal" | "anchor" | "class" | "group" | "quantifier" | "alternation" | "escape" | "dot";

interface Token {
  text: string;
  kind: TokenKind;
  hint: string;
}

const KIND_COLORS: Record<TokenKind, string> = {
  literal: "#8a8a95",
  anchor: "#ffdd00",
  class: "#0055ff",
  group: "#8800ff",
  quantifier: "#00dd44",
  alternation: "#ff5500",
  escape: "#ff2d95",
  dot: "#00e5ff",
};

const KIND_LABEL: Record<TokenKind, string> = {
  literal: "Literal",
  anchor: "Anchor",
  class: "Character class",
  group: "Group",
  quantifier: "Quantifier",
  alternation: "Alternation",
  escape: "Escape",
  dot: "Wildcard",
};

const ESCAPES: Record<string, string> = {
  d: "Any digit (0-9)",
  D: "Any character that is not a digit",
  w: "Any word character (a-z, A-Z, 0-9, _)",
  W: "Any non-word character",
  s: "Any whitespace (space, tab, newline)",
  S: "Any non-whitespace character",
  b: "Word boundary",
  B: "Not a word boundary",
  n: "Newline",
  t: "Tab",
  r: "Carriage return",
  f: "Form feed",
  v: "Vertical tab",
  0: "Null character",
};

function quantifierHint(text: string): string {
  const lazy = text.endsWith("?") && text.length > 1;
  const base = lazy ? text.slice(0, -1) : text;
  let meaning = "";
  if (base === "*") meaning = "zero or more times";
  else if (base === "+") meaning = "one or more times";
  else if (base === "?") meaning = "zero or one time (optional)";
  else {
    const range = base.match(/^\{(\d+)(?:,(\d*))?\}$/);
    if (range) {
      if (!range[2]) meaning = `exactly ${range[1]} times`;
      else if (range[2] === "") meaning = `${range[1]} or more times`;
      else meaning = `between ${range[1]} and ${range[2]} times`;
    }
  }
  return `Repeats the previous token ${meaning}${lazy ? ", as few times as possible (lazy)" : ""}`;
}

function groupHint(prefix: string): string {
  if (prefix === "(?:") return "Non-capturing group — groups without saving the match";
  if (prefix === "(?=") return "Positive lookahead — must be followed by this, not consumed";
  if (prefix === "(?!") return "Negative lookahead — must NOT be followed by this";
  if (prefix === "(?<=") return "Positive lookbehind — must be preceded by this";
  if (prefix === "(?<!") return "Negative lookbehind — must NOT be preceded by this";
  if (prefix.startsWith("(?<")) return "Named capturing group — saved and accessible by name";
  return "Capturing group — saves what it matches";
}

function classHint(text: string): string {
  const negated = text.startsWith("[^");
  const body = text.slice(negated ? 2 : 1, -1);
  if (/\\d/.test(body) && /\\w/.test(body)) return "Character class — matches any digit or word character";
  if (/a-z/i.test(body)) return `${negated ? "Any character except" : "Any one of"} the listed characters or ranges`;
  return `${negated ? "Any character except" : "Any one of"} ${body}`;
}

function tokenize(pattern: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];

    if (ch === "\\") {
      const next = pattern[i + 1] ?? "";
      tokens.push({ text: pattern.slice(i, i + 2), kind: "escape", hint: ESCAPES[next] ?? `Literal "${next}"` });
      i += 2;
      continue;
    }

    if (ch === "[") {
      let j = i + 1;
      if (pattern[j] === "^") j++;
      if (pattern[j] === "]") j++;
      while (j < pattern.length && pattern[j] !== "]") {
        if (pattern[j] === "\\") j++;
        j++;
      }
      const end = Math.min(j + 1, pattern.length);
      const text = pattern.slice(i, end);
      tokens.push({ text, kind: "class", hint: classHint(text) });
      i = end;
      continue;
    }

    if (ch === "(") {
      let prefix = "(";
      if (pattern.startsWith("(?:", i)) prefix = "(?:";
      else if (pattern.startsWith("(?<=", i)) prefix = "(?<=";
      else if (pattern.startsWith("(?<!", i)) prefix = "(?<!";
      else if (pattern.startsWith("(?=", i)) prefix = "(?=";
      else if (pattern.startsWith("(?!", i)) prefix = "(?!";
      else if (pattern.startsWith("(?<", i)) prefix = "(?<";
      tokens.push({ text: prefix, kind: "group", hint: groupHint(prefix) });
      i += prefix.length;
      continue;
    }

    if (ch === ")") {
      tokens.push({ text: ch, kind: "group", hint: "End of group" });
      i++;
      continue;
    }

    if (ch === "|") {
      tokens.push({ text: ch, kind: "alternation", hint: "Alternation — match the expression on either side" });
      i++;
      continue;
    }

    if (ch === "^" || ch === "$") {
      tokens.push({ text: ch, kind: "anchor", hint: ch === "^" ? "Start of the string (or line with the m flag)" : "End of the string (or line with the m flag)" });
      i++;
      continue;
    }

    if (ch === ".") {
      tokens.push({ text: ch, kind: "dot", hint: "Any character except a newline (add the s flag to include newlines)" });
      i++;
      continue;
    }

    if (ch === "*" || ch === "+" || ch === "?") {
      let text = ch;
      if (pattern[i + 1] === "?") text += "?";
      tokens.push({ text, kind: "quantifier", hint: quantifierHint(text) });
      i += text.length;
      continue;
    }

    if (ch === "{") {
      const match = pattern.slice(i).match(/^\{(\d+)(?:,(\d*))?\}/);
      if (match) {
        tokens.push({ text: match[0], kind: "quantifier", hint: quantifierHint(match[0]) });
        i += match[0].length;
        continue;
      }
    }

    let j = i;
    while (j < pattern.length && !"\\[](){}*+?.^$|".includes(pattern[j])) j++;
    tokens.push({ text: pattern.slice(i, j), kind: "literal", hint: "Matches these characters exactly" });
    i = j > i ? j : i + 1;
  }
  return tokens;
}

interface MatchInfo {
  index: number;
  value: string;
  groups: string[];
}

interface Segment {
  text: string;
  matchIndex: number | null;
}

const MATCH_COLORS = ["#ff2d95", "#00e5ff", "#00dd44", "#ffdd00", "#ff5500", "#8800ff"];

const RECIPES = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { label: "URL", pattern: "https?://[\\w.-]+(?:/[\\w./?%&=+#-]*)?" },
  { label: "IPv4", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { label: "Hex color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b" },
  { label: "UUID", pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" },
  { label: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
  { label: "JWT", pattern: "eyJ[\\w-]+\\.[\\w-]+\\.[\\w-]+" },
  { label: "Windows path", pattern: "[A-Za-z]:\\\\(?:[^\\\\\\/]+\\\\)*[^\\\\\\/]*" },
];

export default function RegexPage() {
  const [pattern, setPattern] = useLocalState("regex-pattern", "[a-z]+\\d{2,}");
  const [test, setTest] = useLocalState("regex-test", "Try it: ab12, hello993, x7, zz0042");
  const [flags, setFlags] = useLocalState("regex-flags", "g");

  const toggleFlag = (flag: string) =>
    setFlags((current) => (current.includes(flag) ? current.replace(flag, "") : current + flag));

  const tokens = useMemo(() => tokenize(pattern), [pattern]);

  const { matches, segments, error } = useMemo(() => {
    if (!pattern) return { matches: [] as MatchInfo[], segments: [{ text: test, matchIndex: null }] as Segment[], error: null as string | null };
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
    } catch (reason) {
      return { matches: [], segments: [{ text: test, matchIndex: null }] as Segment[], error: reason instanceof Error ? reason.message : "Invalid pattern" };
    }

    const found: MatchInfo[] = [];
    const split: Segment[] = [];
    let last = 0;
    for (const match of test.matchAll(regex)) {
      const index = match.index ?? 0;
      if (index > last) split.push({ text: test.slice(last, index), matchIndex: null });
      split.push({ text: match[0], matchIndex: found.length });
      found.push({ index, value: match[0], groups: match.slice(1).map((group) => group ?? "") });
      last = index + match[0].length;
      if (match[0] === "") last++;
    }
    if (last < test.length) split.push({ text: test.slice(last), matchIndex: null });
    return { matches: found, segments: split, error: null };
  }, [pattern, flags, test]);

  const mono = { fontFamily: TYPOGRAPHY.fontMono };
  const panel = "border-2 border-fg";

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-4xl px-6 py-16 md:px-12">
          <h1 className="mb-2 font-display text-4xl font-extrabold uppercase md:text-5xl" style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}>
            Regex Lab
          </h1>
          <p className="mb-10 font-mono text-sm text-fg-muted" style={{ ...mono }}>
            Write a pattern, watch it match, and learn what every token does
          </p>

          <div className={panel}>
            <div className="flex flex-col gap-3 border-b-2 border-fg p-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg text-fg-muted" style={mono}>
                  /
                </span>
                <input
                  value={pattern}
                  onChange={(event) => setPattern(event.target.value)}
                  spellCheck={false}
                  placeholder="pattern"
                  className="min-w-0 flex-1 border-2 border-fg bg-surface px-3 py-2 font-mono text-sm text-fg focus:outline-none"
                  style={mono}
                />
                <span className="font-mono text-lg text-fg-muted" style={mono}>
                  /
                </span>
                <input
                  value={flags}
                  onChange={(event) => setFlags(event.target.value.replace(/[^gimsuy]/g, ""))}
                  spellCheck={false}
                  className="w-16 border-2 border-fg bg-surface px-2 py-2 text-center font-mono text-sm text-fg focus:outline-none"
                  style={mono}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { flag: "g", label: "global" },
                  { flag: "i", label: "case-insensitive" },
                  { flag: "m", label: "multiline" },
                  { flag: "s", label: "dotall" },
                  { flag: "u", label: "unicode" },
                  { flag: "y", label: "sticky" },
                ].map((item) => (
                  <button
                    key={item.flag}
                    type="button"
                    onClick={() => toggleFlag(item.flag)}
                    aria-pressed={flags.includes(item.flag)}
                    className={`cursor-pointer border-2 px-2 py-1 font-mono text-2xs uppercase transition-colors ${flags.includes(item.flag) ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                    style={mono}
                  >
                    {item.flag} · {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b-2 border-fg p-4">
              <span className="mb-2 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                Pattern explained
              </span>
              <div className="flex flex-wrap gap-1">
                {tokens.map((token, index) => (
                  <span
                    key={index}
                    title={token.hint}
                    className="border-2 px-1.5 py-0.5 font-mono text-sm"
                    style={{ ...mono, borderColor: KIND_COLORS[token.kind], color: KIND_COLORS[token.kind] }}
                  >
                    {token.text || " "}
                  </span>
                ))}
                {tokens.length === 0 && (
                  <span className="font-mono text-xs text-fg-muted" style={mono}>
                    type a pattern to see it broken down
                  </span>
                )}
              </div>

              {tokens.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {tokens.map((token, index) => (
                    <li key={index} className="flex flex-wrap items-baseline gap-2 text-xs">
                      <code className="font-mono font-bold" style={{ ...mono, color: KIND_COLORS[token.kind] }}>
                        {token.text}
                      </code>
                      <span className="font-mono text-2xs uppercase" style={{ ...mono, color: KIND_COLORS[token.kind] }}>
                        {KIND_LABEL[token.kind]}
                      </span>
                      <span className="font-sans text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                        {token.hint}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4">
              <span className="mb-2 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                Test string
              </span>
              <textarea
                value={test}
                onChange={(event) => setTest(event.target.value)}
                spellCheck={false}
                rows={4}
                className="w-full resize-y border-2 border-fg bg-surface p-3 font-mono text-sm text-fg focus:outline-none"
                style={mono}
              />

              <span className="mb-2 mt-4 block font-mono text-2xs uppercase text-fg-muted" style={mono}>
                Matches {error ? "" : `(${matches.length})`}
              </span>

              {error ? (
                <div className="border-2 p-3 font-mono text-xs" style={{ ...mono, borderColor: "#ff5500", color: "#ff5500" }}>
                  {error}
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-fg" style={mono}>
                    {segments.map((segment, index) =>
                      segment.matchIndex === null ? (
                        <span key={index}>{segment.text}</span>
                      ) : (
                        <mark
                          key={index}
                          className="border-b-2 bg-transparent font-bold"
                          style={{ borderColor: MATCH_COLORS[segment.matchIndex % MATCH_COLORS.length], color: MATCH_COLORS[segment.matchIndex % MATCH_COLORS.length] }}
                        >
                          {segment.text}
                        </mark>
                      )
                    )}
                  </p>

                  {matches.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {matches.map((match, index) => (
                        <div key={index} className="border-2 border-fg p-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="h-2.5 w-2.5" style={{ backgroundColor: MATCH_COLORS[index % MATCH_COLORS.length] }} />
                            <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                              match {index + 1} · index {match.index}
                            </span>
                            <code className="font-mono text-sm text-fg" style={mono}>
                              {match.value || "(empty)"}
                            </code>
                          </div>
                          {match.groups.length > 0 && (
                            <ul className="mt-1.5 space-y-0.5 pl-4">
                              {match.groups.map((group, groupIndex) => (
                                <li key={groupIndex} className="font-mono text-xs text-fg-muted" style={mono}>
                                  group {groupIndex + 1}: <span className="text-fg">{group || "(empty)"}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase text-fg-muted" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
              Ready-made patterns
            </h2>
            <div className="flex flex-wrap gap-2">
              {RECIPES.map((recipe) => (
                <button
                  key={recipe.label}
                  type="button"
                  onClick={() => setPattern(recipe.pattern)}
                  className="cursor-pointer border-2 border-fg-muted/40 px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                  style={mono}
                >
                  {recipe.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-8 ${panel}`}>
            <div className="border-b-2 border-fg bg-fg px-3 py-2">
              <span className="font-mono text-2xs uppercase text-surface" style={{ ...mono, letterSpacing: TYPOGRAPHY.tracking.label }}>
                Cheat sheet
              </span>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 p-4 sm:grid-cols-2">
              {(Object.entries(KIND_COLORS) as [TokenKind, string][]).map(([kind, color]) => (
                <div key={kind} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-mono text-2xs uppercase text-fg-muted" style={{ ...mono }}>
                    {KIND_LABEL[kind]}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-fg p-4">
              <table className="w-full border-collapse font-mono text-xs" style={mono}>
                <tbody>
                  {[
                    ["\\d", "digit", "\\w", "word char"],
                    ["\\s", "whitespace", "\\b", "word boundary"],
                    ["{3}", "exactly 3", "{2,5}", "2 to 5"],
                    ["*", "0 or more", "+", "1 or more"],
                    ["?", "optional", "|", "either side"],
                    [".", "any char", "^ $", "start / end"],
                    ["[...]", "one of", "[^...]", "none of"],
                    ["(?:)", "group", "(?=)", "lookahead"],
                  ].map((row, index) => (
                    <tr key={index}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`border-b border-fg-muted/15 py-1.5 pr-4 ${cellIndex % 2 === 0 ? "font-bold text-fg" : "text-fg-muted"}`}
                          style={mono}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
