"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import {
  WhatsappLogo, EnvelopeSimple,
  X, Printer, FileText, Palette,
  Globe, Cpu, Info, Heart,
  Question, CaretDown, CurrencyDollar,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, WA, FOOTER_NAV, FAQS } from "@/lib/brand"
import { BusinessStatusFull } from "@/components/business-status"

const TERMS_SECTIONS = [
  { icon: "Printer",  title: "Print Hub – Everything Paper",     points: [{ label: "Printing Services", text: "B&W, Colour, and Bulk printing. For bulk discounts, submit your entire order together." }, { label: "Paper Types", text: "A3, A4, A5, A6 paper in various gsm. Add lamination, spiral binding, or stapling." }, { label: "Turnaround", text: "Same-day printing on most jobs under 100 pages." }] },
  { icon: "FileText", title: "Document Hub – All Document Work", points: [{ label: "Document Assistance", text: "Full CV creation, typing, editing, and formatting. You are responsible for accuracy of all content." }, { label: "Official Papers", text: "Affidavits, letters, and application documents typed to standard." }, { label: "Turnaround", text: "Most CVs completed same-day. Complex documents 24 hours." }] },
  { icon: "Palette",  title: "Design Hub – Creative Work",       points: [{ label: "Branding Design", text: "Logos and business cards built in Adobe Illustrator. No generic templates." }, { label: "Marketing Designs", text: "Flyers, posters, banners, and social media templates custom-created." }, { label: "Turnaround", text: "Simple designs 24–48 hours. Complex work by quote." }] },
  { icon: "Globe",    title: "E-Service Hub – External Systems", points: [{ label: "Government Services", text: `Admin help across SARS, SASSA, CSD, PSIRA, UIF, etc. ${BIZ.name} is not responsible for government processing delays.` }, { label: "Disclaimer", text: "We guide and submit on your behalf, but all personal information and consent is your responsibility." }, { label: "Turnaround", text: "Applications submitted same-day. Approval depends on government processing." }] },
  { icon: "Cpu",      title: "Tech Hub – Hardware & Software",   points: [{ label: "System Maintenance", text: "Software installations, cleaning, and performance optimisation." }, { label: "Component Repairs", text: "GPU, motherboard, and power supply diagnostics and repairs." }, { label: "Turnaround", text: "Hardware diagnostics same-day. Repairs vary by component." }] },
  { icon: "CurrencyDollar", title: "Payment Terms",              points: [{ label: "Standard Services", text: "Payable on execution. Clear, upfront pricing with no hidden fees." }, { label: "Custom & Complex Work", text: "50% deposit to confirm order, balance on completion." }, { label: "Walk-ins", text: "Cash preferred. Card and mobile money accepted." }] },
]

const ICON_MAP: Record<string, React.ReactNode> = {
  Printer:        <Printer        weight="fill" className="w-4 h-4" aria-hidden="true" />,
  FileText:       <FileText       weight="fill" className="w-4 h-4" aria-hidden="true" />,
  Palette:        <Palette        weight="fill" className="w-4 h-4" aria-hidden="true" />,
  Globe:          <Globe          weight="fill" className="w-4 h-4" aria-hidden="true" />,
  Cpu:            <Cpu            weight="fill" className="w-4 h-4" aria-hidden="true" />,
  CurrencyDollar: <CurrencyDollar weight="fill" className="w-4 h-4" aria-hidden="true" />,
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { if (open) closeRef.current?.focus() }, [open])

  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return }
      if (e.key !== "Tab" || !ref.current) return
      const els   = ref.current.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')
      const first = els[0]; const last = els[els.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [open, onClose])

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
    window.history.pushState({ modal: title }, "")
    const onPop = () => {
      onClose()
      window.history.pushState({ modal: null }, "")
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [open, onClose, title])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="absolute inset-0 overscroll-contain" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
      >
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <div>
            <h2 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50">{title}</h2>
            {subtitle && (
              <p className="text-[0.62rem] font-black uppercase tracking-widest text-zinc-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all active:scale-95"
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Footer content ───────────────────────────────────────────────────────────
function FooterContent() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted,       setMounted]       = useState(false)
  const [isTermsOpen,   setIsTermsOpen]   = useState(false)
  const [isFaqOpen,     setIsFaqOpen]     = useState(false)
  const [openFaqIndex,  setOpenFaqIndex]  = useState<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="pt-16 pb-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-16 px-6 md:px-8">

        {/* Brand — logo + name reduced, tagline unchanged */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 select-none">
            {/* Logo: reduced from w-9 h-9 to w-6 h-6 */}
            <div
              className="relative w-6 h-6 overflow-hidden rounded-[10px] shrink-0"
              aria-hidden="true"
              style={mounted && theme === "dark" ? { filter: "brightness(0) invert(1)" } : undefined}
            >
              <Image src="/logo.png" alt="" fill className="object-contain" />
            </div>
            {/* Name: reduced from text-2xl to text-base */}
            <h2 className="font-sans font-black text-base tracking-tight text-zinc-900 dark:text-white">
              ApexbytesHub
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xs">
            Your local tech and print partner in Kgotsong. {BIZ.hubCount} hubs, {BIZ.serviceCount} services — all in one friendly place.
          </p>
        </div>

        {/* Quick links — unchanged */}
        <nav aria-label="Footer navigation">
          <h3 className="text-[0.7rem] font-black uppercase tracking-widest mb-8 text-zinc-400">Quick Links</h3>
          <ul className="flex flex-col gap-4">
            {FOOTER_NAV.map((page) => (
              <li key={page.label}>
                <button
                  onClick={() => { router.push(page.path); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                  className="text-sm text-zinc-600 dark:text-zinc-300 hover:translate-x-1 hover:text-brand-blue transition-all duration-200 text-left font-medium"
                >
                  {page.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Connect */}
        <div>
          <h3 className="text-[0.7rem] font-black uppercase tracking-widest mb-8 text-zinc-400">Connect</h3>
          <ul className="flex flex-col gap-5">
            <li>
              <a
                href={WA.general}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300 hover:text-brand-whatsapp transition-colors"
              >
                <div className="w-10 h-10 rounded-[14px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm" aria-hidden="true">
                  <WhatsappLogo weight="fill" className="w-5 h-5" />
                </div>
                {BIZ.phone}
              </a>
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
            {/* Help Center — reduced to match legal bar size */}
            <li className="pt-2">
              <button
                onClick={() => setIsFaqOpen(true)}
                className="flex items-center gap-3 text-[0.65rem] font-medium text-zinc-400 hover:text-brand-blue transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-[10px] flex items-center justify-center border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0"
                  aria-hidden="true"
                >
                  <Question weight="bold" className="w-3.5 h-3.5" />
                </div>
                Help Center (FAQ)
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Legal bar — all text at [0.65rem], same as "built with ❤️" ── */}
      <div className="max-w-[1200px] mx-auto border-t border-zinc-100 dark:border-zinc-800 pt-8 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          {/* © line — same size as "built with ❤️" */}
          <p className="text-[0.65rem] font-medium text-zinc-400">
            © {new Date().getFullYear()} {BIZ.name}. All rights reserved.
          </p>
          <span className="hidden md:inline text-zinc-200 dark:text-zinc-800 text-[0.65rem]" aria-hidden="true">·</span>
          {/* Terms — same size as "built with ❤️" */}
          <button
            onClick={() => setIsTermsOpen(true)}
            className="text-[0.65rem] font-medium text-zinc-400 hover:text-brand-blue transition-colors"
          >
            Terms &amp; Policies
          </button>
        </div>
        {/* "Built with ❤️" — reference size, unchanged */}
        <p className="text-[0.65rem] font-medium text-zinc-400 flex items-center gap-1.5">
          Built with <Heart weight="fill" className="w-3 h-3 text-brand-orange" aria-hidden="true" /> for the Kgotsong community
        </p>
      </div>

      {/* ── Terms modal — unchanged ── */}
      <Modal
        open={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        title="Terms & Service Policies"
        subtitle={`${BIZ.name} · Studio Rules`}
      >
        <div className="px-8 py-8 space-y-8">
          <div className="p-5 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <h3 className="font-bold flex items-center gap-2 mb-2 text-[0.82rem] text-zinc-900 dark:text-zinc-50">
              <Info weight="fill" className="w-4 h-4" aria-hidden="true" /> Operational Rule
            </h3>
            <p className="text-[0.82rem] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              By starting any order or sending a message through our WhatsApp channels, you confirm full agreement with all operational rules and terms below.
            </p>
          </div>
          {TERMS_SECTIONS.map((s, i) => (
            <div key={i} className="space-y-3">
              <h3 className="font-black flex items-center gap-2 text-[0.82rem] text-brand-blue">
                {ICON_MAP[s.icon]} {s.title}
              </h3>
              <ul className="space-y-2 list-disc list-inside pl-1">
                {s.points.map((p, j) => (
                  <li key={j} className="text-[0.82rem] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-700 dark:text-zinc-300">{p.label}:</strong> {p.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>

      {/* ── FAQ modal — unchanged ── */}
      <Modal
        open={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        title="Help Center"
        subtitle="Common Questions"
      >
        <div className="px-6 py-8 space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openFaqIndex === i
            return (
              <div
                key={i}
                className={cn(
                  "rounded-[14px] border transition-all duration-200",
                  isOpen
                    ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60"
                    : "border-transparent bg-white dark:bg-zinc-900/20 hover:border-zinc-100 dark:hover:border-zinc-800"
                )}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  className="flex items-center justify-between w-full text-left gap-4 px-5 py-4"
                >
                  <h4 className="text-[0.82rem] font-black text-zinc-800 dark:text-zinc-100 leading-snug">
                    {faq.question}
                  </h4>
                  <CaretDown
                    className={cn(
                      "w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-${i}`}
                  role="region"
                  aria-label={faq.question}
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
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
          <div className="pt-4 pb-2 text-center">
            <p className="text-[0.72rem] font-medium text-zinc-400 dark:text-zinc-600">
              Still need help?{" "}
              <a
                href={WA.general}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-brand-blue hover:underline"
              >
                WhatsApp us directly
              </a>
            </p>
          </div>
        </div>
      </Modal>
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
