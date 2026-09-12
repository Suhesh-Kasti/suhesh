"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import ToolHelp from "@/components/tools/ToolHelp";
import { useLocalState } from "@/lib/useLocalState";

type Values = Record<string, string>;

interface Metric {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

const CIA = [
  { value: "H", label: "High" },
  { value: "L", label: "Low" },
  { value: "N", label: "None" },
];

const METRICS: Metric[] = [
  { key: "AV", label: "Attack Vector", options: [{ value: "N", label: "Network" }, { value: "A", label: "Adjacent" }, { value: "L", label: "Local" }, { value: "P", label: "Physical" }] },
  { key: "AC", label: "Attack Complexity", options: [{ value: "L", label: "Low" }, { value: "H", label: "High" }] },
  { key: "PR", label: "Privileges Required", options: [{ value: "N", label: "None" }, { value: "L", label: "Low" }, { value: "H", label: "High" }] },
  { key: "UI", label: "User Interaction", options: [{ value: "N", label: "None" }, { value: "R", label: "Required" }] },
  { key: "S", label: "Scope", options: [{ value: "U", label: "Unchanged" }, { value: "C", label: "Changed" }] },
  { key: "C", label: "Confidentiality", options: CIA },
  { key: "I", label: "Integrity", options: CIA },
  { key: "A", label: "Availability", options: CIA },
];

const DEFAULTS: Values = { AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "H", I: "H", A: "H" };

const WEIGHTS: Record<string, Record<string, number>> = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  UI: { N: 0.85, R: 0.62 },
  PR_U: { N: 0.85, L: 0.62, H: 0.27 },
  PR_C: { N: 0.85, L: 0.68, H: 0.5 },
  CIA: { H: 0.56, L: 0.22, N: 0 },
};

function roundUp(value: number): number {
  const scaled = Math.round(value * 100000);
  if (scaled % 10000 === 0) return scaled / 100000;
  return (Math.floor(scaled / 10000) + 1) / 10;
}

function severityFor(score: number): { label: string; color: string } {
  if (score === 0) return { label: "None", color: "#777777" };
  if (score < 4) return { label: "Low", color: "#ffdd00" };
  if (score < 7) return { label: "Medium", color: "#ff8800" };
  if (score < 9) return { label: "High", color: "#ff5500" };
  return { label: "Critical", color: "#ff1144" };
}

export default function CvssPage() {
  const [values, setValues] = useLocalState<Values>("cvss-values", DEFAULTS);
  const { copied, copy } = useCopy();

  const result = useMemo(() => {
    const av = WEIGHTS.AV[values.AV];
    const ac = WEIGHTS.AC[values.AC];
    const ui = WEIGHTS.UI[values.UI];
    const pr = (values.S === "U" ? WEIGHTS.PR_U : WEIGHTS.PR_C)[values.PR];
    const confidentiality = WEIGHTS.CIA[values.C];
    const integrity = WEIGHTS.CIA[values.I];
    const availability = WEIGHTS.CIA[values.A];

    const iss = 1 - (1 - confidentiality) * (1 - integrity) * (1 - availability);
    const impact = values.S === "U" ? 6.42 * iss : 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    const exploitability = 8.22 * av * ac * pr * ui;

    let score = 0;
    if (impact > 0) {
      const raw = values.S === "U" ? impact + exploitability : 1.08 * (impact + exploitability);
      score = roundUp(Math.min(raw, 10));
    }

    const vector = `CVSS:3.1/AV:${values.AV}/AC:${values.AC}/PR:${values.PR}/UI:${values.UI}/S:${values.S}/C:${values.C}/I:${values.I}/A:${values.A}`;
    return { score, vector, ...severityFor(score) };
  }, [values]);

  return (
    <>
      <main className="min-h-screen flex-1 pt-16" style={{ backgroundColor: "var(--surf)" }}>
        <section className="mx-auto max-w-3xl px-6 py-16 md:px-12">
          <h1
            className="mb-2 font-display text-4xl font-extrabold uppercase md:text-5xl"
            style={{ fontFamily: TYPOGRAPHY.fontDisplay, color: "var(--fg)" }}
          >
            CVSS 3.1 Calculator
          </h1>
          <p className="mb-2 font-mono text-sm text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
            Score a finding for your bug bounty or pentest report
          </p>

          <ToolHelp
            intro="CVSS turns a vulnerability into a number that two people can agree on. The base metrics describe the bug itself — you choose them honestly, and the score falls out. Always ship the vector string with the finding; a bare number is not reproducible."
            steps={[
              "Work down the eight base metrics and pick the value that matches your proof of concept.",
              "Watch the score and vector update live.",
              "Copy the vector string into the report next to the finding.",
              "Re-check Scope — it is rare and it moves the score the most.",
            ]}
            terms={[
              { term: "Attack Vector (AV)", meaning: "How you reach it: Network, Adjacent, Local, Physical. Network scores highest." },
              { term: "Attack Complexity (AC)", meaning: "Low if it always works, High if you need to win a race or guess." },
              { term: "Privileges Required (PR)", meaning: "What you already need. None scores highest." },
              { term: "User Interaction (UI)", meaning: "Required when a victim has to click something." },
              { term: "Scope (S)", meaning: "Changed only when the bug escapes its security authority — a VM escape, not a normal XSS." },
              { term: "Confidentiality / Integrity / Availability", meaning: "What is affected: read, change, or knock over. Each is None, Low or High." },
              { term: "Vector string", meaning: "The CVSS:3.1/... string that encodes every choice. This is the reproducible part." },
            ]}
            examples={[
              { label: "9.8 Critical", value: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", detail: "Unauthenticated, no interaction, full compromise. The classic pre-auth RCE." },
              { label: "7.5 High", value: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N", detail: "Unauthenticated data disclosure with no integrity or availability impact." },
              { label: "5.4 Medium", value: "AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N", detail: "Stored XSS: needs a low-privileged account and a victim to view the page." },
              { label: "3.3 Low", value: "AV:L/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N", detail: "Local, low-privileged information leak." },
            ]}
            notes={[
              "Score the bug you actually demonstrated, not the most dramatic chain you imagined.",
              "Severity buckets: 0.1-3.9 Low, 4.0-6.9 Medium, 7.0-8.9 High, 9.0-10.0 Critical.",
              "Temporal and environmental metrics modify the base score — triagers often only want base.",
            ]}
          />

          <div className="border-2 border-fg" style={{ boxShadow: `6px 6px 0px ${result.color}` }}>
            <div className="flex flex-wrap items-center gap-4 border-b-2 border-fg px-5 py-4">
              <div
                className="grid h-16 w-16 shrink-0 place-items-center border-2 border-fg font-display text-2xl font-extrabold"
                style={{ fontFamily: TYPOGRAPHY.fontDisplay, backgroundColor: result.color, color: "#0a0a0a" }}
              >
                {result.score.toFixed(1)}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="font-mono text-2xs uppercase"
                  style={{ fontFamily: TYPOGRAPHY.fontMono, color: result.color, letterSpacing: "0.16em" }}
                >
                  {result.label}
                </span>
                <p className="mt-1 break-all font-mono text-xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                  {result.vector}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(result.vector)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-2 border-fg px-3 py-1.5 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
                style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.1em" }}
              >
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" aria-hidden />
                {copied ? "Copied" : "Copy vector"}
              </button>
            </div>

            <div className="divide-y-2 divide-fg/10">
              {METRICS.map((metric) => (
                <div key={metric.key} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <span
                    className="w-44 shrink-0 font-mono text-2xs uppercase text-fg-muted"
                    style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.08em" }}
                  >
                    {metric.key} · {metric.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {metric.options.map((option) => {
                      const active = values[metric.key] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setValues((prev) => ({ ...prev, [metric.key]: option.value }))}
                          aria-pressed={active}
                          className={`cursor-pointer border-2 px-3 py-1 font-mono text-2xs uppercase transition-colors ${active ? "border-fg bg-fg text-surface" : "border-fg-muted/40 text-fg-muted hover:border-fg hover:text-fg"}`}
                          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.06em" }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t-2 border-fg px-5 py-3">
              <span className="font-mono text-2xs uppercase text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                0.0 none · 0.1-3.9 low · 4.0-6.9 medium · 7.0-8.9 high · 9.0-10 critical
              </span>
              <button
                type="button"
                onClick={() => setValues(DEFAULTS)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-2 border-fg-muted px-3 py-1.5 font-mono text-2xs uppercase text-fg-muted transition-colors hover:border-fg hover:text-fg"
                style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: "0.1em" }}
              >
                <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" aria-hidden />
                Reset
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
