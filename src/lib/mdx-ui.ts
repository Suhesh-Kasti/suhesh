"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const ACCENT_HEX: Record<string, string> = {
  pink: "#ff2d95",
  red: "#ff1144",
  orange: "#ff5500",
  yellow: "#ffdd00",
  green: "#00dd44",
  blue: "#0055ff",
  purple: "#8800ff",
  cyan: "#00e5ff",
  teal: "#00e5ff",
};

export function resolveAccent(color?: string): string {
  if (!color) return ACCENT_HEX.pink;
  return ACCENT_HEX[color.toLowerCase()] ?? color;
}

function toLinear(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function contrastText(hex: string): string {
  const h = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) return "#0a0a0a";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.45 ? "#0a0a0a" : "#fafaf5";
}

export function tint(hex: string, alpha: string): string {
  const h = hex.replace("#", "");
  return /^[0-9a-f]{6}$/i.test(h) ? `#${h}${alpha}` : hex;
}

export function hashText(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36);
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      return true;
    } catch {
      return false;
    }
  }
}

export function useCopy(resetMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      if (!(await writeToClipboard(text))) return;
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetMs);
    },
    [resetMs]
  );

  return { copied, copy };
}

export function seededShuffle<T>(items: T[], seedText: string): T[] {
  const hash = hashText(seedText);
  let seed = 0;
  for (let i = 0; i < hash.length; i++) seed = (seed * 31 + hash.charCodeAt(i)) >>> 0;
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
