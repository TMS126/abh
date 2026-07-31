"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
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
import { ScrollBounce } from "@/components/scroll-bounce"

const PAGE_BG_LIGHT = "#FFFFFF"
const PAGE_BG_DARK  = "#0D1B2A"

const ABOUT_ORANGE = BRAND.orangeDark

// Real WCAG relative luminance → white or near-black text, whichever
// actually reads against the given blue. Every card on this page now
// fills with that blue, so every piece of text/icon sitting on a card
// needs to run through this instead of assuming a fixed color.
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

// ─── Team ──────────────────────────────────────────────────────────────────
const TEAM = [
  { initials: "TM", name: "Theji M.", role: "Owner", note: "Runs Everything" },
  { initials: "FK", name: "Faith K.", role: "Print & Docu Hub Assistant", note: "Helps with printing, copying,  laminating & sending emails" },
  { initials: "MM", name: "Macky M.", role: "Print Hub Assistant", note: "Helps with printing, copying, typing services" },
  { initials: "RK", name: "Rethabile K.", role: "Print Hub Assistant", note: "Helps with copying, printing, laminating & sending emails" },
] as const

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
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === "dark"

  const orangeColor = ABOUT_ORANGE
  const orangeText  = "#ffffff"

  // Single source of truth for every card on this page: solid blue fill,
  // same shadow, no more zinc/white/grey surfaces and no hover color swap.
  const cardBlue = isDark ? BRAND.lightBlue : BRAND.blue
  const cardText = getReadableTextColor(cardBlue)
  const cardSubtext = cardText === "#ffffff" ? "rgba(255,255,255,0.8)" : "rgba(24,24,27,0.7)"
  const cardMuted = cardText === "#ffffff" ? "rgba(255,255,255,0.55)" : "rgba(24,24,27,0.5)"

  // Same shadow language as the reference screenshot — soft, rounded-top,
  // no border needed since the fill itself is now the card's identity.
  const cardShadow = isDark
    ? "0 10px 28px -10px rgba(0,0,0,0.5)"
    : "0 10px 24px -10px rgba(0,0,0,0.18)"

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">

      {/* ── Header ── */}
      <section className="px-4 md:px-8 pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center">
        <div className="max-w-[1248px] mx-auto flex flex-col items-center">

          <ScrollBounce>
            <h1 className="abh-page-title mb-3">About Us</h1>
          </ScrollBounce>

          <p className="abh-tagline max-w-xl mx-auto">
            A local business built on community, trust, and real help — right here in Kgotsong.
          </p>

          <div className="abh-divider" />

          {/* Stats */}
          <ScrollBounce delay={0.1}>
            <div className="mt-8 w-full max-w-[560px] mx-auto grid grid-cols-3 gap-3">
              {[
                { value: BIZ.hubCount,     label: "Service Hubs"  },
                { value: BIZ.serviceCount, label: "Services"      },
                { value: "Since 2023",     label: "Est. Kgotsong" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center py-5 px-3 text-center rounded-[14px]"
                  style={{ backgroundColor: cardBlue, boxShadow: cardShadow }}
                >
                  <p className="font-sans font-black text-xl leading-none" style={{ color: cardText }}>
                    {s.value}
                  </p>
                  <p className="text-[0.62rem] font-medium uppercase tracking-widest mt-1.5 text-center" style={{ color: cardSubtext }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollBounce>

        </div>
      </section>

      {/* ── Story ── */}
      <section className="px-4 md:px-8 py-14 md:py-16" aria-label="Our story">
        <div className="max-w-[980px] mx-auto">

          <ScrollBounce delay={0.15}>
            <div className="mb-12 text-center max-w-[720px] mx-auto">
              <p className="font-sans font-semibold text-lg md:text-xl leading-snug text-zinc-700 dark:text-zinc-300">
                "Not everyone is tech-savvy — and that's exactly why we're here."
              </p>
              <p className="abh-body mt-4 text-sm max-w-lg mx-auto text-center">
                We started with one goal: make technology, design, and important government services
                accessible to everyone in Kgotsong — no jargon, no stress, no overcharging.
              </p>
              <p className="abh-body mt-4 text-sm max-w-lg mx-auto text-center">
                {BIZ.name} is a family-run, home-based multi-service business operating under the
                P.D.D.E.T. framework — Print, Docu, Design, E-Service, and Tech — serving Kgotsong
                and the greater Bothaville area since {BIZ.yearFounded}.
              </p>
            </div>
          </ScrollBounce>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">

            {/* Values */}
            <ul className="flex flex-col gap-4 h-full" aria-label="Our values">
              {ABOUT_VALUES.map((item, index) => (
                <li
                  key={index}
                  className="rounded-[14px] p-5 flex flex-row items-center text-left gap-4 flex-1"
                  style={{ backgroundColor: cardBlue, boxShadow: cardShadow }}
                >
                  <div className="shrink-0" style={{ color: cardText }} aria-hidden="true">
                    {renderIcon(item.iconName, "w-6 h-6")}
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm mb-1" style={{ color: cardText }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: cardSubtext }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <ScrollBounce delay={0.2}>
              <div
                className="rounded-[14px] p-7 flex flex-col h-full"
                style={{ backgroundColor: cardBlue, boxShadow: cardShadow }}
                aria-label="Business overview"
              >

                <div className="flex items-center gap-3 mb-7 pb-6" style={{ borderBottom: `1px solid ${cardText === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(24,24,27,0.12)"}` }}>
                  <UsersThree size={24} weight="fill" style={{ color: cardText }} aria-hidden="true" />
                  <div>
                    <p className="font-sans font-semibold text-sm leading-none" style={{ color: cardText }}>
                      {BIZ.name}
                    </p>
                    <p className="text-[0.62rem] font-medium uppercase tracking-widest mt-0.5" style={{ color: cardMuted }}>
                      Serving Kgotsong &amp; surrounds
                    </p>
                  </div>
                </div>

                {/* Mini-stats — same blue fill, one shade of overlay so
                    they read as distinct cells within the card without
                    introducing a second, different color. */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {[
                    { value: BIZ.hubCount,      label: "Hubs"              },
                    { value: BIZ.serviceCount,  label: "Services"          },
                    { value: <WhatsappLogo weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "WhatsApp Ready"    },
                    { value: <ShieldCheck  weight="fill" className="w-6 h-6" aria-hidden="true" />, label: "Community Trusted" },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="rounded-[12px] p-5 flex flex-col justify-center items-center"
                      style={{ backgroundColor: cardText === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(24,24,27,0.06)" }}
                    >
                      <div className="font-black text-xl mb-1 flex items-center justify-center" style={{ color: cardText }}>
                        {stat.value}
                      </div>
                      <p className="text-[0.6rem] font-medium uppercase tracking-widest text-center" style={{ color: cardMuted }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-[0.72rem] font-medium mt-6 leading-relaxed text-center" style={{ color: cardMuted }}>
                  Walk-ins welcome · WhatsApp orders accepted · Same-day service on most requests
                </p>
              </div>
            </ScrollBounce>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="px-4 md:px-8 py-14 md:py-16 border-t border-zinc-100 dark:border-zinc-800/60" aria-labelledby="team-title">
        <div className="max-w-[680px] mx-auto">
          <ScrollBounce>
            <div className="text-center mb-10">
              <h2
                id="team-title"
                className="font-sans font-black text-2xl md:text-3xl tracking-tight text-zinc-900 dark:text-zinc-50 mb-3"
              >
                Who Runs {BIZ.name}
              </h2>
              <p className="abh-tagline max-w-md mx-auto text-center">
                Family-run, hands-on service — every hub staffed by someone who lives right here in Kgotsong.
              </p>
            </div>
          </ScrollBounce>

          <ul className="flex flex-col gap-5" aria-label="Team members">
            {TEAM.map((member, index) => {
              const card = (
                <li
                  key={member.initials}
                  className="rounded-[14px] p-6 flex items-center text-left gap-4"
                  style={{ backgroundColor: cardBlue, boxShadow: cardShadow }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-black text-base shrink-0"
                    style={{ backgroundColor: cardText === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(24,24,27,0.1)", color: cardText }}
                    aria-hidden="true"
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm" style={{ color: cardText }}>
                      {member.name}
                    </h3>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest mt-1" style={{ color: cardText }}>
                      {member.role}
                    </p>
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: cardSubtext }}>
                      {member.note}
                    </p>
                  </div>
                </li>
              )
              return index === 0 ? (
                card
              ) : (
                <ScrollBounce key={member.initials} delay={index * 0.1}>
                  {card}
                </ScrollBounce>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Standards ── */}
      <section
        className="py-14 md:py-16 px-4 md:px-8 bg-zinc-50/60 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800/60"
        aria-labelledby="standards-title"
      >
        <div className="max-w-[980px] mx-auto">

          <ScrollBounce>
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
          </ScrollBounce>

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5" aria-label="Standards">
            {ABOUT_STANDARDS.map((item, index) => (
              <ScrollBounce key={item.id} delay={index * 0.1}>
                <li
                  className="rounded-[14px] p-6 flex flex-col h-full"
                  style={{ backgroundColor: cardBlue, boxShadow: cardShadow }}
                >
                  <div className="mb-5" style={{ color: cardText }} aria-hidden="true">
                    {renderIcon(item.iconName, "w-6 h-6")}
                  </div>
                  <h3 className="font-sans font-semibold text-sm leading-tight mb-2" style={{ color: cardText }}>
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed grow" style={{ color: cardSubtext }}>
                    {item.description}
                  </p>
                </li>
              </ScrollBounce>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Mission — untouched, not a grid-card, keeps its own identity ── */}
      <section
        className="relative overflow-hidden px-4 md:px-8 py-16 md:py-20 text-center"
        aria-labelledby="mission-title"
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{ backgroundColor: cardBlue }}
          />
        </div>

        <div className="relative max-w-[680px] mx-auto flex flex-col items-center">
          <ScrollBounce>
            <span
              className="inline-block text-[0.65rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: `${cardBlue}12`, color: cardBlue }}
            >
              Our Mission
            </span>
          </ScrollBounce>

          <ScrollBounce delay={0.1}>
            <h2
              id="mission-title"
              className="font-sans font-black text-2xl md:text-3xl leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 mb-5"
            >
              Bridging the digital gap — one person at a time.
            </h2>
          </ScrollBounce>

          <ScrollBounce delay={0.2}>
            <p className="abh-body max-w-lg mx-auto mb-10 text-center text-sm leading-relaxed">
              ApexbytesHub is that bridge — printing, design, IT support, and government services
              brought to people who need them most, in a community that deserves better access.
            </p>
          </ScrollBounce>

          <ScrollBounce delay={0.3}>
            <a
              href="/services"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-[14px] font-black text-sm transition-all duration-300 active:scale-95 hover:-translate-y-0.5 shadow-lg"
              style={{ backgroundColor: orangeColor, color: orangeText }}
            >
              See All Services
              <ArrowRight size={16} weight="bold" />
            </a>
          </ScrollBounce>
        </div>
      </section>

    </div>
  )
    } 
