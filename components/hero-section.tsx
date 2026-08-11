// components/hero-section.tsx
"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ArrowRight, ArrowDown, Play, Pause } from "@phosphor-icons/react"
import { BRAND, BIZ, MARQUEE_ITEMS } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"
import { HUBS_DATA } from "@/lib/hero-data"
import { ClassicTagline } from "@/components/classic-tagline"
import { getBusinessStatus, getSASTNow, type BusinessStatus } from "@/lib/sa-time"

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

// ── Reduced motion ──────────────────────────────────────────────────────
// Feature 4. Any component reading this should skip/stagger-less its own
// entrance animation, stop the marquee's auto-scroll, and drop the scroll
// cue's bounce — without hiding any content, just the motion itself.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

// ── Feature 1: day/time-aware, randomized CTA copy ──────────────────────
// Buckets keyed by weekday-vs-weekend + open/closed + rough time of day.
// Each bucket has several candidate lines (some hub-flavored, some
// generic) — one is picked at random on every page load, so it's fresh
// each landing but still makes sense for "right now."
const CTA_POOLS: Record<string, string[]> = {
  "weekday-open-morning": [
    "Start your day with us",
    "Need something sorted before lunch?",
    "Kick off the week right",
    "Need a CV sorted today?",
  ],
  "weekday-open-afternoon": [
    "Still time to get it done today",
    "Beat the afternoon rush",
    "Need printing done today?",
    "Get your documents handled",
  ],
  "weekday-closed-evening": [
    "Plan ahead for tomorrow",
    "Browse now, visit us tomorrow",
    "We're closed, but you can still browse",
  ],
  "saturday-open": [
    "Saturday hours — open till 12",
    "Weekend errand? We've got you",
  ],
  "saturday-closed": [
    "We're closed for the day",
    "Back open Monday at 09:00",
  ],
  "sunday": [
    "We're closed today — Print & Docu opens 07:00 tomorrow",
    "Browse now, we'll be open tomorrow",
  ],
  "holiday": [
    "Print & Docu is still open today",
  ],
  fallback: ["See Our Services"],
}

function pickCtaBucket(status: BusinessStatus, day: number): keyof typeof CTA_POOLS {
  if (status.isHoliday) return "holiday"
  if (day === 0) return "sunday"
  if (day === 6) return status.printAndDoc.open || status.techDesignEservice.open ? "saturday-open" : "saturday-closed"
  if (status.printAndDoc.open || status.techDesignEservice.open) {
    return status.greeting === "morning" ? "weekday-open-morning" : "weekday-open-afternoon"
  }
  return "weekday-closed-evening"
}

function pickRandomCta(status: BusinessStatus | null): string {
  if (!status) return "See Our Services"
  const bucket = pickCtaBucket(status, getSASTNow().getDay())
  const pool = CTA_POOLS[bucket] ?? CTA_POOLS.fallback
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Feature 2: marquee item → hub mapping ────────────────────────────────
// Best-guess mapping based on the marquee phrasing from earlier sessions.
// Links each item to its HUB (opens that hub's modal on /services), not a
// specific service — deep-linking to one exact service needs the item's
// precise hub/section/service-name strings from lib/data.ts to match
// safely, which I don't have in front of me. If MARQUEE_ITEMS has changed
// since, or you want true per-service links, send the current array plus
// each item's matching service name and I'll tighten this.
const MARQUEE_HUB_GUESS: string[] = [
  "print", "doc", "doc", "doc",
  "design", "design", "design",
  "eservice", "eservice", "eservice",
  "tech",
]

function getMarqueeHubId(index: number): string {
  return MARQUEE_HUB_GUESS[index % MARQUEE_HUB_GUESS.length]
}

export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [marqueePaused, setMarqueePaused] = useState(false)
  const [status, setStatus] = useState<BusinessStatus | null>(null)
  const [ctaText, setCtaText] = useState("See Our Services")
  const [showScrollCue, setShowScrollCue] = useState(true)
  const [hoveredMarqueeIdx, setHoveredMarqueeIdx] = useState<number | null>(null)

  const reducedMotion = usePrefersReducedMotion()

  const [arrangement, setArrangement] = useState(() =>
    COLLAGE_SLOTS.map((slot, i) => ({ hub: HUBS_DATA[i], slot, width: slot.baseWidth }))
  )

  const ctaBtnRef = useRef<HTMLButtonElement>(null)
  const marqueeWrapRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
    setArrangement(buildArrangement())
    const s = getBusinessStatus()
    setStatus(s)
    setCtaText(pickRandomCta(s))
    const id = setInterval(() => setStatus(getBusinessStatus()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Feature 3: scroll-down cue — visible while near the top, hides once
  // the visitor actually starts scrolling (same "appear/disappear on
  // scroll position" pattern as Services' back-to-top button, just
  // inverted: this one shows near 0 instead of past 600px).
  useEffect(() => {
    const onScroll = () => setShowScrollCue(window.scrollY < 80)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleScrollCueClick = () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: reducedMotion ? "auto" : "smooth" })
  }

  const isDark = mounted && resolvedTheme === "dark"

  const STROKE_COLOR = BRAND.blue
  const CTA_FILL_COLOR = BRAND.blue
  const REST_COLOR = isDark ? BRAND.lightBlue : BRAND.blue

  const activeCircleColor = CTA_FILL_COLOR
  const activeArrowIconColor = getArrowIconColor(activeCircleColor)

  const handleNavigate = (path: string) => router.push(path)
  const handleCtaClick = () => handleNavigate("/services")

  const handleMarqueeItemClick = (index: number) => {
    const hubId = getMarqueeHubId(index)
    handleNavigate(`/services?hub=${hubId}`)
  }

  return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+56px)] md:pt-[104px] pb-10 md:pb-16 overflow-hidden cursor-default select-none bg-background transition-colors duration-300"
    >
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
        <div className="w-full max-w-[1100px] mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-10 md:mb-14">

          {/* Left column — text + CTA */}
          <div className="text-center md:text-left">
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-4 text-balance transition-colors duration-300 text-zinc-900 dark:text-zinc-50">
              <span
                className="transition-colors duration-200 hover:text-[#1E6FA8] active:text-[#1E6FA8]"
              >Printing</span>,{" "}
              <span
                className="transition-colors duration-200 hover:text-[#B06225] active:text-[#B06225]"
              >Design</span>,{" "}
              <span
                className="transition-colors duration-200 hover:text-[#4A8011] active:text-[#4A8011]"
              >Documents</span>,{" "}
              <span
                className="transition-colors duration-200 hover:text-[#0F766E] active:text-[#0F766E]"
              >E-Services</span>{" "}&amp;{" "}
              <span
                className="transition-colors duration-200 hover:text-[#333333] dark:hover:text-[#B8CCE0] active:text-[#333333] dark:active:text-[#B8CCE0]"
              >Tech</span>
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

                <span
                  className="relative z-10 flex-1 flex items-center justify-center whitespace-nowrap transition-colors duration-150"
                  style={{ color: REST_COLOR }}
                >
                  {/* Feature 1 — text is now dynamic (see ctaText state),
                      picked once per page load from a day/time-aware
                      pool via pickRandomCta(). */}
                  <span className="group-hover:text-white group-active:text-white transition-colors duration-150 text-xl sm:text-2xl">
                    {ctaText}
                  </span>
                </span>

                <span
                  className="relative z-10 w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full shadow-sm"
                  style={{ backgroundColor: activeCircleColor }}
                  aria-hidden="true"
                >
                  <ArrowRight
                    weight="bold"
                    style={{ color: activeArrowIconColor }}
                    className="w-4 h-4 transition-all duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </button>
            </ScrollBounce>
          </div>

          {/* Right column — hub photo collage */}
          <ScrollBounce delay={0.1} className="w-full">
            <div className="relative w-full h-[420px] sm:h-[480px] md:h-[560px]">
              {arrangement.map(({ hub, slot, width }, i) => {
                const hubAccent = isDark ? hub.colorDark : hub.colorLight
                const hubAccentFg = getArrowIconColor(hubAccent)
                return (
                  <div
                    key={hub.id}
                    className={cn2(
                      "group/tile absolute aspect-square rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-[0_6px_18px_rgba(0,0,0,0.10)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:z-[60] hover:scale-[1.03]",
                      !reducedMotion && "animate-in fade-in zoom-in-95"
                    )}
                    style={{
                      top: slot.top,
                      bottom: slot.bottom,
                      left: slot.left,
                      right: slot.right,
                      width: `${width}%`,
                      zIndex: slot.z,
                      animationDelay: reducedMotion ? undefined : `${slot.z * 40}ms`,
                      animationDuration: reducedMotion ? undefined : "500ms",
                      animationFillMode: reducedMotion ? undefined : "both",
                      ["--hub-accent" as any]: hubAccent,
                      ["--hub-accent-fg" as any]: hubAccentFg,
                    }}
                  >
                    <img src={HUB_IMAGES[hub.id]} alt={`${hub.name} example`} className="w-full h-full object-cover" />
                    <span className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[0.72rem] font-black uppercase tracking-widest bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-md transition-colors duration-200 group-hover/tile:bg-[var(--hub-accent)] group-hover/tile:text-[var(--hub-accent-fg)] group-hover/tile:border-transparent">
                      {pillLabel(hub.name)}
                    </span>
                  </div>
                )
              })}
            </div>
          </ScrollBounce>
        </div>

        {/* Marquee — Feature 2: hover reveals a small bubble naming the
            hub, click navigates there. Tooltip is absolutely positioned
            above the hovered item, using that hub's own accent color
            (reusing HUBS_DATA, same source as the collage tiles). */}
        <div
          ref={marqueeWrapRef}
          role="group"
          aria-label="Our services"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => { setMarqueePaused(false); setHoveredMarqueeIdx(null) }}
          onTouchStart={(e) => {
            e.stopPropagation()
            setMarqueePaused((p) => !p)
          }}
          className="relative w-full max-w-[1240px] py-4 overflow-visible select-none group/marquee rounded-[14px] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800"
        >
          <div className="overflow-hidden rounded-[14px] [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]">
            <button
              onClick={() => setMarqueePaused((p) => !p)}
              aria-pressed={marqueePaused}
              aria-label={marqueePaused ? "Play scrolling services list" : "Pause scrolling services list"}
              className="absolute top-1/2 right-2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-900/80 transition-colors"
            >
              {marqueePaused
                ? <Play size={11} weight="fill" aria-hidden="true" />
                : <Pause size={11} weight="fill" aria-hidden="true" />}
            </button>

            <div
              className="flex whitespace-nowrap w-max"
              style={{
                animation: reducedMotion ? "none" : undefined,
                animationPlayState: marqueePaused ? "paused" : "running",
              }}
            >
              <div className={reducedMotion ? "flex items-center shrink-0" : "flex items-center shrink-0 animate-marquee"}>
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center shrink-0" aria-hidden={copy === 1 ? "true" : undefined}>
                    {MARQUEE_ITEMS.map((item, idx) => {
                      const hubId = getMarqueeHubId(idx)
                      const hubData = HUBS_DATA.find((h) => h.id === hubId)
                      const hubAccent = hubData ? (isDark ? hubData.colorDark : hubData.colorLight) : BRAND.blue
                      const isHovered = copy === 0 && hoveredMarqueeIdx === idx
                      return (
                        <React.Fragment key={idx}>
                          <span
                            className="relative inline-flex items-center px-5 font-semibold text-base text-zinc-600 dark:text-zinc-400 transition-opacity duration-300 group-hover/marquee:opacity-70 hover:!opacity-100 cursor-pointer"
                            onMouseEnter={() => copy === 0 && setHoveredMarqueeIdx(idx)}
                            onMouseLeave={() => setHoveredMarqueeIdx(null)}
                            onClick={() => handleMarqueeItemClick(idx)}
                            role="link"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter") handleMarqueeItemClick(idx) }}
                          >
                            {item}
                            {isHovered && hubData && (
                              <span
                                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
                                role="tooltip"
                              >
                                <span
                                  className="whitespace-nowrap px-3 py-1.5 rounded-full text-white text-[0.78rem] font-bold shadow-lg flex items-center gap-1.5"
                                  style={{ backgroundColor: hubAccent }}
                                >
                                  {hubData.name}
                                  <ArrowRight size={11} weight="bold" aria-hidden="true" />
                                </span>
                                <span
                                  className="w-2.5 h-2.5 -mt-[5px] rotate-45"
                                  style={{ backgroundColor: hubAccent }}
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </span>
                          <span className="font-black text-lg leading-none shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true">
                            •
                          </span>
                        </React.Fragment>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3 — scroll-down cue. Same visual recipe as Services'
          back-to-top button (rounded-full white/zinc-900 pill, border,
          shadow, w-11/12 sizing) but pointing down and placed at the
          bottom of the hero rather than fixed to the viewport, since its
          job is "there's more below," not persistent navigation. Bounce
          animation is skipped entirely under reduced motion — the arrow
          still shows, it just doesn't move. */}
      <button
        onClick={handleScrollCueClick}
        aria-label="Scroll down to see more"
        className={cn2(
          "absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-opacity duration-300",
          showScrollCue ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          !reducedMotion && showScrollCue && "abh-scroll-cue-bounce"
        )}
      >
        <style>{`
          @keyframes abh-scroll-cue-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(5px); }
          }
          .abh-scroll-cue-bounce { animation: abh-scroll-cue-bounce 1.6s ease-in-out infinite; }
        `}</style>
        <ArrowDown size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" aria-hidden="true" />
      </button>
    </section>
  )
}

// Small local className joiner — avoids importing the shared `cn` util
// here purely to sidestep guessing its exact export path in this file;
// swap this for your existing `cn` from "@/lib/utils" if you'd rather
// keep one utility everywhere (functionally identical for this use).
function cn2(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(" ")
    } 
