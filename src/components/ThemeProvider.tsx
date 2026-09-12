"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  isDark: false,
});

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", initial === "dark");
    setTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    const next: Theme = theme === "light" ? "dark" : "light";

    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      setTheme(next);
    };

    const startViewTransition = (document as ViewTransitionDocument).startViewTransition;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!startViewTransition || reduceMotion) {
      apply();
      return;
    }

    root.classList.add("theme-switching");
    const cleanup = () => root.classList.remove("theme-switching");

    const transition = startViewTransition.call(document, () => {
      flushSync(apply);
    });

    transition.finished.then(cleanup, cleanup);
  }, [theme]);

  // Prevent flash — render placeholder until mounted
  if (!mounted) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-brutal-white dark:bg-brutal-black"
        style={{ visibility: "hidden" }}
      >
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
