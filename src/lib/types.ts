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
