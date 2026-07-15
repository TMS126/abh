"use client"

import { useState, useEffect, useMemo, useRef, type ChangeEvent, type RefObject } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence, useDragControls, type PanInfo } from "framer-motion"
import {
  X, Printer, FileText, PaintBrush, Globe, Desktop,
  PaperPlaneTilt, Megaphone, MagnifyingGlass,
  Paperclip, CheckCircle, WarningCircle, ShieldCheck,
  ShareNetwork, ArrowUp,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, BRAND } from "@/lib/brand"
import { ensureAccessible, getContrastText } from "@/lib/color"
import { trackEvent } from "@/lib/analytics"
import { HUBS, HubId } from "@/lib/data"

// ─── Constants ────────────────────────────────────────────────────────────────
const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

// Three natural-language service hints shown on each hub card


const CLD_CLOUD  = "dk30vh3ft"
const CLD_PRESET = "apexbyteshub"
const CLD_MAX_MB = 10

const BLOCKED_EXTENSIONS = /\.(exe|bat|sh|cmd|msi|dmg|apk|bin|scr|vbs|ps1|jar)$/i
const BLOCKED_MIME_TYPES = new Set([
  "video/mp4", "video/avi", "video/quicktime", "video/x-matroska",
  "video/x-msvideo", "video/webm", "video/ogg",
  "application/x-msdownload", "application/x-executable",
  "application/x-sh", "application/x-bat",
])

const HUB_ACCEPT: Record<HubId, string> = {
  print:    ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  doc:      ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  design:   ".pdf,.jpg,.jpeg,.png,.ai,.psd,.svg",
  eservice: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  tech:     ".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx",
}

const NOTICE = {
  text:      "Add-on services will be available from ",
  date:      "15 September 2026",
  textAfter: ". Minor price adjustments have also been made across some services. We appreciate your continued support and will keep you updated as we grow.",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCldUrl(file: File) {
  return `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/${file.type.startsWith("image/") ? "image" : "raw"}/upload`
}

// Turns ".pdf,.jpg,.jpeg,.png,.doc,.docx" into "PDF, JPG, JPEG, PNG, DOC, DOCX"
// for a friendly hint under the attach button.
function formatAcceptHint(accept: string) {
  return accept
    .split(",")
    .map(ext => ext.trim().replace(/^\./, "").toUpperCase())
    .filter(Boolean)
    .join(", ")
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
// Swaps the verb "bring" for "provide" anywhere it appears, case-preserved.
// Used to make requirement/description text read naturally for hubs that are
// fully remote (Design, eService) without needing to rewrite every sentence
// in data.ts by hand.
function remoteizeText(text: string) {
  return text.replace(/\bbring\b/gi, (match) => {
    if (match === "Bring") return "Provide"
    if (match === "BRING") return "PROVIDE"
    return "provide"
  })
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

// ─── Brand loader ─────────────────────────────────────────────────────────────
// Three dots in brand order (blue, green, orange), pulsing in sequence so
// one "grows" at a time rather than all three moving in lockstep — reads as
// a wave passing through the trio.
function AbhLoader({ size = 28 }: { size?: number }) {
  const dot = Math.max(6, Math.round(size * 0.32))
  const colors = [BRAND.blue, BRAND.green, BRAND.orange]
  return (
    <div className="flex items-center gap-1.5" style={{ height: size }}>
      <style>{`
        @keyframes abh-dot-grow {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.45; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
      {colors.map((c, i) => (
        <span
          key={i}
          className="rounded-full shrink-0"
          style={{
            width: dot,
            height: dot,
            backgroundColor: c,
            animation: "abh-dot-grow 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Searchable service type ──────────────────────────────────────────────────
interface SearchableService {
  hubId: HubId; sectionTitle: string; name: string
  price: string; description: string; requirements: string[]
}

function buildSearchIndex(): SearchableService[] {
  const all: SearchableService[] = []
  HUB_ORDER.forEach((hubId) => {
    HUBS[hubId].sections.forEach((section) => {
      section.items.forEach((item) => {
        all.push({
          hubId, sectionTitle: section.title,
          name: item.name, price: item.price,
          description: item.description,
          requirements: item.requirements,
        })
      })
    })
  })
  return all
}

// ─── Selected service type ────────────────────────────────────────────────────
interface SelectedService {
  name: string; price: string; hubId: HubId
  sectionTitle: string; requirements: string[]; desc?: string
}

// ─── Back-button modal stack ──────────────────────────────────────────────────
function useModalBackStack(
  activeHub: HubId | null,       setActiveHub: (h: HubId | null) => void,
  selectedService: SelectedService | null, setSelectedService: (s: SelectedService | null) => void,
) {
  const prevHub     = useRef<HubId | null>(null)
  const prevService = useRef<SelectedService | null>(null)

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

  useEffect(() => {
    const onPop = () => {
      if (selectedService) {
        setSelectedService(null)
        prevService.current = null
        window.history.pushState({ abModal: "hub" }, "")
        return
      }
      if (activeHub) {
        setActiveHub(null)
        prevHub.current = null
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [activeHub, selectedService, setActiveHub, setSelectedService])
}

// ─── Focus trap ────────────────────────────────────────────────────────────
// Keeps Tab/Shift+Tab cycling inside the modal while it's open, moves focus
// into the modal on open, and restores focus to whatever triggered it once
// the modal closes — needed for keyboard/screen-reader users to not get
// stuck on, or lose track of, background page content while a modal is up.
function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement>) {
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    previouslyFocused.current = document.activeElement as HTMLElement
    containerRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [active, containerRef])
}

// ─── Inline search bar ────────────────────────────────────────────────────────
function InlineSearchBar({ onSelect }: { onSelect: (svc: SelectedService) => void }) {
  const { resolvedTheme } = useTheme()
  const isDark    = resolvedTheme === "dark"
  const [query,   setQuery]   = useState("")
  const [focused, setFocused] = useState(false)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const index     = useMemo(buildSearchIndex, [])

  // Stroke, not fill — transparent/white background with a blue border,
  // blue text/icon. Was a solid blue fill; switched per request so the bar
  // reads as an outlined field rather than a filled button.
  const strokeColor = isDark ? BRAND.lightBlue : BRAND.blue
  const blueIcon     = isDark ? BRAND.lightBlue : BRAND.blue
  const priceColor  = isDark ? BRAND.lightOrange : BRAND.orangeDark

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index
      .filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      .slice(0, 8)
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
    <div ref={wrapRef} className="relative mx-auto w-full max-w-md">
      <MagnifyingGlass
        size={18}
        weight="bold"
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: strokeColor }}
      />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Search"
        className="w-full pl-11 pr-10 py-4 rounded-[14px] font-sans font-black text-base bg-white dark:bg-zinc-950 placeholder:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all duration-300 outline-none text-center focus:text-left focus:scale-[0.99]"
        style={{
          color: strokeColor,
          border: `2px solid ${strokeColor}`,
          boxShadow: focused ? `0 0 0 3px ${strokeColor}22` : "none",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${strokeColor}0d` }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "" }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: `${strokeColor}18`, color: strokeColor }}
        >
          <X size={12} weight="bold" />
        </button>
      )}
      {focused && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150">
          {results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.map((s, idx) => (
                <button
                  key={`${s.hubId}-${s.name}-${idx}`}
                  onClick={() => pick(s)}
                  className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${blueIcon}15`, color: blueIcon }}>
                    <HubIcon id={s.hubId} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">{s.sectionTitle} · {HUBS[s.hubId].title}</p>
                  </div>
                  <span className="text-xs font-black shrink-0" style={{ color: priceColor }}>{s.price}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No services found</p>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word, or WhatsApp us directly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


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
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setOpenSectionIdx(0) }, [hubId])

  // Escape key closes the modal, mirroring the gallery page's overlay behavior.
  useEffect(() => {
    if (!hubId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hubId, onClose])

  useFocusTrap(!!hubId, containerRef)

  if (!hubId) return null
  const hub    = HUBS[hubId]
  const colors = HUB_COLORS[hubId as HubKey]
  // Icon is now uniformly blue (was per-hub) — hub identity instead comes
  // through the "Available Services" label and the close button below.
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  const hubColor  = isDark ? colors.accentDark : colors.accentLight

  // Tab+description panel stays solid blue (dominant page color, unchanged).
  const panelBg   = isDark ? BRAND.blueMid : BRAND.blue
  const cardText  = getContrastText(panelBg)
  const activeTabColor = ensureAccessible(isDark ? BRAND.lightGreen : BRAND.green, panelBg, 4.5)
  const priceColor = isDark ? BRAND.lightOrange : BRAND.orangeDark

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* backdrop-blur-sm (was -md) — lighter blur, cheaper to composite,
          especially since this backdrop can be visible at the same time as
          the ServiceDetailModal's own overlay when both are stacked. */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm overscroll-contain" onClick={onClose} />
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={hub.title}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85dvh] animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-zinc-800 outline-none"
      >

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center" style={{ backgroundColor: `${blueColor}05` }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[14px] flex items-center justify-center shadow-lg bg-zinc-100 dark:bg-zinc-800" style={{ border: `2px solid ${blueColor}` }}>
              <HubIcon id={hubId} size={28} color={blueColor} />
            </div>
            <div>
              <h2 className="abh-card-heading text-xl md:text-2xl">{hub.title}</h2>
              {/* Label carries the hub's own color — the icon above is now
                  uniformly blue, so this is one of the spots hub identity
                  still comes through in the header. */}
              <p className="abh-label mt-0.5" style={{ color: hubColor }}>{hub.sections.reduce((sum, s) => sum + s.items.length, 0)} Available Services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: `${hubColor}15`, color: hubColor }}
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8">

          {/* Section tabs + description — fused into one solid blue card so
              switching tabs feels like updating one shape rather than two
              separate pieces. Falls back to plain neutral pills (old
              behavior) if every section is collapsed (openSectionIdx null). */}
          {openSectionIdx !== null && hub.sections[openSectionIdx] ? (
            <div
              className="rounded-[14px] p-4 md:p-5 mb-5 transition-colors duration-300"
              style={{
                backgroundColor: panelBg,
                boxShadow: `0 14px 28px -8px ${panelBg}66, 0 6px 14px -6px ${panelBg}45`,
              }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {hub.sections.map((section, sIdx) => {
                  const isOpen = openSectionIdx === sIdx
                  return (
                    <button
                      key={sIdx}
                      onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-tight whitespace-nowrap transition-all duration-200",
                        isOpen ? "bg-white/25 dark:bg-black/20" : "bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15"
                      )}
                      style={{ color: isOpen ? activeTabColor : cardText, opacity: isOpen ? 1 : 0.65 }}
                    >
                      {section.title}
                    </button>
                  )
                })}
              </div>
              {hub.sections[openSectionIdx].desc && (
                <div key={openSectionIdx} className="animate-in fade-in duration-300">
                  {/* Divider separating the tab pills above from the
                      description below — colored off cardText so it stays
                      visible against the blue panel in both themes. */}
                  <div className="h-px w-full mb-4" style={{ backgroundColor: `${cardText}25` }} />
                  <p
                    className="text-[0.82rem] font-semibold leading-relaxed"
                    style={{ color: cardText }}
                  >
                    {hub.sections[openSectionIdx].desc}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="inline-flex flex-wrap gap-2 mb-5">
              {hub.sections.map((section, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setOpenSectionIdx(sIdx)}
                  className="px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-tight whitespace-nowrap transition-all duration-200 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  {section.title}
                </button>
              ))}
            </div>
          )}

          {openSectionIdx !== null && hub.sections[openSectionIdx] && (
            <div
              key={openSectionIdx}
              className="rounded-[14px] bg-zinc-50 dark:bg-zinc-900/50 shadow-sm p-3 md:p-4 grid grid-cols-1 gap-2 animate-in fade-in zoom-in-95 duration-300"
            >
              {hub.sections[openSectionIdx].items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  onClick={() => onSelectService({
                    name: item.name, price: item.price, hubId,
                    sectionTitle: hub.sections[openSectionIdx!].title,
                    requirements: item.requirements, desc: item.description,
                  })}
                  className="flex items-center justify-between p-3.5 md:p-4 rounded-[14px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-[#1E6FA8] dark:hover:border-[#A9D6F2] transition-all"
                >
                  <span className="text-[0.84rem] font-black text-zinc-800 dark:text-zinc-200 text-left">{item.name}</span>
                  <span className="text-[0.84rem] font-black shrink-0 ml-3" style={{ color: priceColor }}>{item.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Service Detail Modal ─────────────────────────────────────────────────────
type Tab = "bring" | "about"

// Hubs whose services are handled entirely online/remotely — no physical
// item ever needs to be dropped off, so the "Bring" pill reads oddly there.
const REMOTE_HUBS: HubId[] = ["design", "eservice"]
function isRemoteHub(hubId: HubId) {
  return REMOTE_HUBS.includes(hubId)
}

// Turnaround estimates — researched realistic times for South African retail
// and government services. Keyed by section title; item-level overrides below.
const TURNAROUND: Record<string, string> = {
  // Print Hub
  "Printing":            "15–30 mins",
  "Copying":             "10–20 mins",
  "Photo Printing":      "20–40 mins",
  "Scanning":            "10–15 mins",
  "Laminating":          "10–20 mins",
  // Docu Hub
  "Typing + Printing":   "1–3 hours",
  "CV Services":         "24–48 hours",
  "Other Documents":     "2–4 hours",
  // Design Hub
  "Logos":               "2–3 days",
  "Business Cards":      "1–2 days",
  "Flyers & Posters":    "1–2 days",
  "Social Media":        "24–48 hours",
  "Invitations":         "1–2 days",
  "Revisions":           "2–6 hours",
  // E-Service Hub
  "SASSA":               "24 hours",
  "SARS":                "24 hours",
  "PSIRA":               "1–2 days",
  "Online Applications": "24 hours",
  "Email Services":      "15–30 mins",
  "Business Services":   "1–2 days",
  "Digital Setup":       "2–4 hours",
  // Tech Hub
  "Software":            "1–3 hours",
  "Hardware":            "1–2 days",
  "Support":             "2–6 hours",
  "Windows & Office":    "2–4 hours",
}

// Item-level overrides for services that differ from their section's estimate
const TURNAROUND_OVERRIDE: Record<string, string> = {
  "Premium Logo":              "3–5 days",
  "Standard Logo":             "2–3 days",
  "Video":                     "3–5 days",
  "Tax Return / VAT / PAYE":   "2–3 days",
  "CSD Registration":          "1–2 days",
  "UIF Claims":                "2–3 days",
}

const TURNAROUND_DISCLAIMER =
  "Turnaround times are estimates based on standard volume. Factors such as load shedding, third-party system downtime (SARS/SASSA/PSIRA), or complex revision requests may affect final delivery. We appreciate your patience as we ensure the highest quality for your work."

// Spring tuned for a native-feeling sheet: snappy but not bouncy.
const SHEET_TRANSITION = { type: "spring" as const, damping: 32, stiffness: 340 }

function ServiceDetailModal({ svc, onClose }: { svc: SelectedService | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [tab,         setTab]         = useState<Tab>("bring")
  const [file,        setFile]        = useState<File | null>(null)
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileUrl,     setFileUrl]     = useState<string | null>(null)
  const [uploadErr,   setUploadErr]   = useState<string | null>(null)
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [addedToQuote, setAddedToQuote] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  useEffect(() => {
    setTab("bring"); setAddedToQuote(false)
    setFile(null); setFileUrl(null)
    setUploadPhase("idle"); setUploadErr(null); setUploadProgress(0)
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    if (fileRef.current) fileRef.current.value = ""
  }, [svc?.name])

  // Revoke any outstanding object URL when the modal unmounts, so we don't
  // leak memory if the person navigates away mid-preview.
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  // Escape key closes the modal, mirroring the gallery page's overlay behavior.
  useEffect(() => {
    if (!svc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [svc, onClose])

  useFocusTrap(!!svc, containerRef)

  const doUpload = (f: File) => {
    setUploadPhase("uploading")
    setUploadProgress(0)

    const fd = new FormData()
    fd.append("file", f)
    fd.append("upload_preset", CLD_PRESET)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", getCldUrl(f))

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status < 200 || xhr.status >= 300) {
          throw new Error(data?.error?.message || `HTTP ${xhr.status}`)
        }
        if (!data.secure_url) throw new Error("No URL returned")
        setFileUrl(data.secure_url)
        setUploadPhase("done")
      } catch (err) {
        setUploadErr(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`)
        setUploadPhase("error")
      }
    }

    xhr.onerror = () => {
      setUploadErr("Upload failed: network error")
      setUploadPhase("error")
    }

    xhr.send(fd)
  }

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    // Block explicit/dangerous file types
    if (BLOCKED_MIME_TYPES.has(f.type) || BLOCKED_EXTENSIONS.test(f.name)) {
      setUploadErr("That file type isn't allowed. Please send a document, image, or PDF only.")
      setUploadPhase("error")
      return
    }

    if (f.size > CLD_MAX_MB * 1024 * 1024) {
      setUploadErr(`File too large — please keep it under ${CLD_MAX_MB}MB.`)
      setUploadPhase("error")
      return
    }

    setFile(f)
    setUploadErr(null)

    // Local thumbnail preview for images only — separate from the Cloudinary
    // upload, so it appears instantly rather than waiting on the network.
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f))
    }

    doUpload(f)
  }

  const clearFile = () => {
    setFile(null); setFileUrl(null)
    setUploadPhase("idle"); setUploadErr(null); setUploadProgress(0)
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    if (fileRef.current) fileRef.current.value = ""
  }

  // Swipe-to-close: dragConstraints={{top:0,bottom:0}} means the sheet can't
  // be dragged away from its resting position except elastically (see
  // dragElastic below). If the release point/velocity clears the threshold
  // we close; otherwise framer-motion springs it back to 0 on its own —
  // no manual "snap back" code needed.
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) {
      onClose()
    }
  }

  if (!svc) return null

  // Everything in this modal uses the shared blue/green/orange scheme,
  // except the close button, which takes this service's own hub color.
  const blueColor   = isDark ? BRAND.lightBlue  : BRAND.blue
  const greenColor  = isDark ? BRAND.lightGreen : BRAND.green
  const orangeColor = isDark ? BRAND.lightOrange : BRAND.orangeDark
  const hubColors   = HUB_COLORS[svc.hubId as HubKey]
  const hubColor    = isDark ? hubColors.accentDark : hubColors.accentLight

  const hubTitle     = HUBS[svc.hubId]?.title || svc.sectionTitle
  const naturalLabel = naturalServiceLabel(svc.name, svc.sectionTitle)
  const acceptHint   = formatAcceptHint(HUB_ACCEPT[svc.hubId])
  const isRemote     = isRemoteHub(svc.hubId)
  const bringLabel   = isRemote ? "Provide" : "Bring"

  const handleShare = async () => {
    const shareText = `${naturalLabel} — ${svc.price} at ${BIZ.name}`
    const shareUrl   = typeof window !== "undefined" ? window.location.href : ""

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${naturalLabel} — ${BIZ.name}`, text: shareText, url: shareUrl })
      } catch {
        // Person cancelled the native share sheet — no action needed.
      }
      return
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  const waMessage = fileUrl
    ? `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. My file: ${fileUrl}`
    : `Hi ${BIZ.name}! I'd like to request ${naturalLabel} (${hubTitle}). Price shown: ${svc.price}. Can you assist?`

  const requirements = (svc.requirements?.length
    ? svc.requirements
    : isRemote
      ? ["Just share (upload) your file or details with us via WhatsApp / Email — we'll take care of the rest."]
      : ["Just bring your file, document or USB — we'll take care of the rest."]
  ).map(r => (isRemote ? remoteizeText(r) : r))

  const descRaw = svc.desc?.trim()
    ? svc.desc
    : `${naturalLabel} is one of our ${hubTitle} services. We handle everything professionally so you don't have to worry about a thing.`
  const desc = isRemote ? remoteizeText(descRaw) : descRaw
  return (
    <div className="fixed inset-0 z-[10200] flex items-end justify-center">
      {/* No backdrop-blur here — backdrop-filter is one of the most GPU-expensive
          effects on mobile, and was the actual source of the slide-up lag (not
          RAM). Slightly darker opacity keeps the same dimmed feel without it. */}
      <motion.div
        className="absolute inset-0 bg-black/50 overscroll-contain"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* True bottom sheet — same max-w-2xl cap as HubModal with a small
          horizontal gutter, driven by framer-motion (compositor-animated
          transform) instead of CSS keyframes. will-change-transform pre-
          promotes this to its own GPU layer before the drag/spring starts.
          Drag only initiates from the handle below, so scrolling inside the
          tab content never fights the sheet. */}
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={svc.name}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        onDragEnd={handleDragEnd}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={SHEET_TRANSITION}
        style={{ boxShadow: "0 -16px 44px -10px rgba(0,0,0,0.35), 0 -6px 18px -6px rgba(0,0,0,0.25)" }}
        className="relative w-full max-w-2xl mx-3 sm:mx-6 rounded-t-[20px] overflow-hidden bg-white dark:bg-zinc-950 border border-b-0 border-zinc-100 dark:border-zinc-800 max-h-[88dvh] flex flex-col outline-none will-change-transform"
      >
        {/* Drag handle — decorative/visual affordance only; the X button
            below is the real accessible close control, so this is hidden
            from screen readers rather than announced as an interactive
            element with no keyboard equivalent. */}
        <div
          aria-hidden="true"
          className="w-full flex justify-center pt-3 pb-1.5 cursor-grab active:cursor-grabbing touch-none shrink-0"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="px-6 pt-1 pb-0 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <span
                className="text-[0.62rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2.5 inline-block"
                style={{ backgroundColor: `${blueColor}15`, color: blueColor }}
              >
                {cleanText(svc.sectionTitle)}
              </span>
              <h3 className="abh-card-heading text-[1.1rem] leading-tight">{svc.name}</h3>
            </div>
            <div className="flex items-center gap-2 shrink-0 relative">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share this service"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ backgroundColor: `${blueColor}15`, color: blueColor }}
              >
                <ShareNetwork size={16} weight="bold" />
              </button>
              {shareCopied && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap text-[0.62rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  Copied!
                </span>
              )}
              {/* Close button — this service's own hub color, unlike the
                  rest of the modal (blue/green/orange shared scheme). */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                style={{ backgroundColor: `${hubColor}15`, color: hubColor }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Price + turnaround pill */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="text-4xl font-black tracking-tighter" style={{ color: orangeColor }}>{svc.price}</span>
            <span
              className="flex items-center gap-1.5 text-[0.65rem] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${orangeColor}12`, color: orangeColor }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 3.5V6.25L7.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {TURNAROUND_OVERRIDE[svc.name] ?? TURNAROUND[svc.sectionTitle] ?? "Same day"}
            </span>
          </div>

          {/* Tabs */}
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
                {t === "bring" ? bringLabel : "Description"}
              </button>
            ))}
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
                      className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-black mt-0.5", isDark ? "text-zinc-900" : "text-white")}
                      style={{ backgroundColor: blueColor }}
                    >
                      {idx + 1}
                    </span>
                    <span className="abh-body text-[0.84rem] pt-0.5">{req}</span>
                  </li>
                ))}
              </ol>
              {/* Disclaimer box — inset shadow only, no background fill, so it
                  reads as a subtly recessed note rather than a filled card. */}
              <div
                className="mt-5 rounded-[14px] p-4"
                style={{ boxShadow: `inset 0 1px 4px ${blueColor}35, inset 0 0 0 1px ${blueColor}20` }}
              >
                <p className="abh-muted !mt-0">
                  {TURNAROUND_DISCLAIMER}
                </p>
              </div>
            </div>
          )}
          {tab === "about" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-200">
              <p className="abh-body text-[0.84rem]">{desc}</p>
              <p className="abh-muted mt-5">
                Have questions? Switch to the{" "}
                <span className="font-black" style={{ color: blueColor }}>{bringLabel}</span> tab or chat with us directly.
              </p>
            </div>
          )}
        </div>

        {/* Footer — upload + CTA */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 space-y-3">

          <input
            ref={fileRef}
            type="file"
            accept={HUB_ACCEPT[svc.hubId]}
            onChange={handleFilePick}
            className="hidden"
          />

          {/* Idle — attach button + accepted formats + privacy note */}
          {uploadPhase === "idle" && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[14px] font-bold text-sm border-2 border-dashed transition-all active:scale-95 hover:opacity-80"
                style={{ borderColor: `${blueColor}40`, color: blueColor }}
              >
                <Paperclip size={17} weight="bold" />
                Attach a file (optional)
              </button>
              <p className="text-[0.65rem] font-medium text-zinc-400 dark:text-zinc-500 text-center px-1">
                Accepts: {acceptHint}
              </p>
              <div className="flex items-start gap-2 px-1">
                <ShieldCheck size={13} weight="fill" className="text-[#6FBF1A] shrink-0 mt-0.5" />
                <p className="abh-muted text-[0.67rem] leading-relaxed">
                  Your file goes directly to Apexbytes Hub only — safe, private, and used only for your order. No explicit or inappropriate content allowed.
                </p>
              </div>
            </div>
          )}

          {/* Uploading — brand loader + live percentage from XHR progress */}
          {uploadPhase === "uploading" && (
            <div className="flex items-center gap-3 w-full px-4 py-3 rounded-[14px] text-sm font-bold bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
              <AbhLoader size={28} />
              <span className="font-black tabular-nums shrink-0" style={{ color: blueColor }}>{uploadProgress}%</span>
              <span className="truncate">Uploading {file?.name}…</span>
            </div>
          )}

          {/* Done — thumbnail (images only) + filename */}
          {uploadPhase === "done" && file && (
            <div className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-[14px] text-sm font-bold bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/30">
              <span className="flex items-center gap-2.5 min-w-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="w-8 h-8 rounded-[8px] object-cover shrink-0 border border-green-200/60 dark:border-green-800/40"
                  />
                ) : (
                  <CheckCircle size={17} weight="fill" className="shrink-0" />
                )}
                <span className="truncate">{file.name}</span>
              </span>
              <button type="button" onClick={clearFile} aria-label="Remove file" className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X size={15} weight="bold" />
              </button>
            </div>
          )}

          {/* Error */}
          {uploadPhase === "error" && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 w-full px-4 py-3 rounded-[14px] text-sm font-bold bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
                <WarningCircle size={17} weight="fill" className="shrink-0 mt-0.5" />
                <span className="leading-snug font-medium">{uploadErr}</span>
              </div>
              <button
                type="button"
                onClick={() => { setUploadPhase("idle"); setUploadErr(null); fileRef.current?.click() }}
                className="text-xs font-black underline"
                style={{ color: blueColor }}
              >
                Try a different file
              </button>
            </div>
          )}

          {/* + Add to Quote — green highlight, fires abh:add-to-quote (the
              QuoteCalculatorWidget listens) and its own GA4 event since it's
              a stronger buying signal than just opening a service's sheet. */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("abh:add-to-quote", {
                detail: { hubId: svc.hubId, sectionTitle: svc.sectionTitle, name: svc.name, price: svc.price }
              }))
              trackEvent("add_to_quote", {
                hub_id: svc.hubId,
                service_name: svc.name,
                section_title: svc.sectionTitle,
                price: svc.price,
              })
              setAddedToQuote(true)
              setTimeout(() => setAddedToQuote(false), 2200)
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[14px] font-bold text-sm border-2 transition-all duration-200 active:scale-95"
            style={addedToQuote
              ? { borderColor: greenColor, backgroundColor: `${greenColor}10`, color: greenColor }
              : { borderColor: `${greenColor}35`, color: greenColor, backgroundColor: "transparent" }
            }
          >
            {addedToQuote ? "✓ Added to Quote" : "+ Add to Quote"}
          </button>

          {/* WhatsApp CTA — kept WhatsApp's own brand green (#25D366), since
              that's instantly recognizable as a WhatsApp action, separate
              from our own green highlight color used just above. */}
          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("request_whatsapp", {
              hub_id: svc.hubId,
              service_name: svc.name,
              section_title: svc.sectionTitle,
              price: svc.price,
              had_file_attached: uploadPhase === "done",
            })}
            className="flex items-center justify-center gap-2 w-full px-4 py-4 rounded-[14px] font-black text-sm text-white text-center transition-all active:scale-95 shadow-[0_4px_14px_rgba(37,211,102,0.3)] hover:-translate-y-0.5"
            style={{ backgroundColor: "#25D366" }}
          >
            Request {naturalLabel}
          </a>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Notice Banner ────────────────────────────────────────────────────────────
// Blue = ℹ️ info/update notice (not a warning).
function NoticeBanner() {
  return (
    <div className="relative mx-auto w-full max-w-md mb-10 rounded-[14px] border border-[#1E6FA8]/20 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-9 h-9 rounded-[10px] bg-[#1E6FA8] flex items-center justify-center shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <span className="abh-eyebrow text-[#15537D] dark:text-[#A9D6F2] block mb-1">
          Notice to Clients
        </span>
        <p className="abh-body text-[0.84rem]">
          {NOTICE.text}<span className="font-black text-zinc-800 dark:text-zinc-100">{NOTICE.date}</span>{NOTICE.textAfter}
        </p>
      </div>
    </div>
  )
        }

// ─── Closing tagline ──────────────────────────────────────────────────────────
// No gradients anywhere on the page — solid blue wash + solid blue top bar.
function ClosingTagline() {
  return (
    <div className="relative mt-2 mb-4 overflow-hidden rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-6 py-10 md:py-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#1E6FA8]" />
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Why Apexbytes Hub</p>
      <p className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        From your first CV to your next big idea — one hub does it all, right here in Bothaville.
      </p>
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
  const [showBackToTop,   setShowBackToTop]   = useState(false)

  // Central place a service becomes "selected" from any entry point (hub
  // card list, inline search, or the floating search widget's window
  // event below) — single spot to fire the view_service GA4 event instead
  // of duplicating the trackEvent call at each call site.
  const handleSelectService = (svc: SelectedService) => {
    trackEvent("view_service", {
      hub_id: svc.hubId,
      service_name: svc.name,
      section_title: svc.sectionTitle,
    })
    setSelectedService(svc)
  }

  const handleOpenHub = (hubId: HubId) => {
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setActiveHub(hubId)
  }

  // Reveal the Back to Top button once the person has scrolled well past
  // the inline search bar near the top of the page.
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // The floating search is now a global root-layout widget (see
  // components/floating-search-widget.tsx) so it can sit in the same FAB
  // stack as the Quote Calculator and WhatsApp widgets. It has no direct
  // access to this page's state, so it dispatches a window event when a
  // result is tapped, and we open the existing ServiceDetailModal here —
  // routed through handleSelectService so this entry point is tracked too.
  useEffect(() => {
    const handler = (e: Event) => {
      const svc = (e as CustomEvent<SelectedService>).detail
      if (svc) handleSelectService(svc)
    }
    window.addEventListener("abh:selectService", handler)
    return () => window.removeEventListener("abh:selectService", handler)
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
    <section className="min-h-screen bg-white dark:bg-[#081428] transition-colors duration-300 pb-24">

      <div className="max-w-[1248px] mx-auto px-4 md:px-8 flex flex-col items-center">

        {/* Hero */}
        <div className="pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center w-full">
          <h1 className="abh-page-title mb-3">Our Service Hubs</h1>
          <p className="abh-tagline max-w-xl mx-auto">
            Explore our ecosystem. Tap a hub to view all available services and instant pricing.
          </p>
          <div className="abh-divider mx-auto" />
        </div>

        {/* Inline search — id is used by the FloatingSearchWidget (root layout)
            to know when this bar has scrolled out of view */}
        <div id="abh-inline-search" className="w-full mb-10 flex justify-center">
          <InlineSearchBar onSelect={handleSelectService} />
        </div>

        <div className="w-full">
          <NoticeBanner />
        </div>

        {/* Hub cards — horizontal stack on desktop, wide on desktop (max 1248px).
            Icon is uniformly blue now. Only the thin underline beneath the
            icon carries that hub's own color in the resting state. Hover
            brings the hub's color back for border, shadow glow, title text,
            AND now "explore" + its divider too — via CSS custom properties
            (--hub-accent / --hub-shadow) for the hover-only bits, and direct
            per-hub `accent` for explore/divider which are hub-colored even
            at rest. */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-5 md:gap-4 pb-2 w-full">
          {HUB_ORDER.map((hubId) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const cardBg = isDark ? "#09090b" : "#ffffff"
            const blueIcon = isDark ? BRAND.lightBlue : BRAND.blue
            const exploreColor = ensureAccessible(accent, cardBg, 4.5)
            const dividerColor = `${accent}40`
            return (
              <button
                key={hubId}
                onClick={() => handleOpenHub(hubId)}
                style={{ '--hub-accent': accent, '--hub-shadow': `${accent}55` } as any}
                className="group flex flex-col items-center p-6 md:p-7 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:border-[var(--hub-accent)] hover:shadow-[0_10px_28px_-6px_var(--hub-shadow)] transition-all duration-300 hover:-translate-y-1.5 text-center w-full h-full"
              >
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-[14px] flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 shadow-md"
                  style={{ backgroundColor: `${blueIcon}12`, color: blueIcon }}
                >
                  <HubIcon id={hubId} size={32} />
                </div>
                {/* Thin hub-colored underline beneath the icon — the one
                    hub-specific cue visible in the card's resting state. */}
                <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: `${accent}50` }} />
                <h3 className="font-sans font-black text-lg md:text-xl text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-[var(--hub-accent)] transition-colors">
                  {hub.title}
                </h3><p className="abh-body text-[0.82rem] line-clamp-2 mb-5">{hub.desc}</p>
                {/* 3 service previews — natural language, subtle, slightly larger than before but never bold */}
                <div className="flex flex-col items-center gap-1 mb-5">
                  {hub.previews.map((hint, i) => (
                    <span key={i} className="text-[0.72rem] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide">
                      {hint}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1.5 text-[0.72rem] font-black lowercase tracking-widest">
                    <span style={{ color: exploreColor }}>explore</span>
                    <PaperPlaneTilt size={13} weight="fill" style={{ color: exploreColor }} />
                  </div>
                  <div className="h-px w-6 rounded-full" style={{ backgroundColor: dividerColor }} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Catchy closing line, right below the hub cards grid */}
        <div className="w-full">
          <ClosingTagline />
        </div>
      </div>

      <HubModal
        hubId={activeHub}
        onClose={() => setActiveHub(null)}
        onSelectService={handleSelectService}
      />

      <AnimatePresence>
        {selectedService && (
          <ServiceDetailModal
            key={selectedService.name}
            svc={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </AnimatePresence>

      {/* Back to Top — left side, so it never collides with the WhatsApp /
          Quote Calculator / Search FAB stack anchored on the right. */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 left-4 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
          showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <ArrowUp size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
      </button>
    </section>
  )
        } 
