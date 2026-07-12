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
    name: "Print Hub",
    icon: (active: boolean) => (
      <Printer size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Printer,
    colorLight: BRAND.blue,
    colorDark:  BRAND.lightBlue,
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
    colorLight: BRAND.green,
    colorDark:  BRAND.lightGreen,
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
    colorLight: BRAND.orangeDark,
    colorDark:  BRAND.lightOrange,
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
    colorLight: BRAND.teal,
    colorDark:  BRAND.tealLight,
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

const CTA_GRADIENTS: Record<string, [string, string]> = {
  print:    [BRAND.blue,       BRAND.blueMid],
  doc:      [BRAND.green,      BRAND.greenDeep],
  design:   [BRAND.orangeDark, BRAND.orangeBrown],
  eservice: [BRAND.teal,       BRAND.tealDark],
  tech:     [BRAND.dark100,    BRAND.dark200],
}

// Real WCAG relative luminance — used for the ecosystem box's neutral text
// (heading, subtitle, price, icons), which must always contrast against
// whichever hub color the wash currently is.
function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
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
  const [ctaHovered,        setCtaHovered]        = useState(false)

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
  const colorFor  = (hub: typeof HUBS_DATA[number]) => isDark ? hub.colorDark : hub.colorLight
  const active    = HUBS_DATA[activeHub]
  const activeColor = colorFor(active)
  const WatermarkIcon = active.Icon
  // CTA gradient always derives from the SAME active hub + SAME BRAND
  // tokens that drive the navbar's per-hub tint (abh:heroHubSelect below)
  // and this card's own wash — so all three stay in lockstep automatically
  // whenever activeHub changes, without any extra wiring.
  const [ctaFrom, ctaTo] = CTA_GRADIENTS[active.id] ?? [BRAND.blue, BRAND.blueMid]

  const washIsLight = relativeLuminance(activeColor) > 0.55
  const neutralOnWash = washIsLight ? "#111827" : "#FFFFFF"
  const neutralOnWashSoft = washIsLight ? "rgba(17,24,39,0.55)" : "rgba(255,255,255,0.75)"
  const neutralShadow = washIsLight ? "none" : "0 1px 6px rgba(0,0,0,0.35)"

  // "View all ___ Services" link — now simply reuses activeColor, the same
  // theme-aware color already computed by colorFor for everything else in
  // this card (divider, blob, watermark). Previously this had its own
  // "opposite-lightness" formula that inverted the mapping — it picked the
  // SATURATED brand hue in dark mode (unreadable on the near-black surface
  // the gradient fades to) and the PASTEL hue in light mode (unreadable on
  // white). activeColor is already correct: colorLight (a vivid, darker
  // hue) in light theme against the white surface below, colorDark (a
  // pastel, lighter hue) in dark theme against the near-black surface below.
const linkColor = activeColor

  // Lower price block (hub name / service name / price) sits near the
  // BOTTOM of the gradient (58–86% offsets), where the wash has already
  // faded most of the way to the page's own base surface — white in light
  // mode, near-black (zinc-950) in dark mode. Using neutralOnWash there
  // (chosen against the hub's own accent color) breaks for hubs whose dark-
  // mode accent is itself light/pastel — e.g. Tech's #B8CCE0 — because it
  // picks near-black text for a spot that's actually faded close to black.
  // This pair instead targets the surface it's really sitting on.
  const baseTextColor  = isDark ? "#FFFFFF" : "#111827"
  const baseTextShadow = isDark ? "0 1px 6px rgba(0,0,0,0.45)" : "none"


  
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

  // Instant route, no gating of any kind — the mobile "flying particles"
  // effect that used to play here (and briefly delay navigation while it
  // finished) has been removed entirely per request. The desktop-only
  // hover radial menu (the "star-like thing", gated by canHover below) is
  // the only decorative flourish left on this button.
  const handleCtaClick = () => {
    handleNavigate("/services")
  }

  const RADIUS = 108
  const radialPositions = HUBS_DATA.map((_, i) => {
    const angle = (-90 + i * (360 / HUBS_DATA.length)) * (Math.PI / 180)
    return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS, angleDeg: (-90 + i * (360 / HUBS_DATA.length)) }
  })

 return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+96px)] md:pt-[172px] pb-16 md:pb-28 overflow-hidden cursor-default select-none bg-background transition-colors duration-300"
    >
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img src="/storefront.webp" alt="" className="w-full h-full object-cover" />
      </div>

      <div
        className="absolute inset-0 z-0 pointer-events-none bg-white/80 dark:bg-[#0D1B2A]/88"
        aria-hidden="true"
      />

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
        .abh-cta-gradient { background-size: 200% 200%; animation: abh-cta-gradient-shift 10s ease infinite; }

        @keyframes abh-taskbar-indicator-in {
          0%   { width: 0px;  opacity: 0; }
          100% { width: 22px; opacity: 1; }
        }
        .abh-taskbar-indicator {
          animation: abh-taskbar-indicator-in 220ms ease-out forwards;
        }
      `}</style>

      <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center relative z-10 w-full mb-8">

        <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-[4.2rem] tracking-tight text-brand-blue-dark dark:text-brand-light-blue leading-[1.1] mb-6 text-balance transition-all duration-300">
          {BIZ.tagline}
        </h1>

        <p className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400 mb-10 max-w-[600px] px-2 leading-relaxed">
          From printing your documents to navigating government services — we make it simple, fast, and friendly.
        </p>

        <div
          className="relative w-full flex justify-center items-center mb-12"
          onMouseEnter={() => canHover && setCtaHovered(true)}
          onMouseLeave={() => canHover && setCtaHovered(false)}
        >

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
            key={`glow-${active.id}`}
            aria-hidden="true"
            className="absolute w-[220px] h-[80px] rounded-full blur-2xl pointer-events-none abh-cta-glow"
            style={{ backgroundImage: `linear-gradient(135deg, ${ctaFrom} 0%, ${ctaTo} 100%)` }}
          />

          {/* Desktop-only "star" reveal — the sole surviving flourish on
              this button. The mobile tap-triggered flying-particles effect
              has been removed entirely per request. */}
          {canHover && (
            <div
              aria-hidden={!ctaHovered}
              className="absolute inset-0 flex items-center justify-center z-20"
              style={{ pointerEvents: ctaHovered ? "auto" : "none" }}
            >
              {HUBS_DATA.map((hub, i) => {
                const pos = radialPositions[i]
                const hubColor = colorFor(hub)
                const HubIconEl = hub.Icon
                return (
                  <React.Fragment key={hub.id}>
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 origin-left transition-all duration-300 ease-out"
                      style={{
                        width: ctaHovered ? RADIUS - 26 : 0,
                        height: 2,
                        backgroundColor: `${hubColor}55`,
                        transform: `rotate(${pos.angleDeg}deg)`,
                        transitionDelay: ctaHovered ? `${i * 30}ms` : "0ms",
                      }}
                    />
                    <button
                      onClick={() => handleNavigate(`/services?hub=${hub.id}`)}
                      aria-label={`Go to ${hub.name}`}
                      title={hub.name}
                      className="absolute w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ease-out"
                      style={{
                        backgroundColor: hubColor,
                        color: relativeLuminance(hubColor) > 0.55 ? "#111827" : "#FFFFFF",
                        transform: ctaHovered
                          ? `translate(${pos.x}px, ${pos.y}px) scale(1)`
                          : "translate(0, 0) scale(0.3)",
                        opacity: ctaHovered ? 1 : 0,
                        transitionDuration: "320ms",
                        transitionDelay: ctaHovered ? `${i * 30}ms` : "0ms",
                      }}
                    >
                      <HubIconEl size={20} weight="fill" aria-hidden="true" />
                    </button>
                  </React.Fragment>
                )
              })}
            </div>
          )}

          <button
            ref={ctaBtnRef}
            key={active.id}
            onClick={handleCtaClick}
            className="abh-cta-gradient relative z-10 inline-flex items-center gap-3 group px-10 py-5 rounded-[14px] font-sans font-black text-lg text-white transition-all duration-300 active:duration-100 touch-manipulation hover:-translate-y-1 active:translate-y-0 active:scale-[0.94] shadow-md hover:shadow-xl active:shadow-sm active:brightness-90 animate-in fade-in duration-500"
            style={{ backgroundImage: `linear-gradient(135deg, ${ctaFrom} 0%, ${ctaTo} 50%, ${ctaFrom} 100%)` }}
          >
            Start Here
            <ArrowRight weight="bold" className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
          </button>
        </div>

        {/* Core Hub Ecosystem */}
        <div className="relative w-full max-w-[840px] mx-auto px-6 sm:px-10 md:px-12 pt-10 sm:pt-14 md:pt-16 pb-16 sm:pb-20 flex flex-col items-center mb-12 overflow-hidden rounded-t-[14px]">

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 pointer-events-none bg-white dark:bg-zinc-950"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${activeColor} 0%, ${activeColor} 14%, ${activeColor}CC 34%, ${activeColor}66 58%, ${activeColor}00 86%)`,
              transition: "background 700ms ease-out",
            }}
          />

          <div className="w-full flex flex-col items-center">

            <div className="w-full flex flex-col items-center mb-8">
              <h2
                className="abh-section-heading mb-2 text-center transition-colors duration-300"
                style={{ color: neutralOnWash, textShadow: neutralShadow }}
              >
                Core Hub Ecosystem
              </h2>
              <p
                className="text-sm font-medium text-center transition-colors duration-300"
                style={{ color: neutralOnWashSoft, textShadow: neutralShadow }}
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
                      "relative flex flex-col items-center justify-center gap-1.5 px-4 sm:px-5 pt-4 pb-2.5 rounded-[14px] transition-all duration-200 flex-1 min-w-[56px]",
                      isActive && "shadow-md"
                    )}
                    style={{
                      backgroundColor: isActive ? `${hubColor}33` : (isHovered ? `${neutralOnWash}14` : "transparent"),
                    }}
                  >
                    <span
                      className="transition-all duration-200 flex"
                      style={{
                        color: isActive ? neutralOnWash : neutralOnWash,
                        opacity: isActive ? 1 : (isHovered ? 0.85 : (washIsLight ? 0.32 : 0.4)),
                        transform: isActive ? "translateY(-1px) scale(1.08)" : "none",
                        filter: isActive ? `drop-shadow(0 0 7px ${hubColor}99)` : "none",
                      }}
                    >
                      {hub.icon(isActive)}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn("block h-[3px] rounded-full", isActive && "abh-taskbar-indicator")}
                      style={{
                        width: isActive ? 22 : 0,
                        backgroundColor: hubColor,
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                  </button>
                )
              })}
            </div>

            <div
              className="relative w-full max-w-[420px] h-px mt-1 mb-7 transition-colors duration-500"
              style={{ backgroundColor: activeColor }}
            >
              <div
                className="absolute left-1/2 top-0 -translate-x-1/2 transition-[border-top-color] duration-500"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "7px solid transparent",
                  borderRight: "7px solid transparent",
                  borderTop: `9px solid ${activeColor}`,
                }}
                aria-hidden="true"
              />
            </div>

            <div className="w-full max-w-[420px] flex flex-col items-center text-center">
              <p
                className="text-[0.65rem] font-black uppercase tracking-widest mb-3 transition-colors duration-300"
                style={{ color: baseTextColor, textShadow: baseTextShadow }}
              >
                {active.name}
              </p>

              <button
                key={`${activeHub}-${spotlightService.name}`}
                onClick={handleReroll}
                aria-label="Show another example price for this hub"
                className="flex flex-col items-center gap-1 mx-auto rounded-[14px] px-3 py-1 transition-opacity hover:opacity-75 active:scale-[0.97] animate-in fade-in duration-200"
              >
                <span className="text-sm font-semibold transition-colors duration-300" style={{ color: baseTextColor, textShadow: baseTextShadow }}>
                  {spotlightService.name}
                </span>

                <span className="text-2xl font-black font-mono transition-colors duration-300" style={{ color: baseTextColor, textShadow: baseTextShadow }}>
                  {spotlightService.price}
                </span>
              </button>

              <button
                onClick={() => handleNavigate(`/services?hub=${active.id}`)}
                className="flex items-center justify-center gap-1.5 text-[0.65rem] font-black tracking-wide mt-4 transition-opacity hover:opacity-70"
                style={{ color: linkColor }}
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
                        <span className="text-brand-orange font-black text-base leading-none shrink-0" aria-hidden="true">•</span>
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
