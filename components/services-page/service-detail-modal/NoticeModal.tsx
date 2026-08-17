/* components/services-page/service-detail-modal/NoticeModal.tsx */
"use client"

/**
 * ────────────────────────────────────────────────────────────────────────
 * NOTICE MODAL
 *
 * A small standalone popup, separate from TipsModal, that shows a
 * service-specific warning message (e.g. "NSFAS is under administration,
 * expect delays"). It only ever appears when the service the customer
 * is looking at has a `notice` set on it in the data file.
 *
 * Styled in brand ORANGE (not the hub's own accent color) on purpose —
 * a warning should look visually different from a hub-colored tip, so
 * customers instantly recognize it as "something to be aware of" rather
 * than a regular helpful hint.
 * ────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react"
import { X, WarningCircle } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"

export function NoticeModal({
  open, onClose, notice, hubTitle,
}: {
  open: boolean          // Whether the modal should be visible at all
  onClose: () => void    // Called when the user taps the X or the backdrop
  notice: string         // The actual warning text to display
  hubTitle: string       // Used only for the accessible aria-label
}) {
  // Close on Escape key, same behavior as TipsModal
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Nothing renders at all when closed — no invisible leftover DOM
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10300] flex items-center justify-center p-4">
      {/* Backdrop — tapping it closes the modal */}
      <div className="absolute inset-0 bg-black/55 animate-in fade-in duration-150" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Notice for ${hubTitle}`}
        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 rounded-[14px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 30px 70px -18px rgba(0,0,0,0.5), 0 10px 24px -8px rgba(0,0,0,0.3)" }}
      >
        {/* ── Header: warning icon + "Notice" title + close button ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${BRAND.orange}15`, color: BRAND.orange }}
            >
              <WarningCircle size={16} weight="fill" aria-hidden="true" />
            </div>
            <h4 className="abh-card-heading text-base truncate">Notice</h4>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notice"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
            style={{ backgroundColor: `${BRAND.orange}15`, color: BRAND.orange }}
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body: the actual notice text, scrollable if it's long ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 min-h-0">
          <p className="abh-body text-[0.95rem] leading-relaxed">{notice}</p>
        </div>
      </div>
    </div>
  )
}
