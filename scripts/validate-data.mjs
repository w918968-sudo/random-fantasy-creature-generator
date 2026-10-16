#!/usr/bin/env node
/**
 * Data & license manifest validation.
 *
 * Grows in Phase B with species/form/move records, image-path existence checks,
 * and shiny-candidate checks. For now it enforces the asset/license manifest
 * schema and that the source audit doc is present. CI runs this on every PR.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const REQUIRED_ASSET_FIELDS = [
  "id",
  "type",
  "sourceUrl",
  "sourceProject",
  "version",
  "license",
  "commercialVerified",
  "redistributionAllowed",
  "attribution",
  "reviewedAt",
];

let failed = false;
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  failed = true;
};

// 1. asset-manifest.json must exist and be well-formed.
const manifestPath = path.join(root, "asset-manifest.json");
if (!existsSync(manifestPath)) {
  fail("asset-manifest.json is missing");
} else {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch {
    fail("asset-manifest.json is not valid JSON");
    manifest = null;
  }
  if (manifest) {
    if (!Array.isArray(manifest.assets)) {
      fail("asset-manifest.json must contain an 'assets' array");
    } else {
      for (const asset of manifest.assets) {
        for (const field of REQUIRED_ASSET_FIELDS) {
          if (
            !(field in asset) ||
            asset[field] === "" ||
            asset[field] === undefined ||
            asset[field] === null
          ) {
            fail(
              `asset '${asset.id ?? "<missing id>"}' is missing required field '${field}'`,
            );
          }
        }
      }
      for (const asset of manifest.assets) {
        if (asset.commercialVerified === false) {
          console.warn(`⚠ asset '${asset.id}' is not verified for production use`);
        }
      }
    }
  }
}

// 2. data-sources.md (source/license audit) must exist.
if (!existsSync(path.join(root, "data-sources.md"))) {
  fail("data-sources.md is missing");
}

// 3. species.json must be present, well-formed, and internally consistent:
//    no duplicate speciesId, no missing required fields, valid type/generation
//    values, complete base stats, and no dangling evolution references.
const VALID_TYPES = new Set([
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting",
  "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost",
  "Dragon", "Dark", "Steel", "Fairy",
]);
const STAT_KEYS = ["hp", "attack", "defense", "specialAttack", "specialDefense", "speed"];
const SPECIES_PATH = path.join(root, "src", "data", "species.json");

if (!existsSync(SPECIES_PATH)) {
  fail("src/data/species.json is missing — run `node scripts/fetch-pokeapi.mjs`");
} else {
  let species;
  try {
    species = JSON.parse(readFileSync(SPECIES_PATH, "utf8"));
  } catch {
    fail("src/data/species.json is not valid JSON");
    species = null;
  }
  if (species !== null) {
    if (!Array.isArray(species) || species.length === 0) {
      fail("src/data/species.json must be a non-empty array");
    } else {
      const seen = new Set();
      const allIds = new Set(species.map((s) => s && s.speciesId));
      for (const s of species) {
        const id = s?.speciesId ?? "<missing speciesId>";
        if (seen.has(id)) fail(`duplicate speciesId '${id}'`);
        seen.add(id);
        for (const field of ["speciesId", "name", "nationalDexNumber", "generation"]) {
          if (s[field] === undefined || s[field] === null || s[field] === "") {
            fail(`species '${id}' is missing required field '${field}'`);
          }
        }
        if (!Number.isInteger(s.nationalDexNumber) || s.nationalDexNumber < 1) {
          fail(`species '${id}' has invalid nationalDexNumber '${s.nationalDexNumber}'`);
        }
        if (!Number.isInteger(s.generation) || s.generation < 1 || s.generation > 9) {
          fail(`species '${id}' has invalid generation '${s.generation}'`);
        }
        if (!Array.isArray(s.types) || s.types.length === 0) {
          fail(`species '${id}' has no types`);
        } else {
          for (const t of s.types) {
            if (!VALID_TYPES.has(t)) fail(`species '${id}' has invalid type '${t}'`);
          }
        }
        if (!s.baseStats) {
          fail(`species '${id}' is missing baseStats`);
        } else {
          for (const key of STAT_KEYS) {
            if (typeof s.baseStats[key] !== "number" || s.baseStats[key] < 0) {
              fail(`species '${id}' has invalid base stat '${key}'`);
            }
          }
        }
        if (
          !s.abilities ||
          !Array.isArray(s.abilities.regular) ||
          !Array.isArray(s.abilities.hidden)
        ) {
          fail(`species '${id}' has invalid abilities`);
        }
        if (s.evolvesFrom && !allIds.has(s.evolvesFrom)) {
          fail(`species '${id}' references unknown evolvesFrom '${s.evolvesFrom}'`);
        }
        for (const to of s.evolvesTo ?? []) {
          if (!allIds.has(to)) fail(`species '${id}' references unknown evolvesTo '${to}'`);
        }
      }
      console.log(`✓ species.json: ${species.length} records validated`);
    }
  }
}

if (failed) {
  console.error("Data/license validation FAILED");
  process.exit(1);
}
console.log("✓ Data/license validation passed");
