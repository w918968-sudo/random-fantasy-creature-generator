import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Credits & Data Sources",
  description:
    "Data sources, licenses, and image-licensing status for Random Pokémon Generator.",
  alternates: { canonical: "/credits" },
};

export default function CreditsPage() {
  return (
    <StaticPage title="Credits &amp; Data Sources">
      <p>
        This tool is built from open datasets and libraries. Pokémon names,
        designs, and game data are third-party intellectual property.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Libraries</h2>
        <ul className="mt-2 space-y-2">
          <li>
            <span className="font-medium">@smogon/calc</span> (v0.12.0, MIT) — the
            damage-calculation engine behind the Scarlet/Violet damage calculator.
          </li>
          <li>
            <span className="font-medium">@pkmn/dex</span> (v0.10.11, MIT) — source
            of the move and learnset data, derived from Pokémon Showdown.
          </li>
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

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Data sources</h2>
        <ul className="mt-2 space-y-2">
          <li>
            <span className="font-medium">PokéAPI</span> — species base data
            (Pokédex numbers, types, base stats, abilities, evolution, dimensions).
            This data originates from the Pokémon games and belongs to Nintendo /
            The Pokémon Company; it is used here for a non-commercial fan tool.
          </li>
          <li>
            <span className="font-medium">Pokémon Showdown</span> (via @pkmn/dex) —
            competitive move and learnset data.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Images</h2>
        <p>
          <span className="font-medium">Status: placeholder.</span> Official
          Pokémon promotional art is not yet licensed (Pokémon Support,
          2026-01-30), so the UI currently renders clearly-marked placeholders
          instead of Pokémon artwork. Shiny images are likewise not available
          until licensed. This is a known launch blocker — disclaimers do not
          substitute for a license.
        </p>
      </section>

      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
        Pokémon and Pokémon character names are trademarks of Nintendo. This fan
        tool is not affiliated with or endorsed by Nintendo, Game Freak, or The
        Pokémon Company.
      </p>
    </StaticPage>
  );
}
