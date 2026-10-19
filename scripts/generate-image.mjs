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
 *
 * Model: doubao-seedream-5-0-pro-260628 (locked). Endpoint: domestic region.
 * NOTE: the returned image URL (response_format "url") expires in 24h, so we
 * request b64_json and write the bytes to disk immediately.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const API_KEY = loadEnv(resolve(ROOT, ".env.local")).ARK_API_KEY;
if (!API_KEY) {
  console.error("Missing ARK_API_KEY in .env.local");
  process.exit(1);
}

const ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const MODEL = "doubao-seedream-5-0-pro-260628";

// Style suffix shared by every prompt so the set reads as one cohesive art
// direction. Tune here once; every creature inherits it.
const STYLE =
  "cute original fantasy creature illustration, soft anime style, dreamy pastel color palette, gentle lighting, centered full-body composition, clean simple background, high quality, no text, no watermark, no signature";

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
const prompt = [
  `Cute original fantasy creature, ${description}`,
  `Element: ${creature.element}.`,
  `Personality: ${creature.personality}.`,
  STYLE,
].join(" ");

console.log(`Generating ${creature.name} (${size})…`);
console.log(`Prompt: ${prompt}`);

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: MODEL,
    prompt,
    size,
    output_format: "png",
    response_format: "b64_json",
    watermark: false,
  }),
});

const body = await res.json();
if (!res.ok) {
  console.error(`API error ${res.status}:`, JSON.stringify(body, null, 2));
  process.exit(1);
}

const b64 = body.data?.[0]?.b64_json;
if (!b64) {
  console.error("No b64_json in response:", JSON.stringify(body, null, 2));
  process.exit(1);
}

const outDir = resolve(ROOT, "public/creatures");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, `${id}.png`);
writeFileSync(outPath, Buffer.from(b64, "base64"));
console.log(`Saved -> public/creatures/${id}.png`);
