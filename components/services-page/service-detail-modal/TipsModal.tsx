"use client"

import { useEffect } from "react"
import { X, Lightbulb } from "@phosphor-icons/react"
import { TipsPanel } from "./TipsPanel"

// Standalone popup for tips — no framer-motion, plain CSS animate-in.
// Sits above the ServiceDetailModal with its own backdrop/z-index, and
// only ever renders when `open` is true, so there's nothing left mounted
// (invisible or otherwise) once it's closed.
export function TipsModal({
  open, onClose, tips, isGeneric, accent, copied, onCopy, hubTitle,
}: {
  open: boolean
  onClose: () => void
  tips: string[]
  isGeneric: boolean
  accent: string
  copied: boolean
  onCopy: () => void
  hubTitle: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 animate-in fade-in duration-150" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tips for ${hubTitle}`}
        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 rounded-[14px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 30px 70px -18px rgba(0,0,0,0.5), 0 10px 24px -8px rgba(0,0,0,0.3)" }}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
              <Lightbulb size={16} weight="fill" aria-hidden="true" />
            </div>
            <h4 className="abh-card-heading text-base truncate">Helpful Tips</h4>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tips"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 min-h-0">
          <TipsPanel tips={tips} isGeneric={isGeneric} accent={accent} copied={copied} onCopy={onCopy} />
        </div>
      </div>
    </div>
  )
}
