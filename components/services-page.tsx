"use client"

import { useState, useEffect, useRef } from "react"
import { X, WhatsappLogo, Printer, FileText, PaintBrush, Globe, Desktop, CaretDown, PaperPlaneTilt, ListChecks, Megaphone } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BIZ, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { PRICING } from "@/lib/data"


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

interface SelectedService { name: string; price: string; hubId: HubId; sectionTitle: string; requirements: string[] }

function HubModal({ hubId, onClose, onSelectService }: { hubId: HubId | null; onClose: () => void; onSelectService: (svc: SelectedService) => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0)
  
  if (!hubId) return null
  const hub = HUBS[hubId]; const colors = HUB_COLORS[hubId as HubKey]; const accent = isDark ? colors.tagTextDark : colors.tagText

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-zinc-800">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center" style={{ backgroundColor: `${accent}05` }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[14px] flex items-center justify-center shadow-lg" style={{ backgroundColor: accent }}>
              <HubIcon id={hubId} size={32} color="#fff" />
            </div>
            <div>
              <h2 className="font-sans font-black text-2xl text-zinc-900 dark:text-zinc-50">{hub.title}</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">Available Services</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
            <X size={20} weight="bold" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-3">
          {hub.sections.map((section, sIdx) => {
            const isOpen = openSectionIdx === sIdx
            return (
              <div key={sIdx} className={cn("rounded-[14px] border transition-all duration-300", isOpen ? "bg-zinc-50 dark:bg-zinc-900/50" : "bg-white dark:bg-zinc-950")} style={{ borderColor: isOpen ? `${accent}30` : "transparent" }}>
                <button onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className={cn("font-black text-sm tracking-tight", isOpen ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500")}>{section.title}</span>
                  <CaretDown size={16} className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "rotate-0")} style={{ color: isOpen ? accent : undefined }} />
                </button>
                <div className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0")}>
                  <div className="px-5 pb-5 grid grid-cols-1 gap-2">
                    {section.items.map((item, iIdx) => (
                      <button key={iIdx} onClick={() => onSelectService({ name: item.name, price: item.price, hubId, sectionTitle: section.title, requirements: item.requirements })} className="flex items-center justify-between p-4 rounded-[14px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-brand-blue transition-all group">
                        <span className="text-[0.84rem] font-black text-zinc-800 dark:text-zinc-200">{item.name}</span>
                        <span className="text-[0.84rem] font-black" style={{ color: accent }}>{item.price}</span>
                      </button>
                    ))}
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

function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  if (!svc) return null
  const colors = HUB_COLORS[svc.hubId as HubKey]; const accent = isDark ? colors.tagTextDark : colors.tagText

  return (
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[14px] overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 animate-in zoom-in-95 duration-300 border border-zinc-100 dark:border-zinc-800 max-h-[85vh] flex flex-col">
        <div className="p-8 pb-0 flex-shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[0.65rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>{svc.sectionTitle}</span>
              <h3 className="font-sans font-black text-2xl text-zinc-900 dark:text-zinc-50 leading-tight">{svc.name}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 flex-shrink-0"><X size={16} weight="bold" /></button>
          </div>
          <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span></div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 min-h-0">
          {svc.requirements && svc.requirements.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks size={18} weight="bold" style={{ color: accent }} />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">What to Bring</span>
              </div>
              <ol className="space-y-3">
                {svc.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-black mt-0.5", isDark ? "text-zinc-900" : "text-white")} style={{ backgroundColor: accent }}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug pt-0.5">{req}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="p-8 pt-2 flex-shrink-0">
          <a href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi! I'm interested in ${svc.name} (${svc.price})`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 rounded-[14px] font-black text-sm text-white transition-all active:scale-95 shadow-lg" style={{ backgroundColor: "#25D366" }}>
            <WhatsappLogo size={20} weight="fill" /> Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

function NoticeBanner() {
  return (
    <div className="relative mb-10 rounded-[14px] border border-[#1E6FA8]/20 bg-[#EBF5FB] dark:bg-[#1E3A52]/40 dark:border-[#1E6FA8]/30 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-9 h-9 rounded-[10px] bg-[#1E6FA8] flex items-center justify-center flex-shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#0F3F66] dark:text-[#A9D6F2] block mb-1">Notice to Clients</span>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
          {NOTICE.text}<span className="font-black">{NOTICE.date}</span>{NOTICE.textAfter}
        </p>
      </div>
    </div>
  )
}

export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [activeHub, setActiveHub] = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)

  useEffect(() => {
    document.body.style.overflow = (activeHub || selectedService) ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [activeHub, selectedService])

  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 px-4 md:px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="abh-page-title mb-4">Our Service Hubs</h1>
          <p className="abh-tagline max-w-2xl mx-auto">Explore our ecosystem. Tap a hub to view all available services and instant pricing.</p>
          <div className="abh-divider" />
        </div>

        <NoticeBanner />

        <div className="flex flex-col md:flex-row gap-6 pb-8 overflow-x-auto md:overflow-visible no-scrollbar">
          {HUB_ORDER.map(hubId => {
            const hub = HUBS[hubId]; const colors = HUB_COLORS[hubId as HubKey]; const accent = isDark ? colors.tagTextDark : colors.tagText
            return (
              <button key={hubId} onClick={() => setActiveHub(hubId)} className="group relative flex flex-col items-center p-8 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center min-w-full md:min-w-0 md:flex-1">
                <div className="w-20 h-20 rounded-[14px] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-lg" style={{ backgroundColor: `${accent}10`, color: accent }}><HubIcon id={hubId} size={40} /></div>
                <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-3 group-hover:text-brand-blue">{hub.title}</h3>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2">{hub.tagline}</p>
                <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest" style={{ color: accent }}>View Services <PaperPlaneTilt size={16} weight="bold" /></div>
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
 
 
 
