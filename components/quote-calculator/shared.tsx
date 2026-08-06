"use client"

import { Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"
import { HubId } from "@/lib/data"

export const HOME_BLUE = { light: BRAND.blue, dark: BRAND.lightBlue }

export function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const contrastWhite = 1.05 / (luminance + 0.05)
  const contrastDark  = (luminance + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#18181b"
}

export const GLASS = {
  panel:   "bg-white/95 dark:bg-zinc-900/95 shadow-[0_2px_20px_-2px_rgba(0,0,0,0.10)] dark:shadow-[0_2px_24px_-2px_rgba(0,0,0,0.55)]",
  section: "bg-zinc-50 dark:bg-white/[0.04] shadow-[0_1px_8px_-2px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_10px_-2px_rgba(0,0,0,0.35)]",
  item:    "bg-white dark:bg-white/[0.05] shadow-[0_1px_6px_-1px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_8px_-1px_rgba(0,0,0,0.35)]",
  pill:    "bg-zinc-100 dark:bg-white/[0.08]",
  btn:     "bg-zinc-100 dark:bg-white/[0.07]",
} as const

export function HubIcon({ id, size = 16, color }: { id: HubId; size?: number; color?: string }) {
  const p = { size, weight: "fill" as const, color: color ?? "currentColor", "aria-hidden": true }
  switch (id) {
    case "print":    return <Printer    {...p} />
    case "doc":      return <FileText   {...p} />
    case "design":   return <PaintBrush {...p} />
    case "eservice": return <Globe      {...p} />
    case "tech":     return <Desktop    {...p} />
  }
}
