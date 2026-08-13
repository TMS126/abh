// components/about/naked-traderz-reveal.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Sparkle } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"

interface TheNakedTradersZARevealProps {
  accentColor?: string
  accentOrange?: string
}

export function TheNakedTradersZAReveal({
  accentColor = BRAND.blue,
  accentOrange = BRAND.orangeDark,
}: TheNakedTradersZARevealProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const openModal = useCallback(() => {
    setModalOpen(true)
    window.history.pushState({ nakedTraderzModal: true }, "")
  }, [])

  const closeModal = useCallback((viaPopState = false) => {
    setAnimateIn(false)
    setModalOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
    if (!viaPopState && window.history.state?.nakedTraderzModal) {
      window.history.back()
    }
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
    function handlePopState() {
      closeModal(true)
    }
    document.addEventListener("keydown", handleKey)
    window.addEventListener("popstate", handlePopState)
    document.body.style.overflow = "hidden"
    closeBtnRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", handleKey)
      window.removeEventListener("popstate", handlePopState)
      document.body.style.overflow = ""
    }
  }, [modalOpen, closeModal])

  return (
    <span className="relative inline-block">
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

      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="nt-modal-title" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 transition-opacity duration-300 ease-out"
            style={{ opacity: animateIn ? 1 : 0 }}
            onClick={() => closeModal()}
            aria-hidden="true"
          />

          <div
            className="relative w-full max-w-xs rounded-[20px] bg-card shadow-2xl p-5 transition-all duration-300"
            style={{
              opacity: animateIn ? 1 : 0,
              transform: animateIn ? "translateY(0) scale(1)" : "translateY(8px) scale(0.94)",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => closeModal()}
              aria-label="Close logo preview"
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors outline-none focus-visible:ring-2"
              style={{ ["--tw-ring-color" as string]: accentColor }}
            >
              <X size={16} weight="bold" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Sparkle size={14} weight="fill" style={{ color: accentOrange }} aria-hidden="true" />
              <span className="text-[0.68rem] font-black uppercase tracking-widest" style={{ color: accentOrange }}>
                1st Ever Logo
              </span>
            </div>

            <h3 id="nt-modal-title" className="font-sans font-black text-lg text-zinc-900 dark:text-zinc-50 mb-1">
              The Naked Traders ZA
            </h3>
            <p className="text-[0.82rem] font-medium text-zinc-500 dark:text-zinc-400 mb-4">
              Market trading group — forex &amp; CFD trading (e.g. EUR/USD)
            </p>

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
