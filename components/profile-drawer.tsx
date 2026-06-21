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

  // Scroll lock
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"; style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""; style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [open])

  // Back button
  useEffect(() => {
    if (!open) return
    window.history.pushState({ modal: "profile" }, "")
    const onPopState = () => { onClose() }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [open, onClose])

  // Keyboard trap
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
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[10050] bg-black/40 backdrop-blur-sm transition-opacity duration-300 overscroll-contain",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet wrapper */}
      <div
        className={cn(
          "fixed inset-0 z-[10060] flex items-end justify-center transition-opacity duration-300 pointer-events-none",
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
            // Wider card — max-w-md instead of max-w-sm
            "relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-transform duration-300 ease-out",
            open ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"
          )}
        >
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* ── Cover banner — name displayed on it ── */}
            <div
              className="relative h-36 md:h-44 w-full shrink-0 overflow-hidden flex items-end"
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueDark} 100%)`,
              }}
            >
              {/* Green glow — bottom-left */}
              <div
                className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${BRAND.green}55 0%, transparent 70%)` }}
              />
              {/* Orange glow — top-right */}
              <div
                className="absolute -top-6 -right-4 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${BRAND.orange}40 0%, transparent 70%)` }}
              />
              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-[0.045] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                  backgroundSize: "128px 128px",
                }}
              />

              {/* Name on banner */}
              <div className="relative z-10 px-7 pb-5">
                <p className="font-sans font-black text-xl text-white tracking-tight leading-tight drop-shadow-sm">
                  Theji Meje
                </p>
                <p className="text-[0.72rem] font-bold text-white/70 uppercase tracking-widest mt-0.5">
                  {FOUNDER_ROLE}
                </p>
              </div>

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
            <div className="px-8 pb-10 pt-6 flex flex-col items-center text-center">

              {/* Location */}
              <p className="abh-label text-[0.62rem] mb-6">
                {BIZ.address.replace(/^5878\s*/, "")}
              </p>

              {/* Bio */}
              <p className="abh-body text-sm text-center mb-8 leading-relaxed">
                {FOUNDER_BIO}
              </p>

              {/* Action buttons — same size, weight, font, layout */}
              <div className="flex flex-col items-center w-full gap-3">

                {/* Personal WhatsApp — green */}
                <a
                  href={FOUNDER_WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[82%] h-[86px] flex flex-col items-center justify-center gap-1.5 rounded-[14px] font-black text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: BRAND.whatsapp,
                    boxShadow: `0 6px 20px rgba(37,211,102,0.35)`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = BRAND.whatsappDark }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = BRAND.whatsapp }}
                >
                  <WhatsappLogo size={22} weight="fill" aria-hidden="true" />
                  <span className="leading-tight text-center text-sm font-black">
                    Personal<br />WhatsApp
                  </span>
                </a>

                {/* Save contact — brand blue */}
                <button
                  onClick={handleVCard}
                  className="w-[82%] h-[86px] flex flex-col items-center justify-center gap-1.5 rounded-[14px] font-black text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: vcardDone ? BRAND.green : BRAND.blue,
                    boxShadow: vcardDone
                      ? `0 6px 20px rgba(111,191,26,0.35)`
                      : `0 6px 20px rgba(30,111,168,0.35)`,
                  }}
                >
                  {vcardDone ? (
                    <>
                      <AddressBook size={22} weight="fill" aria-hidden="true" />
                      <span className="leading-tight text-center text-sm font-black">
                        Saved to<br />Contacts!
                      </span>
                    </>
                  ) : (
                    <>
                      <DownloadSimple size={22} weight="bold" aria-hidden="true" />
                      <span className="leading-tight text-center text-sm font-black">
                        Save<br />Contact
                      </span>
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
                  } 
