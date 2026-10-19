import { describe, expect, it } from "vitest";
import {
  createShuffleBag,
  drawMany,
  drawNext,
  shuffle,
} from "@/lib/generator/shuffle-bag";

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

describe("drawMany", () => {
  it("draws exactly count distinct ids when count <= pool", () => {
    const rng = lcg(3);
    const bag = createShuffleBag(IDS, rng);
    const { ids } = drawMany(bag, 3, rng);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    expect(ids.every((id) => IDS.includes(id))).toBe(true);
  });

  it("caps the batch at the pool size", () => {
    const bag = createShuffleBag(IDS, lcg(5));
    const { ids, bag: next } = drawMany(bag, 99, lcg(5));
    expect(ids).toHaveLength(IDS.length);
    expect(new Set(ids).size).toBe(IDS.length);
    expect(next.remaining).toHaveLength(0);
  });

  it("never repeats within a batch that spans a round boundary", () => {
    const rng = lcg(11);
    let bag = createShuffleBag(IDS, rng);
    // Drain two ids first so only two remain this round.
    const first = drawMany(bag, 2, rng);
    bag = first.bag;
    expect(bag.remaining).toHaveLength(2);

    // Ask for all four: two come from the tail of this round, two from a
    // fresh round. The batch must still contain no duplicates.
    const { ids } = drawMany(bag, 4, rng);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });

  it("returns an empty batch for an empty pool", () => {
    const bag = createShuffleBag([], lcg(1));
    const { ids, bag: next } = drawMany(bag, 5, lcg(1));
    expect(ids).toEqual([]);
    expect(next).toEqual(bag);
  });
});
