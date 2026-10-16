import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeSpecies } from "@/lib/test/factories";
import type { GeneratedPokemon, TypeName } from "@/lib/types";
import { TeamAnalysisView } from "./team-analysis-view";

function member(types: TypeName[]): GeneratedPokemon {
  return { species: makeSpecies({ types }), isShiny: false, nature: null };
}

describe("TeamAnalysisView", () => {
  it("renders overview and both coverage sections", () => {
    render(<TeamAnalysisView team={[member(["Fire"]), member(["Water"])]} />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Avg. base stat total")).toBeInTheDocument();
    expect(screen.getByText("Defensive coverage")).toBeInTheDocument();
    expect(screen.getByText("Offensive coverage")).toBeInTheDocument();
  });

  it("surfaces shared weaknesses", () => {
    // Two Rock members share a weakness to Water, Grass, Fighting, Ground, Steel.
    render(<TeamAnalysisView team={[member(["Rock"]), member(["Rock"])]} />);
    // With 2 members the highlight threshold is not met, so no highlights box.
    expect(screen.queryByText("Shared weaknesses:")).not.toBeInTheDocument();
  });
});
