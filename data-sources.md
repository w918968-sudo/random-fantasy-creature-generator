# Data sources, licenses & pending items

Internal record for the Random Pokémon Generator. Updated as licenses and
production values are confirmed. **Do not fabricate** sources, licenses, or
production values — anything unconfirmed is marked `VERIFY` / `TODO`.

## Bundled data

| Data | Source | License / status |
| --- | --- | --- |
| Species base data (`src/data/species.json`) | [PokéAPI](https://pokeapi.co) via `scripts/fetch-pokeapi.mjs` | Pokémon game data — third-party IP (Nintendo / The Pokémon Company). Used for a non-commercial fan tool; license status under review. |
| Type chart, moves, learnsets (`src/data/*.json`) | [@pkmn/dex](https://www.npmjs.com/package/@pkmn/dex) v0.10.11, data derived from Pokémon Showdown | Library: MIT (verified from `package.json`). The underlying Pokémon data is third-party IP. |

## Runtime dependencies

| Package | Version | License |
| --- | --- | --- |
| [@smogon/calc](https://www.npmjs.com/package/@smogon/calc) | 0.12.0 | MIT (verified from `package.json`) |
| next / react / react-dom | 16.4.2 / 19.3.0 | MIT |
| tailwindcss | ^4 | MIT |

## Images

- **Status: placeholders only.** Official Pokémon promotional art is a launch
  **blocker**: Pokémon Support (2026-01-30) directs against using its IP without
  authorization. "It's on the internet" or "it's in the repo" does not equal a
  license.
- `hasShinyAsset` is `false` for every species, so **Shiny Only** correctly
  returns an empty pool rather than silently falling back to the normal image.

## TODO / VERIFY (user-provided values required)

- [x] `SITE_URL` — `https://randompokemongenerator.games` (purchased
      2026-10-17, Tencent Cloud registrar). Set in `src/lib/site.ts`.
- [x] `NEXT_PUBLIC_GA4_ID` — `G-QXM8XHH33P` (GA4 property created 2026-10-17).
      Set in `.env.local` for local dev; also set in Cloudflare Pages env for
      production (not committed).
- [x] Search Console — verified 2026-10-17 via **domain property** (DNS TXT
      record at Tencent Cloud DNSPod). No meta tag is needed, so
      `GSC_VERIFICATION` stays intentionally empty/unset.
- [x] Privacy contact — `w918968@gmail.com` set on the Privacy page
      (2026-10-17).
- [ ] Image licensing — obtain or confirm a license before swapping any
      placeholder for real Pokémon artwork.
- [ ] `includeForms` — official non-base form data is not yet bundled, so the
      "include forms" advanced filter is inert.
