"use client"

import { useState } from "react"
import {
  Target,
  Heart,
  Lightning,
  WhatsappLogo,
  ShieldCheck,
  Desktop,
  Printer,
  DeviceMobile,
  ArrowRight,
  UsersThree,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, ABOUT_VALUES, ABOUT_STANDARDS } from "@/lib/brand"

function renderIcon(iconName: string, className: string) {
  switch (iconName) {
    case "Target":       return <Target       weight="fill" className={className} aria-hidden="true" />
    case "Heart":        return <Heart        weight="fill" className={className} aria-hidden="true" />
    case "Lightning":    return <Lightning    weight="fill" className={className} aria-hidden="true" />
    case "Desktop":      return <Desktop      weight="fill" className={className} aria-hidden="true" />
    case "Printer":      return <Printer      weight="fill" className={className} aria-hidden="true" />
    case "DeviceMobile": return <DeviceMobile weight="fill" className={className} aria-hidden="true" />
    default:             return <Target       weight="fill" className={className} aria-hidden="true" />
  }
}

export function AboutPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">

      {/* ── Header ── */}
      <section className="px-4 md:px-8 pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center">
        <div className="max-w-[1248px] mx-auto flex flex-col items-center">

          <h1 className="abh-page-title mb-3">About Us</h1>

          <p className="abh-tagline max-w-xl mx-auto">
            A local business built on community, trust, and real help — right here in Kgotsong.
          </p>

          <div className="abh-divider mx-auto" />

          {/* Stats strip — bordered card grid */}
          <div className="mt-10 w-full max-w-[560px] mx-auto grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-[14px] overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
            {[
              { value: BIZ.hubCount,     label: "Service Hubs",  hoverColor: "#1E6FA8" },
              { value: BIZ.serviceCount, label: "Services",      hoverColor: "#6FBF1A" },
              { value: "Since 2023",     label: "Est. Kgotsong", hoverColor: "#F4A261" },
            ].map((s, i) => (
              <div
                key={i}
                className="group flex flex-col items-center justify-center py-5 px-3 transition-colors duration-200 cursor-default hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
              >
                <p
                  className="font-sans font-black text-xl leading-none text-zinc-800 dark:text-zinc-100 transition-colors duration-200"
                  style={{ color: undefined }}
                  onMouseEnter={e => (e.currentTarget.style.color = s.hoverColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = "")}
                >
                  {s.value}
                </p>
                <p className="text-[0.62rem] font-medium uppercase tracking-widest text-zinc-400 mt-1.5 text-center">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="px-4 md:px-8 py-14 md:py-16" aria-label="Our story">
        <div className="max-w-[980px] mx-auto">

          {/* Pull quote — centered */}
          <div className="mb-12 text-center max-w-[720px] mx-auto">
            <p className="font-sans font-semibold text-lg md:text-xl leading-snug text-zinc-700 dark:text-zinc-300 italic">
              "Not everyone is tech-savvy — and that's exactly why we're here."
            </p>
            <p className="abh-body mt-4 text-sm max-w-lg mx-auto text-center">
              We started with one goal: make technology, design, and important government services
              accessible to everyone in Kgotsong — no jargon, no stress, no overcharging.
            </p>
          </div>

          {/* Two-column — values + overview card */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">

            {/* Values list */}
            <ul className="flex flex-col gap-6" aria-label="Our values">
              {ABOUT_VALUES.map((item, index) => (
                <li key={index} className="flex gap-4 items-start group">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${BRAND.blue}15`, color: BRAND.blue }}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-5 h-5")}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-sans font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-1">
                      {item.title}
                    </h3>
                    <p className="abh-body text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Business overview card */}
            <div
              className="rounded-[14px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-7 shadow-sm"
              aria-label="Business overview"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 mb-7 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${BRAND.blue}15`, color: BRAND.blue }}
                >
                  <UsersThree size={20} weight="fill" />
                </div>
                <div>
                  <p className="font-sans font-semibold text-sm text-zinc-800 dark:text-zinc-200 leading-none">
                    {BIZ.name}
                  </p>
                  <p className="text-[0.62rem] font-medium uppercase tracking-widest text-zinc-400 mt-0.5">
                    Serving Kgotsong &amp; surrounds
                  </p>
                </div>
              </div>

              {/* 2×2 stat grid — equal sizing */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: BIZ.hubCount,      label: "Hubs"              },
                  { value: BIZ.serviceCount,  label: "Services"          },
                  { value: <WhatsappLogo weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "WhatsApp Ready"    },
                  { value: <ShieldCheck  weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "Community Trusted" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-[12px] p-5 flex flex-col justify-center items-center min-h-[90px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
                  >
                    <div className="font-black text-xl mb-1 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                      {stat.value}
                    </div>
                    <p className="text-[0.6rem] font-medium uppercase tracking-widest text-zinc-400 text-center">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer note */}
              <p className="text-[0.72rem] font-medium text-zinc-400 dark:text-zinc-500 mt-6 leading-relaxed text-center">
                Walk-ins welcome · WhatsApp orders accepted · Same-day service on most requests
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Standards ── */}
      <section
        className="py-14 md:py-16 px-4 md:px-8 bg-zinc-50/60 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800/60"
        aria-labelledby="standards-title"
      >
        <div className="max-w-[980px] mx-auto">

          {/* Section heading — centered */}
          <div className="text-center mb-10">
            <h2
              id="standards-title"
              className="font-sans font-black text-2xl md:text-3xl tracking-tight text-zinc-900 dark:text-zinc-50 mb-3"
            >
              Our Everyday Toolkit
            </h2>
            <p className="abh-tagline max-w-md mx-auto text-center">
              Professional accuracy, hand-finished local care — how we actually do the work.
            </p>
            <div className="mt-6 h-px bg-zinc-200 dark:bg-zinc-800 max-w-[120px] mx-auto" />
          </div>

          {/* 4-card grid — equal height, equal padding */}
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
            aria-label="Standards"
          >
            {ABOUT_STANDARDS.map((item) => {
              const isHovered = hoveredCard === item.id
              return (
                <li
                  key={item.id}
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onFocus={() => setHoveredCard(item.id)}
                  onBlur={() => setHoveredCard(null)}
                  tabIndex={0}
                  className={cn(
                    "abh-card p-6 flex flex-col h-full outline-none transition-all duration-300 rounded-[14px] bg-white dark:bg-zinc-950 border",
                    isHovered
                      ? "border-[#1E6FA8] shadow-lg -translate-y-1.5"
                      : "border-zinc-200 dark:border-zinc-800 shadow-[0_1px_6px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.2)]"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-[12px] flex items-center justify-center mb-5 transition-all duration-300 border shrink-0",
                      isHovered
                        ? "bg-[#1E6FA8] text-white border-transparent scale-110"
                        : "bg-white dark:bg-zinc-900 text-[#1E6FA8] border-zinc-100 dark:border-zinc-800"
                    )}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-5 h-5")}
                  </div>
                  <h3 className="font-sans font-semibold text-sm leading-tight mb-2 text-zinc-800 dark:text-zinc-200">
                    {item.title}
                  </h3>
                  <p className="abh-body text-xs leading-relaxed grow">
                    {item.description}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Mission ── */}
      <section
        className="relative overflow-hidden px-4 md:px-8 py-16 md:py-20 text-center"
        aria-labelledby="mission-title"
      >
        {/* Subtle gradient wash */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.green} 50%, ${BRAND.orange} 100%)`,
            }}
          />
        </div>

        <div className="relative max-w-[680px] mx-auto flex flex-col items-center">
          <span
            className="inline-block text-[0.65rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${BRAND.blue}12`, color: BRAND.blue }}
          >
            Our Mission
          </span>

          <h2
            id="mission-title"
            className="font-sans font-black text-2xl md:text-3xl leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 mb-5"
          >
            Bridging the digital gap — one person at a time.
          </h2>

          <p className="abh-body max-w-lg mx-auto mb-10 text-center text-sm leading-relaxed">
            ApexbytesHub is that bridge — printing, design, IT support, and government services
            brought to people who need them most, in a community that deserves better access.
          </p>

          <a
            href="/services"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] font-black text-sm text-white transition-all duration-300 active:scale-95 hover:-translate-y-0.5 shadow-lg"
            style={{ backgroundColor: BRAND.blue }}
          >
            See All Services
            <ArrowRight size={16} weight="bold" />
          </a>
        </div>
      </section>

    </div>
  )
}
 
