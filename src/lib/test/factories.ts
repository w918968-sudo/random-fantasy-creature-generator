import type { Species } from "@/lib/types";

let seq = 0;

/** Minimal Species factory for tests. */
export function makeSpecies(overrides: Partial<Species> = {}): Species {
  seq += 1;
  return {
    speciesId: `species-${seq}`,
    formId: null,
    name: `Species ${seq}`,
    category: null,
    nationalDexNumber: seq,
    generation: 1,
    formName: null,
    isDefaultForm: true,
    types: ["Normal"],
    isLegendary: false,
    isMythical: false,
    evolutionStage: 1,
    isFinalEvolution: false,
    evolvesFrom: null,
    evolvesTo: [],
    abilities: { regular: ["Ability A"], hidden: [] },
    baseStats: {
      hp: 50,
      attack: 50,
      defense: 50,
      specialAttack: 50,
      specialDefense: 50,
      speed: 50,
    },
    heightM: 1,
    weightKg: 10,
    hasShinyAsset: false,
    scarletVioletSupported: false,
    sourceRecordId: "test",
    ...overrides,
  };
}
