"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  CaretRight,
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
import { ScrollBounce } from "@/components/scroll-bounce"

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

  const [hubTouched, setHubTouched] = useState(false)

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [tilting, setTilting] = useState(false)
  const ecoBoxRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

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

  const handleEcoTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleEcoTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const SWIPE_THRESHOLD = 40
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      const dir = deltaX < 0 ? 1 : -1
      const nextIndex = (activeHub + dir + HUBS_DATA.length) % HUBS_DATA.length
      handleSelectHub(nextIndex)
    }
    touchStartX.current = null
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
  const ActiveIcon = active.Icon

  const STROKE_COLOR   = BRAND.blue
  const CTA_FILL_COLOR = BRAND.blue

  const REST_COLOR = isDark ? BRAND.lightBlue : BRAND.blue

  const cardText      = "#FFFFFF"
  const cardTextSoft  = "rgba(255,255,255,0.82)"
  const cardTextMuted = "rgba(255,255,255,0.55)"

  const hubColor  = isDark ? active.colorDark : active.colorLight
  const nameColor = ensureAccessible(hubColor, "#0d2436", 4.5)

  const handleNavigate = (path: string) => router.push(path)

  const handleSelectHub = (index: number) => {
    setActiveHub(index)
    setHubTouched(true)
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

      <div className="max-w-[1240px] mx-auto flex flex-col items-center relative z-10 w-full mb-6">

        <div className="w-full max-w-[840px] mx-auto flex flex-col mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-[4.6rem] tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.08] mb-4 text-balance transition-colors duration-300">
              {BIZ.tagline}
            </h1>
            <p className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400 max-w-[480px] md:max-w-none mx-auto md:mx-0 leading-relaxed">
              From printing your documents to navigating government services — we make it simple, fast, and friendly.
            </p>
          </div>
        </div>

        <div className="relative w-full flex justify-center items-center mb-8">

          <div
            aria-hidden="true"
            className="hidden md:flex absolute inset-y-0 -right-[10%] items-center justify-center pointer-events-none select-none z-0"
          >
            {!hubTouched ? (
              <Image
                src="/logo.png"
                alt=""
                width={520}
                height={520}
                aria-hidden="true"
                style={{
                  transform: "rotate(-6deg)",
                  filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.25))",
                }}
                className="shrink-0 opacity-[0.14] dark:opacity-[0.18] md:w-[620px] md:h-[620px] object-contain"
              />
            ) : (
              <ActiveIcon
                size={520}
                weight="fill"
                aria-hidden="true"
                style={{
                  color: BRAND.blue,
                  transform: "rotate(-6deg)",
                  filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.25))",
                }}
                className="shrink-0 opacity-[0.14] dark:opacity-[0.18] md:w-[620px] md:h-[620px]"
              />
            )}
          </div>

          <ScrollBounce>
            <button
              ref={ctaBtnRef}
              onClick={handleCtaClick}
              style={{
                borderColor: STROKE_COLOR,
                ["--rest" as any]: REST_COLOR,
              }}
              className="group relative z-30 inline-flex items-center gap-3 px-10 py-5 rounded-full font-sans font-black text-lg overflow-hidden border-2 transition-all duration-150 active:duration-75 touch-manipulation hover:-translate-y-1 active:translate-y-0 active:scale-[0.94] shadow-md hover:shadow-xl active:shadow-sm"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-100 md:scale-y-0 transition-transform duration-150 ease-out md:group-hover:scale-y-100 md:group-active:scale-y-100"
                style={{ backgroundColor: CTA_FILL_COLOR }}
              />
              <span className="relative z-10 text-white md:text-[color:var(--rest)] md:group-hover:text-white md:group-active:text-white transition-colors duration-150">
                Start Here
              </span>
              <ArrowRight
                weight="bold"
                aria-hidden="true"
                className="relative z-10 w-6 h-6 transition-all duration-150 group-hover:translate-x-1.5 text-white md:text-[color:var(--rest)] md:group-hover:text-white md:group-active:text-white"
              />
            </button>
          </ScrollBounce>
        </div>

        <ScrollBounce delay={0.1} className="w-full max-w-[840px] mx-auto">
          <div
            ref={ecoBoxRef}
            onMouseMove={handleEcoMouseMove}
            onMouseLeave={handleEcoMouseLeave}
            onTouchStart={handleEcoTouchStart}
            onTouchEnd={handleEcoTouchEnd}
            className="relative w-full rounded-[14px] overflow-hidden"
            style={{
              transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilting ? 1.012 : 1})`,
              transformStyle: "preserve-3d",
              transition: tilting ? "transform 90ms ease-out" : "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform",
              boxShadow:
                "0 60px 120px -25px rgba(0,0,0,0.65), " +
                "0 35px 70px -30px rgba(0,0,0,0.75), " +
                `0 0 100px -15px ${BRAND.blue}70, ` +
                "inset 0 1px 0 rgba(255,255,255,0.28), " +
                "inset 0 -44px 60px -30px rgba(0,0,0,0.55)",
            }}
          ><div
    className="absolute inset-0 z-0"
    aria-hidden="true"
    style={{ backgroundColor: BRAND.blueDark }}
  />
        

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
                className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 w-full max-w-[420px] mb-4 px-1"
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
                    </button>
                  )
                })}
              </div>

              <div
                role="tablist"
                aria-label="Hub pagination"
                className="flex items-center justify-center gap-1.5 mb-6"
              >
                {HUBS_DATA.map((hub, index) => {
                  const isActive = activeHub === index
                  return (
                    <button
                      key={hub.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Go to ${hub.name}`}
                      onClick={() => handleSelectHub(index)}
                      className={cn("h-2 rounded-full transition-all duration-300", isActive ? "w-6" : "w-2")}
                      style={{ backgroundColor: cardText, opacity: isActive ? 1 : 0.35 }}
                    />
                  )
                })}
              </div>

              <div className="w-full max-w-[420px] flex flex-col items-center text-center mb-2">
                <CaretRight
                  size={22}
                  weight="bold"
                  aria-hidden="true"
                  style={{ color: nameColor }}
                  className="mb-1"
                />

                <p
                  className="text-[0.8rem] font-black uppercase tracking-widest pb-2 mb-3 border-b-2 inline-block"
                  style={{ color: nameColor, borderColor: nameColor }}
                >
                  {active.name}
                </p>

                <button
                  key={`${activeHub}-${spotlightService.name}`}
                  onClick={handleReroll}
                  aria-label="Show another example price for this hub"
                  className="flex flex-col items-center gap-1 rounded-[10px] px-2 py-1 transition-opacity hover:opacity-80 active:scale-[0.97] animate-in fade-in duration-200"
                >
                  <span className="text-sm font-semibold" style={{ color: cardText }}>
                    {spotlightService.name}
                  </span>
                  <span className="text-2xl font-black font-mono" style={{ color: cardText }}>
                    {spotlightService.price}
                  </span>
                </button>

                <button
                  onClick={() => handleNavigate(`/services?hub=${active.id}`)}
                  className="flex items-center justify-center gap-1.5 text-[0.65rem] font-black tracking-wide mt-4 transition-opacity hover:opacity-70"
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
        </ScrollBounce>
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
            <ScrollBounce key={stat.label} delay={i * 0.08}>
              <div
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
            </ScrollBounce>
          )
        })}
      </div>
    </section>
  )
}  
