"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowsLeftRight } from "@phosphor-icons/react"
import { SafeImage } from "./safe-image"

export function BeforeAfterSlider({ before, after, accent }: { before: string; after: string; accent: string }) {
  const [pos, setPos] = useState(50)
  const targetRef = useRef(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    let rafId: number
    const animate = () => {
      setPos(p => {
        const diff = targetRef.current - p
        if (Math.abs(diff) < 0.1) return targetRef.current
        rafId = requestAnimationFrame(animate)
        return p + diff * 0.2
      })
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  useEffect(() => {
    if (revealed) return
    const timer = setTimeout(() => {
      targetRef.current = 25
      setTimeout(() => { targetRef.current = 75; setTimeout(() => { targetRef.current = 50; setRevealed(true) }, 400) }, 400)
    }, 600)
    return () => clearTimeout(timer)
  }, [revealed])

  const updatePos = (clientX: number) => {
    if (!containerRef.current) return
    const { left, width } = containerRef.current.getBoundingClientRect()
    targetRef.current = Math.max(2, Math.min(98, ((clientX - left) / width) * 100))
    if ("vibrate" in navigator) navigator.vibrate(1)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    updatePos(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons) updatePos(e.clientX)
  }
  const onDoubleClick = () => { targetRef.current = 50 }

  const safePos = Math.max(pos, 1)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-col-resize touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={onDoubleClick}
    >
      <div className="absolute inset-0">
        <SafeImage src={after} alt="After" accent={accent} fill sizes="55vw" className="object-cover" priority />
        <span className="absolute bottom-3 right-3 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white shadow" style={{ backgroundColor: `${accent}cc` }}>After</span>
      </div>

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <div className="absolute inset-0" style={{ width: `${10000 / safePos}%` }}>
          <SafeImage src={before} alt="Before" accent={accent} fill sizes="55vw" className="object-cover" priority />
        </div>
        <span className="absolute bottom-3 left-3 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/50 text-white shadow">Before</span>
      </div>

      <div className="absolute top-0 bottom-0 w-0.5 pointer-events-none" style={{ left: `${pos}%`, backgroundColor: "rgba(255,255,255,0.9)", boxShadow: "0 0 8px rgba(0,0,0,0.4)", transform: "translateX(-0.5px)" }} />

      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl border-2 border-white/90 backdrop-blur-sm transition-transform hover:scale-110" style={{ backgroundColor: accent }}>
          <ArrowsLeftRight size={18} weight="bold" className="text-white" />
        </div>
        {!revealed && <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: accent }} />}
      </div>

      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold text-white/60 uppercase tracking-widest whitespace-nowrap pointer-events-none">
        Drag • Double-tap to reset
      </p>
    </div>
  )
}
