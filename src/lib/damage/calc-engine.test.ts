import { describe, it, expect } from "vitest";
import {
  calculateDamage,
  DEFAULT_EVS,
  DEFAULT_IVS,
  smokeTest,
  toSmogonName,
} from "./calc-engine";
import type { DamageRequest, PokemonBuild } from "./calc-engine";

function attacker(overrides: Partial<PokemonBuild & { move: string }> = {}): PokemonBuild & { move: string } {
  return {
    speciesName: "Gyarados",
    level: 100,
    nature: null,
    ability: null,
    item: null,
    teraType: null,
    ivs: DEFAULT_IVS,
    evs: DEFAULT_EVS,
    move: "Tackle",
    ...overrides,
  };
}

function defender(overrides: Partial<PokemonBuild> = {}): PokemonBuild {
  return {
    speciesName: "Snorlax",
    level: 100,
    nature: null,
    ability: null,
    item: null,
    teraType: null,
    ivs: DEFAULT_IVS,
    evs: DEFAULT_EVS,
    ...overrides,
  };
}

function request(overrides: Partial<DamageRequest> = {}): DamageRequest {
  return {
    attacker: attacker(),
    defender: defender(),
    field: { weather: "None", terrain: "None" },
    ...overrides,
  };
}

describe("toSmogonName", () => {
  it("maps the three known name mismatches", () => {
    expect(toSmogonName("Nidoran♀")).toBe("Nidoran-F");
    expect(toSmogonName("Nidoran♂")).toBe("Nidoran-M");
    expect(toSmogonName("Aegislash")).toBe("Aegislash-Shield");
  });

  it("leaves normal names untouched", () => {
    expect(toSmogonName("Bulbasaur")).toBe("Bulbasaur");
  });
});

describe("calc-engine benchmark (gen 9 Scarlet/Violet)", () => {
  it("matches the fixed Thunderbolt vs Gyarados reference range", () => {
    const { range, desc } = smokeTest();
    // Reference values produced by @smogon/calc 0.12.0, cross-checked by hand.
    expect(range).toEqual({ min: 376, max: 448 });
    expect(desc).toContain("guaranteed OHKO");
  });

  it("matches an independently hand-computed base formula", () => {
    // Independent reference (no STAB, no item/ability/weather, 1× effectiveness):
    //   Atk = floor((2*125 + 31) * 100/100) + 5 = 286  (Gyarados, 31 IV, 0 EV, neutral)
    //   Def = floor((2*65  + 31) * 100/100) + 5 = 166  (Snorlax)
    //   base = floor(floor(floor(2*100/5+2) * 40 * 286 / 166) / 50) + 2 = 59
    //   rolls = floor(59 * r), r ∈ [0.85 .. 1.00] → min 50, max 59
    const outcome = calculateDamage(
      request({
        attacker: attacker({ speciesName: "Gyarados", move: "Tackle" }),
        defender: defender({ speciesName: "Snorlax" }),
      }),
    );
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.range).toEqual({ min: 50, max: 59 });
    }
  });

  it("applies the Tera STAB boost to 2×", () => {
    const outcome = calculateDamage(
      request({
        attacker: attacker({ speciesName: "Pikachu", move: "Thunderbolt", teraType: "Electric" }),
        defender: defender({ speciesName: "Gyarados" }),
      }),
    );
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.range).toEqual({ min: 304, max: 360 });
    }
  });

  it("applies the rain boost to Water moves", () => {
    const rainy = calculateDamage(
      request({
        attacker: attacker({ speciesName: "Gyarados", move: "Waterfall" }),
        defender: defender({ speciesName: "Charizard" }),
        field: { weather: "Rain", terrain: "None" },
      }),
    );
    const clear = calculateDamage(
      request({
        attacker: attacker({ speciesName: "Gyarados", move: "Waterfall" }),
        defender: defender({ speciesName: "Charizard" }),
      }),
    );
    expect(rainy.ok && clear.ok).toBe(true);
    if (rainy.ok && clear.ok) {
      expect(rainy.result.range).toEqual({ min: 390, max: 458 });
      expect(clear.result.range).toEqual({ min: 258, max: 306 });
      expect(rainy.result.range.min).toBeGreaterThan(clear.result.range.max);
    }
  });

  it("returns a stable no-effect result for immunities", () => {
    const outcome = calculateDamage(
      request({
        attacker: attacker({ speciesName: "Gyarados", move: "Earthquake" }),
        defender: defender({ speciesName: "Charizard" }), // Flying is immune to Ground
      }),
    );
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.range).toEqual({ min: 0, max: 0 });
      expect(outcome.result.kochance.text).toBe("no effect");
      expect(outcome.result.desc).toContain("no effect");
    }
  });
});

describe("calc-engine validation", () => {
  it("rejects unknown species", () => {
    const outcome = calculateDamage(
      request({ attacker: attacker({ speciesName: "FakePokemon" }) }),
    );
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.error).toContain("Unknown attacker species");
  });

  it("rejects unknown moves", () => {
    const outcome = calculateDamage(request({ attacker: attacker({ move: "FakeMove" }) }));
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.error).toContain("Unknown move");
  });

  it("rejects EV totals over 510", () => {
    const outcome = calculateDamage(
      request({
        attacker: attacker({ evs: { hp: 252, atk: 252, def: 252 } }),
      }),
    );
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.error).toContain("510");
  });

  it("rejects out-of-range IVs and levels", () => {
    expect(
      calculateDamage(request({ attacker: attacker({ ivs: { hp: 32 } }) })),
    ).toEqual(expect.objectContaining({ ok: false }));

    expect(
      calculateDamage(request({ attacker: attacker({ level: 0 }) })),
    ).toEqual(expect.objectContaining({ ok: false }));
  });
});
