"use client";

import { useCallback, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { CREATURES } from "@/lib/data/creatures";
import type { Element, Personality } from "@/lib/types";
import { ALL_ELEMENTS, ALL_PERSONALITIES } from "@/lib/types";
import { ELEMENT_EMOJI } from "@/lib/elements";
import { PERSONALITY_EMOJI } from "@/lib/personalities";
import { ALL_GENERATIONS, generationOf, generationOrdinal } from "@/lib/generations";
import { CreatureTile } from "@/components/creature-tile";
import { Lightbox } from "@/components/lightbox";

function ElementTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-stone-900 text-white shadow"
          : "bg-white/70 text-stone-600 ring-1 ring-stone-900/10 hover:bg-white hover:text-stone-900"
      }`}
    >
      {children}
    </button>
  );
}

function PersonalityChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ring-1 ${
        active
          ? "bg-stone-900 text-white ring-stone-900"
          : "bg-white/70 text-stone-500 ring-stone-900/10 hover:bg-white hover:text-stone-900"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The full creature gallery. Element tabs + personality chips + generation
 * chips filter a flat grid; clicking a card opens a lightbox that navigates
 * with arrows or the keyboard. Cards keep a real `href` so middle-click /
 * open-in-new-tab still reaches the detail page (and crawlers keep the links).
 */
export function Gallery() {
  const [element, setElement] = useState<Element | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [generation, setGeneration] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      CREATURES.filter(
        (c) =>
          (element === null || c.element === element) &&
          (personality === null || c.personality === personality) &&
          (generation === null || generationOf(c) === generation),
      ),
    [element, personality, generation],
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : (i - 1 + filtered.length) % filtered.length,
      ),
    [filtered.length],
  );
  const next = useCallback(
    () =>
      setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length],
  );

  const active = lightboxIndex !== null ? filtered[lightboxIndex] : undefined;

  function handleCardClick(e: MouseEvent<HTMLAnchorElement>, id: string) {
    // Leave modified clicks (new tab, etc.) to the browser.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    e.preventDefault();
    const index = filtered.findIndex((c) => c.id === id);
    if (index >= 0) setLightboxIndex(index);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-extrabold text-stone-900 sm:text-5xl">
          All Fantasy Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          The complete collection — {CREATURES.length} creatures across six
          elements, six personalities, and two generations. Click any creature
          to view it up close.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <ElementTab active={element === null} onClick={() => setElement(null)}>
          All
        </ElementTab>
        {ALL_ELEMENTS.map((el) => (
          <ElementTab
            key={el}
            active={element === el}
            onClick={() => setElement(el)}
          >
            <span aria-hidden>{ELEMENT_EMOJI[el]}</span>
            {el}
          </ElementTab>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
          Personality
        </span>
        <PersonalityChip
          active={personality === null}
          onClick={() => setPersonality(null)}
        >
          All
        </PersonalityChip>
        {ALL_PERSONALITIES.map((p) => (
          <PersonalityChip
            key={p}
            active={personality === p}
            onClick={() => setPersonality(p)}
          >
            <span aria-hidden>{PERSONALITY_EMOJI[p]}</span>
            {p}
          </PersonalityChip>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
          Generation
        </span>
        <PersonalityChip
          active={generation === null}
          onClick={() => setGeneration(null)}
        >
          All
        </PersonalityChip>
        {ALL_GENERATIONS.map((g) => (
          <PersonalityChip
            key={g}
            active={generation === g}
            onClick={() => setGeneration(g)}
          >
            {generationOrdinal(g)} gen
          </PersonalityChip>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Showing {filtered.length} of {CREATURES.length}
      </p>

      {filtered.length === 0 ? (
        <div className="mx-auto mt-8 flex min-h-[240px] max-w-md flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center backdrop-blur-sm">
          <span aria-hidden className="text-4xl">🔍</span>
          <p className="text-stone-600">No creatures match these filters.</p>
          <button
            type="button"
            onClick={() => {
              setElement(null);
              setPersonality(null);
              setGeneration(null);
            }}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((creature) => (
            <li key={creature.id}>
              <CreatureTile
                creature={creature}
                onClick={(e) => handleCardClick(e, creature.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {active && (
        <Lightbox
          creature={active}
          index={lightboxIndex ?? 0}
          total={filtered.length}
          onClose={closeLightbox}
          onPrev={prev}
          onNext={next}
        />
      )}
    </main>
  );
}
