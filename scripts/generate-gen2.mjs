#!/usr/bin/env node
/**
 * Generate 2nd-gen (evolved) artwork for every published creature via
 * image-to-image: each 1st-gen source PNG in `assets/creatures-source/` is fed
 * back into Seedream 5.0 Pro as the `image` reference with an evolution prompt.
 *
 * Output is written to `assets/creatures-gen2-source/<id>-gen2.png` (local-only,
 * gitignored — mirroring the 1st-gen `assets/creatures-source/`). The site is
 * NOT touched until the WebP optimization + catalog stamping steps run later.
 *
 * Usage:
 *   node scripts/generate-gen2.mjs              # every published creature
 *   node scripts/generate-gen2.mjs --pilot      # one creature per element (6)
 *   node scripts/generate-gen2.mjs --limit 12   # first 12 published creatures
 *
 * Continues past per-creature failures; exits non-zero if any failed.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  ROOT,
  loadArkApiKey,
  generateImage,
  buildEvolutionPrompt,
} from "./lib/generate.mjs";

const apiKey = loadArkApiKey();
const size = "1024x1280";

const args = process.argv.slice(2);
const pilot = args.includes("--pilot");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;

const creatures = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/creatures.json"), "utf8"),
).filter((c) => c.status === "published");

let targets = creatures;
if (pilot) {
  // One creature per element (first published occurrence) so the pilot covers
  // the full element spread for a representative lineage-quality check.
  const seen = new Set();
  targets = [];
  for (const c of creatures) {
    if (!seen.has(c.element)) {
      seen.add(c.element);
      targets.push(c);
    }
  }
}
if (Number.isFinite(limit)) targets = targets.slice(0, limit);

const outDir = resolve(ROOT, "assets", "creatures-gen2-source");
mkdirSync(outDir, { recursive: true });

console.log(`Generating 2nd-gen art for ${targets.length} creature(s) at ${size}…`);

let done = 0;
const failures = [];
for (const [index, creature] of targets.entries()) {
  const src = resolve(ROOT, "assets", "creatures-source", `${creature.id}.png`);
  if (!existsSync(src)) {
    console.log(`[${index + 1}/${targets.length}] ${creature.id}… SKIP (no 1st-gen source PNG)`);
    failures.push(`${creature.id} (no source)`);
    continue;
  }
  const outPath = resolve(outDir, `${creature.id}-gen2.png`);
  if (existsSync(outPath)) {
    console.log(`[${index + 1}/${targets.length}] ${creature.id}… SKIP (already generated)`);
    done++;
    continue;
  }
  const image = `data:image/png;base64,${readFileSync(src).toString("base64")}`;

  process.stdout.write(`[${index + 1}/${targets.length}] ${creature.id} (${creature.element})… `);
  try {
    const b64 = await generateImage(apiKey, {
      creature,
      size,
      image,
      prompt: buildEvolutionPrompt(creature),
    });
    writeFileSync(outPath, Buffer.from(b64, "base64"));
    console.log("ok");
    done++;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
    failures.push(creature.id);
  }
}

console.log(`\nDone: ${done}/${targets.length} generated -> ${outDir}`);
if (failures.length) {
  console.log("Failed:", failures.join(", "));
  process.exit(1);
}
