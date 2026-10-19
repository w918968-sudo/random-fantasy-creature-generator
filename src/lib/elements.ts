import type { Element } from "@/lib/types";

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
