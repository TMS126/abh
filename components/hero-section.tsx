"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react"

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

const COLORS = [
  "#1E6FA8", "#A9D6F2",
  "#6FBF1A", "#548F14",
  "#D9894B", "#F9D1B0",
]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const TICKER_ITEMS = [
  "Print your docs",
  "Fix your PC",
  "Apply for SASSA",
  "Design your logo",
  "Register on eFiling",
  "Laminate & scan",
  "Set up WhatsApp Business",
  "Apply for NSFAS",
  "Remove a virus",
  "Type your CV",
  "Book your learner's test",
  "Install Windows",
  "Apply for UIF",
  "Print your photos",
  "Register on CSD",
]

// Single dot color for the ticker — soft orange
const TICKER_DOT = "#D9894B"

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCtaPopping, setIsCtaPopping] = useState(false)

  // Canvas: always in DOM via md:hidden, we just control animation here
  useEffect(() => {
    // Only animate on mobile — check after mount, never during SSR
    if (typeof window === "undefined") return
    if (!window.matchMedia("(max-width: 767px)").matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const orbs = Array.from({ length: 4 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      r: 0.65 + Math.random() * 0.3,
      color: pick(COLORS),
      nextColor: pick(COLORS),
      t: Math.random(),
      speed: 0.0012 + Math.random() * 0.0015,
    }))

    function hexToRgb(hex: string) {
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      }
    }

    function lerpColor(a: string, b: string, t: number) {
      const ca = hexToRgb(a)
      const cb = hexToRgb(b)
      return `rgb(${Math.round(ca.r + (cb.r - ca.r) * t)},${Math.round(ca.g + (cb.g - ca.g) * t)},${Math.round(ca.b + (cb.b - ca.b) * t)})`
    }

    function resize() {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }

    let lastFrame = 0
    const FPS_INTERVAL = 1000 / 28

    function draw(timestamp: number) {
      animId = requestAnimationFrame(draw)
      const elapsed = timestamp - lastFrame
      if (elapsed < FPS_INTERVAL) return
      lastFrame = timestamp - (elapsed % FPS_INTERVAL)

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "#07111F"
      ctx.fillRect(0, 0, w, h)

      for (const orb of orbs) {
        orb.t += orb.speed
        if (orb.t >= 1) {
          orb.t = 0
          orb.color = orb.nextColor
          orb.nextColor = pick(COLORS)
        }
        orb.x += orb.vx
        orb.y += orb.vy
        if (orb.x < -0.2) orb.x = 1.2
        if (orb.x > 1.2) orb.x = -0.2
        if (orb.y < -0.2) orb.y = 1.2
        if (orb.y > 1.2) orb.y = -0.2

        const cx = orb.x * w
        const cy = orb.y * h
        const radius = orb.r * Math.max(w, h)
        const color = lerpColor(orb.color, orb.nextColor, orb.t)
        const rgba = (o: number) => color.replace("rgb", "rgba").replace(")", `, ${o})`)

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0,    rgba(0.20))
        grad.addColorStop(0.4,  rgba(0.09))
        grad.addColorStop(0.75, rgba(0.03))
        grad.addColorStop(1,    rgba(0))
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }
    }

    resize()
    requestAnimationFrame(draw)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  const handleDeadClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[role='button']") ||
      window.getSelection()?.toString()
    ) return
    setIsCtaPopping(true)
    setTimeout(() => setIsCtaPopping(false), 400)
  }

  return (
    <section
      onClick={handleDeadClick}
      className="relative min-h-[calc(100vh-68px)] flex items-center px-4 md:px-8 py-16 md:py-20 overflow-hidden cursor-default select-none"
    >

      {/* Mobile canvas — always in DOM, hidden on desktop via CSS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none md:hidden"
      />

      {/* Mobile dark base — sits under canvas */}
      <div
        className="absolute inset-0 pointer-events-none md:hidden"
        style={{ background: "#07111F" }}
      />

      {/* Desktop static gradient — never runs JS, pure CSS */}
      <div
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 0% 50%,   rgba(15,63,102,0.9)   0%, transparent 55%),
            radial-gradient(ellipse 70%  60% at 50% 15%,  rgba(30,111,168,0.65) 0%, transparent 55%),
            radial-gradient(ellipse 60%  55% at 90% 60%,  rgba(21,83,125,0.55)  0%, transparent 50%),
            radial-gradient(ellipse 55%  50% at 55% 95%,  rgba(62,107,14,0.50)  0%, transparent 50%),
            radial-gradient(ellipse 45%  45% at 20% 85%,  rgba(84,143,20,0.40)  0%, transparent 48%),
            radial-gradient(ellipse 35%  35% at 98% 5%,   rgba(184,111,52,0.35) 0%, transparent 48%),
            linear-gradient(155deg, #07111F 0%, #0D3558 28%, #134D72 48%, #1F4D0A 68%, #2E5C0A 82%, #6B3A10 100%)
          `,
        }}
      />

      {/* Noise texture — both breakpoints */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Content */}
      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10 w-full">
        <div className="text-center md:text-left">

          {/* Tagline — 3 brand colors, muted, always one line */}
          <p className="whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-[0.16em] mb-3 overflow-hidden text-ellipsis">
            <span style={{ color: "#8BB8D4" }}>Design</span>
            <span className="text-white/30 mx-1">·</span>
            <span style={{ color: "#8FBF5A" }}>Print</span>
            <span className="text-white/30 mx-1">·</span>
            <span style={{ color: "#C8936A" }}>Upgrade</span>
          </p>

          {/* Heading */}
          <h1 className="font-sans font-black text-3xl md:text-4xl lg:text-[3.1rem] text-white leading-tight mb-4 md:mb-5 drop-shadow-md">
            Your <span className="text-[#F4A261]">Local Tech</span> &amp; Print Partner
          </h1>

          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-7 md:mb-8 drop-shadow-sm">
            From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
          </p>

          {/* Buttons — inline-flex, no w-full, natural width */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => onNavigate("services")}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-extrabold text-sm text-white transition-all duration-300 transform-gpu ${
                isCtaPopping
                  ? "bg-[#6FBF1A] scale-110 shadow-[0_0_26px_rgba(111,191,26,0.5)]"
                  : "bg-[#F4A261] hover:bg-[#D9894B] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(244,162,97,0.4)] active:scale-95"
              }`}
            >
              See Our Services <ArrowRight weight="bold" className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/27753338260"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans font-extrabold text-sm text-white bg-[#25D366] hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(37,211,102,0.35)]"
            >
              <WhatsappLogo weight="fill" className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>

          {/* Ticker — below buttons, single dot color */}
          <div className="overflow-hidden mt-6 -mx-4 md:mx-0">
            <div className="ticker-track inline-flex whitespace-nowrap">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 text-[11px] font-medium text-white/40 px-4 flex-shrink-0"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: TICKER_DOT }}
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Info card */}
        <div className="bg-white/[0.07] backdrop-blur-[18px] border border-white/[0.12] rounded-[22px] p-5 md:p-7 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <h3 className="font-sans font-extrabold text-sm text-white/85 mb-4 uppercase tracking-wide">
            What We Offer
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Print Hub",     dot: "#F4A261" },
              { label: "Document Hub",  dot: "#6FBF1A" },
              { label: "Design Hub",    dot: "#F4A261" },
              { label: "E-Service Hub", dot: "#A9D6F2" },
              { label: "Tech Hub",      dot: "#6FBF1A" },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/20"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.dot }} />
                {item.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.10] text-center">
            <div>
              <div className="font-sans font-black text-2xl text-[#F4A261]">5</div>
              <div className="text-[0.68rem] text-white/50 mt-0.5">Hubs</div>
            </div>
            <div>
              <div className="font-sans font-black text-2xl text-[#F4A261]">50+</div>
              <div className="text-[0.68rem] text-white/50 mt-0.5">Services</div>
            </div>
            <div>
              <div className="font-sans font-black text-2xl text-[#F4A261]">Fast</div>
              <div className="text-[0.68rem] text-white/50 mt-0.5">Turnarounds</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ticker-track {
          animation: ticker-scroll 38s linear infinite;
        }
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
