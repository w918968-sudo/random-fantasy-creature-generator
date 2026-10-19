"use client";

import type { ReactNode } from "react";
import type { Element, Personality } from "@/lib/types";
import { ALL_ELEMENTS, ALL_PERSONALITIES } from "@/lib/types";
import { ELEMENT_EMOJI } from "@/lib/elements";
import { PERSONALITY_EMOJI } from "@/lib/personalities";

function Chip({
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
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ring-1 ${
        active
          ? "bg-stone-900 text-white ring-stone-900"
          : "bg-white/70 text-stone-600 ring-stone-900/10 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

/** Element + personality filter chips. Single-select per dimension. */
export function FilterPanel({
  element,
  personality,
  onElementChange,
  onPersonalityChange,
}: {
  element: Element | null;
  personality: Personality | null;
  onElementChange: (element: Element | null) => void;
  onPersonalityChange: (personality: Personality | null) => void;
}) {
  return (
    <section
      aria-label="Filters"
      className="mt-8 rounded-[1.75rem] bg-white/60 p-4 ring-1 ring-stone-900/5 backdrop-blur-sm sm:p-5"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
          Element
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip active={element === null} onClick={() => onElementChange(null)}>
            All
          </Chip>
          {ALL_ELEMENTS.map((el) => (
            <Chip
              key={el}
              active={element === el}
              onClick={() => onElementChange(el)}
            >
              <span aria-hidden>{ELEMENT_EMOJI[el]}</span>
              {el}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
          Personality
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip
            active={personality === null}
            onClick={() => onPersonalityChange(null)}
          >
            All
          </Chip>
          {ALL_PERSONALITIES.map((p) => (
            <Chip
              key={p}
              active={personality === p}
              onClick={() => onPersonalityChange(p)}
            >
              <span aria-hidden>{PERSONALITY_EMOJI[p]}</span>
              {p}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
