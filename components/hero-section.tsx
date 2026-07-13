"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  PlusCircle,
  Gear,
  Wrench,
  Printer,
  FileText,
  PaintBrush,
  Globe,
  Desktop,
} from "@phosphor-icons/react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, MARQUEE_ITEMS, HUB_COLORS } from "@/lib/brand"

// ─── Contrast-nudging helpers ─────────────────────────────────────────────────
// Same technique used elsewhere in the app (e.g. the Services page's
// "explore" label): preserves the hub's own hue rather than swapping to
// plain black/white, but nudges lightness up or down only as far as needed
// to clear a contrast threshold against a given neutral surface.
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
  return "#" + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")
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
    r = hue2rgb(p, q, hn + 1 / 3); g = hue2rgb(p, q, hn); b = hue2rgb(p, q, hn - 1 / 3)
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

// ─── Hub data ─────────────────────────────────────────────────────────────────
const HUBS_DATA = [
  {
    id: "print",
    name: "Print Hub",
    icon: (active: boolean) => (
      <Printer size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Printer,
    colorLight: BRAND.blueDark,   // Deep/Dark Base — #0F3F66
    colorDark:  BRAND.blue,       // Bright Accent  — #1E6FA8
    services: [
      { name: "B&W Print",        price: "R5"  },
      { name: "Colour Print",     price: "R8"  },
      { name: "B&W Copy",         price: "R3"  },
      { name: "Colour Copy",      price: "R5"  },
      { name: "Photo 4x6 Glossy", price: "R20" },
      { name: "Photo A4 Glossy",  price: "R40" },
    ],
  },
  {
    id: "doc",
    name: "Docu Hub",
    icon: (active: boolean) => (
      <FileText size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: FileText,
    colorLight: BRAND.greenDeep,
    colorDark:  BRAND.greenDeep,
    services: [
      { name: "CV from Scratch",    price: "R30" },
      { name: "CV Upgrade",         price: "R40" },
      { name: "Cover Letter",       price: "R30" },
      { name: "Affidavit / Letter", price: "R20" },
      { name: "Scanning (per page)", price: "R5" },
      { name: "Laminating A4",      price: "R15" },
    ],
  },
  {
    id: "design",
    name: "Design Hub",
    icon: (active: boolean) => (
      <PaintBrush size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: PaintBrush,
    colorLight: BRAND.orangeBrown,
    colorDark:  BRAND.orangeBrown,
    services: [
      { name: "Logo (Basic)",       price: "R300" },
      { name: "Logo (Standard)",    price: "R500" },
      { name: "Business Card",      price: "R120" },
      { name: "Flyer (Custom)",     price: "R250" },
      { name: "Social Media Post",  price: "R80"  },
      { name: "Invitation (Image)", price: "R150" },
    ],
  },
  {
    id: "eservice",
    name: "E-Service Hub",
    icon: (active: boolean) => (
      <Globe size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Globe,
    colorLight: BRAND.blueMid,
    colorDark:  BRAND.lightBlue,
    services: [
      { name: "SASSA Status Check",         price: "R20"  },
      { name: "SASSA SRD Application",      price: "R40"  },
      { name: "SASSA Grant Application",    price: "R80"  },
      { name: "SARS New Taxpayer / eFiling", price: "R70" },
      { name: "NSFAS Application",          price: "R80"  },
      { name: "UIF Claims",                 price: "R200" },
    ],
  },
  {
    id: "tech",
    name: "Tech Hub",
    icon: (active: boolean) => (
      <Desktop size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Desktop,
    colorLight: BRAND.dark100,
    colorDark:  "#B8CCE0",
    services: [
      { name: "Software Install",              price: "R80"  },
      { name: "PC Setup",                      price: "R250" },
      { name: "Virus Removal",                 price: "R200" },
      { name: "Windows Install + Activation",  price: "R350" },
      { name: "Microsoft 365 Setup",           price: "R150" },
      { name: "Troubleshooting (per hr)",      price: "R150" },
    ],
  },
]

function pickRandomService(hubIndex: number, excludeName?: string) {
  const list = HUBS_DATA[hubIndex].services
  if (list.length === 1) return list[0]
  let next = list[Math.floor(Math.random() * list.length)]
  let attempts = 0
  while (next.name === excludeName && attempts < 5) {
    next = list[Math.floor(Math.random() * list.length)]
    attempts++
  }
  return next
}

// ─── Watermark crossfade layer type ───────────────────────────────────────────
type WatermarkLayer = { key: string; Icon: React.ElementType; color: string }

// ─── Hero Section ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted,           setMounted]           = useState(false)
  const [activeHub,         setActiveHub]         = useState<number>(0)
  const [marqueePaused,     setMarqueePaused]     = useState(false)
  const [spotlightService,  setSpotlightService]  = useState(() => pickRandomService(0))
  const [hoveredHub,        setHoveredHub]        = useState<number | null>(null)
  const [canHover,          setCanHover]          = useState(false)

  const ctaBtnRef      = useRef<HTMLButtonElement>(null)

  React.useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setCanHover(mq.matches)
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const isDark    = mounted && resolvedTheme === "dark"
  const active    = HUBS_DATA[activeHub]
  const WatermarkIcon = active.Icon

  const CTA_COLOR      = isDark ? BRAND.techGreyDark : BRAND.dark100
  const CTA_FILL_COLOR = BRAND.dark100

  // ── Ecosystem box color model ─────────────────────────────────────────
  const cardText      = "#FFFFFF"
  const cardTextSoft  = "rgba(255,255,255,0.82)"
  const cardTextMuted = "rgba(255,255,255,0.55)"

  // Neutral surface for the spotlight card — plain white / zinc-900,
  // regardless of hub. Only the hub NAME label is tinted with the hub's
  // own color, nudged (hue preserved) for contrast against this exact
  // surface — that's the "clever plan": a light hub hue against the white
  // light-mode card, or a dark hub hue against the near-black dark-mode
  // card, gets auto-corrected; anything that already contrasts fine is
  // left untouched.
  const neutralCardBgHex = isDark ? "#18181b" : "#ffffff"
  const hubColor  = isDark ? active.colorDark : active.colorLight
  const nameColor = ensureAccessible(hubColor, neutralCardBgHex, 4.5)

  // Watermark crossfade state — fixed to brand blue (matches the
  // "blue dominant" rule), doesn't swap color per hub.
  const [watermarkLayers, setWatermarkLayers] = useState<WatermarkLayer[]>([])
  const [visibleKey,       setVisibleKey]      = useState<string | null>(null)
  const pruneTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const newKey = `${active.id}`
    setWatermarkLayers(prev => (prev.some(l => l.key === newKey) ? prev : [...prev, { key: newKey, Icon: WatermarkIcon, color: BRAND.blue }]))

    const raf = requestAnimationFrame(() => setVisibleKey(newKey))
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.id])

  useEffect(() => {
    if (watermarkLayers.length <= 1) return
    if (pruneTimeoutRef.current) clearTimeout(pruneTimeoutRef.current)
    pruneTimeoutRef.current = setTimeout(() => {
      setWatermarkLayers(prev => prev.filter(l => l.key === visibleKey))
    }, 750)
    return () => { if (pruneTimeoutRef.current) clearTimeout(pruneTimeoutRef.current) }
  }, [watermarkLayers, visibleKey])

  const handleNavigate = (path: string) => router.push(path)

  const handleSelectHub = (index: number) => {
    setActiveHub(index)
    setSpotlightService(pickRandomService(index))
    const hub = HUBS_DATA[index]
    window.dispatchEvent(
      new CustomEvent("abh:heroHubSelect", { detail: { light: hub.colorLight, dark: hub.colorDark } })
    )
  }

  const handleReroll = () => {
    setSpotlightService(prev => pickRandomService(activeHub, prev.name))
  }

  const handleCtaClick = () => {
    handleNavigate("/services")
  }

 return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+56px)] md:pt-[104px] pb-10 md:pb-16 overflow-hidden cursor-default select-none bg-background transition-colors duration-300"
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[140vw] md:w-[90vw] max-w-[1400px] aspect-[16/10] opacity-[0.14] dark:opacity-[0.18] blur-3xl"
          style={{
            backgroundColor: BRAND.blue,
            animation: "abh-blob-morph 18s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes abh-blob-morph {
          0%   { border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%; }
          25%  { border-radius: 60% 40% 35% 65% / 55% 65% 35% 45%; }
          50%  { border-radius: 35% 65% 50% 50% / 60% 35% 65% 40%; }
          75%  { border-radius: 65% 35% 45% 55% / 40% 55% 45% 60%; }
          100% { border-radius: 42% 58% 65% 35% / 45% 40% 60% 55%; }
        }

        @keyframes abh-cta-glow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.95); }
          50%      { opacity: 0.6;  transform: scale(1.15); }
        }
        .abh-cta-glow { animation: abh-cta-glow-pulse 3s ease-in-out infinite; }

        @keyframes abh-taskbar-indicator-in {
          0%   { width: 0px;  opacity: 0; }
          100% { width: 22px; opacity: 1; }
        }
        .abh-taskbar-indicator {
          animation: abh-taskbar-indicator-in 220ms ease-out forwards;
        }
      `}</style>

      <div className="max-w-[1240px] mx-auto flex flex-col items-center relative z-10 w-full mb-6">

        <div className="w-full max-w-[840px] mx-auto flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-[4.6rem] tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.08] mb-4 text-balance transition-colors duration-300">
              {BIZ.tagline}
            </h1>
            <p className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400 max-w-[480px] md:max-w-none mx-auto md:mx-0 leading-relaxed">
              From printing your documents to navigating government services — we make it simple, fast, and friendly.
            </p>
          </div>
          <div className="hidden md:block shrink-0 relative w-[260px] h-[190px] rounded-[20px] overflow-hidden shadow-xl border border-black/5 dark:border-white/10">
            <Image
              src="/storefront.webp"
              alt="ApexbytesHub storefront"
              fill
              sizes="260px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="relative w-full flex justify-center items-center mb-8">

          <div
            aria-hidden="true"
            className="absolute inset-y-0 -right-[18%] md:-right-[10%] flex items-center justify-center pointer-events-none select-none z-0"
          >
            {watermarkLayers.map((layer) => {
              const LayerIcon = layer.Icon
              const isVisible = layer.key === visibleKey
              return (
                <div
                  key={layer.key}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-out",
                    isVisible ? "opacity-[0.14] dark:opacity-[0.18]" : "opacity-0"
                  )}
                  style={{ color: layer.color }}
                >
                  <LayerIcon
                    size={520}
                    weight="fill"
                    aria-hidden="true"
                    style={{ transform: "rotate(-16deg)" }}
                    className="shrink-0 md:w-[620px] md:h-[620px]"
                  />
                </div>
              )
            })}
          </div>

          <div
            aria-hidden="true"
            className="absolute w-[220px] h-[80px] rounded-full blur-2xl pointer-events-none abh-cta-glow"
            style={{ backgroundColor: CTA_COLOR }}
          />

          <button
            ref={ctaBtnRef}
            onClick={handleCtaClick}
            className="group relative z-30 inline-flex items-center gap-3 px-10 py-5 rounded-[14px] font-sans font-black text-lg overflow-hidden border-2 transition-all duration-150 active:duration-75 touch-manipulation hover:-translate-y-1 active:translate-y-0 active:scale-[0.94] shadow-md hover:shadow-xl active:shadow-sm animate-in fade-in duration-500"
            style={{ borderColor: CTA_COLOR, color: CTA_COLOR }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-150 ease-out group-hover:scale-y-100 group-active:scale-y-100"
              style={{ backgroundColor: CTA_FILL_COLOR }}
            />
            <span
              className="relative z-10"
              style={{ color: "inherit" }}
            >
              <span className="group-hover:text-white group-active:text-white transition-colors duration-150">
                Start Here
              </span>
            </span>
            <ArrowRight
              weight="bold"
              className="relative z-10 w-6 h-6 transition-transform duration-150 group-hover:translate-x-1.5 group-hover:text-white group-active:text-white"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Core Hub Ecosystem — background is now the storefront photo
            itself (opacity nudged down slightly, plus a dark overlay for
            contrast) instead of flat brand blue, with a deep, dramatic
            drop shadow to make the box stand out from the page. Content
            wrapped in its own z-10 layer since the image/overlay need to
            sit behind it, not just be a plain background-color. */}
        <div
          className="relative w-full max-w-[840px] mx-auto rounded-[14px] overflow-hidden"
          style={{
            boxShadow:
              "0 55px 110px -25px rgba(0,0,0,0.6), " +
              "0 30px 65px -30px rgba(0,0,0,0.7), " +
              `0 0 90px -20px ${BRAND.blue}60`,
          }}
        >
          {/* Background photo + dark overlay */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <Image
              src="/storefront.webp"
              alt=""
              fill
              sizes="840px"
              className="object-cover opacity-90"
            />
            {/* Dark scrim — image opacity alone isn't enough to keep the
                white text/icons above reliably readable across the whole
                photo, so this adds the contrast back in. */}
            <div className="absolute inset-0 bg-black/45" />
          </div>

          <div className="relative z-10 w-full flex flex-col items-center px-6 sm:px-10 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-14">

            <div className="w-full flex flex-col items-center mb-5">
              <h2
                className="abh-section-heading mb-2 text-center"
                style={{ color: cardText }}
              >
                Core Hub Ecosystem
              </h2>
              <p
                className="text-sm font-medium text-center"
                style={{ color: cardTextSoft }}
              >
                Tap a hub to see what we actually do there.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Service hubs"
              className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 w-full max-w-[420px] mb-6 px-1"
            >
              {HUBS_DATA.map((hub, index) => {
                const isActive  = activeHub === index
                const isHovered = hoveredHub === index

                return (
                  <button
                    key={hub.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={hub.name}
                    onClick={() => handleSelectHub(index)}
                    onMouseEnter={() => setHoveredHub(index)}
                    onMouseLeave={() => setHoveredHub(null)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1.5 px-4 sm:px-5 pt-4 pb-2.5 rounded-[14px] transition-all duration-200 flex-1 min-w-[56px]",
                      isActive && "shadow-md"
                    )}
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.18)"
                        : (isHovered ? "rgba(255,255,255,0.08)" : "transparent"),
                    }}
                  >
                    <span
                      className="transition-all duration-200 flex"
                      style={{
                        color: cardText,
                        opacity: isActive ? 1 : (isHovered ? 0.85 : 0.45),
                        transform: isActive ? "translateY(-1px) scale(1.08)" : "none",
                      }}
                    >
                      {hub.icon(isActive)}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn("block h-[3px] rounded-full", isActive && "abh-taskbar-indicator")}
                      style={{
                        width: isActive ? 22 : 0,
                        backgroundColor: cardText,
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                  </button>
                )
              })}
            </div>

            <div
              className="relative w-full max-w-[420px] h-px mt-1 mb-7"
              style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
            >
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderTop: "9px solid rgba(255,255,255,0.85)",
                }}
                aria-hidden="true"
              />
            </div>

            {/* Spotlight card — now a plain NEUTRAL surface (white /
                zinc-900), same for every hub, so it stays legible sitting
                on top of the busy photo behind it. Only the hub NAME
                label is tinted with that hub's own color via nameColor
                (contrast-nudged above); service name and price stay
                ordinary neutral text. */}
            <div className="w-full max-w-[420px] flex flex-col items-center text-center">
              <div className="relative flex flex-col items-center gap-2 rounded-[16px] px-6 py-5 mb-4 bg-white dark:bg-zinc-900 shadow-lg transition-colors duration-200">
                <p
                  className="text-[0.65rem] font-black uppercase tracking-widest"
                  style={{ color: nameColor }}
                >
                  {active.name}
                </p>

                <button
                  key={`${activeHub}-${spotlightService.name}`}
                  onClick={handleReroll}
                  aria-label="Show another example price for this hub"
                  className="flex flex-col items-center gap-1 rounded-[10px] px-2 py-1 transition-opacity hover:opacity-80 active:scale-[0.97] animate-in fade-in duration-200"
                >
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {spotlightService.name}
                  </span>
                  <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-50">
                    {spotlightService.price}
                  </span>
                </button>
              </div>

              <button
                onClick={() => handleNavigate(`/services?hub=${active.id}`)}
                className="flex items-center justify-center gap-1.5 text-[0.65rem] font-black tracking-wide transition-opacity hover:opacity-70"
                style={{ color: cardText }}
              >
                View All {active.name} Services
                <ArrowRight weight="bold" className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>

            <div
              role="marquee"
              aria-label="Our services"
              onMouseEnter={() => setMarqueePaused(true)}
              onMouseLeave={() => setMarqueePaused(false)}
              onTouchStart={(e) => { e.stopPropagation(); setMarqueePaused(p => !p) }}
              className="relative w-full mt-8 py-4 overflow-hidden select-none group/marquee"
            >
              <div
                className="flex whitespace-nowrap w-max animate-marquee"
                style={{ animationPlayState: marqueePaused ? "paused" : "running" }}
              >
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center shrink-0">
                    {MARQUEE_ITEMS.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <span className="inline-flex items-center px-5 font-semibold text-sm transition-opacity duration-300 group-hover/marquee:opacity-70 hover:!opacity-100" style={{ color: cardTextSoft }}>
                          {item}
                        </span>
                        <span className="font-black text-base leading-none shrink-0" style={{ color: cardText }} aria-hidden="true">•</span>
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
export function StatsBar() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const stats = [
    { icon: PlusCircle, color: BRAND.blue,   value: BIZ.hubCount,    label: "Hubs"        },
    { icon: Gear,       color: BRAND.green,  value: BIZ.serviceCount, label: "Services"   },
    { icon: Wrench,     color: BRAND.orange, value: "Fast",           label: "Turnaround" },
  ]

  return (
    <section aria-label="Key stats" className="px-4 md:px-8 py-8 md:py-10 transition-colors duration-300">
      <div
        className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[560px] mx-auto"
        role="list"
        aria-label="Key stats"
      >
        {stats.map((stat, i) => {
          const isHov  = hoveredCard === i
          const Icon   = stat.icon
          return (
            <div
              key={stat.label}
              role="listitem"
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setHoveredCard(isHov ? null : i)}
              aria-label={`${stat.value} ${stat.label}`}
              className="flex flex-col items-center justify-center gap-1.5 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-3.5 sm:py-4 px-3 text-center transition-all duration-200 shadow-sm cursor-pointer"
              style={{ borderColor: isHov ? stat.color : undefined }}
            >
              <div
                className="w-8 h-8 rounded-[14px] flex items-center justify-center mb-0.5 transition-all duration-200"
                style={{
                  backgroundColor: isHov ? stat.color : `${stat.color}15`,
                  color: isHov ? "#ffffff" : stat.color,
                }}
              >
                <Icon size={16} weight={isHov ? "fill" : "regular"} aria-hidden="true" />
              </div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </div>
              <div className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
    } 
