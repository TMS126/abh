// components/notice-pill.tsx
// Unified notice/announcement pill — canonical style is the Hero's old
// NSFAS backlog notice. Used by hero-section, gallery-page, services-page.
//
// Structure fix: the dismiss X is now ALWAYS a sibling <button>, never an
// icon living inside the same clickable region as the expand/collapse
// trigger (that was the "x button inside a button" bug in the old
// NoticePill — the X sat inside the trigger <button>, so clicking it
// couldn't do its own thing independently and screen readers announced
// one confusing nested interactive target instead of two clear ones).
"use client"

import { useState } from "react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, TOKEN } from "@/lib/brand"

export type NoticeVariant = "success" | "info" | "warning" | "error"

// success/error aren't in lib/brand.ts yet — add them there and swap
// these out whenever you want a single source of truth for all four.
const VARIANT_COLOR: Record<NoticeVariant, string> = {
  success: "#4A8011", // matches your existing brand green (Documents hover accent)
  info: BRAND.blue,
  warning: TOKEN.warningBg,
  error: "#B91C1C",
}

// warning is the only variant with a pre-verified accessible text color
// (TOKEN.orangeText, since raw warningBg is too light/amber for text).
// The other three colors above were chosen dark enough to pass on white
// or on their own ~8-13% tint — worth a contrast check if you ever swap them.
const VARIANT_TEXT: Record<NoticeVariant, string> = {
  success: VARIANT_COLOR.success,
  info: VARIANT_COLOR.info,
  warning: TOKEN.orangeText,
  error: VARIANT_COLOR.error,
}

function hexToRgbLocal(hex: string) {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  const bigint = parseInt(full, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}
function relativeLuminanceLocal({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
function getReadableIconColor(bgHex: string) {
  const lum = relativeLuminanceLocal(hexToRgbLocal(bgHex))
  const contrastWhite = 1.05 / (lum + 0.05)
  const contrastDark = (lum + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#14202b"
}

export function NoticePill({
  variant,
  Icon,
  collapsedLabel,
  expandedLabel,
  isDark,
  children,
  onDismiss,
  className,
}: {
  variant: NoticeVariant
  Icon: React.ElementType
  collapsedLabel: string
  expandedLabel: string
  isDark: boolean
  children: React.ReactNode
  /** Omit to disable dismissal entirely (expand/collapse only, no X). */
  onDismiss?: () => void
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const accent = VARIANT_COLOR[variant]
  const textColor = VARIANT_TEXT[variant]
  const iconOnAccent = getReadableIconColor(accent)
  const tint = isDark ? `${accent}26` : `${accent}14`

  return (
    <div className={cn("w-full flex justify-center", className)}>
      {!expanded ? (
        <div
          style={{ borderColor: accent }}
          className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full border bg-white dark:bg-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-shadow duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-label={`Expand: ${collapsedLabel}`}
            className="flex items-center gap-2"
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            >
              <Icon size={13} weight="fill" style={{ color: iconOnAccent }} />
            </span>
            <span className="text-sm font-bold" style={{ color: textColor }}>
              {collapsedLabel}
            </span>
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={`Dismiss: ${collapsedLabel}`}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={13} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="relative w-full max-w-[440px] rounded-[14px] transition-colors duration-300"
          style={{ backgroundColor: tint }}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-expanded={true}
            aria-label={`Collapse: ${expandedLabel}`}
            className={cn(
              "flex items-start gap-3 text-left w-full pl-4 py-4",
              onDismiss ? "pr-10" : "pr-4"
            )}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            >
              <Icon size={16} weight="fill" style={{ color: iconOnAccent }} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[0.7rem] font-black uppercase tracking-widest" style={{ color: textColor }}>
                {expandedLabel}
              </span>
              <span className="text-sm font-semibold leading-snug abh-body" style={{ color: textColor }}>
                {children}
              </span>
            </span>
          </button>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={`Dismiss: ${expandedLabel}`}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ color: textColor }}
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
} 
