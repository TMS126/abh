"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, WhatsappLogo, Printer, FileText, PaintBrush, Globe, Desktop, CaretDown, PaperPlaneTilt } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BIZ, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { useInstanceGuard } from "@/hooks/use-instance-guard"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

/* ── Service descriptions (one per service name) ── */
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

/* ── Dynamic WA messages per hub ── */
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

/* ── Icons ── */
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

/* ── Measured accordion ── */
function MiniAccordion({ open, children }: { open: boolean; children: React.ReactNode }) {
  const inner = useRef<HTMLDivElement>(null)
  const [h, setH] = useState(0)
  useEffect(() => {
    if (!inner.current) return
    const ro = new ResizeObserver(() => { if (inner.current) setH(inner.current.scrollHeight) })
    ro.observe(inner.current); setH(inner.current.scrollHeight)
    return () => ro.disconnect()
  }, [])
  return (
    <div style={{ height: open ? h : 0 }} className="overflow-hidden transition-[height] duration-250 ease-in-out">
      <div ref={inner}>{children}</div>
    </div>
  )
}

/* ── Service modal — matches screenshot (dark card) ── */
interface SelectedService { name: string; price: string; hubId: HubId; sectionTitle: string }

function ServiceModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark   = resolvedTheme === "dark"
  const ref      = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { if (svc) closeRef.current?.focus() }, [svc])
  useEffect(() => {
    if (!svc) return
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
  }, [svc, onClose])
  useEffect(() => {
    document.body.style.overflow = svc ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [svc])

  if (!svc) return null

  const colors  = HUB_COLORS[svc.hubId as HubKey]
  const hub     = HUBS[svc.hubId]
  const accent  = isDark ? colors.tagTextDark : colors.tagText
  const desc    = SVC_DESC[svc.name] ?? `Professional ${svc.name.toLowerCase()} service from our ${hub.title}.`
  const waText  = buildWaMsg(svc.name, svc.price, svc.hubId, hub.title)

  return (
    <div role="dialog" aria-modal="true" aria-label={svc.name} className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden="true" />

      {/* Dark modal card — theme-aware */}
      <div ref={ref} className="relative w-full max-w-md rounded-[20px] overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 animate-in zoom-in-95 spin-in-1 duration-500">

        {/* ✕ */}
        <button
          ref={closeRef} onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <X size={13} weight="bold" color="white" aria-hidden="true" />
        </button>

        {/* Header */}
        <div className="px-8 pt-10 pb-2 pr-16">
          <div className="flex items-baseline gap-3 flex-wrap mb-4">
            <span className="font-black text-xl uppercase tracking-wider" style={{ color: accent }}>
              {svc.sectionTitle}
            </span>
            <span className="text-base font-bold text-zinc-400">— {svc.name}</span>
          </div>
          <div className="h-[3px] w-full rounded-full" style={{ backgroundColor: accent }} />
        </div>

        {/* Description */}
        <p className="px-8 pt-6 pb-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium">{desc}</p>

        {/* Price */}
        <div className="px-8 py-8 text-left">
          <span className="font-black text-5xl tracking-tighter" style={{ color: accent }}>{svc.price}</span>
        </div>

        {/* CTA */}
        <div className="px-6 pb-7">
          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 rounded-[14px] font-extrabold text-sm text-white transition-all active:scale-95 hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  )
}

/* ── Hub Card ── */
function HubCard({ hubId, onSelectService }: { hubId: HubId; onSelectService: (svc: SelectedService) => void }) {
  const hub    = HUBS[hubId]
  const colors = HUB_COLORS[hubId as HubKey]
  const { resolvedTheme } = useTheme()
  const isDark  = resolvedTheme === "dark"
  const accent  = isDark ? colors.tagTextDark : colors.tagText

  const [isFlipped,      setIsFlipped]      = useState(false)
  const [isHovered,      setIsHovered]      = useState(false)
  const [hasHover,       setHasHover]       = useState(true)
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(null)
  const { active, activate, deactivate } = useInstanceGuard()

  const instanceKey = `hub-${hubId}` as any

  useEffect(() => { setHasHover(window.matchMedia("(hover: hover)").matches) }, [])

  const handleFrontClick = useCallback(() => {
    if (isFlipped) return
    if (hasHover) {
      // Desktop hover: request instance slot
      if (active === instanceKey || active === null) {
        activate(instanceKey)
        setIsFlipped(true)
      }
    } else {
      // Mobile: single tap flips
      if (active === instanceKey || active === null) {
        activate(instanceKey)
        setIsFlipped(true)
      }
    }
  }, [isFlipped, hasHover, active, instanceKey, activate])

  const flipBack = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); setIsFlipped(false); deactivate(instanceKey)
  }, [instanceKey, deactivate])

  const isHighlighted = hasHover ? isHovered : isFlipped
  const hasAnyOpen    = openSectionIdx !== null

  return (
    <div className="relative w-full" style={{ perspective: "1100px", height: "500px" }}>
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out"
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ══ FRONT ══ */}
        <div
          className="absolute inset-0 rounded-[14px] p-7 flex flex-col gap-4 border bg-white dark:bg-zinc-900 transition-all duration-300 cursor-pointer"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderColor: isHighlighted ? accent : undefined, boxShadow: isHighlighted ? `0 8px 30px ${accent}20` : undefined }}
          onClick={handleFrontClick}
          role="button" tabIndex={0} aria-label={`${hub.title} — tap to see services`}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFrontClick() } }}
        >
          <div className="w-14 h-14 flex items-center justify-center transition-all duration-300"
            style={{ transform: isHighlighted ? "scale(1.15)" : "scale(1)" }}>
            <HubIcon id={hubId} size={isHighlighted ? 30 : 24} color={isHighlighted ? accent : (isDark ? "#a1a1aa" : "#71717a")} />
          </div>
          <h3 className="font-sans font-black leading-tight transition-all duration-300"
            style={{ color: isHighlighted ? accent : (isDark ? "#f4f4f5" : "#18181b"), fontSize: isHighlighted ? "1.55rem" : "1.05rem" }}>
            {hub.title}
          </h3>
          <div className="h-1 w-10 rounded-full shrink-0" style={{ backgroundColor: accent }} aria-hidden="true" />
          <p className="text-sm leading-relaxed transition-colors duration-300 line-clamp-4"
            style={{ color: isHighlighted ? accent : (isDark ? "#a1a1aa" : "#71717a") }}>
            {hub.desc}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-auto" aria-hidden="true">
            {hub.previews.map(p => (
              <span key={p} className="text-[0.62rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${accent}15`, color: accent }}>{p}</span>
            ))}
          </div>
        </div>

        {/* ══ BACK ══ */}
        <div
          className="absolute inset-0 rounded-[14px] overflow-hidden flex flex-col"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundColor: isDark ? "#0f172a" : "#ffffff", border: `1.5px solid ${accent}` }}
        >
          {/* Back header — click to flip back */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0 cursor-pointer select-none"
            style={{ backgroundColor: isDark ? "#27272a" : "#f4f4f5" }}
            onClick={flipBack}
            role="button" tabIndex={0} aria-label={`Flip back to ${hub.title}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") flipBack(e) }}
          >
            <div className="flex items-center gap-2.5">
              <HubIcon id={hubId} size={18} color="#fff" />
              <span className="font-extrabold text-sm text-white">{hub.title}</span>
            </div>
            <button onClick={flipBack} aria-label="Flip back"
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <X size={13} weight="bold" color="white" aria-hidden="true" />
            </button>
          </div>

          {/* Description */}
          <p className="px-5 pt-3 pb-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 shrink-0">{hub.desc}</p>

          {/* Accordion sections */}
          <div className="flex-1 overflow-y-auto px-3 pb-1">
            {hub.sections.map((section, sIdx) => {
              const isOpen   = openSectionIdx === sIdx
              const isDimmed = hasAnyOpen && !isOpen
              return (
                <div key={sIdx} className="mb-1 rounded-[10px] overflow-hidden transition-all duration-300"
                  style={{ filter: isDimmed ? "grayscale(100%)" : "none", opacity: isDimmed ? 0.28 : 1, transform: isDimmed ? "scale(0.98)" : "scale(1)" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenSectionIdx(isOpen ? null : sIdx) }}
                    aria-expanded={isOpen} aria-controls={`sec-${hubId}-${sIdx}`}
                    className="w-full flex items-center justify-between px-4 py-3 text-left rounded-[10px] transition-colors"
                    style={{ backgroundColor: isOpen ? `${accent}15` : "transparent", color: isOpen ? accent : (isDark ? "#a1a1aa" : "#52525b") }}
                  >
                    <span className="font-extrabold text-xs">{section.title}</span>
                    <CaretDown size={12} className={cn("transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
                  </button>
                  <div id={`sec-${hubId}-${sIdx}`} role="region" aria-label={section.title}>
                    <MiniAccordion open={isOpen}>
                      <div className="px-3 pt-1 pb-3">
                        <p className="text-[0.6rem] italic mb-2 px-1" style={{ color: isDark ? "#52525b" : "#a1a1aa" }}>
                          Tap a service to see details &amp; price
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {section.items.map((item, iIdx) => (
                            <button key={iIdx}
                              onClick={(e) => { e.stopPropagation(); onSelectService({ name: item.name, price: item.price, hubId, sectionTitle: section.title }) }}
                              className="text-[0.7rem] font-semibold px-2.5 py-1.5 rounded-[8px] border transition-all duration-150 active:scale-95"
                              style={{ borderColor: `${accent}45`, color: accent, backgroundColor: `${accent}10` }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${accent}22` }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${accent}10` }}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </MiniAccordion>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom CTAs */}
          <div className="px-4 pb-4 pt-2 flex flex-col gap-2 shrink-0 border-t" style={{ borderColor: `${accent}20` }}>
            <a
              href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I'm interested in your ${hub.title}. Can you tell me more?`)}`}
              target="_blank" rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 py-3 rounded-[14px] font-extrabold text-xs text-white transition-all active:scale-95 hover:opacity-90"
              style={{ backgroundColor: "#25D366" }}
            >
              <WhatsappLogo size={15} weight="fill" aria-hidden="true" /> WhatsApp Us
            </a>
            <a
              href={`mailto:${BIZ.email}?subject=Enquiry: ${encodeURIComponent(hub.title)}&body=Hi ${BIZ.name}, I'd like to enquire about your ${hub.title}.`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 py-2.5 rounded-[14px] font-extrabold text-xs border transition-all active:scale-95"
              style={{ borderColor: `${accent}40`, color: accent }}
            >
              <PaperPlaneTilt size={13} weight="fill" aria-hidden="true" /> Send Enquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ── */
export function ServicesPage() {
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
  const closeModal = useCallback(() => setSelectedService(null), [])

  return (
    <section id="main-content" aria-label="Our services"
      className="min-h-screen bg-background pt-[calc(var(--nav-h)+2.5rem)] pb-24 px-4 md:px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-14">
          <h1 className="abh-page-title mb-4">Our Services</h1>
          <p className="abh-tagline max-w-2xl mx-auto">
            Tap a hub to explore. Tap a service to see pricing and order via WhatsApp.
          </p>
          <div className="abh-divider" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {HUB_ORDER.map(hubId => (
            <div key={hubId} className="min-w-[260px]">
              <HubCard hubId={hubId} onSelectService={setSelectedService} />
            </div>
          ))}
        </div>
      </div>
      <ServiceModal svc={selectedService} onClose={closeModal} />
    </section>
  )
}
