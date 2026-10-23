import { describe, it, expect } from "vitest";
import { dailyIndex } from "./daily";

describe("dailyIndex", () => {
  it("is deterministic for the same calendar day", () => {
    const morning = new Date(2026, 9, 23, 8);
    const night = new Date(2026, 9, 23, 23, 59);
    expect(dailyIndex(morning, 216)).toBe(dailyIndex(night, 216));
  });

  it("stays within range across a full year", () => {
    for (let d = 0; d < 366; d++) {
      const idx = dailyIndex(new Date(2026, 0, 1 + d), 216);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(216);
    }
  });

  it("is not constant day to day", () => {
    const seen = new Set<number>();
    for (let d = 0; d < 30; d++) {
      seen.add(dailyIndex(new Date(2026, 0, 1 + d), 216));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("handles an empty pool", () => {
    expect(dailyIndex(new Date(), 0)).toBe(0);
  });
});
