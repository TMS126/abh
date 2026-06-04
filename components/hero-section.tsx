"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { WhatsappLogo, CaretDown } from "@phosphor-icons/react"

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

// ─── Scroll down: step through sections below hero ────────────────────────
function scrollNextSection() {
  // Collect all major section landmarks below current scroll position
  const candidates = Array.from(
    document.querySelectorAll("section, footer, [data-section]")
  ) as HTMLElement[]

  const current = window.scrollY + window.innerHeight * 0.3

  for (const el of candidates) {
    const top = el.getBoundingClientRect().top + window.scrollY
    if (top > current + 10) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
  }
  // fallback: scroll one viewport
  window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
}

// ─── Liquid SVG trail ─────────────────────────────────────────────────────
interface TrailProps {
  ox: number; oy: number
  cx: number; cy: number
  progress: number
}

function LiquidTrail({ ox, oy, cx, cy, progress }: TrailProps) {
  if (progress < 0.02) return null

  const dx = cx - ox
  const dy = cy - oy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 4) return null

  // Perpendicular bulge for the liquid curve feel
  const mx = (ox + cx) / 2
  const my = (oy + cy) / 2
  const bulge = Math.min(dist * 0.22, 36) * progress
  const nx = -dy / dist
  const ny = dx / dist
  const cpx = mx + nx * bulge
  const cpy = my + ny * bulge

  // Taper: thin at origin, thick at cursor
  const w0 = 2.5
  const w1 = 8 + progress * 8

  const angle = Math.atan2(dy, dx)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // Ribbon path: wide quadratic bezier
  const path = [
    `M ${ox - sin * w0} ${oy + cos * w0}`,
    `Q ${cpx - sin * (w0 + w1) / 2} ${cpy + cos * (w0 + w1) / 2} ${cx - sin * w1} ${cy + cos * w1}`,
    `L ${cx + sin * w1} ${cy - cos * w1}`,
    `Q ${cpx + sin * (w0 + w1) / 2} ${cpy - cos * (w0 + w1) / 2} ${ox + sin * w0} ${oy - cos * w0}`,
    "Z",
  ].join(" ")

  const gId = `trail-grad`
  const fId = `trail-glow`
  const alpha = Math.min(progress * 1.8, 0.92)

  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99990,
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id={gId} x1={ox} y1={oy} x2={cx} y2={cy} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F4A261" stopOpacity={0.15} />
          <stop offset="50%"  stopColor="#F4A261" stopOpacity={0.65 * alpha} />
          <stop offset="100%" stopColor="#6FBF1A" stopOpacity={alpha} />
        </linearGradient>
        <filter id={fId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Glow halo */}
      <path d={path} fill={`url(#${gId})`} filter={`url(#${fId})`} opacity={0.45} />
      {/* Crisp ribbon */}
      <path d={path} fill={`url(#${gId})`} />

      {/* Origin anchor dot */}
      <circle cx={ox} cy={oy} r={5} fill="#F4A261" opacity={0.55 * alpha} />

      {/* Cursor droplet glow */}
      <circle cx={cx} cy={cy} r={14 + progress * 8} fill="#6FBF1A" opacity={0.18 * alpha} filter={`url(#${fId})`} />
      {/* Cursor droplet core */}
      <circle cx={cx} cy={cy} r={5 + progress * 4} fill="#6FBF1A" opacity={alpha} />
      <circle cx={cx} cy={cy} r={2.5 + progress * 2} fill="#A8E05A" opacity={1} />
    </svg>
  )
}

// ─── Floating "See Our Services" button at cursor ─────────────────────────
function FloatingButton({
  x, y, progress,
}: { x: number; y: number; progress: number }) {
  if (progress < 0.04) return null

  const scale  = 0.72 + progress * 0.52   // 0.72 → 1.24
  const opacity = Math.min(progress * 3, 1)

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: 99995,
        pointerEvents: "none",
        opacity,
        willChange: "transform, opacity",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "13px 26px",
          borderRadius: 32,
          background: "rgba(30, 111, 168, 0.15)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "2px solid rgba(111,191,26,0.6)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "1rem",
          fontFamily: "var(--font-sans, sans-serif)",
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          boxShadow: `0 8px 28px rgba(111,191,26,0.32), 0 0 0 ${Math.round(5 * progress)}px rgba(111,191,26,0.12)`,
        }}
      >
        See Our Services
      </span>
    </div>
  )
}

// ─── Scroll Down Button ───────────────────────────────────────────────────
function ScrollDownBtn() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 80)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      onClick={scrollNextSection}
      aria-label="Scroll to next section"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 group"
    >
      <span className="text-white/50 text-[0.68rem] font-semibold tracking-widest uppercase font-sans">
        Scroll
      </span>
      <span className="w-9 h-9 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/50 transition-all duration-200">
        {/* Animated bounce chevron */}
        <CaretDown
          size={18}
          weight="bold"
          color="white"
          className="animate-bounce"
          style={{ animationDuration: "1.6s" }}
        />
      </span>
    </button>
  )
}

// ─── Main HeroSection ─────────────────────────────────────────────────────
export function HeroSection({ onNavigate }: HeroSectionProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const btnRef     = useRef<HTMLButtonElement>(null)

  // Drag state — all in refs to avoid re-render lag during tracking
  const dragging      = useRef(false)
  const originPos     = useRef({ x: 0, y: 0 })
  const rafId         = useRef<number | null>(null)
  const latestPointer = useRef({ x: 0, y: 0 })

  // React state only for rendering
  const [isLifted,  setIsLifted]  = useState(false)
  const [dragPos,   setDragPos]   = useState({ x: 0, y: 0 })
  const [progress,  setProgress]  = useState(0)

  // ── Canvas orb animation ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let animId: number
    let w = 0, h = 0

    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008, vy: (Math.random() - 0.5) * 0.0008,
      r: 0.45 + Math.random() * 0.35,
      color: pick(COLORS), nextColor: pick(COLORS),
      t: Math.random(), speed: 0.002 + Math.random() * 0.003,
    }))

    const hexToRgb = (hex: string) => ({
      r: parseInt(hex.slice(1,3),16), g: parseInt(hex.slice(3,5),16), b: parseInt(hex.slice(5,7),16),
    })
    const lerp = (a: string, b: string, t: number) => {
      const ca = hexToRgb(a), cb = hexToRgb(b)
      return `rgb(${Math.round(ca.r+(cb.r-ca.r)*t)},${Math.round(ca.g+(cb.g-ca.g)*t)},${Math.round(ca.b+(cb.b-ca.b)*t)})`
    }
    const resize = () => { w = canvas.offsetWidth; h = canvas.offsetHeight; canvas.width=w; canvas.height=h }
    const draw = () => {
      ctx.clearRect(0,0,w,h)
      ctx.fillStyle="#0A1A2E"; ctx.fillRect(0,0,w,h)
      for (const orb of orbs) {
        orb.t += orb.speed
        if (orb.t >= 1) { orb.t=0; orb.color=orb.nextColor; orb.nextColor=pick(COLORS) }
        orb.x += orb.vx; orb.y += orb.vy
        if (orb.x < -0.1) orb.x=1.1; if (orb.x > 1.1) orb.x=-0.1
        if (orb.y < -0.1) orb.y=1.1; if (orb.y > 1.1) orb.y=-0.1
        const px=orb.x*w, py=orb.y*h, rad=orb.r*Math.max(w,h)
        const color=lerp(orb.color,orb.nextColor,orb.t)
        const g=ctx.createRadialGradient(px,py,0,px,py,rad)
        g.addColorStop(0,color.replace("rgb","rgba").replace(")",",0.38)"))
        g.addColorStop(1,"rgba(0,0,0,0)")
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h)
      }
      animId=requestAnimationFrame(draw)
    }
    resize(); draw()
    const ro=new ResizeObserver(resize); ro.observe(canvas)
    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  // ── Pointer handlers ───────────────────────────────────────────────────
  const startDrag = useCallback((clientX: number, clientY: number) => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    originPos.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    latestPointer.current = { x: clientX, y: clientY }
    dragging.current = true
    setDragPos({ x: clientX, y: clientY })
    setProgress(0)
    setIsLifted(true)
  }, [])

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current) return
    latestPointer.current = { x: clientX, y: clientY }
    if (rafId.current) cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(() => {
      const { x, y } = latestPointer.current
      const { x: ox, y: oy } = originPos.current
      const dist = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2)
      const prog = Math.min(dist / 180, 1)
      setDragPos({ x, y })
      setProgress(prog)
    })
  }, [])

  const endDrag = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    if (rafId.current) cancelAnimationFrame(rafId.current)
    // Collapse trail first, then remove ghost
    setProgress(0)
    setTimeout(() => {
      setIsLifted(false)
      setDragPos({ x: 0, y: 0 })
    }, 340)
  }, [])

  // Attach native pointer events to section to fully suppress default scroll during drag
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) return
      e.preventDefault()        // ← blocks touchstart → no scroll initiated
      startDrag(e.clientX, e.clientY)
      el.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      moveDrag(e.clientX, e.clientY)
    }

    const onUp = (e: PointerEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      endDrag()
    }

    el.addEventListener("pointerdown",  onDown, { passive: false })
    el.addEventListener("pointermove",  onMove, { passive: false })
    el.addEventListener("pointerup",    onUp,   { passive: false })
    el.addEventListener("pointercancel",onUp,   { passive: false })
    return () => {
      el.removeEventListener("pointerdown",  onDown)
      el.removeEventListener("pointermove",  onMove)
      el.removeEventListener("pointerup",    onUp)
      el.removeEventListener("pointercancel",onUp)
    }
  }, [startDrag, moveDrag, endDrag])

  return (
    <>
      {/* ── Liquid trail overlay ── */}
      {isLifted && (
        <LiquidTrail
          ox={originPos.current.x}
          oy={originPos.current.y}
          cx={dragPos.x}
          cy={dragPos.y}
          progress={progress}
        />
      )}

      {/* ── Floating button at cursor ── */}
      {isLifted && (
        <FloatingButton x={dragPos.x} y={dragPos.y} progress={progress} />
      )}

      {/* ── Hero section ── */}
      <section
        ref={sectionRef}
        className="relative min-h-[calc(100vh-68px)] flex items-center px-4 md:px-8 py-16 md:py-20 overflow-hidden select-none"
        style={{ cursor: "default", touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ display: "block" }}
        />
        {/* Grain overlay */}
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

              {/* ── See Our Services — ghost placeholder while lifted ── */}
              <button
                ref={btnRef}
                onClick={() => {
                  if (!isLifted) onNavigate("services")
                }}
                style={{
                  opacity:        isLifted ? 0.14 : 1,
                  pointerEvents:  isLifted ? "none" : "auto",
                  transform:      isLifted ? "scale(0.97)" : "scale(1)",
                  transition:     isLifted
                    ? "opacity 0.12s ease, transform 0.12s ease"
                    : "opacity 0.38s cubic-bezier(0.34,1.56,0.64,1), transform 0.38s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base text-white bg-[#F4A261] hover:bg-[#D9894B] hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(244,162,97,0.4)] active:scale-95 transition-all duration-200 ease-in-out"
              >
                See Our Services
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

          {/* Info card */}
          <div className="bg-white/10 backdrop-blur-[16px] border border-white/20 rounded-[22px] p-5 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h3 className="font-sans font-extrabold text-base text-white mb-4">What We Offer</h3>
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

        {/* ── Scroll down button ── */}
        <ScrollDownBtn />
      </section>
    </>
  )
      }
