import type { ReactNode } from "react";

/**
 * Shared layout for the static informational pages (About / Privacy / Credits).
 * Pure presentational component — usable from Server Components without a
 * client boundary.
 */
export function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      <div className="mt-6 space-y-5 text-slate-700">{children}</div>
    </main>
  );
}
