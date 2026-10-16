"use client";

import { useState } from "react";
import type { Filters, TypeName } from "@/lib/types";
import { ALL_TYPES, MAX_GENERATION } from "@/lib/types";
import { activeAdvancedFilterCount } from "@/lib/generator/filter";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const STAGES = [
  { value: 1, label: "Base" },
  { value: 2, label: "Stage 1" },
  { value: 3, label: "Stage 2" },
];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

export function FilterPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClear: () => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const activeCount = activeAdvancedFilterCount(filters);

  return (
    <div className="space-y-5">
      {/* Generation */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Generation</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from({ length: MAX_GENERATION }, (_, i) => i + 1).map((g) => {
            const active = filters.generations.includes(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, generations: toggle(filters.generations, g) })}
                className={`rounded-lg px-2.5 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {ROMAN[g - 1]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Type */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Type</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t: TypeName) => {
            const active = filters.types.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, types: toggle(filters.types, t) })}
                className={`rounded-lg px-2.5 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Advanced */}
      <div className="rounded-xl bg-white/60 ring-1 ring-slate-200">
        <button
          type="button"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <span>Advanced Filters</span>
          <span className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                {activeCount}
              </span>
            )}
            <span aria-hidden="true" className="text-slate-400">
              {advancedOpen ? "▲" : "▼"}
            </span>
          </span>
        </button>

        {advancedOpen && (
          <div className="space-y-4 border-t border-slate-200 px-4 py-4">
            {/* Evolution stage */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Evolution stage
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {STAGES.map((s) => {
                  const active = filters.evolutionStages.includes(s.value);
                  return (
                    <button
                      key={s.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        onChange({
                          ...filters,
                          evolutionStages: toggle(filters.evolutionStages, s.value),
                        })
                      }
                      className={`rounded-lg px-2.5 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                        active
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form range */}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={filters.includeForms}
                onChange={(e) => onChange({ ...filters, includeForms: e.target.checked })}
                className="h-4 w-4 accent-blue-600"
              />
              Include official forms (regional, Mega, etc.)
            </label>

            {/* Hidden ability */}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={filters.hasHiddenAbility}
                onChange={(e) => onChange({ ...filters, hasHiddenAbility: e.target.checked })}
                className="h-4 w-4 accent-blue-600"
              />
              Only Pokémon with a hidden ability
            </label>

            {/* Legendary / mythical */}
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={filters.excludeLegendaryMythical}
                onChange={(e) =>
                  onChange({ ...filters, excludeLegendaryMythical: e.target.checked })
                }
                className="h-4 w-4 accent-blue-600"
              />
              Exclude legendary &amp; mythical Pokémon
            </label>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        Clear Filters
      </button>
    </div>
  );
}
