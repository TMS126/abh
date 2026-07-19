"use client"

import { useEffect, useRef, useState } from "react"
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react"

export function ZoomOverlay({ images, startIndex, onClose, title }: {
  images: string[]
  startIndex: number
  onClose: () => void
  title: string
}) {
  const [idx, setIdx]   = useState(startIndex)
  const touchStartX     = useRef(0)
  const touchStartY     = useRef(0)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose()
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + images.length) % images.length)
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % images.length)
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [onClose, images.length])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) < 40 || dy > Math.abs(dx)) return
    dx < 0
      ? setIdx(i => (i + 1) % images.length)
      : setIdx(i => (i - 1 + images.length) % images.length)
  }

  return (
    <div
      className="fixed inset-0 z-[10300] bg-black/97 flex items-center justify-center animate-in fade-in duration-200"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button onClick={onClose} className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90">
        <X size={18} weight="bold" />
      </button>
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-[0.7rem] font-bold tracking-widest">
          {idx + 1} / {images.length}
        </div>
      )}
      <div className="relative w-full h-full flex items-center justify-center px-4">
        <img
          key={idx}
          src={images[idx]}
          alt={`${title} — image ${idx + 1} of ${images.length}`}
          className="max-w-full max-h-[90dvh] object-contain rounded-[14px] shadow-2xl select-none animate-in zoom-in-95 duration-200"
          draggable={false}
          onClick={onClose}
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </>
      )}
      {images.length > 1 && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap pointer-events-none">
          Swipe or use arrow keys
        </p>
      )}
    </div>
  )
}
