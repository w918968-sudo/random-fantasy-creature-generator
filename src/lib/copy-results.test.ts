import { describe, it, expect } from "vitest";
import { makeSpecies } from "@/lib/test/factories";
import { buildCopyText, formatResultLine } from "./copy-results";

describe("copy results", () => {
  it("formats a line with dex, types, shiny and nature", () => {
    const s = makeSpecies({
      speciesId: "bulbasaur",
      name: "Bulbasaur",
      nationalDexNumber: 1,
      types: ["Grass", "Poison"],
    });
    const line = formatResultLine({
      species: s,
      isShiny: true,
      nature: "Adamant",
    });
    expect(line).toBe("Bulbasaur #0001 · Grass/Poison · Shiny · Nature: Adamant");
  });

  it("omits shiny/nature when absent and skips null slots", () => {
    const s = makeSpecies({ name: "Pikachu", nationalDexNumber: 25, types: ["Electric"] });
    const text = buildCopyText([
      null,
      { species: s, isShiny: false, nature: null },
      null,
    ]);
    expect(text).toBe("Pikachu #0025 · Electric");
  });
});
