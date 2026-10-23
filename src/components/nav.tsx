"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavLink {
  href: string;
  label: string;
  emoji?: string;
}

const LINKS: NavLink[] = [
  { href: "/", label: "Generate" },
  { href: "/daily", label: "Daily" },
  { href: "/random", label: "Surprise", emoji: "🎲" },
  { href: "/creatures", label: "Gallery" },
  { href: "/favorites", label: "Favorites", emoji: "♥" },
];

/** Home matches exactly; other items also cover their child routes. */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Persistent top navigation — the site's discoverability foundation. Puts the
 * main features (Generate / Daily / Surprise / Gallery / Favorites) one tap
 * away instead of burying them in the footer. Sticky, with an active-state
 * pill and a collapsible mobile menu.
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2 font-display text-lg font-bold text-stone-900"
        >
          <span aria-hidden className="text-amber-500">✦</span>
          Fantasy Creatures
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-white hover:text-stone-900"
                }`}
              >
                {link.emoji && <span aria-hidden>{link.emoji}</span>}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-full text-stone-600 ring-1 ring-stone-900/10 transition hover:bg-white md:hidden"
        >
          <span aria-hidden className="text-lg leading-none">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-stone-200/70 bg-white/90 px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    {link.emoji && (
                      <span aria-hidden className="mr-1.5">
                        {link.emoji}
                      </span>
                    )}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
