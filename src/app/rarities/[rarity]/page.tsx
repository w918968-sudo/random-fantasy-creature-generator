import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES } from "@/lib/data/creatures";
import { ALL_RARITIES } from "@/lib/types";
import type { Rarity } from "@/lib/types";
import {
  RARITY_COLORS,
  RARITY_DESCRIPTIONS,
  RARITY_EMOJI,
  raritySlug,
  getRarityBySlug,
} from "@/lib/rarities";
import { CreatureTile } from "@/components/creature-tile";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Only the five rarity slugs we generate are valid; anything else 404s on a
// static host.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_RARITIES.map((r) => ({ rarity: raritySlug(r) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rarity: string }>;
}): Promise<Metadata> {
  const { rarity } = await params;
  const r = getRarityBySlug(rarity);
  if (!r) return { title: "Not found" };

  const count = CREATURES.filter((c) => c.rarity === r).length;
  const description = `${RARITY_DESCRIPTIONS[r]} Browse all ${count} ${r} creatures — names, traits, and artwork.`;

  return {
    title: `${r} Creatures`,
    description,
    alternates: { canonical: `/rarities/${raritySlug(r)}` },
    openGraph: {
      title: `${r} Creatures`,
      description,
      url: `/rarities/${raritySlug(r)}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${r} Creatures`,
      description,
    },
  };
}

export default async function RarityPage({
  params,
}: {
  params: Promise<{ rarity: string }>;
}) {
  const { rarity } = await params;
  const r = getRarityBySlug(rarity);

  if (!r) {
    // Unreachable for generated slugs; guards against a malformed catalog.
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-stone-600">
        This rarity doesn&apos;t exist.
      </main>
    );
  }

  const creatures = CREATURES.filter((c) => c.rarity === r);
  const colors = RARITY_COLORS[r];
  const emoji = RARITY_EMOJI[r];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${r} Fantasy Creatures`,
    description: RARITY_DESCRIPTIONS[r],
    url: `${SITE_URL}/rarities/${raritySlug(r)}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
      <JsonLd data={jsonLd} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-stone-500">
        <Link href="/" className="transition hover:text-stone-700">
          Home
        </Link>
        <span aria-hidden> / </span>
        <Link href="/creatures" className="transition hover:text-stone-700">
          Creatures
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">{r}</span>
      </nav>

      <header className="mx-auto max-w-2xl text-center">
        <div
          aria-hidden
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl text-4xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
        >
          {emoji}
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-stone-900 sm:text-5xl">
          {r} Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          {RARITY_DESCRIPTIONS[r]}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✨</span>
          {creatures.length} {r} creatures
        </p>
      </header>

      <nav
        aria-label="Rarities"
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {ALL_RARITIES.map((rarity: Rarity) => {
          const active = rarity === r;
          return (
            <Link
              key={rarity}
              href={`/rarities/${raritySlug(rarity)}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-stone-900 text-white shadow"
                  : "bg-white/70 text-stone-600 ring-1 ring-stone-900/10 hover:bg-white hover:text-stone-900"
              }`}
            >
              <span aria-hidden>{RARITY_EMOJI[rarity]}</span>
              {rarity}
            </Link>
          );
        })}
      </nav>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {creatures.map((creature) => (
          <li key={creature.id}>
            <CreatureTile creature={creature} />
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center">
        <Link
          href="/creatures"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:bg-white"
        >
          ← Back to all creatures
        </Link>
      </p>
    </main>
  );
}
