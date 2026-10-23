import { ALL_HABITATS, type Habitat } from "@/lib/types";

/** Habitat → URL slug (lowercase), e.g. "Mountain" → "mountain". */
export function habitatSlug(habitat: Habitat): string {
  return habitat.toLowerCase();
}

/** Resolve a URL slug back to its habitat, or undefined for invalid slugs. */
export function getHabitatBySlug(slug: string): Habitat | undefined {
  return ALL_HABITATS.find((h) => h.toLowerCase() === slug);
}

/** One-line SEO copy per habitat, used on the /habitats/[habitat] pages. */
export const HABITAT_DESCRIPTIONS: Record<Habitat, string> = {
  Forest:
    "Woodland creatures at home among trees, moss, and meadow — wild, nurturing, and rooted in green.",
  Ocean:
    "Salt-spray creatures of sea and shore — fluid, curious, and quietly deep.",
  Mountain:
    "Peak-dwelling creatures of crag, cliff, and volcanic slope — sturdy, warm-hearted, and built to endure.",
  Sky: "Wind-borne creatures of cloud, storm, and starlight — swift, bright, and ever aloft.",
  Cavern:
    "Shadow and stone creatures of cave and crystal grotto — watchful, radiant, and at home in the dark.",
};

/** Habitat → gradient endpoints, used for the hero tile and page accents. */
export const HABITAT_COLORS: Record<Habitat, { from: string; to: string }> = {
  Forest: { from: "#84cc16", to: "#15803d" },
  Ocean: { from: "#22d3ee", to: "#0e7490" },
  Mountain: { from: "#f59e0b", to: "#78350f" },
  Sky: { from: "#93c5fd", to: "#1d4ed8" },
  Cavern: { from: "#94a3b8", to: "#1e293b" },
};

/** Habitat → emoji glyph, used in badges and the hero tile. */
export const HABITAT_EMOJI: Record<Habitat, string> = {
  Forest: "🌲",
  Ocean: "🐚",
  Mountain: "⛰️",
  Sky: "☁️",
  Cavern: "🕯️",
};
