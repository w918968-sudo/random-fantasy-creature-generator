import { describe, it, expect } from "vitest";
import { makeSpecies } from "@/lib/test/factories";
import type { GenerationSettings } from "@/lib/types";
import { generateBatch, rerollOne } from "./generate";

const baseSettings: GenerationSettings = {
  count: 3,
  allowDuplicates: false,
  shinyMode: "normal",
  randomNature: false,
};

function speciesPool(n: number) {
  return Array.from({ length: n }, (_, i) =>
    makeSpecies({ speciesId: `s${i}`, name: `S${i}` }),
  );
}

// Deterministic RNG: always returns the given sequence then wraps.
function seqRng(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("generateBatch", () => {
  it("returns distinct species without duplicates", () => {
    const pool = speciesPool(6);
    const r = generateBatch(pool, baseSettings, [null, null, null]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const ids = r.results.map((x) => x.species.speciesId);
      expect(new Set(ids).size).toBe(3);
    }
  });

  it("returns not-enough when candidate pool is smaller than request", () => {
    const pool = speciesPool(2);
    const r = generateBatch(pool, baseSettings, [null, null, null]);
    expect(r).toEqual({ ok: false, reason: "not-enough" });
  });

  it("keeps locked entries in place and regenerates others", () => {
    const pool = speciesPool(6);
    const kept0 = makeSpecies({ speciesId: "locked", name: "Locked" });
    const locked = {
      species: kept0,
      isShiny: true,
      nature: null,
    };
    const r = generateBatch(pool, baseSettings, [locked, null, null]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.results[0]).toBe(locked);
      expect(r.results[1].species.speciesId).not.toBe("locked");
      expect(r.results[2].species.speciesId).not.toBe("locked");
    }
  });

  it("avoids colliding new picks with locked species", () => {
    // Pool of 2; 1 locked, request 2 total -> only 1 free species, no collision.
    const pool = speciesPool(2);
    const lockedSpecies = pool[0];
    const locked = { species: lockedSpecies, isShiny: false, nature: null };
    const r = generateBatch(pool, { ...baseSettings, count: 2 }, [locked, null]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.results[1].species.speciesId).toBe(pool[1].speciesId);
    }
  });

  it("allows duplicates when allowDuplicates is on", () => {
    const pool = speciesPool(2);
    const r = generateBatch(
      pool,
      { ...baseSettings, allowDuplicates: true },
      [null, null, null],
    );
    expect(r.ok).toBe(true);
    // Not asserting duplication happens (RNG-dependent), just that it can pick
    // from a pool smaller than the request without error.
  });

  it("returns empty-pool when shiny-only but no shiny assets exist", () => {
    const pool = speciesPool(3); // hasShinyAsset defaults false
    const r = generateBatch(
      pool,
      { ...baseSettings, shinyMode: "shiny" },
      [null, null, null],
    );
    expect(r).toEqual({ ok: false, reason: "empty-pool" });
  });

  it("random mix assigns ~10% shiny per slot deterministically", () => {
    const pool = speciesPool(10).map((s) => ({ ...s, hasShinyAsset: true }));
    // rng() < 0.1 -> shiny. Seed 0.05 -> shiny, 0.5 -> normal.
    const rng = seqRng([0.5, 0.05, 0.5]);
    const r = generateBatch(
      pool,
      { ...baseSettings, shinyMode: "random" },
      [null, null, null],
      rng,
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.results.map((x) => x.isShiny)).toEqual([false, true, false]);
    }
  });
});

describe("rerollOne", () => {
  it("replaces only the target slot", () => {
    const pool = speciesPool(6);
    const initial = pool.slice(0, 3).map((s) => ({
      species: s,
      isShiny: false,
      nature: null,
    }));
    const r = rerollOne(pool, baseSettings, initial, 1, seqRng([0.5]));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.results[0]).toBe(initial[0]);
      expect(r.results[2]).toBe(initial[2]);
      expect(r.results[1]).not.toBe(initial[1]);
    }
  });

  it("avoids colliding with the kept slots", () => {
    const pool = speciesPool(3);
    const initial = pool.slice(0, 3).map((s) => ({
      species: s,
      isShiny: false,
      nature: null,
    }));
    // Rerolling slot 0 with only 3 species and 2 kept -> no collision possible
    // without duplicates, so slot 0 must differ from slots 1 and 2.
    const r = rerollOne(pool, baseSettings, initial, 0, seqRng([0.5]));
    expect(r.ok).toBe(true);
    if (r.ok) {
      const otherIds = new Set([
        initial[1].species.speciesId,
        initial[2].species.speciesId,
      ]);
      expect(otherIds.has(r.results[0]!.species.speciesId)).toBe(false);
    }
  });

  it("leaves empty slots untouched", () => {
    const pool = speciesPool(6);
    const occupied = { species: pool[0], isShiny: false, nature: null };
    const results = [occupied, null, null];
    const r = rerollOne(pool, baseSettings, results, 1, seqRng([0.5]));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.results[0]).toBe(occupied);
      expect(r.results[2]).toBeNull();
      expect(r.results[1]).not.toBeNull();
    }
  });
});
