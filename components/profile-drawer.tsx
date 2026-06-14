"use client"

import { useEffect, useRef } from "react"
import { X, WhatsappLogo, Envelope, Phone } from "@phosphor-icons/react"
import { BIZ, WA, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

const FOUNDER_ROLE = "Founder & Lead Designer"
const FOUNDER_BIO  =
  "Theji started Apexbytes Hub to bring real, affordable digital services to the Kgotsong community. " +
  "With a passion for design and technology, he handles everything from logo creation to government portal " +
  "applications — personally. You deal directly with the founder, every time."

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

  /* Scroll lock when drawer is open */
  useEffect(() => {
    if (open) {
      document.body.classList.add("scroll-locked")
    } else {
      document.body.classList.remove("scroll-locked")
    }
    return () => { document.body.classList.remove("scroll-locked") }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[10050] bg-black/60 backdrop-blur-md transition-opacity duration-300",
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
          "fixed z-[10060] bg-white dark:bg-[#18181B] shadow-2xl transition-transform duration-300 ease-out",
          /* Mobile */
          "bottom-0 left-0 right-0 rounded-t-[14px] max-h-[85vh] overflow-y-auto",
          /* Desktop */
          "md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-[360px] md:h-full md:max-h-full md:rounded-t-none md:rounded-l-[14px]",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full"
        )}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close profile"
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-[#27272A] flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-[#3f3f46] transition-colors"
          >
            <X size={15} weight="bold" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-black text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.green})` }}
            aria-hidden="true"
          >
            {BIZ.founder.split(" ").map(n => n[0]).join("")}
          </div>

          {/* Name & role */}
          <h2 className="font-sans font-black text-xl text-zinc-900 dark:text-[#FAFAFA] mb-1">{BIZ.founder}</h2>
          <p className="text-sm font-semibold text-brand-blue dark:text-brand-light-blue mb-1">{FOUNDER_ROLE}</p>
          <p className="abh-label text-[0.62rem] mb-6">{BIZ.location}</p>

          {/* Bio */}
          <p className="abh-body text-sm text-center mb-8 leading-relaxed">{FOUNDER_BIO}</p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full">
            <a
              href={WA.general}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-[14px] font-extrabold text-sm text-white transition-all active:scale-95"
              style={{ backgroundColor: BRAND.whatsapp }}
            >
              <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={`mailto:${BIZ.email}`}
              className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-[14px] font-extrabold text-sm border border-zinc-200 dark:border-[#27272A] text-zinc-700 dark:text-[#A1A1AA] hover:bg-zinc-50 dark:hover:bg-[#27272A] transition-all active:scale-95"
            >
              <Envelope size={18} weight="fill" aria-hidden="true" />
              {BIZ.email}
            </a>
            <a
              href={`tel:${BIZ.phoneE164}`}
              className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-[14px] font-extrabold text-sm border border-zinc-200 dark:border-[#27272A] text-zinc-700 dark:text-[#A1A1AA] hover:bg-zinc-50 dark:hover:bg-[#27272A] transition-all active:scale-95"
            >
              <Phone size={18} weight="fill" aria-hidden="true" />
              {BIZ.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
