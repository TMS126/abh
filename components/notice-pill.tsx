// components/notice-pill.tsx
// Unified notice/announcement pill — canonical style is the Hero's old
// NSFAS backlog notice. One component, one style, color only changes by
// variant. Used by hero-section, gallery-page, services-page.
"use client"

import { useState } from "react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, TOKEN } from "@/lib/brand"

export type NoticeVariant = "success" | "info" | "warning" | "error"

// Every bg/text/icon triple below is a TOKEN.* or BRAND.* reference, never
// a raw hex — all four pairs are pre-verified in globals.css.
const VARIANT_BG: Record<NoticeVariant, string> = {
  success: BRAND.green,
  info: BRAND.blue,
  warning: TOKEN.warningBg,
  error: TOKEN.errorBg,
}
const VARIANT_ICON: Record<NoticeVariant, string> = {
  success: TOKEN.onBrandGreen,
  info: TOKEN.onBrandBlue,
  warning: TOKEN.onBrandOrange,
  error: TOKEN.onDestructive,
}
const VARIANT_TEXT: Record<NoticeVariant, string> = {
  success: TOKEN.greenText,
  info: TOKEN.blueText,
  warning: TOKEN.orangeText,
  error: TOKEN.errorText,
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

  const accent = VARIANT_BG[variant]
  const iconColor = VARIANT_ICON[variant]
  const textColor = VARIANT_TEXT[variant]
  const tint = isDark ? `${accent}26` : `${accent}14`

  return (
    <div className={cn("w-full flex justify-center", className)}>
      {!expanded ? (
        <div
          style={{ borderColor: textColor }}
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
              <Icon size={13} weight="fill" style={{ color: iconColor }} />
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
              <Icon size={16} weight="fill" style={{ color: iconColor }} />
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
