"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ArrowRight, CaretRight } from "@phosphor-icons/react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, MARQUEE_ITEMS } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"
import { ensureAccessible } from "@/lib/color-contrast"
import { HUBS_DATA, pickRandomService } from "@/lib/hero-data"

// ─── Hero Section ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted,           setMounted]           = useState(false)
  const [activeHub,         setActiveHub]         = useState<number>(0)
  const [marqueePaused,     setMarqueePaused]     = useState(false)
  const [spotlightService,  setSpotlightService]  = useState(() => pickRandomService(0))
  const [hoveredHub,        setHoveredHub]        = useState<number | null>(null)
  const [canHover,          setCanHover]          = useState(false)

  const [hubTouched, setHubTouched] = useState(false)

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [tilting, setTilting] = useState(false)
  const ecoBoxRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  const handleEcoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover || !ecoBoxRef.current) return
    const rect = ecoBoxRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const MAX_TILT = 5
    setTilt({
      ry: (px - 0.5) * MAX_TILT * 2,
      rx: (0.5 - py) * MAX_TILT * 2,
    })
    setTilting(true)
  }
  const handleEcoMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 })
    setTilting(false)
  }

  const handleEcoTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleEcoTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const SWIPE_THRESHOLD = 40
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      const dir = deltaX < 0 ? 1 : -1
      const nextIndex = (activeHub + dir + HUBS_DATA.length) % HUBS_DATA.length
      handleSelectHub(nextIndex)
    }
    touchStartX.current = null
  }

  const ctaBtnRef      = useRef<HTMLButtonElement>(null)

  React.useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setCanHover(mq.matches)
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const isDark    = mounted && resolvedTheme === "dark"
  const active    = HUBS_DATA[activeHub]
  const ActiveIcon = active.Icon

  const STROKE_COLOR   = BRAND.blue
  const CTA_FILL_COLOR = BRAND.blue

  const REST_COLOR = isDark ? BRAND.lightBlue : BRAND.blue

  const cardText      = "#FFFFFF"
  const cardTextSoft  = "rgba(255,255,255,0.82)"
  const cardTextMuted = "rgba(255,255,255,0.55)"

  const hubColor  = isDark ? active.colorDark : active.colorLight
  const nameColor = ensureAccessible(hubColor, "#0d2436", 4.5)

  const handleNavigate = (path: string) => router.push(path)

  const handleSelectHub = (index: number) => {
    setActiveHub(index)
    setHubTouched(true)
    setSpotlightService(pickRandomService(index))
    const hub = HUBS_DATA[index]
    window.dispatchEvent(
      new CustomEvent("abh:heroHubSelect", { detail: { light: hub.colorLight, dark: hub.colorDark } })
    )
  }

  const handleReroll = () => {
    setSpotlightService(prev => pickRandomService(activeHub, prev.name))
  }

  const handleCtaClick = () => {
    handleNavigate("/services")
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

        <div className="w-full max-w-[840px] mx-auto flex flex-col mb-6 md:mb-8">
          <div className="text-center md:text-left">
            <h1 className="font-sans font-black text-4xl md:text-6xl lg:text-[4.6rem] tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.08] mb-4 text-balance transition-colors duration-300">
              {BIZ.tagline}
            </h1>
            <p className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400 max-w-[480px] md:max-w-none mx-auto md:mx-0 leading-relaxed">
              From printing your documents to navigating government services — we make it simple, fast, and friendly.
            </p>
          </div>
        </div>

        <div className="relative w-full flex justify-center items-center mb-8">

          <div
            aria-hidden="true"
            className="hidden md:flex absolute inset-y-0 -right-[10%] items-center justify-center pointer-events-none select-none z-0"
          >
            {!hubTouched ? (
              <Image
                src="/logo.png"
                alt=""
                width={520}
                height={520}
                aria-hidden="true"
                style={{
                  transform: "rotate(-6deg)",
                  filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.25))",
                }}
                className="shrink-0 opacity-[0.14] dark:opacity-[0.18] md:w-[620px] md:h-[620px] object-contain"
              />
            ) : (
              <ActiveIcon
                size={520}
                weight="fill"
                aria-hidden="true"
                style={{
                  color: BRAND.blue,
                  transform: "rotate(-6deg)",
                  filter: "drop-shadow(0 22px 26px rgba(0,0,0,0.25))",
                }}
                className="shrink-0 opacity-[0.14] dark:opacity-[0.18] md:w-[620px] md:h-[620px]"
              />
            )}
          </div>

          <ScrollBounce>
            <button
              ref={ctaBtnRef}
              onClick={handleCtaClick}
              style={{
                borderColor: STROKE_COLOR,
                ["--rest" as any]: REST_COLOR,
              }}
              className="group relative z-30 inline-flex items-center gap-3 px-10 py-5 rounded-full font-sans font-black text-lg overflow-hidden border-2 transition-all duration-150 active:duration-75 touch-manipulation hover:-translate-y-1 active:translate-y-0 active:scale-[0.94] shadow-md hover:shadow-xl active:shadow-sm"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-100 md:scale-y-0 transition-transform duration-150 ease-out md:group-hover:scale-y-100 md:group-active:scale-y-100"
                style={{ backgroundColor: CTA_FILL_COLOR }}
              />
              <span className="relative z-10 text-white md:text-[color:var(--rest)] md:group-hover:text-white md:group-active:text-white transition-colors duration-150">
                Start Here
              </span>
              <ArrowRight
                weight="bold"
                aria-hidden="true"
                className="relative z-10 w-6 h-6 transition-all duration-150 group-hover:translate-x-1.5 text-white md:text-[color:var(--rest)] md:group-hover:text-white md:group-active:text-white"
              />
            </button>
          </ScrollBounce>
        </div>

        <ScrollBounce delay={0.1} className="w-full max-w-[840px] mx-auto">
          <div
            ref={ecoBoxRef}
            onMouseMove={handleEcoMouseMove}
            onMouseLeave={handleEcoMouseLeave}
            onTouchStart={handleEcoTouchStart}
            onTouchEnd={handleEcoTouchEnd}
            className="relative w-full rounded-[14px] overflow-hidden"
            style={{
              transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilting ? 1.012 : 1})`,
              transformStyle: "preserve-3d",
              transition: tilting ? "transform 90ms ease-out" : "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform",
              boxShadow:
                "0 60px 120px -25px rgba(0,0,0,0.65), " +
                "0 35px 70px -30px rgba(0,0,0,0.75), " +
                `0 0 100px -15px ${BRAND.blue}70, ` +
                "inset 0 1px 0 rgba(255,255,255,0.28), " +
                "inset 0 -44px 60px -30px rgba(0,0,0,0.55)",
            }}
          ><div
    className="absolute inset-0 z-0"
    aria-hidden="true"
    style={{ backgroundColor: BRAND.blueDark }}
  />


            <div className="relative z-10 w-full flex flex-col items-center px-6 sm:px-10 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-14">

              <div className="w-full flex flex-col items-center mb-5">
                <h2
                  className="abh-section-heading mb-2 text-center"
                  style={{ color: cardText }}
                >
                  Core Hub Ecosystem
                </h2>
                <p
                  className="text-sm font-medium text-center"
                  style={{ color: cardTextSoft }}
                >
                  Tap a hub to see what we actually do there.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Service hubs"
                className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 w-full max-w-[420px] mb-4 px-1"
              >
                {HUBS_DATA.map((hub, index) => {
                  const isActive  = activeHub === index
                  const isHovered = hoveredHub === index

                  return (
                    <button
                      key={hub.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={hub.name}
                      onClick={() => handleSelectHub(index)}
                      onMouseEnter={() => setHoveredHub(index)}
                      onMouseLeave={() => setHoveredHub(null)}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-1.5 px-4 sm:px-5 pt-4 pb-2.5 rounded-[14px] transition-all duration-200 flex-1 min-w-[56px]",
                        isActive && "shadow-md"
                      )}
                      style={{
                        backgroundColor: isActive
                          ? "rgba(255,255,255,0.18)"
                          : (isHovered ? "rgba(255,255,255,0.08)" : "transparent"),
                      }}
                    >
                      <span
                        className="transition-all duration-200 flex"
                        style={{
                          color: cardText,
                          opacity: isActive ? 1 : (isHovered ? 0.85 : 0.45),
                          transform: isActive ? "translateY(-1px) scale(1.08)" : "none",
                        }}
                      >
                        {hub.icon(isActive)}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div
                role="tablist"
                aria-label="Hub pagination"
                className="flex items-center justify-center gap-1.5 mb-6"
              >
                {HUBS_DATA.map((hub, index) => {
                  const isActive = activeHub === index
                  return (
                    <button
                      key={hub.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Go to ${hub.name}`}
                      onClick={() => handleSelectHub(index)}
                      className={cn("h-2 rounded-full transition-all duration-300", isActive ? "w-6" : "w-2")}
                      style={{ backgroundColor: cardText, opacity: isActive ? 1 : 0.35 }}
                    />
                  )
                })}
              </div>

              <div className="w-full max-w-[420px] flex flex-col items-center text-center mb-2">
                <CaretRight
                  size={22}
                  weight="bold"
                  aria-hidden="true"
                  style={{ color: nameColor }}
                  className="mb-1"
                />

                <p
                  className="text-[0.8rem] font-black uppercase tracking-widest pb-2 mb-3 border-b-2 inline-block"
                  style={{ color: nameColor, borderColor: nameColor }}
                >
                  {active.name}
                </p>

                <button
                  key={`${activeHub}-${spotlightService.name}`}
                  onClick={handleReroll}
                  aria-label="Show another example price for this hub"
                  className="flex flex-col items-center gap-1 rounded-[10px] px-2 py-1 transition-opacity hover:opacity-80 active:scale-[0.97] animate-in fade-in duration-200"
                >
                  <span className="text-sm font-semibold" style={{ color: cardText }}>
                    {spotlightService.name}
                  </span>
                  <span className="text-2xl font-black font-mono" style={{ color: cardText }}>
                    {spotlightService.price}
                  </span>
                </button>

                <button
                  onClick={() => handleNavigate(`/services?hub=${active.id}`)}
                  className="flex items-center justify-center gap-1.5 text-[0.65rem] font-black tracking-wide mt-4 transition-opacity hover:opacity-70"
                  style={{ color: cardText }}
                >
                  View All {active.name} Services
                  <ArrowRight weight="bold" className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>

              <div
                role="marquee"
                aria-label="Our services"
                onMouseEnter={() => setMarqueePaused(true)}
                onMouseLeave={() => setMarqueePaused(false)}
                onTouchStart={(e) => { e.stopPropagation(); setMarqueePaused(p => !p) }}
                className="relative w-full mt-8 py-4 overflow-hidden select-none group/marquee"
              >
                <div
                  className="flex whitespace-nowrap w-max animate-marquee"
                  style={{ animationPlayState: marqueePaused ? "paused" : "running" }}
                >
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex items-center shrink-0">
                      {MARQUEE_ITEMS.map((item, idx) => (
                        <React.Fragment key={idx}>
                          <span className="inline-flex items-center px-5 font-semibold text-sm transition-opacity duration-300 group-hover/marquee:opacity-70 hover:!opacity-100" style={{ color: cardTextSoft }}>
                            {item}
                          </span>
                          <span className="font-black text-base leading-none shrink-0" style={{ color: cardText }} aria-hidden="true">•</span>
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </ScrollBounce>
      </div>
    </section>
  )
                          } 
