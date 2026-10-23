import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES, getCreature } from "@/lib/data/creatures";
import { CreatureCard } from "@/components/creature-card";
import { JsonLd } from "@/components/json-ld";
import { elementSlug } from "@/lib/elements";
import { habitatSlug } from "@/lib/habitats";
import { personalitySlug } from "@/lib/personalities";
import { raritySlug } from "@/lib/rarities";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { generationLabel, generationOf, generationSlug } from "@/lib/generations";

// Only the slugs we generate are valid; anything else 404s on a static host.
export const dynamicParams = false;

export function generateStaticParams() {
  return CREATURES.map((creature) => ({ slug: creature.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creature = getCreature(slug);
  if (!creature) return { title: "Not found" };

  const ogImage = creature.image
    ? {
        url: `${SITE_URL}${creature.image}`,
        width: 1024,
        height: 1280,
        alt: creature.alt,
      }
    : undefined;

  return {
    title: creature.name,
    description: creature.description,
    alternates: { canonical: `/creatures/${creature.id}` },
    openGraph: {
      title: creature.name,
      description: creature.description,
      url: `/creatures/${creature.id}`,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: creature.name,
      description: creature.description,
      images: ogImage ? [ogImage.url] : undefined,
    },
  };
}

export default async function CreaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creature = getCreature(slug);

  if (!creature) {
    // Unreachable for generated slugs; guards against a malformed catalog.
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-stone-600">
        This creature doesn&apos;t exist.
      </main>
    );
  }

  const related = CREATURES.filter(
    (c) => c.element === creature.element && c.id !== creature.id,
  ).slice(0, 4);
  const isEvolved = generationOf(creature) > 1;
  const base = creature.evolvesFrom ? getCreature(creature.evolvesFrom) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: creature.name,
    description: creature.description,
    url: `${SITE_URL}/creatures/${creature.id}`,
    ...(creature.image
      ? { primaryImageOfPage: `${SITE_URL}${creature.image}` }
      : {}),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <JsonLd data={jsonLd} />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <Link href="/" className="transition hover:text-stone-700">
          Home
        </Link>
        <span aria-hidden> / </span>
        <Link href="/creatures" className="transition hover:text-stone-700">
          Creatures
        </Link>
        <span aria-hidden> / </span>
        <span className="font-semibold text-stone-800">{creature.name}</span>
      </nav>

      {base && (
        <p className="mb-4">
          <Link
            href={`/creatures/${base.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 underline decoration-amber-300 underline-offset-4 transition hover:text-amber-900"
          >
            ← Evolved form of {base.name}
          </Link>
        </p>
      )}

      <CreatureCard creature={creature} headingLevel="h1" imagePriority />

      <p className="mt-6 text-sm leading-relaxed text-stone-600">
        {creature.name}{" "}
        {isEvolved
          ? "is the evolved second-generation form of an original"
          : "is an original"}{" "}
        {creature.rarity.toLowerCase()} fantasy creature aligned with{" "}
        {creature.element}, at home in {creature.habitat}, with a{" "}
        {creature.personality.toLowerCase()} nature — one of{" "}
        {CREATURES.length} handcrafted companions you can roll on the home
        page.
      </p>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-stone-500">
            More {creature.element} creatures
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {related.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/creatures/${c.id}`}
                  className="flex flex-col rounded-xl bg-white/70 px-3 py-2 ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:bg-white"
                >
                  <span className="font-semibold text-stone-900">{c.name}</span>
                  <span className="text-xs text-stone-500">{c.personality}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
            <Link
              href={`/elements/${elementSlug(creature.element)}`}
              className="text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
            >
              See all {creature.element} creatures →
            </Link>
            <Link
              href={`/habitats/${habitatSlug(creature.habitat)}`}
              className="text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
            >
              See all {creature.habitat} creatures →
            </Link>
            <Link
              href={`/personalities/${personalitySlug(creature.personality)}`}
              className="text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
            >
              See all {creature.personality} creatures →
            </Link>
            <Link
              href={`/rarities/${raritySlug(creature.rarity)}`}
              className="text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
            >
              See all {creature.rarity} creatures →
            </Link>
            <Link
              href={`/generations/${generationSlug(generationOf(creature))}`}
              className="text-sm font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
            >
              See all {generationLabel(generationOf(creature))} creatures →
            </Link>
          </p>
        </section>
      )}

      <p className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-900/10 backdrop-blur-sm transition hover:bg-white"
        >
          ← Generate another creature
        </Link>
      </p>
    </main>
  );
}
