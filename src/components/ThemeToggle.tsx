"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { MOTION, COLORS } from "@/lib/design-tokens";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative w-16 h-9 border-2 border-fg bg-surface overflow-hidden cursor-pointer group"
      aria-label={isDark ? "Explode into light" : "Collapse into darkness"}
      data-cursor-label={isDark ? "SUNRISE" : "ECLIPSE"}
      style={{ transition: "border-color 0.5s ease" }}
    >
      {/* Background atmosphere */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: isDark
            ? "linear-gradient(180deg, #1a0a2e 0%, #0a0a0a 100%)"
            : "linear-gradient(180deg, #87CEEB 0%, #fafaf5 100%)",
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Stars (visible in dark mode) */}
      {[0.2, 0.5, 0.35, 0.7, 0.15, 0.6].map((opacity, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-brutal-white"
          style={{
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 3) * 20}%`,
          }}
          animate={{
            opacity: isDark ? opacity : 0,
            scale: isDark ? [1, 1.3, 1] : 0,
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: {
              repeat: Infinity,
              duration: 1.5 + i * 0.3,
              delay: i * 0.2,
            },
          }}
        />
      ))}

      {/* The celestial body */}
      <motion.div
        className="absolute w-5 h-5"
        animate={{
          left: isDark ? "calc(100% - 26px)" : "4px",
          top: "50%",
          y: "-50%",
          borderRadius: isDark ? "0%" : "0%",
          backgroundColor: isDark ? COLORS.white : COLORS.yellow,
          boxShadow: isDark
            ? "0 0 4px 2px rgba(255,255,255,0.3)"
            : "0 0 8px 3px rgba(255,221,0,0.6)",
          border: "2px solid var(--color-fg)",
        }}
        transition={MOTION.bouncy}
      />

      {/* Sun rays (light mode) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <motion.div
            key={angle}
            className="absolute top-1/2 left-4 origin-center h-px bg-brutal-yellow/50"
            style={{
              width: "6px",
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(12px)`,
            }}
            animate={{
              opacity: isDark ? 0 : [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1,
              delay: angle / 360,
              repeat: Infinity,
            }}
          />
        ))}
      </motion.div>
      {/* Icon overlay on the slider orb */}
      <motion.div
        className="absolute w-5 h-5 flex items-center justify-center pointer-events-none"
        animate={{
          left: isDark ? "calc(100% - 26px)" : "4px",
          top: "50%",
          y: "-50%",
        }}
        transition={MOTION.bouncy}
      >
        <FontAwesomeIcon
          icon={isDark ? faMoon : faSun}
          className="text-[10px]"
          style={{ color: isDark ? "#ffdd00" : "#000" }}
          bounce={isDark}
        />
      </motion.div>
    </button>
  );
}
