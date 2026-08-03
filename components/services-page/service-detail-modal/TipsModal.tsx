"use client"

import { Copy, CheckCircle } from "@phosphor-icons/react"

export function TipsPanel({ tips, isGeneric, accent, copied, onCopy }: {
  tips: string[]; isGeneric: boolean; accent: string; copied: boolean; onCopy: () => void
}) {
  if (tips.length === 0) return null
  return (
    <div className="text-left">
      <div className="mb-3 flex items-center justify-between gap-2">
        {isGeneric ? (
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            General tips for this hub
          </span>
        ) : <span />}

        {/* Icon-only at rest; briefly swaps to a checkmark + "Copied"
            label on copy. Plain conditional render + a keyed animate-in
            fade for the swap — no framer-motion, no shared animation
            state, nothing that can hang across instances. */}
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Tips copied" : "Copy tips"}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all active:scale-90"
          style={{ backgroundColor: `${accent}15`, color: copied ? "#16a34a" : accent }}
        >
          {copied ? (
            <span key="copied" className="flex items-center gap-1.5 text-[0.74rem] font-black uppercase tracking-wider animate-in fade-in zoom-in-95 duration-150">
              <CheckCircle size={14} weight="fill" aria-hidden="true" />
              Copied
            </span>
          ) : (
            <span key="idle" className="flex items-center animate-in fade-in zoom-in-95 duration-150">
              <Copy size={14} weight="bold" aria-hidden="true" />
            </span>
          )}
        </button>
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
