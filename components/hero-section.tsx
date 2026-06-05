"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react"

interface HeroSectionProps {
  onNavigate: (page: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const isDragging = useRef(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const btnOrigin = useRef({ x: 0, y: 0 })
  const currentOffset = useRef({ x: 0, y: 0 })
  const animFrame = useRef<number>(0)

  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragged, setIsDragged] = useState(false)
  const [scale, setScale] = useState(1)

  const snapBack = useCallback(() => {
    isDragging.current = false
    setIsDragged(false)
    setScale(1)

    const startX = currentOffset.current.x
    const startY = currentOffset.current.y
    const duration = 420
    const start = performance.now()

    function animate(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      const x = startX * (1 - ease)
      const y = startY * (1 - ease)
      currentOffset.current = { x, y }
      setOffset({ x, y })
      if (t < 1) animFrame.current = requestAnimationFrame(animate)
    }

    cancelAnimationFrame(animFrame.current)
    animFrame.current = requestAnimationFrame(animate)
  }, [])

  const getPos = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
  }

  const onPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("a")) return
    e.preventDefault()

    const pos = "touches" in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY }

    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    btnOrigin.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }

    dragStartPos.current = pos
    isDragging.current = true
    setIsDragged(true)
    setScale(1.12)
    cancelAnimationFrame(animFrame.current)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      const pos = getPos(e)
      const dx = pos.x - dragStartPos.current.x
      const dy = pos.y - dragStartPos.current.y

      const dampen = 0.55
      const maxDist = 180
      let nx = dx * dampen
      let ny = dy * dampen

      const dist = Math.sqrt(nx * nx + ny * ny)
      if (dist > maxDist) {
        nx = (nx / dist) * maxDist
        ny = (ny / dist) * maxDist
      }

      currentOffset.current = { x: nx, y: ny }
      setOffset({ x: nx, y: ny })

      const progress = Math.min(dist / maxDist, 1)
      setScale(1.12 + progress * 0.08)
    }

    const onUp = () => {
      if (!isDragging.current) return
      snapBack()
    }

    window.addEventListener("mousemove", onMove, { passive: false })
    window.addEventListener("touchmove", onMove, { passive: false })
    window.addEventListener("mouseup", onUp)
    window.addEventListener("touchend", onUp)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchend", onUp)
    }
  }, [snapBack])

  const dragDist = Math.sqrt(offset.x * offset.x + offset.y * offset.y)
  const trailOpacity = Math.min(dragDist / 80, 1) * 0.35

  return (
    <section
      ref={sectionRef}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      className="relative min-h-[calc(100vh-68px)] flex items-center px-4 md:px-8 py-16 md:py-20 overflow-hidden cursor-default select-none"
      style={{
        touchAction: "none",
        background: `
          radial-gradient(ellipse at 80% 20%, rgba(111,191,26,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 95% 80%, rgba(244,162,97,0.12) 0%, transparent 40%),
          radial-gradient(ellipse at 10% 90%, rgba(21,83,125,0.35) 0%, transparent 55%),
          linear-gradient(135deg,
            #0F3F66 0%,
            #15537D 25%,
            #1E6FA8 50%,
            #15537D 65%,
            #3E6B0E 82%,
            #B86F34 100%
          )
        `,
      }}
    >
      {/* Noise overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Liquid trail */}
      {isDragged && dragDist > 8 && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            left: btnOrigin.current.x - (sectionRef.current?.getBoundingClientRect().left ?? 0),
            top: btnOrigin.current.y - (sectionRef.current?.getBoundingClientRect().top ?? 0) + (sectionRef.current?.scrollTop ?? 0),
            width: dragDist,
            height: 44,
            transformOrigin: "0 50%",
            transform: `rotate(${Math.atan2(offset.y, offset.x)}rad) translateY(-50%)`,
            background: `linear-gradient(to right, rgba(244,162,97,${trailOpacity}), rgba(244,162,97,0))`,
            borderRadius: "22px",
            filter: "blur(8px)",
          }}
        />
      )}

      <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10 w-full">
        <div className="text-center md:text-left">
          <h1 className="font-sans font-black text-3xl md:text-4xl lg:text-[3.1rem] text-white leading-tight mb-4 md:mb-5 text-balance drop-shadow-md">
            Your <span className="text-[#F4A261]">Local Tech</span> &amp; Print Partner
          </h1>
          <p className="text-white/75 text-base md:text-lg leading-relaxed mb-6 md:mb-8 text-pretty drop-shadow-sm">
            From printing your documents to navigating government services — we make it simple, fast, and friendly. Right here in Kgotsong.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-center">

            {/* Liquid drag button */}
            <div className="relative w-full sm:w-auto">
              <div
                className="invisible inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base"
                aria-hidden
              >
                See Our Services <ArrowRight weight="bold" className="w-4 h-4" />
              </div>

              <button
                ref={btnRef}
                onClick={() => { if (dragDist < 6) onNavigate("services") }}
                className="absolute inset-0 inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-[28px] font-sans font-extrabold text-sm md:text-base text-white"
                style={{
                  background: isDragged
                    ? `rgba(244,162,97,${Math.max(0.55, 1 - dragDist / 260)})`
                    : "#F4A261",
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: isDragging.current
                    ? "background 0.15s, box-shadow 0.15s"
                    : "transform 0s, background 0.2s, box-shadow 0.2s",
                  boxShadow: isDragged
                    ? `0 ${8 + dragDist * 0.15}px ${24 + dragDist * 0.4}px rgba(244,162,97,${0.25 + dragDist * 0.003})`
                    : "0 4px 16px rgba(244,162,97,0.3)",
                  backdropFilter: isDragged ? "blur(2px)" : "none",
                  zIndex: 30,
                  cursor: isDragged ? "grabbing" : "pointer",
                  willChange: "transform",
                  pointerEvents: "auto",
                }}
              >
                {!isDragged && <ArrowRight weight="bold" className="w-4 h-4" />}
                See Our Services
              </button>
            </div>

            
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
