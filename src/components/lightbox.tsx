"use client";

import { useEffect, useRef } from "react";
import type { Creature } from "@/lib/types";
import { CreatureImage } from "@/components/creature-image";
import { ElementBadge } from "@/components/element-badge";
import { PersonalityBadge } from "@/components/personality-badge";
import { ShareButton } from "@/components/share-button";
import { useFavorites } from "@/lib/use-favorites";
import { ELEMENT_COLORS } from "@/lib/elements";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen creature viewer. Opens over the gallery, locks page scroll, and
 * supports Esc / ← / → plus a Tab focus trap. Prev/next wrap around the
 * filtered list, so the arrows never dead-end.
 */
export function Lightbox({
  creature,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  creature: Creature;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { favorites, toggle } = useFavorites();
  const isFavorite = favorites.includes(creature.id);
  const colors = ELEMENT_COLORS[creature.element];

  // Lock page scroll and move focus into the dialog on open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Keyboard controls: Esc closes, ←/→ navigate, Tab is trapped inside.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      } else if (e.key === "Tab" && dialogRef.current) {
        const nodes = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        );
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={creature.name}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl sm:flex-row"
      >
        <div className="relative h-[40vh] shrink-0 bg-stone-900 sm:h-auto sm:w-[45%]">
          <CreatureImage
            creature={creature}
            fit="contain"
            className="h-full w-full"
          />

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>

          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous creature"
            className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-lg text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next creature"
            className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-lg text-white backdrop-blur-sm transition hover:bg-black/70"
          >
            <span aria-hidden>›</span>
          </button>

          <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {index + 1} / {total}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold text-stone-900">
                {creature.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <ElementBadge element={creature.element} />
                <PersonalityBadge personality={creature.personality} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggle(creature.id)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl leading-none ring-1 ring-stone-200 transition hover:scale-105"
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

          <p className="mt-3 text-sm leading-relaxed text-stone-600">
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
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-white transition hover:brightness-105"
              style={{
                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              }}
            >
              View full profile →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
