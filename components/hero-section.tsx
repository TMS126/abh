"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ArrowRight } from "@phosphor-icons/react"
import { BRAND, BIZ, MARQUEE_ITEMS } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"
import { HUBS_DATA } from "@/lib/hero-data"
import { ClassicTagline } from "@/components/classic-tagline"

// ─── Contrast helper for the arrow icon against its own circle bg ─────────────
function hexToRgbLocal(hex: string) {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean
  const bigint = parseInt(full, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}
function relativeLuminanceLocal({ r, g, b }: { r: number; g: number; b: number }) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
function getArrowIconColor(bgHex: string) {
  const lum = relativeLuminanceLocal(hexToRgbLocal(bgHex))
  const contrastWhite = 1.05 / (lum + 0.05)
  const contrastDark  = (lum + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#14202b"
}

// ─── Hub photo collage data ────────────────────────────────────────────────
const HUB_IMAGES: Record<string, string> = {
  print:    "/1_PRINT_HUB_white.webp",
  doc:      "/2_DOCUMENT_HUB_white.webp",
  design:   "/3_DESIGN_HUB_white.webp",
  eservice: "/4_APPLICATIONS_HUB_white.webp",
  tech:     "/5_TECH_HUB_white.webp",
}

// Five fixed POSITION slots (straightened — no rotation, per request), each
// giving its tile enough breathing room from its neighbors while still
// overlapping like the reference screenshot. WHICH hub lands in which slot,
// and each slot's exact size within its own range, is randomized on every
// mount (see shuffle effect below) — the slot geometry itself never
// changes, only the assignment and size jitter do.
const COLLAGE_SLOTS: { top?: string; bottom?: string; left?: string; right?: string; z: number; baseWidth: number }[] = [
  { top: "0%",    left: "0%",  z: 10, baseWidth: 46 },
  { top: "2%",    right: "2%", z: 20, baseWidth: 42 },
  { bottom: "14%", left: "6%", z: 30, baseWidth: 40 },
  { bottom: "0%",  left: "36%", z: 40, baseWidth: 38 },
  { bottom: "2%",  right: "6%", z: 50, baseWidth: 44 },
]

function pillLabel(hubName: string) {
  return hubName.replace(/\s*Hub$/i, "").toUpperCase()
}

// Fisher–Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Builds one randomized tile arrangement: shuffles which hub sits in which
// slot, and jitters each slot's width a few points around its base size —
// this is what makes the collage look slightly different every time the
// page is visited, without ever changing the underlying slot geometry.
function buildArrangement() {
  const shuffledHubs = shuffleArray(HUBS_DATA)
  return COLLAGE_SLOTS.map((slot, i) => ({
    hub: shuffledHubs[i],
    slot,
    width: slot.baseWidth + (Math.random() * 6 - 3), // ±3% jitter
  }))
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [marqueePaused, setMarqueePaused] = useState(false)

  // Arrangement starts as a stable, unshuffled default (matches server
  // render) and is randomized client-side after mount — avoids a
  // hydration mismatch while still re-shuffling on every real page visit.
  const [arrangement, setArrangement] = useState(() =>
    COLLAGE_SLOTS.map((slot, i) => ({ hub: HUBS_DATA[i], slot, width: slot.baseWidth }))
  )

  const ctaBtnRef = useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMounted(true)
    setArrangement(buildArrangement())
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  const STROKE_COLOR   = BRAND.blue
  const CTA_FILL_COLOR = BRAND.blue
  const REST_COLOR     = isDark ? BRAND.lightBlue : BRAND.blue

  const activeCircleColor    = CTA_FILL_COLOR
  const activeArrowIconColor = getArrowIconColor(activeCircleColor)

  const handleNavigate = (path: string) => router.push(path)
  const handleCtaClick = () => handleNavigate("/services")

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

        {/* ── Two-column layout on desktop: title + subtitle + CTA on the
            left, collage on the right. Stacks (text above collage) on
            mobile automatically via grid's natural DOM order. ── */}
        <div className="w-full max-w-[1100px] mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-10 md:mb-14">

          {/* Left column — text + CTA */}
          <div className="text-center md:text-left">
            {/* "Welcome to ApexbytesHub" line removed per request. Title is
                now bigger and states what the business actually does,
                rather than just a name/tagline pairing. */}
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.05] mb-4 text-balance transition-colors duration-300">
              Printing, Design, Documents &amp; Tech — All in One Place
            </h1>

            <p className="text-base md:text-lg font-medium text-zinc-600 dark:text-zinc-400 max-w-[480px] md:max-w-none mx-auto md:mx-0 leading-relaxed mb-6">
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
                className="group relative z-30 flex items-center w-[300px] sm:w-[320px] mx-auto md:mx-0 px-5 sm:px-7 py-5 rounded-full font-sans font-black text-base sm:text-lg overflow-hidden border-2 transition-all duration-150 active:duration-75 touch-manipulation hover:-translate-y-1 active:translate-y-0 active:scale-[0.94] shadow-[0_4px_14px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.7)] active:shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:active:shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
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
                  <span className="group-hover:text-white group-active:text-white transition-colors duration-150">
                    Explore Hubs
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

          {/* Right column — hub photo collage. Straightened (no rotation),
              bigger container, subtler shadow, wider slot spacing so all
              five tiles stay clearly visible while still overlapping.
              Arrangement (which hub/size per slot) reshuffles on every
              mount — see the effect above. */}
          <ScrollBounce delay={0.1} className="w-full">
            <div className="relative w-full h-[380px] sm:h-[440px] md:h-[520px]">
              {arrangement.map(({ hub, slot, width }) => {
                const hubAccent = isDark ? hub.colorDark : hub.colorLight
                return (
                  <div
                    key={hub.id}
                    className="group/tile absolute aspect-square rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-900 shadow-[0_6px_18px_rgba(0,0,0,0.10)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:z-[60] hover:scale-[1.03]"
                    style={{
                      top: slot.top,
                      bottom: slot.bottom,
                      left: slot.left,
                      right: slot.right,
                      width: `${width}%`,
                      zIndex: slot.z,
                      ["--hub-accent" as any]: hubAccent,
                    }}
                  >
                    <img
                      src={HUB_IMAGES[hub.id]}
                      alt={`${hub.name} example`}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute -top-2 -right-2 px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-md transition-colors duration-200 group-hover/tile:bg-[var(--hub-accent)] group-hover/tile:text-white group-hover/tile:border-transparent"
                    >
                      {pillLabel(hub.name)}
                    </span>
                  </div>
                )
              })}
            </div>
          </ScrollBounce>

        </div>

        {/* ── Marquee — unchanged, sits below the two-column area ── */}
        <div
          role="marquee"
          aria-label="Our services"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
          onTouchStart={(e) => { e.stopPropagation(); setMarqueePaused(p => !p) }}
          className="relative w-full max-w-[840px] py-4 overflow-hidden select-none group/marquee rounded-[14px] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800"
        >
          <div
            className="flex whitespace-nowrap w-max animate-marquee"
            style={{ animationPlayState: marqueePaused ? "paused" : "running" }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {MARQUEE_ITEMS.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span className="inline-flex items-center px-5 font-semibold text-sm text-zinc-600 dark:text-zinc-400 transition-opacity duration-300 group-hover/marquee:opacity-70 hover:!opacity-100">
                      {item}
                    </span>
                    <span className="font-black text-base leading-none shrink-0 text-zinc-300 dark:text-zinc-600" aria-hidden="true">•</span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}