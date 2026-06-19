"use client"

import { useEffect, useRef, useState } from "react"
import { X, WhatsappLogo, DownloadSimple, AddressBook } from "@phosphor-icons/react"
import { BIZ, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

const FOUNDER_ROLE = "Founder & Lead Designer"
const FOUNDER_BIO  =
  "Theji started Apexbytes Hub to bring real, affordable digital services to the Kgotsong community. " +
  "With a passion for design and technology, he handles everything from logo creation to government portal " +
  "applications — personally. You deal directly with the founder, every time."

const FOUNDER_WA_LINK = `https://wa.me/27781294939?text=${encodeURIComponent(`Hi ${BIZ.founder}! I'd like to get in touch with you directly.`)}`

// ─── Personal vCard download ───────────────────────────────────────────────────
function downloadPersonalVCard() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Theji Meje ApexbytesHub",
    "N:ApexbytesHub;Theji Meje;;;",
    "ORG:Apexbytes Hub",
    "TITLE:Founder & Lead Designer",
    "TEL;TYPE=CELL,PREF:+27781294939",
    "TEL;TYPE=CELL:+27753338260",
    "EMAIL;TYPE=PERSONAL:teggyb.meje@gmail.com",
    `ADR;TYPE=HOME:;;5878 Mpumalanga Section;Kgotsong;Bothaville;9660;South Africa`,
    "URL:https://v0-apexbytes-hub-website.vercel.app/",
    "NOTE:Founder of Apexbytes Hub — contact directly for personal enquiries.",
    "END:VCARD",
  ].join("\r\n")

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = "Theji-Meje-ApexbytesHub.vcf"
  a.click()
  URL.revokeObjectURL(url)
}

interface ProfileDrawerProps {
  open: boolean
  onClose: () => void
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const ref      = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [vcardDone, setVcardDone] = useState(false)

  useEffect(() => { if (open) closeRef.current?.focus() }, [open])

  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"
    style.top      = `-${scrollY}px`
    style.left     = "0"
    style.right    = "0"
    style.width    = "100%"
    style.overflow = "hidden"
    return () => {
      style.position = ""
      style.top      = ""
      style.left     = ""
      style.right    = ""
      style.width    = ""
      style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return }
      if (e.key !== "Tab" || !ref.current) return
      const els  = ref.current.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')
      const first = els[0]; const last = els[els.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const handleVCard = () => {
    downloadPersonalVCard()
    setVcardDone(true)
    setTimeout(() => setVcardDone(false), 3000)
  }

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

      {/* Drawer */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`${BIZ.founder} — founder profile`}
        className={cn(
          "fixed z-[10060] bg-white dark:bg-zinc-900 shadow-2xl transition-transform duration-300 ease-out overflow-hidden flex flex-col",
          /* Mobile — bottom sheet */
          "bottom-0 left-0 right-0 rounded-t-[14px] max-h-[85vh]",
          /* Desktop — right side panel */
          "md:bottom-auto md:top-0 md:left-auto md:right-0 md:w-[360px] md:h-full md:max-h-full md:rounded-t-none md:rounded-l-[14px]",
          open
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-x-full"
        )}
      >
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Cover banner */}
          <div
            className="relative h-40 md:h-52 w-full shrink-0"
            style={{ background: `linear-gradient(160deg, ${BRAND.blue} 0%, ${BRAND.blue} 62%, ${BRAND.greenDark} 100%)` }}
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

          {/* Content */}
          <div className="px-8 pb-10 flex flex-col items-center text-center -mt-10">

            {/* Avatar */}
            <div className="relative mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white shrink-0 border-4 border-white dark:border-zinc-900 shadow-lg"
                style={{ backgroundColor: BRAND.blue }}
                aria-hidden="true"
              >
                TM
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm shadow-sm">
                ☺
              </div>
            </div>

            {/* Name & role */}
            <h2 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-1">
              {BIZ.founder}
            </h2>
            <p className="text-sm font-semibold text-brand-blue dark:text-brand-light-blue mb-1">
              {FOUNDER_ROLE}
            </p>
            <p className="abh-label text-[0.62rem] mb-6">
              {BIZ.address.replace(/^5878\s*/, "")}
            </p>

            {/* Bio */}
            <p className="abh-body text-sm text-center mb-8 leading-relaxed">
              {FOUNDER_BIO}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col items-center w-full gap-3">

              {/* Personal WhatsApp */}
              <a
                href={FOUNDER_WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-3 px-8 rounded-[14px] font-extrabold text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5"
                style={{ backgroundColor: BRAND.whatsapp }}
              >
                <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
                Personal WhatsApp
              </a>

              {/* Save personal vCard */}
              <button
                onClick={handleVCard}
                className="w-full flex items-center justify-center gap-3 py-3 px-8 rounded-[14px] font-extrabold text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5"
                style={{ backgroundColor: vcardDone ? BRAND.green : BRAND.blue }}
              >
                {vcardDone
                  ? <><AddressBook size={18} weight="fill" /> Saved to Contacts!</>
                  : <><DownloadSimple size={18} weight="bold" /> Save My Contact</>
                }
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  )
                } 
