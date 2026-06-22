"use client"

import { useState } from "react"
import { Target, Heart, Lightning, WhatsappLogo, ShieldCheck, Desktop, Printer, Scissors, DeviceMobile, ArrowRight, MapPin, UsersThree, Handshake } from "@phosphor-icons/react"
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
    case "Scissors":     return <Scissors     weight="fill" className={className} aria-hidden="true" />
    case "DeviceMobile": return <DeviceMobile weight="fill" className={className} aria-hidden="true" />
    default:             return <Target       weight="fill" className={className} aria-hidden="true" />
  }
}

export function AboutPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 pt-[var(--nav-h)]">

      {/* ── Hero — full-bleed with diagonal accent ───────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 md:px-8 pt-20 pb-24 md:pt-28 md:pb-32"
        aria-labelledby="about-title"
      >
        {/* Ambient gradient blobs — personality without noise */}
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
            className="inline-flex items-center gap-2 text-[0.7rem] font-black uppercase tracking-[0.18em] px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${BRAND.blue}12`, color: BRAND.blue }}
          >
            <MapPin size={12} weight="fill" />
            Kgotsong, Bothaville · Free State
          </span>

          <h1
            id="about-title"
            className="font-sans font-black text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-zinc-900 dark:text-zinc-50 mb-6"
          >
            Built right here,{" "}
            <span style={{ color: BRAND.orange }}>for right here.</span>
          </h1>

          <p className="abh-tagline max-w-2xl mx-auto text-lg md:text-xl">
            {BIZ.name} is your neighbourhood's one-stop hub — printing, design, IT, and government services, handled personally by someone who actually lives in your community.
          </p>

          <div className="abh-divider" aria-hidden="true" />

          {/* Quick stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-2">
            {[
              { value: BIZ.hubCount,       label: "Service Hubs",    color: BRAND.blue },
              { value: BIZ.serviceCount,   label: "Services",        color: BRAND.green },
              { value: "Since 2026",       label: "Est. Kgotsong",   color: BRAND.orange },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-sans font-black text-3xl md:text-4xl leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story — wide pull-quote with values aside ─────────────────────────── */}
      <section className="px-4 md:px-8 py-16 md:py-24" aria-label="Our story">
        <div className="max-w-[1100px] mx-auto">

          {/* Pull quote — the thing people remember */}
          <div className="mb-16 md:mb-20 text-center md:text-left max-w-[800px]">
            <p
              className="font-sans font-black text-2xl md:text-3xl lg:text-4xl leading-tight text-zinc-900 dark:text-zinc-50"
            >
              "Not everyone is tech-savvy —{" "}
              <span style={{ color: BRAND.orange }}>and that's exactly why we're here.</span>"
            </p>
            <p className="abh-body mt-5 text-base max-w-xl">
              We started with one goal: make technology, design, and important government services accessible to everyone in Kgotsong — no jargon, no stress, no overcharging.
            </p>
          </div>

          {/* Two-column: values + stat card */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">

            {/* Values list */}
            <ul className="flex flex-col gap-7" aria-label="Our values">
              {ABOUT_VALUES.map((item, index) => (
                <li key={index} className="flex gap-5 items-start group">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green }}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-6 h-6")}
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-sans font-black text-base text-zinc-900 dark:text-zinc-50 mb-1">{item.title}</h3>
                    <p className="abh-body text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
              {/* Extra human touch — what the data doesn't say */}
              <li className="flex gap-5 items-start group">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${BRAND.green}15`, color: BRAND.green }}
                  aria-hidden="true"
                >
                  <Handshake weight="fill" className="w-6 h-6" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-sans font-black text-base text-zinc-900 dark:text-zinc-50 mb-1">You Deal With The Founder</h3>
                  <p className="abh-body text-sm">No middlemen, no call centres. When you contact us, you're speaking directly to Theji — the person who does the work.</p>
                </div>
              </li>
            </ul>

            {/* Stat card — refined, not a 2x2 grid */}
            <div
              className="rounded-[20px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8 shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]"
              aria-label="Business overview"
            >
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                  style={{ backgroundColor: `${BRAND.blue}15` }}
                >
                  <UsersThree size={20} weight="fill" style={{ color: BRAND.blue }} />
                </div>
                <div>
                  <p className="font-sans font-black text-base text-zinc-900 dark:text-zinc-50 leading-none">{BIZ.name}</p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">Serving Kgotsong &amp; surrounds</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: BIZ.hubCount,                                                                                    label: "Hubs",             accent: BRAND.blue },
                  { value: BIZ.serviceCount,                                                                                label: "Services",         accent: BRAND.green },
                  { value: <WhatsappLogo weight="fill" className="w-7 h-7" aria-hidden="true" />,                           label: "WhatsApp Ready",   accent: BRAND.whatsapp },
                  { value: <ShieldCheck  weight="fill" className="w-7 h-7" aria-hidden="true" />,                           label: "Community Trusted", accent: BRAND.orange },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-zinc-950 rounded-[14px] p-5 text-center flex flex-col justify-center items-center min-h-[96px] border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="font-black text-3xl mb-1 flex items-center justify-center" style={{ color: stat.accent }}>
                      {stat.value}
                    </div>
                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-6 leading-relaxed text-center">
                Walk-ins welcome · WhatsApp orders accepted · Same-day service on most requests
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Standards — CENTERED 4-card grid on desktop ───────────────────────── */}
      {/* max-w-3xl (768px) gives each of the 4 cards ~180px which is comfortable
          and sits visually centred on any viewport wider than 768px. */}
      <section
        className="py-20 px-4 bg-zinc-50/60 dark:bg-zinc-900/20"
        aria-labelledby="standards-title"
      >
        <div className="max-w-[860px] mx-auto">
          <div className="text-center mb-14">
            <h2 id="standards-title" className="abh-section-heading mb-4">Our Everyday Toolkit</h2>
            <p className="abh-tagline max-w-xl mx-auto">
              Professional accuracy, hand-finished local care — how we actually do the work.
            </p>
            <div className="abh-divider" aria-hidden="true" />
          </div>

          {/* 4 cards — on md+ they sit in a centred 4-column row.
              max-w-[860px] on the container means the row is never wider
              than the content needs, so it doesn't spread and look sparse. */}
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
                    "abh-card p-6 flex flex-col h-full outline-none transition-all duration-300",
                    isHovered ? "border-brand-blue shadow-lg -translate-y-1.5" : "shadow-[0_1px_6px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.2)]"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-[12px] flex items-center justify-center mb-5 transition-all duration-300 border shrink-0",
                      isHovered
                        ? "bg-brand-blue text-white border-transparent scale-110"
                        : "bg-white dark:bg-zinc-900 text-brand-blue border-zinc-100 dark:border-zinc-800"
                    )}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-5 h-5")}
                  </div>
                  <h3 className="font-sans font-black text-sm leading-tight mb-2 text-zinc-900 dark:text-zinc-50">{item.title}</h3>
                  <p className="abh-body text-xs leading-relaxed grow">{item.description}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Mission — gradient strip, not another flat card ───────────────────── */}
      <section
        className="relative overflow-hidden px-4 md:px-8 py-20 md:py-28"
        aria-labelledby="mission-title"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{ background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.green} 50%, ${BRAND.orange} 100%)` }}
          />
        </div>

        <div className="relative max-w-[740px] mx-auto text-center">
          <span
            className="inline-block text-[0.7rem] font-black uppercase tracking-[0.18em] px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${BRAND.blue}12`, color: BRAND.blue }}
          >
            Our Mission
          </span>

          <h2
            id="mission-title"
            className="font-sans font-black text-3xl md:text-5xl leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 mb-6"
          >
            Bridging the digital gap —{" "}
            <span style={{ color: BRAND.orange }}>one person at a time.</span>
          </h2>

          <p className="abh-body text-base md:text-lg max-w-xl mx-auto mb-10">
            {BIZ.name} is that bridge — printing, design, IT support, and government services brought to people who need them most, in a community that deserves better access.
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
 
