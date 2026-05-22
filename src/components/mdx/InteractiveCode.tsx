"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, COLORS, MOTION } from "@/lib/design-tokens";

interface InteractiveCodeProps {
  defaultLanguage?: string;
  defaultValue?: string;
  children?: string;
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  python: "py",
  rust: "rs",
  typescript: "ts",
  javascript: "js",
  go: "go",
  c: "c",
  shell: "sh",
  bash: "sh",
  html: "html",
  css: "css",
  json: "json",
  yaml: "yaml",
  sql: "sql",
};

export default function InteractiveCode({
  defaultLanguage = "typescript",
  defaultValue,
  children,
}: InteractiveCodeProps) {
  const initialCode = (defaultValue ?? children ?? "").trim();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [language, setLanguage] = useState(defaultLanguage);
  const [isRunning, setIsRunning] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ext = LANGUAGE_EXTENSIONS[language] ?? language;

  useEffect(() => {
    const lines = code.split("\n");
    setLineNumbers(lines.map((_, i) => String(i + 1)));
  }, [code]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setOutput(null);

    // Simulate execution with a typewriter effect
    const demoOutputs: Record<string, string> = {
      python: "> Running python3 script.py...\n> Exit code: 0\n> Output:\n[!] VULNERABLE: Token verified with HS256 + public key\n> Execution time: 12ms",
      rust: "> Compiling...\n> Finished dev [unoptimized] in 0.8s\n> Running...\n> Coverage: 847 unique PCs hit\n> Mutations tried: 12482\n> Crashes found: 3\n> Exit code: 0",
      typescript: "> tsc --noEmit\n> No type errors found\n> Executing with tsx...\n> Build successful ✓\n> Tests: 42 passed, 0 failed",
      javascript: "> node script.js\n> Processing...\n> Done in 234ms\n> Exit code: 0",
    };

    const out = demoOutputs[language] ?? `> Executing ${ext} script...\n> Done.\n> Exit code: 0`;

    let display = "";
    let i = 0;
    const interval = setInterval(() => {
      display += out[i];
      setOutput(display);
      i++;
      if (i >= out.length) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 10);
  }, [code, language, ext]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setOutput(null);
  }, [initialCode]);

  return (
    <div className="my-8 border-2 border-fg shadow-brutal bg-surface not-prose">
      {/* Terminal header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-fg bg-fg text-surface">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-3 h-3 border border-surface" />
            <span className="w-3 h-3 border border-surface" />
            <span className="w-3 h-3 border border-surface" />
          </span>
          <span
            className="font-mono text-2xs uppercase tracking-label ml-2"
            style={{
              fontFamily: TYPOGRAPHY.fontMono,
              letterSpacing: TYPOGRAPHY.tracking.label,
            }}
          >
            {ext} terminal
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-surface text-fg border border-fg font-mono text-2xs px-2 py-1 cursor-pointer focus:outline-none focus:border-brutal-pink"
            style={{ fontFamily: TYPOGRAPHY.fontMono }}
          >
            {Object.keys(LANGUAGE_EXTENSIONS).map((lang) => (
              <option key={lang} value={lang}>
                .{LANGUAGE_EXTENSIONS[lang]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Code editor */}
      <div className="flex">
        <div
          className="select-none border-r-2 border-fg px-3 py-4 text-right font-mono text-2xs leading-[1.625rem] text-fg-muted"
          style={{ fontFamily: TYPOGRAPHY.fontMono, backgroundColor: "var(--surf-invert)", color: "var(--surf)" }}
          aria-hidden="true"
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 font-mono text-sm p-4 leading-[1.625rem] resize-none focus:outline-none"
          style={{
            fontFamily: TYPOGRAPHY.fontMono,
            backgroundColor: "var(--surf-invert)",
            color: "var(--surf)",
            minHeight: Math.max(lineNumbers.length * 26 + 32, 120),
          }}
          spellCheck={false}
          rows={lineNumbers.length || 4}
        />
      </div>

      {/* Action bar */}
      <div className="flex gap-2 p-3 border-t-2 border-fg bg-fg/5 dark:bg-fg/10">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="font-mono text-2xs uppercase px-4 py-1.5 border border-fg text-fg hover:bg-fg hover:text-surface transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            fontFamily: TYPOGRAPHY.fontMono,
            letterSpacing: TYPOGRAPHY.tracking.mono,
          }}
          data-cursor-label="Run Code"
        >
          {isRunning ? "Running..." : "> Run"}
        </button>
        <button
          onClick={handleReset}
          className="font-mono text-2xs uppercase px-4 py-1.5 border border-fg-muted text-fg-muted hover:border-fg hover:text-fg transition-all cursor-pointer"
          style={{
            fontFamily: TYPOGRAPHY.fontMono,
            letterSpacing: TYPOGRAPHY.tracking.mono,
          }}
          data-cursor-label="Reset Code"
        >
          Reset
        </button>
      </div>

      {/* Output */}
      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={MOTION.smooth}
            className="border-t-2 border-fg"
          >
            <pre
              className="font-mono text-sm p-4 leading-relaxed overflow-x-auto whitespace-pre-wrap"
              style={{
                fontFamily: TYPOGRAPHY.fontMono,
                backgroundColor: "var(--surf-invert)",
                color: "var(--surf)",
              }}
            >
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
