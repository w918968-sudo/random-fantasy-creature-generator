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

/** Move category used by the damage calculator and move list. */
export type MoveCategory = "Physical" | "Special" | "Status";

export interface Move {
  id: string;
  name: string;
  type: TypeName;
  /** Base power; 0 for status moves. */
  power: number;
  /** Percent accuracy; null for never-miss/status. */
  accuracy: number | null;
  category: MoveCategory;
}

/** Type effectiveness multiplier: 0 (immune), 0.5, 1, or 2. */
export type TypeMultiplier = 0 | 0.5 | 1 | 2;

/** attack type -> defense type -> multiplier. */
export type TypeChart = Record<TypeName, Record<TypeName, TypeMultiplier>>;

export interface DefensiveSummary {
  /** Team members taking ×2 or ×4 from this attacking type. */
  weak: number;
  /** Team members taking ×0.25 or ×0.5. */
  resist: number;
  /** Team members taking ×0. */
  immune: number;
}

export interface TeamOverview {
  averageBaseStatTotal: number;
  /** type -> count of team members carrying it. */
  typeSpread: Partial<Record<TypeName, number>>;
  legendaryCount: number;
  shinyCount: number;
  /** generation -> count. */
  generationSpread: Partial<Record<number, number>>;
  distinctTypeCount: number;
}

export interface TeamAnalysis {
  overview: TeamOverview;
  /** attacking type -> how the team's members collectively fare against it. */
  defensive: Record<TypeName, DefensiveSummary>;
  /** defending type -> number of members able to hit it super-effectively. */
  offensive: Record<TypeName, number>;
  /** Attacking types that 3+ members are weak to (most urgent gaps). */
  weaknessHighlights: TypeName[];
  /** Attacking types that at least 2 members resist or are immune to. */
  resistanceHighlights: TypeName[];
}
