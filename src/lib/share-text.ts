import type { Creature } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

/** Stable, canonical URL for a creature's detail page. */
export function creatureShareUrl(creature: Creature): string {
  return `${SITE_URL}/creatures/${creature.id}`;
}

/** Plain-text summary used for the clipboard share fallback. */
export function buildShareText(creature: Creature): string {
  const traits = creature.traits.map((t) => `• ${t}`).join("\n");
  return [creature.name, creature.description, "", "Traits:", traits].join("\n");
}

/** Absolute URL that reproduces a generated batch on the home page. */
export function buildRollUrl(ids: readonly string[]): string {
  return `${SITE_URL}/?roll=${ids.join(",")}`;
}

/** Parse `?roll=a,b,c` into a de-duplicated id list; empty when absent. */
export function parseRollIds(query: string): string[] {
  const roll = new URLSearchParams(query).get("roll");
  if (!roll) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const raw of roll.split(",")) {
    const id = raw.trim();
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}
