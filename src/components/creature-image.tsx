import type { Creature } from "@/lib/types";
import { ELEMENT_COLORS, ELEMENT_EMOJI } from "@/lib/elements";

/**
 * Creature artwork, or a gradient monogram placeholder until real art is
 * generated. Server-compatible (no client hooks).
 */
export function CreatureImage({
  creature,
  className,
  priority = false,
  fit = "cover",
}: {
  creature: Creature;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  if (creature.image) {
    return (
      <img
        src={creature.image}
        alt={creature.alt}
        width={1024}
        height={1280}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={`object-${fit} ${className ?? ""}`}
      />
    );
  }

  const colors = ELEMENT_COLORS[creature.element];
  const emoji = ELEMENT_EMOJI[creature.element];

  return (
    <div
      role="img"
      aria-label={`${creature.name} — artwork coming soon`}
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(255,255,255,0.32), transparent 55%)",
        }}
      />

      <span
        aria-hidden
        className="absolute select-none text-[7rem] opacity-30"
        style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.25))" }}
      >
        {emoji}
      </span>

      <span
        aria-hidden
        className="absolute h-40 w-40 rounded-full bg-white/25 blur-xl animate-pulse"
      />
      <span
        aria-hidden
        className="absolute h-44 w-44 rounded-full border-2 border-dashed border-white/40 animate-spin-slow"
      />

      <span className="relative grid h-28 w-28 place-items-center rounded-full border-4 border-white/40 bg-white/15 font-display text-5xl font-bold text-white backdrop-blur-sm">
        {creature.name[0]?.toUpperCase()}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
    </div>
  );
}
