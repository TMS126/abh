"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
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

// One representative service per hub — keeps the spotlight grounded in real pricing, not abstract copy.
const HUBS_DATA = [
  {
    name: "Print Hub",
    short: "PrintHub",
    icon: <Printer size={32} weight="fill" aria-hidden="true" />,
    color: HUB_COLORS.print.primary,
    example: "Colour print",
    price: "R10",
    blurb: "Documents, photos, copies — ready while you wait.",
  },
  {
    name: "Docu Hub",
    short: "DocuHub",
    icon: <FileText size={32} weight="fill" aria-hidden="true" />,
    color: HUB_COLORS.doc.primary,
    example: "CV from scratch",
    price: "R30",
    blurb: "CVs, letters, affidavits, laminating — sorted properly.",
  },
  {
    name: "Design Hub",
    short: "DesignHub",
    icon: <PaintBrush size={32} weight="fill" aria-hidden="true" />,
    color: HUB_COLORS.design.primary,
    example: "Flyer design",
    price: "R150",
    blurb: "Logos, flyers, social posts that actually look designed.",
  },
  {
    name: "E-Service Hub",
    short: "E-ServiceHub",
    icon: <Globe size={32} weight="fill" aria-hidden="true" />,
    color: HUB_COLORS.eservice.primary,
    example: "SASSA SRD application",
    price: "R40",
    blurb: "SASSA, SARS, PSIRA, NSFAS — we know the forms so you don't have to.",
  },
  {
    name: "Tech Hub",
    short: "TechHub",
    icon: <Desktop size={32} weight="fill" aria-hidden="true" />,
    color: HUB_COLORS.tech.primary,
    example: "Virus removal",
    price: "R200",
    blurb: "Slow laptop, new PC, broken Windows — we fix it on the spot.",
  },
]

export function HeroSection() {
  const router = useRouter()
  const [activeHub, setActiveHub] = useState<number>(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  const active = HUBS_DATA[activeHub]

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
            backgroundColor: active.color,
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
        <div className="relative w-full py-3 overflow-hidden select-none pointer-events-none mb-12" aria-hidden="true">
          <div className="flex whitespace-nowrap animate-marquee w-max">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-10 px-4 shrink-0">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-4 text-brand-blue-dark dark:text-brand-light-blue font-black text-[0.78rem] uppercase tracking-widest">
                    <span>{item}</span>
                    <span className="text-brand-orange font-black text-base leading-none">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Core Hub Ecosystem — interactive spotlight */}
        <div className="abh-card w-full max-w-[840px] mx-auto p-6 sm:p-10 md:p-12 flex flex-col items-center bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md">

          <div className="w-full flex flex-col items-center mb-8 md:mb-10">
            <h2 className="abh-section-heading mb-2 text-center">Core Hub Ecosystem</h2>
            <p className="abh-body text-sm max-w-[420px]">Tap a hub to see what we actually do there.</p>
          </div>

          {/* Hub selector row */}
          <div
            role="tablist"
            aria-label="Service hubs"
            className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 w-full mb-6 px-1"
          >
            {HUBS_DATA.map((hub, index) => {
              const isActive = activeHub === index
              return (
                <button
                  key={hub.name}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={hub.name}
                  onClick={() => setActiveHub(index)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 px-3 sm:px-4 py-4 rounded-[14px] border transition-all duration-300 flex-1 min-w-[64px] sm:min-w-[80px]",
                    isActive
                      ? "border-transparent shadow-md"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                  )}
                  style={{
                    backgroundColor: isActive ? `${hub.color}14` : undefined,
                  }}
                >
                  <span
                    className="transition-all duration-300"
                    style={{
                      color: isActive ? hub.color : undefined,
                      transform: isActive ? "translateY(-2px) scale(1.08)" : "none",
                      display: "flex",
                    }}
                  >
                    <span className={cn("transition-colors duration-300", !isActive && "text-zinc-400 dark:text-zinc-500")}>
                      {hub.icon}
                    </span>
                  </span>
                  <span
                    className={cn("text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-wide transition-colors duration-300 leading-tight text-center", !isActive && "text-zinc-400 dark:text-zinc-500")}
                    style={{ color: isActive ? hub.color : undefined }}
                  >
                    {hub.short}
                  </span>
                  {isActive && (
                    <span
                      className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full"
                      style={{ backgroundColor: hub.color }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Spotlight panel — changes with selected hub */}
          <div
            key={activeHub}
            className="w-full max-w-[560px] rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#081428] px-5 sm:px-7 py-5 sm:py-6 mb-10 md:mb-12 text-left transition-all duration-300 animate-in fade-in slide-in-from-bottom-1"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="text-sm sm:text-base font-bold text-zinc-700 dark:text-zinc-200 leading-snug max-w-[380px]">
                {active.blurb}
              </p>
              <div className="shrink-0 text-right">
                <p className="text-[0.62rem] font-black uppercase tracking-wide text-zinc-400 mb-0.5">{active.example}</p>
                <p className="text-lg sm:text-xl font-black" style={{ color: active.color }}>{active.price}</p>
              </div>
            </div>
            <button
              onClick={() => handleNavigate("/services")}
              className="inline-flex items-center gap-1.5 text-[0.78rem] font-black mt-1 transition-opacity hover:opacity-70"
              style={{ color: active.color }}
            >
              See all {active.name} services
              <ArrowRight weight="bold" className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Stats */}
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
                  aria-label={`${stat.value} ${stat.label}`}
                  className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#081428] py-5 sm:py-6 px-3 sm:px-4 text-center transition-all duration-300 shadow-sm"
                  style={{ borderColor: isHov ? stat.color : undefined }}
                >
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-[14px] flex items-center justify-center border border-zinc-100 dark:border-zinc-800 mb-1 transition-colors duration-300"
                    style={{ backgroundColor: isHov ? stat.color : "transparent", color: isHov ? BRAND.white : stat.color }}
                  >
                    {stat.icon}
                  </div>
                  <div className="font-black text-xl sm:text-2xl md:text-3xl" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="abh-label text-[0.62rem] sm:text-[0.72rem]">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CtaBar({
  title,
  description,
  buttonText,
  buttonHref,
  onButtonClick,
}: {
  title: string
  description: string
  buttonText: string
  buttonHref?: string
  onButtonClick?: () => void
}) {
  const router = useRouter()
  return (
    <section aria-label="Call to action" className="px-4 md:px-8 py-16 md:py-20 transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950/50">
      <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="abh-section-heading mb-3">{title}</h2>
          <p className="abh-body max-w-[500px]">{description}</p>
        </div>
        <button
          onClick={() => {
            onButtonClick?.()
            if (buttonHref) {
              router.push(buttonHref)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          }}
          className="abh-btn-primary"
        >
          {buttonText}
          <ArrowRight weight="bold" size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
 
