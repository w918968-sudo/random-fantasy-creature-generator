#!/usr/bin/env node
/**
 * Trial: generate one creature in 3 art-style variants for the user to compare.
 * Outputs do NOT overwrite the live image; saved as <id>-<style>.png.
 *
 * Usage: node scripts/generate-style-variants.mjs [creature-id]
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

const creatures = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/creatures.json"), "utf8"),
);

const id = process.argv[2] || "glimmerfin";
const creature = creatures.find((c) => c.id === id);
if (!creature) {
  console.error(`Unknown creature id: ${id}`);
  process.exit(1);
}

const SIZE = "1024x1280";
const SUFFIX =
  "centered full-body composition, clean simple background, no text, no watermark, no signature";

// Three candidate art directions to de-AI the default "soft anime" look.
const STYLES = {
  watercolor:
    "hand-drawn storybook illustration, soft watercolor texture, light ink outlines, muted pastel palette, gentle paper grain, warm gentle lighting",
  flat: "flat cel-shaded vector illustration, clean solid colors, minimal shading, crisp edges, bold graphic shapes, soft pastel palette",
  chunky:
    "chunky cartoon illustration, thick bold outlines, round squishy proportions, plush toy-like look, vibrant pastel colors, soft lighting",
};

const subject = `Cute original fantasy creature, ${creature.description} Element: ${creature.element}. Personality: ${creature.personality}.`;

for (const [name, style] of Object.entries(STYLES)) {
  const prompt = [subject, style, SUFFIX].join(" ");
  console.log(`\nGenerating ${creature.name} (${name})…\nPrompt: ${prompt}`);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      size: SIZE,
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
  const outPath = resolve(outDir, `${id}-${name}.png`);
  writeFileSync(outPath, Buffer.from(b64, "base64"));
  console.log(`Saved -> public/creatures/${id}-${name}.png`);
}
