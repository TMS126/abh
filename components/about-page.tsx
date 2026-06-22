"use client"

import { useState } from "react"
import { Target, Heart, Lightning, WhatsappLogo, ShieldCheck, Desktop, Printer, DeviceMobile, ArrowRight, MapPin, UsersThree } from "@phosphor-icons/react"
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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 pt-[var(--nav-h)]">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 md:px-8 pt-16 pb-16 md:pt-20 md:pb-20"
        aria-labelledby="about-title"
      >
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07] dark:opacity-[0.10]"
            style={{ background: `radial-gradient(circle, ${BRAND.blue} 0%, transparent 70%)` }}
          />
          <div
            className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.06] dark:opacity-[0.09]"
            style={{ background: `radial-gradient(circle, ${BRAND.orange} 0%, transparent 70%)` }}
          />
        </div>

        <div className="relative max-w-[900px] mx-auto text-center">
          {/* Eyebrow */}
          <span
            className="inline-flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${BRAND.blue}12`, color: BRAND.blue }}
          >
            <MapPin size={12} weight="fill" />
            Kgotsong, Bothaville · Free State
          </span>

          {/* h1 — standard size */}
          <h1
            id="about-title"
            className="font-sans font-black text-2xl md:text-3xl leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 mb-6"
          >
            Built right here, for right here.
          </h1>

          <p className="abh-tagline max-w-2xl mx-auto">
            ApexbytesHub is your neighbourhood's one-stop hub — printing, design, IT, and government services, handled personally by someone who actually lives in your community.
          </p>

          <div className="abh-divider" aria-hidden="true" />

          {/* Stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-2">
            {[
              { value: BIZ.hubCount,     label: "Service Hubs" },
              { value: BIZ.serviceCount, label: "Services" },
              { value: "Since 2026",     label: "Est. Kgotsong" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-sans font-black text-2xl leading-none text-zinc-900 dark:text-zinc-50">{s.value}</p>
                <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 py-16 md:py-20" aria-label="Our story">
        <div className="max-w-[1100px] mx-auto">

          {/* Pull quote */}
          <div className="mb-8 text-center md:text-left max-w-[800px]">
            <p className="font-sans font-black text-xl md:text-2xl leading-tight text-zinc-900 dark:text-zinc-50">
              "Not everyone is tech-savvy — and that's exactly why we're here."
            </p>
            <p className="abh-body mt-5 text-sm max-w-xl">
              We started with one goal: make technology, design, and important government services accessible to everyone in Kgotsong — no jargon, no stress, no overcharging.
            </p>
          </div>

          {/* Two-column: values + stat card */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">

            {/* Values list — all use BRAND.blue */}
            <ul className="flex flex-col gap-7" aria-label="Our values">
              {ABOUT_VALUES.map((item, index) => (
                <li key={index} className="flex gap-5 items-start group">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${BRAND.blue}15`, color: BRAND.blue }}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-5 h-5")}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-sans font-black text-sm text-zinc-900 dark:text-zinc-50 mb-1">{item.title}</h3>
                    <p className="abh-body text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Stat card — rounded-[14px], bg-white dark:bg-zinc-950 */}
            <div
              className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-sm"
              aria-label="Business overview"
            >
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                  style={{ backgroundColor: `${BRAND.blue}15`, color: BRAND.blue }}
                >
                  <UsersThree size={20} weight="fill" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-sans font-black text-sm text-zinc-900 dark:text-zinc-50 leading-none">ApexbytesHub</p>
                  <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 mt-0.5">Serving Kgotsong &amp; surrounds</p>
                </div>
              </div>

              {/* Stats — all text-zinc-900, no per-stat accent colors */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: BIZ.hubCount,                                                                    label: "Hubs" },
                  { value: BIZ.serviceCount,                                                                label: "Services" },
                  { value: <WhatsappLogo weight="fill" className="w-6 h-6" aria-hidden="true" />,           label: "WhatsApp Ready" },
                  { value: <ShieldCheck  weight="fill" className="w-6 h-6" aria-hidden="true" />,           label: "Community Trusted" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-[14px] p-5 text-center flex flex-col justify-center items-center min-h-[96px] border border-zinc-100 dark:border-zinc-800 bg-background"
                  >
                    <div className="font-black text-2xl mb-1 flex items-center justify-center text-zinc-900 dark:text-zinc-50">
                      {stat.value}
                    </div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-[0.65rem] font-medium text-zinc-400 dark:text-zinc-500 mt-6 leading-relaxed text-center uppercase tracking-widest">
                Walk-ins welcome · WhatsApp orders · Same-day service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Standards ─────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 bg-zinc-50/60 dark:bg-zinc-900/20" aria-labelledby="standards-title">
        <div className="max-w-[680px] mx-auto">
          <div className="text-center mb-8">
            <h2 id="standards-title" className="abh-section-heading mb-4">Our Everyday Toolkit</h2>
            <p className="abh-tagline max-w-xl mx-auto">
              Professional accuracy, hand-finished local care — how we actually do the work.
            </p>
            <div className="abh-divider" aria-hidden="true" />
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5" aria-label="Standards">
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
                    "rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col h-full outline-none transition-all duration-200 shadow-sm",
                    isHovered ? "border-brand-blue shadow-md -translate-y-1" : ""
                  )}
                >
                  {/* Icon — text-brand-blue always visible in dark mode */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-[12px] flex items-center justify-center mb-4 transition-all duration-200 shrink-0",
                      isHovered
                        ? "bg-brand-blue text-white"
                        : "text-brand-blue"
                    )}
                    style={{ backgroundColor: isHovered ? BRAND.blue : `${BRAND.blue}15` }}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-5 h-5")}
                  </div>
                  <h3 className="font-sans font-black text-sm leading-tight mb-2 text-zinc-900 dark:text-zinc-50">{item.title}</h3>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed grow">{item.description}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 md:px-8 py-16 md:py-20" aria-labelledby="mission-title">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{ background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.green} 50%, ${BRAND.orange} 100%)` }}
          />
        </div>

        <div className="relative max-w-[740px] mx-auto text-center">
          <span
            className="inline-block text-[0.65rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${BRAND.blue}12`, color: BRAND.blue }}
          >
            Our Mission
          </span>

          <h2
            id="mission-title"
            className="font-sans font-black text-xl md:text-2xl leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 mb-6"
          >
            Bridging the digital gap — one person at a time.
          </h2>

          <p className="abh-body max-w-xl mx-auto mb-8">
            ApexbytesHub is that bridge — printing, design, IT support, and government services brought to people who need them most, in a community that deserves better access.
          </p>

          <a
            href="/services"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] font-black text-sm text-white transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm"
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
