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

// 4. Battle data files (generated by scripts/fetch-smogon-data.mjs) must be
//    present and cross-referenced: type chart is a complete 18×18 matrix of
//    valid multipliers; moves have valid fields; every learnset move id resolves
//    to a real move and every learnset key is a known species.
const VALID_MULTIPLIERS = new Set([0, 0.5, 1, 2]);
const VALID_CATEGORIES = new Set(["Physical", "Special", "Status"]);

const typeChartPath = path.join(root, "src", "data", "type-chart.json");
if (!existsSync(typeChartPath)) {
  fail("src/data/type-chart.json is missing — run `node scripts/fetch-smogon-data.mjs`");
} else {
  const chart = JSON.parse(readFileSync(typeChartPath, "utf8"));
  const chartTypes = Object.keys(chart);
  if (chartTypes.length !== 18) fail("type-chart.json must have 18 attacking types");
  for (const atk of chartTypes) {
    if (!VALID_TYPES.has(atk)) fail(`type-chart.json has invalid attacking type '${atk}'`);
    const row = chart[atk];
    if (!row || Object.keys(row).length !== 18) fail(`type-chart.json row '${atk}' incomplete`);
    for (const def of Object.keys(row)) {
      if (!VALID_TYPES.has(def)) fail(`type-chart.json row '${atk}' has invalid defending type '${def}'`);
      if (!VALID_MULTIPLIERS.has(row[def])) fail(`type-chart.json '${atk}->${def}' invalid multiplier '${row[def]}'`);
    }
  }
}

const movesPath = path.join(root, "src", "data", "moves.json");
const moveIds = new Set();
if (!existsSync(movesPath)) {
  fail("src/data/moves.json is missing — run `node scripts/fetch-smogon-data.mjs`");
} else {
  const moves = JSON.parse(readFileSync(movesPath, "utf8"));
  if (typeof moves !== "object" || moves === null || Object.keys(moves).length === 0) {
    fail("moves.json must be a non-empty object");
  } else {
    for (const [id, m] of Object.entries(moves)) {
      moveIds.add(id);
      if (!m || typeof m.name !== "string" || !VALID_TYPES.has(m.type)) {
        fail(`move '${id}' has invalid name/type`);
      }
      if (typeof m.power !== "number" || m.power < 0) fail(`move '${id}' has invalid power`);
      if (m.accuracy !== null && typeof m.accuracy !== "number") fail(`move '${id}' has invalid accuracy`);
      if (!VALID_CATEGORIES.has(m.category)) fail(`move '${id}' has invalid category '${m.category}'`);
    }
  }
}

const learnsetsPath = path.join(root, "src", "data", "learnsets.json");
if (!existsSync(learnsetsPath)) {
  fail("src/data/learnsets.json is missing — run `node scripts/fetch-smogon-data.mjs`");
} else {
  const learnsets = JSON.parse(readFileSync(learnsetsPath, "utf8"));
  if (typeof learnsets !== "object" || learnsets === null) {
    fail("learnsets.json must be an object keyed by speciesId");
  } else {
    const speciesIds = new Set(
      JSON.parse(readFileSync(path.join(root, "src", "data", "species.json"), "utf8")).map(
        (s) => s.speciesId,
      ),
    );
    let moveEntries = 0;
    for (const [speciesId, ids] of Object.entries(learnsets)) {
      if (!speciesIds.has(speciesId)) fail(`learnsets.json has unknown species '${speciesId}'`);
      if (!Array.isArray(ids)) fail(`learnsets.json '${speciesId}' must be an array`);
      else {
        for (const moveId of ids) {
          if (!moveIds.has(moveId)) fail(`learnsets.json '${speciesId}' references unknown move '${moveId}'`);
        }
        moveEntries += ids.length;
      }
    }
    console.log(`✓ battle data: ${Object.keys(learnsets).length} learnsets, ${moveEntries} move entries validated`);
  }
}

if (failed) {
  console.error("Data/license validation FAILED");
  process.exit(1);
}
console.log("✓ Data/license validation passed");
