#!/usr/bin/env node
/**
 * Generate artwork for every creature missing an image, then stamp the
 * `image` path back into `src/data/creatures.json`.
 *
 * Usage:
 *   node scripts/generate-all.mjs [size]
 *
 * Continues past per-creature failures so one bad generation doesn't block the
 * rest; exits non-zero if any creature failed.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, loadArkApiKey, generateImage } from "./lib/generate.mjs";

const apiKey = loadArkApiKey();
const size = process.argv[2] || "1024x1280";

const dataPath = resolve(ROOT, "src/data/creatures.json");
const creatures = JSON.parse(readFileSync(dataPath, "utf8"));

const pending = creatures.filter((c) => c.image == null);
if (pending.length === 0) {
  console.log("All creatures already have images.");
  process.exit(0);
}

console.log(`Generating ${pending.length} image(s) at ${size}…`);

const outDir = resolve(ROOT, "public/creatures");
mkdirSync(outDir, { recursive: true });

let done = 0;
const failures = [];
for (const [index, creature] of pending.entries()) {
  process.stdout.write(`[${index + 1}/${pending.length}] ${creature.id}… `);
  try {
    const b64 = await generateImage(apiKey, { creature, size });
    writeFileSync(resolve(outDir, `${creature.id}.png`), Buffer.from(b64, "base64"));
    creature.image = `/creatures/${creature.id}.png`;
    console.log("ok");
    done++;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
    failures.push(creature.id);
  }
}

// Stamp succeeded image paths back into the catalog.
writeFileSync(dataPath, JSON.stringify(creatures, null, 2) + "\n");

console.log(`\nDone: ${done}/${pending.length} generated.`);
if (failures.length) {
  console.log("Failed:", failures.join(", "));
  process.exit(1);
}
