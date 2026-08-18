// components/hero-section.tsx — full file, paste over the current one
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import { ArrowRight, Play, Pause, Warning, X, Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudRain, CloudLightning, Snowflake } from "@phosphor-icons/react"
import { BRAND, BIZ, MARQUEE_ITEMS, TOKEN, pickHex } from "@/lib/brand"
import { eserviceHub } from "@/lib/data/hubs/eservice"
import { ScrollBounce } from "@/components/scroll-bounce"
import { HUBS_DATA } from "@/lib/hero-data"
import { ClassicTagline } from "@/components/classic-tagline"
import { getBusinessStatus, type BusinessStatus } from "@/lib/sa-time"
import { getWeatherSnapshot, type WeatherCategory } from "@/lib/weather"
import { BackToTopButton, useBackToTop } from "@/components/back-to-top-button"

// ─── COLOR HELPERS ───────────────────────────────────────────────────────────
function hexToRgbLocal(hex: string) {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  const bigint = parseInt(full, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}
function relativeLuminanceLocal({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
function getArrowIconColor(bgHex: string) {
  const lum = relativeLuminanceLocal(hexToRgbLocal(bgHex))
  const contrastWhite = 1.05 / (lum + 0.05)
  const contrastDark = (lum + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#14202b"
}

// ─── HUB COLLAGE DATA ────────────────────────────────────────────────────────
const HUB_IMAGES: Record<string, string> = {
  print: "/1_PRINT_HUB_white.webp",
  doc: "/2_DOCUMENT_HUB_white.webp",
  design: "/3_DESIGN_HUB_white.webp",
  eservice: "/4_APPLICATIONS_HUB_white.webp",
  tech: "/5_TECH_HUB_white.webp",
}

const COLLAGE_SLOTS: { top?: string; bottom?: string; left?: string; right?: string; z: number; baseWidth: number }[] = [
  { top: "0%", left: "2%", z: 10, baseWidth: 40 },
  { top: "2%", right: "0%", z: 20, baseWidth: 38 },
  { top: "36%", left: "16%", z: 30, baseWidth: 38 },
  { top: "32%", right: "12%", z: 40, baseWidth: 40 },
  { bottom: "0%", left: "28%", z: 50, baseWidth: 38 },
]

function pillLabel(hubName: string) {
  return hubName.replace(/\s*Hub$/i, "").toUpperCase()
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildArrangement() {
  const shuffledHubs = shuffleArray(HUBS_DATA)
  return COLLAGE_SLOTS.map((slot, i) => ({
    hub: shuffledHubs[i],
    slot,
    width: slot.baseWidth + (Math.random() * 6 - 3),
  }))
}

const WEATHER_ICON_MAP: Record<WeatherCategory, { Icon: React.ElementType; color: string }> = {
  "clear-day": { Icon: Sun, color: "#F59E0B" },
  "clear-night": { Icon: Moon, color: "#818CF8" },
  "partly-cloudy-day": { Icon: CloudSun, color: "#F0A93A" },
  "partly-cloudy-night": { Icon: CloudMoon, color: "#8B93D8" },
  cloudy: { Icon: Cloud, color: "#9CA3AF" },
  fog: { Icon: CloudFog, color: "#9CA3AF" },
  rain: { Icon: CloudRain, color: "#60A5FA" },
  thunderstorm: { Icon: CloudLightning, color: "#A78BFA" },
  snow: { Icon: Snowflake, color: "#7DD3FC" },
}

function fallbackCategory(greeting: BusinessStatus["greeting"]): WeatherCategory {
  return greeting === "morning" || greeting === "afternoon" ? "clear-day" : "clear-night"
}

// ─── NSFAS BACKLOG NOTICE — DATA-DRIVEN ──────────────────────────────────────
const NOTICE_ITEMS = eserviceHub.sections.flatMap((section) => section.items.filter((item) => item.notice))
const HAS_BACKLOG_NOTICE = NOTICE_ITEMS.length > 0
const BACKLOG_MESSAGE = NOTICE_ITEMS[0]?.notice ?? ""

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [marqueePaused, setMarqueePaused] = useState(false)
  const [status, setStatus] = useState<BusinessStatus | null>(null)
  const [weatherCategory, setWeatherCategory] = useState<WeatherCategory | null>(null)
  const [backlogExpanded, setBacklogExpanded] = useState(false)
  const [backlogDismissed, setBacklogDismissed] = useState(false)
  const showBackToTop = useBackToTop()

  const [arrangement, setArrangement] = useState(() =>
    COLLAGE_SLOTS.map((slot, i) => ({ hub: HUBS_DATA[i], slot, width: slot.baseWidth }))
  )

  const ctaBtnRef = useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMounted(true)
    setArrangement(buildArrangement())
    setStatus(getBusinessStatus())
    const id = setInterval(() => setStatus(getBusinessStatus()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!status?.isHoliday) return
    getWeatherSnapshot().then((snapshot) => {
      if (snapshot) setWeatherCategory(snapshot.category)
    })
  }, [status?.isHoliday])

  const isDark = mounted && resolvedTheme === "dark"

  const STROKE_COLOR = BRAND.blue
  const CTA_FILL_COLOR = BRAND.blue
  const REST_COLOR = isDark ? BRAND.lightBlue : BRAND.blue

  const activeCircleColor = CTA_FILL_COLOR
  const activeArrowIconColor = getArrowIconColor(activeCircleColor)

  // Backlog notice — every color below is a TOKEN (CSS var). No isDark
  // branching for color anymore: the var resolves itself in globals.css.
  // ANNOUNCEMENT_TINT is the one exception, since it needs a raw hex for
  // string-based alpha blending in dark mode — sourced from pickHex, which
  // mirrors the SAME verified values as the tokens above, not a guess.
  const ANNOUNCEMENT_TINT = isDark ? `${pickHex("warningBg", true)}26` : BRAND.lightOrange

  const showHolidayBanner = mounted && status?.isHoliday
  const displayCategory = weatherCategory ?? (status ? fallbackCategory(status.greeting) : "clear-day")
  const { Icon: WeatherIcon, color: weatherIconColor } = WEATHER_ICON_MAP[displayCategory]

  const handleNavigate = (path: string) => router.push(path)
  const handleCtaClick = () => handleNavigate("/services")

  return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+56px)] md:pt-[104px] pb-10 md:pb-16 overflow-hidden cursor-default select-none bg-background transition-colors duration-300">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      <div className="max-w-[1240px] mx-auto flex flex-col items-center relative z-10 w-full mb-6">

        {/* ─── NOTIFICATION 1: NSFAS BACKLOG — collapsed pill / expanded card ─── */}
        {HAS_BACKLOG_NOTICE && !backlogDismissed && (
          <div className="w-full flex justify-center mb-8 md:mb-10">
            {!backlogExpanded ? (
              <button
                onClick={() => setBacklogExpanded(true)}
                aria-expanded={false}
                aria-label="Expand important announcement"
                style={{ borderColor: TOKEN.warningBg }}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full border bg-white dark:bg-zinc-900 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: TOKEN.warningBg }}
                  aria-hidden="true"
                >
                  <Warning size={13} weight="fill" style={{ color: TOKEN.white }} />
                </span>
                <span className="text-sm font-bold" style={{ color: TOKEN.orangeText }}>
                  Important Announcement
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Dismiss announcement"
                  onClick={(e) => { e.stopPropagation(); setBacklogDismissed(true) }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setBacklogDismissed(true) }
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <X size={13} weight="bold" aria-hidden="true" />
                </span>
              </button>
            ) : (
              <div
                role="status"
                className="relative w-full max-w-[440px] rounded-[14px] pl-4 pr-10 py-4 transition-colors duration-300"
                style={{ backgroundColor: ANNOUNCEMENT_TINT }}
              >
                <button
                  onClick={() => setBacklogExpanded(false)}
                  aria-label="Collapse announcement"
                  className="flex items-start gap-3 text-left w-full"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: TOKEN.warningBg }}
                    aria-hidden="true"
                  >
                    <Warning size={16} weight="fill" style={{ color: TOKEN.white }} />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[0.7rem] font-black uppercase tracking-widest" style={{ color: TOKEN.orangeText }}>
                      Important Announcement
                    </span>
                    <span className="text-sm font-semibold leading-snug" style={{ color: TOKEN.orangeText }}>
                      {BACKLOG_MESSAGE}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setBacklogDismissed(true)}
                  aria-label="Dismiss announcement"
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                  style={{ color: TOKEN.orangeText }}
                >
                  <X size={14} weight="bold" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-full max-w-[1100px] mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-10 md:mb-14">

          <div className="text-center md:text-left">

            {showHolidayBanner && status && (
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                <WeatherIcon size={16} weight="fill" style={{ color: weatherIconColor }} aria-hidden="true" />
                Tech, Design &amp; E-Service are closed today for {status.holidayName} — Print &amp; Docu is open as usual
              </p>
            )}

            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-4 text-balance transition-colors duration-300 text-zinc-900 dark:text-zinc-50">
              <span className="transition-colors duration-200 hover:text-[#1E6FA8] active:text-[#1E6FA8]">Printing</span>,{" "}
              <span className="transition-colors duration-200 hover:text-[#B06225] active:text-[#B06225]">Design</span>,{" "}
              <span className="transition-colors duration-200 hover:text-[#4A8011] active:text-[#4A8011]">Documents</span>,{" "}
              <span className="transition-colors duration-200 hover:text-[#0F766E] active:text-[#0F766E]">E-Services</span>{" "}&amp;{" "}
              <span className="transition-colors duration-200 hover:text-[#333333] dark:hover:text-[#B8CCE0] active:text-[#333333] dark:active:text-[#B8CCE0]">Tech</span>
              <span className="text-zinc-900 dark:text-zinc-50"> — All in One Place</span>
            </h1>

            <p className="text-lg md:text-xl font-medium text-zinc-600 dark:text-zinc-400 max-w-[480px] md:max-w-none mx-auto md:mx-0 leading-relaxed mb-6">
              {BIZ.tagline}
            </p>

            <div className="mb-8 md:mb-10">
              <ClassicTagline />
            </div>

            <ScrollBounce>
              <button
                ref={ctaBtnRef}
                onClick={handleCtaClick}
                style={{ borderColor: STROKE_COLOR }}
                className="group relative z-30 flex items-center w-[300px] sm:w-[320px] mx-auto md:mx-0 px-5 sm:px-7 py-5 rounded-full font-sans font-black overflow-hidden border-2 transition-all duration-150 active:duration-75 touch-manipulation hover:-translate-y-1 active:translate-y-0 active:scale-[0.94] shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.7)] active:shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:active:shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-150 ease-out group-hover:scale-y-100 group-active:scale-y-100"
                  style={{ backgroundColor: CTA_FILL_COLOR }}
                />
                <span className="relative z-10 w-8 h-8 shrink-0" aria-hidden="true" />
                <span className="relative z-10 flex-1 flex items-center justify-center whitespace-nowrap transition-colors duration-150" style={{ color: REST_COLOR }}>
                  <span className="group-hover:text-white group-active:text-white transition-colors duration-150 text-xl sm:text-2xl">
                    See Our Services
                  </span>
                </span>
                <span className="relative z-10 w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full shadow-sm" style={{ backgroundColor: activeCircleColor }} aria-hidden="true">
                  <ArrowRight weight="bold" style={{ color: activeArrowIconColor }} className="w-4 h-4 transition-all duration-300 group-hover:translate-x-0.5" />
                </span>
              </button>
            </ScrollBounce>
          </div>

          <ScrollBounce delay={0.1} className="w-full">
            <div className="relative w-full h-[420px] sm:h-[480px] md:h-[560px]">
              {arrangement.map(({ hub, slot, width }) => {
                const hubAccent = isDark ? hub.colorDark : hub.colorLight
                const hubAccentFg = getArrowIconColor(hubAccent)
                return (
                  <div
                    key={hub.id}
                    className="group/tile absolute aspect-square rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-[0_6px_18px_rgba(0,0,0,0.10)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:z-[60] hover:scale-[1.03] animate-in fade-in zoom-in-95"
                    style={{
                      top: slot.top, bottom: slot.bottom, left: slot.left, right: slot.right,
                      width: `${width}%`, zIndex: slot.z,
                      animationDelay: `${slot.z * 40}ms`, animationDuration: "500ms", animationFillMode: "both",
                      ["--hub-accent" as any]: hubAccent,
                      ["--hub-accent-fg" as any]: hubAccentFg,
                    }}
                  >
                    <Image src={HUB_IMAGES[hub.id]} alt={`${hub.name} example`} fill priority sizes="(max-width: 768px) 45vw, 220px" className="object-cover" />
                    <span className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[0.72rem] font-black uppercase tracking-widest bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-md transition-colors duration-200 group-hover/tile:bg-[var(--hub-accent)] group-hover/tile:text-[var(--hub-accent-fg)] group-hover/tile:border-transparent">
                      {pillLabel(hub.name)}
                    </span>
                  </div>
                )
              })}
            </div>
          </ScrollBounce>
        </div>

        <div
          role="group"
          aria-label="Our services"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
          onTouchStart={(e) => { e.stopPropagation(); setMarqueePaused((p) => !p) }}
          className="relative w-full max-w-[1240px] py-4 overflow-hidden select-none group/marquee rounded-[14px] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
        >
          <button
            onClick={() => setMarqueePaused((p) => !p)}
            aria-pressed={marqueePaused}
            aria-label={marqueePaused ? "Play scrolling services list" : "Pause scrolling services list"}
            className="absolute top-1/2 right-2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/80 transition-colors"
          >
            {marqueePaused ? <Play size={11} weight="fill" aria-hidden="true" /> : <Pause size={11} weight="fill" aria-hidden="true" />}
          </button>
          <div className="flex whitespace-nowrap w-max animate-marquee" style={{ animationPlayState: marqueePaused ? "paused" : "running" }}>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0" aria-hidden={copy === 1 ? "true" : undefined}>
                {MARQUEE_ITEMS.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span className="inline-flex items-center px-5 font-semibold text-base text-zinc-600 dark:text-zinc-400 transition-opacity duration-300 group-hover/marquee:opacity-70 hover:!opacity-100">
                      {item}
                    </span>
                    <span className="font-black text-lg leading-none shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true">•</span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BackToTopButton visible={showBackToTop} />
    </section>
  )
    } 
