import type { Metadata } from "next";
import Link from "next/link";
import { CREATURES, getCreature } from "@/lib/data/creatures";
import { CreatureCard } from "@/components/creature-card";
import { SITE_URL } from "@/lib/site";

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

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <CreatureCard creature={creature} />
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
