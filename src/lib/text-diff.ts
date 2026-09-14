/**
 * Text diff engine for the Text Diff quick tool.
 *
 * Line-based rather than character-based: a character diff on two similar lines turns into a
 * wall of noise, whereas line plus word granularity is what you actually read. Optional
 * JSON canonicalisation handles the bug-bounty case where the only difference between two
 * responses is key ordering, which is not a change at all.
 *
 * Input is capped so a large paste cannot lock up the page.
 */

export type DiffKind = "same" | "add" | "del";

export interface WordSegment {
  text: string;
  changed: boolean;
}

export interface DiffLine {
  kind: DiffKind;
  text: string;
  leftNo?: number;
  rightNo?: number;
  leftWords?: WordSegment[];
  rightWords?: WordSegment[];
}

export interface DiffRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

export interface DiffOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
}

export const MAX_DIFF_LINES = 800;

const splitLines = (text: string): string[] => text.replace(/\r\n/g, "\n").split("\n");

/** The form of a line used for matching — never for display. */
function normalizeLine(line: string, options: DiffOptions): string {
  let value = line;
  if (options.ignoreWhitespace) value = value.replace(/\s+/g, " ").trim();
  if (options.ignoreCase) value = value.toLowerCase();
  return value;
}

/** Word-level LCS, used to highlight only the words that actually changed. */
function wordDiff(
  left: string,
  right: string
): { leftWords: WordSegment[]; rightWords: WordSegment[] } {
  const a = left.split(/(\s+)/).filter((part) => part !== "");
  const b = right.split(/(\s+)/).filter((part) => part !== "");
  const m: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      m[i][j] = a[i - 1] === b[j - 1] ? m[i - 1][j - 1] + 1 : Math.max(m[i - 1][j], m[i][j - 1]);
    }
  }
  const leftWords: WordSegment[] = [];
  const rightWords: WordSegment[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      leftWords.unshift({ text: a[i - 1], changed: false });
      rightWords.unshift({ text: b[j - 1], changed: false });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || m[i][j - 1] >= m[i - 1][j])) {
      rightWords.unshift({ text: b[j - 1], changed: true });
      j -= 1;
    } else {
      leftWords.unshift({ text: a[i - 1], changed: true });
      i -= 1;
    }
  }
  return { leftWords, rightWords };
}

export interface DiffResult {
  lines: DiffLine[];
  added: number;
  removed: number;
  truncated: boolean;
  jsonNormalized: boolean;
}

export function diffText(leftText: string, rightText: string, options: DiffOptions): DiffResult {
  const rawLeft = splitLines(leftText);
  const rawRight = splitLines(rightText);
  const truncated = rawLeft.length > MAX_DIFF_LINES || rawRight.length > MAX_DIFF_LINES;
  const left = rawLeft.slice(0, MAX_DIFF_LINES);
  const right = rawRight.slice(0, MAX_DIFF_LINES);
  const l = left.map((line) => normalizeLine(line, options));
  const r = right.map((line) => normalizeLine(line, options));

  const m: number[][] = Array.from({ length: l.length + 1 }, () => new Array(r.length + 1).fill(0));
  for (let i = 1; i <= l.length; i += 1) {
    for (let j = 1; j <= r.length; j += 1) {
      m[i][j] = l[i - 1] === r[j - 1] ? m[i - 1][j - 1] + 1 : Math.max(m[i - 1][j], m[i][j - 1]);
    }
  }

  const lines: DiffLine[] = [];
  let i = l.length;
  let j = r.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && l[i - 1] === r[j - 1]) {
      lines.unshift({ kind: "same", text: left[i - 1], leftNo: i, rightNo: j });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || m[i][j - 1] >= m[i - 1][j])) {
      lines.unshift({ kind: "add", text: right[j - 1], rightNo: j });
      j -= 1;
    } else {
      lines.unshift({ kind: "del", text: left[i - 1], leftNo: i });
      i -= 1;
    }
  }

  // Pair each deleted run with the added run that follows it and mark the changed words.
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].kind !== "del") continue;
    let delEnd = index;
    while (delEnd < lines.length && lines[delEnd].kind === "del") delEnd += 1;
    let addEnd = delEnd;
    while (addEnd < lines.length && lines[addEnd].kind === "add") addEnd += 1;
    const pairCount = Math.min(delEnd - index, addEnd - delEnd);
    for (let k = 0; k < pairCount; k += 1) {
      const delLine = lines[index + k];
      const addLine = lines[delEnd + k];
      const { leftWords, rightWords } = wordDiff(delLine.text, addLine.text);
      delLine.leftWords = leftWords;
      addLine.rightWords = rightWords;
    }
    index = addEnd - 1;
  }

  const added = lines.filter((line) => line.kind === "add").length;
  const removed = lines.filter((line) => line.kind === "del").length;
  return { lines, added, removed, truncated, jsonNormalized: false };
}

/** Groups the flat line list into side-by-side rows: deleted and added lines sit next to each other. */
export function toSplitRows(lines: DiffLine[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let index = 0;
  while (index < lines.length) {
    if (lines[index].kind === "same") {
      rows.push({ left: lines[index], right: lines[index] });
      index += 1;
      continue;
    }
    let delEnd = index;
    while (delEnd < lines.length && lines[delEnd].kind === "del") delEnd += 1;
    let addEnd = delEnd;
    while (addEnd < lines.length && lines[addEnd].kind === "add") addEnd += 1;
    const pairs = Math.max(delEnd - index, addEnd - delEnd);
    for (let k = 0; k < pairs; k += 1) {
      rows.push({ left: lines[index + k] ?? null, right: lines[delEnd + k] ?? null });
    }
    index = addEnd;
  }
  return rows;
}

/** Recursively sorts object keys so that key order is not reported as a change. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    Object.keys(source)
      .sort()
      .forEach((key) => {
        sorted[key] = sortKeys(source[key]);
      });
    return sorted;
  }
  return value;
}

/** Pretty JSON with keys in a stable order, or null when the text is not JSON. */
export function canonicalJson(text: string): string | null {
  if (!text.trim()) return null;
  try {
    return JSON.stringify(sortKeys(JSON.parse(text)), null, 2);
  } catch {
    return null;
  }
}

export function visibleLines(lines: DiffLine[], changedOnly: boolean): DiffLine[] {
  return changedOnly ? lines.filter((line) => line.kind !== "same") : lines;
}

/** Unified-format text for copying or exporting. */
export function toUnifiedText(lines: DiffLine[], changedOnly: boolean): string {
  return visibleLines(lines, changedOnly)
    .map((line) => `${line.kind === "add" ? "+" : line.kind === "del" ? "-" : " "}${line.text}`)
    .join("\n");
}
