"use client";

import { useMemo, useState } from "react";
import type { Move, MoveCategory } from "@/lib/types";
import { MOVES } from "@/lib/data/moves";
import { getLearnset } from "@/lib/data/learnsets";
import { TypeBadge } from "./type-badge";

const CATEGORY_LABEL: Record<MoveCategory, string> = {
  Physical: "Physical",
  Special: "Special",
  Status: "Status",
};

/**
 * Searchable list of a species's Gen 9 moves. This component is loaded on
 * demand (see pokemon-detail.tsx) so the ~1 MB moves/learnset data does not
 * ship in the initial bundle.
 */
export function MoveList({ speciesId }: { speciesId: string }) {
  const [query, setQuery] = useState("");
  const [showStatus, setShowStatus] = useState(false);

  const moves = useMemo<Move[]>(
    () => getLearnset(speciesId).map((id) => MOVES[id]).filter((m): m is Move => Boolean(m)),
    [speciesId],
  );

  const damagingCount = moves.filter((m) => m.power > 0).length;
  const statusCount = moves.length - damagingCount;

  const q = query.trim().toLowerCase();
  const visible = moves
    .filter((m) => (showStatus ? true : m.power > 0))
    .filter((m) => !q || m.name.toLowerCase().includes(q))
    .sort((a, b) => b.power - a.power || a.name.localeCompare(b.name));

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${moves.length} moves…`}
        aria-label="Search moves"
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {damagingCount} damaging{moves.length !== damagingCount ? ` · ${statusCount} status` : ""}
        </span>
        {statusCount > 0 && (
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showStatus}
              onChange={(e) => setShowStatus(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            Show status moves
          </label>
        )}
      </div>

      <ul className="divide-y divide-slate-100">
        {visible.map((move) => (
          <li key={move.id} className="flex items-center gap-2 py-1.5">
            <TypeBadge type={move.type} />
            <span className="flex-1 text-sm font-medium text-slate-700">{move.name}</span>
            <span className="w-16 text-right text-xs text-slate-500">
              {CATEGORY_LABEL[move.category]}
            </span>
            {move.power > 0 && (
              <span className="w-14 text-right text-xs font-semibold text-slate-600">
                {move.power} BP
              </span>
            )}
          </li>
        ))}
        {visible.length === 0 && (
          <li className="py-2 text-sm text-slate-400">No matching moves.</li>
        )}
      </ul>
    </div>
  );
}
