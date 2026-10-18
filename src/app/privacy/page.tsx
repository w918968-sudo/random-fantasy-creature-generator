import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy notice for Random Pokémon Generator — a static, browser-based tool with no accounts or server-side data collection.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy">
      <p>
        Random Pokémon Generator is a static website. It has no accounts and no
        backend, and it does not ask for or store personal information.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">What happens in your browser</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Generation, filtering, team analysis, and damage calculation all run locally in your browser.</li>
          <li>Generated results are never sent to a server.</li>
          <li>Settings and results are kept in memory for the current session and are cleared when you refresh or close the page. Nothing is saved to localStorage.</li>
          <li>The <span className="font-medium">Copy Results</span> button writes text to your device&apos;s clipboard only.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Cookies and analytics</h2>
        <p>
          The tool itself sets no cookies. In the deployed production site,
          Google Analytics 4 (GA4) may collect anonymous usage data (such as
          pages visited, approximate location, and browser type) using cookies
          set by Google. Analytics runs in <span className="font-medium">production only</span> — it
          does not run in local development.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Third-party data</h2>
        <p>
          Pokémon names and game data are sourced from PokéAPI and Pokémon
          Showdown–derived datasets. See{" "}
          <a href="/credits" className="text-blue-600 underline hover:text-blue-700">
            Credits &amp; Data Sources
          </a>
          .
        </p>
      </section>

      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
        Contact for privacy questions:{" "}
        <a href="mailto:w918968@gmail.com" className="text-blue-600 underline hover:text-blue-700">
          w918968@gmail.com
        </a>
        .
      </p>
    </StaticPage>
  );
}
