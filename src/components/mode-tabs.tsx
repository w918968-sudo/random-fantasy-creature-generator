import type { Mode } from "@/lib/types";

const MODES: { id: Mode; label: string }[] = [
  { id: "single", label: "Single Pokémon" },
  { id: "multiple", label: "Multiple Pokémon" },
  { id: "team", label: "Team Generator" },
];

export function ModeTabs({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Generator mode"
      className="flex gap-1 rounded-2xl bg-white/70 p-1 shadow-sm ring-1 ring-black/5 backdrop-blur"
    >
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m.id)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:flex-none ${
              active
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
