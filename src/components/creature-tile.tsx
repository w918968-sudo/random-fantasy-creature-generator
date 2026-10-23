import type { MouseEvent } from "react";
import type { Creature } from "@/lib/types";
import { CreatureImage } from "@/components/creature-image";

/**
 * Compact gallery card: artwork + name + personality. A plain `<a>` so the
 * Gallery can intercept plain left-clicks for its lightbox while modified
 * clicks (new tab) and crawlers still reach the detail page; the element
 * landing pages use it with no onClick for a straight-through link.
 */
export function CreatureTile({
  creature,
  onClick,
}: {
  creature: Creature;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={`/creatures/${creature.id}`}
      onClick={onClick}
      className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-stone-900/5 transition hover:ring-stone-900/15"
    >
      <CreatureImage creature={creature} className="aspect-[4/5] w-full" />
      <div className="px-3 py-2">
        <span className="block truncate font-semibold text-stone-900">
          {creature.name}
        </span>
        <span className="block text-xs text-stone-500">
          {creature.personality}
        </span>
      </div>
    </a>
  );
}
