import rawCreatures from "@/data/creatures.json";
import type { Creature } from "@/lib/types";

/**
 * Creature catalog. The raw JSON is the single source of truth for published
 * creatures; cast through `unknown` because JSON module inference is narrower
 * than the domain type. All content is original — no third-party IP.
 */
export const CREATURES: Creature[] = rawCreatures as unknown as Creature[];

export function getCreature(id: string): Creature | undefined {
  return CREATURES.find((c) => c.id === id);
}
