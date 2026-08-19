// components/notice-pill.tsx — full file, paste over the current one
"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
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
  onDismiss?: () => void
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const accent = VARIANT_BG[variant]
  const iconColor = VARIANT_ICON[variant]
  const textColor = VARIANT_TEXT[variant]
  const tint = isDark ? `${accent}26` : `${accent}14`

  return (
    // FIX: this outer box now has `layout` — it tracks its own height as
    // the child swaps from pill to card and animates the change instead
    // of snapping. Combined with the page-level `layout` wrapper (see
    // gallery-page.tsx / services-page/index.tsx), everything after this
    // component in the page now slides down smoothly too.
    <motion.div layout className={cn("w-full flex justify-center", className)} transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}>
      <AnimatePresence mode="wait" initial={false}>
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ borderColor: textColor }}
            className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full border bg-white dark:bg-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
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
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: textColor }}>
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
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[440px] rounded-[14px]"
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
