// components/about/naked-traderz-reveal.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Sparkle } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"

// ---------------------------------------------------------------------------
// Static tokens
// ---------------------------------------------------------------------------
const ORANGE = BRAND.orangeDark

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface TheNakedTradersZARevealProps {
  accentColor?: string
}

export function TheNakedTradersZAReveal({ accentColor = BRAND.blue }: NakedTraderzRevealProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // -------------------------------------------------------------------------
  // Open / close
  // -------------------------------------------------------------------------
  const openModal = useCallback(() => {
    setModalOpen(true)
  }, [])

  // FIX: previously faded+shrank the modal for 200ms before unmounting,
  // which left a visible "small shrunk popup" on screen during that
  // window — that's what read as a stray popup after closing. Now it
  // closes immediately; only the open transition animates.
  const closeModal = useCallback(() => {
    setModalOpen(false)
    setAnimateIn(false)
    triggerRef.current?.focus({ preventScroll: true })
  }, [])

  // Trigger the enter transition on the next frame after mount, so the
  // browser has a "from" state (opacity-0/scale-96) to animate away from.
  useEffect(() => {
    if (!modalOpen) return
    const raf = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(raf)
  }, [modalOpen])

  // Escape to close, lock scroll, focus the close button
  useEffect(() => {
    if (!modalOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    closeBtnRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [modalOpen, closeModal])

  return (
    <span className="relative inline-block">
      {/* ----------------------------------------------------------------- */}
      {/* Trigger link — single click opens the modal directly             */}
      {/* ----------------------------------------------------------------- */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={modalOpen}
        aria-label="The Naked Traders ZA — view the first ever logo, before and after"
        className="underline decoration-dotted decoration-1 underline-offset-2 font-semibold outline-none rounded-sm focus-visible:ring-2"
        style={{ color: accentColor, textDecorationColor: `${accentColor}80` }}
      >
        Naked Traderz
      </button>

      {/* ----------------------------------------------------------------- */}
      {/* Modal                                                            */}
      {/* ----------------------------------------------------------------- */}
      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="nt-modal-title" className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out"
            style={{ opacity: animateIn ? 1 : 0 }}
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* FIX: was max-w-md — too cramped on phone. Now takes up most
              of the viewport width (94vw) on mobile, caps at a sensible
              size on larger screens, and scrolls internally if needed so
              nothing gets clipped on short phone screens. */}
          <div
            className="relative w-[94vw] sm:w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] bg-white dark:bg-zinc-950 shadow-2xl p-5 sm:p-8 transition-all duration-200 ease-out"
            style={{
              opacity: animateIn ? 1 : 0,
              transform: animateIn ? "scale(1)" : "scale(0.96)",
            }}
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeModal}
              aria-label="Close logo preview"
              className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none focus-visible:ring-2"
              style={{ ["--tw-ring-color" as string]: accentColor }}
            >
              <X size={18} weight="bold" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Sparkle size={14} weight="fill" style={{ color: ORANGE.brand }} aria-hidden="true" />
              <span className="text-[0.68rem] font-black uppercase tracking-widest" style={{ color: ORANGE.brand}}>
                1st Ever Logo
              </span>
            </div>

            <h3 id="nt-modal-title" className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-1">
              The Naked Traders ZA
            </h3>
            <p className="text-[0.86rem] font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              Market trading group — forex &amp; CFD trading (e.g. EUR/USD)
            </p>

            {/* FIX: dropped the inner p-3 on each Image, which was
                shrinking the visible logo inside an already-small box.
                Combined with the wider modal, images are now
                meaningfully bigger. Stacks full-width on mobile
                (grid-cols-1), side-by-side from sm: up. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="flex flex-col gap-2">
                <div className="relative w-full aspect-square rounded-[14px] overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <Image
                    src="/nts.webp"
                    alt="Naked Traderz logo — original sketch"
                    fill
                    sizes="(max-width: 440px) 68vw, 320px"
                    className="object-contain"
                  />
                </div>
                <span className="text-[0.72rem] font-bold uppercase tracking-widest text-zinc-400 text-center">Before</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative w-full aspect-square rounded-[14px] overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <Image
                    src="/nto.webp"
                    alt="Naked Traderz logo — final design"
                    fill
                    sizes="(max-width: 440px) 68vw, 320px"
                    className="object-contain"
                  />
                </div>
                <span className="text-[0.72rem] font-bold uppercase tracking-widest text-zinc-400 text-center">After</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  )
} 
