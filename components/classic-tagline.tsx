"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { BRAND } from "@/lib/brand"
import { ensureAccessible } from "@/lib/color-contrast"

const WORDS = [
  { text: "Design.",  key: "orange" as const },
  { text: "Print.",   key: "blue"   as const },
  { text: "Upgrade.", key: "green"  as const },
]

export function ClassicTagline() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  const isDark  = mounted && resolvedTheme === "dark"
  const pageBg  = isDark ? "#0D1B2A" : "#FFFFFF"

  // Colors nudged for WCAG AA (4.5:1) against the page background in
  // whichever theme is active — same helper used elsewhere on the site.
  const palette = {
    orange: ensureAccessible(isDark ? BRAND.lightOrange : BRAND.orange, pageBg, 4.5),
    blue:   ensureAccessible(isDark ? BRAND.lightBlue   : BRAND.blue,   pageBg, 4.5),
    green:  ensureAccessible(isDark ? BRAND.lightGreen  : BRAND.green,  pageBg, 4.5),
  }

  const mutedColor = isDark ? "#71717a" : "#a1a1aa"

  return (
    <p
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      className="mt-3 text-[0.7rem] md:text-xs font-black uppercase tracking-[0.15em] cursor-default select-none outline-none"
    >
      {WORDS.map((w, i) => (
        <span
          key={w.text}
          className="transition-colors duration-300"
          style={{ color: hovered ? palette[w.key] : mutedColor }}
        >
          {w.text}
          {i < WORDS.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  )
}
