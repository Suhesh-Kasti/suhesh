"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State that survives a reload by mirroring itself into localStorage.
 * The stored value is read after mount so server and first client render match.
 */
export function useLocalState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const ready = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {}
    ready.current = true;
  }, [key]);

  useEffect(() => {
    if (!ready.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    setValue(fallback);
  }, [key, fallback]);

  return [value, setValue, reset] as const;
}
