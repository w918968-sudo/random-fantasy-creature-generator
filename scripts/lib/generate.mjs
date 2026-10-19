/**
 * Shared helpers for the Volcano Ark (火山方舟) Seedream 5.0 Pro image API.
 *
 * Model: doubao-seedream-5-0-pro-260628 (locked). Endpoint: domestic region.
 * NOTE: the returned image URL (response_format "url") expires in 24h, so we
 * request b64_json and write the bytes to disk immediately.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root (this file lives at scripts/lib/generate.mjs). */
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const MODEL = "doubao-seedream-5-0-pro-260628";
export const ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

// Style suffix shared by every prompt so the set reads as one cohesive art
// direction. Tune here once; every creature inherits it.
export const STYLE =
  "cute original fantasy creature illustration, soft anime style, dreamy pastel color palette, gentle lighting, centered full-body composition, clean simple background, high quality, no text, no watermark, no signature";

/** Minimal `.env.local` parser (KEY=value, optional surrounding quotes). */
export function loadEnv(file) {
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

/** Read ARK_API_KEY from .env.local (never committed) or exit. */
export function loadArkApiKey() {
  const key = loadEnv(resolve(ROOT, ".env.local")).ARK_API_KEY;
  if (!key) {
    console.error("Missing ARK_API_KEY in .env.local");
    process.exit(1);
  }
  return key;
}

/** Build the full prompt for one creature. */
export function buildPrompt(creature, description = creature.description) {
  return [
    `Cute original fantasy creature, ${description}`,
    `Element: ${creature.element}.`,
    `Personality: ${creature.personality}.`,
    STYLE,
  ].join(" ");
}

/**
 * Generate one image and resolve to the base64 PNG string.
 * Throws on API error or a missing b64_json in the response.
 */
export async function generateImage(
  apiKey,
  { creature, description, size = "1024x1280" },
) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: buildPrompt(creature, description),
      size,
      output_format: "png",
      response_format: "b64_json",
      watermark: false,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${JSON.stringify(body)}`);
  }
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(`No b64_json in response: ${JSON.stringify(body)}`);
  }
  return b64;
}
