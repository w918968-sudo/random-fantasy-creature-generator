# Data sources, licenses & pending items

Internal record for the Random Fantasy Creature Generator. Updated as licenses
and production values are confirmed. **Do not fabricate** sources, licenses, or
production values — anything unconfirmed is marked `VERIFY` / `TODO`.

## Bundled data

| Data | Source | License / status |
| --- | --- | --- |
| Creature catalog (`src/data/creatures.json`) | Co-written original content — every name, description, and trait is original (2026-10-19). No third-party IP. | Original work, owned by the project. |

## Runtime dependencies

| Package | Version | License |
| --- | --- | --- |
| next / react / react-dom | 16.4.2 / 19.3.0 | MIT |
| tailwindcss | ^4 | MIT |

## Images

- **Status: original, generated.** Every creature's artwork is generated from an
  original prompt (name, description, element, personality + a shared style
  suffix). No Pokémon or other third-party IP is used.
- Generation: Volcano Ark (火山方舟) Seedream, model
  `doubao-seedream-5-0-pro-260628`, domestic region
  `ark.cn-beijing.volces.com`, via `scripts/generate-image.mjs` (one creature)
  or `scripts/generate-all.mjs` (batch). `response_format: b64_json`,
  `watermark: false`.
- The returned image URL expires in 24h, so we always request `b64_json` and
  write the PNG to disk immediately.

## Image-generation terms (VERIFY before commercial launch)

- Commercial use of generated **original** content is permitted per the
  [豆包模型服务协议](https://console.volcengine.com/ark/region:cn-beijing/docs/ark/doubao-model-service-agreement?lang=zh)
  and
  [版权和人像素材使用规则](https://console.volcengine.com/ark/region:cn-beijing/docs/ark/copyright-and-portrait-material-usage-rules?lang=zh)
  (verified 2026-10-19) — original content only; no IP, celebrity, or logos.
- Caveat: the free-trial tier is non-commercial only. **VERIFY** the account is
  on a paid tier before commercial launch.
- Keep generation records per the agreement.

## TODO / VERIFY

- [x] `SITE_URL` — `https://randompokemongenerator.games` (set in
      `src/lib/site.ts`).
- [x] `NEXT_PUBLIC_GA4_ID` — `G-QXM8XHH33P` (set in `.env.local` for local dev;
      the production value lives in the deploy environment, not committed).
- [x] Search Console — verified via **domain property** (DNS TXT). The record
      is now served from Cloudflare DNS (moved from Tencent Cloud DNSPod
      2026-10-19); no meta tag, so `GSC_VERIFICATION` stays unset.
- [x] Privacy contact — `w918968@gmail.com` set on the Privacy page.
- [ ] Paid-tier confirmation — **VERIFY** the Volcano Ark account is on a paid
      (not free-trial) tier before commercial launch.
