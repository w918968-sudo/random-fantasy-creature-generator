import rawCreatures from "@/data/creatures.json";
import type { Creature } from "@/lib/types";

/**
 * Creature catalog. The raw JSON is the single source of truth; cast through
 * `unknown` because JSON module inference is narrower than the domain type.
 * Only `published` creatures are exposed publicly — drafts never enter the
 * random pool, the detail routes, or the sitemap. All content is original.
 */
export const CREATURES: Creature[] = (rawCreatures as unknown as Creature[]).filter(
  (c) => c.status === "published",
);

export function getCreature(id: string): Creature | undefined {
  return CREATURES.find((c) => c.id === id);
}
