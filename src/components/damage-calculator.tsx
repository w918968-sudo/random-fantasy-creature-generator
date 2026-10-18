"use client";

import { useMemo, useState } from "react";
import type { CalcStats, DamageOutcome, WeatherName, TerrainName } from "@/lib/damage/calc-engine";
import {
  calculateDamage,
  DEFAULT_EVS,
  DEFAULT_IVS,
  TERRAINS,
  WEATHERS,
} from "@/lib/damage/calc-engine";
import type { Move, NatureName, Species, TypeName } from "@/lib/types";
import { ALL_TYPES } from "@/lib/types";
import { SPECIES } from "@/lib/data/species";
import { MOVES } from "@/lib/data/moves";
import { getLearnset } from "@/lib/data/learnsets";
import { NATURES } from "@/lib/generator/natures";
import { TypeBadge } from "./type-badge";

/** Curated competitive items, all verified against @smogon/calc (gen 9). */
const ITEMS: readonly string[] = [
  "Choice Band", "Choice Specs", "Choice Scarf", "Life Orb", "Leftovers",
  "Assault Vest", "Focus Sash", "Heavy-Duty Boots", "Rocky Helmet", "Expert Belt",
  "Wise Glasses", "Muscle Band", "Eviolite", "Light Ball", "Thick Club",
  "Air Balloon", "Sitrus Berry", "Mental Herb", "Power Herb", "White Herb",
  "Weakness Policy", "Red Card", "Eject Button", "Safety Goggles", "Booster Energy",
  "Loaded Dice", "Clear Amulet", "Covert Cloak", "Mirror Herb", "Punching Glove",
  "Protective Pads", "Metronome", "Scope Lens", "Wide Lens", "Zoom Lens",
  "Bright Powder", "Light Clay", "Damp Rock", "Heat Rock", "Smooth Rock",
  "Icy Rock", "Toxic Orb", "Flame Orb", "Terrain Extender",
];

const STAT_FIELDS: { key: keyof CalcStats; label: string }[] = [
  { key: "hp", label: "HP" },
  { key: "atk", label: "Atk" },
  { key: "def", label: "Def" },
  { key: "spa", label: "SpA" },
  { key: "spd", label: "SpD" },
  { key: "spe", label: "Spe" },
];

interface FormBuild {
  species: Species | null;
  level: number;
  nature: NatureName | "";
  ability: string;
  item: string;
  teraType: TypeName | "";
  ivs: CalcStats;
  evs: CalcStats;
}

function abilitiesFor(species: Species | null): string[] {
  if (!species) return [];
  return [...species.abilities.regular, ...species.abilities.hidden];
}

function damagingMoves(speciesId: string | null): Move[] {
  if (!speciesId) return [];
  return getLearnset(speciesId)
    .map((id) => MOVES[id])
    .filter((m): m is Move => Boolean(m) && m.power > 0)
    .sort((a, b) => b.power - a.power || a.name.localeCompare(b.name));
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "(none)" : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatEditor({
  ivs,
  evs,
  onChange,
}: {
  ivs: CalcStats;
  evs: CalcStats;
  onChange: (ivs: CalcStats, evs: CalcStats) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 text-xs text-slate-400">
        <span />
        <span className="text-center">EV</span>
        <span className="text-center">IV</span>
      </div>
      {STAT_FIELDS.map(({ key, label }) => (
        <div key={key} className="grid grid-cols-[3rem_1fr_1fr] items-center gap-2">
          <span className="text-xs font-medium text-slate-500">{label}</span>
          <input
            type="number"
            min={0}
            max={252}
            value={evs[key]}
            aria-label={`${label} EV`}
            onChange={(e) =>
              onChange(ivs, { ...evs, [key]: Number(e.target.value) || 0 })
            }
            className="w-full rounded border border-slate-200 px-1.5 py-1 text-center text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
          />
          <input
            type="number"
            min={0}
            max={31}
            value={ivs[key]}
            aria-label={`${label} IV`}
            onChange={(e) =>
              onChange({ ...ivs, [key]: Number(e.target.value) || 0 }, evs)
            }
            className="w-full rounded border border-slate-200 px-1.5 py-1 text-center text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
          />
        </div>
      ))}
    </div>
  );
}

function SpeciesPicker({
  value,
  onSelect,
}: {
  value: Species | null;
  onSelect: (s: Species) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SPECIES.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 20);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setQuery(value?.name ?? "")}
        placeholder={value ? value.name : "Search species…"}
        aria-label="Search species"
        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((s) => (
            <li key={s.speciesId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(s);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <span className="flex-1">{s.name}</span>
                {s.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Scarlet/Violet singles damage calculator (§10). Loaded on demand together
 * with @smogon/calc and the moves/learnsets data, so none of it ships in the
 * initial bundle.
 */
export function DamageCalculator({
  initialAttacker,
  onClose,
}: {
  initialAttacker: Species | null;
  onClose: () => void;
}) {
  const [attacker, setAttacker] = useState<FormBuild>(() => ({
    species: initialAttacker,
    level: 50,
    nature: "",
    ability: initialAttacker ? abilitiesFor(initialAttacker)[0] ?? "" : "",
    item: "",
    teraType: "",
    ivs: DEFAULT_IVS,
    evs: DEFAULT_EVS,
  }));
  const [move, setMove] = useState<string>(
    () => damagingMoves(initialAttacker?.speciesId ?? null)[0]?.name ?? "",
  );
  const [defender, setDefender] = useState<FormBuild>(() => ({
    species: null,
    level: 50,
    nature: "",
    ability: "",
    item: "",
    teraType: "",
    ivs: DEFAULT_IVS,
    evs: DEFAULT_EVS,
  }));
  const [field, setField] = useState<{ weather: WeatherName; terrain: TerrainName }>({
    weather: "None",
    terrain: "None",
  });
  const [outcome, setOutcome] = useState<DamageOutcome | null>(null);

  const attackerMoves = useMemo(() => damagingMoves(attacker.species?.speciesId ?? null), [attacker.species]);

  function setAttackerSpecies(species: Species) {
    const abilities = abilitiesFor(species);
    const moves = damagingMoves(species.speciesId);
    setAttacker((a) => ({
      ...a,
      species,
      ability: abilities[0] ?? "",
      ivs: DEFAULT_IVS,
      evs: DEFAULT_EVS,
    }));
    setMove(moves[0]?.name ?? "");
    setOutcome(null);
  }

  function setDefenderSpecies(species: Species) {
    const abilities = abilitiesFor(species);
    setDefender((d) => ({
      ...d,
      species,
      ability: abilities[0] ?? "",
    }));
    setOutcome(null);
  }

  function run() {
    if (!attacker.species || !defender.species) {
      setOutcome({ ok: false, error: "Choose an attacker and a defender first." });
      return;
    }
    if (!move) {
      setOutcome({ ok: false, error: "Choose a damaging move." });
      return;
    }
    setOutcome(
      calculateDamage({
        attacker: {
          speciesName: attacker.species.name,
          move,
          level: attacker.level,
          nature: attacker.nature || null,
          ability: attacker.ability || null,
          item: attacker.item || null,
          teraType: attacker.teraType || null,
          ivs: attacker.ivs,
          evs: attacker.evs,
        },
        defender: {
          speciesName: defender.species.name,
          level: defender.level,
          nature: defender.nature || null,
          ability: defender.ability || null,
          item: defender.item || null,
          teraType: defender.teraType || null,
          ivs: defender.ivs,
          evs: defender.evs,
        },
        field,
      }),
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <button
        type="button"
        aria-label="Close damage calculator"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Damage calculator"
        className="relative m-4 flex h-[calc(100%-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-lg font-bold text-slate-800">Damage Calculator</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-2.5 py-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            ✕
          </button>
        </header>

        <div className="grid flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
          <section className="space-y-3 rounded-xl bg-slate-50 p-3">
            <h3 className="text-sm font-semibold text-slate-700">Attacker</h3>
            <SpeciesPicker value={attacker.species} onSelect={setAttackerSpecies} />
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Level</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={attacker.level}
                  onChange={(e) => setAttacker({ ...attacker, level: Number(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </label>
              <Select
                label="Nature"
                value={attacker.nature}
                onChange={(nature) => setAttacker({ ...attacker, nature: nature as NatureName | "" })}
                options={["", ...NATURES]}
              />
            </div>
            <Select
              label="Move"
              value={move}
              onChange={setMove}
              options={attackerMoves.length ? attackerMoves.map((m) => m.name) : ["(no damaging moves)"]}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Ability"
                value={attacker.ability}
                onChange={(ability) => setAttacker({ ...attacker, ability })}
                options={abilitiesFor(attacker.species).length ? abilitiesFor(attacker.species) : [""]}
              />
              <Select
                label="Item"
                value={attacker.item}
                onChange={(item) => setAttacker({ ...attacker, item })}
                options={["", ...ITEMS]}
              />
            </div>
            <Select
              label="Tera type"
              value={attacker.teraType}
              onChange={(teraType) => setAttacker({ ...attacker, teraType: teraType as TypeName | "" })}
              options={["", ...ALL_TYPES]}
            />
            <StatEditor
              ivs={attacker.ivs}
              evs={attacker.evs}
              onChange={(ivs, evs) => setAttacker({ ...attacker, ivs, evs })}
            />
          </section>

          <section className="space-y-3 rounded-xl bg-slate-50 p-3">
            <h3 className="text-sm font-semibold text-slate-700">Defender</h3>
            <SpeciesPicker value={defender.species} onSelect={setDefenderSpecies} />
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Level</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={defender.level}
                  onChange={(e) => setDefender({ ...defender, level: Number(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </label>
              <Select
                label="Nature"
                value={defender.nature}
                onChange={(nature) => setDefender({ ...defender, nature: nature as NatureName | "" })}
                options={["", ...NATURES]}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Ability"
                value={defender.ability}
                onChange={(ability) => setDefender({ ...defender, ability })}
                options={abilitiesFor(defender.species).length ? abilitiesFor(defender.species) : [""]}
              />
              <Select
                label="Item"
                value={defender.item}
                onChange={(item) => setDefender({ ...defender, item })}
                options={["", ...ITEMS]}
              />
            </div>
            <Select
              label="Tera type"
              value={defender.teraType}
              onChange={(teraType) => setDefender({ ...defender, teraType: teraType as TypeName | "" })}
              options={["", ...ALL_TYPES]}
            />
            <StatEditor
              ivs={defender.ivs}
              evs={defender.evs}
              onChange={(ivs, evs) => setDefender({ ...defender, ivs, evs })}
            />
          </section>
        </div>

        <footer className="border-t border-slate-100 p-4">
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <Select
              label="Weather"
              value={field.weather}
              onChange={(weather) => setField({ ...field, weather: weather as WeatherName })}
              options={WEATHERS}
            />
            <Select
              label="Terrain"
              value={field.terrain}
              onChange={(terrain) => setField({ ...field, terrain: terrain as TerrainName })}
              options={TERRAINS}
            />
            <button
              type="button"
              onClick={run}
              className="ml-auto rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Calculate
            </button>
          </div>

          {outcome && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                outcome.ok
                  ? "bg-slate-50 ring-1 ring-slate-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              {outcome.ok ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {outcome.result.range.min}–{outcome.result.range.max}
                    </span>
                    <span className="text-sm text-slate-500">damage</span>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {outcome.result.kochance.text}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{outcome.result.desc}</p>
                </div>
              ) : (
                <p>{outcome.error}</p>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
