"use client";

import { useEffect, useState } from "react";
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

/**
 * Floating background-theme switcher. The choice is persisted to localStorage
 * and applied as a `data-theme` attribute on <html>; the actual gradients live
 * in globals.css.
 */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const id = saved && THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME;
    setTheme(id);
    document.documentElement.dataset.theme = id;
  }, []);

  function choose(id: string) {
    setTheme(id);
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // Ignore storage failures (e.g. private mode) — the theme still applies.
    }
    setOpen(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-48 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-stone-900/10">
          <p className="px-2 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-stone-400">
            Background
          </p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => choose(t.id)}
              aria-pressed={theme === t.id}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm font-semibold transition hover:bg-stone-50 ${
                theme === t.id ? "text-stone-900" : "text-stone-600"
              }`}
            >
              <span
                aria-hidden
                className="h-5 w-5 shrink-0 rounded-full ring-1 ring-black/5"
                style={{ background: t.dot }}
              />
              <span aria-hidden className="text-base leading-none">
                {t.emoji}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change background theme"
        aria-expanded={open}
        className="grid h-12 w-12 place-items-center rounded-full bg-white text-xl shadow-lg ring-1 ring-stone-900/10 transition hover:scale-105"
      >
        🎨
      </button>
    </div>
  );
}
