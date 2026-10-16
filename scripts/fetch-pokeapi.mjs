#!/usr/bin/env node
/**
 * Download & normalize species data from PokéAPI into src/data/species.json.
 *
 * Reproducible: raw responses are cached under .cache/pokeapi (gitignored), so
 * re-runs are deterministic. This is a dev/build-time step only — the runtime
 * website reads the local JSON and never calls PokéAPI.
 *
 * Usage:
 *   node scripts/fetch-pokeapi.mjs        # all species
 *   node scripts/fetch-pokeapi.mjs 50     # first 50 species (smoke test)
 *
 * License note: PokéAPI's repo is BSD-3-Clause for code, but the Pokémon names,
 * game data and images it redistributes are NOT covered by that license. See
 * data-sources.md.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const BASE = "https://pokeapi.co/api/v2";
const CACHE = path.join(process.cwd(), ".cache", "pokeapi");
const OUT = path.join(process.cwd(), "src", "data", "species.json");
const CONCURRENCY = 10;
const LIMIT = Number(process.argv[2]) || Infinity;

mkdirSync(CACHE, { recursive: true });

async function fetchJson(url, { retries = 4 } = {}) {
  const key = encodeURIComponent(url.replace(BASE + "/", "")) + ".json";
  const cacheFile = path.join(CACHE, key);
  if (existsSync(cacheFile)) {
    return JSON.parse(readFileSync(cacheFile, "utf8"));
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "random-pokemon-generator-dev" },
      });
      if (res.status === 404) {
        writeFileSync(cacheFile, "null");
        return null;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const data = await res.json();
      writeFileSync(cacheFile, JSON.stringify(data));
      return data;
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length || 1) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const formatAbility = (name) => name.split("-").map(capitalize).join(" ");

function genNumber(genUrl) {
  const m = /\/generation\/(\d+)\//.exec(genUrl ?? "");
  return m ? Number(m[1]) : null;
}

function computeEvolution(chain, targetName) {
  if (!chain?.chain) return { stage: 1, isFinal: true, evolvesTo: [] };
  const walk = (node, depth) => {
    if (node.species.name === targetName) {
      return {
        stage: depth,
        isFinal: node.evolves_to.length === 0,
        evolvesTo: node.evolves_to.map((c) => c.species.name),
      };
    }
    for (const child of node.evolves_to) {
      const found = walk(child, depth + 1);
      if (found) return found;
    }
    return null;
  };
  return walk(chain.chain, 1) ?? { stage: 1, isFinal: true, evolvesTo: [] };
}

const STAT_KEY = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "specialAttack",
  "special-defense": "specialDefense",
  speed: "speed",
};

async function main() {
  const listRes = await fetchJson(`${BASE}/pokemon-species?limit=10000`);
  const allSpecies = listRes.results;
  const speciesList = Number.isFinite(LIMIT) ? allSpecies.slice(0, LIMIT) : allSpecies;

  console.log(`Fetching ${speciesList.length} species details...`);
  const speciesDetails = await mapLimit(speciesList, CONCURRENCY, (s) =>
    fetchJson(s.url),
  );

  const chainUrls = new Set();
  for (const d of speciesDetails) {
    if (d?.evolution_chain?.url) chainUrls.add(d.evolution_chain.url);
  }
  console.log(`Fetching ${chainUrls.size} evolution chains...`);
  const chainMap = new Map();
  await mapLimit([...chainUrls], CONCURRENCY, async (url) => {
    chainMap.set(url, await fetchJson(url));
  });

  console.log(`Fetching default-form pokemon details...`);
  const rows = [];
  const combined = await mapLimit(speciesDetails, CONCURRENCY, async (d) => {
    if (!d) return null;
    const defaultVariety =
      d.varieties?.find((v) => v.is_default) ?? d.varieties?.[0];
    const pokemonName = defaultVariety?.pokemon?.name ?? d.name;
    const pd = await fetchJson(`${BASE}/pokemon/${pokemonName}`);
    return { species: d, pokemon: pd };
  });

  for (const { species: d, pokemon: pd } of combined) {
    if (!d || !pd) continue;

    const baseStats = {};
    for (const st of pd.stats) {
      baseStats[STAT_KEY[st.stat.name]] = st.base_stat;
    }
    const abilities = { regular: [], hidden: [] };
    for (const ab of pd.abilities) {
      const name = formatAbility(ab.ability.name);
      if (ab.is_hidden) abilities.hidden.push(name);
      else abilities.regular.push(name);
    }
    const stageInfo = computeEvolution(
      d.evolution_chain?.url ? chainMap.get(d.evolution_chain.url) : null,
      d.name,
    );
    const englishName =
      d.names?.find((n) => n.language.name === "en")?.name ?? capitalize(d.name);

    rows.push({
      speciesId: d.name,
      formId: null,
      name: englishName,
      category: d.genera?.find((g) => g.language.name === "en")?.genus ?? null,
      nationalDexNumber: d.id,
      generation: genNumber(d.generation?.url),
      formName: null,
      isDefaultForm: true,
      types: pd.types.map((t) => capitalize(t.type.name)),
      isLegendary: !!d.is_legendary,
      isMythical: !!d.is_mythical,
      evolutionStage: stageInfo.stage,
      isFinalEvolution: stageInfo.isFinal,
      evolvesFrom: d.evolves_from_species?.name ?? null,
      evolvesTo: stageInfo.evolvesTo,
      abilities,
      baseStats,
      heightM: pd.height / 10,
      weightKg: pd.weight / 10,
      hasShinyAsset: false,
      scarletVioletSupported: false,
      sourceRecordId: `pokeapi:species:${d.id}`,
    });
  }

  rows.sort((a, b) => a.nationalDexNumber - b.nationalDexNumber);
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(rows, null, 2));
  console.log(`Wrote ${rows.length} species to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
