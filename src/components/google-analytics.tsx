"use client";

import { useEffect } from "react";

// Inlined at build time. Empty/undefined by default, so nothing is injected.
const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

/**
 * GA4 measurement (production only).
 *
 * The measurement ID is TODO(VERIFY): a real GA4 property must be created and
 * provided as the build-time `NEXT_PUBLIC_GA4_ID` env var. Until then this
 * component renders nothing and sends nothing. The `NODE_ENV` guard keeps the
 * tag out of local development builds even once an ID is set.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID || process.env.NODE_ENV !== "production") return;

    const loader = document.createElement("script");
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(loader);

    const init = document.createElement("script");
    init.textContent = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`;
    document.head.appendChild(init);
  }, []);

  return null;
}
