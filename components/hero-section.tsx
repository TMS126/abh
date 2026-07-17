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
    colorLight: BRAND.blueDark,
    colorDark:  BRAND.blue,
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
    // FIX (recurring): BRAND.teal / BRAND.tealLight still don't exist in
    // lib/brand.ts — this was undefined again, which crashes the moment
    // this tab is selected (colorFor's result flows straight into
    // ensureAccessible/relativeLuminance). Restored to the same
    // blueMid/lightBlue pairing E-Service already uses everywhere else
    // (FORM_HUBS, HUB_COLORS, navbar's MOBILE_NAV_COLORS).
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

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [tilting, setTilting] = useState(false)
  const ecoBoxRef = useRef<HTMLDivElement>(null)

  const handleEcoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover || !ecoBoxRef.current) return
    const rect = ecoBoxRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const MAX_TILT = 5
    setTilt({
      ry: (px - 0.5) * MAX_TILT * 2,
      rx: (0.5 - py) * MAX_TILT * 2,
    })
    setTilting(true)
  }
  const handleEcoMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 })
    setTilting(false)
  }

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

  // Button stroke — now fixed to BRAND.blue in BOTH themes ("primary blue
  // stroke"), no longer theme-swapped. Fill (used on hover/mobile) stays
  // the same primary blue too, for visual consistency with the border.
  const STROKE_COLOR   = BRAND.blue
  const CTA_FILL_COLOR = BRAND.blue

  // Text/arrow at REST (border-only state, sitting directly on the page
  // background) need their own theme-aware color for contrast, since a
  // fixed primary blue reads fine on white but is too low-contrast on the
  // near-black dark-mode background. lightBlue is the same pastel already
  // used everywhere else in the app for "blue text on dark backgrounds".
  // Both text and arrow now share this single value (previously the arrow
  // had its own separate fixed orange, unrelated to the text's contrast
  // logic) and are driven via CSS custom properties + Tailwind classes
  // rather than inline styles, so the hover/mobile "turn white" state can
  // actually override them via normal CSS specificity.
  const REST_COLOR = isDark ? BRAND.lightBlue : BRAND.blue

  const cardText      = "#FFFFFF"
  const cardTextSoft  = "rgba(255,255,255,0.82)"
  const cardTextMuted = "rgba(255,255,255,0.55)"

  const neutralCardBgHex = isDark ? "#18181b" : "#ffffff"
  const hubColor  = isDark ? active.colorDark : active.colorLight
  const nameColor = ensureAccessible(hubColor, neutralCardBgHex, 4.5)

  const [pageWatermarkHub, setPageWatermarkHub] = useState<typeof HUBS_DATA[number] | null>(null)
  useEffect(() => {
    setPageWatermarkHub(HUBS_DATA[Math.floor(Math.random() * HUBS_DATA.length)])
  }, [])
  const RandomWatermarkIcon = pageWatermarkHub?.Icon

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

  // DESIGN EXACT COLOR
  const DESIGN_TEAL = "#00BFA5"

  return (
    <section
      aria-label="Welcome to ApexbytesHub"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center overflow-hidden cursor-default select-none bg-white transition-colors duration-300"
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

        @keyframes abh-watermark-float {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50%      { transform: translateY(-16px) rotate(-6deg); }
        }
        @keyframes abh-watermark-shadow-pulse {
          0%, 100% { transform: scaleX(1);   opacity: 0.22; }
          50%      { transform: scaleX(0.82); opacity: 0.14; }
        }
      `}</style>

      {/* REFACTORED HERO UI: TOP TEAL SECTION */}
      <div 
        className="relative w-full flex-[1.4] flex flex-col items-center justify-center px-6 pt-20 pb-16 rounded-b-[48px] md:rounded-b-[64px] shadow-2xl z-10"
        style={{ backgroundColor: DESIGN_TEAL }}
      >
        <div className="text-center mb-10 md:mb-16">
          <p className="text-white/90 text-xl md:text-2xl font-medium tracking-tight mb-1">
            Welcome to
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-black tracking-tighter">
            ApexbytesHub
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center w-full max-w-sm">
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* BIG LOGO AREA */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full text-white drop-shadow-xl" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 85 L50 15 L85 85" />
              <path d="M30 55 L70 55" />
              <circle cx="50" cy="50" r="46" strokeWidth="1" strokeDasharray="4 4" className="opacity-20" />
            </svg>
          </div>
        </div>
      </div>

      {/* REFACTORED HERO UI: BOTTOM WHITE SECTION */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-8 md:gap-12 px-6 py-10 bg-white">
        
        {/* Hub Selection (Preserved logic, adapted style) */}
        <div className="w-full max-w-[420px] flex flex-col items-center">
          <div
            role="tablist"
            aria-label="Service hubs"
            className="flex justify-center items-center gap-2 mb-6"
          >
            {HUBS_DATA.map((hub, index) => {
              const isActive = activeHub === index
              return (
                <button
                  key={hub.id}
                  onClick={() => handleSelectHub(index)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                    isActive ? "shadow-md" : "opacity-40 hover:opacity-70"
                  )}
                  style={{ 
                    backgroundColor: isActive ? DESIGN_TEAL : "transparent",
                    color: isActive ? "#FFF" : DESIGN_TEAL,
                    border: `2px solid ${DESIGN_TEAL}`
                  }}
                >
                  {hub.icon(isActive)}
                </button>
              )
            })}
          </div>

          {/* Spotlight Data Preservation */}
          <div className="bg-zinc-50 rounded-2xl p-4 w-full text-center border border-zinc-100 shadow-sm mb-6">
            <p className="text-[0.65rem] font-black uppercase tracking-widest mb-1" style={{ color: DESIGN_TEAL }}>
              {active.name}
            </p>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold text-zinc-600">{spotlightService.name}</span>
              <span className="text-2xl font-black text-zinc-900">{spotlightService.price}</span>
            </div>
          </div>
        </div>

        {/* DESIGN EXACT "let's go" BUTTON */}
        <button
          onClick={handleCtaClick}
          className="group relative flex items-center justify-between w-full max-w-[300px] py-4 px-8 rounded-full border-[2.5px] bg-white transition-all hover:bg-zinc-50 active:scale-[0.97] shadow-sm"
          style={{ borderColor: DESIGN_TEAL }}
        >
          <span className="text-xl font-black tracking-tight" style={{ color: DESIGN_TEAL }}>
            let&apos;s go
          </span>
          <ArrowRight weight="bold" className="w-6 h-6" style={{ color: DESIGN_TEAL }} />
        </button>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-2 rounded-full" style={{ backgroundColor: DESIGN_TEAL }} />
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: DESIGN_TEAL }} />
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: DESIGN_TEAL }} />
        </div>

        {/* Marquee Preservation */}
        <div className="w-full overflow-hidden mt-4 opacity-40">
           <div className="flex whitespace-nowrap animate-marquee">
              {MARQUEE_ITEMS.map((item, idx) => (
                <span key={idx} className="mx-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {item} •
                </span>
              ))}
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
