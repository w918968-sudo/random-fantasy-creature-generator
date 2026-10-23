import type { Creature } from "@/lib/types";

/** Currently published evolution stages. Extend when a 3rd gen ships. */
export const ALL_GENERATIONS: readonly number[] = [1, 2];

/** 1 → "1st", 2 → "2nd", 3 → "3rd", 11 → "11th", 21 → "21st", etc. */
export function generationOrdinal(n: number): string {
  const rem100 = n % 100;
  const rem10 = n % 10;
  const suffix =
    rem10 === 1 && rem100 !== 11
      ? "st"
      : rem10 === 2 && rem100 !== 12
        ? "nd"
        : rem10 === 3 && rem100 !== 13
          ? "rd"
          : "th";
  return `${n}${suffix}`;
}

/** Generation → URL slug (the number itself), e.g. 2 → "2". */
export function generationSlug(g: number): string {
  return String(g);
}

/** Resolve a URL slug back to a generation, or undefined for invalid slugs. */
export function getGenerationBySlug(slug: string): number | undefined {
  const n = Number(slug);
  return Number.isInteger(n) && ALL_GENERATIONS.includes(n) ? n : undefined;
}

/** A creature's generation, defaulting to 1st-gen when the field is absent. */
export function generationOf(c: Creature): number {
  return c.generation ?? 1;
}

/** "2nd generation" style label. */
export function generationLabel(g: number): string {
  return `${generationOrdinal(g)} generation`;
}

/** One-line SEO copy per generation, used on the /generations/[generation] pages. */
export const GENERATION_DESCRIPTIONS: Record<number, string> = {
  1: "The original first-generation fantasy creatures across six elements and six personalities.",
  2: "Evolved second-generation forms of every original creature — older, larger, and far more powerful.",
};

/** Generation → gradient endpoints, used for the hero tile and page accents. */
export const GENERATION_COLORS: Record<number, { from: string; to: string }> = {
  1: { from: "#38bdf8", to: "#1d4ed8" },
  2: { from: "#f59e0b", to: "#b45309" },
};

/** Generation → emoji glyph, used in badges and the hero tile. */
export const GENERATION_EMOJI: Record<number, string> = {
  1: "🌱",
  2: "✨",
};
