"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY, MOTION } from "@/lib/design-tokens";

function calcEntropy(pw: string): number {
  const pool: Record<string, number> = { lower: 26, upper: 26, digit: 10, symbol: 32 };
  let size = 0;
  if (/[a-z]/.test(pw)) size += pool.lower;
  if (/[A-Z]/.test(pw)) size += pool.upper;
  if (/[0-9]/.test(pw)) size += pool.digit;
  if (/[^a-zA-Z0-9]/.test(pw)) size += pool.symbol;
  return pw.length * Math.log2(size || 1);
}

function strengthLabel(bits: number): { label: string; color: string; bg: string } {
  if (bits < 28) return { label: "VERY WEAK", color: "#ff1144", bg: "#ff1144" };
  if (bits < 36) return { label: "WEAK", color: "#ff5500", bg: "#ff5500" };
  if (bits < 60) return { label: "FAIR", color: "#ffdd00", bg: "#ffdd00" };
  if (bits < 80) return { label: "STRONG", color: "#00dd44", bg: "#00dd44" };
  return { label: "VERY STRONG", color: "#0055ff", bg: "#0055ff" };
}

const COMMON_PATTERNS = [
  { pattern: /^[a-z]+$/, issue: "Only lowercase letters" },
  { pattern: /^[0-9]+$/, issue: "Only digits" },
  { pattern: /^.{0,7}$/, issue: "Too short (min 8 chars recommended)" },
  { pattern: /(.)\1{2,}/, issue: "Repeated characters found" },
  { pattern: /(123|abc|qwerty|password|admin|letmein)/i, issue: "Contains common pattern/word" },
  { pattern: /(19|20)\d{2}/, issue: "Contains a year (likely birthday)" },
];

export default function PasswordTool() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const bits = calcEntropy(password);
  const strength = strengthLabel(bits);
  const issues = COMMON_PATTERNS.filter((p) => p.pattern.test(password));

  const generate = useCallback(() => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let pw = "";
    for (let i = 0; i < 20; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pw);
  }, []);

  return (
    <div className="border-2 border-fg shadow-brutal bg-surface">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-fg bg-fg text-surface">
        <span className="font-mono text-2xs uppercase tracking-label" style={{ fontFamily: TYPOGRAPHY.fontMono, letterSpacing: TYPOGRAPHY.tracking.label }}>password analyzer</span>
        <span className="font-mono text-2xs" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{bits.toFixed(0)} bits</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or generate a password..."
            className="flex-1 bg-transparent border-2 border-fg font-mono text-sm px-3 py-2 focus:outline-none focus:border-brutal-pink transition-colors placeholder:text-fg-muted"
            style={{ color: "var(--fg)", fontFamily: TYPOGRAPHY.fontMono }}
          />
          <button onClick={() => setShowPw(!showPw)} className="font-mono text-2xs uppercase px-3 py-2 border border-fg-muted/30 text-fg-muted hover:border-fg hover:text-fg transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{showPw ? "HIDE" : "SHOW"}</button>
          <button onClick={generate} className="font-mono text-2xs uppercase px-3 py-2 border border-brutal-green text-brutal-green hover:bg-brutal-green hover:text-surface transition-all cursor-pointer" style={{ fontFamily: TYPOGRAPHY.fontMono }}>GEN</button>
        </div>

        {/* Strength meter */}
        <div className="h-4 border-2 border-fg bg-surface relative overflow-hidden">
          <motion.div className="h-full absolute left-0 top-0" animate={{ width: `${Math.min((bits / 100) * 100, 100)}%`, backgroundColor: strength.bg }} transition={MOTION.smooth} />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-2xs uppercase tracking-label font-bold" style={{ fontFamily: TYPOGRAPHY.fontMono, color: strength.color }}>{strength.label}</span>
          <span className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>{password.length} chars</span>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="space-y-1">
            {issues.map((issue, i) => (
              <div key={i} className="font-mono text-2xs text-brutal-red border border-brutal-red/30 px-2 py-1" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
                [!] {issue.issue}
              </div>
            ))}
          </div>
        )}

        {/* Breach check hint */}
        <p className="font-mono text-2xs text-fg-muted" style={{ fontFamily: TYPOGRAPHY.fontMono }}>
          This password has <span className="text-brutal-green">{bits.toFixed(0)} bits</span> of entropy.
          {bits >= 80 ? " Strong enough for production use." : " Consider making it longer and adding symbols."}
        </p>
      </div>
    </div>
  );
}
