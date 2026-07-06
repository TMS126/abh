"use client"

import { useState, useEffect, useMemo, useRef, useCallback, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react"
import { useSearchParams } from "next/navigation"
import {
  X, Printer, FileText, PaintBrush, Globe, Desktop,
  PaperPlaneTilt, Megaphone, MagnifyingGlass,
  Paperclip, CheckCircle, WarningCircle, ShieldCheck,
  ShareNetwork, ArrowUp,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, BRAND } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"

// ─── Constants ────────────────────────────────────────────────────────────────
const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

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

// CR80 card ratio (85.60mm × 53.98mm), rendered portrait — height/width ≈ 1.586
const CARD_W = 208
const CARD_H = 330 // 208 × 1.586, rounded

// How far each card's top peeks above the one stacked in front of it.
// Also doubles as the minimum comfortable tap target for revealing a hidden card.
const CARD_PEEK = 42

// Fixed "personality" per hub — a small rotation + horizontal jitter that
// travels with the hub's identity (not its stack position), so the pile
// looks genuinely messy/hand-tossed rather than mechanically fanned, and
// stays visually consistent as cards cycle to the front via swipe/tap.
const CARD_PERSONALITY: Record<HubId, { rot: number; xJitter: number }> = {
  print:    { rot: -5, xJitter: 4  },
  doc:      { rot: 4,  xJitter: -7 },
  design:   { rot: -3, xJitter: 9  },
  eservice: { rot: 6,  xJitter: -4 },
  tech:     { rot: -7, xJitter: 2  },
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

// Dedicated per-hub color used for the mobile stacked-card border/icon chip —
// uses the stronger `primary` shade in light mode and the softer `light`
// shade in dark mode, so each hub reads as a distinct color at a glance.
function hubAccentColor(hubId: HubId, isDark: boolean) {
  const c = HUB_COLORS[hubId as HubKey]
  return isDark ? c.light : c.primary
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
        <defs>
          <linearGradient id="abh-loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#1E6FA8" />
            <stop offset="50%"  stopColor="#6FBF1A" />
            <stop offset="100%" stopColor="#F4A261" />
          </linearGradient>
        </defs>
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
          stroke="url(#abh-loader-grad)"
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

// ─── Inline search bar ────────────────────────────────────────────────────────
function InlineSearchBar({ onSelect }: { onSelect: (svc: SelectedService) => void }) {
  const { resolvedTheme } = useTheme()
  const isDark    = resolvedTheme === "dark"
  const [query,   setQuery]   = useState("")
  const [focused, setFocused] = useState(false)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const index     = useMemo(buildSearchIndex, [])

  const fillColor  = BRAND.green
  const hoverColor = BRAND.greenDeep

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
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none"
      />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Search"
        className="w-full pl-11 pr-10 py-4 rounded-[14px] font-sans font-black text-base text-white placeholder:text-white/70 shadow-lg transition-all duration-300 outline-none text-center focus:text-left focus:scale-[0.99]"
        style={{ backgroundColor: fillColor }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = hoverColor }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = fillColor }}
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
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
                const accent = isDark ? colors.tagTextDark : colors.tagText
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

  useEffect(() => { setOpenSectionIdx(0) }, [hubId])

  useEffect(() => {
    if (!hubId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hubId, onClose])

  if (!hubId) return null
  const hub         = HUBS[hubId]
  const colors      = HUB_COLORS[hubId as HubKey]
  const accent      = isDark ? colors.tagTextDark : colors.tagText
  const solidAccent = colors.tagText

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md overscroll-contain" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-zinc-800">

        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center" style={{ backgroundColor: `${accent}05` }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[14px] flex items-center justify-center shadow-lg bg-zinc-100 dark:bg-zinc-800" style={{ border: `2px solid ${accent}` }}>
              <HubIcon id={hubId} size={28} color={accent} />
            </div>
            <div>
              <h2 className="abh-card-heading text-xl md:text-2xl">{hub.title}</h2>
              <p className="abh-label mt-0.5">{hub.sections.reduce((sum, s) => sum + s.items.length, 0)} Available Services</p>
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

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8">
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
                  <span className="text-[0.84rem] font-black shrink-0 ml-3" style={{ color: accent }}>{item.price}</span>
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

const REMOTE_HUBS: HubId[] = ["design", "eservice"]
function isRemoteHub(hubId: HubId) {
  return REMOTE_HUBS.includes(hubId)
}

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
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTab("bring")
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

  const colors       = HUB_COLORS[svc.hubId as HubKey]
  const accent       = isDark ? colors.tagTextDark : colors.tagText
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
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm overscroll-contain" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[14px] overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 animate-in zoom-in-95 duration-300 border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col">

        <div className="px-6 pt-6 pb-0 flex-shrink-0">
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
                <span className="absolute -bottom-8 right-0 whitespace-nowrap text-[0.62rem] font-black uppercase tracking-widest text-white bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 px-2.5 py-1 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  Copied!
                </span>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
                style={{ backgroundColor: `${accent}15`, color: accent }}
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          </div>

          <div className="mb-5">
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
                {t === "bring" ? bringLabel : "Description"}
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
            <div className="animate-in fade-in slide-in-from-right-2 duration-200">
              <p className="abh-body text-[0.84rem]">{desc}</p>
              <p className="abh-muted mt-5">
                Have questions? Switch to the{" "}
                <span className="font-black" style={{ color: accent }}>{bringLabel}</span> tab or chat with us directly.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 space-y-3">

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
                  Your file goes directly to Apexbytes Hub only — safe, private, and used only for your order. No explicit or inappropriate content allowed.
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

          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
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
function ClosingTagline() {
  return (
    <div className="relative mt-2 mb-4 overflow-hidden rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-[#1E6FA8]/5 via-white to-[#6FBF1A]/5 dark:from-[#1E6FA8]/10 dark:via-zinc-950 dark:to-[#6FBF1A]/10 px-6 py-10 md:py-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1E6FA8] via-[#6FBF1A] to-[#F4A261]" />
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

  // ── Mobile stacked hub cards — order[0] is always the front card ──
  const [stackOrder, setStackOrder] = useState<HubId[]>(HUB_ORDER)
  const [dragX,       setDragX]     = useState(0)
  const [isDragging,  setIsDragging] = useState(false)
  const dragStartX = useRef(0)

  const handleCardTap = useCallback((hubId: HubId) => {
    setStackOrder(prev => [hubId, ...prev.filter(h => h !== hubId)])
    setActiveHub(hubId)
  }, [])

  const handleStackPointerDown = (e: ReactPointerEvent) => {
    dragStartX.current = e.clientX
    setIsDragging(true)
  }
  const handleStackPointerMove = (e: ReactPointerEvent) => {
    if (!isDragging) return
    setDragX(e.clientX - dragStartX.current)
  }
  const handleStackPointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    const SWIPE_THRESHOLD = 80
    const TAP_THRESHOLD   = 6
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const flingTo = dragX > 0 ? 520 : -520
      setDragX(flingTo)
      setTimeout(() => {
        setStackOrder(prev => [...prev.slice(1), prev[0]])
        setDragX(0)
      }, 220)
    } else if (Math.abs(dragX) < TAP_THRESHOLD) {
      handleCardTap(stackOrder[0])
      setDragX(0)
    } else {
      setDragX(0)
    }
  }

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const svc = (e as CustomEvent<SelectedService>).detail
      if (svc) setSelectedService(svc)
    }
    window.addEventListener("abh:selectService", handler)
    return () => window.removeEventListener("abh:selectService", handler)
  }, [setSelectedService])

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

        <div className="pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center w-full">
          <h1 className="abh-page-title mb-3">Our Service Hubs</h1>
          <p className="abh-tagline max-w-xl mx-auto">
            Explore our ecosystem. Tap a hub to view all available services and instant pricing.
          </p>
          <div className="abh-divider mx-auto" />
        </div>

        <div id="abh-inline-search" className="w-full mb-10 flex justify-center">
          <InlineSearchBar onSelect={setSelectedService} />
        </div>

        <div className="w-full">
          <NoticeBanner />
        </div>

        {/* Hub cards (desktop) — unchanged grid layout, hidden below md breakpoint */}
        <div className="hidden md:grid md:grid-cols-5 gap-5 md:gap-4 pb-2 w-full">
          {HUB_ORDER.map((hubId) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.tagTextDark : colors.tagText
            const cardBg = isDark ? "#09090b" : "#ffffff"
            const exploreColor = ensureAccessible(accent, cardBg, 4.5)
            return (
              <button
                key={hubId}
                onClick={() => setActiveHub(hubId)}
                className="group flex flex-col items-center p-6 md:p-7 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 text-center w-full h-full"
              >
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-[14px] flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-md"
                  style={{ backgroundColor: `${accent}12`, color: accent }}
                >
                  <HubIcon id={hubId} size={32} />
                </div>
                <h3 className="font-sans font-black text-lg md:text-xl text-zinc-900 dark:text-zinc-50 mb-2 group-hover:text-[#1E6FA8] dark:group-hover:text-[#A9D6F2] transition-colors">
                  {hub.title}
                </h3>
                <p className="abh-body text-[0.82rem] line-clamp-2 mb-5">{hub.desc}</p>
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
                  <div className="h-px w-6 rounded-full" style={{ backgroundColor: `${accent}30` }} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Hub cards (mobile) — CR80-portrait stack, overlapping at the top, bottoms aligned */}
        <div className="md:hidden w-full flex flex-col items-center pb-2">
          <div
            className="relative w-full flex justify-center"
            style={{ height: CARD_H + CARD_PEEK * (stackOrder.length - 1) }}
          >
            {stackOrder.map((hubId, index) => {
              const hub      = HUBS[hubId]
              const isFront  = index === 0
              const accent   = hubAccentColor(hubId, isDark)
              const p        = CARD_PERSONALITY[hubId]

              // Bottoms stay aligned; each card further back sits higher, so its
              // top edge peeks out above the card stacked in front of it.
              const baseY = -index * CARD_PEEK
              const liveX = isFront ? dragX : 0
              const liveR = isFront ? p.rot + dragX / 14 : p.rot

              return (
                <div
                  key={hubId}
                  onPointerDown={isFront ? handleStackPointerDown : undefined}
                  onPointerMove={isFront ? handleStackPointerMove : undefined}
                  onPointerUp={isFront ? handleStackPointerUp : undefined}
                  onPointerCancel={isFront ? handleStackPointerUp : undefined}
                  onClick={!isFront ? () => handleCardTap(hubId) : undefined}
                  className={cn(
                    "absolute bottom-0 left-1/2 rounded-[16px] bg-white dark:bg-zinc-950 p-5 flex flex-col touch-none select-none shadow-[0_14px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.6)]",
                    isFront && !isDragging && "transition-transform duration-300 ease-out",
                    isFront && "cursor-grab active:cursor-grabbing"
                  )}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    zIndex: 50 - index * 10,
                    border: `2.5px solid ${accent}`,
                    transform: `translateX(calc(-50% + ${p.xJitter + liveX}px)) translateY(${baseY}px) rotate(${liveR}deg)`,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-4 shadow-md shrink-0"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                  >
                    <HubIcon id={hubId} size={32} />
                  </div>

                  <h3 className="font-sans font-black text-lg text-zinc-900 dark:text-zinc-50 mb-2">
                    {hub.title}
                  </h3>

                  <p className="abh-body text-[0.78rem] line-clamp-3">{hub.desc}</p>

                  <div className="mt-3 flex flex-col gap-1">
                    {hub.previews.map((hint, i) => (
                      <span key={i} className="text-[0.68rem] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide">
                        {hint}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 flex items-center gap-1.5 text-[0.68rem] font-black lowercase tracking-widest">
                    <span style={{ color: accent }}>explore</span>
                    <PaperPlaneTilt size={12} weight="fill" style={{ color: accent }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-center text-[0.68rem] font-black uppercase tracking-widest text-zinc-400 mt-4">
            Swipe or tap a card to explore
          </p>
        </div>

        <div className="w-full">
          <ClosingTagline />
        </div>
      </div>

      <HubModal
        hubId={activeHub}
        onClose={() => setActiveHub(null)}
        onSelectService={setSelectedService}
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
