import type { Metadata } from "next";
import { SurpriseRoll } from "@/components/surprise-roll";

export const metadata: Metadata = {
  title: "Surprise Me",
  description:
    "Roll a surprise original fantasy creature — one tap, one random companion.",
  // Content is rendered client-side and random, not unique crawlable content.
  robots: { index: false, follow: true },
};

export default function RandomPage() {
  return <SurpriseRoll />;
}
