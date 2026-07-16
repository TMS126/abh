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
import { cn } from "@/lib/utils"
import { BRAND, BIZ, ABOUT_VALUES, ABOUT_STANDARDS } from "@/lib/brand"

// Color hierarchy for this page (per site-wide rule: blue dominant, green
// less, orange least — reserved for highlights/CTAs only):
// - BLUE:   stats strip, icon chips, card headers, Standards border on hover
// - GREEN:  Values list icons (rest), AND now the hover-accent color for
//           Standards' icon chip + the stats strip's fill (see below)
// - ORANGE: the final "See All Services" CTA button only
//
// FIX: both BLUE and ORANGE are now fixed single values instead of
// light/dark theme pairs — no longer swapping to a lighter pastel in dark
// mode. Orange changed from orangeDark/lightOrange to orangeBrown, a
// deliberately more muted middle tone (neither the deep/dark accessible
// variant nor the brighter default).
const ABOUT_BLUE   = BRAND.blue
const ABOUT_GREEN  = BRAND.green
const ABOUT_ORANGE = BRAND.orangeBrown
// Neutral used for Standards cards at rest — only picks up an accent on
// hover, so color reads as a deliberate highlight rather than a flat default.
const ABOUT_NEUTRAL = { light: BRAND.dark100, dark: BRAND.techGreyDark }

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

// Picks white or near-black text against a given background hex, based on
// actual WCAG relative luminance.
function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const contrastWhite = 1.05 / (luminance + 0.05)
  const contrastDark  = (luminance + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#18181b"
}

export function AboutPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [statsHovered, setStatsHovered] = useState(false)

  const blueColor    = ABOUT_BLUE
  const blueText     = getReadableTextColor(blueColor)
  const greenColor   = ABOUT_GREEN
  const greenText    = getReadableTextColor(greenColor)
  const orangeColor  = ABOUT_ORANGE
  const orangeText   = getReadableTextColor(orangeColor)
  // Neutral still needs the theme, so this one stays resolvedTheme-based —
  // isolated to its own tiny check rather than pulling in useTheme for the
  // whole component now that blue/orange are fixed.
  const [isDark, setIsDark] = useState(false)
  // (kept for the neutral icon color below; see note near ABOUT_NEUTRAL)

  const neutralColor = isDark ? ABOUT_NEUTRAL.dark : ABOUT_NEUTRAL.light

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">

      {/* ── Header ── */}
      <section className="px-4 md:px-8 pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center">
        <div className="max-w-[1248px] mx-auto flex flex-col items-center">

          <h1 className="abh-page-title mb-3">About Us</h1>

          <p className="abh-tagline max-w-xl mx-auto">
            A local business built on community, trust, and real help — right here in Kgotsong.
          </p>

          {/* Divider moved back below the tagline, matching the title →
              tagline → divider order used on Services/Gallery. */}
          <div className="abh-divider mx-auto mt-3" />

          {/* Stats strip — border-only blue at rest. On hover, fill is now
              GREEN (was blue) while the border itself stays blue, matching
              "icon bg green on hover, otherwise things blue as they are"
              applied here: the border/structural blue never changes, only
              the accent fill does. */}
          <div
            className={cn(
              "mt-10 w-full max-w-[560px] mx-auto grid grid-cols-3 divide-x rounded-[14px] overflow-hidden shadow-lg transition-colors duration-200 border-2",
              statsHovered ? "divide-white/25" : "divide-zinc-200 dark:divide-zinc-700"
            )}
            style={{
              backgroundColor: statsHovered ? greenColor : "transparent",
              borderColor: blueColor,
            }}
            onMouseEnter={() => setStatsHovered(true)}
            onMouseLeave={() => setStatsHovered(false)}
          >
            {[
              { value: BIZ.hubCount,     label: "Service Hubs"  },
              { value: BIZ.serviceCount, label: "Services"      },
              { value: "Since 2023",     label: "Est. Kgotsong" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-5 px-3 transition-colors duration-200 cursor-default"
              >
                <p
                  className="font-sans font-black text-xl leading-none transition-colors duration-200"
                  style={{ color: statsHovered ? greenText : blueColor }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[0.62rem] font-medium uppercase tracking-widest mt-1.5 text-center transition-colors duration-200"
                  style={{ color: statsHovered ? `${greenText}b3` : `${blueColor}b3` }}
                >
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
            <p className="font-sans font-semibold text-lg md:text-xl leading-snug text-zinc-700 dark:text-zinc-300">
              "Not everyone is tech-savvy — and that's exactly why we're here."
            </p>
            <p className="abh-body mt-4 text-sm max-w-lg mx-auto text-center">
              We started with one goal: make technology, design, and important government services
              accessible to everyone in Kgotsong — no jargon, no stress, no overcharging.
            </p>
          </div>

          {/* Two-column — values + overview card, stretched to equal height */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">

            {/* Values list — icons are GREEN */}
            <ul className="flex flex-col justify-between gap-0" aria-label="Our values">
              {ABOUT_VALUES.map((item, index) => (
                <li key={index} className="flex gap-4 items-start group">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${greenColor}15`, color: greenColor }}
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

            {/* Business overview card — header icon is BLUE */}
            <div
              className="rounded-[14px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-7 shadow-sm flex flex-col"
              aria-label="Business overview"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 mb-7 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${blueColor}15`, color: blueColor }}
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

              {/* 2×2 stat grid — kept neutral, not part of the blue/green/orange set */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {[
                  { value: BIZ.hubCount,      label: "Hubs"              },
                  { value: BIZ.serviceCount,  label: "Services"          },
                  { value: <WhatsappLogo weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "WhatsApp Ready"    },
                  { value: <ShieldCheck  weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "Community Trusted" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="rounded-[12px] p-5 flex flex-col justify-center items-center border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
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

          {/* 4-card grid — neutral at rest, border goes BLUE on hover
              (unchanged — border stays "blue as they are"), but the icon
              chip fill now goes GREEN on hover instead of blue. */}
          <ul
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
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
                      ? "shadow-lg -translate-y-1.5"
                      : "border-zinc-200 dark:border-zinc-800 shadow-[0_1px_6px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_6px_rgba(0,0,0,0.2)]"
                  )}
                  style={isHovered ? { borderColor: blueColor } : undefined}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-[12px] flex items-center justify-center mb-5 transition-all duration-300 border shrink-0",
                      isHovered
                        ? "text-white border-transparent scale-110"
                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                    )}
                    style={isHovered ? { backgroundColor: greenColor, color: greenText } : { color: neutralColor }}
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
        {/* Subtle gradient wash — updated to the blue→green→orange hierarchy */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              background: `linear-gradient(135deg, ${blueColor} 0%, ${greenColor} 50%, ${orangeColor} 100%)`,
            }}
          />
        </div>

        <div className="relative max-w-[680px] mx-auto flex flex-col items-center">
          {/* Badge — BLUE, not orange (orange reserved for the CTA only) */}
          <span
            className="inline-block text-[0.65rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: `${blueColor}12`, color: blueColor }}
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

          {/* CTA — the ONLY orange element on this page, now the more
              muted orangeBrown fixed in both themes. */}
          <a
            href="/services"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] font-black text-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 shadow-lg"
            style={{ backgroundColor: orangeColor, color: orangeText }}
          >
            See All Services
            <ArrowRight size={16} weight="bold" />
          </a>
        </div>
      </section>

    </div>
  )
                                 } 
