import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required for static export (`output: "export"`).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/credits`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
