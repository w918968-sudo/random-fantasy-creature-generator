"use client";

import type { GeneratedPokemon } from "@/lib/types";
import { TypeBadge } from "./type-badge";

export function PokemonCard({
  pokemon,
  locked,
  showControls,
  onToggleLock,
  onReroll,
  onSelect,
}: {
  pokemon: GeneratedPokemon;
  locked: boolean;
  showControls: boolean;
  onToggleLock: () => void;
  onReroll: () => void;
  onSelect: () => void;
}) {
  const { species, isShiny, nature } = pokemon;
  const dex = `#${String(species.nationalDexNumber).padStart(4, "0")}`;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <button
        type="button"
        onClick={onSelect}
        className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-label={`View details for ${species.name}`}
      >
        <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <span className="text-sm font-medium text-slate-400">
            Image pending license
          </span>
        </div>
        <div className="p-3">
          <div className="text-xs font-medium tracking-wide text-slate-400">{dex}</div>
          <div className="mt-0.5 flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-800">
              {species.name}
            </h3>
            {isShiny && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Shiny
              </span>
            )}
          </div>
          {species.formName && (
            <div className="mt-0.5 text-xs text-slate-500">{species.formName}</div>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {species.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          {nature && (
            <div className="mt-2 text-xs text-slate-500">Nature: {nature}</div>
          )}
        </div>
      </button>

      {showControls && (
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-2">
          <button
            type="button"
            aria-pressed={locked}
            onClick={onToggleLock}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
              locked
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {locked ? "Unlock" : "Lock"}
          </button>
          {!locked && (
            <button
              type="button"
              onClick={onReroll}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Reroll
            </button>
          )}
        </div>
      )}
    </div>
  );
}
