import type { Creature } from "@/lib/types";

/** Minimal creature factory for tests. */
export function makeCreature(overrides: Partial<Creature> = {}): Creature {
  return {
    id: "test-creature",
    name: "Test Creature",
    description: "A creature used in tests.",
    traits: ["First trait", "Second trait"],
    image: null,
    element: "Ember",
    personality: "Gentle",
    habitat: "Mountain",
    rarity: "Rare",
    generation: 1,
    alt: "Original fantasy creature artwork of Test Creature.",
    status: "published",
    ...overrides,
  };
}
