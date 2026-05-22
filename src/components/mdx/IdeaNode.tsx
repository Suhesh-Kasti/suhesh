"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { TYPOGRAPHY, COLORS } from "@/lib/design-tokens";

interface IdeaNodeProps {
  children: string;
  color?: string;
}

export default function IdeaNode({ children, color = "#ffdd00" }: IdeaNodeProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [spins, setSpins] = useState(0);

  return (
    <div ref={constraintsRef} className="relative my-10 min-h-[160px] not-prose">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum
        className="absolute top-0 left-0 right-0 max-w-md p-5 cursor-grab active:cursor-grabbing font-sans text-sm leading-relaxed z-10 not-prose"
        style={{
          border: `3px solid ${color}`,
          boxShadow: `8px 8px 0px ${color}`,
          backgroundColor: "var(--surf)",
          fontFamily: TYPOGRAPHY.fontSans,
          color: "var(--fg)",
        }}
        animate={{
          x: offset.x,
          y: offset.y,
          rotate: 0 + spins * 2,
        }}
        onDragEnd={(_, info) => {
          setOffset((prev) => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y,
          }));
        }}
        onClick={() => setSpins((s) => s + 1)}
        data-cursor-label="Drag or click me"
      >
        {/* Colored pushpin */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 border-2"
          style={{ borderColor: color, backgroundColor: color }}
        />
        {/* Tape strip */}
        <div
          className="absolute -top-1 left-8 w-8 h-2 opacity-30"
          style={{ backgroundColor: color, transform: "rotate(-12deg)" }}
        />

        <div className="mt-2 [&_strong]:font-extrabold [&_strong]:uppercase [&_strong]:block [&_strong]:text-lg [&_strong]:mb-1 relative">
          <span
            className="absolute -left-1 top-0 font-mono text-lg font-bold"
            style={{ color: color }}
          >
            &gt;
          </span>
          <span className="pl-4 block">{children}</span>
        </div>

        {/* Decorative pin stripes on bottom */}
        <div className="mt-3 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-1"
              style={{ backgroundColor: color, opacity: 0.3 + i * 0.1, flex: 1 }}
            />
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span
            className="font-mono text-2xs uppercase tracking-label"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: `${color}80` }}
          >
            spins: {spins}
          </span>
          <span
            className="font-mono text-2xs uppercase tracking-label"
            style={{ fontFamily: TYPOGRAPHY.fontMono, color: `${color}80` }}
          >
            drag me
          </span>
        </div>
      </motion.div>
    </div>
  );
}
