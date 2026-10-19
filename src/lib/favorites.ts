/**
 * Favorites stored in localStorage. Only stable creature ids are persisted, so
 * a renamed/redescribed creature still resolves against the current catalog.
 */

const STORAGE_KEY = "random-fantasy-creature:favorites";
const SCHEMA_VERSION = 1;

interface FavoritesStore {
  version: number;
  ids: string[];
}

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<FavoritesStore>;
    if (parsed?.version === SCHEMA_VERSION && Array.isArray(parsed.ids)) {
      return parsed.ids.filter((x): x is string => typeof x === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  return parse(window.localStorage.getItem(STORAGE_KEY));
}

export function writeFavorites(ids: string[]): void {
  if (typeof window === "undefined") return;
  const store: FavoritesStore = { version: SCHEMA_VERSION, ids };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** Pure toggle: returns a new list with the id added or removed. */
export function toggleInList(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

// Tiny subscription store so every consumer of `useFavorites` stays in sync
// (e.g. a card on /favorites re-renders immediately after being un-favorited).
type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeFavorites(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleFavorite(id: string): void {
  writeFavorites(toggleInList(readFavorites(), id));
  emit();
}
