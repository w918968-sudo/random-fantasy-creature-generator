"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { BaseStats, GeneratedPokemon } from "@/lib/types";
import { getSpecies } from "@/lib/data/species";
import { TypeBadge } from "./type-badge";

// Lazy-load the move list so moves/learnsets JSON (~1 MB) stays out of the
// initial bundle and is fetched only when a detail panel opens.
const MoveList = dynamic(() => import("./move-list").then((m) => m.MoveList), {
  ssr: false,
  loading: () => <p className="text-sm text-slate-400">Loading moves…</p>,
});

// Lazy-load the damage calculator so @smogon/calc only downloads when a
// calculation is requested (the attacker is seeded from this Pokémon).
const DamageCalculator = dynamic(
  () => import("./damage-calculator").then((m) => m.DamageCalculator),
  { ssr: false },
);

const GEN_LABELS = [
  "Generation I",
  "Generation II",
  "Generation III",
  "Generation IV",
  "Generation V",
  "Generation VI",
  "Generation VII",
  "Generation VIII",
  "Generation IX",
];

const STAT_LABELS: { key: keyof BaseStats; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "attack", label: "Attack" },
  { key: "defense", label: "Defense" },
  { key: "specialAttack", label: "Sp. Atk" },
  { key: "specialDefense", label: "Sp. Def" },
  { key: "speed", label: "Speed" },
];

function resolveName(speciesId: string): string {
  return getSpecies(speciesId)?.name ?? speciesId;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <div className="mt-2 text-sm text-slate-700">{children}</div>
    </section>
  );
}

export function PokemonDetail({
  pokemon,
  onClose,
}: {
  pokemon: GeneratedPokemon;
  onClose: () => void;
}) {
  const { species, isShiny, nature } = pokemon;
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const dex = `#${String(species.nationalDexNumber).padStart(4, "0")}`;
  const evolvesFromName = species.evolvesFrom ? resolveName(species.evolvesFrom) : null;
  const evolvesToNames = species.evolvesTo.map(resolveName);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${species.name} details`}
        className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-lg font-bold text-slate-800">{species.name}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCalc(true)}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Damage Calculator
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg px-2.5 py-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-slate-400">Image pending license</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {dex}
            </span>
            {isShiny && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                Shiny
              </span>
            )}
            {nature && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                Nature: {nature}
              </span>
            )}
            {species.isLegendary && (
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                Legendary
              </span>
            )}
            {species.isMythical && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                Mythical
              </span>
            )}
          </div>

          {species.formName && (
            <p className="text-sm text-slate-500">{species.formName}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {species.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>

          <Section title="Classification">
            <dl className="space-y-1">
              {species.category && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Category</dt>
                  <dd>{species.category}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Generation</dt>
                <dd>{GEN_LABELS[species.generation - 1] ?? `Generation ${species.generation}`}</dd>
              </div>
              {species.heightM != null && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Height</dt>
                  <dd>{species.heightM} m</dd>
                </div>
              )}
              {species.weightKg != null && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Weight</dt>
                  <dd>{species.weightKg} kg</dd>
                </div>
              )}
            </dl>
          </Section>

          <Section title="Abilities">
            <ul className="space-y-1">
              <li>
                <span className="text-slate-500">Regular: </span>
                {species.abilities.regular.join(", ") || "—"}
              </li>
              {species.abilities.hidden.length > 0 && (
                <li>
                  <span className="text-slate-500">Hidden: </span>
                  {species.abilities.hidden.join(", ")}
                </li>
              )}
            </ul>
          </Section>

          <Section title="Base Stats">
            <ul className="space-y-1.5">
              {STAT_LABELS.map(({ key, label }) => {
                const value = species.baseStats[key];
                return (
                  <li key={key} className="flex items-center gap-3">
                    <span className="w-16 text-slate-500">{label}</span>
                    <span className="w-8 text-right font-semibold text-slate-700">
                      {value}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, (value / 255) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Moves">
            <MoveList speciesId={species.speciesId} />
          </Section>

          <Section title="Evolution">
            <p>
              <span className="text-slate-500">Stage: </span>
              {species.evolutionStage === 1
                ? "Base"
                : `Stage ${species.evolutionStage - 1}`}
              {species.isFinalEvolution ? " (final)" : ""}
            </p>
            {evolvesFromName && (
              <p>
                <span className="text-slate-500">Evolves from: </span>
                {evolvesFromName}
              </p>
            )}
            {evolvesToNames.length > 0 && (
              <p>
                <span className="text-slate-500">Evolves to: </span>
                {evolvesToNames.join(", ")}
              </p>
            )}
          </Section>
        </div>
      </aside>
      {showCalc && (
        <DamageCalculator initialAttacker={species} onClose={() => setShowCalc(false)} />
      )}
    </div>
  );
}
