# Random Fantasy Creature Generator

A bright, playful tool that generates original fantasy creatures — one at a
time — each with its own name, description, traits, element, and personality.
Filter by element and personality, save favorites, and share them.

All content (names, descriptions, traits, artwork) is original — no Pokémon or
other third-party IP.

## Stack

- Next.js 16 (App Router) + TypeScript, static export (`output: "export"`)
- Tailwind CSS 4
- Vitest + Testing Library
- Artwork: Volcano Ark (火山方舟) Seedream 5.0 Pro, generated from original
  prompts (`scripts/generate-image.mjs` / `scripts/generate-all.mjs`)
- Hosting: Cloudflare Workers Static Assets, deployed with `wrangler`

## Local development

```bash
nvm use              # Node 22 LTS (see .nvmrc)
npm ci
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types + `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run validate:data` | Creature catalog validation |
| `npm run generate:images` | Generate artwork for every image-less creature |
| `npm run build` | Production build → static `out/` |

## Data & assets

Runtime data lives in `src/data/creatures.json` (original, co-written). Artwork
is generated from original prompts and written to `public/creatures/`. Sources
and licenses are recorded in [`data-sources.md`](data-sources.md) +
[`asset-manifest.json`](asset-manifest.json).

## Deploy

Static export to Cloudflare Workers (Static Assets), live at
`https://randompokemongenerator.games`. Build `out/` then deploy with the CLI:

```bash
npm run build
npx wrangler deploy
```

Always deploy via the CLI — the Git-integrated Cloudflare build is not used
(it fails on OpenNext auto-detection).
