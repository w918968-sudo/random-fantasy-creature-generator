/**
 * Deterministic "creature of the day" selection. A local calendar date hashes
 * to a stable index, so the same day always maps to the same creature — with
 * no server and no rebuild (the site is a static export deployed manually).
 */

export function dailyIndex(date: Date, count: number): number {
  if (count <= 0) return 0;
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  // FNV-1a over the date string, then coerce to an unsigned 32-bit int so the
  // modulo is always non-negative.
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % count;
}
