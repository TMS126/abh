/**
 * ────────────────────────────────────────────────────────────────────────────
 * ANALYTICS HELPER
 * lib/analytics.ts
 *
 * Thin wrapper around GA4's gtag() so components call one function instead
 * of touching the global directly. Silently no-ops if gtag hasn't loaded
 * (dev mode, ad blockers, slow network) rather than throwing.
 * ────────────────────────────────────────────────────────────────────────────
 */

type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(eventName: string, params?: EventParams) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
} 
