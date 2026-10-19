"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/use-favorites";
import { getCreature } from "@/lib/data/creatures";
import type { Creature } from "@/lib/types";
import { CreatureCard } from "@/components/creature-card";

export function FavoritesList() {
  const { favorites } = useFavorites();
  const creatures = favorites
    .map((id) => getCreature(id))
    .filter((c): c is Creature => Boolean(c));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 sm:px-6">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-stone-600 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>♥</span> Your collection
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-stone-900">
          Favorites
        </h1>
      </header>

      {creatures.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 p-12 text-center backdrop-blur-sm">
          <span aria-hidden className="text-5xl">♡</span>
          <p className="max-w-sm text-stone-600">
            You haven&apos;t saved any creatures yet.{" "}
            <Link
              href="/"
              className="font-semibold text-stone-900 underline decoration-2 underline-offset-2 hover:text-stone-600"
            >
              Generate one
            </Link>{" "}
            and tap the heart.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creatures.map((creature) => (
            <CreatureCard key={creature.id} creature={creature} />
          ))}
        </div>
      )}
    </main>
  );
}
