"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { contrastText, resolveAccent, tint, useCopy } from "@/lib/mdx-ui";
import { TYPOGRAPHY } from "@/lib/design-tokens";

export interface CommandOption {
  flag: string;
  label: string;
  value?: string;
  placeholder?: string;
  on?: boolean;
}

interface CommandBuilderProps {
  title?: string;
  command: string;
  target?: string;
  targetLabel?: string;
  options?: CommandOption[];
  suffix?: string;
  color?: string;
}

function initialValues(options: CommandOption[]) {
  const values: Record<string, string> = {};
  for (const option of options) if (option.on && option.value) values[option.flag] = option.value;
  return values;
}

export default function CommandBuilder({
  title = "Command builder",
  command,
  target = "",
  targetLabel = "target",
  options = [],
  suffix = "",
  color = "#00dd44",
}: CommandBuilderProps) {
  const accent = resolveAccent(color);
  const onAccent = contrastText(accent);
  const { copied, copy } = useCopy();
  const [targetValue, setTargetValue] = useState(target);
  const [active, setActive] = useState<Set<string>>(
    () => new Set(options.filter((o) => o.on).map((o) => o.flag))
  );
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(options));

  const takesValue = (option: CommandOption) => option.value !== undefined || option.placeholder !== undefined;

  const built = useMemo(() => {
    const parts = [command];
    for (const option of options) {
      if (!active.has(option.flag)) continue;
      parts.push(option.flag);
      const value = (values[option.flag] ?? option.value ?? "").trim();
      if (takesValue(option) && value) parts.push(value);
    }
    if (targetValue.trim()) parts.push(targetValue.trim());
    if (suffix.trim()) parts.push(suffix.trim());
    return parts.join(" ");
  }, [command, options, active, values, targetValue, suffix]);

  const toggle = (option: CommandOption) => {
    const isOn = active.has(option.flag);
    const next = new Set(active);
    if (isOn) next.delete(option.flag);
    else next.add(option.flag);
    setActive(next);
    if (!isOn && takesValue(option) && values[option.flag] === undefined) {
      setValues((prev) => ({ ...prev, [option.flag]: option.value ?? "" }));
    }
  };

  const reset = () => {
    setTargetValue(target);
    setActive(new Set(options.filter((o) => o.on).map((o) => o.flag)));
    setValues(initialValues(options));
  };

  const chipClass =
    "inline-flex cursor-pointer items-center gap-1.5 border-2 px-2.5 py-1.5 font-mono text-2xs uppercase transition-colors";

  return (
    <div
      className="not-prose my-8 border-2 border-fg"
      style={{ boxShadow: `6px 6px 0px ${accent}`, backgroundColor: "var(--surf)" }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-fg px-4 py-2.5" style={{ backgroundColor: accent, color: onAccent }}>
        <span
          className="min-w-0 flex-1 truncate font-mono text-2xs font-bold uppercase"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          {title}
        </span>
        <button
          type="button"
          onClick={reset}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 font-mono text-2xs uppercase transition-opacity hover:opacity-70"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" aria-hidden />
          Reset
        </button>
      </div>

      {target !== undefined && (
        <div className="flex items-center gap-3 border-b-2 border-fg px-4 py-3">
          <label
            className="shrink-0 font-mono text-2xs uppercase text-fg-muted"
            style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
          >
            {targetLabel}
          </label>
          <input
            value={targetValue}
            onChange={(event) => setTargetValue(event.target.value)}
            spellCheck={false}
            className="min-w-0 flex-1 border-2 border-fg bg-surface px-2 py-1 font-mono text-sm text-fg focus:outline-none"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          />
        </div>
      )}

      {options.length > 0 && (
        <div className="flex flex-wrap items-start gap-2 border-b-2 border-fg px-4 py-3">
          {options.map((option) => {
            const isOn = active.has(option.flag);
            return (
              <div key={option.flag} className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => toggle(option)}
                  aria-pressed={isOn}
                  className={chipClass}
                  style={{
                    fontFamily: TYPOGRAPHY.fontMono,
                    borderColor: isOn ? accent : "var(--fg-muted)",
                    backgroundColor: isOn ? tint(accent, "22") : "transparent",
                    color: isOn ? "var(--fg)" : "var(--fg-muted)",
                  }}
                >
                  <span className="font-bold" style={{ color: isOn ? accent : "inherit" }}>
                    {option.flag}
                  </span>
                  {option.label}
                </button>
                {isOn && takesValue(option) && (
                  <input
                    value={values[option.flag] ?? ""}
                    onChange={(event) => setValues((prev) => ({ ...prev, [option.flag]: event.target.value }))}
                    placeholder={option.placeholder ?? option.value ?? ""}
                    spellCheck={false}
                    aria-label={option.label}
                    className="w-32 border border-fg-muted/40 bg-surface px-2 py-1 font-mono text-2xs text-fg focus:outline-none focus:border-fg"
                    style={{ fontFamily: TYPOGRAPHY.fontMono }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ backgroundColor: tint(accent, "0d") }}>
        <span className="shrink-0 font-mono text-2xs font-bold" style={{ color: accent, fontFamily: TYPOGRAPHY.fontMono }}>
          $
        </span>
        <code
          className="min-w-0 flex-1 break-all font-mono text-sm text-fg"
          style={{ fontFamily: TYPOGRAPHY.fontMono }}
        >
          {built}
        </code>
        <button
          type="button"
          onClick={() => copy(built)}
          aria-label={copied ? "Copied" : "Copy command"}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-2 border-fg px-2 py-1 font-mono text-2xs uppercase transition-colors hover:bg-fg hover:text-surface"
          style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" aria-hidden />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
