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

if (failed) {
  console.error("Data/license validation FAILED");
  process.exit(1);
}
console.log("✓ Data/license validation passed");
