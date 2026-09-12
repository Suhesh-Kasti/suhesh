"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faDownload } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";
import { useLocalState } from "@/lib/useLocalState";

const mono = { fontFamily: TYPOGRAPHY.fontMono };
const box = "border-2 border-fg bg-surface";
const inputClass = "w-full border-2 border-fg bg-surface px-3 py-2 font-mono text-sm text-fg focus:outline-none";
const buttonClass =
  "inline-flex cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface";

function CopyAction({ text, label = "Copy" }: { text: string; label?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button type="button" onClick={() => copy(text)} className={buttonClass} style={mono} data-cursor-label={label}>
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
      {copied ? "Copied" : label}
    </button>
  );
}

function DownloadAction({ text, filename }: { text: string; filename: string }) {
  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" onClick={download} className={buttonClass} style={mono} data-cursor-label="Download">
      <FontAwesomeIcon icon={faDownload} className="text-[10px]" />
      {filename}
    </button>
  );
}

/* ── CIDR / IP calculator ── */
function parseIpv4(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

function toIpv4(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

export function CidrTool() {
  const [input, setInput] = useLocalState("cidr-input", "10.10.10.42/24");

  const result = useMemo(() => {
    const [ipPart, bitsPart] = input.trim().split("/");
    const ip = parseIpv4(ipPart ?? "");
    const bits = bitsPart === undefined ? 32 : Number(bitsPart);
    if (ip === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const hosts = bits >= 31 ? 0 : 2 ** (32 - bits) - 2;
    const octets = ipPart.split(".").map(Number);
    return {
      mask: toIpv4(mask),
      wildcard: toIpv4(~mask >>> 0),
      network: toIpv4(network),
      broadcast: toIpv4(broadcast),
      first: bits >= 31 ? toIpv4(network) : toIpv4(network + 1),
      last: bits >= 31 ? toIpv4(broadcast) : toIpv4(broadcast - 1),
      hosts: hosts > 0 ? hosts.toLocaleString() : "0 (point-to-point)",
      decimal: ip,
      hex: `0x${ip.toString(16)}`,
      octal: octets.map((part) => `0${part.toString(8)}`).join("."),
      short: `${octets[0]}.${(octets[1] << 16) + (octets[2] << 8) + octets[3]}`,
      mapping: `::ffff:${toIpv4(ip)}`,
    };
  }, [input]);

  return (
    <div className="space-y-4">
      <input value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} placeholder="10.10.10.42/24" className={inputClass} style={mono} />
      {result ? (
        <>
          <div className={`${box} divide-y divide-fg-muted/15`}>
            {[
              ["network", result.network],
              ["broadcast", result.broadcast],
              ["first host", result.first],
              ["last host", result.last],
              ["netmask", result.mask],
              ["wildcard", result.wildcard],
              ["usable hosts", result.hosts],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <span className="w-32 shrink-0 font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  {label}
                </span>
                <code className="min-w-0 flex-1 font-mono text-sm text-fg" style={mono}>
                  {value}
                </code>
              </div>
            ))}
          </div>
          <div className={box}>
            <div className="border-b-2 border-fg px-3 py-1.5">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
                Filter-bypass representations
              </span>
            </div>
            <div className="divide-y divide-fg-muted/15">
              {[
                ["decimal", result.decimal],
                ["hex", result.hex],
                ["octal", result.octal],
                ["short form", result.short],
                ["ipv6 mapped", result.mapping],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center gap-2 px-3 py-2">
                  <span className="w-32 shrink-0 font-mono text-2xs uppercase text-fg-muted" style={mono}>
                    {label}
                  </span>
                  <code className="min-w-0 flex-1 break-all font-mono text-sm text-fg" style={mono}>
                    {value}
                  </code>
                  <CopyAction text={String(value)} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="font-mono text-xs" style={{ ...mono, color: COLORS.red }}>
          Enter an IPv4 address with an optional /prefix, e.g. 10.10.10.42/24
        </p>
      )}
    </div>
  );
}

/* ── Wordlist mutator ── */
const LEET: Record<string, string> = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", g: "9", b: "8" };

export function MutatorTool() {
  const [base, setBase] = useLocalState("mutator-base", "schizo");
  const [options, setOptions] = useLocalState("mutator-options", { leet: true, capitalize: true, years: true, symbols: true, digits: false });
  const [copiedAll, setCopiedAll] = useState(false);

  const words = useMemo(() => {
    const seeds = base.split(/[\n,]+/).map((word) => word.trim()).filter(Boolean);
    const out = new Set<string>();
    const years = ["2024", "2025", "2026", "2027"];
    const symbols = ["!", "@", "#", "$", "123"];
    for (const seed of seeds) {
      out.add(seed);
      if (options.capitalize) {
        out.add(seed[0]?.toUpperCase() + seed.slice(1));
        out.add(seed.toUpperCase());
      }
      if (options.leet) out.add(seed.replace(/[aeiostgb]/gi, (char) => LEET[char.toLowerCase()] ?? char));
      if (options.years) for (const year of years) out.add(seed + year);
      if (options.digits) for (let i = 0; i <= 9; i++) out.add(seed + i);
      if (options.symbols) for (const symbol of symbols) {
        out.add(seed + symbol);
        out.add(symbol + seed);
      }
    }
    return [...out];
  }, [base, options]);

  const list = words.join("\n");

  return (
    <div className="space-y-4">
      <textarea
        value={base}
        onChange={(event) => setBase(event.target.value)}
        rows={2}
        spellCheck={false}
        placeholder="one base word per line, or comma separated"
        className={inputClass}
        style={mono}
      />
      <div className="flex flex-wrap gap-2">
        {([
          ["leet", "leetspeak"],
          ["capitalize", "capitalise"],
          ["years", "append years"],
          ["digits", "append 0-9"],
          ["symbols", "append symbols"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setOptions((prev) => ({ ...prev, [key]: !prev[key] }))}
            aria-pressed={options[key]}
            className={`cursor-pointer border-2 px-3 py-1.5 font-mono text-2xs uppercase transition-colors ${options[key] ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
            style={mono}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={box}>
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
          <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
            {words.length} candidates
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(list);
              setCopiedAll(true);
              setTimeout(() => setCopiedAll(false), 1500);
            }}
            className={buttonClass}
            style={mono}
          >
            <FontAwesomeIcon icon={copiedAll ? faCheck : faCopy} className="text-[10px]" />
            {copiedAll ? "Copied" : "Copy all"}
          </button>
          <DownloadAction text={list} filename="wordlist.txt" />
        </div>
        <pre className="max-h-64 overflow-auto p-3 font-mono text-xs leading-relaxed text-fg" style={mono}>
          {list}
        </pre>
      </div>
      <p className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
        feed this into hashcat -a 0 or hydra -P
      </p>
    </div>
  );
}

/* ── Defang / refang ── */
export function DefangTool() {
  const [input, setInput] = useLocalState("defang-input", "http://malicious.tld/payload?id=1\n192.168.0.10\nadmin@evil.tld");

  const defanged = useMemo(
    () =>
      input
        .replace(/https?:\/\//gi, (match) => match.replace("t", "x").replace("T", "X"))
        .replace(/\./g, "[.]")
        .replace(/@/g, "[@]")
        .replace(/:/g, "[:]"),
    [input]
  );

  const refanged = useMemo(
    () =>
      input
        .replace(/hxxps/gi, "https")
        .replace(/hxxp/gi, "http")
        .replace(/\[\.\]/g, ".")
        .replace(/\(\.\)/g, ".")
        .replace(/\[@\]/g, "@")
        .replace(/\[:\]/g, ":"),
    [input]
  );

  const rows = [
    ["Defanged (safe to share)", defanged],
    ["Refanged (clickable)", refanged],
  ];

  return (
    <div className="space-y-4">
      <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={5} spellCheck={false} className={inputClass} style={mono} />
      {rows.map(([label, value]) => (
        <div key={label} className={box}>
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-fg px-3 py-2">
            <span className="font-mono text-2xs uppercase text-fg-muted" style={mono}>
              {label}
            </span>
            <span className="flex-1" />
            <CopyAction text={value} />
          </div>
          <pre className="overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-xs text-fg" style={mono}>
            {value}
          </pre>
        </div>
      ))}
    </div>
  );
}

/* ── Chmod calculator ── */
export function ChmodTool() {
  const [octal, setOctal] = useLocalState("chmod-octal", "755");

  const parsed = useMemo(() => {
    const digits = octal.replace(/[^0-7]/g, "").slice(0, 4);
    if (digits.length < 3) return null;
    const perms = digits.slice(-3).split("").map(Number);
    const symbolic = perms
      .map((value) => `${value & 4 ? "r" : "-"}${value & 2 ? "w" : "-"}${value & 1 ? "x" : "-"}`)
      .join("");
    const special = digits.length === 4 ? Number(digits[0]) : 0;
    const specialText = [special & 4 ? "setuid" : "", special & 2 ? "setgid" : "", special & 1 ? "sticky" : ""].filter(Boolean).join(", ");
    return { digits, symbolic, specialText };
  }, [octal]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input value={octal} onChange={(event) => setOctal(event.target.value)} spellCheck={false} className={`${inputClass} w-32`} style={mono} />
        {["644", "755", "777", "600", "4000", "1777"].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setOctal(preset)}
            className="cursor-pointer border-2 border-fg-muted/40 px-2 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
            style={mono}
          >
            {preset}
          </button>
        ))}
      </div>
      {parsed ? (
        <div className={`${box} divide-y divide-fg-muted/15`}>
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <span className="w-32 shrink-0 font-mono text-2xs uppercase text-fg-muted" style={mono}>
              symbolic
            </span>
            <code className="min-w-0 flex-1 font-mono text-lg text-fg" style={mono}>
              {parsed.symbolic}
            </code>
            <CopyAction text={`chmod ${parsed.digits}`} label="Copy cmd" />
          </div>
          <div className="flex flex-wrap items-center gap-2 px-3 py-2">
            <span className="w-32 shrink-0 font-mono text-2xs uppercase text-fg-muted" style={mono}>
              owner / group / other
            </span>
            <code className="min-w-0 flex-1 font-mono text-sm text-fg" style={mono}>
              {parsed.symbolic.slice(0, 3)} · {parsed.symbolic.slice(3, 6)} · {parsed.symbolic.slice(6, 9)}
            </code>
          </div>
          {parsed.specialText && (
            <div className="px-3 py-2 font-mono text-2xs uppercase" style={{ ...mono, color: COLORS.pink }}>
              special bits: {parsed.specialText}
            </div>
          )}
        </div>
      ) : (
        <p className="font-mono text-xs" style={{ ...mono, color: COLORS.red }}>
          Enter 3 or 4 octal digits, e.g. 755 or 4755
        </p>
      )}
    </div>
  );
}

/* ── Cron explainer ── */
const CRON_FIELDS = ["minute", "hour", "day of month", "month", "day of week"];
const CRON_RANGES: [number, number][] = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
const CRON_NAMES: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12, sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function expandCronField(field: string, min: number, max: number): number[] | null {
  const values = new Set<number>();
  const nameToNumber = (token: string) => CRON_NAMES[token.toLowerCase()] ?? Number(token);
  for (const part of field.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText ? Number(stepText) : 1;
    if (!Number.isInteger(step) || step < 1) return null;
    let start: number;
    let end: number;
    if (range === "*") {
      start = min;
      end = max;
    } else if (range.includes("-")) {
      const [a, b] = range.split("-");
      start = nameToNumber(a);
      end = nameToNumber(b);
    } else {
      start = nameToNumber(range);
      end = start;
    }
    if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
    if (start < min || end > max || start > end) return null;
    for (let value = start; value <= end; value += step) values.add(value);
  }
  return [...values].sort((a, b) => a - b);
}

export function CronTool() {
  const [expression, setExpression] = useLocalState("cron-expression", "*/15 9-17 * * 1-5");

  const analysis = useMemo(() => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return { error: "A cron expression needs exactly 5 fields: minute hour day month weekday" };
    const values = parts.map((field, index) => expandCronField(field, CRON_RANGES[index][0], CRON_RANGES[index][1]));
    if (values.some((value) => value === null)) return { error: "One of the fields is out of range or malformed" };
    const [minutes, hours, days, months, weekdays] = values as number[][];
    const schedule = (list: number[], index: number) => list.join(", ") + ` (${CRON_FIELDS[index]})`;
    return {
      rows: [
        ["minute", parts[0], schedule(minutes, 0)],
        ["hour", parts[1], schedule(hours, 1)],
        ["day of month", parts[2], schedule(days, 2)],
        ["month", parts[3], schedule(months, 3)],
        ["day of week", parts[4], schedule(weekdays, 4)],
      ],
      note: "Cron runs in the server's timezone. 5 fields = user crontab; 6 fields adds seconds.",
    };
  }, [expression]);

  return (
    <div className="space-y-4">
      <input value={expression} onChange={(event) => setExpression(event.target.value)} spellCheck={false} className={inputClass} style={mono} />
      <div className="flex flex-wrap gap-2">
        {["*/5 * * * *", "0 3 * * *", "0 0 * * 0", "*/15 9-17 * * 1-5"].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setExpression(preset)}
            className="cursor-pointer border-2 border-fg-muted/40 px-2 py-1 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
            style={mono}
          >
            {preset}
          </button>
        ))}
      </div>
      {"error" in analysis ? (
        <p className="font-mono text-xs" style={{ ...mono, color: COLORS.red }}>
          {analysis.error}
        </p>
      ) : (
        <div className={box}>
          <div className="divide-y divide-fg-muted/15">
            {analysis.rows.map(([label, field, meaning]) => (
              <div key={label} className="flex flex-wrap items-center gap-3 px-3 py-2">
                <span className="w-28 shrink-0 font-mono text-2xs uppercase text-fg-muted" style={mono}>
                  {label}
                </span>
                <code className="w-28 shrink-0 font-mono text-sm text-fg" style={mono}>
                  {field}
                </code>
                <span className="min-w-0 flex-1 font-sans text-xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontSans }}>
                  {meaning}
                </span>
              </div>
            ))}
          </div>
          <p className="border-t-2 border-fg px-3 py-2 font-mono text-2xs uppercase text-fg-muted" style={mono}>
            {analysis.note}
          </p>
        </div>
      )}
    </div>
  );
}
