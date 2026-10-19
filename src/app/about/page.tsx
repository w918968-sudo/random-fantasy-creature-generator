import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Random Fantasy Creature Generator does — a free, browser-based tool that rolls original fantasy creatures.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <StaticPage title="About">
      <p>
        Random Fantasy Creature Generator is a free, browser-based tool for
        rolling original fantasy creatures. Every creature has its own name,
        one-line story, and a set of traits — all written for this site, not
        taken from any existing game or franchise.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">What you can do</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Generate one creature at a time — no repeats until you have seen them all.</li>
          <li>Save favorites, kept locally in your browser.</li>
          <li>Share a creature by link, download a 4:5 share image, or use your device&apos;s share sheet.</li>
          <li>Browse every published creature on its own page.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">How it works</h2>
        <p>
          Everything runs locally in your browser — no account and no
          server-side storage. Your favorites are saved to your own device&apos;s
          localStorage.
        </p>
      </section>

      <p className="rounded-xl bg-white/70 p-4 text-sm text-stone-600 ring-1 ring-stone-200 backdrop-blur-sm">
        All creatures on this site are original content. Any resemblance to
        existing characters is coincidental.
      </p>
    </StaticPage>
  );
}
