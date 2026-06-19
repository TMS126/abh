"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  WhatsappLogo,
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
import { BRAND, BIZ, WA, MARQUEE_ITEMS, HUB_COLORS } from "@/lib/brand"

// Real services per hub, pulled from the locked pricelist — used for the random-on-click spotlight price.
// Colors use tagText (light mode) / tagTextDark (dark mode) — the pair already tuned per-hub for contrast in brand.ts.
const HUBS_DATA = [
  {
    id: "print",
    name: "Print Hub",
    icon: <Printer size={32} weight="fill" aria-hidden="true" />,
    colorLight: HUB_COLORS.print.tagText,
    colorDark: HUB_COLORS.print.tagTextDark,
    services: [
      { name: "B&W Print", price: "R5" },
      { name: "Colour Print", price: "R8" },
      { name: "B&W Copy", price: "R3" },
      { name: "Colour Copy", price: "R5" },
      { name: "Photo 4x6 Glossy", price: "R20" },
      { name: "Photo A4 Glossy", price: "R40" },
    ],
  },
  {
    id: "doc",
    name: "Docu Hub",
    icon: <FileText size={32} weight="fill" aria-hidden="true" />,
    colorLight: HUB_COLORS.doc.tagText,
    colorDark: HUB_COLORS.doc.tagTextDark,
    services: [
      { name: "CV from Scratch", price: "R30" },
      { name: "CV Upgrade", price: "R40" },
      { name: "Cover Letter", price: "R30" },
      { name: "Affidavit / Letter", price: "R20" },
      { name: "Scanning (per page)", price: "R5" },
      { name: "Laminating A4", price: "R15" },
    ],
  },
  {
    id: "design",
    name: "Design Hub",
    icon: <PaintBrush size={32} weight="fill" aria-hidden="true" />,
    colorLight: HUB_COLORS.design.tagText,
    colorDark: HUB_COLORS.design.tagTextDark,
    services: [
      { name: "Logo (Basic)", price: "R300" },
      { name: "Logo (Standard)", price: "R500" },
      { name: "Business Card", price: "R120" },
      { name: "Flyer (Custom)", price: "R250" },
      { name: "Social Media Post", price: "R80" },
      { name: "Invitation (Image)", price: "R150" },
    ],
  },
  {
    id: "eservice",
    name: "E-Service Hub",
    icon: <Globe size={32} weight="fill" aria-hidden="true" />,
    colorLight: HUB_COLORS.eservice.tagText,
    colorDark: HUB_COLORS.eservice.tagTextDark,
    services: [
      { name: "SASSA Status Check", price: "R20" },
      { name: "SASSA SRD Application", price: "R40" },
      { name: "SASSA Grant Application", price: "R80" },
      { name: "SARS New Taxpayer / eFiling", price: "R70" },
      { name: "NSFAS Application", price: "R80" },
      { name: "UIF Claims", price: "R200" },
    ],
  },
  {
    id: "tech",
    name: "Tech Hub",
    icon: <Desktop size={32} weight="fill" aria-hidden="true" />,
    colorLight: HUB_COLORS.tech.tagText,
    colorDark: HUB_COLORS.tech.tagTextDark,
    services: [
      { name: "Software Install", price: "R80" },
      { name: "PC Setup", price: "R250" },
      { name: "Virus Removal", price: "R200" },
      { name: "Windows Install + Activation", price: "R350" },
      { name: "Microsoft 365 Setup", price: "R150" },
      { name: "Troubleshooting (per hr)", price: "R150" },
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

export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeHub, setActiveHub] = useState<number>(0)
  const [marqueePaused, setMarqueePaused] = useState(false)
  const [spotlightService, setSpotlightService] = useState(() => pickRandomService(0))

  React.useEffect(() => { setMounted(true) }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const colorFor = (hub: (typeof HUBS_DATA)[number]) => (isDark ? hub.colorDark : hub.colorLight)

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const active = HUBS_DATA[activeHub]
  const activeColor = colorFor(active)

  const handleSelectHub = (index: number) => {
    setActiveHub(index)
    setSpotlightService(pickRandomService(index))
  }

  const handleReroll = () => {
    setSpotlightService((prev) => pickRandomService(activeHub, prev.name))
  }

  return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+64px)] md:pt-[140px] pb-16 md:pb-28 overflow-hidden cursor-default select-none bg-background transition-colors duration-300"
    >
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

      {/* Ambient morphing blob — echoes the logo silhouette, tints toward the active hub's color */}
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
      `}</style>

      <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center relative z-10 w-full mb-8">

        <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-[4.2rem] tracking-tight text-brand-blue-dark dark:text-brand-light-blue leading-[1.1] mb-6 text-balance transition-all duration-300">
          {BIZ.tagline}
        </h1>

        <p className="abh-body text-base md:text-xl mb-10 max-w-[600px] px-2">
          From printing your documents to navigating government services — we make it simple, fast, and friendly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center w-full mb-12">
          <button
            onClick={() => handleNavigate("/services")}
            className="inline-flex items-center gap-3 group px-8 py-4 rounded-[14px] font-sans font-black text-lg text-white transition-all duration-300 active:scale-95 shadow-lg bg-brand-blue active:bg-brand-orange hover:opacity-90"
          >
            View Services
            <ArrowRight weight="bold" className="w-6 h-6 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>

          <a
            href={WA.general}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-wa-loop inline-flex items-center justify-center w-[58px] h-[58px] rounded-full text-white bg-brand-green hover:bg-brand-green-dark active:scale-95 transition-all duration-300 shrink-0 shadow-lg"
            aria-label={`Chat with ${BIZ.name} on WhatsApp`}
          >
            <WhatsappLogo weight="fill" className="w-8 h-8" aria-hidden="true" />
          </a>
        </div>

        {/* Marquee */}
        <div
          role="marquee"
          aria-label="Our services"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
          onTouchStart={() => setMarqueePaused((p) => !p)}
          className="relative w-full py-4 overflow-hidden select-none mb-12 group/marquee"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
          <div
            className="flex whitespace-nowrap w-max animate-marquee"
            style={{ animationPlayState: marqueePaused ? "paused" : "running" }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span className="inline-flex items-center px-5 text-brand-blue-dark dark:text-brand-light-blue font-black text-[0.78rem] uppercase tracking-widest transition-opacity duration-300 group-hover/marquee:opacity-70 hover:!opacity-100">
                      {item}
                    </span>
                    <span className="text-brand-orange font-black text-base leading-none shrink-0" aria-hidden="true">•</span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Core Hub Ecosystem — icon-only spotlight */}
        <div className="abh-card w-full max-w-[840px] mx-auto p-6 sm:p-10 md:p-12 flex flex-col items-center bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md">

          <div className="w-full flex flex-col items-center mb-8 md:mb-10">
            <h2 className="abh-section-heading mb-2 text-center">Core Hub Ecosystem</h2>
            <p className="abh-body text-sm max-w-[420px]">Tap a hub to see what we actually do there.</p>
          </div>

          {/* Hub selector row — icons only, theme-aware muted state */}
          <div
            role="tablist"
            aria-label="Service hubs"
            className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 w-full mb-6 px-1"
          >
            {HUBS_DATA.map((hub, index) => {
              const isActive = activeHub === index
              const hubColor = colorFor(hub)
              return (
                <button
                  key={hub.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={hub.name}
                  onClick={() => handleSelectHub(index)}
                  className={cn(
                    "relative flex items-center justify-center px-4 sm:px-5 py-4 rounded-[14px] border transition-all duration-300 flex-1 min-w-[56px]",
                    isActive
                      ? "border-transparent shadow-md"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                  )}
                  style={{ backgroundColor: isActive ? `${hubColor}14` : undefined }}
                >
                  <span
                    className="transition-all duration-300 flex"
                    style={{
                      color: isActive ? hubColor : "#9A9A9A",
                      transform: isActive ? "translateY(-2px) scale(1.1)" : "none",
                    }}
                  >
                    {hub.icon}
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

          {/* Spotlight panel — service + price re-roll on click, subtitle copy stays fixed */}
          <div className="w-full max-w-[560px] rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#081428] px-5 sm:px-7 py-5 sm:py-6 mb-2 text-left transition-all duration-300">
            <p className="text-[0.7rem] font-black uppercase tracking-wide text-zinc-400 mb-3">{active.name} · pricing example</p>
            <div className="flex items-center justify-between gap-4">
              <button
                key={`${activeHub}-${spotlightService.name}`}
                onClick={handleReroll}
                aria-label="Show another example price for this hub"
                className="flex-1 flex items-center justify-between gap-4 rounded-[10px] px-1 py-1 -mx-1 transition-opacity hover:opacity-80 active:scale-[0.98] animate-in fade-in duration-300"
              >
                <span className="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-200">{spotlightService.name}</span>
                <span className="text-lg sm:text-xl font-black shrink-0" style={{ color: activeColor }}>{spotlightService.price}</span>
              </button>
            </div>
            <button
              onClick={() => handleNavigate(`/services?hub=${active.id}`)}
              className="inline-flex items-center gap-1.5 text-[0.78rem] font-black mt-4 transition-opacity hover:opacity-70"
              style={{ color: activeColor }}
            >
              See all {active.name} services
              <ArrowRight weight="bold" className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function StatsBar() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section aria-label="Key stats" className="px-4 md:px-8 py-12 md:py-16 transition-colors duration-300">
      <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-[640px] mx-auto" role="list" aria-label="Key stats">
        {[
          { icon: <PlusCircle weight="fill" size={24} aria-hidden="true" />, color: BRAND.blue, value: BIZ.hubCount, label: "Hubs" },
          { icon: <Gear weight="fill" size={24} aria-hidden="true" />, color: BRAND.green, value: BIZ.serviceCount, label: "Services" },
          { icon: <Wrench weight="fill" size={24} aria-hidden="true" />, color: BRAND.orange, value: "Fast", label: "Turnaround" },
        ].map((stat, i) => {
          const isHov = hoveredCard === i
          return (
            <div
              key={stat.label}
              role="listitem"
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setHoveredCard(isHov ? null : i)}
              aria-label={`${stat.value} ${stat.label}`}
              className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#081428] py-5 sm:py-6 px-3 sm:px-4 text-center transition-all duration-300 shadow-sm cursor-pointer"
              style={{ borderColor: isHov ? stat.color : undefined }}
            >
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-[14px] flex items-center justify-center border border-zinc-100 dark:border-zinc-800 mb-1 transition-colors duration-300"
                style={{
                  backgroundColor: isHov ? stat.color : "transparent",
                  color: isHov ? BRAND.white : "#9A9A9A",
                }}
              >
                {stat.icon}
              </div>
              <div
                className="font-black text-xl sm:text-2xl md:text-3xl transition-colors duration-300"
                style={{ color: isHov ? stat.color : undefined }}
              >
                {stat.value}
              </div>
              <div className="abh-label text-[0.62rem] sm:text-[0.72rem]">{stat.label}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
