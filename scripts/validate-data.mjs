#!/usr/bin/env node
/**
 * Creature catalog validation.
 *
 * Enforces the creatures.json schema: unique kebab-case ids, required text
 * fields, 2–3 traits, valid elements, and — when `image` is set — that the
 * image file actually exists under `public/`.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

const VALID_ELEMENTS = new Set(["Ember", "Tide", "Grove", "Storm", "Crystal", "Dusk"]);
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let failed = false;
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  failed = true;
};

const creaturesPath = path.join(root, "src", "data", "creatures.json");
if (!existsSync(creaturesPath)) {
  fail("src/data/creatures.json is missing");
} else {
  let creatures;
  try {
    creatures = JSON.parse(readFileSync(creaturesPath, "utf8"));
  } catch {
    fail("src/data/creatures.json is not valid JSON");
    creatures = null;
  }

  if (creatures !== null) {
    if (!Array.isArray(creatures) || creatures.length === 0) {
      fail("src/data/creatures.json must be a non-empty array");
    } else {
      const seen = new Set();
      for (const c of creatures) {
        const id = c?.id ?? "<missing id>";
        if (seen.has(id)) fail(`duplicate creature id '${id}'`);
        seen.add(id);

        if (typeof id !== "string" || !ID_PATTERN.test(id)) {
          fail(`creature has invalid id '${id}' (must be kebab-case)`);
        }
        for (const field of ["name", "description"]) {
          if (typeof c?.[field] !== "string" || c[field].trim() === "") {
            fail(`creature '${id}' is missing '${field}'`);
          }
        }
        if (!Array.isArray(c?.traits) || c.traits.length < 2 || c.traits.length > 3) {
          fail(`creature '${id}' must have 2–3 traits`);
        } else {
          for (const t of c.traits) {
            if (typeof t !== "string" || t.trim() === "") {
              fail(`creature '${id}' has an empty trait`);
            }
          }
        }
        if (!VALID_ELEMENTS.has(c?.element)) {
          fail(`creature '${id}' has invalid element '${c?.element}'`);
        }
        if (c?.image != null) {
          if (typeof c.image !== "string" || !c.image.startsWith("/")) {
            fail(`creature '${id}' has invalid image path '${c.image}'`);
          } else if (!existsSync(path.join(root, "public", c.image.replace(/^\//, "")))) {
            fail(`creature '${id}' image '${c.image}' does not exist under public/`);
          }
        }
      }
      console.log(`✓ creatures.json: ${creatures.length} creatures validated`);
    }
  }
}

if (failed) {
  console.error("Creature catalog validation FAILED");
  process.exit(1);
}
console.log("✓ Creature catalog validation passed");
