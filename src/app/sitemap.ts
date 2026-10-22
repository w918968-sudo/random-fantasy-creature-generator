import type { MetadataRoute } from "next";
import { CREATURES } from "@/lib/data/creatures";
import { SITE_URL } from "@/lib/site";

// Required for static export (`output: "export"`).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const creatureEntries = CREATURES.map((creature) => ({
    url: `${SITE_URL}/creatures/${creature.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /favorites is intentionally excluded — it is a per-browser, personalized
  // page, not public SEO content (see requirements §3.4 / §8.3).
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/creatures`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/credits`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...creatureEntries,
  ];
}
