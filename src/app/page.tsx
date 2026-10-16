"use client";

import { useState } from "react";
import type { GeneratedPokemon } from "@/lib/types";
import { useGenerator } from "@/lib/use-generator";
import { buildCopyText } from "@/lib/copy-results";
import { ModeTabs } from "@/components/mode-tabs";
import { FilterPanel } from "@/components/filter-panel";
import { SettingsPanel } from "@/components/settings-panel";
import { PokemonCard } from "@/components/pokemon-card";
import { PokemonDetail } from "@/components/pokemon-detail";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Home() {
  const g = useGenerator();
  const { state } = g;
  const [selected, setSelected] = useState<GeneratedPokemon | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(0);

  const generatedCount = state.results.filter(Boolean).length;

  async function handleGenerate() {
    if (isGenerating) return;
    setIsGenerating(true);
    const delay = prefersReducedMotion() ? 0 : 550;
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    g.generate();
    setEpoch((e) => e + 1);
    setIsGenerating(false);
  }

  function handleReroll(index: number) {
    g.reroll(index);
    setEpoch((e) => e + 1);
  }

  async function handleCopy() {
    const text = buildCopyText(state.results);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Copied!");
    } catch {
      setCopyFeedback("Copy failed — select the text and copy manually.");
    }
    setTimeout(() => setCopyFeedback(null), 2500);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Random Pokémon Generator
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Generate a single Pokémon, a group, or a full team — with generation
          and type filters, shiny mode, lock &amp; reroll, and a Scarlet/Violet
          damage calculator.
        </p>
      </header>

      <div className="mb-6 flex justify-center">
        <ModeTabs mode={g.mode} onChange={g.setMode} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <FilterPanel
              filters={state.filters}
              onChange={g.updateFilters}
              onClear={g.clearFilters}
            />
          </div>
          <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <SettingsPanel
              mode={g.mode}
              settings={state.settings}
              onChange={g.updateSettings}
            />
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>

        <div className="space-y-4">
          {g.message && (
            <div
              role={g.message.type === "error" ? "alert" : "status"}
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                g.message.type === "error"
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
              }`}
            >
              {g.message.text}
            </div>
          )}

          {generatedCount === 0 && !g.message && (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-8 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-700">
                  Ready when you are
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Pick a mode, adjust any filters, then hit{" "}
                  <span className="font-semibold">Generate</span> to roll your
                  first Pokémon.
                </p>
              </div>
            </div>
          )}

          {generatedCount > 0 && (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">
                  Results ({generatedCount})
                </p>
                <div className="flex items-center gap-2">
                  {copyFeedback && (
                    <span className="text-sm text-slate-500">{copyFeedback}</span>
                  )}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    Copy Results
                  </button>
                </div>
              </div>

              <div
                key={epoch}
                className="grid grid-cols-2 gap-4 animate-fade-in-up sm:grid-cols-3 lg:grid-cols-4"
              >
                {Array.from({ length: state.settings.count }).map((_, i) => {
                  const pokemon = state.results[i];
                  if (!pokemon) {
                    return (
                      <div
                        key={i}
                        className="flex aspect-[3/4] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/40"
                      >
                        <span className="text-sm text-slate-400">Empty</span>
                      </div>
                    );
                  }
                  return (
                    <PokemonCard
                      key={i}
                      pokemon={pokemon}
                      locked={state.locked[i] === true}
                      showControls={g.mode !== "single"}
                      onToggleLock={() => g.toggleLock(i)}
                      onReroll={() => handleReroll(i)}
                      onSelect={() => setSelected(pokemon)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {selected && (
        <PokemonDetail pokemon={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}
