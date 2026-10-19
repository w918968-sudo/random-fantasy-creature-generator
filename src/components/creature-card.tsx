"use client";

import type { CSSProperties } from "react";
import type { Creature } from "@/lib/types";
import { useFavorites } from "@/lib/use-favorites";
import { CreatureImage } from "@/components/creature-image";
import { ShareButton } from "@/components/share-button";
import { ElementBadge } from "@/components/element-badge";
import { PersonalityBadge } from "@/components/personality-badge";
import { ELEMENT_COLORS } from "@/lib/elements";

/**
 * The v1 result card: element-framed artwork, name, one-line description,
 * traits, plus favorite and share actions. Favorite state is self-managed via
 * the shared store.
 */
export function CreatureCard({ creature }: { creature: Creature }) {
  const { favorites, toggle } = useFavorites();
  const isFavorite = favorites.includes(creature.id);
  const colors = ELEMENT_COLORS[creature.element];

  return (
    <article
      className="animate-pulse-glow overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-stone-900/5"
      style={{ "--glow": `${colors.from}66` } as CSSProperties}
    >
      <div className="relative">
        <CreatureImage creature={creature} className="aspect-[4/5] w-full" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <ElementBadge element={creature.element} />
          <PersonalityBadge personality={creature.personality} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-stone-900">
            {creature.name}
          </h2>
          <button
            type="button"
            onClick={() => toggle(creature.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl leading-none ring-1 ring-stone-200 transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            style={{
              color: isFavorite ? "#f43f5e" : "#a8a29e",
              background: isFavorite ? "#fff1f2" : "#fafaf9",
              boxShadow: isFavorite
                ? "0 0 0 3px rgba(244,63,94,0.15)"
                : "none",
            }}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          {creature.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {creature.traits.map((trait) => (
            <li
              key={trait}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                color: colors.to,
                background: `${colors.from}14`,
                boxShadow: `inset 0 0 0 1px ${colors.from}40`,
              }}
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: colors.from }}
              />
              {trait}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
          <ShareButton creature={creature} />
          <a
            href={`/creatures/${creature.id}`}
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-white transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          >
            View →
          </a>
        </div>
      </div>
    </article>
  );
}
