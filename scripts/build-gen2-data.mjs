#!/usr/bin/env node
/**
 * Derive the 2nd-gen (evolved) catalog records from the 1st-gen roster.
 *
 * Naming uses a per-generation "title ladder" (settled with the user): the
 * base name is preserved and a generation-2 title suffix is appended, rotated
 * deterministically via FNV-1a over the base id so the mapping is stable.
 * Gen 2 pool (mature tier): Elder / Ancient / Grand / Noble / Prime /
 * Venerable / Regal / Sage. Higher-tier words (Ascendant/Sovereign/Mythic/
 * Exalted/…) are RESERVED for gen 3+, never used here.
 *
 * Each gen-2 record inherits element/personality/habitat/rarity/status from
 * its 1st-gen form, carries `generation: 2`, and derives an "evolved"
 * description + lightly intensified traits. `image` is left null until the
 * image pipeline (generate-gen2.mjs → WebP → stamp) fills it in.
 *
 * Usage:
 *   node scripts/build-gen2-data.mjs           # dry run: print samples + stats
 *   node scripts/build-gen2-data.mjs --write   # mutate src/data/creatures.json
 *
 * Idempotent: gen-1 records get `generation: 1` only if missing; a gen-2
 * record is created only if its derived id is not already present.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT } from "./lib/generate.mjs";
import { titleFor, buildGen2 } from "./lib/gen2.mjs";

const dataPath = resolve(ROOT, "src/data/creatures.json");
const creatures = JSON.parse(readFileSync(dataPath, "utf8"));
const write = process.argv.includes("--write");

const gen1 = creatures.filter((c) => (c.generation ?? 1) === 1);
const existingGen2 = new Set(
  creatures.filter((c) => c.generation === 2).map((c) => c.id),
);

const gen2 = [];
const titleCounts = new Map();
for (const c of gen1) {
  if (c.status !== "published") continue;
  const title = titleFor(c.id);
  titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  const record = buildGen2(c, title);
  if (existingGen2.has(record.id)) continue;
  gen2.push(record);
}

// --- Dry-run report ---------------------------------------------------------
const pilotIds = ["emberwhisk", "glimmerfin", "mossback", "stormling", "aurathorn", "duskveil"];
console.log("Gen-2 title ladder — 6 pilot samples (one per element):\n");
for (const pid of pilotIds) {
  const c = gen1.find((x) => x.id === pid);
  if (!c) continue;
  const r = buildGen2(c, titleFor(pid));
  console.log(`  ${r.name}  (${r.element})`);
  console.log(`    id: ${r.id}`);
  console.log(`    ${r.description}`);
  console.log(`    traits: ${r.traits.join(" | ")}`);
  console.log("");
}

console.log("Stats:");
console.log(`  1st-gen records: ${gen1.length}`);
console.log(`  2nd-gen records to add: ${gen2.length} (already present: ${existingGen2.size})`);
console.log(`  final roster: ${creatures.length + gen2.length}`);
console.log("  title distribution:");
for (const [t, n] of [...titleCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`    ${t.padEnd(10)} ${n}`);
}

if (!write) {
  console.log("\n(dry run — pass --write to mutate src/data/creatures.json)");
  process.exit(0);
}

// --- Write ------------------------------------------------------------------
for (const c of gen1) c.generation = 1;
const out = [...gen1, ...gen2];
writeFileSync(dataPath, JSON.stringify(out, null, 2) + "\n");
console.log(`\n✓ wrote ${out.length} records to src/data/creatures.json`);
