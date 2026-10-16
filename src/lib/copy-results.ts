import type { GeneratedPokemon } from "@/lib/types";

/** One line per card: name, form, dex number, types, shiny, nature (§9). */
export function formatResultLine(p: GeneratedPokemon): string {
  const { species, isShiny, nature } = p;
  const dex = `#${String(species.nationalDexNumber).padStart(4, "0")}`;
  const form = species.formName ? ` (${species.formName})` : "";
  const shiny = isShiny ? " · Shiny" : "";
  const nat = nature ? ` · Nature: ${nature}` : "";
  return `${species.name}${form} ${dex} · ${species.types.join("/")}${shiny}${nat}`;
}

export function buildCopyText(results: (GeneratedPokemon | null)[]): string {
  return results
    .filter((r): r is GeneratedPokemon => r !== null)
    .map(formatResultLine)
    .join("\n");
}
