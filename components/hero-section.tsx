"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, WhatsappLogo, IdentificationCard, Printer, FileText, PaintBrush, Globe, Desktop, Gear, Wrench, Monitor, Cpu, PlusCircle, CheckCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

const COLORS = [
  "#1E6FA8", "#A9D6F2",
  "#6FBF1A", "#548F14", "#3E6B0E",
  "#F4A261", "#F9D1B0",
]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctaButtonRef = useRef<HTMLButtonElement>(null)
  
  // Animation state handling for the dead-click pop out focus
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
      // Base: Deep brand blue for Dark Mode, White for Light Mode handled via CSS/Theme
      // We'll use a neutral base here and let the CSS handle the background theme
      ctx.fillStyle = "transparent"
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
        grad.addColorStop(0, color.replace("rgb", "rgba").replace(")", ",0.2)"))
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

  // Captures any click hitting a dead background zone on the hero layout
  const handleDeadClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    
    // Safely bypass if user clicks an actual button, text input, link or anchor tag
    if (
      target.closest("button") || 
      target.closest("a") || 
      target.closest("[role='button']") ||
      window.getSelection()?.toString()
    ) {
      return
    }

    // Fire smooth focus zoom scale manipulation hook
    setIsCtaPopping(true)

    // Clear hook cleanly after css transition cycle completes
    setTimeout(() => {
      setIsCtaPopping(false)
    }, 500)
  }

  const tickerText = "Apply for SASSA • Print your photos • Create a professional CV • Scan documents to digital • Design custom logos & business cards • Black & White or Colour printing • Lamination up to A3 • SARS & CSD registrations • Fast photocopying • Setup, send & receive emails • Design flyers & posters • Event invitations • Software installation & system updates • Computer troubleshooting & support • Hardware setup & connections"

  return (
    <section 
      onClick={handleDeadClick}
      className="relative min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 md:px-8 pt-16 md:pt-20 pb-8 overflow-hidden cursor-default select-none animate-fade-in bg-white dark:bg-[#0A1A2E]"
    >
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Light Mode Gradient: Dominant Blue, Moderate Green, Minimal Orange */}
        <div className="absolute inset-0 opacity-40 dark:opacity-0 bg-[radial-gradient(circle_at_20%_30%,#1E6FA8_0%,transparent_50%),radial-gradient(circle_at_80%_20%,#6FBF1A_0%,transparent_40%),radial-gradient(circle_at_50%_80%,#F4A261_0%,transparent_30%)]" />
        
        {/* Dark Mode Gradient: Brand Blues accented with Deep Green */}
        <div className="absolute inset-0 opacity-0 dark:opacity-30 bg-[radial-gradient(circle_at_30%_20%,#1E6FA8_0%,transparent_60%),radial-gradient(circle_at_70%_80%,#0F3F66_0%,transparent_50%),radial-gradient(circle_at_50%_50%,#3E6B0E_0%,transparent_40%)]" />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40"
          style={{ display: "block" }}
        />
        
        {/* Noise Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10 w-full mb-12">
        <div className="text-center md:text-left">
          <h1 className="font-sans font-black text-3xl md:text-4xl lg:text-[3.1rem] text-[#333333] dark:text-white leading-tight mb-4 md:mb-5 text-balance drop-shadow-sm">
            Your <span className="text-[#1E6FA8] dark:text-[#A9D6F2]">Local Tech </span> &amp; <span className="text-[#6FBF1A]">Print</span> Partner
          </h1>
          <p className="text-[#555555] dark:text-white/75 text-base md:text-lg leading-relaxed mb-6 md:mb-8 text-pretty">
            From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-center">
            {/* Action Button with constraints */}
            <button
              ref={ctaButtonRef}
              onClick={() => onNavigate("services")}
              className={cn(
                "w-full sm:max-w-[240px] inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base text-white transition-all duration-300 ease-out transform-gpu",
                isCtaPopping
                  ? "bg-[#6FBF1A] border-2 border-[#548F14] scale-110 shadow-[0_0_35px_rgba(111,191,26,0.55)] z-50"
                  : "bg-[#F4A261] hover:bg-[#D9894B] hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(244,162,97,0.4)] active:scale-95"
              )}
            >
              See Our Services <ArrowRight weight="bold" className="w-4 h-4" />
            </button>
            
            <a
              href="https://wa.me/27753338260"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:max-w-[240px] inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base bg-[#25D366] text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(37,211,102,0.35)]"
            >
              <WhatsappLogo weight="fill" className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
        </div>

        {/* Info Grid Component Block Display Card */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-[16px] border border-[#EDEDED] dark:border-white/20 rounded-[22px] p-5 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <h3 className="font-sans font-extrabold text-base text-[#333333] dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle weight="fill" className="text-[#6FBF1A]" /> What We Offer
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Print Hub", icon: <Printer weight="fill" className="w-4 h-4" />, color: "#F4A261" },
              { label: "Document Hub", icon: <FileText weight="fill" className="w-4 h-4" />, color: "#6FBF1A" },
              { label: "Design Hub", icon: <PaintBrush weight="fill" className="w-4 h-4" />, color: "#F4A261" },
              { label: "E-Service Hub", icon: <Globe weight="fill" className="w-4 h-4" />, color: "#1E6FA8" },
              { label: "Tech Hub", icon: <Desktop weight="fill" className="w-4 h-4" />, color: "#6FBF1A" },
            ].map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 bg-white/60 dark:bg-white/15 text-[#333333] dark:text-white px-3 py-1.5 rounded-[18px] text-sm transition-all duration-200 ease-in-out hover:bg-white/80 dark:hover:bg-white/25 border border-[#EDEDED] dark:border-transparent"
              >
                <span className="flex items-center justify-center" style={{ color: item.color }}>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#EDEDED] dark:border-white/20 text-center">
            <div>
              <div className="flex justify-center mb-1 text-[#F4A261]"><PlusCircle weight="fill" size={20} /></div>
              <div className="font-sans font-black text-xl md:text-2xl text-[#1E6FA8] dark:text-[#A9D6F2]">5</div>
              <div className="text-[0.7rem] text-[#777777] dark:text-white/70 mt-0.5 uppercase tracking-wider font-bold">Hubs</div>
            </div>
            <div>
              <div className="flex justify-center mb-1 text-[#6FBF1A]"><Gear weight="fill" size={20} /></div>
              <div className="font-sans font-black text-xl md:text-2xl text-[#1E6FA8] dark:text-[#A9D6F2]">50+</div>
              <div className="text-[0.7rem] text-[#777777] dark:text-white/70 mt-0.5 uppercase tracking-wider font-bold">Services</div>
            </div>
            <div>
              <div className="flex justify-center mb-1 text-[#1E6FA8] dark:text-[#A9D6F2]"><Wrench weight="fill" size={20} /></div>
              <div className="font-sans font-black text-xl md:text-2xl text-[#1E6FA8] dark:text-[#A9D6F2]">Fast</div>
              <div className="text-[0.7rem] text-[#777777] dark:text-white/70 mt-0.5 uppercase tracking-wider font-bold">Turnaround</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Service Ticker (Horizontal Marquee) */}
      <div className="relative w-full overflow-hidden py-4 mt-auto z-10">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white dark:from-[#0A1A2E] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white dark:from-[#0A1A2E] to-transparent z-10" />
        
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-[#333333] dark:text-[#A9D6F2] font-sans font-bold text-sm md:text-base px-4">
            {tickerText}
          </span>
          <span className="text-[#333333] dark:text-[#A9D6F2] font-sans font-bold text-sm md:text-base px-4">
            {tickerText}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  )
}
