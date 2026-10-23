import type { Creature } from "@/lib/types";
import { ELEMENT_COLORS } from "@/lib/elements";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** 4:5 share card, 1080×1350. */
export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1350;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Draw the 4:5 share card. When `image` is null, a monogram placeholder is
 * rendered instead (so sharing works before artwork is generated).
 */
export function drawShareImage(
  ctx: CanvasRenderingContext2D,
  creature: Creature,
  image: HTMLImageElement | null,
): void {
  const { from, to } = ELEMENT_COLORS[creature.element];
  const bg = ctx.createLinearGradient(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
  bg.addColorStop(0, from);
  bg.addColorStop(1, to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 40px system-ui, sans-serif";
  ctx.fillText(SITE_NAME, SHARE_WIDTH / 2, 96);

  const imgSize = 720;
  const imgX = (SHARE_WIDTH - imgSize) / 2;
  const imgY = 150;

  // White frame around the image area.
  roundedRect(ctx, imgX - 20, imgY - 20, imgSize + 40, imgSize + 40, 40);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fill();

  ctx.save();
  roundedRect(ctx, imgX, imgY, imgSize, imgSize, 28);
  ctx.clip();
  if (image) {
    const scale = Math.max(
      imgSize / image.naturalWidth,
      imgSize / image.naturalHeight,
    );
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    ctx.drawImage(
      image,
      imgX + (imgSize - dw) / 2,
      imgY + (imgSize - dh) / 2,
      dw,
      dh,
    );
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(imgX, imgY, imgSize, imgSize);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "800 300px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(creature.name[0]?.toUpperCase() ?? "?", SHARE_WIDTH / 2, imgY + imgSize / 2);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 92px system-ui, sans-serif";
  ctx.fillText(creature.name, SHARE_WIDTH / 2, 980);

  let y = 1080;
  ctx.font = "400 40px system-ui, sans-serif";
  for (const line of wrapText(ctx, creature.description, SHARE_WIDTH - 160)) {
    ctx.fillText(line, SHARE_WIDTH / 2, y);
    y += 54;
  }

  y += 24;
  ctx.font = "500 36px system-ui, sans-serif";
  for (const trait of creature.traits) {
    ctx.fillText(`• ${trait}`, SHARE_WIDTH / 2, y);
    y += 58;
  }

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 28px system-ui, sans-serif";
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), SHARE_WIDTH / 2, SHARE_HEIGHT - 48);
}

/** Load any creature artwork, then draw the card onto a fresh canvas. */
export async function renderShareImage(
  creature: Creature,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_WIDTH;
  canvas.height = SHARE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not supported in this browser.");

  let image: HTMLImageElement | null = null;
  if (creature.image) {
    image = await new Promise((resolve) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = () => resolve(null);
      el.src = creature.image as string;
    });
  }

  drawShareImage(ctx, creature, image);
  return canvas;
}

/** Draw one creature tile (white frame + cover-cropped art + name bar). */
function drawBatchTile(
  ctx: CanvasRenderingContext2D,
  creature: Creature,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  roundedRect(ctx, x - 10, y - 10, w + 20, h + 20, 24);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fill();

  ctx.save();
  roundedRect(ctx, x, y, w, h, 18);
  ctx.clip();

  if (image) {
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "800 96px system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(creature.name[0]?.toUpperCase() ?? "?", x + w / 2, y + h / 2);
    ctx.textBaseline = "alphabetic";
  }

  // Name bar, clipped to the tile's rounded corners.
  const barH = 52;
  ctx.fillStyle = "rgba(15,23,42,0.62)";
  ctx.fillRect(x, y + h - barH, w, barH);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(creature.name, x + w / 2, y + h - barH / 2);
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

/**
 * Draw a multi-creature composite card (2–6 creatures in a centered grid).
 * Uses the first creature's element gradient as the backdrop.
 */
export function drawBatchShareImage(
  ctx: CanvasRenderingContext2D,
  creatures: Creature[],
  images: (HTMLImageElement | null)[],
): void {
  const first = creatures[0];
  const { from, to } = first
    ? ELEMENT_COLORS[first.element]
    : { from: "#64748b", to: "#1e293b" };
  const bg = ctx.createLinearGradient(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
  bg.addColorStop(0, from);
  bg.addColorStop(1, to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 40px system-ui, sans-serif";
  ctx.fillText(SITE_NAME, SHARE_WIDTH / 2, 96);
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.fillText(`${creatures.length}-creature roll ✦`, SHARE_WIDTH / 2, 140);

  const n = creatures.length;
  const cols = n === 4 ? 2 : Math.min(n, 3);
  const rows = Math.ceil(n / cols);
  const margin = 60;
  const gap = 24;
  const gridW = SHARE_WIDTH - margin * 2;
  const gridTop = 190;
  const gridBottom = SHARE_HEIGHT - 96;
  const gridH = gridBottom - gridTop;

  // Fit portrait (4:5) tiles into the available width and height.
  const maxTileW = (gridW - gap * (cols - 1)) / cols;
  const maxTileH = (gridH - gap * (rows - 1)) / rows;
  const tileW = Math.min(maxTileW, (maxTileH / 5) * 4);
  const tileH = (tileW * 5) / 4;

  const gridActualH = rows * tileH + gap * (rows - 1);
  const gridY = gridTop + (gridH - gridActualH) / 2;

  // Per-row width so an incomplete last row stays centered.
  const rowCounts = Array.from({ length: rows }, (_, r) =>
    Math.min(cols, n - r * cols),
  );

  creatures.forEach((creature, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowWidth = rowCounts[row] * tileW + (rowCounts[row] - 1) * gap;
    const x = (SHARE_WIDTH - rowWidth) / 2 + col * (tileW + gap);
    const y = gridY + row * (tileH + gap);
    drawBatchTile(ctx, creature, images[i] ?? null, x, y, tileW, tileH);
  });

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 28px system-ui, sans-serif";
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), SHARE_WIDTH / 2, SHARE_HEIGHT - 48);
}

/** Load each creature's artwork, then draw the batch card onto a canvas. */
export async function renderBatchShareImage(
  creatures: Creature[],
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_WIDTH;
  canvas.height = SHARE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not supported in this browser.");

  const images = await Promise.all(
    creatures.map((creature) =>
      creature.image
        ? new Promise<HTMLImageElement | null>((resolve) => {
            const el = new Image();
            el.crossOrigin = "anonymous";
            el.onload = () => resolve(el);
            el.onerror = () => resolve(null);
            el.src = creature.image as string;
          })
        : Promise.resolve(null),
    ),
  );

  drawBatchShareImage(ctx, creatures, images);
  return canvas;
}
