"use client";

import type { GenerationSettings, Mode, ShinyMode } from "@/lib/types";

const SHINY_OPTIONS: { value: ShinyMode; label: string; hint?: string }[] = [
  { value: "normal", label: "Normal Only" },
  { value: "shiny", label: "Shiny Only" },
  { value: "random", label: "Random Mix", hint: "10% per slot (site's own fun setting, not official)" },
];

const COUNT_PRESETS: Record<Mode, number[]> = {
  single: [],
  multiple: [1, 5, 10, 20],
  team: [1, 3, 6],
};

export function SettingsPanel({
  mode,
  settings,
  onChange,
}: {
  mode: Mode;
  settings: GenerationSettings;
  onChange: (s: GenerationSettings) => void;
}) {
  const maxCount = mode === "team" ? 6 : 20;
  const showCount = mode !== "single";

  return (
    <div className="space-y-5">
      {/* Count */}
      {showCount && (
        <fieldset>
          <legend className="text-sm font-semibold text-slate-700">How many</legend>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {COUNT_PRESETS[mode].map((n) => {
              const active = settings.count === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...settings, count: n })}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              );
            })}
            <input
              type="number"
              min={1}
              max={maxCount}
              value={settings.count}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) {
                  onChange({ ...settings, count: Math.max(1, Math.min(maxCount, v)) });
                }
              }}
              className="w-20 rounded-lg bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
              aria-label="Number of Pokémon"
            />
          </div>
        </fieldset>
      )}

      {/* Shiny mode */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Shiny Mode</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SHINY_OPTIONS.map((o) => {
            const active = settings.shinyMode === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                title={o.hint}
                onClick={() => onChange({ ...settings, shinyMode: o.value })}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  active
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        {settings.shinyMode === "random" && (
          <p className="mt-1.5 text-xs text-slate-500">
            10% per slot — an entertainment setting, not an official shiny rate.
          </p>
        )}
      </fieldset>

      {/* Random nature + allow duplicates */}
      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.randomNature}
            onChange={(e) => onChange({ ...settings, randomNature: e.target.checked })}
            className="h-4 w-4 accent-blue-600"
          />
          Random Nature
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.allowDuplicates}
            onChange={(e) => onChange({ ...settings, allowDuplicates: e.target.checked })}
            className="h-4 w-4 accent-blue-600"
          />
          Allow Duplicates
        </label>
      </div>
    </div>
  );
}
