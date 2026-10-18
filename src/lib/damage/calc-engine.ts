/**
 * Damage calculation engine adapter.
 *
 * Wraps @smogon/calc (v0.12.0, MIT) so the UI never depends on the engine's
 * internal object shapes. All damage math for the Scarlet/Violet (gen 9)
 * single-battle damage calculator goes through this module.
 *
 * @smogon/calc ships its species/move/item/ability/type data as plain CommonJS
 * modules and its mechanics as pure functions — no `fs`/`Buffer`/`process` —
 * so it bundles for the browser. See data-sources.md for version pinning.
 *
 * @smogon/calc is lenient about invalid input (unknown items/abilities are
 * silently ignored, unknown species/moves throw during construction/calculate).
 * This adapter therefore validates every field itself and returns a typed
 * error rather than a wrong number.
 */
import {
  Generations,
  Pokemon,
  Move,
  Field,
  calculate,
  toID,
} from "@smogon/calc";
import type { Result } from "@smogon/calc";
import type { NatureName, TypeName } from "@/lib/types";

/** Generation used for all damage calculations. */
export const SV_GENERATION = 9;

export interface DamageRange {
  min: number;
  max: number;
}

/** Short stat keys used by @smogon/calc (and by the calc UI). */
export interface CalcStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export const DEFAULT_IVS: CalcStats = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
export const DEFAULT_EVS: CalcStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

export interface PokemonBuild {
  /** Display name as stored in species.json (e.g. "Bulbasaur"). */
  speciesName: string;
  level: number;
  nature: NatureName | null;
  /** @smogon/calc ability name; null = species default. */
  ability: string | null;
  /** @smogon/calc item name; null = no item. */
  item: string | null;
  /** Tera type; null = not Terastallized. */
  teraType: TypeName | null;
  ivs: Partial<CalcStats>;
  evs: Partial<CalcStats>;
}

export const WEATHERS = ["None", "Rain", "Sun", "Sand", "Snow"] as const;
export const TERRAINS = ["None", "Electric", "Grassy", "Misty", "Psychic"] as const;

export type WeatherName = (typeof WEATHERS)[number];
export type TerrainName = (typeof TERRAINS)[number];

export interface FieldBuild {
  weather: WeatherName;
  terrain: TerrainName;
}

export interface DamageRequest {
  attacker: PokemonBuild & { move: string };
  defender: PokemonBuild;
  field: FieldBuild;
}

export interface KoChance {
  /** Undefined for fixed-damage moves that have no random roll. */
  chance: number | undefined;
  n: number;
  text: string;
}

export interface DamageResult {
  range: DamageRange;
  /** The 16 possible damage rolls, ascending. */
  rolls: number[];
  kochance: KoChance;
  desc: string;
  moveDesc: string;
}

export type DamageOutcome =
  | { ok: true; result: DamageResult }
  | { ok: false; error: string };

export interface SmokeResult {
  range: DamageRange;
  desc: string;
}

/**
 * species.json uses a few names that differ from @smogon/calc's base-form
 * names. Verified programmatically (scripts/fetch-smogon-data.mjs era): these
 * three are the only mismatches across all 1025 species.
 */
const SMOGON_NAME_ALIASES: Record<string, string> = {
  "Nidoran♀": "Nidoran-F",
  "Nidoran♂": "Nidoran-M",
  Aegislash: "Aegislash-Shield",
};

export function toSmogonName(speciesName: string): string {
  return SMOGON_NAME_ALIASES[speciesName] ?? speciesName;
}

/**
 * @smogon/calc stores damage as a single number (fixed damage), an array (the
 * 16 rolls), or an array of arrays (multi-hit). Flatten to the 16-roll form the
 * rest of the app expects.
 */
function flattenDamage(damage: number | number[] | number[][]): number[] {
  if (typeof damage === "number") return [damage];
  if (damage.length === 0) return [];
  return Array.isArray(damage[0]) ? (damage as number[][]).flat() : (damage as number[]);
}

function validateStats(build: PokemonBuild): string | null {
  if (!Number.isInteger(build.level) || build.level < 1 || build.level > 100) {
    return "Level must be an integer between 1 and 100.";
  }
  for (const [key, value] of Object.entries(build.ivs)) {
    if (!Number.isInteger(value) || value < 0 || value > 31) {
      return `IV "${key}" must be between 0 and 31.`;
    }
  }
  let evTotal = 0;
  for (const [key, value] of Object.entries(build.evs)) {
    if (!Number.isInteger(value) || value < 0 || value > 252) {
      return `EV "${key}" must be between 0 and 252.`;
    }
    evTotal += value;
  }
  if (evTotal > 510) return "Total EVs must not exceed 510.";
  return null;
}

export function calculateDamage(request: DamageRequest): DamageOutcome {
  const gen = Generations.get(SV_GENERATION);

  for (const [label, build] of [
    ["attacker", request.attacker],
    ["defender", request.defender],
  ] as const) {
    if (!gen.species.get(toID(toSmogonName(build.speciesName)))) {
      return { ok: false, error: `Unknown ${label} species "${build.speciesName}".` };
    }
    const statError = validateStats(build);
    if (statError) return { ok: false, error: `${label}: ${statError}` };
  }

  if (!gen.moves.get(toID(request.attacker.move))) {
    return { ok: false, error: `Unknown move "${request.attacker.move}".` };
  }

  let attacker: Pokemon;
  let defender: Pokemon;
  let move: Move;
  let field: Field;
  try {
    attacker = new Pokemon(SV_GENERATION, toSmogonName(request.attacker.speciesName), {
      level: request.attacker.level,
      nature: request.attacker.nature ?? undefined,
      ability: request.attacker.ability ?? undefined,
      item: request.attacker.item ?? undefined,
      teraType: request.attacker.teraType ?? undefined,
      ivs: request.attacker.ivs,
      evs: request.attacker.evs,
    });
    defender = new Pokemon(SV_GENERATION, toSmogonName(request.defender.speciesName), {
      level: request.defender.level,
      nature: request.defender.nature ?? undefined,
      ability: request.defender.ability ?? undefined,
      item: request.defender.item ?? undefined,
      teraType: request.defender.teraType ?? undefined,
      ivs: request.defender.ivs,
      evs: request.defender.evs,
    });
    move = new Move(SV_GENERATION, request.attacker.move);
    field = new Field({
      weather: request.field.weather === "None" ? undefined : request.field.weather,
      terrain: request.field.terrain === "None" ? undefined : request.field.terrain,
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid input." };
  }

  const result: Result = calculate(gen, attacker, defender, move, field);
  const [min, max] = result.range();
  // @smogon/calc's desc() and kochance() throw when max damage is 0 (e.g. an
  // immunity or a status move), so produce a stable result for those cases.
  const noDamage = max === 0;
  return {
    ok: true,
    result: {
      range: { min, max },
      rolls: flattenDamage(result.damage),
      kochance: noDamage
        ? { chance: 0, n: 0, text: "no effect" }
        : result.kochance(),
      desc: noDamage
        ? `${attacker.name} ${move.name} vs. ${defender.name}: no effect (0 damage).`
        : result.desc(),
      moveDesc: result.moveDesc(),
    },
  };
}

/**
 * Fixed benchmark case, also used by unit tests:
 * Modest Light Ball Pikachu (252 SpA) Thunderbolt vs. Gyarados (252 HP / 0 SpD).
 * Expected range: 376–448 (guaranteed OHKO).
 */
export function smokeTest(): SmokeResult {
  const gen = Generations.get(SV_GENERATION);
  const attacker = new Pokemon(SV_GENERATION, "Pikachu", {
    level: 50,
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    evs: { spa: 252, spe: 252 },
    nature: "Modest",
    item: "Light Ball",
  });
  const defender = new Pokemon(SV_GENERATION, "Gyarados", {
    level: 50,
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    evs: { hp: 252, def: 252 },
  });
  const move = new Move(SV_GENERATION, "Thunderbolt");
  const field = new Field();
  const result: Result = calculate(gen, attacker, defender, move, field);
  const [min, max] = result.range();
  return { range: { min, max }, desc: result.desc() };
}
