import type { Personality } from "@/lib/types";

/** Personality → emoji glyph, used in badges and the filter chips. */
export const PERSONALITY_EMOJI: Record<Personality, string> = {
  Gentle: "🕊️",
  Mischievous: "😜",
  Serene: "🌸",
  Fierce: "💢",
  Curious: "🔍",
  Loyal: "🛡️",
};
