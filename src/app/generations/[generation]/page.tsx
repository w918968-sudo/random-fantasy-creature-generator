import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES } from "@/lib/data/creatures";
import {
  ALL_GENERATIONS,
  GENERATION_COLORS,
  GENERATION_DESCRIPTIONS,
  GENERATION_EMOJI,
  generationLabel,
  generationOf,
  generationOrdinal,
  generationSlug,
  getGenerationBySlug,
} from "@/lib/generations";
import { CreatureTile } from "@/components/creature-tile";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Only the generation slugs we generate are valid; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_GENERATIONS.map((g) => ({ generation: generationSlug(g) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ generation: string }>;
}): Promise<Metadata> {
  const { generation } = await params;
  const gen = getGenerationBySlug(generation);
  if (gen === undefined) return { title: "Not found" };

  const label = generationLabel(gen);
  const title = `${generationOrdinal(gen)} Generation Creatures`;
  const count = CREATURES.filter((c) => generationOf(c) === gen).length;
  const description = `${GENERATION_DESCRIPTIONS[gen]} Browse all ${count} ${label} creatures — names, traits, and artwork.`;

  return {
    title,
    description,
    alternates: { canonical: `/generations/${generationSlug(gen)}` },
    openGraph: {
      title,
      description,
      url: `/generations/${generationSlug(gen)}`,
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ generation: string }>;
}) {
  const { generation } = await params;
  const gen = getGenerationBySlug(generation);

  if (gen === undefined) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-stone-600">
        This generation doesn&apos;t exist.
      </main>
    );
  }

  const creatures = CREATURES.filter((c) => generationOf(c) === gen);
  const colors = GENERATION_COLORS[gen];
  const emoji = GENERATION_EMOJI[gen];
  const label = generationLabel(gen);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${generationOrdinal(gen)} Generation Fantasy Creatures`,
    description: GENERATION_DESCRIPTIONS[gen],
    url: `${SITE_URL}/generations/${generationSlug(gen)}`,
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
        <span className="font-semibold text-stone-800">
          {generationOrdinal(gen)} generation
        </span>
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
          {generationOrdinal(gen)} Generation Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          {GENERATION_DESCRIPTIONS[gen]}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✨</span>
          {creatures.length} {label} creatures
        </p>
      </header>

      <nav
        aria-label="Generations"
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {ALL_GENERATIONS.map((g) => {
          const active = g === gen;
          return (
            <Link
              key={g}
              href={`/generations/${generationSlug(g)}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-stone-900 text-white shadow"
                  : "bg-white/70 text-stone-600 ring-1 ring-stone-900/10 hover:bg-white hover:text-stone-900"
              }`}
            >
              <span aria-hidden>{GENERATION_EMOJI[g]}</span>
              {generationOrdinal(g)} gen
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
