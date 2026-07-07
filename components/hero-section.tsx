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
import { cn } from "@/lib/utils"
import { BRAND, BIZ, MARQUEE_ITEMS, HUB_COLORS } from "@/lib/brand"

// ─── Hub data ─────────────────────────────────────────────────────────────────
const HUBS_DATA = [
  {
    id: "print",
    name: "print hub",
    icon: (active: boolean) => (
      <Printer size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Printer,
    colorLight: BRAND.blue,
    colorDark:  BRAND.lightBlue,
    services: [
      { name: "B&W print",        price: "R5"  },
      { name: "colour print",     price: "R8"  },
      { name: "B&W copy",         price: "R3"  },
      { name: "colour copy",      price: "R5"  },
      { name: "photo 4x6 glossy", price: "R20" },
      { name: "photo A4 glossy",  price: "R40" },
    ],
  },
  {
    id: "doc",
    name: "docu hub",
    icon: (active: boolean) => (
      <FileText size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: FileText,
    colorLight: BRAND.green,
    colorDark:  BRAND.lightGreen,
    services: [
      { name: "CV from scratch",    price: "R30" },
      { name: "CV upgrade",         price: "R40" },
      { name: "cover letter",       price: "R30" },
      { name: "affidavit / letter", price: "R20" },
      { name: "scanning (per page)", price: "R5" },
      { name: "laminating A4",      price: "R15" },
    ],
  },
  {
    id: "design",
    name: "design hub",
    icon: (active: boolean) => (
      <PaintBrush size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: PaintBrush,
    colorLight: BRAND.orangeDark,
    colorDark:  BRAND.lightOrange,
    services: [
      { name: "logo (basic)",       price: "R300" },
      { name: "logo (standard)",    price: "R500" },
      { name: "business card",      price: "R120" },
      { name: "flyer (custom)",     price: "R250" },
      { name: "social media post",  price: "R80"  },
      { name: "invitation (image)", price: "R150" },
    ],
  },
  {
    id: "eservice",
    name: "e-service hub",
    icon: (active: boolean) => (
      <Globe size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Globe,
    // Teal — kept identical to HUB_COLORS.eservice.primary/accentDark in
    // lib/brand.ts, so this hub reads the same color everywhere: the hero
    // selector, the giant watermark, the "start here" button gradient, and
    // (via the abh:heroHubSelect event below) the navbar's logo/controls.
    colorLight: "#0F766E",
    colorDark:  "#99F6E4",
    services: [
      { name: "SASSA status check",         price: "R20"  },
      { name: "SASSA SRD application",      price: "R40"  },
      { name: "SASSA grant application",    price: "R80"  },
      { name: "SARS new taxpayer / eFiling", price: "R70" },
      { name: "NSFAS application",          price: "R80"  },
      { name: "UIF claims",                 price: "R200" },
    ],
  },
  {
    id: "tech",
    name: "tech hub",
    icon: (active: boolean) => (
      <Desktop size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Desktop,
    colorLight: BRAND.dark100,
    colorDark:  "#B8CCE0",
    services: [
      { name: "software install",              price: "R80"  },
      { name: "PC setup",                      price: "R250" },
      { name: "virus removal",                 price: "R200" },
      { name: "Windows install + activation",  price: "R350" },
      { name: "Microsoft 365 setup",           price: "R150" },
      { name: "troubleshooting (per hr)",      price: "R150" },
    ],
  },
]

const CTA_GRADIENTS: Record<string, [string, string]> = {
  print:    [BRAND.blue,       BRAND.blueMid],
  doc:      [BRAND.green,      BRAND.greenDeep],
  design:   [BRAND.orangeDark, BRAND.orangeBrown],
  eservice: ["#0F766E",        "#115E59"], // teal — matches HUB_COLORS.eservice gradient
  tech:     [BRAND.dark100,    BRAND.dark200],
}

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
// Fixes the "previous icon never disappears" bug. The old implementation
// used a `key`-forced remount + tailwindcss-animate's `animate-in` classes
// to fake a crossfade — on some mobile browsers, a rapid unmount/remount
// doesn't reliably clear the old layer's compositing before the new one
// paints, which is exactly the stacked-icon ghosting you saw. This version
// never unmounts a layer mid-transition: it adds a new layer, waits one
// frame, flips only that layer's opacity class to "visible" (triggering a
// real CSS opacity transition on every layer at once — old ones fade to 0,
// new one fades to target), then prunes every layer except the current one
// only *after* the transition duration has actually elapsed.
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

  React.useEffect(() => { setMounted(true) }, [])

  const isDark    = mounted && resolvedTheme === "dark"
  const colorFor  = (hub: typeof HUBS_DATA[number]) => isDark ? hub.colorDark : hub.colorLight
  const active    = HUBS_DATA[activeHub]
  const activeColor = colorFor(active)
  const WatermarkIcon = active.Icon
  const [ctaFrom, ctaTo] = CTA_GRADIENTS[active.id] ?? [BRAND.blue, BRAND.blueMid]

  // Watermark crossfade state
  const [watermarkLayers, setWatermarkLayers] = useState<WatermarkLayer[]>([])
  const [visibleKey,       setVisibleKey]      = useState<string | null>(null)
  const pruneTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const newKey = `${active.id}-${isDark}`
    setWatermarkLayers(prev => (prev.some(l => l.key === newKey) ? prev : [...prev, { key: newKey, Icon: WatermarkIcon, color: activeColor }]))

    const raf = requestAnimationFrame(() => setVisibleKey(newKey))
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.id, isDark])

  useEffect(() => {
    if (watermarkLayers.length <= 1) return
    if (pruneTimeoutRef.current) clearTimeout(pruneTimeoutRef.current)
    pruneTimeoutRef.current = setTimeout(() => {
      setWatermarkLayers(prev => prev.filter(l => l.key === visibleKey))
    }, 750) // matches the layer's transition-duration-700 + small buffer
    return () => { if (pruneTimeoutRef.current) clearTimeout(pruneTimeoutRef.current) }
  }, [watermarkLayers, visibleKey])

  const handleNavigate = (path: string) => router.push(path)

  const handleSelectHub = (index: number) => {
    setActiveHub(index)
    setSpotlightService(pickRandomService(index))

    // Tells the Navbar to tint its logo/toggle/hamburger icons to this
    // hub's color while on the homepage. Navbar resets this on any
    // pathname change, so it never persists once the person navigates
    // away (see requirement: stay on normal "/" color until clicked).
    const hub = HUBS_DATA[index]
    window.dispatchEvent(
      new CustomEvent("abh:heroHubSelect", { detail: { light: hub.colorLight, dark: hub.colorDark } })
    )
  }

  const handleReroll = () => {
    setSpotlightService(prev => pickRandomService(activeHub, prev.name))
  }

 return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+64px)] md:pt-[140px] pb-16 md:pb-28 overflow-hidden cursor-default select-none bg-background transition-colors duration-300"
    >
      {/* Storefront photo — full-bleed background for the hero only.
          Sits below the noise texture, ambient blob, and scrim, all of
          which layer on top of it exactly as before. */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img
          src="/storefront.webp"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark scrim — keeps the headline, paragraph, and cards readable
          over the photo. Slightly stronger in dark mode since the photo
          itself doesn't change with theme. */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-white/80 dark:bg-[#0D1B2A]/88"
        aria-hidden="true"
      />

      {/* Noise texture */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* Ambient blob — shifts to active hub color */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[140vw] md:w-[90vw] max-w-[1400px] aspect-[16/10] opacity-[0.14] dark:opacity-[0.18] blur-3xl transition-colors duration-700 ease-out"
          style={{
            backgroundColor: activeColor,
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

        @keyframes abh-cta-gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* Slowed from 4s to 10s per request — the color shift across the
           button now reads as a gentle, ambient fade instead of an
           obviously-looping animation. */
        .abh-cta-gradient { background-size: 200% 200%; animation: abh-cta-gradient-shift 10s ease infinite; }
      `}</style>

      <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center relative z-10 w-full mb-8">

        {/* H1 — left at large size per decision */}
        <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-[4.2rem] tracking-tight text-brand-blue-dark dark:text-brand-light-blue leading-[1.1] mb-6 text-balance transition-all duration-300">
          {BIZ.tagline}
        </h1>

        <p className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400 mb-10 max-w-[600px] px-2 leading-relaxed">
          from printing your documents to navigating government services — we make it simple, fast, and friendly.
        </p>

        {/* CTA — gradient tracks the active hub, crossfade-safe watermark behind it */}
        <div className="relative w-full flex justify-center items-center mb-12">

          {/* Giant tilted hub-icon watermark — crossfades via opacity
              transitions on stacked layers rather than key-based remount.
              See WatermarkLayer comment above for why this replaced the
              old approach. */}
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

          {/* Soft pulsing glow behind the button — tracks the active hub */}
          <div
            key={`glow-${active.id}`}
            aria-hidden="true"
            className="absolute w-[220px] h-[80px] rounded-full blur-2xl pointer-events-none abh-cta-glow"
            style={{ backgroundImage: `linear-gradient(135deg, ${ctaFrom} 0%, ${ctaTo} 100%)` }}
          />

          <button
            key={active.id}
            onClick={() => handleNavigate("/services")}
            className="abh-cta-gradient relative z-10 inline-flex items-center gap-3 group px-10 py-5 rounded-[16px] font-sans font-black text-lg text-white transition-all duration-300 active:duration-100 touch-manipulation hover:-translate-y-1 active:translate-y-0 active:scale-[0.88] shadow-lg hover:shadow-2xl active:shadow-md active:brightness-90 animate-in fade-in duration-500"
            style={{ backgroundImage: `linear-gradient(135deg, ${ctaFrom} 0%, ${ctaTo} 50%, ${ctaFrom} 100%)` }}
          >
            start here
            <ArrowRight weight="bold" className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
          </button>
        </div>

        {/* Core Hub Ecosystem — moved above the marquee, per your call */}
        <div className="abh-card w-full max-w-[840px] mx-auto p-6 sm:p-10 md:p-12 flex flex-col items-center bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md mb-12">

          <div className="w-full flex flex-col items-center mb-8">
            <h2 className="abh-section-heading mb-2 text-center">core hub ecosystem</h2>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              tap a hub to see what we actually do there.
            </p>
          </div>

          {/* Hub selector — icons only, no border in any state per request */}
          <div
            role="tablist"
            aria-label="service hubs"
            className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 w-full mb-6 px-1"
          >
            {HUBS_DATA.map((hub, index) => {
              const isActive  = activeHub === index
              const isHovered = hoveredHub === index
              const hubColor  = colorFor(hub)

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
                    "relative flex items-center justify-center px-4 sm:px-5 py-4 rounded-[14px] transition-all duration-200 flex-1 min-w-[56px]",
                    isActive && "shadow-md"
                  )}
                  style={{
                    backgroundColor: isActive || isHovered ? `${hubColor}14` : undefined,
                  }}
                >
                  <span
                    className="transition-all duration-200 flex"
                    style={{
                      color: isActive || isHovered ? hubColor : "#9A9A9A",
                      transform: isActive ? "translateY(-2px) scale(1.08)" : "none",
                    }}
                  >
                    {hub.icon(isActive)}
                  </span>
                  {isActive && (
                    <span
                      className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full"
                      style={{ backgroundColor: hubColor }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Spotlight panel */}
          <div className="w-full max-w-[560px] rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 sm:px-7 py-5 sm:py-6 mb-2 text-left transition-all duration-300">
            <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 mb-3">
              {active.name} · pricing example
            </p>
            <button
              key={`${activeHub}-${spotlightService.name}`}
              onClick={handleReroll}
              aria-label="Show another example price for this hub"
              className="w-full flex items-center justify-between gap-4 rounded-[10px] px-1 py-1 -mx-1 transition-opacity hover:opacity-75 active:scale-[0.98] animate-in fade-in duration-200"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 text-left">
                {spotlightService.name}
              </span>
              <span
                className="text-xl font-black font-mono shrink-0"
                style={{ color: activeColor }}
              >
                {spotlightService.price}
              </span>
            </button>
            <button
              onClick={() => handleNavigate(`/services?hub=${active.id}`)}
              className="inline-flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-widest mt-4 transition-opacity hover:opacity-70"
              style={{ color: activeColor }}
            >
              see all {active.name} services
              <ArrowRight weight="bold" className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Marquee — now below the Core Hub Ecosystem card, per your call */}
        <div
          role="marquee"
          aria-label="Our services"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
          onTouchStart={() => setMarqueePaused(p => !p)}
          className="relative w-full py-4 overflow-hidden select-none group/marquee"
        >
          <div
            className="flex whitespace-nowrap w-max animate-marquee"
            style={{ animationPlayState: marqueePaused ? "paused" : "running" }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span className="inline-flex items-center px-5 text-brand-blue-dark dark:text-brand-light-blue font-semibold text-sm transition-opacity duration-300 group-hover/marquee:opacity-70 hover:!opacity-100">
                      {item}
                    </span>
                    {/* Orange dot — intentional accent, approved exception */}
                    <span className="text-brand-orange font-black text-base leading-none shrink-0" aria-hidden="true">•</span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
// More compact per request: reduced section/card padding, smaller icon
// chips, tighter gaps.
export function StatsBar() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const stats = [
    { icon: PlusCircle, color: BRAND.blue,   value: BIZ.hubCount,    label: "hubs"        },
    { icon: Gear,       color: BRAND.green,  value: BIZ.serviceCount, label: "services"   },
    { icon: Wrench,     color: BRAND.orange, value: "fast",           label: "turnaround" },
  ]

  return (
    <section aria-label="Key stats" className="px-4 md:px-8 py-8 md:py-10 transition-colors duration-300">
      <div
        className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[560px] mx-auto"
        role="list"
        aria-label="key stats"
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
                className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-0.5 transition-all duration-200"
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
