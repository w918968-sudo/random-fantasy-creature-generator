"use client";

import { useState } from "react";
import type { Creature } from "@/lib/types";
import { creatureShareUrl } from "@/lib/share-text";
import { renderShareImage } from "@/lib/share-image";

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

export function ShareButton({ creature }: { creature: Creature }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const url = creatureShareUrl(creature);

  function flash(message: string) {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2500);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied!");
    } catch {
      flash("Copy failed — long-press the link and copy.");
    }
    setOpen(false);
  }

  async function downloadImage() {
    setOpen(false);
    try {
      const canvas = await renderShareImage(creature);
      downloadCanvas(canvas, `${creature.id}.png`);
      flash("Image saved.");
    } catch {
      flash("Couldn't render the image in this browser.");
    }
  }

  async function nativeShare() {
    setOpen(false);
    try {
      const canvas = await renderShareImage(creature);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("blob");
      const file = new File([blob], `${creature.id}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: creature.name,
          text: creature.description,
          url,
          files: [file],
        });
        return;
      }
      await navigator.share({ title: creature.name, text: creature.description, url });
    } catch {
      // User cancelled, or sharing is unavailable — silently fall back to copy.
      try {
        await navigator.clipboard.writeText(url);
        flash("Link copied!");
      } catch {
        flash("Sharing isn't supported here.");
      }
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
      >
        Share
        <span aria-hidden className="text-stone-400">▾</span>
      </button>

      {feedback && (
        <span className="ml-2 text-sm text-stone-500">{feedback}</span>
      )}

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-52 rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-stone-900/10">
          <button
            type="button"
            onClick={copyLink}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={downloadImage}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            Download image
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              onClick={nativeShare}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
            >
              Share…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
