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

const HUBS_DATA = [
  { name: "PrintHub",     icon: <Printer    size={44} weight="fill" aria-hidden="true" />, color: HUB_COLORS.print.primary },
  { name: "DocuHub",      icon: <FileText   size={44} weight="fill" aria-hidden="true" />, color: HUB_COLORS.doc.primary },
  { name: "DesignHub",    icon: <PaintBrush size={44} weight="fill" aria-hidden="true" />, color: HUB_COLORS.design.primary },
  { name: "E-ServiceHub", icon: <Globe      size={44} weight="fill" aria-hidden="true" />, color: HUB_COLORS.eservice.primary },
  { name: "TechHub",      icon: <Desktop    size={44} weight="fill" aria-hidden="true" />, color: HUB_COLORS.tech.primary },
]

export function HeroSection() {
  const router       = useRouter()
  const [activeHub,    setActiveHub]    = useState<number | null>(null)
  const [hoveredCard,  setHoveredCard]  = useState<number | null>(null)

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <section
      aria-label="Hero"
      /* 
        IMPROVEMENT 1: Increased top + bottom padding to hit the 120px–160px range.
        pt-[calc(var(--nav-h)+64px)] ensures space below fixed nav bars,scaling up beautifully on desktop.
      */
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

      <div className="max-w-[1240px] mx-auto flex flex-col items-center text-center relative z-10 w-full mb-8">

        <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-[4rem] text-brand-blue-dark dark:text-brand-light-blue leading-[1.15] mb-6 text-balance transition-all duration-300">
          {BIZ.tagline}
        </h1>

        {/* IMPROVEMENT 2: Limited description width strictly to max ~600px for enhanced scannability */}
        <p className="abh-body text-base md:text-xl mb-10 max-w-[600px] px-2">
          From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in {BIZ.location}.
        </p>

        {/* IMPROVEMENT 3: Established an intentional 16px-24px gap system between call-to-actions */}
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

        {/* 
          IMPROVEMENT 4: Core Hub Ecosystem Density Reduction 
          Removed the tight dividing line and introduced a clean, layered layout with 32px-48px gaps.
        */}
        <div className="abh-card w-full max-w-[840px] mx-auto p-6 sm:p-10 md:p-12 flex flex-col items-center bg-white/60 dark:bg-zinc-900/50 backdrop-blur-md">
          
          {/* Layer 1: Title + Description (Isolated with a clean bottom gap) */}
          <div className="w-full flex flex-col items-center mb-10 md:mb-12">
            <h2 className="abh-section-heading mb-3 text-center">Core Hub Ecosystem</h2>
            <p className="abh-body max-w-[520px] text-center">
              One platform. {BIZ.hubCount} hubs. Everything from printing to government services — done fast.
            </p>
          </div>

          {/* Layer 2: Icons (Widened the step layout to let items breathe cleanly) */}
          <div
            role="list"
            aria-label="Service hubs"
            className="flex flex-wrap sm:flex-nowrap justify-center items-center gap-8 sm:gap-14 md:gap-16 w-full mb-10 md:mb-12 px-2 py-2 overflow-visible"
          >
            {HUBS_DATA.map((hub, index) => {
              const isHovered = activeHub === index
              return (
                <div
                  key={hub.name}
                  role="listitem"
                  onMouseEnter={() => setActiveHub(index)}
                  onMouseLeave={() => setActiveHub(null)}
                  onFocus={() => setActiveHub(index)}
                  onBlur={() => setActiveHub(null)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleNavigate("/services") }}
                  tabIndex={0}
                  aria-label={hub.name}
                  className="relative flex flex-col items-center cursor-pointer select-none shrink-0 rounded-[14px]"
                >
                  <span
                    className="transition-all duration-300"
                    style={{
                      color:     isHovered ? hub.color : undefined,
                      transform: isHovered ? "translateY(-4px) scale(1.14)" : "none",
                      display:   "flex",
                    }}
                  >
                    <span className={cn("transition-colors duration-300", !isHovered && "text-zinc-700 dark:text-zinc-200")}>
                      {hub.icon}
                    </span>
                  </span>

                  {/* Tooltip */}
                  <div
                    role="tooltip"
                    className={cn(
                      "absolute top-full mt-3 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 bg-brand-blue-dark dark:bg-brand-white text-white dark:text-brand-blue-dark px-3 py-1.5 rounded-[8px] text-[0.72rem] font-black tracking-wide shadow-xl z-[100] whitespace-nowrap",
                      isHovered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1"
                    )}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-brand-blue-dark dark:border-b-brand-white" aria-hidden="true" />
                    {hub.name}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 
            Layer 3: Stats Layout
            Increased card padding (py-5 sm:py-6) and scaled up grid gaps (gap-4 sm:gap-6) 
            to match your premium breathing system rules.
          */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-[640px] mx-auto" role="list" aria-label="Key stats">
            {[
              { icon: <PlusCircle weight="fill" size={24} aria-hidden="true" />, color: BRAND.blue,   value: BIZ.hubCount,     label: "Hubs" },
              { icon: <Gear       weight="fill" size={24} aria-hidden="true" />, color: BRAND.green,  value: BIZ.serviceCount, label: "Services" },
              { icon: <Wrench     weight="fill" size={24} aria-hidden="true" />, color: BRAND.orange, value: "Fast",           label: "Turnaround" },
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
    /* 
      IMPROVEMENT 5: Updated Section CTA Padding
      Bumped the vertical padding from py-12 up to py-16 md:py-20 to ensure 
      it squarely lands within the 60px–80px breathing metric.
    */
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
 
