"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

// ─── Liquid SVG trail between two points ─────────────────────────────────────
function LiquidTrail({
  x1, y1, x2, y2, progress,
}: {
  x1: number; y1: number; x2: number; y2: number; progress: number
}) {
  if (progress < 0.01) return null

  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 2) return null

  // Control point: perpendicular bulge scaled by distance
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const perp = Math.min(dist * 0.18, 28)
  const nx = -dy / dist
  const ny = dx / dist
  const cx = mx + nx * perp
  const cy = my + ny * perp

  // Stroke width tapers from origin (thin) to cursor (thicker)
  const w1 = 3
  const w2 = 10

  // Build a bezier ribbon path
  const angle = Math.atan2(dy, dx)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // perpendicular offset at start and end
  const halfW1 = w1 / 2
  const halfW2 = w2 / 2

  // start points (origin side)
  const sx1 = x1 - sin * halfW1
  const sy1 = y1 + cos * halfW1
  const sx2 = x1 + sin * halfW1
  const sy2 = y1 - cos * halfW1

  // end points (cursor side)
  const ex1 = x2 - sin * halfW2
  const ey1 = y2 + cos * halfW2
  const ex2 = x2 + sin * halfW2
  const ey2 = y2 - cos * halfW2

  const path = `
    M ${sx1} ${sy1}
    Q ${cx - sin * halfW1} ${cy + cos * halfW1} ${ex1} ${ey1}
    L ${ex2} ${ey2}
    Q ${cx + sin * halfW2} ${cy - cos * halfW2} ${sx2} ${sy2}
    Z
  `

  const svgMinX = Math.min(x1, x2, cx) - 40
  const svgMinY = Math.min(y1, y2, cy) - 40
  const svgW = Math.max(x1, x2, cx) - svgMinX + 40
  const svgH = Math.max(y1, y2, cy) - svgMinY + 40

  const gradId = `lg-${Math.round(x1)}-${Math.round(y1)}`

  return (
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99990,
        overflow: "visible",
        opacity: Math.min(progress * 2, 0.9),
      }}
    >
      <defs>
        <linearGradient id={gradId} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F4A261" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#F4A261" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6FBF1A" stopOpacity="0.95" />
        </linearGradient>
        <filter id="liquid-blur">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Glow layer */}
      <path
        d={path}
        fill={`url(#${gradId})`}
        filter="url(#liquid-blur)"
        opacity={0.5}
        strokeLinecap="round"
      />
      {/* Sharp layer */}
      <path
        d={path}
        fill={`url(#${gradId})`}
        strokeLinecap="round"
      />
      {/* Droplet at cursor end */}
      <circle
        cx={x2}
        cy={y2}
        r={6 + progress * 6}
        fill="#6FBF1A"
        opacity={0.85}
        filter="url(#liquid-blur)"
      />
      <circle
        cx={x2}
        cy={y2}
        r={3 + progress * 3}
        fill="#A8E05A"
        opacity={0.95}
      />
    </svg>
  )
}

// ─── Floating button at cursor ─────────────────────────────────────────────
function FloatingBtn({
  x, y, progress, label,
}: {
  x: number; y: number; progress: number; label: string
}) {
  if (progress < 0.05) return null
  const scale = 0.7 + progress * 0.6
  const opacity = Math.min(progress * 2.5, 1)

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
        transition: "transform 0.05s linear, opacity 0.1s ease",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 28px",
          borderRadius: 32,
          background: "rgba(111, 191, 26, 0.18)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "2px solid rgba(111, 191, 26, 0.55)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "1rem",
          fontFamily: "var(--font-sans, sans-serif)",
          boxShadow: `0 8px 32px rgba(111,191,26,0.35), 0 0 0 ${4 * progress}px rgba(111,191,26,0.15)`,
          whiteSpace: "nowrap",
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </div>
    </div>
  )
}

// ─── Main HeroSection ──────────────────────────────────────────────────────
export function HeroSection({ onNavigate }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // Dead-click drag state
  const isDragging = useRef(false)
  const originRect = useRef<DOMRect | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [dragProgress, setDragProgress] = useState(0) // 0..1 normalized by distance
  const [originX, setOriginX] = useState(0)
  const [originY, setOriginY] = useState(0)
  const [isLifted, setIsLifted] = useState(false)
  const rafRef = useRef<number | null>(null)
  const currentPos = useRef({ x: 0, y: 0 })

  // ── Canvas orb animation ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let w = 0, h = 0

    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0008,
      vy: (Math.random() - 0.5) * 0.0008,
      r: 0.45 + Math.random() * 0.35,
      color: pick(COLORS), nextColor: pick(COLORS),
      t: Math.random(), speed: 0.002 + Math.random() * 0.003,
    }))

    function hexToRgb(hex: string) {
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      }
    }

    function lerpColor(a: string, b: string, t: number) {
      const ca = hexToRgb(a), cb = hexToRgb(b)
      return `rgb(${Math.round(ca.r + (cb.r - ca.r) * t)},${Math.round(ca.g + (cb.g - ca.g) * t)},${Math.round(ca.b + (cb.b - ca.b) * t)})`
    }

    function resize() {
      w = canvas.offsetWidth; h = canvas.offsetHeight
      canvas.width = w; canvas.height = h
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = "#0A1A2E"
      ctx.fillRect(0, 0, w, h)
      for (const orb of orbs) {
        orb.t += orb.speed
        if (orb.t >= 1) { orb.t = 0; orb.color = orb.nextColor; orb.nextColor = pick(COLORS) }
        orb.x += orb.vx; orb.y += orb.vy
        if (orb.x < -0.1) orb.x = 1.1
        if (orb.x > 1.1) orb.x = -0.1
        if (orb.y < -0.1) orb.y = 1.1
        if (orb.y > 1.1) orb.y = -0.1
        const cx = orb.x * w, cy = orb.y * h
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

    resize(); draw()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  // ── Dead-click: section-level pointer/touch down (outside buttons/links) ──
  const handleSectionPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    // Only fire on dead area (not on any interactive element)
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[role='button']")
    ) return

    // Grab origin from button position
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    originRect.current = rect

    const ox = rect.left + rect.width / 2
    const oy = rect.top + rect.height / 2
    setOriginX(ox)
    setOriginY(oy)
    currentPos.current = { x: e.clientX, y: e.clientY }
    setDragPos({ x: e.clientX, y: e.clientY })
    setDragProgress(0)
    setIsLifted(true)
    isDragging.current = true

    // Capture pointer for smooth tracking even outside element
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handleSectionPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!isDragging.current) return
    currentPos.current = { x: e.clientX, y: e.clientY }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = currentPos.current
      const ox = originX || (originRect.current ? originRect.current.left + (originRect.current.width / 2) : x)
      const oy = originY || (originRect.current ? originRect.current.top + (originRect.current.height / 2) : y)
      const dx = x - ox
      const dy = y - oy
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Progress 0→1 over first 200px of travel
      const prog = Math.min(dist / 200, 1)
      setDragPos({ x, y })
      setDragProgress(prog)
    })
  }, [originX, originY])

  const handleSectionPointerUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    // Animate back: shrink progress to 0, then un-lift
    setDragProgress(0)
    setTimeout(() => {
      setIsLifted(false)
      setDragPos({ x: 0, y: 0 })
    }, 380)
  }, [])

  // Update originX/Y dynamically in move handler via ref
  const originXRef = useRef(0)
  const originYRef = useRef(0)
  useEffect(() => { originXRef.current = originX }, [originX])
  useEffect(() => { originYRef.current = originY }, [originY])

  // Fixed move handler that reads from ref
  const handleMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!isDragging.current) return
    currentPos.current = { x: e.clientX, y: e.clientY }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = currentPos.current
      const ox = originXRef.current
      const oy = originYRef.current
      const dist = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2)
      const prog = Math.min(dist / 200, 1)
      setDragPos({ x, y })
      setDragProgress(prog)
    })
  }, [])

  return (
    <>
      {/* Liquid trail rendered as fixed SVG overlay */}
      {isLifted && (
        <LiquidTrail
          x1={originX}
          y1={originY}
          x2={dragPos.x}
          y2={dragPos.y}
          progress={dragProgress}
        />
      )}

      {/* Floating button at cursor */}
      {isLifted && (
        <FloatingBtn
          x={dragPos.x}
          y={dragPos.y}
          progress={dragProgress}
          label="See Our Services"
        />
      )}

      <section
        className="relative min-h-[calc(100vh-68px)] flex items-center px-4 md:px-8 py-16 md:py-20 overflow-hidden cursor-default select-none"
        onPointerDown={handleSectionPointerDown}
        onPointerMove={handleMove}
        onPointerUp={handleSectionPointerUp}
        onPointerCancel={handleSectionPointerUp}
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

              {/* ── See Our Services — dead-click liquid button ── */}
              <button
                ref={btnRef}
                onClick={() => onNavigate("services")}
                style={{
                  // When lifted: ghost placeholder remains, translucent
                  opacity: isLifted ? 0.18 : 1,
                  pointerEvents: isLifted ? "none" : "auto",
                  transition: isLifted
                    ? "opacity 0.15s ease"
                    : "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
                  transform: isLifted ? "scale(0.97)" : "scale(1)",
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base text-white bg-[#F4A261] hover:bg-[#D9894B] hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(244,162,97,0.4)] active:scale-95 transition-all duration-200 ease-in-out"
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

          {/* Info card */}
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
    </>
  )
        } 
