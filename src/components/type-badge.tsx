import type { TypeName } from "@/lib/types";

export const TYPE_STYLES: Record<TypeName, string> = {
  Normal: "bg-neutral-400 text-white",
  Fire: "bg-orange-500 text-white",
  Water: "bg-blue-500 text-white",
  Electric: "bg-yellow-400 text-black",
  Grass: "bg-green-500 text-white",
  Ice: "bg-cyan-400 text-black",
  Fighting: "bg-red-700 text-white",
  Poison: "bg-purple-500 text-white",
  Ground: "bg-amber-600 text-white",
  Flying: "bg-sky-500 text-white",
  Psychic: "bg-pink-500 text-white",
  Bug: "bg-lime-500 text-black",
  Rock: "bg-stone-500 text-white",
  Ghost: "bg-indigo-600 text-white",
  Dragon: "bg-indigo-500 text-white",
  Dark: "bg-neutral-700 text-white",
  Steel: "bg-slate-400 text-white",
  Fairy: "bg-pink-400 text-black",
};

export function TypeBadge({ type }: { type: TypeName }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLES[type]}`}
    >
      {type}
    </span>
  );
}
