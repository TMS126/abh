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
    "ADR;TYPE=HOME:;;5878 Mpumalanga Section;Kgotsong;Bothaville;9660;South Africa",
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

  // Back button / back gesture closes the drawer instead of navigating away.
  // A history entry is pushed the moment it opens; if the very next
  // navigation event is a "back", we intercept it and just close instead.
  useEffect(() => {
    if (!open) return
    window.history.pushState({ modal: "profile" }, "")
    const onPopState = () => { onClose() }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [open, onClose])

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

  const handleVCard = () => {
    downloadPersonalVCard()
    setVcardDone(true)
    setTimeout(() => setVcardDone(false), 3000)
  }

  return (
    <>
      {/* Backdrop — also the click-outside-to-close target */}
      <div
        className={cn(
          "fixed inset-0 z-[10050] bg-black/40 backdrop-blur-sm transition-opacity duration-300 overscroll-contain",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered card — same language as the rest of the site's modals
          (HubModal / ServiceDetailModal): a fixed-position flex wrapper that
          centers a max-width card, leaving visible margin on every side
          instead of pinning a full-height panel to one edge. The wrapper
          itself is pointer-events-none so clicks on the empty margin fall
          through to the backdrop above and close it; only the card itself
          is interactive. */}
      <div
        className={cn(
          "fixed inset-0 z-[10060] flex items-center justify-center p-4 transition-opacity duration-300 pointer-events-none",
          open ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={`${BIZ.founder} — founder profile`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[14px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-all duration-300 ease-out",
            open ? "scale-100 pointer-events-auto" : "scale-95 pointer-events-none"
          )}
        >
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* ── Cover banner — calm, single-hue gradient for a more
                professional, less "busy" feel than the previous three-color
                blob mix. ── */}
            <div
              className="relative h-36 md:h-40 w-full shrink-0 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueDark} 100%)`,
              }}
            >
              {/* One soft highlight, top-right — restrained, not competing */}
              <div
                className="absolute -top-10 -right-10 w-56 h-56 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)`,
                }}
              />

              {/* Fine noise texture for a subtle premium grain, kept light */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundSize: "128px 128px",
                }}
              />

              {/* Close button */}
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close profile"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10"
              >
                <X size={15} weight="bold" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 pb-10 flex flex-col items-center text-center -mt-10">

              {/* Identity mark — flat, monochrome initials badge. No emoji,
                  no photo placeholder; a quiet, professional anchor instead
                  of a playful face. */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-zinc-900 shadow-lg overflow-hidden mb-4 bg-zinc-900 dark:bg-zinc-100"
                aria-hidden="true"
              >
                <span className="font-sans font-black text-2xl tracking-tight text-white dark:text-zinc-900 select-none">
                  {BIZ.founder.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
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

              {/* Action buttons — identical width, height, and structure on
                  both, so neither visually outweighs the other. Each label
                  is two stacked lines under its icon instead of a single
                  inline row, matching across both buttons exactly. */}
              <div className="flex flex-col items-center w-full gap-3">

                {/* Personal WhatsApp — orange */}
                <a
                  href={FOUNDER_WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[78%] h-[88px] flex flex-col items-center justify-center gap-1.5 rounded-[14px] font-extrabold text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5 shadow-sm"
                  style={{ backgroundColor: BRAND.orange }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = BRAND.orangeDark }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = BRAND.orange }}
                >
                  <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
                  <span className="leading-tight text-center">
                    Personal<br />WhatsApp
                  </span>
                </a>

                {/* Save personal vCard */}
                <button
                  onClick={handleVCard}
                  className="w-[78%] h-[88px] flex flex-col items-center justify-center gap-1.5 rounded-[14px] font-extrabold text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5 shadow-sm"
                  style={{ backgroundColor: vcardDone ? BRAND.green : BRAND.blue }}
                >
                  {vcardDone
                    ? <>
                        <AddressBook size={20} weight="fill" aria-hidden="true" />
                        <span className="leading-tight text-center">Saved to<br />Contacts!</span>
                      </>
                    : <>
                        <DownloadSimple size={20} weight="bold" aria-hidden="true" />
                        <span className="leading-tight text-center">Save<br />Contact</span>
                      </>
                  }
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
 
 
