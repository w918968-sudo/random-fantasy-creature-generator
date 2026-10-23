import { ALL_PERSONALITIES, type Personality } from "@/lib/types";

/** Personality → URL slug (lowercase), e.g. "Mischievous" → "mischievous". */
export function personalitySlug(personality: Personality): string {
  return personality.toLowerCase();
}

/** Resolve a URL slug back to its personality, or undefined for invalid slugs. */
export function getPersonalityBySlug(slug: string): Personality | undefined {
  return ALL_PERSONALITIES.find((p) => p.toLowerCase() === slug);
}

/** Personality → emoji glyph, used in badges and the filter chips. */
export const PERSONALITY_EMOJI: Record<Personality, string> = {
  Gentle: "🕊️",
  Mischievous: "😜",
  Serene: "🌸",
  Fierce: "💢",
  Curious: "🔍",
  Loyal: "🛡️",
};

/** One-line SEO copy per personality, used on the /personalities/[personality] pages. */
export const PERSONALITY_DESCRIPTIONS: Record<Personality, string> = {
  Gentle:
    "Kind-hearted creatures with a soft touch — patient, tender, and quick to comfort.",
  Mischievous:
    "Playful tricksters with a spark of trouble — clever, lively, and full of pranks.",
  Serene:
    "Calm creatures of quiet stillness — peaceful, graceful, and deeply at ease.",
  Fierce:
    "Bold creatures with fire in their hearts — brave, intense, and fearless.",
  Curious:
    "Inquisitive creatures with wondering eyes — eager, bright, and always exploring.",
  Loyal:
    "Devoted companions through thick and thin — steadfast, protective, and true.",
};

/** Personality → gradient endpoints, used for the hero tile and page accents. */
export const PERSONALITY_COLORS: Record<Personality, { from: string; to: string }> = {
  Gentle: { from: "#f9a8d4", to: "#db2777" },
  Mischievous: { from: "#fbbf24", to: "#ea580c" },
  Serene: { from: "#67e8f9", to: "#0891b2" },
  Fierce: { from: "#f87171", to: "#b91c1c" },
  Curious: { from: "#a3e635", to: "#4d7c0f" },
  Loyal: { from: "#818cf8", to: "#4338ca" },
};
