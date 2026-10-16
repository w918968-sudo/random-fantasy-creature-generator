import type {
  GeneratedPokemon,
  GenerationSettings,
  NatureName,
  ShinyMode,
  Species,
} from "@/lib/types";
import { NATURES } from "./natures";

export type GenerateError = "empty-pool" | "not-enough";

export type GenerateFailure = { ok: false; reason: GenerateError };

/** generateBatch fills every slot, so results are never null. */
export type GenerateBatchResult =
  | { ok: true; results: GeneratedPokemon[] }
  | GenerateFailure;

/** rerollOne preserves empty slots, so results may contain null. */
export type RerollResult =
  | { ok: true; results: (GeneratedPokemon | null)[] }
  | GenerateFailure;

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Shiny Only / Random Mix require a real shiny asset; Normal uses all. */
function filterByShiny(pool: Species[], mode: ShinyMode): Species[] {
  if (mode === "normal") return pool;
  return pool.filter((s) => s.hasShinyAsset);
}

/**
 * Pick `n` species. Without duplicates, distinct by speciesId (forms of the
 * same species count as one). Returns null when the candidate pool is too
 * small — callers surface a clear "not enough" state, never silently shrink n.
 */
function pickSpecies(
  pool: Species[],
  n: number,
  allowDuplicates: boolean,
  rng: () => number,
): Species[] | null {
  if (pool.length === 0) return null;

  if (allowDuplicates) {
    const out: Species[] = [];
    for (let i = 0; i < n; i++) {
      out.push(pool[Math.floor(rng() * pool.length)]);
    }
    return out;
  }

  const bySpecies = new Map<string, Species[]>();
  for (const s of pool) {
    const group = bySpecies.get(s.speciesId);
    if (group) group.push(s);
    else bySpecies.set(s.speciesId, [s]);
  }
  const ids = [...bySpecies.keys()];
  if (ids.length < n) return null;
  shuffleInPlace(ids, rng);
  const out: Species[] = [];
  for (let i = 0; i < n; i++) {
    const forms = bySpecies.get(ids[i])!;
    out.push(forms[Math.floor(rng() * forms.length)]);
  }
  return out;
}

function assignShiny(mode: ShinyMode, rng: () => number): boolean {
  if (mode === "normal") return false;
  if (mode === "shiny") return true;
  // Entertainment-only 10% per slot (§5.5) — not an official rate.
  return rng() < 0.1;
}

function assignNature(randomNature: boolean, rng: () => number): NatureName | null {
  if (!randomNature) return null;
  return NATURES[Math.floor(rng() * NATURES.length)];
}

/**
 * Produce a full batch, preserving `kept` entries in place and regenerating the
 * null slots. `kept.length` is the request count. When `allowDuplicates` is
 * off, new picks never collide with kept species (§5.3).
 */
export function generateBatch(
  pool: Species[],
  settings: GenerationSettings,
  kept: (GeneratedPokemon | null)[],
  rng: () => number = Math.random,
): GenerateBatchResult {
  const eligible = filterByShiny(pool, settings.shinyMode);
  const keptItems = kept.filter((x): x is GeneratedPokemon => x !== null);
  const unlockedCount = kept.length - keptItems.length;

  let candidates = eligible;
  if (!settings.allowDuplicates) {
    const keptIds = new Set(keptItems.map((x) => x.species.speciesId));
    candidates = eligible.filter((s) => !keptIds.has(s.speciesId));
  }

  const picks = pickSpecies(
    candidates,
    unlockedCount,
    settings.allowDuplicates,
    rng,
  );
  if (picks === null) {
    return { ok: false, reason: eligible.length === 0 ? "empty-pool" : "not-enough" };
  }

  const results: GeneratedPokemon[] = new Array(kept.length);
  let pickIndex = 0;
  for (let i = 0; i < kept.length; i++) {
    const existing = kept[i];
    if (existing) {
      results[i] = existing;
    } else {
      const species = picks[pickIndex++];
      results[i] = {
        species,
        isShiny: assignShiny(settings.shinyMode, rng),
        nature: assignNature(settings.randomNature, rng),
      };
    }
  }
  return { ok: true, results };
}

/**
 * Reroll a single slot, leaving every other slot (including empty slots)
 * exactly as it is. Dedup avoids colliding with the other occupied slots.
 */
export function rerollOne(
  pool: Species[],
  settings: GenerationSettings,
  results: (GeneratedPokemon | null)[],
  index: number,
  rng: () => number = Math.random,
): RerollResult {
  const eligible = filterByShiny(pool, settings.shinyMode);

  let candidates = eligible;
  if (!settings.allowDuplicates) {
    const occupied = new Set<string>();
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (i !== index && r) occupied.add(r.species.speciesId);
    }
    candidates = eligible.filter((s) => !occupied.has(s.speciesId));
  }

  const picks = pickSpecies(candidates, 1, true, rng);
  if (picks === null) {
    return { ok: false, reason: eligible.length === 0 ? "empty-pool" : "not-enough" };
  }

  const next = results.slice();
  next[index] = {
    species: picks[0],
    isShiny: assignShiny(settings.shinyMode, rng),
    nature: assignNature(settings.randomNature, rng),
  };
  return { ok: true, results: next };
}
