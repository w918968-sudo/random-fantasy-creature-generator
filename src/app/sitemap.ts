import type { MetadataRoute } from "next";
import { CREATURES } from "@/lib/data/creatures";
import {
  ALL_ELEMENTS,
  ALL_HABITATS,
  ALL_PERSONALITIES,
  ALL_RARITIES,
} from "@/lib/types";
import { elementSlug } from "@/lib/elements";
import { habitatSlug } from "@/lib/habitats";
import { personalitySlug } from "@/lib/personalities";
import { raritySlug } from "@/lib/rarities";
import { ALL_GENERATIONS, generationSlug } from "@/lib/generations";
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

  const elementEntries = ALL_ELEMENTS.map((element) => ({
    url: `${SITE_URL}/elements/${elementSlug(element)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const habitatEntries = ALL_HABITATS.map((habitat) => ({
    url: `${SITE_URL}/habitats/${habitatSlug(habitat)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const personalityEntries = ALL_PERSONALITIES.map((personality) => ({
    url: `${SITE_URL}/personalities/${personalitySlug(personality)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const rarityEntries = ALL_RARITIES.map((rarity) => ({
    url: `${SITE_URL}/rarities/${raritySlug(rarity)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const generationEntries = ALL_GENERATIONS.map((generation) => ({
    url: `${SITE_URL}/generations/${generationSlug(generation)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const comboEntries = ALL_ELEMENTS.flatMap((element) =>
    ALL_PERSONALITIES.map((personality) => ({
      url: `${SITE_URL}/elements/${elementSlug(element)}/personalities/${personalitySlug(personality)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );

  // /favorites is intentionally excluded — it is a per-browser, personalized
  // page, not public SEO content (see requirements §3.4 / §8.3).
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/creatures`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/daily`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/credits`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...elementEntries,
    ...habitatEntries,
    ...personalityEntries,
    ...rarityEntries,
    ...generationEntries,
    ...comboEntries,
    ...creatureEntries,
  ];
}
