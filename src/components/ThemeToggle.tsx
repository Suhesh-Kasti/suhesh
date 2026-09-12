"use client";

import { useTheme } from "@/components/ThemeProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

const STARS = [
  { left: "10%", top: "18%", delay: 0, duration: 1.8 },
  { left: "24%", top: "38%", delay: 0.3, duration: 2.2 },
  { left: "36%", top: "16%", delay: 0.6, duration: 2.6 },
  { left: "48%", top: "40%", delay: 0.15, duration: 2.1 },
  { left: "60%", top: "18%", delay: 0.45, duration: 2.4 },
  { left: "72%", top: "36%", delay: 0.75, duration: 1.9 },
];

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="relative w-16 h-9 border-2 border-fg bg-surface overflow-hidden cursor-pointer group"
      aria-label={isDark ? "Explode into light" : "Collapse into darkness"}
      data-cursor-label={isDark ? "SUNRISE" : "ECLIPSE"}
    >
      {/* Background atmospheres — cross-faded with opacity (compositor only) */}
      <span aria-hidden className="toggle-sky theme-fade absolute inset-0 opacity-100 dark:opacity-0" />
      <span aria-hidden className="toggle-night theme-fade absolute inset-0 opacity-0 dark:opacity-100" />

      {/* Stars (dark mode) */}
      <span aria-hidden className="theme-fade absolute inset-0 opacity-0 dark:opacity-100">
        {STARS.map((star) => (
          <span
            key={star.left}
            className="toggle-star absolute w-1 h-1 bg-[#fafaf5]"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </span>

      {/* Sun rays (light mode) */}
      <span aria-hidden className="theme-fade absolute inset-0 pointer-events-none opacity-100 dark:opacity-0">
        {RAYS.map((angle) => (
          <span
            key={angle}
            className="toggle-ray absolute top-1/2 left-4 origin-center h-px bg-brutal-yellow/50"
            style={{
              width: "6px",
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(12px)`,
              animationDelay: `${angle / 360}s`,
            }}
          />
        ))}
      </span>

      {/* Orb + icon as one element: moves via `left` so the View Transition animates
          it as a real spring slide instead of cross-fading it in place. */}
      <span
        aria-hidden
        className="theme-knob theme-slide absolute top-1/2 left-1 dark:left-9 -translate-y-1/2 w-5 h-5 flex items-center justify-center border-2 border-fg bg-[#ffdd00] dark:bg-[#fafaf5] shadow-[0_0_8px_3px_rgba(255,221,0,0.6)] dark:shadow-[0_0_4px_2px_rgba(255,255,255,0.3)]"
      >
        <FontAwesomeIcon icon={faSun} className="theme-fade text-[10px] text-black opacity-100 dark:opacity-0" />
        <FontAwesomeIcon icon={faMoon} className="theme-fade absolute text-[10px] text-[#ffdd00] opacity-0 dark:opacity-100" />
      </span>
    </button>
  );
}
