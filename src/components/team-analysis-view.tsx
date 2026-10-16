"use client";

import { useMemo } from "react";
import type { GeneratedPokemon, TypeName } from "@/lib/types";
import { ALL_TYPES } from "@/lib/types";
import { analyzeTeam } from "@/lib/analysis/team-analysis";
import { TypeBadge } from "./type-badge";

const GEN_ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </h3>
  );
}

function OverviewStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-lg font-bold text-slate-800">{value}</dd>
    </div>
  );
}

/**
 * Team Analysis (§11): overview, defensive and offensive coverage, and gap
 * highlights. Loaded on demand in team mode so the battle data is code-split.
 */
export function TeamAnalysisView({ team }: { team: GeneratedPokemon[] }) {
  const analysis = useMemo(() => analyzeTeam(team), [team]);
  const { overview, defensive, offensive, weaknessHighlights, resistanceHighlights } = analysis;

  const teamSize = team.length;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionTitle>Overview</SectionTitle>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <OverviewStat label="Avg. base stat total" value={overview.averageBaseStatTotal} />
          <OverviewStat label="Distinct types" value={overview.distinctTypeCount} />
          <OverviewStat label="Legendary / Mythical" value={overview.legendaryCount} />
          <OverviewStat label="Shiny" value={overview.shinyCount} />
        </dl>

        <div className="space-y-1.5 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400">Type spread:</span>
            {Object.entries(overview.typeSpread).map(([type, count]) => (
              <span key={type} className="inline-flex items-center gap-1">
                <TypeBadge type={type as TypeName} />
                <span className="text-xs font-semibold text-slate-500">×{count}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400">Generation spread:</span>
            {Object.entries(overview.generationSpread).map(([gen, count]) => (
              <span
                key={gen}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
              >
                {GEN_ROMAN[Number(gen) - 1] ?? gen} ×{count}
              </span>
            ))}
          </div>
        </div>
      </section>

      {(weaknessHighlights.length > 0 || resistanceHighlights.length > 0) && (
        <section className="space-y-2">
          <SectionTitle>Highlights</SectionTitle>
          {weaknessHighlights.length > 0 && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
              <span className="font-semibold">Shared weaknesses:</span>{" "}
              {weaknessHighlights.join(", ")}
            </p>
          )}
          {resistanceHighlights.length > 0 && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">
              <span className="font-semibold">Shared resistances:</span>{" "}
              {resistanceHighlights.join(", ")}
            </p>
          )}
        </section>
      )}

      <section className="space-y-2">
        <SectionTitle>Defensive coverage</SectionTitle>
        <p className="text-xs text-slate-400">
          How many members take super-effective / resisted / no damage from each type.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ALL_TYPES.map((type) => {
            const { weak, resist, immune } = defensive[type];
            return (
              <div
                key={type}
                className={`rounded-xl px-2 py-1.5 ring-1 ${
                  weak > 0 ? "bg-red-50 ring-red-100" : "bg-slate-50 ring-slate-100"
                }`}
              >
                <TypeBadge type={type} />
                <div className="mt-1 space-y-0.5 text-xs">
                  {weak > 0 && <p className="font-semibold text-red-600">{weak} weak</p>}
                  {resist > 0 && <p className="font-semibold text-emerald-600">{resist} resist</p>}
                  {immune > 0 && <p className="font-semibold text-blue-600">{immune} immune</p>}
                  {weak + resist + immune === 0 && <p className="text-slate-400">neutral</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle>Offensive coverage</SectionTitle>
        <p className="text-xs text-slate-400">
          Members able to hit each defending type super-effectively (learnset-based).
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ALL_TYPES.map((type) => {
            const covered = offensive[type];
            const tone =
              covered === teamSize
                ? "bg-emerald-50 ring-emerald-100"
                : covered === 0
                  ? "bg-red-50 ring-red-100"
                  : "bg-amber-50 ring-amber-100";
            const text =
              covered === teamSize
                ? "text-emerald-700"
                : covered === 0
                  ? "text-red-600"
                  : "text-amber-700";
            return (
              <div key={type} className={`rounded-xl px-2 py-1.5 ring-1 ${tone}`}>
                <TypeBadge type={type} />
                <p className={`mt-1 text-xs font-semibold ${text}`}>
                  {covered}/{teamSize} cover
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
