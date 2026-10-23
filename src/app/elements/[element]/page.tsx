import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES } from "@/lib/data/creatures";
import { ALL_ELEMENTS, ALL_PERSONALITIES } from "@/lib/types";
import type { Element, Personality } from "@/lib/types";
import {
  ELEMENT_COLORS,
  ELEMENT_DESCRIPTIONS,
  ELEMENT_EMOJI,
  elementSlug,
  getElementBySlug,
} from "@/lib/elements";
import { PERSONALITY_EMOJI, personalitySlug } from "@/lib/personalities";
import { CreatureTile } from "@/components/creature-tile";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Only the six element slugs we generate are valid; anything else 404s on a
// static host.
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_ELEMENTS.map((el) => ({ element: elementSlug(el) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ element: string }>;
}): Promise<Metadata> {
  const { element } = await params;
  const el = getElementBySlug(element);
  if (!el) return { title: "Not found" };

  const count = CREATURES.filter((c) => c.element === el).length;
  const description = `${ELEMENT_DESCRIPTIONS[el]} Browse all ${count} ${el} creatures — names, traits, and artwork.`;

  return {
    title: `${el} Creatures`,
    description,
    alternates: { canonical: `/elements/${elementSlug(el)}` },
    openGraph: {
      title: `${el} Creatures`,
      description,
      url: `/elements/${elementSlug(el)}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${el} Creatures`,
      description,
    },
  };
}

export default async function ElementPage({
  params,
}: {
  params: Promise<{ element: string }>;
}) {
  const { element } = await params;
  const el = getElementBySlug(element);

  if (!el) {
    // Unreachable for generated slugs; guards against a malformed catalog.
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-stone-600">
        This element doesn&apos;t exist.
      </main>
    );
  }

  const creatures = CREATURES.filter((c) => c.element === el);
  const colors = ELEMENT_COLORS[el];
  const emoji = ELEMENT_EMOJI[el];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${el} Fantasy Creatures`,
    description: ELEMENT_DESCRIPTIONS[el],
    url: `${SITE_URL}/elements/${elementSlug(el)}`,
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
        <span className="font-semibold text-stone-800">{el}</span>
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
          {el} Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          {ELEMENT_DESCRIPTIONS[el]}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✨</span>
          {creatures.length} {el} creatures
        </p>
      </header>

      <nav
        aria-label="Elements"
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {ALL_ELEMENTS.map((e: Element) => {
          const active = e === el;
          return (
            <Link
              key={e}
              href={`/elements/${elementSlug(e)}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${
                active
                  ? "bg-stone-900 text-white shadow"
                  : "bg-white/70 text-stone-600 ring-1 ring-stone-900/10 hover:bg-white hover:text-stone-900"
              }`}
            >
              <span aria-hidden>{ELEMENT_EMOJI[e]}</span>
              {e}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
          {el} creatures by personality
        </p>
        <nav
          aria-label="Personalities"
          className="mt-2 flex flex-wrap justify-center gap-2"
        >
          {ALL_PERSONALITIES.map((p: Personality) => (
            <Link
              key={p}
              href={`/elements/${elementSlug(el)}/personalities/${personalitySlug(p)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-900/10 transition hover:bg-white hover:text-stone-900"
            >
              <span aria-hidden>{PERSONALITY_EMOJI[p]}</span>
              {p}
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
