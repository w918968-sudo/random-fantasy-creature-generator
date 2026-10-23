#!/usr/bin/env python3
"""Build the site's icon set + nav logo from the user's source mascot image.

Reads d66bb9e0-2d96-48fe-a2d5-3b3faa983379.png (near-white background), trims
the background to the subject, pads back to a square, and emits:
  - src/app/icon.png       (512x512)
  - src/app/apple-icon.png (180x180)
  - src/app/favicon.ico    (16/32/48, RGBA frames)
  - public/logo.png        (256x256, for the top-left nav logo)
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "d66bb9e0-2d96-48fe-a2d5-3b3faa983379.png"

src = Image.open(SRC).convert("RGB")
a = np.asarray(src).astype(int)

bg = a[0, 0]
mask = np.abs(a - bg).sum(axis=2) > 26  # near-white background removal
ys, xs = np.where(mask)
left, right = xs.min(), xs.max()
top, bottom = ys.min(), ys.max()

# Small breathing margin around the subject.
m = int(round(0.02 * max(right - left, bottom - top)))
left = max(0, left - m)
right = min(a.shape[1] - 1, right + m)
top = max(0, top - m)
bottom = min(a.shape[0] - 1, bottom + m)

crop = a[top : bottom + 1, left : right + 1]
h, w = crop.shape[:2]

# Pad back to a centered square using the original background color.
side = max(h, w)
canvas = np.full((side, side, 3), bg, dtype=np.uint8)
y0 = (side - h) // 2
x0 = (side - w) // 2
canvas[y0 : y0 + h, x0 : x0 + w] = crop

img = Image.fromarray(canvas)

img.resize((512, 512), Image.LANCZOS).save(ROOT / "src" / "app" / "icon.png")
img.resize((180, 180), Image.LANCZOS).save(ROOT / "src" / "app" / "apple-icon.png")

# ICO frames must be RGBA or Next's icon decoder rejects the file.
img.convert("RGBA").save(
    ROOT / "src" / "app" / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)

img.resize((256, 256), Image.LANCZOS).save(ROOT / "public" / "logo.png")

print("wrote icon.png, apple-icon.png, favicon.ico, public/logo.png (white-bg mascot)")
