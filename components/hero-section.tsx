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

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCtaPopping, setIsCtaPopping] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      r: 0.45 + Math.random() * 0.35,
      color: pick(COLORS),
      nextColor: pick(COLORS),
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
    }))

    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return { r, g, b }
    }

    function lerpColor(a: string, b: string, t: number) {
      const ca = hexToRgb(a)
      const cb = hexToRgb(b)
      const r = Math.round(ca.r + (cb.r - ca.r) * t)
      const g = Math.round(ca.g + (cb.g - ca.g) * t)
      const bl = Math.round(ca.b + (cb.b - ca.b) * t)
      return `rgb(${r},${g},${bl})`
    }

    function resize() {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "#0A1A2E"
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
        if (orb.x < -0.1) orb.x = 1.1
        if (orb.x > 1.1) orb.x = -0.1
        if (orb.y < -0.1) orb.y = 1.1
        if (orb.y > 1.1) orb.y = -0.1

        const cx = orb.x * w
        const cy = orb.y * h
        const radius = orb.r * Math.max(w, h)
        const color = lerpColor(orb.color, orb.nextColor, orb.t)

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, color.replace("rgb", "rgba").replace(")", ",0.38)"))
        grad.addColorStop(1, "rgba(0,0,0,0)")

        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  const handleDeadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    
    if (
      target.closest("button") || 
      target.closest("a") || 
      target.closest("[role='button']") ||
      window.getSelection()?.toString()
    ) {
      return
    }

    setIsCtaPopping(true)
    setTimeout(() => {
      setIsCtaPopping(false)
    }, 400) // Matches timing of standard ease-out transitions
  }

  return (
    <section 
      onClick={handleDeadClick}
      className="relative min-h-[calc(100vh-68px)] flex items-center px-4 md:px-8 py-16 md:py-20 overflow-hidden cursor-default select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: "block" }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10 w-full">
        <div className="text-center md:text-left">
          <h1 className="font-sans font-black text-3xl md:text-4xl lg:text-[3.1rem] text-white leading-tight mb-4 md:mb-5 text-balance drop-shadow-md">
            Your <span className="text-[#F4A261]">Local Tech </span> &amp; Print Partner
          </h1>
          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6 md:mb-8 text-pretty drop-shadow-sm">
            From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-center">
            
            {/* ── REFINED SYMMETRICAL POPPING ACTION BUTTON ── */}
            <button
              onClick={() => onNavigate("services")}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base text-white transform-gpu origin-center transition-all duration-300 ${
                isCtaPopping
                  ? "bg-[#6FBF1A] scale-110 shadow-[0_0_30px_rgba(111,191,26,0.6)] brightness-105"
                  : "bg-[#F4A261] hover:bg-[#D9894B] hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(244,162,97,0.4)] active:scale-95"
              }`}
            >
              See Our Services <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
            
            <a
              href="https://wa.me/27753338260"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,211,102,0.35)]"
            >
              <WhatsappLogo weight="fill" className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
        </div>

        {/* Info Grid Component Block Display Card */}
        <div className="bg-white/10 backdrop-blur-[16px] border border-white/20 rounded-[22px] p-5 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="font-sans font-extrabold text-base text-white mb-4">What We Offer</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Print Hub", dot: "#F4A261" },
              { label: "Document Hub", dot: "#6FBF1A" },
              { label: "Design Hub", dot: "#F4A261" },
              { label: "E-Service Hub", dot: "#A9D6F2" },
              { label: "Tech Hub", dot: "#6FBF1A" },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 bg-white/15 text-white px-3 py-1.5 rounded-[18px] text-sm transition-all duration-200 ease-in-out hover:bg-white/25"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: item.dot }} />
                {item.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20 text-center">
            <div>
              <div className="font-sans font-black text-xl md:text-2xl text-[#F4A261]">5</div>
              <div className="text-[0.7rem] text-white/70 mt-0.5">Hubs</div>
            </div>
            <div>
              <div className="font-sans font-black text-xl md:text-2xl text-[#F4A261]">50+</div>
              <div className="text-[0.7rem] text-white/70 mt-0.5">Services</div>
            </div>
            <div>
              <div className="font-sans font-black text-xl md:text-2xl text-[#F4A261]">Fast</div>
              <div className="text-[0.7rem] text-white/70 mt-0.5">Turnarounds</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
