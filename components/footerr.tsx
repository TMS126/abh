"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import {
  WhatsappLogo, EnvelopeSimple, Heart, Copy, Check,
} from "@phosphor-icons/react"
import { BIZ, WA, FOOTER_NAV } from "@/lib/brand"
import { BusinessStatusFull } from "@/components/business-status"
import { ScrollBounce } from "@/components/scroll-bounce"
import { TermsGateModal } from "@/components/footer/terms-gate-modal"
import { FaqAccordion } from "@/components/footer/faq-accordion"

// ─── Footer content ───────────────────────────────────────────────────────────
function FooterContent() {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [mounted,             setMounted]             = useState(false)
  const [isTermsOpen,         setIsTermsOpen]         = useState(false)
  const [isFaqAccordionOpen,  setIsFaqAccordionOpen]  = useState(false)
  const [openFaqIndex,        setOpenFaqIndex]        = useState<number | null>(null)
  const [phoneCopied,         setPhoneCopied]         = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleCopyPhone = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return
    await navigator.clipboard.writeText(BIZ.phone)
    setPhoneCopied(true)
    setTimeout(() => setPhoneCopied(false), 2000)
  }

  const toggleFaqIndex = (i: number) => setOpenFaqIndex((prev) => (prev === i ? null : i))

  const showFaq = pathname !== "/contact"

  return (
    <div className="pt-16 pb-12">

      {showFaq && (
        <ScrollBounce>
          <div className="px-6 mb-12 flex justify-center">
            <FaqAccordion
              isOpen={isFaqAccordionOpen}
              onToggle={() => setIsFaqAccordionOpen((v) => !v)}
              openIndex={openFaqIndex}
              onToggleIndex={toggleFaqIndex}
            />
          </div>
        </ScrollBounce>
      )}

      <ScrollBounce>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-16 px-6 md:px-8">

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 select-none">
              <div
                className="relative w-6 h-6 overflow-hidden rounded-[10px] shrink-0"
                aria-hidden="true"
                style={mounted && theme === "dark" ? { filter: "brightness(0) invert(1)" } : undefined}
              >
                <Image src="/logo.png" alt="" fill className="object-contain" />
              </div>
              <h2 className="font-sans font-black text-base tracking-tight text-zinc-900 dark:text-white">
                ApexbytesHub
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xs">
              Your local tech and print partner in Kgotsong. {BIZ.hubCount} hubs, {BIZ.serviceCount} services — all in one friendly place.
            </p>
          </div>

          {/* Nav: use <Link> instead of <button> for correct semantics */}
          <nav aria-label="Footer navigation">
            <h3 className="text-[0.7rem] font-black uppercase tracking-widest mb-8 text-zinc-400">Quick Links</h3>
            <ul className="flex flex-col gap-4">
              {FOOTER_NAV.map((page) => (
                <li key={page.label}>
                  <Link
                    href={page.path}
                    className="text-sm text-zinc-600 dark:text-zinc-300 hover:translate-x-1 hover:text-brand-blue transition-all duration-200 font-medium inline-block"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-[0.7rem] font-black uppercase tracking-widest mb-8 text-zinc-400">Connect</h3>
            <ul className="flex flex-col gap-5">
              <li className="relative">
                <div className="flex items-center gap-2">
                  <a
                    href={WA.general}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300 hover:text-brand-whatsapp transition-colors flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-[14px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm shrink-0" aria-hidden="true">
                      <WhatsappLogo weight="fill" className="w-5 h-5" />
                    </div>
                    <span className="truncate">{BIZ.phone}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    aria-label="Copy phone number"
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-zinc-400 hover:text-brand-blue transition-all active:scale-95 shrink-0"
                  >
                    {phoneCopied ? (
                      <Check weight="bold" className="w-3.5 h-3.5 text-brand-green" />
                    ) : (
                      <Copy weight="bold" className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {phoneCopied && (
                  <span className="absolute -top-7 right-0 whitespace-nowrap text-[0.6rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-200">
                    Copied!
                  </span>
                )}
              </li>
              <li>
                <a
                  href={`mailto:${BIZ.email}`}
                  className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300 hover:text-brand-blue transition-colors"
                >
                  <div className="w-10 h-10 rounded-[14px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm" aria-hidden="true">
                    <EnvelopeSimple weight="fill" className="w-5 h-5" />
                  </div>
                  {BIZ.email}
                </a>
              </li>
              <li className="pt-2">
                <BusinessStatusFull />
              </li>
            </ul>
          </div>
        </div>
      </ScrollBounce>

      {/* Bottom bar — its own subtle background strip, closely related to
          the footer's own background rather than a hard contrast */}
      <ScrollBounce>
        <div className="mt-8 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800">
          <div className="max-w-[1200px] mx-auto pt-8 pb-8 px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <p className="text-[0.65rem] font-medium text-zinc-400 text-center md:text-left">
              © {new Date().getFullYear()} {BIZ.name}. All rights reserved.
            </p>

            <div className="flex items-center justify-center gap-4 relative z-10">
              <button
                onClick={() => setIsTermsOpen(true)}
                style={{ fontSize: "0.65rem", lineHeight: "1rem" }}
                className="font-medium text-zinc-400 hover:text-brand-blue transition-colors py-2 px-1"
              >
                Terms
              </button>
              <span className="text-zinc-200 dark:text-zinc-700" aria-hidden="true">·</span>
              <Link
                href="/privacy"
                className="text-[0.65rem] font-medium text-zinc-300 dark:text-zinc-500 hover:text-brand-blue transition-colors py-2 px-1"
              >
                Privacy Policy
              </Link>
            </div>

            <p className="text-[0.65rem] font-medium text-zinc-400 flex items-center justify-center md:justify-end gap-1.5">
              Built with <Heart weight="fill" className="w-3 h-3 text-brand-orange" aria-hidden="true" /> for the Kgotsong community
            </p>
          </div>
        </div>
      </ScrollBounce>

      <TermsGateModal
        open={isTermsOpen}
        onAgree={() => setIsTermsOpen(false)}
      />
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
      <FooterContent />
    </footer>
  )
}
