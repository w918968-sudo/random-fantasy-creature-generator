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
import {
  PERSONALITY_DESCRIPTIONS,
  PERSONALITY_EMOJI,
  personalitySlug,
  getPersonalityBySlug,
} from "@/lib/personalities";
import { CreatureTile } from "@/components/creature-tile";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Only the 36 element × personality combos we generate are valid.
export const dynamicParams = false;

export function generateStaticParams() {
  const params: { element: string; personality: string }[] = [];
  for (const element of ALL_ELEMENTS) {
    for (const personality of ALL_PERSONALITIES) {
      params.push({
        element: elementSlug(element),
        personality: personalitySlug(personality),
      });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ element: string; personality: string }>;
}): Promise<Metadata> {
  const { element, personality } = await params;
  const el = getElementBySlug(element);
  const p = getPersonalityBySlug(personality);
  if (!el || !p) return { title: "Not found" };

  const count = CREATURES.filter(
    (c) => c.element === el && c.personality === p,
  ).length;
  const description = `${count} ${p} ${el}-element creatures — names, traits, and artwork. ${ELEMENT_DESCRIPTIONS[el]}`;

  return {
    title: `${el} ${p} Creatures`,
    description,
    alternates: {
      canonical: `/elements/${elementSlug(el)}/personalities/${personalitySlug(p)}`,
    },
    openGraph: {
      title: `${el} ${p} Creatures`,
      description,
      url: `/elements/${elementSlug(el)}/personalities/${personalitySlug(p)}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${el} ${p} Creatures`,
      description,
    },
  };
}

export default async function ComboPage({
  params,
}: {
  params: Promise<{ element: string; personality: string }>;
}) {
  const { element, personality } = await params;
  const el = getElementBySlug(element);
  const p = getPersonalityBySlug(personality);

  if (!el || !p) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-stone-600">
        This combination doesn&apos;t exist.
      </main>
    );
  }

  const creatures = CREATURES.filter(
    (c) => c.element === el && c.personality === p,
  );
  const colors = ELEMENT_COLORS[el];
  const emoji = ELEMENT_EMOJI[el];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${el} ${p} Fantasy Creatures`,
    description: `${creatures.length} ${p} ${el}-element creatures.`,
    url: `${SITE_URL}/elements/${elementSlug(el)}/personalities/${personalitySlug(p)}`,
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
        <Link
          href={`/elements/${elementSlug(el)}`}
          className="transition hover:text-stone-700"
        >
          {el}
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
          {el} {p} Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          {PERSONALITY_DESCRIPTIONS[p]}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm">
          <span aria-hidden>✨</span>
          {creatures.length} {p} {el} creatures
        </p>
      </header>

      <nav
        aria-label="Other personalities"
        className="mt-8 flex flex-wrap justify-center gap-2"
      >
        {ALL_PERSONALITIES.map((personality: Personality) => {
          const active = personality === p;
          return (
            <Link
              key={personality}
              href={`/elements/${elementSlug(el)}/personalities/${personalitySlug(personality)}`}
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

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {creatures.map((creature) => (
          <li key={creature.id}>
            <CreatureTile creature={creature} />
          </li>
        ))}
      </ul>

      <p className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
        <Link
          href={`/elements/${elementSlug(el)}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:bg-white"
        >
          ← All {el} creatures
        </Link>
        <Link
          href={`/personalities/${personalitySlug(p)}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:bg-white"
        >
          All {p} creatures →
        </Link>
      </p>
    </main>
  );
}
