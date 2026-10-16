# Data Sources & License Audit

> Required by the product spec (§4, §13, §23). A source's open-source **code**
> license does NOT automatically cover Pokémon characters, names, game data, or
> images. Each row below must be verified before that data/asset may ship to
> production. Credits pages and "unofficial fan tool" disclaimers are not a
> substitute for a license.

Status legend: ✅ verified for production · ⚠️ partially verified · ❌ not verified / blocked · 🔄 pending review

## Damage calculation engine

| ID | Type | Source | Version / Commit | License | Browser-build verified | Reviewed |
|----|------|--------|------------------|---------|------------------------|----------|
| `calc-engine` | @smogon/calc | https://github.com/smogon/damage-calc | **0.12.0** (npm) | MIT (confirmed in package.json) | ✅ (Next 16 static export build passes) | 2026-10-17 |

## Runtime data (species, forms, moves, types, abilities)

| ID | Type | Source | Version / Commit | License | Commercial / redistribution verified | Reviewed |
|----|------|--------|------------------|---------|--------------------------------------|----------|
| `species-metadata` | species, stats, abilities, types, evolution | PokéAPI | 🔄 VERIFY | Repo: BSD-3-Clause — does **not** cover Pokémon IP | ❌ | — |
| `sv-moves-legality` | Scarlet/Violet learnsets & legality | Smogon / Pokémon Showdown data | 🔄 VERIFY (pin commit) | 🔄 VERIFY | ❌ | — |

## Images / sprites

| ID | Type | Source | Version / Commit | License | Commercial use verified | Reviewed |
|----|------|--------|------------------|---------|------------------------|----------|
| `sprites-normal` | normal artwork/sprites | PokeAPI sprites repo | 🔄 VERIFY | Repo license does **not** cover images; some are official art (© The Pokémon Company), some community-made | ❌ | — |
| `sprites-shiny` | shiny sprites | PokeAPI sprites repo | 🔄 VERIFY | Same as above; some shiny images are community-made | ❌ | — |
| `official-artwork` | large official promo art | — | — | **BLOCKED** — Pokémon Support (2026-01-30) directs not to use its IP | ❌ (use placeholders) | — |

## Blocked / not-for-production

- **All Pokémon character images** remain ❌ until a real license/authorization is
  confirmed. Until then the UI uses clearly-marked placeholders, and this is
  reported to the project owner as a launch blocker (§17.1).

## Schema for `asset-manifest.json`

Each entry: `{ "id", "type", "sourceUrl", "sourceProject", "version", "license",
"commercialVerified", "redistributionAllowed", "attribution", "reviewedBy",
"reviewedAt", "usedBy" }`. Missing-verification assets must stay out of the
production build.
