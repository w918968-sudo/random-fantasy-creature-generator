"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CREATURES } from "@/lib/data/creatures";
import { dailyIndex } from "@/lib/daily";
import { CreatureCard } from "@/components/creature-card";
import type { Creature } from "@/lib/types";

function timeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

/**
 * "Creature of the day" — one creature, stable per local date. Computed on
 * mount only, so the static HTML shell doesn't bake in a build-date creature
 * (which would mismatch hydration once the date changes). A reason to return.
 */
export function DailyCreature() {
  const [creature, setCreature] = useState<Creature | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setCreature(CREATURES[dailyIndex(now, CREATURES.length)]);
    setCountdown(timeUntilMidnight());
  }, []);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <header className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
          ✦ Creature of the day ✦
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-stone-900 sm:text-4xl">
          Today&apos;s creature
        </h1>
        {countdown && (
          <p className="mt-2 text-sm text-stone-500">
            A new one arrives in {countdown}
          </p>
        )}
      </header>

      {creature ? (
        <CreatureCard creature={creature} />
      ) : (
        <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 backdrop-blur-sm">
          <span className="text-stone-400">Rolling today&apos;s creature…</span>
        </div>
      )}

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:bg-white"
        >
          ← Generate your own
        </Link>
      </p>
    </main>
  );
}
