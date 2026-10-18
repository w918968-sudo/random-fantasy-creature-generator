import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Random Pokémon Generator does and how it works — a free, browser-based Pokémon team and damage calculator tool.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <StaticPage title="About">
      <p>
        Random Pokémon Generator is a free, browser-based tool for rolling Pokémon
        with filters, building teams, and checking battle matchups. Everything
        runs locally in your browser — no account, no server-side storage.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">What you can do</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Generate a single Pokémon, a group, or a full team of six.</li>
          <li>Filter by generation and type, with advanced filters for evolution stage, forms, hidden abilities, and legendary/mythical exclusion.</li>
          <li>Roll shiny Pokémon, lock results, and reroll individual slots.</li>
          <li>Review defensive and offensive team coverage, plus a full Scarlet/Violet single-battle damage calculator.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Data and images</h2>
        <p>
          Pokémon names and game data are sourced from PokéAPI and Pokémon
          Showdown–derived datasets, and damage math is powered by the{" "}
          <span className="font-medium">@smogon/calc</span> engine. See the{" "}
          <a href="/credits" className="text-blue-600 underline hover:text-blue-700">
            Credits &amp; Data Sources
          </a>{" "}
          page for the full list. Pokémon artwork is shown as a placeholder until
          its license status is confirmed.
        </p>
      </section>

      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
        This is a fan-made tool and is not affiliated with, endorsed by, or
        sponsored by Nintendo, Game Freak, or The Pokémon Company. Pokémon and
        Pokémon character names are trademarks of Nintendo.
      </p>
    </StaticPage>
  );
}
