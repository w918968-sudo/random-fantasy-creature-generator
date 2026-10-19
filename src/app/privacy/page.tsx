import type { Metadata } from "next";
import { StaticPage } from "@/components/static-page";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Privacy notice for Random Fantasy Creature Generator — a static, browser-based tool with no accounts or server-side data collection.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <StaticPage title="Privacy">
      <p>
        Random Fantasy Creature Generator is a static website. It has no
        accounts and no backend, and it does not ask for or store personal
        information.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">What happens in your browser</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Creature generation runs entirely in your browser.</li>
          <li>
            Your <span className="font-medium">favorites</span> are stored only on
            your device, in localStorage. They are never sent to a server.
          </li>
          <li>
            The <span className="font-medium">Share</span> action uses your
            browser&apos;s clipboard, download, or native share sheet — you choose
            what leaves your device.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Cookies and analytics</h2>
        <p>
          The tool itself sets no cookies. In the deployed production site,
          Google Analytics 4 (GA4) may collect anonymous usage data (such as
          pages visited, approximate location, and browser type) using cookies
          set by Google. Analytics runs in{" "}
          <span className="font-medium">production only</span> — it does not run
          in local development.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Third-party content</h2>
        <p>
          All creature names, descriptions, and traits are original. Creature
          artwork is generated with Volcano Ark (Seedream). See{" "}
          <a href="/credits" className="text-rose-600 underline decoration-2 underline-offset-2 hover:text-rose-500">
            Credits
          </a>{" "}
          for details.
        </p>
      </section>

      <p className="rounded-xl bg-white/70 p-4 text-sm text-stone-600 ring-1 ring-stone-200 backdrop-blur-sm">
        Contact for privacy questions:{" "}
        <a href="mailto:w918968@gmail.com" className="text-rose-600 underline decoration-2 underline-offset-2 hover:text-rose-500">
          w918968@gmail.com
        </a>
        .
      </p>
    </StaticPage>
  );
}
