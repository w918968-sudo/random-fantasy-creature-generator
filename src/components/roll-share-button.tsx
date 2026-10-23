"use client";

import { useState } from "react";
import type { Creature } from "@/lib/types";
import { buildRollUrl } from "@/lib/share-text";
import { renderBatchShareImage } from "@/lib/share-image";
import { downloadCanvas } from "@/lib/download-canvas";
import { trackEvent } from "@/lib/analytics";

/**
 * Share menu for a generated batch (2+ creatures): copy a `?roll=` deep link
 * that reproduces the exact batch, download a composite image, or use the
 * native share sheet.
 */
export function RollShareButton({ creatures }: { creatures: Creature[] }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const url = buildRollUrl(creatures.map((c) => c.id));
  const ids = creatures.map((c) => c.id).join(",");

  function flash(message: string) {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2500);
  }

  async function copyRollLink() {
    try {
      await navigator.clipboard.writeText(url);
      trackEvent("share_roll_link", { ids });
      flash("Roll link copied!");
    } catch {
      flash("Copy failed — long-press the link and copy.");
    }
    setOpen(false);
  }

  async function downloadImage() {
    setOpen(false);
    try {
      const canvas = await renderBatchShareImage(creatures);
      downloadCanvas(canvas, "creature-roll.png");
      trackEvent("share_roll_image", { ids });
      flash("Roll image saved.");
    } catch {
      flash("Couldn't render the image in this browser.");
    }
  }

  async function nativeShare() {
    setOpen(false);
    try {
      const canvas = await renderBatchShareImage(creatures);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("blob");
      const file = new File([blob], "creature-roll.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My creature roll",
          text: "A roll of original fantasy creatures — tap to reproduce it.",
          url,
          files: [file],
        });
        trackEvent("share_roll_native", { ids, with_image: true });
        return;
      }
      await navigator.share({
        title: "My creature roll",
        text: "A roll of original fantasy creatures — tap to reproduce it.",
        url,
      });
      trackEvent("share_roll_native", { ids, with_image: false });
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        flash("Roll link copied!");
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
        Share this roll
        <span aria-hidden className="text-stone-400">▾</span>
      </button>

      {feedback && (
        <span className="ml-2 text-sm text-stone-500">{feedback}</span>
      )}

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-stone-900/10">
          <button
            type="button"
            onClick={copyRollLink}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            Copy roll link
          </button>
          <button
            type="button"
            onClick={downloadImage}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            Download roll image
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
