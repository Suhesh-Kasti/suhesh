"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY, MOTION } from "@/lib/design-tokens";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "Copy", }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);

  return (
    <motion.button
      onClick={handleCopy}
      className="font-mono text-2xs uppercase px-2 py-1 border border-fg-muted text-fg-muted hover:border-fg hover:text-fg hover:bg-fg hover:text-surface transition-all cursor-pointer"
      style={{
        fontFamily: TYPOGRAPHY.fontMono,
        letterSpacing: TYPOGRAPHY.tracking.label,
      }}
      whileTap={{ scale: 0.95 }}
      data-cursor-label={copied ? "Copied!" : "Copy"}
    >
      {copied ? "[COPIED]" : `[${label}]`}
    </motion.button>
  );
}
