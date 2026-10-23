/**
 * Shared 2nd-gen derivation helpers: the generation-2 title ladder plus the
 * "evolved" name / description / traits transforms. Used by
 * scripts/build-gen2-data.mjs (dry-run + data stamp) and
 * scripts/finalize-gen2.mjs (WebP convert + image stamp), so the two always
 * agree on ids and titles.
 */

/** Generation-2 title pool (mature tier). Order matters for hash rotation. */
export const GEN2_TITLES = [
  "Elder",
  "Ancient",
  "Grand",
  "Noble",
  "Prime",
  "Venerable",
  "Regal",
  "Sage",
];

/** 32-bit FNV-1a (same algorithm as src/lib/daily.ts). */
export function fnv1a(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function titleFor(id) {
  return GEN2_TITLES[fnv1a(id) % GEN2_TITLES.length];
}

/**
 * "Evolved" description: keep the original one-liner (so lineage/SEO is
 * preserved) and append a generation-2 evolution sentence.
 */
export function evolvedDescription(c, title) {
  return (
    `${c.description} It has evolved into its ${title.toLowerCase()} form — ` +
    `larger, wiser, and far more powerful, its ${c.element.toLowerCase()} ` +
    `essence now commanding and unmistakable.`
  );
}

/**
 * Lightly intensify the original traits so the gen-2 card text reads as an
 * upgrade without rewriting every phrase. Whole-word swap only (case-aware),
 * so "Calms" never collides with the adjective "calm".
 */
const INTENSIFY = {
  faint: "bright",
  tiny: "grand",
  soft: "flowing",
  small: "great",
  quiet: "hushed",
};

export function intensify(text) {
  return text.replace(/\b(faint|tiny|soft|small|quiet)\b/gi, (m) => {
    const rep = INTENSIFY[m.toLowerCase()];
    return m[0] === m[0].toUpperCase() ? rep[0].toUpperCase() + rep.slice(1) : rep;
  });
}

/** Build one gen-2 record from its 1st-gen form. `image` stays null here. */
export function buildGen2(c, title) {
  const name = `${c.name} ${title}`;
  return {
    id: `${c.id}-${title.toLowerCase()}`,
    name,
    description: evolvedDescription(c, title),
    traits: c.traits.map(intensify),
    image: null,
    element: c.element,
    personality: c.personality,
    habitat: c.habitat,
    rarity: c.rarity,
    generation: 2,
    evolvesFrom: c.id,
    alt: `Evolved second-generation artwork of ${name}, a ${c.personality} ${c.element}-element creature.`,
    status: c.status,
  };
}
