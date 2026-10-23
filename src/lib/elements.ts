import { ALL_ELEMENTS, type Element } from "@/lib/types";

/** Element → URL slug (lowercase), e.g. "Ember" → "ember". */
export function elementSlug(element: Element): string {
  return element.toLowerCase();
}

/** Resolve a URL slug back to its element, or undefined for invalid slugs. */
export function getElementBySlug(slug: string): Element | undefined {
  return ALL_ELEMENTS.find((el) => el.toLowerCase() === slug);
}

/** One-line SEO copy per element, used on the /elements/[element] pages. */
export const ELEMENT_DESCRIPTIONS: Record<Element, string> = {
  Ember:
    "Fire-hearted creatures forged in flame — passionate, brave, and burning bright.",
  Tide: "Fluid creatures of the deep — graceful, intuitive, and calmly mysterious.",
  Grove:
    "Verdant creatures rooted in the wild — nurturing, enduring, and full of growth.",
  Storm:
    "Electric creatures of the open sky — charged with energy, speed, and spark.",
  Crystal:
    "Luminous creatures of living gem — precise, radiant, and magically clear.",
  Dusk: "Serene creatures of twilight — quiet, watchful, and balanced between light and shadow.",
};

/** Element → gradient endpoints, used for placeholder art and the share image. */
export const ELEMENT_COLORS: Record<Element, { from: string; to: string }> = {
  Ember: { from: "#f97316", to: "#dc2626" },
  Tide: { from: "#38bdf8", to: "#2563eb" },
  Grove: { from: "#34d399", to: "#059669" },
  Storm: { from: "#a78bfa", to: "#4f46e5" },
  Crystal: { from: "#f472b6", to: "#a855f7" },
  Dusk: { from: "#818cf8", to: "#312e81" },
};

/** Element → emoji glyph, used in badges and placeholder art. */
export const ELEMENT_EMOJI: Record<Element, string> = {
  Ember: "🔥",
  Tide: "🌊",
  Grove: "🌿",
  Storm: "⚡",
  Crystal: "💎",
  Dusk: "🌙",
};
