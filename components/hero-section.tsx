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
  const sectionRef = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // Drag state
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 }) // offset from origin in px
  const originRef = useRef<{ x: number; y: number } | null>(null)
  const rafRef = useRef<number | null>(null)
  const targetPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })

  // Canvas orbs
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

  // Smooth liquid follow loop
  function startLiquidLoop() {
    function loop() {
      const lerpFactor = 0.12
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpFactor
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpFactor
      setPos({ x: currentPos.current.x, y: currentPos.current.y })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  function stopLiquidLoop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }

  // Get pointer coords relative to section
  function getRelativeCoords(clientX: number, clientY: number) {
    const section = sectionRef.current
    const btn = btnRef.current
    if (!section || !btn) return null
    const sr = section.getBoundingClientRect()
    const br = btn.getBoundingClientRect()
    // btn center in section coords
    const btnCenterX = br.left + br.width / 2 - sr.left
    const btnCenterY = br.top + br.height / 2 - sr.top
    // pointer in section coords
    const px = clientX - sr.left
    const py = clientY - sr.top
    return { dx: px - btnCenterX, dy: py - btnCenterY }
  }

  // ── Mouse events ──
  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getRelativeCoords(e.clientX, e.clientY)
    if (!coords) return
    originRef.current = { x: 0, y: 0 }
    targetPos.current = coords
    currentPos.current = { x: 0, y: 0 }
    setDragging(true)
    startLiquidLoop()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    const coords = getRelativeCoords(e.clientX, e.clientY)
    if (!coords) return
    targetPos.current = coords
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return
    // Check if released near origin (within 40px) — navigate
    const dist = Math.sqrt(currentPos.current.x ** 2 + currentPos.current.y ** 2)
    if (dist < 40) onNavigate("services")
    stopLiquidLoop()
    targetPos.current = { x: 0, y: 0 }
    // Snap back smoothly
    function snapBack() {
      currentPos.current.x += (0 - currentPos.current.x) * 0.18
      currentPos.current.y += (0 - currentPos.current.y) * 0.18
      setPos({ x: currentPos.current.x, y: currentPos.current.y })
      if (Math.abs(currentPos.current.x) > 0.5 || Math.abs(currentPos.current.y) > 0.5) {
        rafRef.current = requestAnimationFrame(snapBack)
      } else {
        currentPos.current = { x: 0, y: 0 }
        setPos({ x: 0, y: 0 })
        setDragging(false)
      }
    }
    rafRef.current = requestAnimationFrame(snapBack)
  }

  // ── Touch events ──
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    const coords = getRelativeCoords(t.clientX, t.clientY)
    if (!coords) return
    originRef.current = { x: 0, y: 0 }
    targetPos.current = coords
    currentPos.current = { x: 0, y: 0 }
    setDragging(true)
    startLiquidLoop()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return
    e.preventDefault()
    const t = e.touches[0]
    const coords = getRelativeCoords(t.clientX, t.clientY)
    if (!coords) return
    targetPos.current = coords
  }

  const handleTouchEnd = () => {
    if (!dragging) return
    stopLiquidLoop()
    targetPos.current = { x: 0, y: 0 }
    function snapBack() {
      currentPos.current.x += (0 - currentPos.current.x) * 0.18
      currentPos.current.y += (0 - currentPos.current.y) * 0.18
      setPos({ x: currentPos.current.x, y: currentPos.current.y })
      if (Math.abs(currentPos.current.x) > 0.5 || Math.abs(currentPos.current.y) > 0.5) {
        rafRef.current = requestAnimationFrame(snapBack)
      } else {
        currentPos.current = { x: 0, y: 0 }
        setPos({ x: 0, y: 0 })
        setDragging(false)
      }
    }
    rafRef.current = requestAnimationFrame(snapBack)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  // Stretch: how far is the button from origin
  const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2)
  const maxDist = 300
  const progress = Math.min(dist / maxDist, 1) // 0 = at origin, 1 = far away

  // Scale grows as it moves away, from 1 to 1.35
  const scale = dragging ? 1 + progress * 0.35 : 1

  // Opacity of the "liquid trail" line
  const trailOpacity = dragging ? progress * 0.6 : 0

  // Angle of the drag
  const angle = Math.atan2(pos.y, pos.x) * (180 / Math.PI)

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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

            {/* ── LIQUID DRAG BUTTON ── */}
            <div className="relative w-full sm:w-auto flex justify-center md:justify-start">

              {/* Liquid trail line from origin to button */}
              {dragging && dist > 8 && (
                <div
                  className="absolute pointer-events-none z-0"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: `${dist}px`,
                    height: `${Math.max(6 - progress * 3, 2)}px`,
                    marginLeft: 0,
                    marginTop: `-${Math.max(6 - progress * 3, 2) / 2}px`,
                    transformOrigin: "left center",
                    transform: `rotate(${angle}deg)`,
                    background: `linear-gradient(to right, rgba(244,162,97,${trailOpacity}), rgba(244,162,97,0))`,
                    borderRadius: "999px",
                    filter: "blur(2px)",
                  }}
                />
              )}

              {/* Ghost origin placeholder — only visible when dragging */}
              {dragging && (
                <div
                  className="absolute inset-0 rounded-[28px] border-2 border-dashed border-white/20 pointer-events-none"
                  style={{ zIndex: 0 }}
                />
              )}

              {/* The button itself */}
              <button
                ref={btnRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={() => { if (!dragging) onNavigate("services") }}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                  transition: dragging ? "none" : "transform 0.05s ease-out",
                  opacity: dragging ? 0.85 : 1,
                  zIndex: dragging ? 50 : 1,
                  position: "relative",
                  willChange: "transform",
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base bg-[#F4A261] text-white hover:bg-[#D9894B] shadow-[0_8px_24px_rgba(244,162,97,0.35)] cursor-grab active:cursor-grabbing select-none touch-none"
              >
                {dragging ? "See Our Services" : (
                  <>See Our Services <ArrowRight weight="bold" className="w-4 h-4" /></>
                )}
              </button>
            </div>

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
  )
      } 
