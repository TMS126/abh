"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import {
  X, Printer, FileText, PaintBrush, Globe, Desktop,
  PaperPlaneTilt, Megaphone,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BIZ, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
// import { TestimonialsSection } from "@/components/Testimonials"

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
                  className="flex items-center justify-between p-4 rounded-[14px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-brand-blue transition-all"
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
                Have questions? Switch to the{" "}
                <span className="font-black" style={{ color: accent }}>What to Bring</span> tab or chat with us directly.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800">
          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-4 rounded-[14px] font-black text-sm text-white text-center transition-all active:scale-95 shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#25D366" }}
          >
            Request {naturalLabel}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Search ───────────────────────────────────────────────────────────────────
interface SearchableService {
  hubId: HubId; sectionTitle: string; name: string
  price: string; description: string; requirements: string[]
}

function GradientSearchIcon({ stuck, size = 18 }: { stuck: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {stuck && (
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#1E6FA8"><animate attributeName="stop-color" values="#1E6FA8;#6FBF1A;#F4A261;#1E6FA8" dur="3s" repeatCount="indefinite" /></stop>
            <stop offset="50%"  stopColor="#6FBF1A"><animate attributeName="stop-color" values="#6FBF1A;#F4A261;#1E6FA8;#6FBF1A" dur="3s" repeatCount="indefinite" /></stop>
            <stop offset="100%" stopColor="#F4A261"><animate attributeName="stop-color" values="#F4A261;#1E6FA8;#6FBF1A;#F4A261" dur="3s" repeatCount="indefinite" /></stop>
          </linearGradient>
        </defs>
      )}
      <circle cx="7.5" cy="7.5" r="5" stroke={stuck ? "url(#sg)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
      <line x1="11.5" y1="11.5" x2="16" y2="16" stroke={stuck ? "url(#sg)" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ServiceSearchBar({
  onSelect, stuck, collapsed, onExpandRequest, onFocusRequest, onReleaseRequest,
}: {
  onSelect: (svc: SelectedService) => void
  stuck: boolean
  collapsed: boolean
  onExpandRequest: () => void
  onFocusRequest: () => void
  onReleaseRequest: () => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark     = resolvedTheme === "dark"
  const [query,    setQuery]    = useState("")
  const [focused,  setFocused]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  const isOpen = focused || expanded

  const closeSearch = () => {
    setFocused(false)
    if (stuck) setExpanded(false)
    onReleaseRequest()
  }

  const handleIconClick = () => {
    setExpanded(true)
    setFocused(true)
    onExpandRequest()
    onFocusRequest()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleInputFocus = () => {
    setFocused(true)
    onFocusRequest()
  }

  // Capturing overlay click — fires before anything underneath it, so the
  // tap that closes the search is fully consumed here and never reaches a
  // hub card or any other element behind it. The first outside tap only
  // ever closes the search; nothing else responds to it.
  const handleOverlayPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    closeSearch()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [stuck])

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
    return index.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)).slice(0, 8)
  }, [query, index])

  const pick = (s: SearchableService) => {
    onSelect({ name: s.name, price: s.price, hubId: s.hubId, sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description })
    setQuery("")
    setFocused(false)
    setExpanded(false)
  }

  const showDropdown = focused && query.trim().length > 0

  if (stuck && collapsed && !expanded) {
    return (
      <div className="flex justify-center">
        <button
          onClick={handleIconClick}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md transition-all active:scale-95 hover:scale-105"
          aria-label="Search services"
        >
          <GradientSearchIcon stuck={true} size={22} />
        </button>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative flex justify-center w-full">
      {isOpen && (
        <div
          className="fixed inset-0 z-[890]"
          style={{ touchAction: "none" }}
          onPointerDown={handleOverlayPointerDown}
          aria-hidden="true"
        />
      )}
      <div className={cn(
        "relative transition-all duration-300 z-[900]",
        !stuck && "w-[85%] md:w-1/2",
        stuck && !expanded && "w-[85%] md:w-1/2",
        stuck && expanded && "w-full md:w-1/2",
      )}>
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-zinc-400 dark:text-zinc-500">
          <GradientSearchIcon stuck={stuck} size={22} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Search service"
          className={cn(
            "w-full pl-11 pr-9 py-3 rounded-[14px] text-sm font-medium outline-none transition-all duration-300",
            "bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
            stuck
              ? "border border-zinc-200 dark:border-zinc-700 shadow-lg focus:border-brand-blue"
              : "border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] focus:border-brand-blue"
          )}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600"
          >
            <X size={11} weight="bold" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="absolute top-full mt-2 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden z-[895] animate-in fade-in zoom-in-95 duration-150"
          style={{ width: "min(100%, 480px)", left: "50%", transform: "translateX(-50%)" }}
        >
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
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word or WhatsApp us directly.</p>
            </div>
          )}
        </div>
      )}
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
  const isDark       = resolvedTheme === "dark"
  const searchParams = useSearchParams()

  const [activeHub,       setActiveHub]       = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)

  const searchWrapRef = useRef<HTMLDivElement>(null)
  const [stuck,       setStuck]     = useState(false)
  const [collapsed,   setCollapsed] = useState(false)
  const forcedStuckRef = useRef(false)

  const forceStuck = () => {
    forcedStuckRef.current = true
    setStuck(true)
  }
  const releaseForcedStuck = () => {
    forcedStuckRef.current = false
    if (searchWrapRef.current) {
      const rect = searchWrapRef.current.getBoundingClientRect()
      const isStuck = rect.top <= 74
      setStuck(isStuck)
      setCollapsed(isStuck && window.innerWidth < 768)
    }
  }

  const activeHubRef       = useRef(activeHub)
  const selectedServiceRef = useRef(selectedService)
  useEffect(() => { activeHubRef.current       = activeHub       }, [activeHub])
  useEffect(() => { selectedServiceRef.current = selectedService }, [selectedService])

  useEffect(() => {
    const hubParam = searchParams.get("hub")
    if (hubParam && HUB_ORDER.includes(hubParam as HubId)) setActiveHub(hubParam as HubId)
  }, [searchParams])

  // Sticky detection — the trigger point (when it BECOMES sticky) is still
  // anchored to roughly the navbar's height, but where it then sits once
  // stuck is handled separately below: flush at the very top (top-0),
  // regardless of expanded/collapsed state. Tapping/focusing the bar also
  // forces it sticky immediately, regardless of scroll position, so it
  // never gets left behind mid-page once the keyboard opens.
  useEffect(() => {
    const onScroll = () => {
      if (!searchWrapRef.current) return
      const rect    = searchWrapRef.current.getBoundingClientRect()
      const navH    = 74
      const isStuck = rect.top <= navH
      setStuck((prev) => (forcedStuckRef.current ? true : isStuck))
      setCollapsed((prev) => (forcedStuckRef.current ? prev : isStuck && window.innerWidth < 768))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Back button — push baseline on mount
  useEffect(() => {
    window.history.pushState({ modal: null }, "")
  }, [])

  // Push history entry on modal open
  useEffect(() => {
    if (selectedService) {
      window.history.pushState({ modal: "service" }, "")
    } else if (activeHub) {
      window.history.pushState({ modal: "hub" }, "")
    }
  }, [selectedService, activeHub])

  // Intercept back — close innermost first
  useEffect(() => {
    const onPopState = () => {
      if (selectedServiceRef.current) {
        setSelectedService(null)
        window.history.pushState({ modal: "hub" }, "")
      } else if (activeHubRef.current) {
        setActiveHub(null)
        window.history.pushState({ modal: null }, "")
      } else {
        window.history.pushState({ modal: null }, "")
      }
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  // Scroll lock
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

        <div className="text-center mb-10">
          <h1 className="abh-page-title mb-4">Our Service Hubs</h1>
          <p className="abh-tagline max-w-2xl mx-auto">
            Explore our ecosystem. Tap a hub to view all available services and instant pricing.
          </p>
          <div className="abh-divider" />
        </div>

        {/* Search bar — once stuck, it pins flush to the very top of the
            viewport (top-0) with a fully opaque background and a stacking
            order above the navbar. That's the actual fix: instead of
            sitting just below the logo and colliding with it, the bar now
            owns the top strip outright and visually covers the logo rather
            than fighting it for space — whether it's the collapsed icon or
            the expanded input, since only the inner content changes, not
            this outer fixed positioning. */}
        <div ref={searchWrapRef} className="mb-8">
          {stuck && <div className="h-[52px]" />}
          <div className={cn(
            "transition-all duration-300",
            stuck
              ? "fixed top-0 left-0 right-0 z-[900] flex justify-center px-4 pt-3 pb-2.5"
              : "relative"
          )}>
            <ServiceSearchBar
              onSelect={setSelectedService}
              stuck={stuck}
              collapsed={collapsed}
              onExpandRequest={() => setCollapsed(false)}
              onFocusRequest={forceStuck}
              onReleaseRequest={releaseForcedStuck}
            />
          </div>
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

      {/* <TestimonialsSection /> */}

      <HubModal
        hubId={activeHub}
        onClose={() => setActiveHub(null)}
        onSelectService={setSelectedService}
      />
      <ServiceDetailModal
        svc={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </section>
  )
}
 
