import type { Creature } from "@/lib/types";
import { ELEMENT_COLORS } from "@/lib/elements";

/**
 * One-shot light flash + expanding ring when a creature is summoned. Shared by
 * the home generator and the surprise roll so the reveal reads consistently.
 */
export function SummonBurst({ creature }: { creature: Creature }) {
  const colors = ELEMENT_COLORS[creature.element];
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 animate-flash rounded-[1.75rem]"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-40 w-40 animate-burst-ring rounded-full"
        style={{
          border: `3px solid ${colors.from}`,
          boxShadow: `0 0 32px ${colors.from}aa, inset 0 0 32px ${colors.from}66`,
        }}
      />
    </>
  );
}
