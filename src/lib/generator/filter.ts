import type { Filters, Species } from "@/lib/types";

export const DEFAULT_FILTERS: Filters = {
  generations: [],
  types: [],
  evolutionStages: [],
  includeForms: false,
  hasHiddenAbility: false,
  excludeLegendaryMythical: false,
};

/** Cross-category = AND; within a category = OR (§5.1). */
export function matchesFilters(species: Species, filters: Filters): boolean {
  if (
    filters.generations.length > 0 &&
    !filters.generations.includes(species.generation)
  ) {
    return false;
  }
  if (
    filters.types.length > 0 &&
    !species.types.some((t) => filters.types.includes(t))
  ) {
    return false;
  }
  if (
    filters.evolutionStages.length > 0 &&
    !filters.evolutionStages.includes(species.evolutionStage)
  ) {
    return false;
  }
  if (!filters.includeForms && !species.isDefaultForm) {
    return false;
  }
  if (filters.hasHiddenAbility && species.abilities.hidden.length === 0) {
    return false;
  }
  if (
    filters.excludeLegendaryMythical &&
    (species.isLegendary || species.isMythical)
  ) {
    return false;
  }
  return true;
}

export function filterPool(pool: Species[], filters: Filters): Species[] {
  return pool.filter((s) => matchesFilters(s, filters));
}

/**
 * Count of active advanced filters (evolution stage, forms, hidden ability,
 * legendary/mythical exclusion) for the Advanced Filters badge.
 */
export function activeAdvancedFilterCount(filters: Filters): number {
  let n = 0;
  if (filters.evolutionStages.length > 0) n += 1;
  if (filters.includeForms) n += 1;
  if (filters.hasHiddenAbility) n += 1;
  if (filters.excludeLegendaryMythical) n += 1;
  return n;
}
