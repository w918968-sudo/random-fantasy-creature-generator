/**
 * Minimal GA4 event helper. No-op when the gtag snippet isn't present (local
 * dev, or when analytics is disabled). The snippet itself is injected by
 * `GoogleAnalytics` in production only.
 */

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
