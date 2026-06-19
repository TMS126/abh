"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { X, Printer, FileText, PaintBrush, Globe, Desktop, PaperPlaneTilt, ListChecks, Megaphone } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BIZ, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

const NOTICE = {
  text: "Add-on services will be available from ",
  date: "15 September 2026",
  textAfter: ". Minor price adjustments have also been made across some services. We appreciate your continued support and will keep you updated as we grow.",
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

interface SelectedService {
  name: string; price: string; hubId: HubId; sectionTitle: string
  requirements: string[]; desc?: string
}

// ─── Hub Modal ────────────────────────────────────────────────────────────────
function HubModal({
  hubId, onClose, onSelectService,
}: {
  hubId: HubId | null
  onClose: () => void
  onSelectService: (svc: SelectedService) => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0)

  useEffect(() => { setOpenSectionIdx(0) }, [hubId])

  if (!hubId) return null
  const hub       = HUBS[hubId]
  const colors    = HUB_COLORS[hubId as HubKey]
  const accent    = isDark ? colors.tagTextDark : colors.tagText
  const solidAccent = colors.tagText

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md overscroll-contain" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-zinc-800">

        {/* Header */}
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center" style={{ backgroundColor: `${accent}05` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[14px] flex items-center justify-center shadow-lg bg-zinc-100 dark:bg-zinc-800" style={{ border: `2px solid ${accent}` }}>
              <HubIcon id={hubId} size={32} color={accent} />
            </div>
            <div>
              <h2 className="font-sans font-black text-2xl text-zinc-900 dark:text-zinc-50">{hub.title}</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">Available Services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8">
          {/* Category pills — tightly wrapped to their own size */}
          <div className="inline-flex flex-wrap gap-2 mb-5">
            {hub.sections.map((section, sIdx) => {
              const isOpen = openSectionIdx === sIdx
              return (
                <button
                  key={sIdx}
                  onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                  title={section.title}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-tight whitespace-nowrap transition-all duration-200",
                    isOpen
                      ? "text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  )}
                  style={isOpen ? { backgroundColor: solidAccent } : {}}
                >
                  {section.title}
                </button>
              )
            })}
          </div>

          {/* Expanded category */}
          {openSectionIdx !== null && hub.sections[openSectionIdx] && (
            <div
              key={openSectionIdx}
              className="rounded-[14px] bg-zinc-50 dark:bg-zinc-900/50 shadow-md p-4 grid grid-cols-1 gap-2 animate-in fade-in zoom-in-95 duration-300"
            >
              {hub.sections[openSectionIdx].items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  onClick={() => onSelectService({
                    name: item.name, price: item.price, hubId,
                    sectionTitle: hub.sections[openSectionIdx!].title,
                    requirements: item.requirements, desc: item.description,
                  })}
                  className="flex items-center justify-between p-4 rounded-[14px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-brand-blue transition-all group"
                >
                  <span className="text-[0.84rem] font-black text-zinc-800 dark:text-zinc-200">{item.name}</span>
                  <span className="text-[0.84rem] font-black" style={{ color: accent }}>{item.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SUFFIX_SECTIONS: Record<string, string> = {
  "Printing": "Printing", "Copying": "Copying", "Photo Printing": "Photo Printing",
  "Typing + Printing": "Typing and Printing", "Laminating": "Laminating",
  "Business Cards": "Business Cards", "Flyers & Posters": "Flyers and Posters",
  "Invitations": "Invitations", "Revisions": "Revisions",
}
const PREFIX_SECTIONS: Record<string, string> = {
  "SASSA": "SASSA", "SARS": "SARS", "PSIRA": "PSIRA",
  "Social Media": "Social Media", "Email Services": "Email",
}

function cleanText(s: string) {
  return s.replace(/\s*\/\s*/g, " or ").replace(/\s*\+\s*/g, " and ").replace(/\s*&\s*/g, " and ")
}

function naturalServiceLabel(name: string, sectionTitle: string) {
  const cleanName = cleanText(name)
  if (SUFFIX_SECTIONS[sectionTitle]) return `${cleanName} ${SUFFIX_SECTIONS[sectionTitle]}`
  if (PREFIX_SECTIONS[sectionTitle]) {
    const keyword = PREFIX_SECTIONS[sectionTitle]
    if (cleanName.toLowerCase().startsWith(keyword.toLowerCase())) return cleanName
    return `${keyword} ${cleanName}`
  }
  return cleanName
}

// ─── Service Detail Modal ─────────────────────────────────────────────────────
type Tab = "bring" | "about"

function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [tab, setTab] = useState<Tab>("bring")

  useEffect(() => { setTab("bring") }, [svc?.name])

  if (!svc) return null

  const colors       = HUB_COLORS[svc.hubId as HubKey]
  const accent       = isDark ? colors.tagTextDark : colors.tagText
  const hubTitle     = HUBS[svc.hubId]?.title || svc.sectionTitle
  const naturalLabel = naturalServiceLabel(svc.name, svc.sectionTitle)
  const waMessage    = `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). The price shown is ${svc.price}. Can you assist?`

  const requirements = svc.requirements?.length
    ? svc.requirements
    : ["Just bring your file, document or USB — we'll take care of the rest."]

  const desc = svc.desc?.trim()
    ? svc.desc
    : `${naturalLabel} is one of our ${hubTitle} services. We handle everything professionally so you don't have to worry about a thing.`

  return (
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm overscroll-contain" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[14px] overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 animate-in zoom-in-95 duration-300 border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col">

        {/* Header */}
        <div className="p-6 pb-0 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span
                className="text-[0.62rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2.5 inline-block"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                {cleanText(svc.sectionTitle)}
              </span>
              <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 leading-tight">{svc.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 flex-shrink-0 ml-3"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-4xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
          </div>

          {/* Tabs — pills sized to content, no icon on "What to Bring" */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("bring")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-wider transition-all duration-200",
                tab === "bring"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              What to Bring
            </button>
            <button
              onClick={() => setTab("about")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-wider transition-all duration-200",
                tab === "about"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              What Is This
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0">
          {tab === "bring" && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-200">
              <ol className="space-y-3">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-black mt-0.5",
                        isDark ? "text-zinc-900" : "text-white"
                      )}
                      style={{ backgroundColor: accent }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug pt-0.5">{req}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-5 leading-relaxed">
                Not sure? Don't worry — just WhatsApp us first and we'll guide you through it step by step.
              </p>
            </div>
          )}

          {tab === "about" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-200">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">{desc}</p>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-5 leading-relaxed">
                Have questions? Switch to the <span className="font-black" style={{ color: accent }}>What to Bring</span> tab or chat with us directly.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800">
          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-4 rounded-[14px] font-black text-sm leading-snug text-white text-center transition-all active:scale-95 shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#25D366" }}
          >
            Request {naturalLabel}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Notice Banner ────────────────────────────────────────────────────────────
function NoticeBanner() {
  return (
    <div className="relative mb-10 rounded-[14px] border border-[#1E6FA8]/20 bg-[#EBF5FB] dark:bg-[#1E3A52]/40 dark:border-[#1E6FA8]/30 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-9 h-9 rounded-[10px] bg-[#1E6FA8] flex items-center justify-center flex-shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Icon only — no emoji */}
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#0F3F66] dark:text-[#A9D6F2] block mb-1">
          Notice to Clients
        </span>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
          {NOTICE.text}<span className="font-black">{NOTICE.date}</span>{NOTICE.textAfter}
        </p>
      </div>
    </div>
  )
}

// ─── Services Page ────────────────────────────────────────────────────────────
export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const searchParams = useSearchParams()
  const [activeHub,       setActiveHub]       = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)

  useEffect(() => {
    const hubParam = searchParams.get("hub")
    if (hubParam && HUB_ORDER.includes(hubParam as HubId)) setActiveHub(hubParam as HubId)
  }, [searchParams])

  useEffect(() => {
    const isOpen = !!(activeHub || selectedService)
    if (!isOpen) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"; style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""; style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [activeHub, selectedService])

  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 px-4 md:px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="abh-page-title mb-4">Our Service Hubs</h1>
          <p className="abh-tagline max-w-2xl mx-auto">
            Explore our ecosystem. Tap a hub to view all available services and instant pricing.
          </p>
          <div className="abh-divider" />
        </div>

        <NoticeBanner />

        <div className="flex flex-col md:flex-row gap-6 pb-8 overflow-x-auto md:overflow-visible no-scrollbar">
          {HUB_ORDER.map((hubId) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.tagTextDark : colors.tagText
            return (
              <button
                key={hubId}
                onClick={() => setActiveHub(hubId)}
                className="group relative flex flex-col items-center p-8 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center min-w-full md:min-w-0 md:flex-1"
              >
                <div
                  className="w-20 h-20 rounded-[14px] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg"
                  style={{ backgroundColor: `${accent}10`, color: accent }}
                >
                  <HubIcon id={hubId} size={40} />
                </div>
                <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-3 group-hover:text-brand-blue">
                  {hub.title}
                </h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">{hub.tagline}</p>
                <div className="mt-8 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black lowercase tracking-widest leading-none" style={{ color: accent }}>
                    <span>explore</span>
                    <PaperPlaneTilt size={14} weight="fill" className="relative top-[0.5px]" />
                  </div>
                  <div className="h-px w-8 rounded-full" style={{ backgroundColor: `${accent}35` }} />
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
 
