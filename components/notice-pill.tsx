// components/notice-pill.tsx — full file, paste over the current one
"use client"

import { useState } from "react"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, TOKEN } from "@/lib/brand"

export type NoticeVariant = "success" | "info" | "warning" | "error"

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
      {/* Both states stay mounted and share one grid cell (grid-area: 1/1),
          so the container always sizes to the taller (expanded) panel and
          switching states is a pure opacity/scale crossfade — no measuring,
          no onAnimationEnd bookkeeping, no layout jump either direction. */}
      <div className="relative grid w-full max-w-[440px] justify-center">
        {/* ─── Collapsed pill ─── */}
        <div
          style={{ borderColor: textColor }}
          aria-hidden={expanded}
          className={cn(
            "[grid-area:1/1] flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full border bg-white dark:bg-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out motion-reduce:transition-none",
            expanded
              ? "opacity-0 scale-95 pointer-events-none"
              : "opacity-100 scale-100 pointer-events-auto hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          )}
        >
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-label={`Expand: ${collapsedLabel}`}
            tabIndex={expanded ? -1 : 0}
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
              tabIndex={expanded ? -1 : 0}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X size={13} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* ─── Expanded card ─── */}
        <div
          role="status"
          aria-live="polite"
          aria-hidden={!expanded}
          className={cn(
            "[grid-area:1/1] w-full rounded-[14px] transition-all duration-300 ease-out motion-reduce:transition-none",
            expanded
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          )}
          style={{ backgroundColor: tint }}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-expanded={true}
            aria-label={`Collapse: ${expandedLabel}`}
            tabIndex={expanded ? 0 : -1}
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
              tabIndex={expanded ? 0 : -1}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ color: textColor }}
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 
