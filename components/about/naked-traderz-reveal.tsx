// components/about/naked-traderz-reveal.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Sparkle } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"

// ---------------------------------------------------------------------------
// Static tokens
// ---------------------------------------------------------------------------
const orangeColor = isDark ? BRAND.lightOrange : BRAND.orangeDark 

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface TheNakedTradersZARevealProps {
  accentColor?: string
}

// FIX: interface/type name mismatch (TheNakedTradersZARevealProps declared
// but NakedTraderzRevealProps referenced) — fixed, now uses the correct
// type. Component + export renamed consistently to TheNakedTradersZAReveal
// throughout — update the import in about-page.tsx to match:
//   import { TheNakedTradersZAReveal } from "@/components/about/naked-traderz-reveal"
//   <TheNakedTradersZAReveal accentColor={blueOnCard} />
export function TheNakedTradersZAReveal({ accentColor = BRAND.blue }: TheNakedTradersZARevealProps) {
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

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setAnimateIn(false)
    triggerRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    const raf = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(raf)
  }, [modalOpen])

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
        aria-label="The Naked Traders ZA — view the original logo"
        className="underline decoration-dotted decoration-1 underline-offset-2 font-semibold outline-none rounded-sm focus-visible:ring-2"
        style={{ color: accentColor, textDecorationColor: `${accentColor}80` }}
      >
        The Naked Traders ZA
      </button>

      {/* ----------------------------------------------------------------- */}
      {/* Modal                                                            */}
      {/* ----------------------------------------------------------------- */}
      {/* FIX: previous version was w-[94vw] sm:max-w-2xl max-h-[90vh]
          overflow-y-auto — meant for a two-image before/after grid, way
          too big and scrollable for a single logo. Now a small fixed-size
          card (max-w-xs) sized to the image, no scroll needed, content
          fits in one view on any phone. */}
      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="nt-modal-title" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out"
            style={{ opacity: animateIn ? 1 : 0 }}
            onClick={closeModal}
            aria-hidden="true"
          />

          <div
            className="relative w-full max-w-xs rounded-[20px] bg-white dark:bg-zinc-950 shadow-2xl p-5 transition-all duration-200 ease-out"
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
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none focus-visible:ring-2"
              style={{ ["--tw-ring-color" as string]: accentColor }}
            >
              <X size={16} weight="bold" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              {/* FIX: was ORANGE.brand — ORANGE is already the hex string
                  from BRAND.orangeDark, not an object with a .brand key.
                  That made this render colorless. Now uses ORANGE directly. */}
              <Sparkle size={14} weight="fill" style={{ color: ORANGE }} aria-hidden="true" />
              <span className="text-[0.68rem] font-black uppercase tracking-widest" style={{ color: ORANGE }}>
                1st Ever Logo
              </span>
            </div>

            <h3 id="nt-modal-title" className="font-sans font-black text-lg text-zinc-900 dark:text-zinc-50 mb-1">
              The Naked Traders ZA
            </h3>
            <p className="text-[0.82rem] font-medium text-zinc-500 dark:text-zinc-400 mb-4">
              Market trading group — forex &amp; CFD trading (e.g. EUR/USD)
            </p>

            {/* Single image (final logo), subtle shadow, compact square */}
            <div className="relative w-full aspect-square rounded-[14px] overflow-hidden shadow-md bg-zinc-50 dark:bg-zinc-900/50">
              <Image
                src="/nto.webp"
                alt="The Naked Traders ZA logo"
                fill
                sizes="288px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </span>
  )
} 
