import { describe, expect, it } from "vitest";
import { createShuffleBag, drawNext, shuffle } from "@/lib/generator/shuffle-bag";

/** Deterministic LCG so shuffle order is reproducible in tests. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const IDS = ["a", "b", "c", "d"];

describe("shuffle", () => {
  it("returns a permutation of the input", () => {
    const out = shuffle(IDS, lcg(1));
    expect(out).toHaveLength(IDS.length);
    expect([...out].sort()).toEqual([...IDS].sort());
  });

  it("is deterministic for the same seed", () => {
    expect(shuffle(IDS, lcg(42))).toEqual(shuffle(IDS, lcg(42)));
  });

  it("does not mutate the input", () => {
    const input = [...IDS];
    shuffle(input, lcg(1));
    expect(input).toEqual(IDS);
  });
});

describe("shuffle bag", () => {
  it("draws every id exactly once before repeating", () => {
    const rng = lcg(7);
    let bag = createShuffleBag(IDS, rng);
    const seen: string[] = [];
    for (let i = 0; i < IDS.length; i++) {
      const next = drawNext(bag, rng)!;
      seen.push(next.id);
      bag = next.bag;
    }
    expect([...seen].sort()).toEqual([...IDS].sort());
  });

  it("starts a fresh round when exhausted", () => {
    const rng = lcg(7);
    let bag = createShuffleBag(["x"], rng);
    const first = drawNext(bag, rng)!;
    bag = first.bag;
    const second = drawNext(bag, rng)!;
    expect(second.id).toBe("x");
  });

  it("returns null for an empty bag", () => {
    const bag = createShuffleBag([], lcg(1));
    expect(drawNext(bag, lcg(1))).toBeNull();
  });
});
