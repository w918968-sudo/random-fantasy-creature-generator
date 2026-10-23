import type { Rarity } from "@/lib/types";
import { RARITY_COLORS, RARITY_EMOJI } from "@/lib/rarities";

/** Small colored pill identifying a creature's rarity tier. Server-compatible. */
export function RarityBadge({
  rarity,
  className,
}: {
  rarity: Rarity;
  className?: string;
}) {
  const colors = RARITY_COLORS[rarity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
    >
      <span aria-hidden>{RARITY_EMOJI[rarity]}</span>
      {rarity}
    </span>
  );
}
