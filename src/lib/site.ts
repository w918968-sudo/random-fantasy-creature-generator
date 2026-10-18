/**
 * Single source of truth for site-level branding, SEO, and URLs.
 */

export const SITE_NAME = "Random Pokémon Generator";

export const SITE_DESCRIPTION =
  "Generate a single Pokémon, a group, or a full team with generation and type filters, shiny mode, lock & reroll, team analysis, and a Scarlet/Violet damage calculator.";

/**
 * Production canonical origin.
 *
 * Domain purchased 2026-10-17 (Tencent Cloud registrar).
 * DNS is currently managed at Tencent Cloud (DNSPod); when the site is
 * deployed to Cloudflare Pages, the domain is pointed at Pages via CNAME (or
 * the nameservers are moved to Cloudflare) — see data-sources.md.
 */
export const SITE_URL = "https://randompokemongenerator.games";
