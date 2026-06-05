"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

// Strictly Locked Corporate Brand Palette
const COLORS = [
  "#1E6FA8", // Primary Blue
  "#A9D6F2", // Light Blue Accent
  "#6FBF1A", // Primary Green
  "#548F14", // Darker Green
  "#3E6B0E", // Deep Green Asset Tint
  "#D9894B", // Core Mid-Orange
  "#F4A261", // Accent Orange
]

// Actionable operational tasks for the continuous ticker marquee
const MARQUEE_ITEMS = [
  "Apply for SASSA",
  "Print your photos (4x6 & A4)",
  "Update your CV & Formatting",
  "Laminate Documents (A5, A4 & A3)",
  "Register a Company & Logo Design",
  "Print Flyers & Posters",
  "Submit SARS, CSD & PSIRA Applications",
  "Setup Emails & Software Installations",
  "and more...",
]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctaButtonRef = useRef<HTMLButtonElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 })
  
  // Animation state handling for the background click macro focus
  const [isCtaPopping, setIsCtaPopping] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    // Setup 6 premium fluid interactive color orbs
    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
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
      
      // Enforce dark mode canvas architecture background: Corporate Deep Blue
      ctx.fillStyle = "#0F3F66"
      ctx.fillRect(0, 0, w, h)

      // Smoothly interpolate current mouse tracking location values
      const mouse = mouseRef.current
      mouse.x += (mouse.targetX - mouse.x) * 0.08
      mouse.y += (mouse.targetY - mouse.y) * 0.08

      for (const orb of orbs) {
        orb.t += orb.speed
        if (orb.t >= 1) {
          orb.t = 0
          orb.color = orb.nextColor
          orb.nextColor = pick(COLORS)
        }

        // Apply natural base orbit velocities
        orb.x += orb.vx
        orb.y += orb.vy

        // Option 3 Implementation: Subtle gravitational attraction towards client cursor path
        const dx = mouse.x - orb.x
        const dy = mouse.y - orb.y
        orb.x += dx * 0.0012
        orb.y += dy * 0.0012

        // Canvas boundary wrapping safeguards
        if (orb.x < -0.2) orb.x = 1.2
        if (orb.x > 1.2) orb.x = -0.2
        if (orb.y < -0.2) orb.y = 1.2
        if (orb.y > 1.2) orb.y = -0.2

        const cx = orb.x * w
        const cy = orb.y * h
        const radius = orb.r * Math.max(w, h)
        const color = lerpColor(orb.color, orb.nextColor, orb.t)

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, color.replace("rgb", "rgba").replace(")", ",0.32)"))
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

  // Tracks cursor position normalized across canvas window bounds
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current.targetX = (e.clientX - rect.left) / rect.width
    mouseRef.current.targetY = (e.clientY - rect.top) / rect.height
  }

  // Captures any click hitting an empty background layout region
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
    setTimeout(() => setIsCtaPopping(false), 500)
  }

  return (
    <section 
      onClick={handleDeadClick}
      onMouseMove={handleMouseMove}
      className="relative min-h-[calc(100vh-68px)] flex items-center px-4 md:px-8 py-12 md:py-16 overflow-hidden cursor-default select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: "block" }}
      />
      
      {/* Texture Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      <div className="max-w-[1140px] mx-auto grid md:grid-cols-5 gap-10 md:gap-8 items-center relative z-10 w-full">
        
        {/* Left Column Text Content */}
        <div className="text-center md:text-left md:col-span-3 flex flex-col justify-center">
          <h1 className="font-sans font-black text-3xl md:text-4xl lg:text-[3.25rem] text-white leading-tight mb-4 md:mb-5 text-balance drop-shadow-md">
            Your <span className="text-[#F4A261]">Local Tech</span> &amp; Print Partner
          </h1>
          <p className="text-[#A9D6F2] text-sm md:text-base leading-relaxed mb-6 md:mb-8 text-pretty drop-shadow-sm max-w-[520px] mx-auto md:mx-0">
            From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
          </p>
          
          {/* Button Layout with Rigid Ergonomic Inline Padding Constraints */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-center mb-8 w-full">
            <button
              ref={ctaButtonRef}
              onClick={() => onNavigate("services")}
              className={cn(
                "w-full max-w-xs sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-7 py-3.5 rounded-[28px] font-sans font-extrabold text-sm md:text-base text-white transition-all duration-300 ease-out transform-gpu",
                isCtaPopping
                  ? "bg-[#6FBF1A] border-2 border-[#548F14] scale-110 rotate-1 shadow-[0_0_35px_rgba(111,191,26,0.65)] z-50"
                  : "bg-[#F4A261] hover:bg-[#D9894B] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(244,162,97,0.35)] active:scale-95"
              )}
            >
              See Our Services <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
            
            <a
              href="https://wa.me/27753338260"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-xs sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-7 py-3.5 rounded-[28px] font-sans font-extrabold text-sm md:text-base bg-[#25D366] text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(37,211,102,0.3)] no-underline"
            >
              <WhatsappLogo weight="fill" className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>

          {/* Option 2 & Part 3 Directive: Dynamic Horizontal Continuous Text Marquee */}
          <div className="w-full overflow-hidden relative py-2 bg-black/10 backdrop-blur-sm rounded-xl border border-white/5 max-w-[560px] mx-auto md:mx-0">
            <div className="flex whitespace-nowrap animate-marquee items-center gap-6">
              {/* Render Duplicated Content Sets to Guarantee Loop Flow Transition */}
              {Array.from({ length: 2 }).map((_, setIdx) => (
                <div key={setIdx} className="flex items-center gap-6 shrink-0">
                  {MARQUEE_ITEMS.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-2.5 text-xs font-bold text-[#A9D6F2] tracking-wide uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F4A261] shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Option 1 & Directive 1 Image Showcase Mockup Grid Panel */}
        <div className="w-full md:col-span-2 relative group flex justify-center items-center">
          {/* Accent Glow Backplate Element matching Dark Mode Architecture rules */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1E6FA8] to-[#6FBF1A] opacity-20 blur-[40px] rounded-full transition-opacity duration-500 group-hover:opacity-30 pointer-events-none" />
          
          <div className="bg-white/5 backdrop-blur-[24px] border border-white/10 rounded-[24px] p-6 md:p-7 shadow-[0_15px_45px_rgba(0,0,0,0.3)] w-full relative z-10 transition-transform duration-500 hover:scale-[1.015]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <h3 className="font-sans font-black text-xs uppercase tracking-wider text-[#A9D6F2]">Operational Portfolio</h3>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
            </div>

            {/* Comprehensive Corporate Division Token Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: "Print Hub", color: "#F4A261" },
                { label: "Document Hub", color: "#6FBF1A" },
                { label: "Design Hub", color: "#F4A261" },
                { label: "E-Service Hub", color: "#A9D6F2" },
                { label: "Tech Hub", color: "#6FBF1A" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border border-white/5 hover:bg-white/20"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>

            {/* Nested Interactive Mockup Dashboard Element */}
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center text-[0.7rem] text-[#A9D6F2]/70 font-mono mb-3">
                <span> studio_terminal.sh</span>
                <span className="text-[#6FBF1A]">● Active</span>
              </div>
              <div className="space-y-2 font-mono text-xs text-white/90">
                <p className="text-white/40">&gt; npm run build:apexbytes</p>
                <p className="text-[#A9D6F2]">✓ Enforced structural branding palette config</p>
                <p className="text-[#6FBF1A]">✓ Sanitized workspace vectors &amp; code markers</p>
                <p className="text-[#F4A261]">✓ Optimized localized execution matrix</p>
              </div>
            </div>

            {/* Performance Metric Architecture Grid */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-white/10 text-center">
              <div>
                <div className="font-sans font-black text-xl md:text-2xl text-[#F4A261]">5</div>
                <div className="text-[0.65rem] font-black text-[#A9D6F2] uppercase tracking-wider mt-0.5">Hubs</div>
              </div>
              <div>
                <div className="font-sans font-black text-xl md:text-2xl text-[#6FBF1A]">50+</div>
                <div className="text-[0.65rem] font-black text-[#A9D6F2] uppercase tracking-wider mt-0.5">Services</div>
              </div>
              <div>
                <div className="font-sans font-black text-xl md:text-2xl text-[#F4A261]">Fast</div>
                <div className="text-[0.65rem] font-black text-[#A9D6F2] uppercase tracking-wider mt-0.5">Turns</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Global CSS Global Styles Matrix Injection for Marquee Smooth Loop */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
 
