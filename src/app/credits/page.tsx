import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Credits",
  description:
    "Content, image-generation, and library credits for Random Fantasy Creature Generator.",
  alternates: { canonical: "/credits" },
};

export default function CreditsPage() {
  return (
    <StaticPage title="Credits">
      <p>
        This site ships only original content — no third-party character data,
        artwork, or game mechanics.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Content</h2>
        <p>
          All creature names, descriptions, and traits are written for this
          site.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Artwork</h2>
        <p>
          Creature artwork is generated with{" "}
          <span className="font-medium">Volcano Ark</span> (Seedream, model{" "}
          <span className="font-medium">doubao-seedream-5-0-pro</span>).
        </p>
        <p className="rounded-xl bg-amber-100/70 p-4 text-sm text-amber-800 ring-1 ring-amber-300">
          <span className="font-semibold">Status: VERIFY.</span> Commercial-use
          rights and any attribution requirement are being confirmed against the
          provider&apos;s current terms of service; the date and link will be
          recorded here once verified. Until then this is not claimed as
          licensed for commercial use.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Libraries</h2>
        <ul className="mt-2 space-y-2">
          <li>
            <span className="font-medium">Next.js</span> and{" "}
            <span className="font-medium">Tailwind CSS</span> — the site framework
            and styling.
          </li>
          <li>
            <span className="font-medium">Geist</span> — typeface (bundled with
            Next.js).
          </li>
        </ul>
      </section>
    </StaticPage>
  );
}
