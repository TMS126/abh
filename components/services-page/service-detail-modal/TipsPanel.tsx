"use client"

import { Copy, CheckCircle } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"

export function TipsPanel({ tips, isGeneric, accent, copied, onCopy }: {
  tips: string[]; isGeneric: boolean; accent: string; copied: boolean; onCopy: () => void
}) {
  if (tips.length === 0) return null
  return (
    <div className="animate-in fade-in duration-150 text-left relative">
      <div className="relative mb-3 flex items-center justify-between gap-2">
        {isGeneric ? (
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            General tips for this hub
          </span>
        ) : <span />}

        {/* Icon-only at rest. On copy, briefly swaps to a checkmark +
            "Copied" label, then fades back to just the icon. `layout`
            lets the button's width animate smoothly as the content
            changes size, rather than snapping. */}
        <motion.button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Tips copied" : "Copy tips"}
          layout
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="ml-auto flex items-center justify-center px-2.5 py-1.5 rounded-full transition-colors active:scale-90"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5 text-[0.74rem] font-black uppercase tracking-wider"
                style={{ color: "#16a34a" }}
              >
                <CheckCircle size={14} weight="fill" aria-hidden="true" />
                Copied
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center"
              >
                <Copy size={14} weight="bold" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <ul className="space-y-3">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: accent }} aria-hidden="true" />
            <span className="abh-body text-base">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
} 