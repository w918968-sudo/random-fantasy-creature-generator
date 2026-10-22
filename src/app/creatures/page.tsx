import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES } from "@/lib/data/creatures";
import { CreatureImage } from "@/components/creature-image";
import { ELEMENT_EMOJI } from "@/lib/elements";
import { ALL_ELEMENTS } from "@/lib/types";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "All Fantasy Creatures",
  description:
    "Browse all 216 original fantasy creatures — every Ember, Tide, Grove, Storm, Crystal, and Dusk companion with its element, personality, and traits.",
  alternates: { canonical: "/creatures" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "All Fantasy Creatures",
  description:
    "Browse all 216 original fantasy creatures, grouped by element and personality.",
  url: `${SITE_URL}/creatures`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default function CreaturesPage() {
  const groups = ALL_ELEMENTS.map((element) => ({
    element,
    creatures: CREATURES.filter((c) => c.element === element),
  }));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6">
      <JsonLd data={jsonLd} />

      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-extrabold text-stone-900 sm:text-5xl">
          All Fantasy Creatures
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          The complete collection — 216 original creatures across six elements
          and six personalities. Tap any creature to see its full profile.
        </p>
      </header>

      {groups.map(({ element, creatures }) => (
        <section key={element} className="mt-12">
          <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900">
            <span aria-hidden>{ELEMENT_EMOJI[element]}</span>
            {element}
            <span className="text-sm font-normal text-stone-400">
              ({creatures.length})
            </span>
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {creatures.map((creature) => (
              <li key={creature.id}>
                <Link
                  href={`/creatures/${creature.id}`}
                  className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-stone-900/5 transition hover:ring-stone-900/15"
                >
                  <CreatureImage
                    creature={creature}
                    className="aspect-[4/5] w-full"
                  />
                  <div className="px-3 py-2">
                    <span className="block truncate font-semibold text-stone-900">
                      {creature.name}
                    </span>
                    <span className="block text-xs text-stone-500">
                      {creature.personality}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
