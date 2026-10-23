"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CREATURES, getCreature } from "@/lib/data/creatures";
import {
  createShuffleBag,
  drawMany,
  shuffle,
  type ShuffleBag,
} from "@/lib/generator/shuffle-bag";
import type { Creature, Element, Personality } from "@/lib/types";
import { CreatureCard } from "@/components/creature-card";
import { FilterPanel } from "@/components/filter-panel";
import { SummonBurst } from "@/components/summon-burst";
import { RollShareButton } from "@/components/roll-share-button";
import { parseRollIds } from "@/lib/share-text";
import { trackEvent } from "@/lib/analytics";

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 6;

export default function Home() {
  const [elementFilter, setElementFilter] = useState<Element | null>(null);
  const [personalityFilter, setPersonalityFilter] =
    useState<Personality | null>(null);
  const [quantity, setQuantity] = useState<number>(5);
  const [bag, setBag] = useState<ShuffleBag>(() =>
    createShuffleBag(CREATURES.map((c) => c.id)),
  );
  const [current, setCurrent] = useState<Creature[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sharedRoll, setSharedRoll] = useState(false);

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
    setCurrent([]);
  }, [filteredIds]);

  // Reproduce a shared roll from `?roll=a,b,c` (client-only; keeps static
  // export free of build-time URL state).
  useEffect(() => {
    const ids = parseRollIds(window.location.search);
    if (ids.length === 0) return;
    const creatures = ids
      .map((id) => getCreature(id))
      .filter((c): c is Creature => c !== null)
      .slice(0, MAX_QUANTITY);
    if (creatures.length === 0) return;
    setCurrent(creatures);
    setSharedRoll(true);
  }, []);

  const total = filteredIds.length;
  const seen = total - bag.remaining.length;

  function clampQuantity(value: number): number {
    if (Number.isNaN(value)) return MIN_QUANTITY;
    return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(value)));
  }

  function handleGenerate() {
    if (isGenerating) return;
    setIsGenerating(true);
    const { ids, bag: nextBag } = drawMany(bag, quantity);
    setBag(nextBag);
    setCurrent(
      ids
        .map((id) => getCreature(id))
        .filter((c): c is Creature => c !== null),
    );
    setSharedRoll(false);
    trackEvent("generate", {
      quantity,
      element: elementFilter ?? "all",
      personality: personalityFilter ?? "all",
    });
    setIsGenerating(false);
  }

  /** Swap one card for a creature not already on screen. */
  function handleReroll(index: number) {
    if (isGenerating) return;
    const exclude = new Set(current.map((c) => c.id));
    // Prefer the existing bag; if it only holds on-screen ids (e.g. after a
    // shared roll), start a fresh round over the remaining pool.
    let remaining = bag.remaining.filter((id) => !exclude.has(id));
    let all = bag.all;
    if (remaining.length === 0) {
      all = bag.all.filter((id) => !exclude.has(id));
      if (all.length === 0) return;
      remaining = shuffle(all);
    }
    const nextId = remaining[0];
    const creature = getCreature(nextId);
    if (!creature) return;

    setCurrent((cur) => cur.map((c, i) => (i === index ? creature : c)));
    setBag({ all, remaining: remaining.slice(1) });
    trackEvent("reroll", { id: nextId });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-stone-600 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✦</span> Original creatures, freshly rolled{" "}
          <span aria-hidden>✦</span>
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] sm:text-6xl">
          <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.10)]">
            Random Fantasy Creature Generator
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          Roll original fantasy creatures — each with its own name, story, and
          traits. Browse {CREATURES.length} unique companions across six
          elements (Ember, Tide, Grove, Storm, Crystal, and Dusk), six
          personalities, and two generations. No repeats within a batch.
        </p>
        <p className="mt-4">
          <Link
            href="/creatures"
            className="text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
          >
            Browse all {CREATURES.length} creatures →
          </Link>
        </p>
      </header>

      <div className="mx-auto max-w-2xl">
        <FilterPanel
          element={elementFilter}
          personality={personalityFilter}
          onElementChange={setElementFilter}
          onPersonalityChange={setPersonalityFilter}
        />

        <div className="mt-6 flex items-center justify-center gap-3">
          <label
            htmlFor="quantity"
            className="text-sm font-semibold text-stone-500"
          >
            How many?
          </label>
          <div className="inline-flex items-center rounded-full bg-white/70 ring-1 ring-stone-900/10 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setQuantity((q) => clampQuantity(q - 1))}
              aria-label="Decrease quantity"
              className="grid h-10 w-10 place-items-center rounded-l-full text-lg font-bold text-stone-600 transition hover:bg-white"
            >
              −
            </button>
            <input
              id="quantity"
              type="number"
              min={MIN_QUANTITY}
              max={MAX_QUANTITY}
              value={quantity}
              onChange={(e) =>
                setQuantity(clampQuantity(Number(e.target.value)))
              }
              className="h-10 w-12 bg-transparent text-center text-sm font-bold text-stone-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => clampQuantity(q + 1))}
              aria-label="Increase quantity"
              className="grid h-10 w-10 place-items-center rounded-r-full text-lg font-bold text-stone-600 transition hover:bg-white"
            >
              +
            </button>
          </div>
          <span className="text-xs text-stone-400">1–6</span>
        </div>

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
              : current.length > 0
                ? quantity === 1
                  ? "Generate another"
                  : `Generate ${quantity} more`
                : "Generate creatures"}
          </button>
          <p className="mt-4">
            <Link
              href="/random"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:bg-white"
            >
              <span aria-hidden>🎲</span> Feeling lucky? Roll a surprise
            </Link>
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="mx-auto mt-10 flex min-h-[240px] max-w-2xl flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center backdrop-blur-sm">
          <span aria-hidden className="text-4xl">🔍</span>
          <p className="max-w-xs text-stone-600">
            No creatures match these filters — try clearing one.
          </p>
        </div>
      ) : current.length === 0 ? (
        <div className="mx-auto mt-10 flex min-h-[320px] max-w-2xl flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center backdrop-blur-sm">
          <span aria-hidden className="text-5xl">✨</span>
          <p className="max-w-xs text-stone-600">
            Press{" "}
            <span className="font-semibold text-stone-900">
              Generate creatures
            </span>{" "}
            to summon your first batch.
          </p>
        </div>
      ) : current.length === 1 ? (
        <div className="mx-auto mt-8 max-w-md">
          <div className="animate-pop-in relative" key={current[0].id}>
            <SummonBurst creature={current[0]} />
            <CreatureCard creature={current[0]} />
          </div>
          <p className="mt-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-stone-600 ring-1 ring-stone-900/10 backdrop-blur-sm">
              <span aria-hidden>{sharedRoll ? "🎲" : "🎴"}</span>{" "}
              {sharedRoll
                ? "Shared roll · 1 creature"
                : `Seen ${seen} of ${total} this round`}
            </span>
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {current.map((creature, index) => (
              <div className="animate-pop-in relative" key={creature.id}>
                <CreatureCard creature={creature} />
                <button
                  type="button"
                  onClick={() => handleReroll(index)}
                  aria-label={`Re-roll ${creature.name}`}
                  title="Re-roll this one"
                  className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-base leading-none text-stone-700 shadow ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:scale-105 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
                >
                  <span aria-hidden>↻</span>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-stone-600 ring-1 ring-stone-900/10 backdrop-blur-sm">
              <span aria-hidden>{sharedRoll ? "🎲" : "🎴"}</span>{" "}
              {sharedRoll
                ? `Shared roll · ${current.length} creatures`
                : `Seen ${seen} of ${total} this round`}
            </span>
            <RollShareButton creatures={current} />
          </div>
        </div>
      )}
    </main>
  );
}
