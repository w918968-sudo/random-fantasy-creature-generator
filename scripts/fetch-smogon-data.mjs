#!/usr/bin/env node
/**
 * Extract Gen 9 (Scarlet/Violet) battle data into static JSON for the app.
 *
 * Sources (both MIT-licensed, recorded in data-sources.md):
 *   - type chart  : @smogon/calc TYPE_CHART[9]  (direct multipliers)
 *   - moves       : @pkmn/dex Dex.forGen(9).data.Moves
 *   - learnsets   : @pkmn/dex learnsets (mapped to species.json via toID)
 *
 * Outputs (committed, version-controlled per PRD §20.1):
 *   - src/data/type-chart.json
 *   - src/data/moves.json
 *   - src/data/learnsets.json
 *
 * Idempotent. Run after upgrading either data dependency.
 */
import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { TYPE_CHART } from "@smogon/calc";
import { Dex, toID } from "@pkmn/dex";
import pkgCalc from "@smogon/calc/package.json" with { type: "json" };
import pkgDex from "@pkmn/dex/package.json" with { type: "json" };

const root = process.cwd();

const TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting",
  "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost",
  "Dragon", "Dark", "Steel", "Fairy",
];

// 1. Type chart — attack type -> defense type -> multiplier (0/0.5/1/2).
const tc9 = TYPE_CHART[9];
const chart = {};
for (const atk of TYPES) {
  chart[atk] = {};
  for (const def of TYPES) {
    const mult = tc9[atk]?.[def];
    if (typeof mult !== "number") {
      throw new Error(`missing type chart entry ${atk} -> ${def}`);
    }
    chart[atk][def] = mult;
  }
}
writeFileSync(path.join(root, "src", "data", "type-chart.json"), JSON.stringify(chart));

// 2. Moves — id -> { name, type, power, accuracy, category }.
const gen = Dex.forGen(9);
const moves = {};
for (const [id, m] of Object.entries(gen.data.Moves)) {
  moves[id] = {
    name: m.name,
    type: m.type,
    power: m.basePower ?? 0,
    accuracy: typeof m.accuracy === "number" ? m.accuracy : null,
    category: m.category, // "Physical" | "Special" | "Status"
  };
}
writeFileSync(path.join(root, "src", "data", "moves.json"), JSON.stringify(moves));

// 3. Learnsets — speciesId -> move ids (only species present in species.json).
const species = JSON.parse(readFileSync(path.join(root, "src", "data", "species.json"), "utf8"));
const learnsets = {};
let totalMoves = 0;
for (const s of species) {
  const learnset = await gen.learnsets.getByID(toID(s.speciesId));
  learnsets[s.speciesId] = learnset.exists
    ? Object.keys(learnset.learnset).filter((mid) => mid in moves)
    : [];
  totalMoves += learnsets[s.speciesId].length;
}
writeFileSync(path.join(root, "src", "data", "learnsets.json"), JSON.stringify(learnsets));

console.log(
  `✓ type-chart.json: ${TYPES.length}×${TYPES.length} (gen 9)\n` +
    `✓ moves.json: ${Object.keys(moves).length} moves\n` +
    `✓ learnsets.json: ${species.length} species, ${totalMoves} move entries`,
);
console.log(`  sources: @smogon/calc ${pkgCalc.version} (MIT), @pkmn/dex ${pkgDex.version} (MIT)`);
