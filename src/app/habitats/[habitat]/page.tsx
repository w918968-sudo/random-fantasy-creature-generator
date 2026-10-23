import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES } from "@/lib/data/creatures";
import { ALL_HABITATS } from "@/lib/types";
import type { Habitat } from "@/lib/types";
import {
  HABITAT_COLORS,
  HABITAT_DESCRIPTIONS,
  HABITAT_EMOJI,
  habitatSlug,
  getHabitatBySlug,
} from "@/lib/habitats";
import { CreatureTile } from "@/components/creature-tile";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Only the five habitat slugs we generate are valid; anything else 404s on a
// static host.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_HABITATS.map((h) => ({ habitat: habitatSlug(h) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ habitat: string }>;
}): Promise<Metadata> {
  const { habitat } = await params;
  const h = getHabitatBySlug(habitat);
  if (!h) return { title: "Not found" };

  const count = CREATURES.filter((c) => c.habitat === h).length;
  const description = `${HABITAT_DESCRIPTIONS[h]} Browse all ${count} ${h} creatures — names, traits, and artwork.`;

  return {
    title: `${h} Creatures`,
    description,
    alternates: { canonical: `/habitats/${habitatSlug(h)}` },
    openGraph: {
      title: `${h} Creatures`,
      description,
      url: `/habitats/${habitatSlug(h)}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${h} Creatures`,
      description,
    },
  };
}

export default async function HabitatPage({
  params,
}: {
  params: Promise<{ habitat: string }>;
}) {
  const { habitat } = await params;
  const h = getHabitatBySlug(habitat);

  if (!h) {
    // Unreachable for generated slugs; guards against a malformed catalog.
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-stone-600">
        This habitat doesn&apos;t exist.
      </main>
    );
  }

  const creatures = CREATURES.filter((c) => c.habitat === h);
  const colors = HABITAT_COLORS[h];
  const emoji = HABITAT_EMOJI[h];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${h} Fantasy Creatures`,
    description: HABITAT_DESCRIPTIONS[h],
    url: `${SITE_URL}/habitats/${habitatSlug(h)}`,
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
        <span className="font-semibold text-stone-800">{h}</span>
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
          {h} Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          {HABITAT_DESCRIPTIONS[h]}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✨</span>
          {creatures.length} {h} creatures
        </p>
      </header>

      <nav
        aria-label="Habitats"
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {ALL_HABITATS.map((habitat: Habitat) => {
          const active = habitat === h;
          return (
            <Link
              key={habitat}
              href={`/habitats/${habitatSlug(habitat)}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-stone-900 text-white shadow"
                  : "bg-white/70 text-stone-600 ring-1 ring-stone-900/10 hover:bg-white hover:text-stone-900"
              }`}
            >
              <span aria-hidden>{HABITAT_EMOJI[habitat]}</span>
              {habitat}
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
