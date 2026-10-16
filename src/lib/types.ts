/** Shared domain types for the generator, decoupled from any UI or data source. */

export type TypeName =
  | "Normal"
  | "Fire"
  | "Water"
  | "Electric"
  | "Grass"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Dark"
  | "Steel"
  | "Fairy";

export type NatureName =
  | "Hardy"
  | "Lonely"
  | "Brave"
  | "Adamant"
  | "Naughty"
  | "Bold"
  | "Docile"
  | "Relaxed"
  | "Impish"
  | "Lax"
  | "Timid"
  | "Hasty"
  | "Serious"
  | "Jolly"
  | "Naive"
  | "Modest"
  | "Mild"
  | "Quiet"
  | "Bashful"
  | "Rash"
  | "Calm"
  | "Gentle"
  | "Sassy"
  | "Careful"
  | "Quirky";

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Species {
  /** Stable species id (e.g. "bulbasaur"). Shared across forms for dedup. */
  speciesId: string;
  /** Stable form id (e.g. "alola"); null for the base/default form. */
  formId: string | null;
  /** Display name (e.g. "Bulbasaur", "Raichu (Alolan Form)"). */
  name: string;
  /** English Pokédex category (e.g. "Seed Pokémon"). */
  category: string | null;
  nationalDexNumber: number;
  generation: number;
  formName: string | null;
  isDefaultForm: boolean;
  types: TypeName[];
  isLegendary: boolean;
  isMythical: boolean;
  evolutionStage: number;
  isFinalEvolution: boolean;
  /** Immediate previous species in the evolution chain, if any. */
  evolvesFrom: string | null;
  /** Immediate next species in the evolution chain. */
  evolvesTo: string[];
  abilities: { regular: string[]; hidden: string[] };
  baseStats: BaseStats;
  heightM: number | null;
  weightKg: number | null;
  /**
   * True only when a licensed, form-correct shiny image is actually available.
   * Gates Shiny Only / Random Mix eligibility; never silently fall back to the
   * normal image (§5.5).
   */
  hasShinyAsset: boolean;
  /** Whether this species/form has Scarlet/Violet (gen 9) move data. */
  scarletVioletSupported: boolean;
  sourceRecordId: string;
}

export type Mode = "single" | "multiple" | "team";

export type ShinyMode = "normal" | "shiny" | "random";

export interface Filters {
  /** Selected generations (OR). Empty = all. */
  generations: number[];
  /** Selected types (OR). Empty = all. */
  types: TypeName[];
  /** Selected evolution stages (OR). Empty = all. Advanced. */
  evolutionStages: number[];
  /** Include non-base official forms. Advanced. Default false. */
  includeForms: boolean;
  /** Only species that have a hidden ability. Advanced. Default false. */
  hasHiddenAbility: boolean;
  /** Exclude legendary & mythical Pokémon. Advanced. Default false. */
  excludeLegendaryMythical: boolean;
}

export interface GenerationSettings {
  count: number;
  allowDuplicates: boolean;
  shinyMode: ShinyMode;
  randomNature: boolean;
}

export interface GeneratedPokemon {
  species: Species;
  isShiny: boolean;
  /** Assigned only when Random Nature is on; otherwise null. */
  nature: NatureName | null;
}

export const MAX_GENERATION = 9;

export const ALL_TYPES: readonly TypeName[] = [
  "Normal",
  "Fire",
  "Water",
  "Electric",
  "Grass",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
];
