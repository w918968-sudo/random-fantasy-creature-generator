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
