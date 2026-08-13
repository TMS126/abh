// app/tools/jpg-to-pdf/crop-modal.tsx
"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Check, ArrowCounterClockwise } from "@phosphor-icons/react"
import type { CropRect } from "./types"

type Inset = { top: number; left: number; right: number; bottom: number } // percent, 0-100
const DEFAULT_INSET: Inset = { top: 8, left: 8, right: 8, bottom: 8 }
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export function CropModal({
  imageUrl, fileName, initialCrop, onApply, onClose,
}: {
  imageUrl: string
  fileName: string
  initialCrop?: CropRect
  onApply: (crop: CropRect | undefined) => void
  onClose: () => void
}) {
  const toInset = (c?: CropRect): Inset =>
    c ? { top: c.y * 100, left: c.x * 100, right: (1 - c.x - c.w) * 100, bottom: (1 - c.y - c.h) * 100 } : DEFAULT_INSET

  const [inset, setInset] = useState<Inset>(toInset(initialCrop))
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ handle: string; startX: number; startY: number; start: Inset } | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = "" }
  }, [onClose])

  const onDrag = useCallback((e: PointerEvent) => {
    const drag = dragRef.current
    const frame = frameRef.current
    if (!drag || !frame) return
    const rect = frame.getBoundingClientRect()
    const dx = ((e.clientX - drag.startX) / rect.width) * 100
    const dy = ((e.clientY - drag.startY) / rect.height) * 100
    let next = { ...drag.start }

    if (drag.handle === "move") {
      next.top = clamp(drag.start.top + dy, 0, 100 - drag.start.bottom - 5)
      next.left = clamp(drag.start.left + dx, 0, 100 - drag.start.right - 5)
      next.bottom = clamp(drag.start.bottom - dy, 0, 100 - next.top - 5)
      next.right = clamp(drag.start.right - dx, 0, 100 - next.left - 5)
    } else {
      if (drag.handle.includes("n")) next.top = clamp(drag.start.top + dy, 0, 100 - drag.start.bottom - 10)
      if (drag.handle.includes("s")) next.bottom = clamp(drag.start.bottom - dy, 0, 100 - drag.start.top - 10)
      if (drag.handle.includes("w")) next.left = clamp(drag.start.left + dx, 0, 100 - drag.start.right - 10)
      if (drag.handle.includes("e")) next.right = clamp(drag.start.right - dx, 0, 100 - drag.start.left - 10)
    }
    setInset(next)
  }, [])

  const endDrag = useCallback(() => {
    dragRef.current = null
    window.removeEventListener("pointermove", onDrag)
    window.removeEventListener("pointerup", endDrag)
  }, [onDrag])

  const startDrag = (handle: string) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, start: inset }
    window.addEventListener("pointermove", onDrag)
    window.addEventListener("pointerup", endDrag)
  }

  const handleApply = () => {
    const x = inset.left / 100, y = inset.top / 100
    const w = (100 - inset.left - inset.right) / 100
    const h = (100 - inset.top - inset.bottom) / 100
    onApply(w > 0.98 && h > 0.98 ? undefined : { x, y, w, h })
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={`Crop ${fileName}`} className="fixed inset-0 z-[200] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
        <span className="text-sm font-semibold truncate">{fileName}</span>
        <button type="button" onClick={onClose} aria-label="Cancel crop" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10">
          <X size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <div ref={frameRef} className="relative" style={{ width: "min(90vw, 600px)", height: "min(60vh, 600px)" }}>
          <img src={imageUrl} alt={fileName} className="w-full h-full object-contain pointer-events-none select-none" draggable={false} />

          <div
            className="absolute pointer-events-none"
            style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)", top: `${inset.top}%`, left: `${inset.left}%`, right: `${inset.right}%`, bottom: `${inset.bottom}%` }}
          />

          <div
            onPointerDown={startDrag("move")}
            className="absolute border-2 border-white cursor-move touch-none"
            style={{ top: `${inset.top}%`, left: `${inset.left}%`, right: `${inset.right}%`, bottom: `${inset.bottom}%` }}
          >
            {(["nw", "ne", "sw", "se"] as const).map((corner) => (
              <div
                key={corner}
                onPointerDown={startDrag(corner)}
                role="slider"
                aria-label={`Resize crop from ${corner}`}
                tabIndex={0}
                className={`absolute w-5 h-5 rounded-full bg-white shadow touch-none ${
                  corner === "nw" ? "-top-2.5 -left-2.5 cursor-nwse-resize" :
                  corner === "ne" ? "-top-2.5 -right-2.5 cursor-nesw-resize" :
                  corner === "sw" ? "-bottom-2.5 -left-2.5 cursor-nesw-resize" :
                  "-bottom-2.5 -right-2.5 cursor-nwse-resize"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0">
        <button type="button" onClick={() => setInset(DEFAULT_INSET)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white/70 hover:text-white transition-colors">
          <ArrowCounterClockwise size={16} weight="bold" aria-hidden="true" />
          Reset
        </button>
        <button type="button" onClick={handleApply} className="flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-sm font-black bg-white text-zinc-900">
          <Check size={16} weight="bold" aria-hidden="true" />
          Apply Crop
        </button>
      </div>
    </div>
  )
}
