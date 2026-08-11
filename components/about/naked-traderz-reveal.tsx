// components/about/naked-traderz-reveal.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, ArrowRight, Sparkle } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"

// ---------------------------------------------------------------------------
// Static tokens
// ---------------------------------------------------------------------------
const ORANGE = BRAND.orangeDark

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
// FIX: this component previously hardcoded `const BLUE = BRAND.blue` and
// ignored any color passed in — about-page.tsx was already calling
// <NakedTraderzReveal accentColor={blueOnCard} /> (blueOnCard is BRAND.blue
// run through ensureAccessible against the card background), but that prop
// had nowhere to go. Accepting it here is what actually makes the link
// contrast-safe in dark mode. Default kept so the component still renders
// sensibly if ever used without the prop.
interface NakedTraderzRevealProps {
  accentColor?: string
}

export function NakedTraderzReveal({ accentColor = BRAND.blue }: NakedTraderzRevealProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const wrapperRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const closeModal = useCallback(() => {
    setModalOpen(false)
    triggerRef.current?.focus()
  }, [])

  const openModal = useCallback(() => {
    setModalOpen(true)
    setPreviewOpen(false)
  }, [])

  // -------------------------------------------------------------------------
  // Trigger behavior — small popup first, modal on second activation
  // -------------------------------------------------------------------------
  // Desktop/mobile unified trigger: first activation reveals the mini
  // preview, second activation (tap again, or click while hover-preview
  // is already showing) opens the full modal.
  function handleTriggerClick() {
    if (previewOpen) {
      openModal()
    } else {
      setPreviewOpen(true)
    }
  }

  // Close the mini preview on outside tap/click (mobile + desktop)
  useEffect(() => {
    if (!previewOpen) return
    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPreviewOpen(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [previewOpen])

  // Modal: Escape to close, lock scroll, focus the close button
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
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
          setPreviewOpen(false)
        }
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Trigger link                                                     */}
      {/* ----------------------------------------------------------------- */}
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setPreviewOpen(true)}
        onMouseLeave={() => setPreviewOpen(false)}
        onFocus={() => setPreviewOpen(true)}
        onClick={handleTriggerClick}
        aria-expanded={previewOpen}
        aria-haspopup="dialog"
        aria-label="Naked Traderz — view the first ever logo, before and after"
        className="underline decoration-dotted decoration-1 underline-offset-2 font-semibold outline-none rounded-sm focus-visible:ring-2"
        style={{ color: accentColor, textDecorationColor: `${accentColor}80` }}
      >
        Naked Traderz
      </button>

      {/* ----------------------------------------------------------------- */}
      {/* Mini preview popup                                               */}
      {/* ----------------------------------------------------------------- */}
      {previewOpen && (
        <div className="absolute z-40 left-1/2 -translate-x-1/2 top-full mt-2 w-[220px] rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-elevated border border-zinc-100 dark:border-zinc-800/60 p-3">
          <div className="flex items-center justify-center mb-2">
            <span
              className="text-[0.62rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${ORANGE}15`, color: ORANGE }}
            >
              1st Ever Logo
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
              {/* FIX: object-cover cropped these logos to fit the square box.
                  object-contain + a neutral background shows the logo's real
                  aspect ratio, letterboxed rather than cropped. */}
              <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                <Image
                  src="/nts.webp"
                  alt="Naked Traderz logo — original sketch"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <span className="text-[0.6rem] font-bold uppercase tracking-wide text-zinc-400">Before</span>
            </div>
            <ArrowRight size={14} weight="bold" className="text-zinc-300 dark:text-zinc-600 shrink-0" aria-hidden="true" />
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-14 h-14 rounded-[10px] overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                <Image
                  src="/nto.webp"
                  alt="Naked Traderz logo — final design"
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <span className="text-[0.6rem] font-bold uppercase tracking-wide text-zinc-400">After</span>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="mt-2.5 w-full text-center text-[0.68rem] font-bold uppercase tracking-widest py-2 rounded-[8px] transition-colors"
            style={{ color: accentColor, backgroundColor: `${accentColor}10` }}
          >
            Tap to zoom
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Full modal                                                       */}
      {/* ----------------------------------------------------------------- */}
      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="nt-modal-title" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />

          <div className="relative w-full max-w-md rounded-[18px] bg-white dark:bg-zinc-950 shadow-2xl p-6 md:p-7">
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
              <Sparkle size={14} weight="fill" style={{ color: ORANGE }} aria-hidden="true" />
              <span className="text-[0.68rem] font-black uppercase tracking-widest" style={{ color: ORANGE }}>
                1st Ever Logo
              </span>
            </div>

            <h3 id="nt-modal-title" className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-1">
              Naked Traderz
            </h3>
            <p className="text-[0.86rem] font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              Market trading group — forex &amp; CFD trading (e.g. EUR/USD)
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* FIX: same object-contain swap as the mini preview, so the
                  zoomed view shows the logos' true proportions instead of a
                  cropped square. */}
              <div className="flex flex-col gap-1.5">
                <div className="relative aspect-square rounded-[12px] overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <Image
                    src="/nts.webp"
                    alt="Naked Traderz logo — original sketch"
                    fill
                    sizes="200px"
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-[0.68rem] font-bold uppercase tracking-widest text-zinc-400 text-center">Before</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="relative aspect-square rounded-[12px] overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <Image
                    src="/nto.webp"
                    alt="Naked Traderz logo — final design"
                    fill
                    sizes="200px"
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-[0.68rem] font-bold uppercase tracking-widest text-zinc-400 text-center">After</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  )
}
 
