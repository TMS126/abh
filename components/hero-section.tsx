"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  CaretRight,
  Printer,
  FileText,
  PaintBrush,
  Globe,
  Desktop,
} from "@phosphor-icons/react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, MARQUEE_ITEMS } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

// ─── Hub Data ───────────────────────────────────────────────────────────────
const HUBS_DATA = [
  {
    id: "print",
    name: "Print Hub",
    Icon: Printer,
    colorLight: BRAND.blueDark,
    colorDark: BRAND.blue,
    services: [
      { name: "Colour Print", price: "R8" },
      { name: "B&W Print", price: "R5" },
      { name: "Photo 4x6", price: "R20" },
    ],
  },
  {
    id: "doc",
    name: "Docu Hub",
    Icon: FileText,
    colorLight: BRAND.greenDeep,
    colorDark: BRAND.greenDeep,
    services: [
      { name: "CV from Scratch", price: "R30" },
      { name: "CV Upgrade", price: "R40" },
    ],
  },
  {
    id: "design",
    name: "Design Hub",
    Icon: PaintBrush,
    colorLight: BRAND.orangeBrown,
    colorDark: BRAND.orangeBrown,
    services: [
      { name: "Logo (Basic)", price: "R300" },
      { name: "Business Card", price: "R120" },
    ],
  },
  {
    id: "eservice",
    name: "E-Service Hub",
    Icon: Globe,
    colorLight: BRAND.blueMid,
    colorDark: BRAND.lightBlue,
    services: [
      { name: "SASSA Application", price: "R40" },
      { name: "NSFAS Application", price: "R80" },
    ],
  },
  {
    id: "tech",
    name: "Tech Hub",
    Icon: Desktop,
    colorLight: BRAND.dark100,
    colorDark: "#B8CCE0",
    services: [
      { name: "PC Setup", price: "R250" },
      { name: "Virus Removal", price: "R200" },
    ],
  },
] as const

// Simple random service
function pickRandomService(hubIndex: number) {
  const services = HUBS_DATA[hubIndex].services
  return services[Math.floor(Math.random() * services.length)]
}

// Hero Section
export function HeroSection() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [activeHub, setActiveHub] = useState(0)
  const [marqueePaused, setMarqueePaused] = useState(false)
  const [spotlightService, setSpotlightService] = useState(() => pickRandomService(0))
  const [hoveredHub, setHoveredHub] = useState<number | null>(null)
  const [canHover, setCanHover] = useState(false)
  const [hubTouched, setHubTouched] = useState(false)

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })
  const [tilting, setTilting] = useState(false)

  const ecoBoxRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Detect hover capability
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    setCanHover(mq.matches)
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const active = HUBS_DATA[activeHub]
  const ActiveIcon = active.Icon

  const handleSelectHub = useCallback((index: number) => {
    setActiveHub(index)
    setHubTouched(true)
    setSpotlightService(pickRandomService(index))
  }, [])

  const handleReroll = () => {
    setSpotlightService(pickRandomService(activeHub))
  }

  const handleCtaClick = () => router.push("/services")

  // Mouse tilt
  const handleEcoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover || !ecoBoxRef.current) return
    const rect = ecoBoxRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({ ry: (px - 0.5) * 10, rx: (0.5 - py) * 10 })
    setTilting(true)
  }

  const handleEcoMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 })
    setTilting(false)
  }

  const handleEcoTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 40) {
      const next = (activeHub + (delta < 0 ? 1 : -1) + HUBS_DATA.length) % HUBS_DATA.length
      handleSelectHub(next)
    }
    touchStartX.current = null
  }

  return (
    <section
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h))] flex flex-col items-center justify-center px-4 md:px-8 pt-[calc(var(--nav-h)+56px)] md:pt-[104px] pb-16 overflow-hidden bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 opacity-5 dark:opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg...")` }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 w-full text-center">
        <h1 className="font-black text-5xl md:text-7xl tracking-tighter leading-none mb-6">
          {BIZ.tagline}
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
          From printing your documents to navigating government services — we make it simple, fast, and friendly.
        </p>

        <ScrollBounce>
          <button
            onClick={handleCtaClick}
            className="group inline-flex items-center gap-4 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full font-black text-xl transition-all active:scale-95 shadow-xl"
          >
            Start Here
            <ArrowRight className="group-hover:translate-x-2 transition" />
          </button>
        </ScrollBounce>
      </div>

      {/* Hub Ecosystem Card */}
      <ScrollBounce delay={0.2} className="mt-16 w-full max-w-2xl">
        <div
          ref={ecoBoxRef}
          onMouseMove={handleEcoMouseMove}
          onMouseLeave={handleEcoMouseLeave}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={handleEcoTouchEnd}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0d2436] text-white"
          style={{
            transform: `perspective(1000px) rotateX(\( {tilt.rx}deg) rotateY( \){tilt.ry}deg)`,
            transition: tilting ? "transform 0.1s" : "transform 0.4s",
          }}
        >
          {/* Content inside the card - keep or simplify as needed */}
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black mb-2">Core Hub Ecosystem</h2>
            <p className="opacity-80 mb-8">Tap a hub to see what we actually do there.</p>

            {/* Hub Icons Row */}
            <div className="flex justify-center gap-4 mb-8">
              {HUBS_DATA.map((hub, i) => (
                <button
                  key={hub.id}
                  onClick={() => handleSelectHub(i)}
                  className={cn("p-4 rounded-2xl transition-all", activeHub === i && "bg-white/20 scale-110")}
                >
                  <hub.Icon size={42} weight={activeHub === i ? "fill" : "regular"} />
                </button>
              ))}
            </div>

            {/* Spotlight Service */}
            <div className="text-center">
              <CaretRight className="mx-auto mb-3" size={28} />
              <p className="font-black text-xl mb-1">{active.name}</p>
              <button onClick={handleReroll} className="text-4xl font-black font-mono hover:opacity-80">
                {spotlightService.price}
              </button>
            </div>
          </div>
        </div>
      </ScrollBounce>
    </section>
  )
}

// StatsBar (kept almost as-is, minor cleanup)
export function StatsBar() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const stats = [
    { icon: Printer, value: BIZ.hubCount, label: "Hubs" },
    { icon: FileText, value: BIZ.serviceCount, label: "Services" },
    { icon: ArrowRight, value: "Fast", label: "Turnaround" },
  ]

  return (
    <section className="px-4 py-12">
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {stats.map((stat, i) => (
          <ScrollBounce key={i} delay={i * 0.1}>
            <div
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center border border-transparent hover:border-blue-200 transition-all"
            >
              <stat.icon size={32} className="mx-auto mb-3" />
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          </ScrollBounce>
        ))}
      </div>
    </section>
  )
              } 
