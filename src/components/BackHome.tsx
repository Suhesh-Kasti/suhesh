"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TYPOGRAPHY, MOTION } from "@/lib/design-tokens";

export default function BackHome() {
  return (
    <motion.div
      className="fixed bottom-6 left-6 z-30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Link
        href="/"
        className="flex items-center gap-2 px-3 py-2 border-2 border-fg bg-surface text-fg font-mono text-xs uppercase hover:bg-fg hover:text-surface transition-all shadow-brutal-sm hover:shadow-brutal group"
        style={{
          fontFamily: TYPOGRAPHY.fontMono,
          letterSpacing: TYPOGRAPHY.tracking.mono,
        }}
        data-cursor-label="Home"
      >
        <motion.span
          animate={{ x: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          ←
        </motion.span>
        <span>SCHIZO</span>
      </Link>
    </motion.div>
  );
}
