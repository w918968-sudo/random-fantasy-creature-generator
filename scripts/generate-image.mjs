#!/usr/bin/env node
/**
 * Generate a creature image via Volcano Ark (火山方舟) Seedream 5.0 Pro.
 *
 * Usage:
 *   node scripts/generate-image.mjs <creature-id> [size]
 *   node scripts/generate-image.mjs emberwhisk 1K
 *
 * Reads ARK_API_KEY from .env.local (never committed). Saves the PNG to
 * public/creatures/<id>.png and prints the saved path.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  ROOT,
  loadArkApiKey,
  generateImage,
  buildPrompt,
} from "./lib/generate.mjs";

const apiKey = loadArkApiKey();

const creatures = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/creatures.json"), "utf8"),
);

// Parse `node scripts/generate-image.mjs <id> [size] [--description "…"]`.
const args = process.argv.slice(2);
let id;
let sizeArg;
let descOverride;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--description") {
    descOverride = args[++i];
  } else if (!id) {
    id = a;
  } else if (!sizeArg) {
    sizeArg = a;
  }
}

if (!id) {
  console.error(
    'Usage: node scripts/generate-image.mjs <creature-id> [size] [--description "…"]',
  );
  console.error(
    "Creature ids:",
    creatures.map((c) => c.id).join(", "),
  );
  process.exit(1);
}

const creature = creatures.find((c) => c.id === id);
if (!creature) {
  console.error(`Unknown creature id: ${id}`);
  process.exit(1);
}

// Card artwork frame is portrait `aspect-[4/5]` (CreatureCard → CreatureImage,
// `object-cover`), so the default is an explicit 4:5 size. Pass e.g. "1280x1600"
// for higher resolution; keep the 4:5 ratio so the frame doesn't crop it.
const size = sizeArg || "1024x1280";
const description = descOverride || creature.description;

console.log(`Generating ${creature.name} (${size})…`);
console.log(`Prompt: ${buildPrompt(creature, description)}`);

const b64 = await generateImage(apiKey, { creature, description, size });

const outDir = resolve(ROOT, "public/creatures");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, `${id}.png`);
writeFileSync(outPath, Buffer.from(b64, "base64"));
console.log(`Saved -> public/creatures/${id}.png`);
