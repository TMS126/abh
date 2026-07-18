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

// ─── Contrast-nudging helpers ─────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean
  const bigint = parseInt(full, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}
function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
function contrastRatio(hexA: string, hexB: string) {
  const lA = relativeLuminance(hexToRgb(hexA))
  const lB = relativeLuminance(hexToRgb(hexB))
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA]
  return (lighter + 0.05) / (darker + 0.05)
}
function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return "#" + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")
}
function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0
  const l = (max + min) / 2
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      case bn: h = (rn - gn) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}
function hslToRgb(h: number, s: number, l: number) {
  const hn = h / 360, sn = s / 100, ln = l / 100
  let r: number, g: number, b: number
  if (sn === 0) {
    r = g = b = ln
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t
      if (tt < 0) tt += 1
      if (tt > 1) tt -= 1
      if (tt < 1 / 6) return p + (q - p) * 6 * tt
      if (tt < 1 / 2) return q
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
      return p
    }
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
    const p = 2 * ln - q
    r = hue2rgb(p, q, hn + 1 / 3); g = hue2rgb(p, q, hn); b = hue2rgb(p, q, hn - 1 / 3)
  }
  return { r: r * 255, g: g * 255, b: b * 255 }
}
function ensureAccessible(hex: string, bgHex: string, minRatio = 4.5) {
  if (contrastRatio(hex, bgHex) >= minRatio) return hex
  const hsl = rgbToHsl(hexToRgb(hex))
  const bgLum = relativeLuminance(hexToRgb(bgHex))
  const goingDarker = bgLum > 0.5
  let l = hsl.l
  for (let i = 0; i < 45; i++) {
    l += goingDarker ? -2 : 2
    l = Math.max(0, Math.min(100, l))
    const candidate = rgbToHex(hslToRgb(hsl.h, hsl.s, l))
    if (contrastRatio(candidate, bgHex) >= minRatio) return candidate
    if (l <= 0 || l >= 100) break
  }
  return goingDarker ? "#1a1a1a" : "#fafafa"
}

const PAGE_BG_LIGHT = "#FFFFFF"
const PAGE_BG_DARK  = "#0D1B2A"

const ABOUT_BLUE   = BRAND.blue
const ABOUT_GREEN  = BRAND.green
const ABOUT_ORANGE = BRAND.orangeDark
const ABOUT_NEUTRAL = { light: BRAND.dark100, dark: BRAND.techGreyDark }

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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [statsHovered, setStatsHovered] = useState(false)

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === "dark"
  const pageBg = isDark ? PAGE_BG_DARK : PAGE_BG_LIGHT

  const blueColor    = ABOUT_BLUE
  const orangeColor  = ABOUT_ORANGE
  const orangeText   = "#ffffff"
  const greenColor   = ABOUT_GREEN
  const neutralColor = isDark ? ABOUT_NEUTRAL.dark : ABOUT_NEUTRAL.light

  const blueOnPage = ensureAccessible(blueColor, pageBg, 4.5)

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

          <div className="abh-divider mx-auto" />

          <ScrollBounce delay={0.1}>
            <div
              className="mt-8 w-full max-w-[560px] mx-auto grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700 rounded-[14px] overflow-hidden shadow-lg border-2 transition-colors duration-300"
              style={{ borderColor: blueColor }}
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
                  className="flex flex-col items-center justify-center py-5 px-3 transition-colors duration-300 cursor-default"
                  style={{ backgroundColor: statsHovered ? blueColor : "transparent" }}
                >
                  <p
                    className="font-sans font-black text-xl leading-none transition-colors duration-300"
                    style={{ color: statsHovered ? "#ffffff" : blueOnPage }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-[0.62rem] font-medium uppercase tracking-widest mt-1.5 text-center transition-colors duration-300"
                    style={{ color: statsHovered ? "rgba(255,255,255,0.85)" : `${blueOnPage}cc` }}
                  >
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

           <ul
  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
  aria-label="Our values"
>
  {ABOUT_VALUES.map((item, index) => (
    <li
      key={index}
      className="abh-card rounded-[14px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm p-5 flex flex-col items-center text-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${greenColor}15`, color: greenColor }}
        aria-hidden="true"
      >
        {renderIcon(item.iconName, "w-5 h-5")}
      </div>
      <div>
        <h3 className="font-sans font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-1">
          {item.title}
        </h3>
        <p className="abh-body text-sm">{item.desc}</p>
      </div>
    </li>
  ))}
</ul>

            <ScrollBounce delay={0.2}>
              <div
                className="rounded-[14px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-7 shadow-sm flex flex-col h-full"
                aria-label="Business overview"
              >
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

                <p className="text-[0.72rem] font-medium text-zinc-400 dark:text-zinc-500 mt-6 leading-relaxed text-center">
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
                  className="abh-card p-6 flex items-center text-left gap-4 shadow-md"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-black text-base shrink-0"
                    style={{ backgroundColor: `${blueColor}15`, color: blueColor }}
                    aria-hidden="true"
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                      {member.name}
                    </h3>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest mt-1" style={{ color: blueColor }}>
                      {member.role}
                    </p>
                    <p className="abh-body text-xs mt-2 leading-relaxed">
                      {member.note}
                    </p>
                  </div>
                </li>
              )
              // TM (index 0) not marked for animation — kept static.
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

          <ul
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            aria-label="Standards"
          >
            {ABOUT_STANDARDS.map((item, index) => {
              const isHovered = hoveredCard === item.id
              return (
                <ScrollBounce key={item.id} delay={index * 0.1}>
                  <li
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
                        isHovered ? "text-white border-transparent scale-110" : "border-transparent"
                      )}
                      style={
                        isHovered
                          ? { backgroundColor: blueColor, color: "#ffffff" }
                          : { backgroundColor: `${neutralColor}15`, color: neutralColor }
                      }
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
                </ScrollBounce>
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
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              background: `linear-gradient(135deg, ${blueColor} 0%, ${greenColor} 50%, ${orangeColor} 100%)`,
            }}
          />
        </div>

        <div className="relative max-w-[680px] mx-auto flex flex-col items-center">
          <ScrollBounce>
            <span
              className="inline-block text-[0.65rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: `${blueColor}12`, color: blueColor }}
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
