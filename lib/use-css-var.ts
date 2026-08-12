// lib/use-css-var.ts
"use client"

import { useEffect, useState } from "react"

// -----------------------------------------------------------------------
// Reads a CSS custom property's live computed value off :root (e.g.
// "--background", "--card", "--primary"). This is what makes globals.css
// the actual single source of truth: components ask the DOM for the
// real, current value instead of hand-copying a second version of the
// same hex that can silently drift — exactly what happened with
// about-page's old PAGE_BG_DARK (#0D1B2A guessed by hand, correct by
// coincidence) and CARD_BG_LIGHT (#FAFAFA guessed, WRONG — the real
// --card token is #FFFFFF).
//
// `themeKey` should be something that changes when the theme flips (e.g.
// resolvedTheme from next-themes) so the value re-reads on toggle.
// -----------------------------------------------------------------------
export function useCssVar(varName: string, themeKey: string | undefined, fallback: string) {
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim()
    if (computed) setValue(computed)
  }, [varName, themeKey])

  return value
}
