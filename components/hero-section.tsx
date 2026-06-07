"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, WhatsappLogo, PlusCircle, Gear, Wrench } from "@phosphor-icons/react"
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
  const [isTextPopping, setIsTextPopping] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [whatsappExiting, setWhatsappExiting] = useState(false)
  const tickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0

    const orbs = Array.from({ length: 8 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: 0.5 + Math.random() * 0.4,
      color: pick(COLORS),
      nextColor: pick(COLORS),
      t: Math.random(),
      speed: 0.0015 + Math.random() * 0.0025,
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
        grad.addColorStop(0, color.replace("rgb", "rgba").replace(")", ",0.25)"))
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
    if (target.closest("button") || target.closest("a") || target.closest("[role='button']") || window.getSelection()?.toString()) {
      return
    }
    setIsTextPopping(true)
    setTimeout(() => setIsTextPopping(false), 500)
  }

  const handleServicesClick = () => {
    setIsExiting(true)
    setTimeout(() => {
      onNavigate("services")
    }, 600)
  }

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setWhatsappExiting(true)
  }

  const tickerText = "Apply for SASSA • Print your photos • Create a professional CV • Scan documents to digital • Design custom logos & business cards • Black & White or Colour printing • Lamination up to A3 • SARS & CSD registrations • Fast photocopying • Setup, send & receive emails • Design flyers & posters • Event invitations • Software installation & system updates • Computer troubleshooting & support • Hardware setup & connections"

  return (
    <section 
      onClick={handleDeadClick}
      className={cn(
        "relative min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-4 md:px-8 pt-12 md:pt-16 pb-12 overflow-hidden cursor-default select-none transition-all duration-700 ease-in-out",
        isExiting || whatsappExiting ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100 animate-fade-in",
        "bg-white dark:bg-[#081428]"
      )}
    >
      {/* Solid Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-100 dark:opacity-0 bg-[radial-gradient(circle_at_20%_30%,#1E6FA8_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#6FBF1A_0%,transparent_45%),radial-gradient(circle_at_90%_20%,#F4A261_0%,transparent_35%)]" />
        <div className="absolute inset-0 opacity-0 dark:opacity-45 bg-[radial-gradient(circle_at_30%_20%,#1E6FA8_0%,transparent_60%),radial-gradient(circle_at_70%_80%,#0F3F66_0%,transparent_50%),radial-gradient(circle_at_85%_30%,#F4A261_0%,transparent_40%)]" />
        
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80 dark:opacity-50" style={{ display: "block" }} />
      </div>

      <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center relative z-10 w-full mb-12">
        {/* Heading - Solid Dark Blue */}
        <h1 className="font-sans font-black text-3xl md:text-5xl lg:text-[3.5rem] text-[#0F3F66] dark:text-white leading-tight mb-6 text-balance">
          Your Local Tech &amp; Print Partner
        </h1>
        
        {/* Subtext - Solid Black */}
        <p className="text-[#333333] dark:text-white/80 text-base md:text-lg leading-relaxed mb-10 max-w-[700px]">
          From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mb-14">
          {/* Services Button - Solid Orange Pill */}
          <button
            onClick={handleServicesClick}
            className="w-full sm:w-[168px] relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-sans font-black text-sm text-white bg-[#D9894B] hover:bg-[#B86F34] active:bg-[#D9894B] transition-all duration-300 ease-out overflow-hidden group shadow-[0_8px_20px_rgba(217,137,75,0.4)]"
          >
            <span className={cn(
              "transition-all duration-300 ease-out inline-flex items-center justify-center gap-2 w-full h-full",
              isTextPopping ? "scale-115 tracking-wide" : "scale-100"
            )}>
              See Our Services <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          {/* WhatsApp Button - Solid Green Pill */}
          <a
            href="https://wa.me/27753338260?text=Hi%20Apexbytes%20Hub%21%20I%27m%20interested%20in%20your%20services.%20Can%20you%20tell%20me%20more%3F"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="w-full sm:w-[168px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full font-sans font-black text-sm text-white bg-[#1E7E34] hover:bg-[#155724] active:bg-[#1E7E34] transition-all duration-300 ease-in-out shadow-[0_8px_20px_rgba(30,126,52,0.4)]"
          >
            <WhatsappLogo weight="fill" className="w-5 h-5" /> WhatsApp Us
          </a>
        </div>

        {/* What We Offer Card - Solid White */}
        <div className="w-full max-w-[800px] bg-white dark:bg-zinc-900 rounded-[22px] p-6 md:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_45px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800">
          <h3 className="font-sans font-black text-xl text-[#1E6FA8] dark:text-white mb-8">What We Offer</h3>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              "Print Hub", "Document Hub", "Design Hub", "E-Service Hub", "Tech Hub"
            ].map((label) => (
              <span
                key={label}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-gray-100 dark:bg-zinc-800 text-[#1E6FA8] dark:text-[#A9D6F2] transition-all duration-200 hover:scale-105"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-zinc-700">
            <div className="flex flex-col items-center">
              <div className="text-[#1E6FA8] dark:text-[#7EC8F0] mb-2"><PlusCircle weight="fill" size={28} /></div>
              <div className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2]">5</div>
              <div className="text-[0.75rem] text-[#777777] dark:text-white/60 mt-1 uppercase tracking-widest font-bold">Hubs</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#1E6FA8] dark:text-[#7EC8F0] mb-2"><Gear weight="fill" size={28} /></div>
              <div className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2]">50+</div>
              <div className="text-[0.75rem] text-[#777777] dark:text-white/60 mt-1 uppercase tracking-widest font-bold">Services</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[#1E6FA8] dark:text-[#7EC8F0] mb-2"><Wrench weight="fill" size={28} /></div>
              <div className="font-sans font-black text-2xl md:text-3xl text-[#1E6FA8] dark:text-[#A9D6F2]">Fast</div>
              <div className="text-[0.75rem] text-[#777777] dark:text-white/60 mt-1 uppercase tracking-widest font-bold">Turnaround</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seamless Marquee */}
      <div className="relative w-full mt-auto z-10 py-4 overflow-hidden">
        <div 
          ref={tickerRef}
          className="flex animate-marquee-seamless"
          style={{ width: "fit-content" }}
        >
          <span className="text-[#1E6FA8] dark:text-[#A9D6F2] font-sans font-black text-sm md:text-base px-2 tracking-tight whitespace-nowrap flex-shrink-0">
            {tickerText}
          </span>
          <span className="text-[#1E6FA8] dark:text-[#A9D6F2] font-sans font-black text-sm md:text-base px-2 tracking-tight whitespace-nowrap flex-shrink-0">
            {tickerText}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-seamless {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0px)); }
        }
        .animate-marquee-seamless {
          animation: marquee-seamless 20s linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  )
}
