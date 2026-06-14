"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, WhatsappLogo, Printer, FileText, PaintBrush, Globe, Desktop, CaretDown, PaperPlaneTilt, Info } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BIZ, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

/* ── Service descriptions ── */
const SVC_DESC: Record<string, string> = {
  "Black & White":               "Standard B&W printing on A4 paper. Ideal for documents, school work, and official letters.",
  "Colour":                      "Vibrant full-colour printing on A4. Perfect for flyers, forms, and colourful documents.",
  "4x6 Glossy":                  "High-quality glossy photo prints at 4x6 size. Great for framing, albums, or keepsakes.",
  "A4 Glossy":                   "Large-format glossy A4 photo prints. Sharp, vivid, and ready to display or gift.",
  "CV from Scratch":             "Complete CV built from scratch — professionally structured, formatted, and print-ready.",
  "CV Upgrade/Fix":              "We tidy, restructure, and modernise your existing CV for a polished, professional look.",
  "Cover Letter":                "A targeted cover letter that complements your CV for specific job applications.",
  "Affidavit / Letter":          "Official letters and affidavits typed, formatted, and printed correctly.",
  "Scan to Digital":             "Documents scanned at high resolution and sent directly to your phone or email.",
  "A5":                          "A5 document or card laminated for durability and a professional finish.",
  "A4":                          "A4 document laminated — keeps your important papers protected and long-lasting.",
  "A3":                          "Large A3 lamination for certificates, posters, and oversized documents.",
  "Basic Logo":                  "Clean, simple logo design — 1 concept, 2 revisions, all standard file formats included.",
  "Standard Logo":               "Professional logo with 2 concepts, refined typography, and full brand file package.",
  "Premium Logo":                "Full brand-ready logo — multiple concepts, colour variants, all file formats included.",
  "Single Side":                 "Business card designed for single-side print — clean, professional layout.",
  "Double Side":                 "Full double-sided business card design with front and back layouts.",
  "Simple":                      "Clean A5 or A4 flyer — bold headline, clear CTA, ready for print or WhatsApp sharing.",
  "Custom":                      "Custom flyer or poster designed around your brand, event, or product message.",
  "Complex":                     "Multi-element complex design with full custom layout, icons, and supporting imagery.",
  "Post":                        "Single social media post designed for Instagram, Facebook, or WhatsApp Status.",
  "Post + Story":                "Coordinated post and story pair for maximum social media visibility.",
  "Image/Static":                "Static digital invitation for events, birthdays, or special occasions.",
  "Video":                       "Animated video invitation — ideal for sharing via WhatsApp or social media.",
  "While Busy":                  "Minor revision during active design work — quick adjustments while in progress.",
  "After Completion":            "Revision requested after the final design has already been delivered to you.",
  "Status Check":                "Quick SASSA status check to confirm your grant application or payment status.",
  "Payment/Balance Check":       "Verify your SASSA payment amount or confirm your last balance received.",
  "Update Details":              "Update your SASSA personal details — ID number, phone number, or address.",
  "Reapplication":               "Complete SASSA reapplication for declined or expired grant applications.",
  "SRD Application":             "Full SASSA SRD grant application completed and submitted correctly on your behalf.",
  "Appeal":                      "SASSA appeal submission for declined or discontinued grant decisions.",
  "Banking Update":              "Update your SASSA banking details to receive direct grant payments.",
  "Grant Application":           "Full SASSA grant application — disability, child support, or old age grant.",
  "Enquiry / Statement":         "SARS account enquiry or tax income and payment statement request.",
  "New Taxpayer / eFiling":      "SARS eFiling registration for first-time taxpayers needing an account.",
  "Tax Pin / Penalty":           "Retrieve your SARS tax PIN or query an outstanding penalty on your account.",
  "Tax Clearance":               "Apply for a SARS tax clearance certificate for tender or compliance purposes.",
  "Tax Return / VAT / PAYE":     "Full SARS tax return submission — individual, VAT, or PAYE returns handled.",
  "Pin Submission":              "Submit your SARS tax PIN for compliance or verification requirements.",
  "PSIRA Status Check":          "Verify your current PSIRA security registration status online.",
  "Update / Certificate":        "Update PSIRA registration details or request a replacement certificate.",
  "Lost Certificate":            "Apply for a replacement PSIRA registration certificate if yours is lost.",
  "Renewal / New Registration":  "Renew your existing PSIRA registration or apply for a fresh registration.",
  "ID Application":              "Apply for a PSIRA security industry identification card.",
  "NSFAS Status Check":          "Check the current status of your NSFAS bursary application or funding.",
  "NSFAS Banking Update":        "Update your NSFAS banking details for correct bursary disbursements.",
  "Learnership Application":     "Apply for a government or private sector learnership programme online.",
  "Job / DPSA Application":      "Apply for government vacancies or DPSA positions through the correct portal.",
  "Bursary Application":         "Apply for a bursary through official government or corporate portals.",
  "NSFAS Appeal":                "Submit a formal appeal for a declined NSFAS bursary application.",
  "NSFAS Application":           "Full NSFAS bursary application submitted correctly and completely on your behalf.",
  "University Application":      "Apply to a South African university through the official application portal.",
  "Setup / Send / Receive":      "Email account setup — compose, send, and receive official documents from your account.",
  "Good Standing Letter":        "Request a good standing letter from a relevant authority or institution.",
  "Google Business Setup":       "Set up your Google Business Profile to appear in Google Maps and Search results.",
  "UIF Monthly Declaration":     "Submit your monthly UIF unemployment declaration on the government portal.",
  "CSD Update":                  "Update your Central Supplier Database registration details.",
  "UIF Registration":            "Register as an employee or employer for UIF contributions.",
  "UIF Claims":                  "Submit a UIF claim for unemployment, maternity, or illness benefits.",
  "CSD Registration":            "Full Central Supplier Database registration for businesses and sole traders.",
  "Social Media Setup":          "Set up professional business profiles on Facebook, Instagram, or TikTok.",
  "Learner's Licence Booking":   "Book your learner's licence test appointment through the online portal.",
  "WhatsApp Business Setup":     "Set up a professional WhatsApp Business profile for your business.",
  "Software Install":            "Installation of your requested software on your PC or laptop — quick and clean.",
  "Driver Installation":         "Install missing or updated hardware drivers for printers, graphics, and more.",
  "App / Office Updates":        "Update installed apps or Microsoft Office to the latest available version.",
  "Printer Setup":               "Set up and configure your printer for seamless use with your PC or laptop.",
  "PC Setup":                    "Full PC or laptop initial setup — configured and ready to use out of the box.",
  "Troubleshooting":             "Diagnose and resolve general PC problems, software errors, or system issues.",
  "PC Cleanup":                  "Remove junk files, clear caches, and optimise your system for better performance.",
  "Virus / Malware Removal":     "Identify and remove viruses, malware, and unwanted programs from your device.",
  "OS Update":                   "Update your Windows operating system to the latest stable version.",
  "Windows Install (No Activation)": "Fresh Windows installation without a product key or activation.",
  "Windows Install + Activation":    "Fresh Windows install with full genuine product activation included.",
  "Activation Only":             "Activate your existing Windows installation with a genuine product key.",
  "Microsoft 365 Setup":        "Install and configure Microsoft 365 — Word, Excel, Outlook — on your device.",
}

function buildWaMsg(svcName: string, price: string, hubId: HubId, hubTitle: string): string {
  const msgs: Record<HubId, string> = {
    print:    `Hi ${BIZ.name}! I need "${svcName}" (${price}). I'll be coming in — are you available today?`,
    doc:      `Hi ${BIZ.name}! I need "${svcName}" (${price}). What documents should I bring with me?`,
    design:   `Hi ${BIZ.name}! I'd like to order "${svcName}" (${price}) for my brand. When can we get started?`,
    eservice: `Hi ${BIZ.name}! I need help with "${svcName}" (${price}) from your ${hubTitle}. What must I bring along?`,
    tech:     `Hi ${BIZ.name}! My device needs "${svcName}" (${price}). When can I bring it in for you to look at?`,
  }
  return msgs[hubId]
}

function HubIcon({ id, size = 28, color }: { id: HubId; size?: number; color?: string }) {
  const p = { size, weight: "fill" as const, color: color ?? "currentColor", "aria-hidden": true }
  switch (id) {
    case "print":    return <Printer    {...p} />
    case "doc":      return <FileText   {...p} />
    case "design":   return <PaintBrush {...p} />
    case "eservice": return <Globe      {...p} />
    case "tech":     return <Desktop    {...p} />
  }
}

function Accordion({ open, children }: { open: boolean; children: React.ReactNode }) {
  const inner = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(0)
  useEffect(() => {
    if (!inner.current) return
    const ro = new ResizeObserver(() => { if (inner.current) setH(inner.current.scrollHeight) })
    ro.observe(inner.current); setH(inner.current.scrollHeight)
    return () => ro.disconnect()
  }, [])
  return (
    <div style={{ height: open ? h : 0 }} className="overflow-hidden transition-[height] duration-300 ease-in-out">
      <div ref={inner}>{children}</div>
    </div>
  )
}

interface SelectedService { name: string; price: string; hubId: HubId; sectionTitle: string }

function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark   = resolvedTheme === "dark"
  const ref      = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!svc) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [svc, onClose])

  if (!svc) return null

  const colors  = HUB_COLORS[svc.hubId as HubKey]
  const hub     = HUBS[svc.hubId]
  const accent  = isDark ? colors.tagTextDark : colors.tagText
  const desc    = SVC_DESC[svc.name] ?? `Professional ${svc.name.toLowerCase()} service from our ${hub.title}.`
  const waText  = buildWaMsg(svc.name, svc.price, svc.hubId, hub.title)

  return (
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={ref} className="relative w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 animate-in zoom-in-95 duration-300 border border-zinc-100 dark:border-zinc-800">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[0.65rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>
                {svc.sectionTitle}
              </span>
              <h3 className="font-sans font-black text-2xl text-zinc-900 dark:text-zinc-50 leading-tight">{svc.name}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
              <X size={16} weight="bold" />
            </button>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-8 font-medium">{desc}</p>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
          </div>
          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-[18px] font-black text-sm text-white transition-all active:scale-95 hover:opacity-90 shadow-lg shadow-brand-whatsapp/20"
            style={{ backgroundColor: "#25D366" }}
          >
            <WhatsappLogo size={20} weight="fill" />
            Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

function HubModal({ hubId, onClose, onSelectService }: { hubId: HubId | null; onClose: () => void; onSelectService: (svc: SelectedService) => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0)
  
  if (!hubId) return null
  
  const hub    = HUBS[hubId]
  const colors = HUB_COLORS[hubId as HubKey]
  const accent = isDark ? colors.tagTextDark : colors.tagText

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 spin-in-1 duration-500 border border-zinc-100 dark:border-zinc-800">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center" style={{ backgroundColor: `${accent}05` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: accent }}>
              <HubIcon id={hubId} size={32} color="#fff" />
            </div>
            <div>
              <h2 className="font-sans font-black text-2xl text-zinc-900 dark:text-zinc-50">{hub.title}</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">{hub.sections.length} Service Categories</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shadow-sm hover:bg-zinc-50 transition-all">
            <X size={20} weight="bold" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          <p className="text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8">{hub.desc}</p>
          
          <div className="space-y-3">
            {hub.sections.map((section, sIdx) => {
              const isOpen = openSectionIdx === sIdx
              return (
                <div key={sIdx} className={cn("rounded-[20px] border transition-all duration-300", isOpen ? "bg-zinc-50 dark:bg-zinc-900/50" : "bg-white dark:bg-zinc-950")} style={{ borderColor: isOpen ? `${accent}30` : "transparent" }}>
                  <button onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)} className="w-full flex items-center justify-between p-5 text-left">
                    <span className={cn("font-black text-sm tracking-tight transition-colors", isOpen ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400")}>{section.title}</span>
                    <CaretDown size={16} className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "rotate-0")} style={{ color: isOpen ? accent : undefined }} />
                  </button>
                  <Accordion open={isOpen}>
                    <div className="px-5 pb-5 flex flex-wrap gap-2">
                      {section.items.map((item, iIdx) => (
                        <button
                          key={iIdx}
                          onClick={() => onSelectService({ name: item.name, price: item.price, hubId, sectionTitle: section.title })}
                          className="px-4 py-2.5 rounded-[12px] border text-[0.8rem] font-bold transition-all hover:-translate-y-0.5 active:scale-95"
                          style={{ borderColor: `${accent}20`, backgroundColor: `${accent}05`, color: accent }}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </Accordion>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row gap-3">
          <a href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] font-black text-sm text-white bg-brand-whatsapp shadow-lg shadow-brand-whatsapp/20 hover:opacity-90 transition-all">
            <WhatsappLogo size={20} weight="fill" /> WhatsApp General Enquiry
          </a>
          <button onClick={onClose} className="px-8 py-4 rounded-[18px] font-black text-sm border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-all">
            Back to Hubs
          </button>
        </div>
      </div>
    </div>
  )
}

export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [activeHub, setActiveHub] = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)

  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 px-4 md:px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="abh-page-title mb-4">Our Service Hubs</h1>
          <p className="abh-tagline max-w-2xl mx-auto">Explore our ecosystem. Tap a hub to view all available services and instant pricing.</p>
          <div className="abh-divider" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {HUB_ORDER.map(hubId => {
            const hub = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.tagTextDark : colors.tagText
            
            return (
              <button
                key={hubId}
                onClick={() => setActiveHub(hubId)}
                className="group relative flex flex-col items-center p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${accent}08 0%, transparent 70%)` }} />
                
                <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg" style={{ backgroundColor: `${accent}10`, color: accent }}>
                  <HubIcon id={hubId} size={40} />
                </div>
                
                <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-3 transition-colors group-hover:text-brand-blue">{hub.title}</h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 line-clamp-3">{hub.desc}</p>
                
                <div className="mt-auto flex flex-col items-center gap-4">
                  <div className="h-1.5 w-12 rounded-full transition-all duration-500 group-hover:w-24" style={{ backgroundColor: accent }} />
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">View {hub.sections.length} Categories</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <HubModal hubId={activeHub} onClose={() => setActiveHub(null)} onSelectService={setSelectedService} />
      <ServiceDetailModal svc={selectedService} onClose={() => setSelectedService(null)} />
    </section>
  )
}
