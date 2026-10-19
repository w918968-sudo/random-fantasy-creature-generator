#!/usr/bin/env node
/**
 * Regenerate asset-manifest.json as a per-creature asset record (requirements
 * §5.3): served WebP, high-quality PNG source, generation tool/model, and the
 * shared prompt convention. Re-run after adding/regenerating creatures.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const creatures = JSON.parse(
  readFileSync(path.join(root, "src", "data", "creatures.json"), "utf8"),
);

const manifest = {
  generated: "2026-10-19",
  artwork: {
    tool: "Volcano Ark (Seedream)",
    model: "doubao-seedream-5-0-pro-260628",
    region: "ark.cn-beijing.volces.com",
    license: "original AI-generated from original prompts (see data-sources.md)",
    promptConvention:
      "each image prompt is built from the creature's own name, description, element, and personality plus a shared soft-anime style suffix",
    servedFormat: "webp — public/creatures/<id>.webp",
    sourceFormat: "png — assets/creatures-source/<id>.png (not served)",
  },
  creatures: creatures.map((c) => ({
    id: c.id,
    name: c.name,
    image: c.image,
    source: c.image ? c.image.replace("/creatures/", "assets/creatures-source/").replace(/\.webp$/, ".png") : null,
    element: c.element,
    personality: c.personality,
    status: c.status,
    generated: "2026-10-19",
  })),
};

writeFileSync(
  path.join(root, "asset-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(`✓ asset-manifest.json: ${manifest.creatures.length} creature records`);
