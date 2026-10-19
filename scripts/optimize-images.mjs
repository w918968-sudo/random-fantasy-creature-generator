#!/usr/bin/env node
/**
 * Optimize creature artwork for the web.
 *
 * Converts each PNG under public/creatures/ to a WebP of the same dimensions
 * (quality ~82), moves the original PNG to assets/creatures-source/ as the
 * high-quality source file, and rewrites the creature's `image` path to the
 * `.webp` file. `assets/` is not served (only `public/` is copied to `out/`).
 *
 * Idempotent: records already pointing at a `.webp` are skipped.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const dataPath = path.join(root, "src", "data", "creatures.json");
const publicDir = path.join(root, "public", "creatures");
const sourceDir = path.join(root, "assets", "creatures-source");

const creatures = JSON.parse(readFileSync(dataPath, "utf8"));
mkdirSync(sourceDir, { recursive: true });

async function convertOne(c) {
  if (!c.image || !c.image.endsWith(".png")) return { c, converted: false, reason: "already webp or no image" };
  const id = c.id;
  const srcPng = path.join(publicDir, `${id}.png`);
  const outWebp = path.join(publicDir, `${id}.webp`);
  if (!existsSync(srcPng)) return { c, converted: false, reason: `missing source ${srcPng}` };

  await sharp(srcPng).webp({ quality: 82 }).toFile(outWebp);
  renameSync(srcPng, path.join(sourceDir, `${id}.png`));
  c.image = `/creatures/${id}.webp`;
  return { c, converted: true, reason: null };
}

const pool = async (items, limit, fn) => {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
};

const results = await pool(creatures, 8, convertOne);
const converted = results.filter((r) => r.converted);
const skipped = results.filter((r) => !r.converted);

writeFileSync(dataPath, JSON.stringify(creatures, null, 2) + "\n");

console.log(`✓ converted ${converted.length} PNG → WebP`);
for (const r of skipped) console.log(`  – skipped ${r.c.id ?? "?"}: ${r.reason}`);
console.log(`✓ source PNGs moved to ${path.relative(root, sourceDir)}/`);
