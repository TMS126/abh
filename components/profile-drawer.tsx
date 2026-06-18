"use client"

import { useEffect, useRef } from "react"
import { X, WhatsappLogo, Phone } from "@phosphor-icons/react"
import { BIZ, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

const FOUNDER_ROLE = "Founder & Lead Designer"
const FOUNDER_BIO  =
  "Theji started Apexbytes Hub to bring real, affordable digital services to the Kgotsong community. " +
  "With a passion for design and technology, he handles everything from logo creation to government portal " +
  "applications — personally. You deal directly with the founder, every time."

// Personal WhatsApp — separate from the business line, kept local to this component
const FOUNDER_WA_LINK = `https://wa.me/27781294939?text=${encodeURIComponent(`Hi ${BIZ.founder}! I'd like to get in touch with you directly.`)}`

interface ProfileDrawerProps {
  open: boolean
  onClose: () => void
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const ref      = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { if (open) closeRef.current?.focus() }, [open])

  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"
    style.top = `-${scrollY}px`
    style.left = "0"
    style.right = "0"
    style.width = "100%"
    style.overflow = "hidden"
    return () => {
      style.position = ""
      style.top = ""
      style.left = ""
      style.right = ""
      style.width = ""
      style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return }
      if (e.key !== "Tab" || !ref.current) return
      const els   = ref.current.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')
      const first = els[0]; const last = els[els.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[10050] bg-black/40 backdrop-blur-sm transition-opacity duration-300 overscroll-contain",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile: slides up from bottom */}
      {/* Desktop: slides in from right */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`${BIZ.founder} — founder profile`}
        className={cn(
          "fixed z-[10060] bg-white dark:bg-zinc-900 shadow-2xl transition-transform duration-300 ease-out overflow-hidden flex flex-col",
          /* Mobile */
          "bottom-0 left-0 right-0 rounded-t-[14px] max-h-[85vh]",
          /* Desktop */
          "md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-[360px] md:h-full md:max-h-full md:rounded-t-none md:rounded-l-[14px]",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full"
        )}
      >
        {/* Scrollable inner wrapper — contains the cover so it stays clipped to the panel's rounded corners */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Cover banner — WhatsApp Business style */}
          <div
            className="relative h-28 md:h-32 w-full shrink-0"
            style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.green})` }}
          >
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close profile"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              <X size={15} weight="bold" aria-hidden="true" />
            </button>
          </div>

          {/* Content — avatar overlaps the cover */}
          <div className="px-8 pb-10 flex flex-col items-center text-center -mt-10">
            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white shrink-0 border-4 border-white dark:border-zinc-900 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.green})` }}
                aria-hidden="true"
              >
                TM
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm shadow-sm">
                ☺
              </div>
            </div>

            {/* Name & role */}
            <h2 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-1">{BIZ.founder}</h2>
            <p className="text-sm font-semibold text-brand-blue dark:text-brand-light-blue mb-1">{FOUNDER_ROLE}</p>
            <p className="abh-label text-[0.62rem] mb-6">{BIZ.address}</p>

            {/* Bio */}
            <p className="abh-body text-sm text-center mb-8 leading-relaxed">{FOUNDER_BIO}</p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full">
              <a
                href={FOUNDER_WA_LINK}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-[14px] font-extrabold text-sm text-white transition-all active:scale-95"
                style={{ backgroundColor: BRAND.whatsapp }}
              >
                <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
                Personal WhatsApp
              </a>
              <a
                href={`tel:${BIZ.phoneE164}`}
                className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-[14px] font-extrabold text-sm border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
              >
                <Phone size={18} weight="fill" aria-hidden="true" />
                {BIZ.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
 
