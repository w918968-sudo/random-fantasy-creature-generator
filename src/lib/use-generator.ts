"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  Filters,
  GeneratedPokemon,
  GenerationSettings,
  Mode,
} from "@/lib/types";
import { SPECIES } from "@/lib/data/species";
import {
  DEFAULT_FILTERS,
  filterPool,
  matchesFilters,
} from "@/lib/generator/filter";
import { generateBatch, rerollOne } from "@/lib/generator/generate";

export type GeneratorMessage =
  | { type: "error"; text: string }
  | { type: "notice"; text: string };

export interface ModeState {
  filters: Filters;
  settings: GenerationSettings;
  /** Null slots appear when the user raises the count; generated on next click. */
  results: (GeneratedPokemon | null)[];
  locked: boolean[];
  hasGenerated: boolean;
}

const defaultSettings = (count: number): GenerationSettings => ({
  count,
  allowDuplicates: false,
  shinyMode: "normal",
  randomNature: false,
});

const initialStates = (): Record<Mode, ModeState> => ({
  single: {
    filters: { ...DEFAULT_FILTERS },
    settings: defaultSettings(1),
    results: [],
    locked: [],
    hasGenerated: false,
  },
  multiple: {
    filters: { ...DEFAULT_FILTERS },
    settings: defaultSettings(5),
    results: [],
    locked: [],
    hasGenerated: false,
  },
  team: {
    filters: { ...DEFAULT_FILTERS },
    settings: defaultSettings(6),
    results: [],
    locked: [],
    hasGenerated: false,
  },
});

function resize<T>(arr: T[], n: number, fill: T): T[] {
  if (n <= arr.length) return arr.slice(0, n);
  return [...arr, ...Array.from({ length: n - arr.length }, () => fill)];
}

export function useGenerator() {
  const [mode, setMode] = useState<Mode>("single");
  const [states, setStates] = useState<Record<Mode, ModeState>>(initialStates);
  const [message, setMessage] = useState<GeneratorMessage | null>(null);

  const state = states[mode];

  const pool = useMemo(
    () => filterPool(SPECIES, state.filters),
    [state.filters],
  );

  const updateFilters = useCallback(
    (filters: Filters) => {
      setMessage(null);
      setStates((prev) => ({ ...prev, [mode]: { ...prev[mode], filters } }));
    },
    [mode],
  );

  const updateSettings = useCallback(
    (settings: GenerationSettings) => {
      setMessage(null);
      setStates((prev) => {
        const s = prev[mode];
        const countChanged = settings.count !== s.settings.count;
        return {
          ...prev,
          [mode]: {
            ...s,
            settings,
            results: countChanged ? resize(s.results, settings.count, null) : s.results,
            locked: countChanged ? resize(s.locked, settings.count, false) : s.locked,
          },
        };
      });
    },
    [mode],
  );

  const generate = useCallback(() => {
    const kept: (GeneratedPokemon | null)[] = [];
    const newLocked: boolean[] = [];
    let unlockedCount = 0;
    for (let i = 0; i < state.settings.count; i++) {
      const r = state.results[i];
      const isLocked = state.locked[i] === true;
      if (isLocked && r && matchesFilters(r.species, state.filters)) {
        kept.push(r);
        newLocked.push(true);
      } else {
        kept.push(null);
        newLocked.push(false);
        if (isLocked) unlockedCount += 1;
      }
    }

    const result = generateBatch(pool, state.settings, kept);
    if (!result.ok) {
      setMessage({
        type: "error",
        text:
          result.reason === "empty-pool"
            ? "No Pokémon match your filters."
            : "Not enough unique Pokémon match your filters. Reduce the count or enable Allow Duplicates.",
      });
      return;
    }
    setMessage(
      unlockedCount > 0
        ? {
            type: "notice",
            text: `${unlockedCount} locked Pokémon no longer matched your filters and were unlocked.`,
          }
        : null,
    );
    setStates((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        results: result.results,
        locked: newLocked,
        hasGenerated: true,
      },
    }));
  }, [mode, pool, state]);

  const reroll = useCallback(
    (index: number) => {
      const result = rerollOne(pool, state.settings, state.results, index);
      if (!result.ok) {
        setMessage({
          type: "error",
          text:
            result.reason === "empty-pool"
              ? "No Pokémon match your filters."
              : "Not enough unique Pokémon match your filters.",
        });
        return;
      }
      setMessage(null);
      setStates((prev) => ({ ...prev, [mode]: { ...prev[mode], results: result.results } }));
    },
    [mode, pool, state],
  );

  const toggleLock = useCallback(
    (index: number) => {
      setMessage(null);
      setStates((prev) => {
        const s = prev[mode];
        const locked = s.locked.slice();
        locked[index] = !locked[index];
        return { ...prev, [mode]: { ...s, locked } };
      });
    },
    [mode],
  );

  const clearFilters = useCallback(() => {
    setMessage(null);
    setStates((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], filters: { ...DEFAULT_FILTERS } },
    }));
  }, [mode]);

  const switchMode = useCallback((m: Mode) => {
    setMessage(null);
    setMode(m);
  }, []);

  return {
    mode,
    setMode: switchMode,
    state,
    poolSize: pool.length,
    message,
    updateFilters,
    updateSettings,
    generate,
    reroll,
    toggleLock,
    clearFilters,
  };
}
