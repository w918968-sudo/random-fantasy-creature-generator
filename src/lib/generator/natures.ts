import type { NatureName } from "@/lib/types";

/** All 25 natures, in canonical order. */
export const NATURES: readonly NatureName[] = [
  "Hardy",
  "Lonely",
  "Brave",
  "Adamant",
  "Naughty",
  "Bold",
  "Docile",
  "Relaxed",
  "Impish",
  "Lax",
  "Timid",
  "Hasty",
  "Serious",
  "Jolly",
  "Naive",
  "Modest",
  "Mild",
  "Quiet",
  "Bashful",
  "Rash",
  "Calm",
  "Gentle",
  "Sassy",
  "Careful",
  "Quirky",
];

/**
 * Natures with no stat modifiers. Used as the damage-calculator default when
 * Random Nature is off (§8.3).
 */
export const NEUTRAL_NATURE: NatureName = "Serious";
