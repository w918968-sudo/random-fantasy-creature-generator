import type {
  DefensiveSummary,
  GeneratedPokemon,
  Move,
  TeamAnalysis,
  TeamOverview,
  TypeChart,
  TypeName,
} from "@/lib/types";
import { ALL_TYPES } from "@/lib/types";
import { TYPE_CHART } from "@/lib/data/type-chart";
import { MOVES } from "@/lib/data/moves";
import { LEARNSETS } from "@/lib/data/learnsets";

export type DefenseBucket = "weak" | "resist" | "immune" | "neutral";

/** Bucket a raw multiplier (0, 0.25, 0.5, 1, 2, 4) into a defensive category. */
export function defenseBucket(multiplier: number): DefenseBucket {
  if (multiplier === 0) return "immune";
  if (multiplier > 1) return "weak";
  if (multiplier < 1) return "resist";
  return "neutral";
}

/**
 * Effectiveness of an attacking type against a defender with `defendingTypes`
 * (dual types multiply). Returns 0, 0.25, 0.5, 1, 2, or 4.
 */
export function typeEffectiveness(
  attacking: TypeName,
  defendingTypes: TypeName[],
  chart: TypeChart = TYPE_CHART,
): number {
  let multiplier = 1;
  for (const def of defendingTypes) {
    multiplier *= chart[attacking][def];
  }
  return multiplier;
}

/** For every attacking type, how many team members are weak/resist/immune. */
export function defensiveProfile(
  team: GeneratedPokemon[],
  chart: TypeChart = TYPE_CHART,
): Record<TypeName, DefensiveSummary> {
  const profile = {} as Record<TypeName, DefensiveSummary>;
  for (const attacking of ALL_TYPES) {
    const summary: DefensiveSummary = { weak: 0, resist: 0, immune: 0 };
    for (const member of team) {
      const bucket = defenseBucket(typeEffectiveness(attacking, member.species.types, chart));
      if (bucket === "weak") summary.weak += 1;
      else if (bucket === "resist") summary.resist += 1;
      else if (bucket === "immune") summary.immune += 1;
    }
    profile[attacking] = summary;
  }
  return profile;
}

/** The distinct types of a species's damaging (power > 0) Gen 9 moves. */
export function damagingMoveTypes(
  speciesId: string,
  moves: Record<string, Move> = MOVES,
  learnsets: Record<string, string[]> = LEARNSETS,
): TypeName[] {
  const types = new Set<TypeName>();
  for (const moveId of learnsets[speciesId] ?? []) {
    const move = moves[moveId];
    if (move && move.power > 0) types.add(move.type);
  }
  return [...types];
}

/**
 * For every defending type, count how many members can hit it super-effectively
 * with some damaging move in their learnset. This is coverage breadth, not
 * quality: a resisted or weak move is ignored, a ×2 (or ×4) move counts once.
 */
export function offensiveCoverage(
  team: GeneratedPokemon[],
  moves: Record<string, Move> = MOVES,
  learnsets: Record<string, string[]> = LEARNSETS,
  chart: TypeChart = TYPE_CHART,
): Record<TypeName, number> {
  const memberTypes = team.map((m) =>
    damagingMoveTypes(m.species.speciesId, moves, learnsets),
  );
  const coverage = {} as Record<TypeName, number>;
  for (const defending of ALL_TYPES) {
    let count = 0;
    for (const types of memberTypes) {
      if (types.some((t) => chart[t][defending] >= 2)) count += 1;
    }
    coverage[defending] = count;
  }
  return coverage;
}

export function teamOverview(team: GeneratedPokemon[]): TeamOverview {
  const typeSpread: Partial<Record<TypeName, number>> = {};
  const generationSpread: Partial<Record<number, number>> = {};
  const distinctTypes = new Set<TypeName>();
  let statTotalSum = 0;

  for (const member of team) {
    const s = member.species.baseStats;
    statTotalSum += s.hp + s.attack + s.defense + s.specialAttack + s.specialDefense + s.speed;
    for (const t of member.species.types) {
      typeSpread[t] = (typeSpread[t] ?? 0) + 1;
      distinctTypes.add(t);
    }
    generationSpread[member.species.generation] =
      (generationSpread[member.species.generation] ?? 0) + 1;
  }

  return {
    averageBaseStatTotal: team.length ? Math.round(statTotalSum / team.length) : 0,
    typeSpread,
    legendaryCount: team.filter((m) => m.species.isLegendary || m.species.isMythical).length,
    shinyCount: team.filter((m) => m.isShiny).length,
    generationSpread,
    distinctTypeCount: distinctTypes.size,
  };
}

/**
 * Full team analysis: overview, defensive profile, offensive coverage, and
 * highlight lists. The highlight thresholds are simple heuristics (§11) —
 * they surface gaps, they are not balance advice.
 */
export function analyzeTeam(
  team: GeneratedPokemon[],
  opts: {
    chart?: TypeChart;
    moves?: Record<string, Move>;
    learnsets?: Record<string, string[]>;
  } = {},
): TeamAnalysis {
  const chart = opts.chart ?? TYPE_CHART;
  const moves = opts.moves ?? MOVES;
  const learnsets = opts.learnsets ?? LEARNSETS;

  const defensive = defensiveProfile(team, chart);
  const offensive = offensiveCoverage(team, moves, learnsets, chart);

  return {
    overview: teamOverview(team),
    defensive,
    offensive,
    weaknessHighlights: ALL_TYPES.filter((t) => defensive[t].weak >= 3),
    resistanceHighlights: ALL_TYPES.filter(
      (t) => defensive[t].resist + defensive[t].immune >= 2,
    ),
  };
}
