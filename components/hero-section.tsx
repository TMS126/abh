// components/hero-section.tsx — full file, paste over the current one
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import Image from "next/image"
import { ArrowRight, Play, Pause, Sun, Moon, CloudSun, CloudMoon, Cloud, CloudFog, CloudRain, CloudLightning, Snowflake } from "@phosphor-icons/react"
import { BRAND, BIZ, MARQUEE_ITEMS } from "@/lib/brand"
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

// ─── REDUCED MOTION ───────────────────────────────────────────────────────────
// Site-wide pattern elsewhere (whatsapp-fab, contact page) uses
// motion-reduce: Tailwind variants on CSS-driven animations. This section's
// animations are all inline-style/JS-driven (wander loop, fly-in, hover
// bounce, shake) so they need an explicit media query check instead.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

// ─── HUB ICON IMAGES — already-transparent PNGs. ─────────────────────────────
const HUB_IMAGES: Record<string, string> = {
  print: "/phub.png",
  doc: "/dochub.png",
  design: "/dhub.png",
  eservice: "/ehub.png",
  tech: "/thub.png",
}

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

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// ─── SYMMETRIC LAYOUT — regular pentagon, centered ───────────────────────────
const PENTAGON_ANGLES_DEG = [-90, -18, 54, 126, 198]
const ELLIPSE_RX_PCT = 30
const ELLIPSE_RY_PCT = 24

type IconEntry = {
  hub: (typeof HUBS_DATA)[number]
  topPct: number
  leftPct: number
  z: number
  entryX: number
  entryY: number
}

function buildArrangement(): IconEntry[] {
  const shuffledHubs = shuffleArray(HUBS_DATA)
  return shuffledHubs.map((hub, i) => {
    const angleRad = (PENTAGON_ANGLES_DEG[i] * Math.PI) / 180
    const entryAngle = Math.random() * Math.PI * 2
    const entryDist = randBetween(70, 130)
    return {
      hub,
      leftPct: 50 + ELLIPSE_RX_PCT * Math.cos(angleRad),
      topPct: 50 + ELLIPSE_RY_PCT * Math.sin(angleRad),
      z: 10 + i * 10,
      entryX: Math.cos(entryAngle) * entryDist,
      entryY: Math.sin(entryAngle) * entryDist,
    }
  })
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

// ─── HUB ICON FIELD — symmetric layout + gentle wander, no collision math ───
const WANDER_AMP_PX = 10
const LABEL_AUTO_HIDE_MS = 8000

function HubIconField({
  arrangement,
  isDark,
  canHover,
  prefersReducedMotion,
}: {
  arrangement: IconEntry[]
  isDark: boolean
  canHover: boolean
  prefersReducedMotion: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [shakingId, setShakingId] = useState<string | null>(null)
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const [labelsAutoVisible, setLabelsAutoVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLabelsAutoVisible(false), LABEL_AUTO_HIDE_MS)
    return () => clearTimeout(t)
  }, [])

  const triggerShake = (hubId: string) => {
    if (prefersReducedMotion) return
    setShakingId(hubId)
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current)
    shakeTimeoutRef.current = setTimeout(() => setShakingId((cur) => (cur === hubId ? null : cur)), 550)
  }

  useEffect(() => {
    // Wander drift is purely decorative motion — skip the RAF loop
    // entirely under reduced motion, leaving icons static at their
    // pentagon anchor points.
    if (prefersReducedMotion) return
    const container = containerRef.current
    if (!container) return

    const phys = arrangement.map(() => ({
      freqX: randBetween(0.06, 0.09),
      freqY: randBetween(0.05, 0.08),
      phaseX: randBetween(0, Math.PI * 2),
      phaseY: randBetween(0, Math.PI * 2),
      x: 0, y: 0,
    }))

    let raf = 0

    const tick = (time: number) => {
      const t = time / 1000
      for (let i = 0; i < phys.length; i++) {
        const p = phys[i]
        p.x = Math.sin(t * p.freqX + p.phaseX) * WANDER_AMP_PX
        p.y = Math.sin(t * p.freqY + p.phaseY) * WANDER_AMP_PX * 0.6

        const el = iconRefs.current[i]
        if (el) el.style.transform = `translate(${p.x}px, ${p.y}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [arrangement, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[360px] sm:max-w-[440px] md:max-w-none h-[440px] sm:h-[500px] md:h-[560px]"
    >
      {arrangement.map((entry, i) => {
        const { hub, topPct, leftPct, z, entryX, entryY } = entry
        const hubAccent = isDark ? hub.colorDark : hub.colorLight
        const isHovered = canHover && !prefersReducedMotion && hoveredId === hub.id
        const isShaking = !prefersReducedMotion && shakingId === hub.id
        const labelVisible = labelsAutoVisible || isHovered || isShaking

        return (
          <div
            key={hub.id}
            className="absolute"
            style={{
              top: `${topPct}%`,
              left: `${leftPct}%`,
              transform: "translate(-50%, -50%)",
              zIndex: z,
            }}
          >
            {/* Entry animation — skipped entirely under reduced motion,
                icons simply appear in place instead of flying in. */}
            <div
              className="flex flex-col items-center"
              style={prefersReducedMotion ? undefined : ({
                "--ex": `${entryX}px`,
                "--ey": `${entryY}px`,
                animationName: "abh-icon-enter",
                animationDuration: "650ms",
                animationTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                animationDelay: `${z * 20}ms`,
                animationFillMode: "both",
              } as React.CSSProperties)}
            >
              <div ref={(el) => { iconRefs.current[i] = el }} className="flex flex-col items-center">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={hub.name}
                  onMouseEnter={() => canHover && setHoveredId(hub.id)}
                  onMouseLeave={() => canHover && setHoveredId((cur) => (cur === hub.id ? null : cur))}
                  onFocus={() => setHoveredId(hub.id)}
                  onBlur={() => setHoveredId((cur) => (cur === hub.id ? null : cur))}
                  onClick={() => triggerShake(hub.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); triggerShake(hub.id) } }}
                  className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 cursor-pointer outline-none"
                  style={{
                    animationName: isShaking ? "abh-icon-shake" : isHovered ? "abh-icon-bounce" : undefined,
                    animationDuration: isShaking ? "0.55s" : isHovered ? "1.8s" : undefined,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: isShaking ? 1 : isHovered ? "infinite" : undefined,
                  }}
                >
                  <Image
                    src={HUB_IMAGES[hub.id]}
                    alt={`${hub.name} example`}
                    fill
                    sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 208px"
                    className="object-contain"
                  />

                  <span
                    className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[40%] px-2.5 py-1 rounded-full text-[0.65rem] sm:text-xs font-black uppercase tracking-wide bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shadow-sm whitespace-nowrap transition-opacity duration-500"
                    style={{
                      color: hubAccent,
                      opacity: labelVisible ? 1 : 0,
                      pointerEvents: labelVisible ? "auto" : "none",
                    }}
                  >
                    {pillLabel(hub.name)}
                  </span>
                </div>

                <div
                  aria-hidden="true"
                  className="w-20 sm:w-24 md:w-28 h-3.5 sm:h-4 rounded-full bg-black blur-[7px] -mt-2"
                  style={{
                    opacity: 0.32,
                    animationName: isShaking ? "abh-shadow-shake" : isHovered ? "abh-shadow-bounce" : undefined,
                    animationDuration: isShaking ? "0.55s" : isHovered ? "1.8s" : undefined,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: isShaking ? 1 : isHovered ? "infinite" : undefined,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [marqueePaused, setMarqueePaused] = useState(false)
  const [status, setStatus] = useState<BusinessStatus | null>(null)
  const [weatherCategory, setWeatherCategory] = useState<WeatherCategory | null>(null)
  const [canHover, setCanHover] = useState(false)
  const showBackToTop = useBackToTop()
  const prefersReducedMotion = usePrefersReducedMotion()

  const [arrangement, setArrangement] = useState<IconEntry[]>(() => buildArrangement())

  const ctaBtnRef = useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMounted(true)
    setArrangement(buildArrangement())
    setStatus(getBusinessStatus())
    const id = setInterval(() => setStatus(getBusinessStatus()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setCanHover(mq.matches)
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
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

  const showHolidayBanner = mounted && status?.isHoliday
  const displayCategory = weatherCategory ?? (status ? fallbackCategory(status.greeting) : "clear-day")
  const { Icon: WeatherIcon, color: weatherIconColor } = WEATHER_ICON_MAP[displayCategory]

  const handleNavigate = (path: string) => router.push(path)
  const handleCtaClick = () => handleNavigate("/services")

  return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+56px)] md:pt-[104px] pb-10 md:pb-16 overflow-hidden cursor-default bg-background transition-colors duration-300">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      <style>{`
        @keyframes abh-icon-enter {
          0%   { opacity: 0; transform: translate(var(--ex), var(--ey)) scale(0.6); }
          100% { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes abh-icon-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-26px) scale(1.05); }
        }
        @keyframes abh-icon-shake {
          0%, 100%   { transform: translateX(0) rotate(0deg); }
          15%        { transform: translateX(-7px) rotate(-7deg); }
          30%        { transform: translateX(6px) rotate(6deg); }
          45%        { transform: translateX(-5px) rotate(-5deg); }
          60%        { transform: translateX(4px) rotate(4deg); }
          75%        { transform: translateX(-2px) rotate(-2deg); }
        }
        @keyframes abh-shadow-bounce {
          0%, 100% { transform: scaleX(1); opacity: 0.32; }
          50%      { transform: scaleX(0.5); opacity: 0.14; }
        }
        @keyframes abh-shadow-shake {
          0%, 100%   { transform: scaleX(1) translateX(0); opacity: 0.32; }
          15%        { transform: scaleX(0.92) translateX(-3px); opacity: 0.26; }
          30%        { transform: scaleX(0.92) translateX(3px); opacity: 0.26; }
          45%        { transform: scaleX(0.95) translateX(-2px); opacity: 0.28; }
          60%        { transform: scaleX(0.95) translateX(2px); opacity: 0.28; }
          75%        { transform: scaleX(0.98) translateX(-1px); opacity: 0.3; }
        }
      `}</style>

      <div className="max-w-[1240px] mx-auto flex flex-col items-center relative z-10 w-full mb-6">

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
                <span className="relative z-10 w-8 h-8 shrink-0 rounded-full shadow-sm overflow-hidden" aria-hidden="true">
                  <span
                    className="absolute inset-0 rounded-full inline-flex items-center justify-center transition-opacity duration-150 group-active:opacity-0"
                    style={{ backgroundColor: activeCircleColor }}
                  >
                    <ArrowRight weight="bold" style={{ color: activeArrowIconColor }} className="w-4 h-4 transition-all duration-300 group-hover:translate-x-0.5" />
                  </span>
                  <span className="absolute inset-0 rounded-full inline-flex items-center justify-center bg-white opacity-0 transition-opacity duration-150 group-active:opacity-100">
                    <ArrowRight weight="bold" style={{ color: BRAND.orange }} className="w-4 h-4 group-active:translate-x-0.5" />
                  </span>
                </span>
              </button>
            </ScrollBounce>
          </div>

          <ScrollBounce delay={0.1} className="w-full">
            <HubIconField
              arrangement={arrangement}
              isDark={isDark}
              canHover={canHover}
              prefersReducedMotion={prefersReducedMotion}
            />
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
          <div
            className="flex whitespace-nowrap w-max animate-marquee"
            style={{ animationPlayState: marqueePaused || prefersReducedMotion ? "paused" : "running" }}
          >
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
