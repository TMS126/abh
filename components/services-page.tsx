"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import {
  X, Printer, FileText, PaintBrush, Globe, Desktop,
  PaperPlaneTilt, Megaphone, MagnifyingGlass,
} from "@phosphor-icons/react"
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

// ─── Back-button modal stack ──────────────────────────────────────────────────
// We maintain a simple history stack so the Android/iOS back gesture closes
// modals one at a time instead of navigating away from the page.
// Layer order: hub → service.  Pressing back always pops the topmost layer.
function useModalBackStack(
  activeHub: HubId | null, setActiveHub: (h: HubId | null) => void,
  selectedService: SelectedService | null, setSelectedService: (s: SelectedService | null) => void,
) {
  // Track what was previously pushed so we don't double-push
  const prevHub     = useRef<HubId | null>(null)
  const prevService = useRef<SelectedService | null>(null)

  // Push a history entry whenever a new modal opens
  useEffect(() => {
    if (activeHub && activeHub !== prevHub.current) {
      window.history.pushState({ abModal: "hub" }, "")
      prevHub.current = activeHub
    }
  }, [activeHub])

  useEffect(() => {
    if (selectedService && selectedService !== prevService.current) {
      window.history.pushState({ abModal: "service" }, "")
      prevService.current = selectedService
    }
  }, [selectedService])

  // popstate = back button / back gesture
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      // Innermost modal closes first
      if (selectedService) {
        setSelectedService(null)
        prevService.current = null
        // Keep hub entry alive in history so the next back closes the hub
        window.history.pushState({ abModal: "hub" }, "")
        return
      }
      if (activeHub) {
        setActiveHub(null)
        prevHub.current = null
        return
      }
      // Nothing open — let the browser navigate normally
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [activeHub, selectedService, setActiveHub, setSelectedService])
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
  const hub         = HUBS[hubId]
  const colors      = HUB_COLORS[hubId as HubKey]
  const accent      = isDark ? colors.tagTextDark : colors.tagText
  const solidAccent = colors.tagText

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md overscroll-contain" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-zinc-800">

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

        <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-8">
          <div className="inline-flex flex-wrap gap-2 mb-5">
            {hub.sections.map((section, sIdx) => {
              const isOpen = openSectionIdx === sIdx
              return (
                <button
                  key={sIdx}
                  onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-tight whitespace-nowrap transition-all duration-200",
                    isOpen ? "text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  )}
                  style={isOpen ? { backgroundColor: solidAccent } : {}}
                >
                  {section.title}
                </button>
              )
            })}
          </div>

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

          <div className="flex items-baseline gap-1 mb-5">
            <span className="text-4xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
          </div>

          <div className="flex gap-2">
            {(["bring", "about"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-wider transition-all duration-200",
                  tab === t
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                {t === "bring" ? "What to Bring" : "What Is This"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0">
          {tab === "bring" && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-200">
              <ol className="space-y-3">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className={cn("flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-black mt-0.5", isDark ? "text-zinc-900" : "text-white")}
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

// ─── Floating Pill Search ─────────────────────────────────────────────────────
interface SearchableService {
  hubId: HubId; sectionTitle: string; name: string
  price: string; description: string; requirements: string[]
}

function FloatingSearchPill({
  onSelect,
  visible,
}: {
  onSelect: (svc: SelectedService) => void
  visible: boolean
}) {
  const { resolvedTheme } = useTheme()
  const isDark    = resolvedTheme === "dark"
  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState("")
  const inputRef  = useRef<HTMLInputElement>(null)
  const pillRef   = useRef<HTMLDivElement>(null)

  // Hub accent colours for the animated ring
  const ringColors = ["#1E6FA8", "#3E6B0E", "#B86F34", "#1E6FA8", "#2C3E50"]

  const index = useMemo<SearchableService[]>(() => {
    const all: SearchableService[] = []
    HUB_ORDER.forEach((hubId) => {
      HUBS[hubId].sections.forEach((section) => {
        section.items.forEach((item) => {
          all.push({ hubId, sectionTitle: section.title, name: item.name, price: item.price, description: item.description, requirements: item.requirements })
        })
      })
    })
    return all
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)).slice(0, 8)
  }, [query, index])

  const openSearch = () => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery("")
  }, [])

  const pick = (s: SearchableService) => {
    onSelect({ name: s.name, price: s.price, hubId: s.hubId, sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description })
    closeSearch()
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) closeSearch()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, closeSearch])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [closeSearch])

  const showResults = open && query.trim().length > 0

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[950] transition-all duration-500",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"
      )}
      ref={pillRef}
    >
      {/* Animated glow ring — cheap CSS animation, no canvas */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-md transition-opacity duration-300"
        style={{
          background: `conic-gradient(${ringColors.join(", ")}, ${ringColors[0]})`,
          animation: open ? "spin 4s linear infinite" : "none",
          opacity: open ? 0.35 : 0,
        }}
      />

      <div
        className={cn(
          "relative flex items-center gap-2 transition-all duration-300 ease-out",
          "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl",
          "border border-white/60 dark:border-white/10",
          "shadow-[0_8px_32px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.4)]",
          open
            ? "rounded-[18px] px-4 py-2.5 w-[min(92vw,420px)]"
            : "rounded-full px-5 py-2.5 w-auto cursor-pointer hover:scale-105 active:scale-95"
        )}
        onClick={!open ? openSearch : undefined}
      >
        {/* Icon */}
        <MagnifyingGlass
          size={open ? 18 : 16}
          weight="bold"
          className={cn(
            "shrink-0 transition-colors duration-200",
            open ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
          )}
        />

        {/* Collapsed label */}
        {!open && (
          <span className="text-xs font-black text-zinc-600 dark:text-zinc-300 tracking-wide whitespace-nowrap">
            Search services
          </span>
        )}

        {/* Expanded input */}
        {open && (
          <>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. CV, laminating, SASSA..."
              className="flex-1 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none min-w-0"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 shrink-0"
              >
                <X size={11} weight="bold" />
              </button>
            )}
            <button
              onClick={closeSearch}
              className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 shrink-0 ml-0.5 transition-colors"
            >
              <X size={14} weight="bold" />
            </button>
          </>
        )}
      </div>

      {/* Dropdown results */}
      {showResults && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[min(92vw,420px)] bg-white dark:bg-zinc-950 rounded-[16px] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.map((s, idx) => {
                const colors = HUB_COLORS[s.hubId as HubKey]
                const accent = isDark ? colors.tagTextDark : colors.tagText
                return (
                  <button
                    key={`${s.hubId}-${s.name}-${idx}`}
                    onClick={() => pick(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
                      <HubIcon id={s.hubId} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">{s.sectionTitle} · {HUBS[s.hubId].title}</p>
                    </div>
                    <span className="text-xs font-black flex-shrink-0" style={{ color: accent }}>{s.price}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No services found</p>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word, or WhatsApp us and ask directly.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ─── Notice Banner ────────────────────────────────────────────────────────────
function NoticeBanner() {
  return (
    <div className="relative mb-10 rounded-[14px] border border-brand-orange/20 bg-brand-orange/5 dark:bg-brand-orange/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-9 h-9 rounded-[10px] bg-brand-orange flex items-center justify-center flex-shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-brand-orange block mb-1">
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
  const isDark       = resolvedTheme === "dark"
  const searchParams = useSearchParams()

  const [activeHub,       setActiveHub]       = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)

  // Floating pill appears after user scrolls past the inline search bar
  const inlineSearchRef  = useRef<HTMLDivElement>(null)
  const [pillVisible, setPillVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (!inlineSearchRef.current) return
      const rect = inlineSearchRef.current.getBoundingClientRect()
      // Show pill once the inline search has scrolled out of view (top < 0)
      setPillVisible(rect.bottom < 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Deep-link via ?hub=
  useEffect(() => {
    const hubParam = searchParams.get("hub")
    if (hubParam && HUB_ORDER.includes(hubParam as HubId)) setActiveHub(hubParam as HubId)
  }, [searchParams])

  // Back button closes modals one at a time
  useModalBackStack(activeHub, setActiveHub, selectedService, setSelectedService)

  // Scroll lock while any modal is open
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
      {/* Floating search pill — slides in once inline search leaves viewport */}
      <FloatingSearchPill onSelect={setSelectedService} visible={pillVisible} />

      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="abh-page-title mb-4">Our Service Hubs</h1>
          <p className="abh-tagline max-w-2xl mx-auto">
            Explore our ecosystem. Tap a hub to view all available services and instant pricing.
          </p>
          <div className="abh-divider" />
        </div>

        {/* Inline search — standard position, becomes the trigger point for the pill */}
        <div ref={inlineSearchRef} className="max-w-xl mx-auto mb-10">
          <InlineSearchBar onSelect={setSelectedService} />
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
                {/* Available services count */}
                <p className="mt-3 text-[0.65rem] font-black uppercase tracking-widest" style={{ color: accent }}>
                  {hub.sections.reduce((sum, s) => sum + s.items.length, 0)} Available Services
                </p>
                <div className="mt-6 flex flex-col items-center gap-2">
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

// ─── Inline search bar (top of page, standard position) ──────────────────────
function InlineSearchBar({ onSelect }: { onSelect: (svc: SelectedService) => void }) {
  const { resolvedTheme } = useTheme()
  const isDark    = resolvedTheme === "dark"
  const [query,   setQuery]   = useState("")
  const [focused, setFocused] = useState(false)
  const wrapRef   = useRef<HTMLDivElement>(null)

  const index = useMemo<SearchableService[]>(() => {
    const all: SearchableService[] = []
    HUB_ORDER.forEach((hubId) => {
      HUBS[hubId].sections.forEach((section) => {
        section.items.forEach((item) => {
          all.push({ hubId, sectionTitle: section.title, name: item.name, price: item.price, description: item.description, requirements: item.requirements })
        })
      })
    })
    return all
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)).slice(0, 8)
  }, [query, index])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const pick = (s: SearchableService) => {
    onSelect({ name: s.name, price: s.price, hubId: s.hubId, sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description })
    setQuery(""); setFocused(false)
  }

  return (
    <div ref={wrapRef} className="relative">
      <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder='Search services — e.g. "CV", "laminating", "SASSA"'
        className="w-full pl-11 pr-10 py-3.5 rounded-[14px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-brand-blue transition-colors"
      />
      {query && (
        <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600">
          <X size={12} weight="bold" />
        </button>
      )}
      {focused && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150">
          {results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.map((s, idx) => {
                const colors = HUB_COLORS[s.hubId as HubKey]
                const accent = isDark ? colors.tagTextDark : colors.tagText
                return (
                  <button key={`${s.hubId}-${s.name}-${idx}`} onClick={() => pick(s)} className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
                      <HubIcon id={s.hubId} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">{s.sectionTitle} · {HUBS[s.hubId].title}</p>
                    </div>
                    <span className="text-xs font-black flex-shrink-0" style={{ color: accent }}>{s.price}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No services found</p>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word, or WhatsApp us and ask directly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
 
 
 
