/** Shared domain types for the fantasy creature generator. */

export type Element =
  | "Ember"
  | "Tide"
  | "Grove"
  | "Storm"
  | "Crystal"
  | "Dusk";

export type Personality =
  | "Gentle"
  | "Mischievous"
  | "Serene"
  | "Fierce"
  | "Curious"
  | "Loyal";

export type Habitat =
  | "Forest"
  | "Ocean"
  | "Mountain"
  | "Sky"
  | "Cavern";

export type Rarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary";

export type CreatureStatus = "draft" | "published";

export interface Creature {
  /** Stable kebab-case id; also used as the URL slug. */
  id: string;
  /** English display name. */
  name: string;
  /** One-line description. */
  description: string;
  /** 2–3 short traits shown on the card. */
  traits: string[];
  /** Public image path (e.g. "/creatures/emberwhisk.png"); null = artwork not yet generated. */
  image: string | null;
  /** Element used for card coloring and grouping. */
  element: Element;
  /** Personality used for filtering and (later) prompt shaping. */
  personality: Personality;
  /** Natural home — a cross-cutting facet distinct from element. */
  habitat: Habitat;
  /** Assigned rarity tier, stable per creature (like a gacha roster). */
  rarity: Rarity;
  /** Evolution stage: 1 = first generation, 2 = evolved (2nd gen), and so on. Omitted = 1. */
  generation?: number;
  /** For evolved forms: the 1st-gen creature id this form evolved from. */
  evolvesFrom?: string;
  /** Accurate alt text describing the artwork. */
  alt: string;
  /** Whether the creature is publicly visible. Drafts are excluded from the pool, pages, and sitemap. */
  status: CreatureStatus;
}

export const ALL_ELEMENTS: readonly Element[] = [
  "Ember",
  "Tide",
  "Grove",
  "Storm",
  "Crystal",
  "Dusk",
];

export const ALL_PERSONALITIES: readonly Personality[] = [
  "Gentle",
  "Mischievous",
  "Serene",
  "Fierce",
  "Curious",
  "Loyal",
];

export const ALL_HABITATS: readonly Habitat[] = [
  "Forest",
  "Ocean",
  "Mountain",
  "Sky",
  "Cavern",
];

export const ALL_RARITIES: readonly Rarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
];
