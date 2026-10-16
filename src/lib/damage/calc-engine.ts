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
 */
import { Generations, Pokemon, Move, Field, calculate } from "@smogon/calc";
import type { Result } from "@smogon/calc";

/** Generation used for all Team Analysis / Damage Calculator rules. */
export const SV_GENERATION = 9;

export interface DamageRange {
  min: number;
  max: number;
}

export interface SmokeResult {
  range: DamageRange;
  desc: string;
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
