"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  WhatsappLogo, EnvelopeSimple,
  X, Printer, FileText, Palette,
  Globe, Cpu, Info, Heart,
  Question, CaretDown, CurrencyDollar,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, WA, FOOTER_NAV, FAQS } from "@/lib/brand"
import { ProfileDrawer } from "@/components/profile-drawer"
import { useInstance } from "@/hooks/use-instance-guard"
import { BusinessStatusFull } from "@/components/business-status"

const TERMS_SECTIONS = [
  { icon: "Printer",  title: "Print Hub – Everything Paper",     points: [{ label: "Printing Services", text: "B&W, Colour, and Bulk printing. For bulk discounts, submit your entire order together." }, { label: "Copying Services", text: "Fast, clear photocopying. Check pages before leaving." }, { label: "Photo Printing", text: "Glossy 4x6 and A4. Send high-resolution files via WhatsApp to avoid blurry prints." }] },
  { icon: "FileText", title: "Document Hub – All Document Work", points: [{ label: "Document Assistance", text: "Full CV creation, typing, editing, and formatting. You are responsible for accuracy of provided info." }, { label: "Scanning Services", text: "Papers converted to digital files sent to your device." }, { label: "Laminating Services", text: "A5, A4, and A3 hot laminating. Records held 30 days then deleted." }] },
  { icon: "Palette",  title: "Design Hub – Creative Work",       points: [{ label: "Branding Design", text: "Logos and business cards built in Adobe Illustrator. No generic templates." }, { label: "Marketing & Events", text: "Flyers, posters, social media, and invitations. Two revisions included." }] },
  { icon: "Globe",    title: "E-Service Hub – External Systems", points: [{ label: "Government Services", text: `Admin help across SARS, SASSA, CSD, PSIRA, UIF, etc. ${BIZ.name} is not responsible for external portal downtime.` }, { label: "Email Services", text: "Setup, compose, send, and receive official documents." }] },
  { icon: "Cpu",      title: "Tech Hub – Hardware & Software",   points: [{ label: "System Maintenance", text: "Software installations, cleaning, and performance optimisation." }, { label: "Component Upgrades", text: "RAM and SSD installation." }, { label: "Digital Support", text: "General tech troubleshooting and device setup." }] },
  { icon: "CurrencyDollar", title: "Payment Terms",               points: [{ label: "Standard Services", text: "Payable on execution. Clear, upfront pricing with no hidden fees." }, { label: "Custom & Bulk Orders", text: "Premium custom design work or high-volume print runs require confirmation and payment before production begins." }, { label: "Accepted Payment", text: "We accept cash and EFT." }] },
]
const ICON_MAP: Record<string, React.ReactNode> = {
  Printer:  <Printer  weight="fill" className="w-4 h-4" aria-hidden="true" />,
  FileText: <FileText weight="fill" className="w-4 h-4" aria-hidden="true" />,
  Palette:  <Palette  weight="fill" className="w-4 h-4" aria-hidden="true" />,
  Globe:    <Globe    weight="fill" className="w-4 h-4" aria-hidden="true" />,
  Cpu:      <Cpu      weight="fill" className="w-4 h-4" aria-hidden="true" />,
  CurrencyDollar: <CurrencyDollar weight="fill" className="w-4 h-4" aria-hidden="true" />,
}

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
      const els = ref.current.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')
      const first = els[0]; const last = els[els.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [open, onClose])
  useEffect(() => { document.documentElement.classList.toggle("scroll-locked", open); document.body.classList.toggle("scroll-locked", open); return () => { document.documentElement.classList.remove("scroll-locked"); document.body.classList.remove("scroll-locked") } }, [open])
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0 overscroll-contain" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <h2 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50">{title}</h2>
            {subtitle && <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 mt-1">{subtitle}</p>}
          </div>
          <button ref={closeRef} onClick={onClose} aria-label={`Close ${title}`} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-all">
            <X size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  )
}

function FooterContent({ onOpenProfile }: { onOpenProfile: () => void }) {
  const router = useRouter()
  const [isTermsOpen,  setIsTermsOpen]  = useState(false)
  const [isFaqOpen,    setIsFaqOpen]    = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <div className="pt-16 pb-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-16 px-6 md:px-8">
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 select-none">
            <div className="relative w-9 h-9 overflow-hidden rounded-[14px]" aria-hidden="true">
              <Image src="/logo.png" alt="" fill className="object-contain dark:invert" />
            </div>
            <h2 className="font-sans font-black text-2xl tracking-tighter">
              <span className="text-zinc-900 dark:text-white">Apexbytes</span>
              <span style={{ color: BRAND.orange }}>Hub</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xs">
            Your local tech and print partner in Kgotsong. {BIZ.hubCount} hubs, {BIZ.serviceCount} services — all in one friendly place.
          </p>
          <p className="text-[0.65rem] font-bold text-zinc-400 uppercase tracking-widest">
            Founded by{" "}
            <button
              onClick={onOpenProfile}
              className="underline underline-offset-2 decoration-dotted font-black text-brand-blue dark:text-brand-light-blue hover:text-brand-blue-dark transition-colors"
            >
              {BIZ.founder}
            </button>
          </p>
        </div>

        {/* Quick links */}
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
              <a href={WA.general} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300 hover:text-brand-whatsapp transition-colors">
                <div className="w-10 h-10 rounded-[14px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm" aria-hidden="true">
                  <WhatsappLogo weight="fill" className="w-5 h-5" />
                </div>
                {BIZ.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${BIZ.email}`}
                className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300 hover:text-brand-blue transition-colors">
                <div className="w-10 h-10 rounded-[14px] border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm" aria-hidden="true">
                  <EnvelopeSimple weight="fill" className="w-5 h-5" />
                </div>
                {BIZ.email}
              </a>
            </li>
            <li className="pt-2">
              <BusinessStatusFull />
            </li>
            <li className="pt-2">
              <button onClick={() => setIsFaqOpen(true)}
                className="flex items-center gap-4 text-sm font-black transition-colors"
                style={{ color: BRAND.orange }}>
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center border shadow-sm" style={{ borderColor: `${BRAND.orange}33`, backgroundColor: `${BRAND.orange}0D` }} aria-hidden="true">
                  <Question weight="bold" className="w-5 h-5" />
                </div>
                Help Center (FAQ)
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal bar */}
      <div className="max-w-[1200px] mx-auto border-t border-zinc-100 dark:border-zinc-800 pt-10 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
          <p className="text-[0.75rem] font-semibold text-zinc-400">© {new Date().getFullYear()} {BIZ.nameShort}. All rights reserved.</p>
          <div className="hidden md:block w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
          <button onClick={() => setIsTermsOpen(true)} className="text-[0.75rem] font-bold text-brand-blue hover:underline">
            Terms &amp; Policies
          </button>
        </div>
        <p className="text-[0.75rem] font-semibold text-zinc-400 flex items-center gap-2">
          Built with <Heart weight="fill" className="w-3.5 h-3.5 text-brand-orange" aria-hidden="true" /> for the Kgotsong community
        </p>
      </div>

      <Modal open={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Terms & Service Policies" subtitle={`${BIZ.name} • Studio Rules`}>
        <div className="p-8 space-y-8">
          <div className="p-6 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <h3 className="font-bold flex items-center gap-2 mb-3 text-sm text-brand-orange"><Info weight="fill" className="w-4 h-4" aria-hidden="true" /> Operational Rule</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">By starting any order or sending a message through our WhatsApp channels, you confirm full agreement with all operational rules and terms below.</p>
          </div>
          {TERMS_SECTIONS.map((s, i) => (
            <div key={i} className="space-y-4">
              <h3 className="font-black flex items-center gap-2 text-sm text-brand-blue">{ICON_MAP[s.icon]} {s.title}</h3>
              <ul className="space-y-2 list-disc list-inside pl-1">
                {s.points.map((p, j) => <li key={j} className="text-sm text-zinc-600 dark:text-zinc-400"><strong>{p.label}:</strong> {p.text}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={isFaqOpen} onClose={() => setIsFaqOpen(false)} title="Help Center" subtitle="Common Questions">
        <div className="p-6 space-y-3">
          {FAQS.map((faq, i) => {
            const open = openFaqIndex === i
            return (
              <div key={i} className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <button onClick={() => setOpenFaqIndex(open ? null : i)} aria-expanded={open} aria-controls={`faq-${i}`}
                  className="flex items-center justify-between w-full text-left gap-4">
                  <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-50 break-words">{faq.question}</h4>
                  <CaretDown className={cn("w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200", open && "rotate-180")} aria-hidden="true" />
                </button>
                <div id={`faq-${i}`} role="region" aria-label={faq.question}
                  className={cn(
                    "grid transition-all duration-500 ease-in-out",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed break-words whitespace-pre-wrap pb-2">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>

    </div>
  )
}

export function Footer() {
  const profile = useInstance("profile")

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
      <FooterContent onOpenProfile={() => profile.open()} />
      <ProfileDrawer open={profile.isActive} onClose={() => profile.close()} />
    </footer>
  )
}
 
 
 
