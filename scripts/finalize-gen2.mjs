#!/usr/bin/env node
/**
 * Finalize the 2nd-gen rollout after the image batch has run:
 *
 *   1. Sets `generation: 1` on the existing (1st-gen) records.
 *   2. For every published 1st-gen creature with a generated
 *      `assets/creatures-gen2-source/<id>-gen2.png`, converts it to a WebP in
 *      `public/creatures/<gen2-id>.webp` (quality 82, matching
 *      optimize-images.mjs) and appends the derived 2nd-gen record with its
 *      `image` path stamped.
 *   3. Writes the combined catalog back to `src/data/creatures.json`.
 *
 * Gen-2 records whose source PNG is missing (e.g. a generation that failed)
 * are skipped rather than published as a broken page; re-run generate-gen2.mjs
 * to fill gaps and re-run this script. Idempotent.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./lib/generate.mjs";
import { titleFor, buildGen2 } from "./lib/gen2.mjs";

const dataPath = path.join(ROOT, "src/data/creatures.json");
const srcDir = path.join(ROOT, "assets", "creatures-gen2-source");
const publicDir = path.join(ROOT, "public", "creatures");

const creatures = JSON.parse(readFileSync(dataPath, "utf8"));
const gen1 = creatures.filter((c) => (c.generation ?? 1) === 1);
for (const c of gen1) c.generation = 1;

const gen2 = [];
const missing = [];
for (const c of gen1) {
  if (c.status !== "published") continue;
  const title = titleFor(c.id);
  const record = buildGen2(c, title);
  const srcPng = path.join(srcDir, `${c.id}-gen2.png`);
  if (!existsSync(srcPng)) {
    missing.push(c.id);
    continue;
  }
  const outWebp = path.join(publicDir, `${record.id}.webp`);
  await sharp(srcPng).webp({ quality: 82 }).toFile(outWebp);
  record.image = `/creatures/${record.id}.webp`;
  gen2.push(record);
}

const out = [...gen1, ...gen2];
writeFileSync(dataPath, JSON.stringify(out, null, 2) + "\n");

console.log(`✓ stamped ${gen2.length} gen-2 records with WebP images`);
if (missing.length) {
  console.log(`⚠ missing source PNGs (skipped ${missing.length}): ${missing.join(", ")}`);
}
console.log(`✓ wrote ${out.length} total records (${gen1.length} first-gen + ${gen2.length} second-gen)`);
