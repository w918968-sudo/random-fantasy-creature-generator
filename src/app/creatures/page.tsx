import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Gallery } from "@/components/gallery";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "All Fantasy Creatures",
  description:
    "Browse all 432 original fantasy creatures — every Ember, Tide, Grove, Storm, Crystal, and Dusk companion across two generations, with its element, personality, and traits.",
  alternates: { canonical: "/creatures" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "All Fantasy Creatures",
  description:
    "Browse all 432 original fantasy creatures across two generations, filterable by element, personality, and generation.",
  url: `${SITE_URL}/creatures`,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
};

export default function CreaturesPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Gallery />
    </>
  );
}
