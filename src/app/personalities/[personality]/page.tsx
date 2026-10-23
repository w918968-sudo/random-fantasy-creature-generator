import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES } from "@/lib/data/creatures";
import { ALL_ELEMENTS, ALL_PERSONALITIES } from "@/lib/types";
import type { Element, Personality } from "@/lib/types";
import {
  PERSONALITY_COLORS,
  PERSONALITY_DESCRIPTIONS,
  PERSONALITY_EMOJI,
  personalitySlug,
  getPersonalityBySlug,
} from "@/lib/personalities";
import { ELEMENT_EMOJI, elementSlug } from "@/lib/elements";
import { CreatureTile } from "@/components/creature-tile";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Only the six personality slugs we generate are valid; anything else 404s on
// a static host.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_PERSONALITIES.map((p) => ({ personality: personalitySlug(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ personality: string }>;
}): Promise<Metadata> {
  const { personality } = await params;
  const p = getPersonalityBySlug(personality);
  if (!p) return { title: "Not found" };

  const count = CREATURES.filter((c) => c.personality === p).length;
  const description = `${PERSONALITY_DESCRIPTIONS[p]} Browse all ${count} ${p} creatures — names, traits, and artwork.`;

  return {
    title: `${p} Creatures`,
    description,
    alternates: { canonical: `/personalities/${personalitySlug(p)}` },
    openGraph: {
      title: `${p} Creatures`,
      description,
      url: `/personalities/${personalitySlug(p)}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${p} Creatures`,
      description,
    },
  };
}

export default async function PersonalityPage({
  params,
}: {
  params: Promise<{ personality: string }>;
}) {
  const { personality } = await params;
  const p = getPersonalityBySlug(personality);

  if (!p) {
    // Unreachable for generated slugs; guards against a malformed catalog.
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-stone-600">
        This personality doesn&apos;t exist.
      </main>
    );
  }

  const creatures = CREATURES.filter((c) => c.personality === p);
  const colors = PERSONALITY_COLORS[p];
  const emoji = PERSONALITY_EMOJI[p];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${p} Fantasy Creatures`,
    description: PERSONALITY_DESCRIPTIONS[p],
    url: `${SITE_URL}/personalities/${personalitySlug(p)}`,
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
        <span className="font-semibold text-stone-800">{p}</span>
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
          {p} Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          {PERSONALITY_DESCRIPTIONS[p]}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✨</span>
          {creatures.length} {p} creatures
        </p>
      </header>

      <nav
        aria-label="Personalities"
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {ALL_PERSONALITIES.map((personality: Personality) => {
          const active = personality === p;
          return (
            <Link
              key={personality}
              href={`/personalities/${personalitySlug(personality)}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-stone-900 text-white shadow"
                  : "bg-white/70 text-stone-600 ring-1 ring-stone-900/10 hover:bg-white hover:text-stone-900"
              }`}
            >
              <span aria-hidden>{PERSONALITY_EMOJI[personality]}</span>
              {personality}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
          {p} creatures by element
        </p>
        <nav
          aria-label="Elements"
          className="mt-2 flex flex-wrap justify-center gap-2"
        >
          {ALL_ELEMENTS.map((e: Element) => (
            <Link
              key={e}
              href={`/elements/${elementSlug(e)}/personalities/${personalitySlug(p)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-900/10 transition hover:bg-white hover:text-stone-900"
            >
              <span aria-hidden>{ELEMENT_EMOJI[e]}</span>
              {e}
            </Link>
          ))}
        </nav>
      </div>

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
