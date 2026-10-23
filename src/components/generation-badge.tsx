import { generationOrdinal } from "@/lib/generations";

/** Small gold pill marking an evolved (2nd-gen+) creature. Server-compatible. */
export function GenerationBadge({
  generation,
  className,
}: {
  generation: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${className ?? ""}`}
      style={{ background: "linear-gradient(135deg, #f59e0b, #b45309)" }}
    >
      <span aria-hidden>✨</span>
      {generationOrdinal(generation)} gen
    </span>
  );
}
