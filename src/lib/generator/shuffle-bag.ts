/**
 * Shuffle-bag no-repeat generation. Within a round every id is drawn exactly
 * once; when the round is exhausted a fresh shuffled round begins. The bag is
 * held in component state, so a page refresh naturally starts over.
 */

/** Fisher–Yates shuffle, returning a new array (input is not mutated). */
export function shuffle<T>(
  items: readonly T[],
  rng: () => number = Math.random,
): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface ShuffleBag {
  /** Remaining ids in the current round; the next draw is the first entry. */
  remaining: string[];
  /** Full id list used to seed the next round. */
  all: string[];
}

/** Start a fresh round with every id shuffled. */
export function createShuffleBag(
  ids: readonly string[],
  rng: () => number = Math.random,
): ShuffleBag {
  return { remaining: shuffle(ids, rng), all: [...ids] };
}

/** Draw the next id. Reshuffles into a new round when the current one empties. */
export function drawNext(
  bag: ShuffleBag,
  rng: () => number = Math.random,
): { id: string; bag: ShuffleBag } | null {
  if (bag.all.length === 0) return null;
  let remaining = bag.remaining;
  if (remaining.length === 0) {
    remaining = shuffle(bag.all, rng);
  }
  const id = remaining[0];
  return { id, bag: { all: bag.all, remaining: remaining.slice(1) } };
}
