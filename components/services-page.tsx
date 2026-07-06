"use client"

import { useState, useEffect, useMemo, useRef, useCallback, type ChangeEvent, type TouchEvent as ReactTouchEvent } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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

const HUB_TAGLINES: Record<HubId, string> = {
  print:    "Crisp prints, every time — bring your files, walk out with the real thing.",
  doc:      "From blank page to polished document — typing, printing, laminating, done.",
  design:   "Your brand, brought to life — logos, cards, flyers, and more.",
  eservice: "Government forms, applications & online services — sorted, stress-free.",
  tech:     "Computers acting up? We fix it, clean it, and get you back online.",
}

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

// CR80 card ratio, rendered portrait, enlarged per request.
const CARD_W = 240
const CARD_H = 380

// How far each card's top peeks above the one stacked in front of it.
const CARD_PEEK = 54

// Fixed "personality" per hub — only applies to cards NOT currently at the
// front of the stack, since the front card must always sit perfectly upright.
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
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
      />
      <input
        type="text"
        placeholder="Search services..."
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onFocus={() => setFocused(true)}
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
      />
      {focused && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden z-50">
          {results.map((s, i) => (
            <button
              key={i}
              onClick={() => pick(s)}
              className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors"
            >
              <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{s.name}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.sectionTitle} • {s.price}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Hub Modal — the "first modal" (list of services within a hub) ────────────
// REFACTORED: Removed layoutId shared-element transitions. Now uses plain fade/scale.
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

  const hub         = hubId ? HUBS[hubId] : null
  const colors      = hubId ? HUB_COLORS[hubId as HubKey] : null
  const accent      = hubId && colors ? (isDark ? colors.tagTextDark : colors.tagText) : "#000"
  const solidAccent = colors ? colors.tagText : "#000"

  return (
    <AnimatePresence>
      {hubId && hub && (
        <>
          <motion.div
            key="hub-backdrop"
            className="fixed inset-0 z-[10099] bg-black/60 backdrop-blur-md overscroll-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            key="hub-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-4 md:inset-10 md:mx-auto md:max-w-2xl md:max-h-[85vh] z-[10100] bg-white dark:bg-zinc-950 rounded-[22px] overflow-hidden shadow-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05, duration: 0.25, ease: "easeOut" }}
              className="flex flex-col h-full min-h-0"
            >
              <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0" style={{ backgroundColor: `${accent}05` }}>
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

                {/* Tagline — sits under the category pills, above the services list */}
                <div
                  className="mb-5 rounded-[14px] p-5 flex items-center gap-4 bg-white dark:bg-zinc-900/40"
                  style={{ border: `1.6px solid ${accent}35` }}
                >
                  <div
                    className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accent}12` }}
                  >
                    <HubIcon id={hubId} size={22} color={accent} />
                  </div>
                  <p className="font-sans font-bold text-[0.86rem] leading-snug text-zinc-700 dark:text-zinc-300">
                    {HUB_TAGLINES[hubId]}
                  </p>
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
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Service Detail Modal — the "sub service" modal (e.g. "SASSA Appeal") ────
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
  const hubAccent    = isDark ? colors.tagTextDark : colors.tagText // used ONLY for the icon now
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
    <AnimatePresence>
      {svc && (
        <div className="fixed inset-0 z-[10200] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm overscroll-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-t-[20px] md:rounded-[14px] overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col"
          >
            <div className="px-6 pt-6 pb-0 flex-shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  {/* Only this icon chip carries the hub's dedicated color */}
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800"
                    aria-hidden="true"
                  >
                    <HubIcon id={svc.hubId} size={20} color={hubAccent} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[0.62rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {cleanText(svc.sectionTitle)}
                    </span>
                    <h3 className="abh-card-heading text-[1.05rem] leading-tight">{svc.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 relative">
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share this service"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
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
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <span className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">{svc.price}</span>
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
                        <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-black mt-0.5 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900">
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
                  <p className="abh-body text-[0.84rem] leading-relaxed">{desc}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              {uploadPhase === "idle" && !fileUrl && (
                <label className="block">
                  <input
                    ref={fileRef}
                    type="file"
                    onChange={handleFilePick}
                    accept={HUB_ACCEPT[svc.hubId]}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-3 px-4 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black text-[0.84rem] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Paperclip size={16} weight="bold" />
                    Upload File ({acceptHint})
                  </button>
                </label>
              )}
              {uploadPhase === "uploading" && (
                <div className="w-full">
                  <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-zinc-900 dark:bg-zinc-50"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-2 text-center">{uploadProgress}% uploading...</p>
                </div>
              )}
              {uploadPhase === "done" && fileUrl && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} weight="fill" className="text-green-600 dark:text-green-400 shrink-0" />
                      <span className="text-[0.7rem] font-black uppercase tracking-wider text-green-600 dark:text-green-400">File uploaded</span>
                    </div>
                    <p className="text-[0.72rem] text-zinc-600 dark:text-zinc-400 truncate">{file?.name}</p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X size={16} className="text-zinc-500" />
                  </button>
                </div>
              )}
              {uploadPhase === "error" && (
                <div className="flex items-start gap-3">
                  <WarningCircle size={16} weight="fill" className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.72rem] text-red-600 dark:text-red-400">{uploadErr}</p>
                    <button
                      onClick={() => setUploadPhase("idle")}
                      className="text-[0.7rem] font-black uppercase tracking-wider text-red-600 dark:text-red-400 hover:underline mt-1"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex-shrink-0 flex gap-3">
              <a
                href={`https://wa.me/${BIZ.whatsapp}?text=${encodeURIComponent(waMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-full bg-green-600 dark:bg-green-500 text-white dark:text-zinc-900 font-black text-[0.84rem] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <PaperPlaneTilt size={16} weight="bold" />
                WhatsApp
              </a>
              <a
                href={`mailto:${BIZ.email}?subject=${encodeURIComponent(`${naturalLabel} Request`)}&body=${encodeURIComponent(waMessage)}`}
                className="flex-1 py-3 px-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-black text-[0.84rem] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Megaphone size={16} weight="bold" />
                Email
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Notice Banner ────────────────────────────────────────────────────────────
function NoticeBanner() {
  return (
    <div className="w-full mb-8 rounded-[14px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-4 md:p-5 flex items-start gap-3">
      <ShieldCheck size={20} weight="fill" className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[0.84rem] text-blue-900 dark:text-blue-200">
          <strong>{NOTICE.text}</strong>
          <strong className="text-blue-600 dark:text-blue-300">{NOTICE.date}</strong>
          <strong>{NOTICE.textAfter}</strong>
        </p>
      </div>
    </div>
  )
}

// ─── Closing Tagline ──────────────────────────────────────────────────────────
function ClosingTagline() {
  return (
    <div className="mt-16 text-center">
      <h2 className="abh-page-title mb-3">Ready to get started?</h2>
      <p className="abh-tagline max-w-xl mx-auto">
        Pick a service, upload your files, and we'll handle the rest. Fast, reliable, and hassle-free.
      </p>
      <div className="abh-divider mx-auto" />
    </div>
  )
}

// ─── Main Services Page ────────────────────────────────────────────────────────
export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const searchParams = useSearchParams()

  const [activeHub, setActiveHub] = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
  const [stackOrder, setStackOrder] = useState<HubId[]>(HUB_ORDER)
  const [dragX, setDragX] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current)
    }
  }, [])

  const handleCardTap = useCallback((hubId: HubId) => {
    setStackOrder(prev => [hubId, ...prev.filter(h => h !== hubId)])
    setActiveHub(hubId)
  }, [])

  const handleDesktopCardClick = useCallback((hubId: HubId) => {
    setActiveHub(hubId)
  }, [])

  const handleStackTouchStart = (e: ReactTouchEvent) => {
    if (swipeTimeoutRef.current) {
      clearTimeout(swipeTimeoutRef.current)
      swipeTimeoutRef.current = null
    }
    dragStartXRef.current = e.touches[0].clientX
    isDraggingRef.current = true
    setDragX(0)
  }
  const handleStackTouchMove = (e: ReactTouchEvent) => {
    if (!isDraggingRef.current) return
    setDragX(e.touches[0].clientX - dragStartXRef.current)
  }
  const handleStackTouchEnd = (e: ReactTouchEvent) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    // changedTouches, not touches — the finger has already lifted, so
    // it's no longer in e.touches by the time touchend/touchcancel fires.
    const touch = e.changedTouches[0]
    const finalDragX = touch ? touch.clientX - dragStartXRef.current : 0
    const SWIPE_THRESHOLD = 80
    const TAP_THRESHOLD   = 10

    if (Math.abs(finalDragX) > SWIPE_THRESHOLD) {
      const flingTo = finalDragX > 0 ? 520 : -520
      setDragX(flingTo)
      swipeTimeoutRef.current = setTimeout(() => {
        setStackOrder(prev => [...prev.slice(1), prev[0]])
        setDragX(0)
        swipeTimeoutRef.current = null
      }, 220)
    } else if (Math.abs(finalDragX) < TAP_THRESHOLD) {
      setDragX(0)
      handleCardTap(stackOrder[0])
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
    if (hubParam && HUB_ORDER.includes(hubParam as HubId)) {
      setSelectedService(null)
      setActiveHub(hubParam as HubId)
    }
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
                onClick={() => handleDesktopCardClick(hubId)}
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

        {/* Hub cards (mobile) — enlarged CR80-portrait stack, front card always upright */}
        <div className="md:hidden w-full flex flex-col items-center pb-2">
          <div
            className="relative w-full flex justify-center"
            style={{ height: CARD_H + CARD_PEEK * (stackOrder.length - 1) }}
          >
            {stackOrder.map((hubId, index) => {
              // REFACTORED: Keep card mounted always, just hide it visually when modal is open.
              // This prevents the unmount/remount race that causes hit-test desync.
              const isHiddenByModal = activeHub === hubId

              const hub     = HUBS[hubId]
              const isFront = index === 0
              const accent  = hubAccentColor(hubId, isDark)
              const p       = CARD_PERSONALITY[hubId]

              const baseY = -index * CARD_PEEK
              const scale = isFront ? 1 : Math.max(0.9, 1 - index * 0.02)
              const brightness = isFront ? 1 : Math.max(0.88, 1 - index * 0.035)

              // Front card is always perfectly upright and centered —
              // only drag offsets it. Back cards keep their fixed tilt/jitter.
              const jitterX = isFront ? dragX : p.xJitter
              const rotate  = isFront ? dragX / 14 : p.rot

              return (
                <motion.div
                  key={hubId}
                  onTouchStart={isFront ? handleStackTouchStart : undefined}
                  onTouchMove={isFront ? handleStackTouchMove : undefined}
                  onTouchEnd={isFront ? handleStackTouchEnd : undefined}
                  onTouchCancel={isFront ? handleStackTouchEnd : undefined}
                  onClick={!isFront ? () => handleCardTap(hubId) : undefined}
                  animate={{ opacity: isHiddenByModal ? 0 : 1 }}
                  className={cn(
                    "absolute bottom-0 rounded-[18px] bg-white dark:bg-zinc-950 p-6 flex flex-col items-center text-center touch-none select-none",
                    isFront && "cursor-grab active:cursor-grabbing"
                  )}
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    left: "50%",
                    marginLeft: -CARD_W / 2,
                    zIndex: 50 - index * 10,
                    border: `1.5px solid ${accent}`,
                    x: jitterX, y: baseY, rotate, scale,
                    filter: `brightness(${brightness})`,
                    pointerEvents: isHiddenByModal ? "none" : "auto",
                    boxShadow: isFront
                      ? "0 20px 40px rgba(0,0,0,0.20)"
                      : `0 ${10 + index * 6}px ${20 + index * 10}px rgba(0,0,0,${0.14 + index * 0.03})`,
                  }}
                  transition={isDraggingRef.current ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 300 }}
                >
                  {/* Name peeks above the front card so back cards stay identifiable */}
                  {!isFront && (
                    <div className="absolute top-3 inset-x-0 flex items-center justify-center px-4">
                      <span
                        className="text-[0.72rem] font-black uppercase tracking-wider truncate"
                        style={{ color: accent }}
                      >
                        {hub.title}
                      </span>
                    </div>
                  )}

                  <div
                    className="w-16 h-16 rounded-[16px] flex items-center justify-center mb-5 shadow-md shrink-0 mt-6"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                  >
                    <HubIcon id={hubId} size={34} />
                  </div>

                  <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 mb-3">
                    {hub.title}
                  </h3>

                  <p className="abh-body text-[0.86rem] leading-relaxed">{hub.desc}</p>
                </motion.div>
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

        <HubModal
          hubId={activeHub}
          onClose={() => setActiveHub(null)}
          onSelectService={setSelectedService}
        />
      </div>

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
