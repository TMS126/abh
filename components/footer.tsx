"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import {
  WhatsappLogo, EnvelopeSimple,
  X, Printer, FileText, Palette,
  Globe, Cpu, Info, Heart,
  CaretDown, CurrencyDollar,
  Copy, Check,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, WA, FOOTER_NAV, FAQS } from "@/lib/brand"
import { BusinessStatusFull } from "@/components/business-status"
import { ScrollBounce } from "@/components/scroll-bounce"

const TERMS_SECTIONS = [
  {
    icon: "Printer",
    colorLight: BRAND.blue,
    colorDark: BRAND.lightBlue,
    title: "Print Hub – Everything Paper",
    points: [
      { label: "Printing Services", text: "B&W, Colour, and Bulk printing. For bulk discounts, submit your entire order together." },
      { label: "Paper Types", text: "A4 paper in various gsm. Add lamination, paper-clipping or stapling." },
      { label: "Files & Proofing", text: "Submit files in PDF, DOCX, JPG, or PNG and proofread before sending — we're not responsible for errors in your original file." },
      { label: "Payment & Collection", text: "Large orders require full payment before collection. Laminated and bound items cannot be returned once completed." },
      { label: "Turnaround", text: "Same-day, no exceptions." },
    ],
  },
  {
    icon: "FileText",
    colorLight: BRAND.green,
    colorDark: BRAND.lightGreen,
    title: "Document Hub – All Document Work",
    points: [
      { label: "Document Assistance", text: "Full CV creation, typing, editing, and formatting. You are responsible for the accuracy of all content you provide." },
      { label: "Official Papers", text: "Affidavits, letters, and application documents typed to standard." },
      { label: "Confidentiality", text: "Sensitive personal information is handled with strict confidentiality at all times." },
      { label: "Submission", text: "Provide raw content and instructions in an editable format (DOCX, PDF, TXT) before work begins." },
      { label: "Turnaround", text: "Same-day, no exceptions." },
    ],
  },
  {
    icon: "Palette",
    colorLight: BRAND.orangeDark,
    colorDark: BRAND.lightOrange,
    title: "Design Hub – Creative Work",
    points: [
      { label: "Branding Design", text: "Logos and business cards built in Adobe Illustrator. No generic templates." },
      { label: "Marketing Designs", text: "Flyers, posters, banners, and social media templates custom-created from your brief." },
      { label: "Business Profile", text: "Full company profile documents, professionally branded and formatted for pitching, tenders, or registration." },
      { label: "Revisions & Ownership", text: "Revisions are limited to what's included in your package; extra rounds may cost more. Designs remain the property of ApexbytesHub until paid in full." },
      { label: "Approval", text: "Prompt approval of drafts is needed to keep your deadline on track. Final work is for legal, ethical use only." },
      { label: "Turnaround", text: "2–3 business days, no exceptions." },
    ],
  },
  {
    icon: "Globe",
    colorLight: BRAND.blueDark,
    colorDark: BRAND.lightBlue,
    title: "E-Service Hub – External Systems",
    points: [
      { label: "Government Services", text: `Admin help across SARS, SASSA, CSD, PSIRA, UIF, etc. ${BIZ.name} is not responsible for government processing delays.` },
      { label: "Document Completeness", text: "Applications only begin once all required documents are received, complete, and legible. Incomplete submissions are placed on hold." },
      { label: "OTP & Reachability", text: "You must be reachable during processing — OTPs expire within minutes and must be forwarded immediately." },
      { label: "Disclaimer", text: "We guide and submit on your behalf, but all personal information and consent is your responsibility. Final approval sits with the relevant government platform." },
      { label: "Payment", text: "Full payment is required before final confirmations, reference numbers, or results are released." },
      { label: "Turnaround", text: "Your application is submitted same-day to next-day. Government processing time after that varies and is outside our control." },
    ],
  },
  {
    icon: "Cpu",
    colorLight: BRAND.dark100,
    colorDark: BRAND.techGreyDark,
    title: "Tech Hub – Hardware & Software",
    points: [
      { label: "System Maintenance", text: "Software installations, cleaning, virus removal, and performance optimisation." },
      { label: "Data Backup", text: "Back up your important data before requesting service — ApexbytesHub is not responsible for data loss." },
      { label: "Access & Consent", text: "Devices must be available at the agreed time, charged and accessible. Remote sessions only proceed with your consent." },
      { label: "Turnaround", text: "Most services same-day. Virus/Malware Removal and OS Updates may take several hours. Windows Install & PC Setup: same-day to next-day. Troubleshooting: same-day, hours vary." },
    ],
  },
  {
    icon: "CurrencyDollar",
    colorLight: BRAND.dark100,
    colorDark: "#D4D4D8",
    title: "Payment Terms",
    points: [
      { label: "Standard Services", text: "Payable on execution. Clear, upfront pricing with no hidden fees." },
      { label: "Custom & Complex Work", text: "50% deposit to confirm order, balance on completion." },
      { label: "Walk-ins", text: "Cash preferred. Card and mobile money accepted." },
    ],
  },
  {
    icon: "Info",
    colorLight: BRAND.dark100,
    colorDark: "#D4D4D8",
    title: "General Terms",
    points: [
      { label: "Appointments", text: "Confirmed in advance; late arrival may mean rescheduling. Cancellations need 24-hour notice where possible." },
      { label: "Policy Changes", text: "ApexbytesHub may update services, pricing, or policy — clients will be notified." },
      { label: "Confidentiality", text: "Client data is kept confidential at all times and never shared without consent." },
      { label: "Disputes", text: "Handled respectfully; repeated non-compliance may result in service refusal." },
    ],
  },
]

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Printer: Printer,
  FileText: FileText,
  Palette: Palette,
  Globe: Globe,
  Cpu: Cpu,
  CurrencyDollar: CurrencyDollar,
  Info: Info,
}

// ─── Terms modal ─────────────────────────────────────────────────────────────
function TermsGateModal({ open, onAgree }: { open: boolean; onAgree: () => void }) {
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

// ─── FAQ pill accordion ───────────────────────────────────────────────────────
function FaqAccordion({
  isOpen,
  onToggle,
  openIndex,
  onToggleIndex,
}: {
  isOpen: boolean
  onToggle: () => void
  openIndex: number | null
  onToggleIndex: (i: number) => void
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="faq-accordion-panel"
        className={cn(
          "inline-flex items-center gap-2 text-[0.75rem] font-black text-zinc-700 dark:text-zinc-200 hover:text-brand-blue transition-colors px-6 py-3 rounded-full border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900",
          "shadow-[0_8px_20px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)]",
          "dark:shadow-[0_8px_20px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.3)]"
        )}
      >
        Frequently Asked Questions
        <CaretDown
          className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id="faq-accordion-panel"
        className={cn(
          "grid w-full max-w-md transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden space-y-2">
          {FAQS.map((faq, i) => {
            const open = openIndex === i
            return (
              <div
                key={i}
                className={cn(
                  "rounded-[14px] border transition-all duration-200",
                  open
                    ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60"
                    : "border-transparent bg-white dark:bg-zinc-900/20 hover:border-zinc-100 dark:hover:border-zinc-800"
                )}
              >
                <button
                  onClick={() => onToggleIndex(i)}
                  aria-expanded={open}
                  aria-controls={`faq-inner-${i}`}
                  className="flex items-center justify-between w-full text-left gap-4 px-5 py-4"
                >
                  <h4 className="text-[0.85rem] font-black text-zinc-800 dark:text-zinc-100 leading-snug">
                    {faq.question}
                  </h4>
                  <CaretDown
                    className={cn(
                      "w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200",
                      open && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-inner-${i}`}
                  role="region"
                  aria-label={faq.question}
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-1 text-[0.8rem] text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Footer content ───────────────────────────────────────────────────────────
function FooterContent() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
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
