# Random Pokémon Generator

A bright, playful single-page tool to generate random Pokémon — single, groups,
or full teams — with filters, shiny mode, lock/reroll, and a Scarlet/Violet
(gen 9) team damage calculator.

> **Status:** Phase A (project & dependency review) scaffold. The generator UI
> and data layer are implemented in later phases. Pokémon character images are
> **not** yet licensed for production — see [data-sources.md](data-sources.md).

## Stack

- Next.js 16 (App Router) + TypeScript, static export (`output: "export"`)
- Tailwind CSS 4
- Vitest + Testing Library
- `@smogon/calc` 0.12.0 (MIT) for gen 9 damage math, behind an adapter in
  `src/lib/damage/`
- Hosting: Cloudflare Pages (static `out/`)

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
| `npm test` | Vitest (unit + damage-calc benchmark) |
| `npm run validate:data` | Data & license manifest validation |
| `npm run build` | Production build → static `out/` |

## Data & assets

Runtime data lives in local structured files (not per-click external APIs).
Every source and asset must be recorded and license-verified in
[`data-sources.md`](data-sources.md) + [`asset-manifest.json`](asset-manifest.json)
before it can ship. Unlicensed Pokémon images are **placeholders only** and a
launch blocker until resolved.

## Deploy

Static export to Cloudflare Pages: build command `npm run build`, output
directory `out`. See CI in `.github/workflows/ci.yml` for the quality gate
(lint → typecheck → test → validate:data → build → verify `out/index.html`).

## License / IP

This is an unofficial, non-affiliated fan tool. Pokémon and all related names,
designs, and images are the property of their respective owners. A disclaimer
is not a substitute for the necessary licenses — see `data-sources.md` and the
project's launch blockers.
