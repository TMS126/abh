"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { X, Info } from "@phosphor-icons/react"
import { BIZ } from "@/lib/brand"
import { TERMS_SECTIONS, ICON_COMPONENTS } from "./terms-data"

export function TermsGateModal({ open, onAgree }: { open: boolean; onAgree: () => void }) {
  const guardActive  = useRef(false)
  const closeBtnRef  = useRef<HTMLButtonElement>(null)
  const triggerRef   = useRef<HTMLElement | null>(null)
  const BUFFER = 5
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const resolveColor = (s: { colorLight: string; colorDark: string }) =>
    mounted && theme === "dark" ? s.colorDark : s.colorLight

  // Move focus into modal when it opens; restore it when it closes
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement
      // Small delay so the modal is in the DOM before focusing
      const id = setTimeout(() => closeBtnRef.current?.focus(), 50)
      return () => clearTimeout(id)
    } else {
      triggerRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    document.documentElement.classList.toggle("scroll-locked", open)
    document.body.classList.toggle("scroll-locked", open)
    return () => {
      document.documentElement.classList.remove("scroll-locked")
      document.body.classList.remove("scroll-locked")
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    guardActive.current = true
    for (let i = 0; i < BUFFER; i++) window.history.pushState({ termsGate: true }, "")
    const onPop = () => {
      if (!guardActive.current) return
      for (let i = 0; i < BUFFER; i++) window.history.pushState({ termsGate: true }, "")
    }
    window.addEventListener("popstate", onPop)
    return () => {
      guardActive.current = false
      window.removeEventListener("popstate", onPop)
    }
  }, [open])

  const handleClose = () => {
    guardActive.current = false
    window.history.go(-BUFFER)
    onAgree()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terms & Service Policies"
      className="fixed inset-0 z-[99999] flex items-center justify-center md:p-8 bg-white dark:bg-zinc-950 md:bg-black/50 md:dark:bg-black/70 md:backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full h-full md:h-[85vh] md:max-w-3xl bg-white dark:bg-zinc-950 md:rounded-[20px] md:shadow-2xl overflow-hidden flex flex-col animate-in md:zoom-in-95 duration-300">

        <div className="px-6 md:px-10 pt-8 pb-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] relative z-10 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans font-black text-2xl text-brand-blue dark:text-brand-light-blue">Terms & Service Policies</h2>
            <p className="text-[0.65rem] font-medium text-zinc-400 mt-1">
              {BIZ.name} · Updated {BIZ.year}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={handleClose}
            aria-label="Close Terms & Service Policies"
            className="w-8 h-8 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
          >
            <X size={14} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-10 py-6 md:py-10">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="p-5 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-[0.82rem] text-zinc-900 dark:text-zinc-50">
                <Info weight="fill" className="w-4 h-4" aria-hidden="true" /> Operational Rule
              </h3>
              <p className="text-[0.82rem] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                By tapping &ldquo;I Agree&rdquo; below, you confirm full agreement with all operational rules and terms listed here.
              </p>
            </div>

            {TERMS_SECTIONS.map((s, i) => {
              const IconComp = ICON_COMPONENTS[s.icon]
              const color = resolveColor(s)
              return (
                <div key={i} className="space-y-3">
                  <h3 className="font-black flex items-center gap-2 text-[0.82rem]" style={{ color }}>
                    <IconComp weight="fill" className="w-4 h-4 shrink-0" aria-hidden="true" style={{ color }} />
                    {s.title}
                  </h3>
                  <ul className="space-y-2 list-disc list-inside pl-1">
                    {s.points.map((p, j) => (
                      <li key={j} className="text-[0.82rem] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        <strong className="text-zinc-700 dark:text-zinc-300">{p.label}:</strong> {p.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 md:px-10 py-6 border-t border-zinc-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-950 flex justify-center">
          <button
            onClick={handleClose}
            className="px-10 py-3 rounded-[14px] bg-brand-blue text-white font-black text-[0.9rem] active:scale-[0.98] transition-transform"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  )
}
