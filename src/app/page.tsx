"use client";

import { useEffect, useMemo, useState } from "react";
import { CREATURES, getCreature } from "@/lib/data/creatures";
import {
  createShuffleBag,
  drawNext,
  type ShuffleBag,
} from "@/lib/generator/shuffle-bag";
import type { Creature, Element, Personality } from "@/lib/types";
import { CreatureCard } from "@/components/creature-card";
import { FilterPanel } from "@/components/filter-panel";
import { ELEMENT_COLORS } from "@/lib/elements";

/** One-shot light flash + expanding ring when a creature is summoned. */
function SummonBurst({ creature }: { creature: Creature }) {
  const colors = ELEMENT_COLORS[creature.element];
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 animate-flash rounded-[1.75rem]"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-40 w-40 animate-burst-ring rounded-full"
        style={{
          border: `3px solid ${colors.from}`,
          boxShadow: `0 0 32px ${colors.from}aa, inset 0 0 32px ${colors.from}66`,
        }}
      />
    </>
  );
}

export default function Home() {
  const [elementFilter, setElementFilter] = useState<Element | null>(null);
  const [personalityFilter, setPersonalityFilter] =
    useState<Personality | null>(null);
  const [bag, setBag] = useState<ShuffleBag>(() =>
    createShuffleBag(CREATURES.map((c) => c.id)),
  );
  const [current, setCurrent] = useState<Creature | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredIds = useMemo(
    () =>
      CREATURES.filter(
        (c) =>
          (elementFilter === null || c.element === elementFilter) &&
          (personalityFilter === null || c.personality === personalityFilter),
      ).map((c) => c.id),
    [elementFilter, personalityFilter],
  );

  // Changing a filter starts a fresh no-repeat round over the new pool.
  useEffect(() => {
    setBag(createShuffleBag(filteredIds));
    setCurrent(null);
  }, [filteredIds]);

  const total = filteredIds.length;
  const seen = total - bag.remaining.length;

  function handleGenerate() {
    if (isGenerating) return;
    setIsGenerating(true);
    const next = drawNext(bag);
    if (next) {
      setBag(next.bag);
      setCurrent(getCreature(next.id) ?? null);
    }
    setIsGenerating(false);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-12 sm:px-6">
      <header className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-stone-600 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✦</span> Original creatures, one roll at a time{" "}
          <span aria-hidden>✦</span>
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.10)]">
            Random Fantasy Creature Generator
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          Roll an original fantasy creature — each with its own name, story, and
          traits. No repeats until you have seen them all.
        </p>
      </header>

      <FilterPanel
        element={elementFilter}
        personality={personalityFilter}
        onElementChange={setElementFilter}
        onPersonalityChange={setPersonalityFilter}
      />

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || total === 0}
          className="btn-game"
        >
          <span aria-hidden className="text-lg">✨</span>
          {isGenerating
            ? "Summoning…"
            : current
              ? "Generate another"
              : "Generate a creature"}
        </button>
      </div>

      {total === 0 ? (
        <div className="mt-10 flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center backdrop-blur-sm">
          <span aria-hidden className="text-4xl">🔍</span>
          <p className="max-w-xs text-stone-600">
            No creatures match these filters — try clearing one.
          </p>
        </div>
      ) : current ? (
        <div className="mt-8">
          <div className="animate-pop-in relative" key={current.id}>
            <SummonBurst creature={current} />
            <CreatureCard creature={current} />
          </div>
          <p className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-stone-600 ring-1 ring-stone-900/10 backdrop-blur-sm">
              <span aria-hidden>🎴</span> Seen {seen} of {total} this round
            </span>
          </p>
        </div>
      ) : (
        <div className="mt-10 flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center backdrop-blur-sm">
          <span aria-hidden className="text-5xl">✨</span>
          <p className="max-w-xs text-stone-600">
            Press{" "}
            <span className="font-semibold text-stone-900">
              Generate a creature
            </span>{" "}
            to summon your first one.
          </p>
        </div>
      )}
    </main>
  );
}
