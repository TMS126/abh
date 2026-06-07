"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, WhatsappLogo, PlusCircle, Gear, Wrench, Rocket, CurrencyDollar, HandHeart, MapPin } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// ─── Strictly Locked Corporate Brand Palette ────────────────────────────────
const COLORS = [
  "#1E6FA8", // Primary Blue
  "#A9D6F2", // Light Blue Accent
  "#6FBF1A", // Primary Green
  "#548F14", // Darker Green
  "#3E6B0E", // Deep Green Asset Tint
  "#D9894B", // Core Mid-Orange
  "#F4A261", // Accent Orange
]

// ─── MARQUEE ITEMS ──────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "Apply for SASSA",
  "Print your photos (4x6 & A4)",
  "Update your CV & Formatting",
  "Laminate Documents (A5, A4 & A3)",
  "Business Cards & Logo Design",
  "Print Flyers & Posters",
  "Submit SARS, CSD & PSIRA Applications",
  "Setup Emails & Software Installations",
  "Computer troubleshooting & support",
  "Hardware setup & connections"
]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isTextPopping, setIsTextPopping] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0
    let isRunning = true

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
      if (!canvas || !isRunning) return
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }

    function draw() {
      if (!canvas || !ctx || !isRunning || w === 0 || h === 0) {
        animId = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, w, h)

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
        
        if (radius <= 0) continue

        const color = lerpColor(orb.color, orb.nextColor, orb.t)

        try {
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
          grad.addColorStop(0, color.replace("rgb", "rgba").replace(")", ",0.25)"))
          grad.addColorStop(1, "rgba(0,0,0,0)")

          ctx.fillStyle = grad
          ctx.fillRect(0, 0, w, h)
        } catch (e) {
          console.warn("Canvas background repaint suspended gracefully", e)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId)
      } else {
        ctx = canvas?.getContext("2d") || null
        resize()
      }
    }

    resize()
    draw()

    const ro = new ResizeObserver(() => {
      if (canvas && canvas.offsetWidth > 0) {
        resize()
      }
    })
    ro.observe(canvas)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      isRunning = false
      cancelAnimationFrame(animId)
      ro.disconnect()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
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

  const handleNavigate = (path: string) => {
    router.push(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section 
      onClick={handleDeadClick}
      className="relative min-h-[calc(100vh-68px)] w-full flex flex-col items-center justify-center px-4 md:px-8 pt-12 md:pt-16 pb-6 overflow-hidden cursor-default select-none bg-white dark:bg-[#081428]"
    >
      {/* Background Core Engine */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-60 dark:opacity-0 bg-[radial-gradient(circle_at_20%_30%,#1E6FA8_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#6FBF1A_0%,transparent_45%),radial-gradient(circle_at_90%_20%,#F4A261_0%,transparent_35%)]" />
        <div className="absolute inset-0 opacity-0 dark:opacity-45 bg-[radial-gradient(circle_at_30%_20%,#1E6FA8_0%,transparent_60%),radial-gradient(circle_at_70%_80%,#0F3F66_0%,transparent_50%),radial-gradient(circle_at_85%_30%,#F4A261_0%,transparent_40%)]" />
        
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80 dark:opacity-50" style={{ display: "block" }} />
        
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center relative z-10 w-full mb-8">
        <h1 className="font-sans font-black text-3xl md:text-5xl lg:text-[3.5rem] text-[#0F3F66] dark:text-[#A9D6F2] leading-tight mb-6 text-balance">
          Your Local Tech &amp; Print Partner
        </h1>
        
        <p className="text-[#333333] dark:text-white/80 text-base md:text-lg leading-relaxed mb-10 max-w-[700px] px-2">
          From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
        </p>
        
        {/* Action Buttons — Pill shaped, solid, with glow */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mb-12">
          <button
            onClick={() => handleNavigate("/services")}
            className="w-full sm:w-[180px] relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[32px] font-sans font-black text-sm text-white bg-[#F4A261] hover:bg-[#D9894B] active:scale-95 transition-all duration-300 ease-out shadow-[0_8px_20px_rgba(244,162,97,0.4)] group"
          >
            See Our Services <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <a
            href="https://wa.me/27753338260?text=Hi%20Apexbytes%20Hub%21%20I%27m%20interested%20in%20your%20services.%20Can%20you%20tell%20me%20more%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-[180px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[32px] font-sans font-black text-sm text-white bg-[#6FBF1A] hover:bg-[#548F14] active:scale-95 transition-all duration-300 ease-in-out shadow-[0_8px_20px_rgba(111,191,26,0.4)]"
          >
            <WhatsappLogo weight="fill" className="w-5 h-5" /> WhatsApp Us
          </a>
        </div>

        {/* Showcase Panel Card — Solid feel */}
        <div className="w-full max-w-[800px] bg-white dark:bg-[#152a4a] border border-[#EDEDED] dark:border-white/10 rounded-[30px] p-6 md:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.08)]">
          <h3 className="font-sans font-black text-xl text-[#1E6FA8] dark:text-white mb-8">What We Offer</h3>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              "Print Hub", "Document Hub", "Design Hub", "E-Service Hub", "Tech Hub"
            ].map((label) => (
              <span
                key={label}
                className="px-5 py-2.5 rounded-[20px] text-sm font-bold bg-gray-100 dark:bg-white/10 text-[#1E6FA8] dark:text-[#A9D6F2] transition-all duration-200 hover:scale-105"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#EDEDED] dark:border-white/10">
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

      {/* Marquee Track */}
      <div className="relative w-full mt-auto z-10 py-2 overflow-hidden select-none pointer-events-none">
        <div className="flex whitespace-nowrap animate-marquee-continuous-track w-max">
          <div className="flex items-center gap-8 px-4 shrink-0">
            {MARQUEE_ITEMS.map((item, idx) => (
              <span key={`t1-${idx}`} className="inline-flex items-center gap-3 text-[#1E6FA8] dark:text-[#A9D6F2] font-sans font-black text-sm md:text-base uppercase tracking-wider">
                <span>{item}</span>
                <span className="text-[#F4A261] font-black text-lg">•</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-8 px-4 shrink-0">
            {MARQUEE_ITEMS.map((item, idx) => (
              <span key={`t2-${idx}`} className="inline-flex items-center gap-3 text-[#1E6FA8] dark:text-[#A9D6F2] font-sans font-black text-sm md:text-base uppercase tracking-wider">
                <span>{item}</span>
                <span className="text-[#F4A261] font-black text-lg">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee-continuous-track {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee-continuous-track {
          animation: marquee-continuous-track 40s linear infinite;
        }
      `}</style>
    </section>
  )
}

// ─── STRIP SECTION ────────────────────────────────────────────────────────────
export function StripSection() {
  const items = [
    { icon: <Rocket weight="fill" className="w-6 h-6 text-[#1E6FA8]" />, title: "Fast Turnaround", desc: "No long waits, quick service" },
    { icon: <CurrencyDollar weight="fill" className="w-6 h-6 text-[#6FBF1A]" />, title: "Affordable Rates", desc: "Fair pricing for everyone" },
    { icon: <HandHeart weight="fill" className="w-6 h-6 text-[#F4A261]" />, title: "Friendly Help", desc: "We explain, never judge" },
    { icon: <MapPin weight="fill" className="w-6 h-6 text-[#1E6FA8]" />, title: "Walk-ins Welcome", desc: "5878 Mpumalanga, Kgotsong, Bothaville 9660" },
  ]

  return (
    <section className="bg-secondary py-10 md:py-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-4 transition-all duration-200 ease-in-out hover:-translate-y-1">
            <div className="w-[50px] h-[50px] bg-card rounded-[13px] flex items-center justify-center shadow-sm shrink-0 border border-border/50">
              {item.icon}
            </div>
            <div>
              <h4 className="font-sans font-bold text-foreground text-[0.92rem]">{item.title}</h4>
              <p className="text-muted-foreground text-[0.78rem] mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA BAR ──────────────────────────────────────────────────────────────────
export function CtaBar({ title, description, buttonText, buttonHref, onButtonClick }: {
  title: string; description: string; buttonText: string; buttonHref?: string; onButtonClick?: () => void
}) {
  const buttonClasses = "inline-flex items-center gap-2 px-8 py-4 rounded-[32px] font-sans font-black text-[0.95rem] bg-[#25D366] text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 shadow-[0_8px_20px_rgba(37,211,102,0.4)]"
  
  return (
    <section className="bg-[#1E6FA8] py-12 px-4 md:px-8 text-center text-white">
      <h2 className="font-sans font-black text-xl md:text-3xl mb-3">{title}</h2>
      <p className="text-[#A9D6F2] mb-8 text-[1rem] max-w-[600px] mx-auto">{description}</p>
      {buttonHref ? (
        <a href={buttonHref} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
          <WhatsappLogo weight="fill" className="w-5 h-5" /> {buttonText}
        </a>
      ) : (
        <button onClick={onButtonClick} className={buttonClasses}>
          <WhatsappLogo weight="fill" className="w-5 h-5" /> {buttonText}
        </button>
      )}
    </section>
  )
}
