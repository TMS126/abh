"use client"

import { useState, useEffect, useMemo, useRef, type ChangeEvent } from "react"
import { useSearchParams } from "next/navigation"
import {
  X, Printer, FileText, PaintBrush, Globe, Desktop,
  Megaphone, MagnifyingGlass,
  Paperclip, CheckCircle, WarningCircle, ShieldCheck,
  ShareNetwork, ArrowUp, Info, Clock,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ } from "@/lib/brand"
import { HUBS, HubId, TURNAROUND, HUB_DISCLAIMERS, TURNAROUND_OVERRIDE } from "@/lib/data"
// ─── Constants ────────────────────────────────────────────────────────────────
const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

const HUB_PREVIEWS: Record<HubId, [string, string, string]> = {
  print:    ["Print Documents", "Copy Pages", "Photo Prints"],
  doc:      ["Build CVs", "Laminate Docs", "Type Letters"],
  design:   ["Design Logos", "Make Flyers", "Social Posts"],
  eservice: ["SASSA Help", "SARS eFiling", "UIF Claims"],
  tech:     ["Install Windows", "Remove Viruses", "Fix Laptops"],
}

// Hubs where the turnaround disclaimer actually applies — load-shedding,
// third-party system downtime, and complex revisions are realistic risks
// for Print (physical queue/equipment), E-Service (SASSA/SARS/PSIRA
// systems), and Design (revision-heavy work).
const DISCLAIMER_RELEVANT_HUBS: HubId[] = ["print", "eservice", "design"]

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

// ─── Lightweight local analytics stub ──────────────────────────────────────
function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("abh:track", { detail: { name, ...payload } }))
  }
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[track]", name, payload)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCldUrl(file: File) {
  return `https://api.cloudinary.com/v1_1/${CLD_CLOUD}/${file.type.startsWith("image/") ? "image" : "raw"}/upload`
}

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

// ─── WCAG contrast helpers ──────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean
  const bigint = parseInt(full, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(hexA: string, hexB: string) {
  const lA = relativeLuminance(hexToRgb(hexA))
  const lB = relativeLuminance(hexToRgb(hexB))
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA]
  return (lighter + 0.05) / (darker + 0.05)
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return "#" + [r, g, b]
    .map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
    .join("")
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0
  const l = (max + min) / 2
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      case bn: h = (rn - gn) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToRgb(h: number, s: number, l: number) {
  const hn = h / 360, sn = s / 100, ln = l / 100
  let r: number, g: number, b: number
  if (sn === 0) {
    r = g = b = ln
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t
      if (tt < 0) tt += 1
      if (tt > 1) tt -= 1
      if (tt < 1 / 6) return p + (q - p) * 6 * tt
      if (tt < 1 / 2) return q
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
      return p
    }
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
    const p = 2 * ln - q
    r = hue2rgb(p, q, hn + 1 / 3)
    g = hue2rgb(p, q, hn)
    b = hue2rgb(p, q, hn - 1 / 3)
  }
  return { r: r * 255, g: g * 255, b: b * 255 }
}

/** Nudges `hex` darker/lighter (preserving hue) until it hits `minRatio` contrast against `bgHex`. */
function ensureAccessible(hex: string, bgHex: string, minRatio = 4.5) {
  if (contrastRatio(hex, bgHex) >= minRatio) return hex
  const hsl = rgbToHsl(hexToRgb(hex))
  const bgLum = relativeLuminance(hexToRgb(bgHex))
  const goingDarker = bgLum > 0.5
  let l = hsl.l
  for (let i = 0; i < 45; i++) {
    l += goingDarker ? -2 : 2
    l = Math.max(0, Math.min(100, l))
    const candidate = rgbToHex(hslToRgb(hsl.h, hsl.s, l))
    if (contrastRatio(candidate, bgHex) >= minRatio) return candidate
    if (l <= 0 || l >= 100) break
  }
  return goingDarker ? "#1a1a1a" : "#fafafa"
}

// ─── Brand loader ─────────────────────────────────────────────────────────────
// Gradient stroke removed (per "remove gradient all over my website") —
// now a plain solid brand-blue stroke, same chase animation.
const ABH_LOADER_PATH =
  "M50,4 C68,4 82,10 90,26 C97,40 96,60 88,74 C80,88 64,96 50,96 " +
  "C34,96 18,90 10,74 C3,60 4,40 12,24 C20,10 34,4 50,4 Z"

function AbhLoader({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0 abh-loader-spin">
      <style>{`
        @keyframes abh-loader-rotate { to { transform: rotate(360deg); } }
        .abh-loader-spin { animation: abh-loader-rotate 2.2s linear infinite; }

        @keyframes abh-loader-dash {
          0%   { stroke-dasharray: 1, 150;  stroke-dashoffset: 0; }
          50%  { stroke-dasharray: 46, 150; stroke-dashoffset: -18; }
          100% { stroke-dasharray: 46, 150; stroke-dashoffset: -63; }
        }
        .abh-loader-dash { animation: abh-loader-dash 1.5s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 100 100" width={size} height={size} className="block" aria-hidden="true">
        <path
          d={ABH_LOADER_PATH}
          fill="none"
          strokeWidth="7"
          pathLength={100}
          className="text-zinc-200 dark:text-zinc-700"
          stroke="currentColor"
        />
        <path
          d={ABH_LOADER_PATH}
          fill="none"
          stroke="#1E6FA8"
          strokeWidth="7"
          strokeLinecap="round"
          pathLength={100}
          className="abh-loader-dash"
        />
      </svg>
    </div>
  )
}

// ─── Searchable service type ──────────────────────────────────────────────────
interface SearchableService {
  hubId: HubId; sectionTitle: string; name: string
  price: string; description: string; requirements: string[]; turnaround?: string
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
          turnaround: (item as any).turnaround,
        })
      })
    })
  })
  return all
}

// ─── Selected service type ────────────────────────────────────────────────────
interface SelectedService {
  name: string; price: string; hubId: HubId
  sectionTitle: string; requirements: string[]; desc?: string; turnaround?: string
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
function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement>) {
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
    onSelect({ name: s.name, price: s.price, hubId: s.hubId, sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description, turnaround: s.turnaround })
    setQuery(""); setFocused(false)
  }

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-md">
      <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Search"
        className="w-full pl-11 pr-10 py-3.5 rounded-[14px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-[#1E6FA8] transition-colors text-center focus:text-left"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600"
        >
          <X size={12} weight="bold" />
        </button>
      )}
      {focused && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150">
          {results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.map((s, idx) => {
                const colors = HUB_COLORS[s.hubId as HubKey]
                const accent = isDark ? colors.accentDark : colors.accentLight
                return (
                  <button
                    key={`${s.hubId}-${s.name}-${idx}`}
                    onClick={() => pick(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
                      <HubIcon id={s.hubId} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">{s.sectionTitle} · {HUBS[s.hubId].title}</p>
                    </div>
                    <span className="text-xs font-black shrink-0" style={{ color: accent }}>{s.price}</span>
                  </button>
                )
              })}
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
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setOpenSectionIdx(0); setDisclaimerOpen(false) }, [hubId])

  useEffect(() => {
    if (!hubId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (disclaimerOpen) { setDisclaimerOpen(false); return }
      onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hubId, onClose, disclaimerOpen])

  useFocusTrap(!!hubId, containerRef)

  if (!hubId) return null
  const hub    = HUBS[hubId]
  const colors = HUB_COLORS[hubId as HubKey]
  const accent      = isDark ? colors.accentDark : colors.accentLight
  const solidAccent = colors.accentLight
  const showDisclaimerTrigger = DISCLAIMER_RELEVANT_HUBS.includes(hubId)

  const activeSection = openSectionIdx !== null ? hub.sections[openSectionIdx] : null
  const activeSectionDesc = (activeSection as any)?.description as string | undefined

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={hub.title}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-250 border border-zinc-100 dark:border-zinc-800 outline-none"
      >

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center" style={{ backgroundColor: `${accent}05` }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[14px] flex items-center justify-center shadow-lg bg-zinc-100 dark:bg-zinc-800" style={{ border: `2px solid ${accent}` }}>
              <HubIcon id={hubId} size={28} color={accent} />
            </div>
            <div>
              <h2 className="abh-card-heading text-xl md:text-2xl">{hub.title}</h2>
              <p className="abh-label mt-0.5" style={{ color: accent }}>{hub.sections.reduce((sum, s) => sum + s.items.length, 0)} Available Services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8">
          <div className="flex flex-wrap justify-center gap-2 mb-5">
            {hub.sections.map((section, sIdx) => {
              const isOpen = openSectionIdx === sIdx
              return (
                <button
                  key={sIdx}
                  onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-tight whitespace-nowrap transition-all duration-200",
                    isOpen ? "text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  )}
                  style={
                    isOpen
                      ? { backgroundColor: solidAccent, boxShadow: `0 10px 24px -6px ${solidAccent}90, 0 4px 10px -2px ${solidAccent}70` }
                      : {}
                  }
                >
                  {section.title}
                </button>
              )
            })}
          </div>

          {/* Dynamic per-section description box — sits directly under the
              pills, swaps content whenever a different pill is active.
              Sourced entirely from section.description in lib/data (no
              fabricated fallback text) — only renders when that field is
              present for the active section. Shadow uses the hub's own
              accent color rather than a flat black blur, so it stays
              visible as an actual shadow in both light AND dark mode
              (a plain black box-shadow nearly disappears against a dark
              card background). */}
          {activeSectionDesc && (
            <div
              key={openSectionIdx}
              className="mb-5 rounded-[12px] p-4 border animate-in fade-in slide-in-from-top-1 duration-200"
              style={{
                borderColor: `${accent}25`,
                backgroundColor: `${accent}08`,
                boxShadow: `0 8px 22px -6px ${accent}45, 0 3px 10px -2px rgba(0,0,0,0.2)`,
              }}
            >
              <p className="text-[0.82rem] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {activeSectionDesc}
              </p>
            </div>
          )}

          {showDisclaimerTrigger && (
            <div className="flex justify-center mb-5">
              <button
                type="button"
                onClick={() => setDisclaimerOpen(true)}
                className="flex items-center gap-1.5 text-[0.7rem] font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline decoration-dotted underline-offset-4"
              >
                <Info size={13} weight="bold" />
                View turnaround disclaimer
              </button>
            </div>
          )}

          {activeSection && (
            <div
              key={`items-${openSectionIdx}`}
              className="rounded-[14px] bg-zinc-50 dark:bg-zinc-900/50 shadow-sm p-3 md:p-4 grid grid-cols-1 gap-2 animate-in fade-in duration-200"
            >
              {activeSection.items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  onClick={() => onSelectService({
                    name: item.name, price: item.price, hubId,
                    sectionTitle: activeSection.title,
                    requirements: item.requirements, desc: item.description,
                    turnaround: (item as any).turnaround,
                  })}
                  className="flex items-center justify-between p-3.5 md:p-4 rounded-[14px] bg-white dark:bg-zinc-900 border border-transparent transition-all"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent" }}
                >
                  <span className="text-[0.84rem] font-black text-zinc-800 dark:text-zinc-200 text-left">{item.name}</span>
                  <span className="text-[0.84rem] font-black shrink-0 ml-3" style={{ color: accent }}>{item.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {disclaimerOpen && (
        <div
          className="fixed inset-0 z-[10250] flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setDisclaimerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[16px] p-6 animate-in zoom-in-95 fade-in duration-150"
            style={{ boxShadow: "0 30px 70px -15px rgba(0,0,0,0.55), 0 12px 30px -10px rgba(0,0,0,0.4)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="font-sans font-black text-sm text-zinc-800 dark:text-zinc-100">Turnaround Disclaimer</h4>
              <button
                onClick={() => setDisclaimerOpen(false)}
                aria-label="Close disclaimer"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {TURNAROUND_DISCLAIMER}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Service Detail Modal ─────────────────────────────────────────────────────
type Tab = "bring" | "about"

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

  useEffect(() => {
    setTab("bring"); setAddedToQuote(false)
    setFile(null); setFileUrl(null)
    setUploadPhase("idle"); setUploadErr(null); setUploadProgress(0)
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null })
    if (fileRef.current) fileRef.current.value = ""
  }, [svc?.name])

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

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

  if (!svc) return null

  const colors  = HUB_COLORS[svc.hubId as HubKey]
  const accent  = isDark ? colors.accentDark : colors.accentLight

  const hubTitle     = HUBS[svc.hubId]?.title || svc.sectionTitle
  const naturalLabel = naturalServiceLabel(svc.name, svc.sectionTitle)
  const acceptHint   = formatAcceptHint(HUB_ACCEPT[svc.hubId])

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

  const requirements = svc.requirements?.length
    ? svc.requirements
    : ["Just bring your file, document or USB — we'll take care of the rest."]

  // FIX: no longer synthesizes a fabricated description when svc.desc is
  // missing — description content now comes from lib/data only, per
  // request. When absent, the About tab shows a plain neutral empty-state
  // message instead (UI chrome, not invented business copy).
  const desc = svc.desc?.trim() || null

  return (
    <div className="fixed inset-0 z-[10200] flex items-end md:items-center justify-center p-0 md:p-4">
      <div
        className="absolute inset-0 bg-black/45 animate-in fade-in duration-120"
        onClick={onClose}
      />
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={svc.name}
        className={cn(
          // Width increased: max-w-sm → max-w-md
          "relative w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col outline-none",
          "rounded-t-[20px] md:rounded-[14px]",
          "animate-in slide-in-from-bottom-2 md:zoom-in-95 fade-in duration-180 ease-out"
        )}
      >
        <div className="md:hidden flex justify-center pt-2.5 pb-0.5 shrink-0">
          <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0 pr-3">
              <span
                className="text-[0.62rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2.5 inline-block"
                style={{ backgroundColor: `${accent}15`, color: accent }}
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
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <ShareNetwork size={16} weight="bold" />
              </button>
              {shareCopied && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap text-[0.62rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-150">
                  Copied!
                </span>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Divider — header row / price */}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          {/* Price + turnaround pill (turnaround comes straight from
              item.turnaround in lib/data — only rendered when present) */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl font-black tracking-tighter" style={{ color: accent }}>{svc.price}</span>
            {svc.turnaround && (
              <span
                className="flex items-center gap-1 text-[0.68rem] font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${accent}12`, color: accent }}
              >
                <Clock size={12} weight="bold" />
                {svc.turnaround}
              </span>
            )}
          </div>

          {/* Divider — price / tabs */}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />

          {/* Tabs */}
          <div className="flex gap-2">
            {(["bring", "about"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-[0.7rem] font-black uppercase tracking-wider transition-all duration-150",
                  tab === t
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                )}
              >
                {t === "bring" ? "Bring" : "Description"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0 border-t border-zinc-100 dark:border-zinc-800">
          {tab === "bring" && (
            <div className="animate-in fade-in duration-150">
              <ol className="space-y-3">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className={cn("shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-black mt-0.5", isDark ? "text-zinc-900" : "text-white")}
                      style={{ backgroundColor: accent }}
                    >
                      {idx + 1}
                    </span>
                    <span className="abh-body text-[0.84rem] pt-0.5">{req}</span>
                  </li>
                ))}
              </ol>
              <p className="abh-muted mt-5">
                Not sure? Don't worry — just WhatsApp us first and we'll guide you step by step.
              </p>
            </div>
          )}
          {tab === "about" && (
            <div className="animate-in fade-in duration-150">
              {desc ? (
                <p className="abh-body text-[0.84rem]">{desc}</p>
              ) : (
                <p className="abh-muted text-[0.84rem]">No description available for this service yet.</p>
              )}
              <p className="abh-muted mt-5">
                Have questions? Switch to the{" "}
                <span className="font-black" style={{ color: accent }}>What to Bring</span> tab or chat with us directly.
              </p>
            </div>
          )}
        </div>

        {/* Footer — upload + Add to Quote + CTA, with dividers between
            each distinct action so the stack doesn't read as one block */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 space-y-4">

          <input
            ref={fileRef}
            type="file"
            accept={HUB_ACCEPT[svc.hubId]}
            onChange={handleFilePick}
            className="hidden"
          />

          {uploadPhase === "idle" && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[14px] font-bold text-sm border-2 border-dashed transition-all active:scale-95 hover:opacity-80"
                style={{ borderColor: `${accent}40`, color: accent }}
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
                  Your file goes directly to ApexbytesHub only — safe, private, and used only for your order. No explicit or inappropriate content allowed.
                </p>
              </div>
            </div>
          )}

          {uploadPhase === "uploading" && (
            <div className="flex items-center gap-3 w-full px-4 py-3 rounded-[14px] text-sm font-bold bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
              <AbhLoader size={28} />
              <span className="font-black tabular-nums shrink-0" style={{ color: accent }}>{uploadProgress}%</span>
              <span className="truncate">Uploading {file?.name}…</span>
            </div>
          )}

          {uploadPhase === "done" && file && (
            <div
              className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-[14px] text-sm font-bold border"
              style={{ borderColor: `${accent}35`, backgroundColor: `${accent}08` }}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="relative shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt=""
                      className="w-9 h-9 rounded-[8px] object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                      <Paperclip size={16} weight="bold" />
                    </div>
                  )}
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950"
                    style={{ backgroundColor: "#22c55e" }}
                  >
                    <CheckCircle size={10} weight="fill" color="#fff" />
                  </span>
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[0.6rem] font-black uppercase tracking-widest text-green-600 dark:text-green-400">Uploaded</span>
                  <span className="truncate text-zinc-700 dark:text-zinc-300 text-[0.8rem]">{file.name}</span>
                </span>
              </span>
              <button type="button" onClick={clearFile} aria-label="Remove file" className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X size={15} weight="bold" />
              </button>
            </div>
          )}

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
                style={{ color: accent }}
              >
                Try a different file
              </button>
            </div>
          )}

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

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
              ? { borderColor: "#22c55e", backgroundColor: "#22c55e10", color: "#16a34a" }
              : { borderColor: `${accent}35`, color: accent, backgroundColor: "transparent" }
            }
          >
            {addedToQuote ? "✓ Added to Quote" : "+ Add to Quote"}
          </button>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* WhatsApp CTA */}
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
      </div>
    </div>
  )
}

// ─── Notice Banner ────────────────────────────────────────────────────────────
function NoticeBanner() {
  return (
    <div className="relative mx-auto w-full max-w-md mb-10 rounded-[14px] border border-[#F4A261]/20 bg-[#F4A261]/5 dark:bg-[#F4A261]/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-9 h-9 rounded-[10px] bg-[#F4A261] flex items-center justify-center shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <span className="abh-eyebrow text-[#D9894B] dark:text-[#F4A261] block mb-1">
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
// Gradients removed per "remove gradient all over my website" — top bar and
// background wash are now flat, solid brand blue at low opacity.
function ClosingTagline() {
  return (
    <div className="relative mt-2 mb-4 overflow-hidden rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-6 py-10 md:py-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#1E6FA8]" />
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Why ApexbytesHub</p>
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
  const [hoveredMainHub,  setHoveredMainHub]  = useState<HubId | null>(null)

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

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const svc = (e as CustomEvent<SelectedService>).detail
      if (svc) handleSelectService(svc)
    }
    window.addEventListener("abh:selectService", handler)
    return () => window.removeEventListener("abh:selectService", handler)
  }, [])

  useEffect(() => {
    const hubParam = searchParams.get("hub")
    if (hubParam && HUB_ORDER.includes(hubParam as HubId)) setActiveHub(hubParam as HubId)
  }, [searchParams])

  useModalBackStack(activeHub, setActiveHub, selectedService, setSelectedService)

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

        <div id="abh-inline-search" className="w-full mb-10 flex justify-center">
          <InlineSearchBar onSelect={handleSelectService} />
        </div>

        <div className="w-full">
          <NoticeBanner />
        </div>

        {/* Hub cards */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-5 md:gap-4 pb-2 w-full">
          {HUB_ORDER.map((hubId) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const isHovered = hoveredMainHub === hubId
            return (
              <button
                key={hubId}
                onClick={() => handleOpenHub(hubId)}
                onMouseEnter={() => setHoveredMainHub(hubId)}
                onMouseLeave={() => setHoveredMainHub(null)}
                className="group flex flex-col items-center p-6 md:p-7 rounded-[14px] border bg-white dark:bg-zinc-950 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 text-center w-full h-full"
                style={{ borderColor: isHovered ? accent : undefined }}
              >
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-[14px] flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-md"
                  style={{ backgroundColor: `${accent}12`, color: accent }}
                >
                  <HubIcon id={hubId} size={32} />
                </div>
                <h3
                  className="font-sans font-black text-lg md:text-xl text-zinc-900 dark:text-zinc-50 mb-2 transition-colors"
                  style={{ color: isHovered ? accent : undefined }}
                >
                  {hub.title}
                </h3>
                <p className="abh-body text-[0.82rem] line-clamp-2 mb-5">{hub.tagline}</p>

                <div className="flex flex-col items-center gap-1 mb-5 px-3 py-2.5 rounded-[10px] bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 w-full">
                  {HUB_PREVIEWS[hubId].map((hint, i) => (
                    <span key={i} className="text-[0.72rem] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">
                      {hint}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex flex-col items-center gap-1.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[0.7rem] font-black lowercase tracking-widest">
                    explore items
                  </span>
                  <div className="h-px w-6 rounded-full" style={{ backgroundColor: `${accent}30` }} />
                </div>
              </button>
            )
          })}
        </div>

        <div className="w-full">
          <ClosingTagline />
        </div>
      </div>

      <HubModal
        hubId={activeHub}
        onClose={() => setActiveHub(null)}
        onSelectService={handleSelectService}
      />
      <ServiceDetailModal
        svc={selectedService}
        onClose={() => setSelectedService(null)}
      />

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
