"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CREATURES } from "@/lib/data/creatures";
import type { Creature } from "@/lib/types";
import { CreatureCard } from "@/components/creature-card";
import { SummonBurst } from "@/components/summon-burst";
import { trackEvent } from "@/lib/analytics";

/** How long the "rolling" beat lasts before the reveal (ms). */
const ROLL_DURATION = 550;

/**
 * "Surprise me" — a single-tap random reveal. No filters, no batches: one
 * creature, a short shuffle beat, then the card pops in. Re-rolls never land
 * on the same creature twice in a row. Rolls on mount so the page opens with a
 * reveal already in motion.
 */
export function SurpriseRoll() {
  const [creature, setCreature] = useState<Creature | null>(null);
  // Starts true because the first roll fires on mount.
  const [rolling, setRolling] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastIdRef = useRef<string | null>(null);

  const roll = useCallback(() => {
    setRolling(true);
    setCreature(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      let next = CREATURES[Math.floor(Math.random() * CREATURES.length)];
      // Avoid landing on the same creature twice in a row.
      if (CREATURES.length > 1) {
        while (next.id === lastIdRef.current) {
          next = CREATURES[Math.floor(Math.random() * CREATURES.length)];
        }
      }
      lastIdRef.current = next.id;
      setCreature(next);
      setRolling(false);
      trackEvent("surprise_roll", { creature: next.id });
    }, ROLL_DURATION);
  }, []);

  useEffect(() => {
    roll();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [roll]);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
          ✦ Surprise me ✦
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-stone-900 sm:text-4xl">
          One tap, one surprise
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-stone-600">
          No filters, no batches — just a random original creature, rolled
          fresh.
        </p>
      </header>

      <div className="mt-8">
        {creature ? (
          <div className="animate-pop-in relative" key={creature.id}>
            <SummonBurst creature={creature} />
            <CreatureCard creature={creature} />
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[1.75rem] border-2 border-dashed border-stone-300 bg-white/60 text-center backdrop-blur-sm">
            <span aria-hidden className="animate-spin-slow text-5xl">🎲</span>
            <p className="text-sm font-semibold text-stone-500">Rolling…</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={roll}
          disabled={rolling}
          className="btn-game"
        >
          <span aria-hidden className="text-lg">🎲</span>
          {creature ? "Roll again" : "Roll"}
        </button>
      </div>
    </main>
  );
}
