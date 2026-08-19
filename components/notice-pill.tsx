// components/notice-pill.tsx — full file, paste over the current one
"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, TOKEN } from "@/lib/brand"

export type NoticeVariant = "success" | "info" | "warning" | "error"

// ── Header/icon color only — severity lives here, nowhere else ──
const VARIANT_TEXT: Record<NoticeVariant, string> = {
  success: TOKEN.greenText,
  info: TOKEN.blueText,
  warning: TOKEN.orangeText,
  error: TOKEN.errorText,
}
// ── Tint background for the expanded card ──
const VARIANT_BG: Record<NoticeVariant, string> = {
  success: BRAND.green,
  info: BRAND.blue,
  warning: TOKEN.warningBg,
  error: TOKEN.errorBg,
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
  onDismiss?: () => void
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const accent = VARIANT_BG[variant]
  // ── Raw icon: colored by severity, no circle behind it ──
  const iconColor = VARIANT_TEXT[variant]
  const headerColor = VARIANT_TEXT[variant]
  // ── Card tint — a touch stronger in dark mode so it reads against the near-black page bg ──
  const tint = isDark ? `${accent}30` : `${accent}12`
  // ── Border stays muted/subtle everywhere; only ties to severity faintly ──
  const subtleBorder = isDark ? `${accent}40` : `${accent}26`

  return (
    <motion.div layout className={cn("w-full flex justify-center", className)} transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
      <AnimatePresence mode="wait" initial={false}>
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ borderColor: subtleBorder }}
            className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-full border bg-white dark:bg-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          >
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              aria-label={`Expand: ${collapsedLabel}`}
              className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--pill-accent)]"
              style={{ ["--pill-accent" as any]: accent }}
            >
              <Icon size={16} weight="bold" style={{ color: iconColor }} aria-hidden="true" />
              <span className="text-[0.92rem] font-bold whitespace-nowrap" style={{ color: headerColor }}>
                {collapsedLabel}
              </span>
            </button>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label={`Dismiss: ${collapsedLabel}`}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-zinc-400"
              >
                <X size={13} weight="bold" aria-hidden="true" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-[440px] rounded-[14px] border"
            style={{ backgroundColor: tint, borderColor: subtleBorder }}
          >
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-expanded={true}
              aria-label={`Collapse: ${expandedLabel}`}
              className={cn(
                "flex items-start gap-3 text-left w-full pl-4 py-4 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--pill-accent)]",
                onDismiss ? "pr-10" : "pr-4"
              )}
              style={{ ["--pill-accent" as any]: accent }}
            >
              <Icon size={20} weight="bold" style={{ color: iconColor }} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span className="flex flex-col gap-1">
                <span className="text-[0.75rem] font-black uppercase tracking-widest" style={{ color: headerColor }}>
                  {expandedLabel}
                </span>
                {/* ── Neutral body text — adapts light/dark, no severity tint ── */}
                <span className="text-[0.95rem] font-semibold leading-snug abh-body text-zinc-700 dark:text-zinc-200">
                  {children}
                </span>
              </span>
            </button>

            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                aria-label={`Dismiss: ${expandedLabel}`}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-zinc-400"
              >
                <X size={14} weight="bold" aria-hidden="true" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
