/**
 * Roadmap progress lives in the visitor's own browser, one key per series. Nothing is
 * stored server-side and there is no account, so progress is per-device by design.
 *
 * Keys are namespaced (`roadmap-progress:<slug>`) so the site can carry several roadmaps
 * at once — PortSwigger today, CPTS, OSCP or an IoT track later — without one roadmap's
 * ticks bleeding into another's count.
 */
const PREFIX = "roadmap-progress:";
const LEGACY_KEY = "roadmap-progress";
const MAX_INDEX = 9999;

/** The one roadmap that predates namespaced keys, so its ticks can be adopted. */
export const LEGACY_ADOPT_SLUG = "portswigger-beginner-roadmap";

export interface SeriesProgress {
  slug: string;
  done: number;
}

export const seriesKey = (slug: string): string => `${PREFIX}${slug}`;

/** Only plausible lab indices survive; anything else is stale or hand-edited. */
function validIndices(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (n): n is number => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= MAX_INDEX
  );
}

export function readSeries(slug: string): Set<number> {
  try {
    const raw = localStorage.getItem(seriesKey(slug));
    if (raw) return new Set(validIndices(JSON.parse(raw)));

    // Older versions kept a single unnamed key. The first roadmap to load adopts it.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const moved = new Set(validIndices(JSON.parse(legacy)));
      localStorage.setItem(seriesKey(slug), JSON.stringify([...moved]));
      localStorage.removeItem(LEGACY_KEY);
      return moved;
    }
  } catch {
    /* storage unavailable — progress simply will not persist */
  }
  return new Set();
}

export function writeSeries(slug: string, done: Set<number>): void {
  try {
    localStorage.setItem(seriesKey(slug), JSON.stringify([...done]));
  } catch {
    /* storage unavailable */
  }
}

export function clearSeries(slug: string): void {
  try {
    localStorage.removeItem(seriesKey(slug));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Every series this browser has progress in. This is what the assistant reasons about,
 * so it only ever contains roadmaps the visitor has actually started.
 */
export function readAllSeries(): SeriesProgress[] {
  // Reading it performs the migration, so the prefix scan below finds it.
  readSeries(LEGACY_ADOPT_SLUG);
  const found: SeriesProgress[] = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PREFIX)) continue;
      const raw = localStorage.getItem(key);
      const done = raw ? validIndices(JSON.parse(raw)).length : 0;
      if (done > 0) found.push({ slug: key.slice(PREFIX.length), done });
    }
  } catch {
    /* storage unavailable */
  }
  return found.slice(0, 10);
}
