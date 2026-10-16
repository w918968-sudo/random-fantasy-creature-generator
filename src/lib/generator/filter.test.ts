import { describe, it, expect } from "vitest";
import type { Filters } from "@/lib/types";
import { makeSpecies } from "@/lib/test/factories";
import {
  activeAdvancedFilterCount,
  DEFAULT_FILTERS,
  filterPool,
  matchesFilters,
} from "./filter";

describe("filter: cross-category AND, within-category OR", () => {
  const fireGen1 = makeSpecies({ speciesId: "a", generation: 1, types: ["Fire"] });
  const waterGen1 = makeSpecies({ speciesId: "b", generation: 1, types: ["Water"] });
  const fireWaterGen2 = makeSpecies({
    speciesId: "c",
    generation: 2,
    types: ["Fire", "Water"],
  });

  it("keeps everything with default filters", () => {
    const pool = [fireGen1, waterGen1, fireWaterGen2];
    expect(filterPool(pool, DEFAULT_FILTERS)).toEqual(pool);
  });

  it("applies OR within types", () => {
    const filters: Filters = { ...DEFAULT_FILTERS, types: ["Fire", "Water"] };
    const kept = filterPool([fireGen1, waterGen1, fireWaterGen2], filters);
    // All three match at least one of Fire/Water.
    expect(kept.length).toBe(3);
  });

  it("applies AND across generation and type", () => {
    const filters: Filters = { ...DEFAULT_FILTERS, generations: [1], types: ["Fire"] };
    const kept = filterPool([fireGen1, waterGen1, fireWaterGen2], filters);
    expect(kept.map((s) => s.speciesId)).toEqual(["a"]);
  });
});

describe("filter: forms", () => {
  it("excludes non-default forms unless includeForms is on", () => {
    const base = makeSpecies({ speciesId: "pika", isDefaultForm: true });
    const alola = makeSpecies({
      speciesId: "pika",
      formId: "alola",
      isDefaultForm: false,
    });
    const pool = [base, alola];
    expect(filterPool(pool, DEFAULT_FILTERS).map((s) => s.formId)).toEqual([null]);
    expect(
      filterPool(pool, { ...DEFAULT_FILTERS, includeForms: true }).length,
    ).toBe(2);
  });
});

describe("filter: hidden ability / legendary-mythical", () => {
  it("filters to species with a hidden ability", () => {
    const withHidden = makeSpecies({
      speciesId: "h",
      abilities: { regular: ["A"], hidden: ["H"] },
    });
    const noHidden = makeSpecies({
      speciesId: "n",
      abilities: { regular: ["A"], hidden: [] },
    });
    const kept = filterPool(
      [withHidden, noHidden],
      { ...DEFAULT_FILTERS, hasHiddenAbility: true },
    );
    expect(kept.map((s) => s.speciesId)).toEqual(["h"]);
  });

  it("excludes legendary and mythical", () => {
    const legendary = makeSpecies({ speciesId: "l", isLegendary: true });
    const mythical = makeSpecies({ speciesId: "m", isMythical: true });
    const normal = makeSpecies({ speciesId: "n" });
    const kept = filterPool(
      [legendary, mythical, normal],
      { ...DEFAULT_FILTERS, excludeLegendaryMythical: true },
    );
    expect(kept.map((s) => s.speciesId)).toEqual(["n"]);
  });
});

describe("activeAdvancedFilterCount", () => {
  it("counts only advanced filters", () => {
    expect(activeAdvancedFilterCount(DEFAULT_FILTERS)).toBe(0);
    expect(
      activeAdvancedFilterCount({
        ...DEFAULT_FILTERS,
        includeForms: true,
        hasHiddenAbility: true,
      }),
    ).toBe(2);
    // Basic filters (generation/type) must not count.
    expect(
      activeAdvancedFilterCount({
        ...DEFAULT_FILTERS,
        generations: [1],
        types: ["Fire"],
      }),
    ).toBe(0);
  });
});

describe("matchesFilters", () => {
  it("returns false when generation not selected", () => {
    const s = makeSpecies({ generation: 3 });
    expect(matchesFilters(s, { ...DEFAULT_FILTERS, generations: [1, 2] })).toBe(
      false,
    );
  });
});
