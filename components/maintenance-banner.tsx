// hooks/use-navbar.ts
"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// ── useNavContrast ─────────────────────────────────────────────────────────
// Samples the element stack at the right-side controls position (where the
// hamburger lives) on every scroll and resize event. Resolves the effective
// background color of whatever is visually beneath, computes its relative
// luminance, and returns `true` when that background is dark enough to make
// the default dark icon invisible. Consumers should swap to a light icon
// when this is true (and vice-versa), regardless of the active theme.
//
// Strategy: document.elementsFromPoint() gives us the stacking order at a
// pixel. We walk from innermost outward, resolve getComputedStyle().backgroundColor
// for each, skip transparent ones, and use the first opaque hit. This works
// for solid fills, CSS var backgrounds, and Tailwind utility classes.

function parseRgba(str: string): { r: number; g: number; b: number; a: number } | null {
  const m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)/)
  if (!m) return null
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 }
}

function luminance(r: number, g: number, b: number) {
  const ch = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

// FIX: reads the live --banner-h CSS var (set by MaintenanceBanner toggling
// `.banner-active` on <html>) so the sample point moves down with the
// header when the banner is showing. Previously yPx was a fixed pixel
// position that assumed the header always started at the very top of the
// viewport — once the banner pushed the header down, that fixed point
// landed inside the banner's own background instead of behind the nav,
// making the banner's blue fill (not actual page content) decide icon
// contrast for as long as the banner was visible.
function getBannerOffsetPx(): number {
  if (typeof document === "undefined") return 0
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--banner-h")
  const px = parseFloat(raw)
  return Number.isFinite(px) ? px : 0
}

export function useNavContrast(xFraction = 0.93, yPx = 37) {
  // xFraction: horizontal position as fraction of window width (right side)
  // yPx: vertical position in px from top — mid-point of the controls pill,
  // relative to the header's own top edge (banner offset added at sample time)
  const [isDarkBehind, setIsDarkBehind] = useState(false)

  useEffect(() => {
    let rafId: number | null = null

    const sample = () => {
      const x = window.innerWidth * xFraction
      const y = getBannerOffsetPx() + yPx
      const elements = document.elementsFromPoint(x, y) as HTMLElement[]

      for (const el of elements) {
        // Skip the navbar itself — we want what's behind it
        if (el.closest("header")) continue
        // NEW — skip the maintenance banner itself for the same reason;
        // it isn't inside <header> so the check above doesn't catch it.
        if (el.closest("[data-maintenance-banner]")) continue

        const bg = getComputedStyle(el).backgroundColor
        const rgba = parseRgba(bg)
        if (!rgba || rgba.a < 0.1) continue

        // Found first opaque-ish layer
        const lum = luminance(rgba.r, rgba.g, rgba.b)
        // Luminance < 0.18 ≈ roughly as dark as #666 — icons need to flip
        setIsDarkBehind(lum < 0.18)
        return
      }
      // Nothing opaque found — treat as light (default)
      setIsDarkBehind(false)
    }

    const onFrame = () => { rafId = null; sample() }
    const scheduleSample = () => {
      // FIX: previously reassigned rafId without cancelling any frame
      // already pending, so fast scrolling could queue up multiple
      // redundant sample() calls (each walking elementsFromPoint +
      // getComputedStyle — real DOM cost) instead of coalescing to one
      // per frame.
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(onFrame)
    }

    // Initial sample
    sample()

    window.addEventListener("scroll", scheduleSample, { passive: true })
    window.addEventListener("resize", scheduleSample, { passive: true })

    return () => {
      window.removeEventListener("scroll", scheduleSample)
      window.removeEventListener("resize", scheduleSample)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [xFraction, yPx])

  return isDarkBehind
}

export function useNavVisibility() {
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > 80) {
        setNavVisible(y <= lastScrollY.current)
      } else {
        setNavVisible(true)
      }
      lastScrollY.current = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return navVisible
}

export function useMobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return { menuOpen, setMenuOpen }
}

export function useLogoAnimation() {
  const [isTextExpanded, setIsTextExpanded] = useState(true)
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogoMouseEnter = useCallback(() => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    setIsTextExpanded(true)
  }, [])

  const handleLogoMouseLeave = useCallback(() => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 1200)
  }, [])

  useEffect(() => {
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 2670)
    return () => {
      if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    }
  }, [])

  return { isTextExpanded, handleLogoMouseEnter, handleLogoMouseLeave }
    }
