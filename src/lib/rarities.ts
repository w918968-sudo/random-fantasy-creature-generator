import { ALL_RARITIES, type Rarity } from "@/lib/types";

/** Rarity → URL slug (lowercase), e.g. "Legendary" → "legendary". */
export function raritySlug(rarity: Rarity): string {
  return rarity.toLowerCase();
}

/** Resolve a URL slug back to its rarity, or undefined for invalid slugs. */
export function getRarityBySlug(slug: string): Rarity | undefined {
  return ALL_RARITIES.find((r) => r.toLowerCase() === slug);
}

/** One-line SEO copy per rarity, used on the /rarities/[rarity] pages. */
export const RARITY_DESCRIPTIONS: Record<Rarity, string> = {
  Common:
    "Everyday companions you'll meet on any roll — friendly, familiar, and full of charm.",
  Uncommon:
    "Lesser-seen creatures with a spark of the unusual — a step beyond the ordinary.",
  Rare: "Hard-to-find creatures with distinctive power — a lucky pull worth celebrating.",
  Epic: "Powerful, striking creatures few rolls reveal — formidable and unforgettable.",
  Legendary:
    "The rarest of the rare — mythic creatures whispered about in legend.",
};

/** Rarity → gradient endpoints, used for the hero tile and page accents. */
export const RARITY_COLORS: Record<Rarity, { from: string; to: string }> = {
  Common: { from: "#cbd5e1", to: "#64748b" },
  Uncommon: { from: "#4ade80", to: "#15803d" },
  Rare: { from: "#38bdf8", to: "#1d4ed8" },
  Epic: { from: "#c084fc", to: "#7e22ce" },
  Legendary: { from: "#fde047", to: "#ca8a04" },
};

/** Rarity → emoji glyph, used in badges and the hero tile. */
export const RARITY_EMOJI: Record<Rarity, string> = {
  Common: "⚪",
  Uncommon: "🟢",
  Rare: "🔵",
  Epic: "🟣",
  Legendary: "👑",
};
