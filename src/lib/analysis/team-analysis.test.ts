import { describe, it, expect } from "vitest";
import { makeSpecies } from "@/lib/test/factories";
import type { GeneratedPokemon, Move, TypeChart } from "@/lib/types";
import { TYPE_CHART } from "@/lib/data/type-chart";
import {
  analyzeTeam,
  damagingMoveTypes,
  defenseBucket,
  defensiveProfile,
  offensiveCoverage,
  teamOverview,
  typeEffectiveness,
} from "./team-analysis";

function member(overrides: Partial<GeneratedPokemon["species"]> = {}, extra: Partial<GeneratedPokemon> = {}): GeneratedPokemon {
  return { species: makeSpecies(overrides), isShiny: false, nature: null, ...extra };
}

function makeMove(overrides: Partial<Move> = {}): Move {
  return {
    id: "move",
    name: "Move",
    type: "Normal",
    power: 90,
    accuracy: 100,
    category: "Physical",
    ...overrides,
  };
}

describe("typeEffectiveness (real Gen 9 chart)", () => {
  it("applies single-type matchups", () => {
    expect(typeEffectiveness("Fire", ["Water"])).toBe(0.5);
    expect(typeEffectiveness("Fire", ["Grass"])).toBe(2);
    expect(typeEffectiveness("Ground", ["Flying"])).toBe(0);
    expect(typeEffectiveness("Ghost", ["Normal"])).toBe(0);
  });

  it("multiplies dual types", () => {
    expect(typeEffectiveness("Fire", ["Grass", "Bug"])).toBe(4);
    expect(typeEffectiveness("Ground", ["Electric", "Poison"])).toBe(4);
    expect(typeEffectiveness("Ice", ["Grass", "Flying"])).toBe(4);
    expect(typeEffectiveness("Fire", ["Water", "Dragon"])).toBe(0.25);
  });

  it("is symmetric with the chart's stored multipliers", () => {
    // Every single-type matchup must agree with the stored chart entry.
    for (const atk of Object.keys(TYPE_CHART) as (keyof TypeChart)[]) {
      for (const def of Object.keys(TYPE_CHART[atk]) as (keyof TypeChart)[]) {
        expect(typeEffectiveness(atk, [def])).toBe(TYPE_CHART[atk][def]);
      }
    }
  });
});

describe("defenseBucket", () => {
  it("classifies multipliers", () => {
    expect(defenseBucket(0)).toBe("immune");
    expect(defenseBucket(0.25)).toBe("resist");
    expect(defenseBucket(0.5)).toBe("resist");
    expect(defenseBucket(1)).toBe("neutral");
    expect(defenseBucket(2)).toBe("weak");
    expect(defenseBucket(4)).toBe("weak");
  });
});

describe("defensiveProfile", () => {
  it("counts weak/resist/immune across the team", () => {
    const team = [
      member({ types: ["Fire"] }),
      member({ types: ["Water"] }),
    ];
    const profile = defensiveProfile(team);
    // Water hits Fire super-effectively and Water is resisted by itself.
    expect(profile.Water).toEqual({ weak: 1, resist: 1, immune: 0 });
    // Grass is resisted by Fire and super-effective vs Water.
    expect(profile.Grass).toEqual({ weak: 1, resist: 1, immune: 0 });
    // Electric is neutral vs Fire, super-effective vs Water.
    expect(profile.Electric).toEqual({ weak: 1, resist: 0, immune: 0 });
  });

  it("counts immunities", () => {
    const team = [member({ types: ["Normal"] })];
    expect(defensiveProfile(team).Ghost).toEqual({ weak: 0, resist: 0, immune: 1 });
  });
});

describe("offensiveCoverage", () => {
  const moves: Record<string, Move> = {
    ember: makeMove({ id: "ember", name: "Ember", type: "Fire", category: "Special" }),
    bubble: makeMove({ id: "bubble", name: "Bubble", type: "Water", category: "Special" }),
    scratch: makeMove({ id: "scratch", name: "Scratch", type: "Normal", category: "Physical" }),
    growl: makeMove({ id: "growl", name: "Growl", type: "Normal", power: 0, category: "Status" }),
  };
  const learnsets = {
    firemon: ["ember", "scratch"],
    watermon: ["bubble", "growl"],
  };

  it("counts members that hit each defending type super-effectively", () => {
    const team = [
      member({ speciesId: "firemon" }),
      member({ speciesId: "watermon" }),
    ];
    const coverage = offensiveCoverage(team, moves, learnsets);
    // Fire is super-effective vs Grass -> only firemon covers Grass.
    expect(coverage.Grass).toBe(1);
    // Water is super-effective vs Fire -> only watermon covers Fire.
    expect(coverage.Fire).toBe(1);
    // Neither has a move that hits Water super-effectively.
    expect(coverage.Water).toBe(0);
    // Status moves (power 0) must not count as coverage.
    expect(coverage.Electric).toBe(0);
  });
});

describe("damagingMoveTypes", () => {
  it("collects only damaging move types", () => {
    const moves: Record<string, Move> = {
      a: makeMove({ id: "a", type: "Fire" }),
      b: makeMove({ id: "b", type: "Water" }),
      c: makeMove({ id: "c", type: "Grass", power: 0, category: "Status" }),
    };
    const types = damagingMoveTypes("x", moves, { x: ["a", "b", "c"] });
    expect(types.sort()).toEqual(["Fire", "Water"]);
  });
});

describe("teamOverview", () => {
  it("aggregates stats, types, generations, and flags", () => {
    const team = [
      member(
        { types: ["Fire", "Flying"], generation: 1, baseStats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 } },
        { isShiny: true },
      ),
      member({ types: ["Water"], generation: 9, isLegendary: true }),
    ];
    const overview = teamOverview(team);
    expect(overview.averageBaseStatTotal).toBe(Math.round((534 + 300) / 2)); // second uses factory 50×6
    expect(overview.typeSpread).toEqual({ Fire: 1, Flying: 1, Water: 1 });
    expect(overview.legendaryCount).toBe(1);
    expect(overview.shinyCount).toBe(1);
    expect(overview.generationSpread).toEqual({ 1: 1, 9: 1 });
    expect(overview.distinctTypeCount).toBe(3);
  });
});

describe("analyzeTeam", () => {
  it("derives highlights from thresholds", () => {
    // Four Fire members: the team is collectively weak to Water, Ground, Rock.
    const team = [
      member({ types: ["Fire"] }),
      member({ types: ["Fire"] }),
      member({ types: ["Fire"] }),
      member({ types: ["Fire"] }),
    ];
    const analysis = analyzeTeam(team);
    expect(analysis.weaknessHighlights).toEqual(
      expect.arrayContaining(["Water", "Ground", "Rock"]),
    );
    // Fire resists itself, Ice, Grass, Bug, Steel, Fairy -> several resistances.
    expect(analysis.resistanceHighlights).toEqual(
      expect.arrayContaining(["Fire", "Ice", "Grass", "Bug", "Steel", "Fairy"]),
    );
  });
});
