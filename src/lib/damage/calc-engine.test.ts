import { describe, it, expect } from "vitest";
import { smokeTest } from "./calc-engine";

describe("calc-engine benchmark (gen 9 Scarlet/Violet)", () => {
  it("matches the fixed Thunderbolt vs Gyarados reference range", () => {
    const { range, desc } = smokeTest();
    // Reference values produced by @smogon/calc 0.12.0, cross-checked by hand.
    expect(range).toEqual({ min: 376, max: 448 });
    expect(desc).toContain("guaranteed OHKO");
  });
});
