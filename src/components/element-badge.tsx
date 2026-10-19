import type { Element } from "@/lib/types";
import { ELEMENT_COLORS, ELEMENT_EMOJI } from "@/lib/elements";

/** Small colored pill identifying a creature's element. Server-compatible. */
export function ElementBadge({
  element,
  className,
}: {
  element: Element;
  className?: string;
}) {
  const colors = ELEMENT_COLORS[element];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
    >
      <span aria-hidden>{ELEMENT_EMOJI[element]}</span>
      {element}
    </span>
  );
}
