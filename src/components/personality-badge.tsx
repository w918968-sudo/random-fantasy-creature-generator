import type { Personality } from "@/lib/types";
import { PERSONALITY_EMOJI } from "@/lib/personalities";

/** Small neutral pill identifying a creature's personality. Server-compatible. */
export function PersonalityBadge({
  personality,
  className,
}: {
  personality: Personality;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm ${className ?? ""}`}
    >
      <span aria-hidden>{PERSONALITY_EMOJI[personality]}</span>
      {personality}
    </span>
  );
}
