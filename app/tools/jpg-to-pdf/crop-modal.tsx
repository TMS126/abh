// app/tools/jpg-to-pdf/crop-modal.tsx
"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { X, Check, ArrowCounterClockwise, Rectangle, Shapes } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"
import { CROP_ASPECT_PRESETS } from "./constants"
import type { CropRect, CropPoint } from "./types"

type Inset = { top: number; left: number; right: number; bottom: number }
type Corners = [CropPoint, CropPoint, CropPoint, CropPoint]
type Mode = "rect" | "quad"
type ImageRect = { top: number; left: number; width: number; height: number }
type MagnifierPos = { x: number; y: number } // frame-relative percent

const DEFAULT_INSET: Inset = { top: 8, left: 8, right: 8, bottom: 8 }
const MAG_SIZE = 132
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
const insetToCorners = (inset: Inset): Corners => [
  { x: inset.left / 100, y: inset.top / 100 },
  { x: 1 - inset.right / 100, y: inset.top / 100 },
  { x: 1 - inset.right / 100, y: 1 - inset.bottom / 100 },
  { x: inset.left / 100, y: 1 - inset.bottom / 100 },
]

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
    c && !c.corners ? { top: c.y * 100, left: c.x * 100, right: (1 - c.x - c.w) * 100, bottom: (1 - c.y - c.h) * 100 } : DEFAULT_INSET

  const [mode, setMode] = useState<Mode>(initialCrop?.corners ? "quad" : "rect")
  const [inset, setInset] = useState<Inset>(toInset(initialCrop))
  const [corners, setCorners] = useState<Corners>(initialCrop?.corners || insetToCorners(DEFAULT_INSET))
  const [aspect, setAspect] = useState<number | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [imageRect, setImageRect] = useState<ImageRect>({ top: 0, left: 0, width: 100, height: 100 })
  const [magnifierPos, setMagnifierPos] = useState<MagnifierPos | null>(null)
  const [magnifierActive, setMagnifierActive] = useState(false)

  const frameRef = useRef<HTMLDivElement>(null)
  const imgElRef = useRef<HTMLImageElement>(null)
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<{ kind: "inset" | "corner"; handle: string; startX: number; startY: number; startInset: Inset; startCorners: Corners } | null>(null)

  // ─── CLOSE HANDLING: BACKDROP TAP, ESC, X, DEVICE BACK GESTURE ────────
  const pushedRef = useRef(false)

  useEffect(() => {
    window.history.pushState({ abhCrop: true }, "")
    pushedRef.current = true
    function onPopState() { pushedRef.current = false; onClose() }
    window.addEventListener("popstate", onPopState)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("popstate", onPopState)
      document.body.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestClose = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") requestClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [requestClose])

  // ─── MEASURE ACTUAL IMAGE BOUNDS WITHIN THE FRAME ──────────────────────
  const recomputeImageRect = useCallback(() => {
    const frame = frameRef.current
    if (!frame || !naturalSize) return
    const frameW = frame.clientWidth, frameH = frame.clientHeight
    const frameRatio = frameW / frameH
    const imgRatio = naturalSize.w / naturalSize.h
    if (imgRatio > frameRatio) {
      const renderH = frameW / imgRatio
      setImageRect({ top: ((frameH - renderH) / 2 / frameH) * 100, left: 0, width: 100, height: (renderH / frameH) * 100 })
    } else {
      const renderW = frameH * imgRatio
      setImageRect({ top: 0, left: ((frameW - renderW) / 2 / frameW) * 100, width: (renderW / frameW) * 100, height: 100 })
    }
  }, [naturalSize])

  useEffect(() => {
    recomputeImageRect()
    window.addEventListener("resize", recomputeImageRect)
    return () => window.removeEventListener("resize", recomputeImageRect)
  }, [recomputeImageRect])

  const toFrame = useCallback((xPct: number, axis: "x" | "y") => {
    return axis === "x" ? imageRect.left + (xPct / 100) * imageRect.width : imageRect.top + (xPct / 100) * imageRect.height
  }, [imageRect])

  // ─── MAGNIFIER ──────────────────────────────────────────────────────────
  // While dragging any handle, shows a zoomed, crosshair-marked circular
  // preview of exactly where the crop edge is, so the actual crop point
  // is never hidden under a finger — most useful on the free-shape mode
  // where precision on a photographed document matters most.
  const drawMagnifier = useCallback((fracX: number, fracY: number) => {
    const canvas = magnifierCanvasRef.current
    const imgEl = imgElRef.current
    if (!canvas || !imgEl || !naturalSize) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const windowSize = clamp(Math.min(naturalSize.w, naturalSize.h) * 0.18, 40, 900)
    const sx = fracX * naturalSize.w
    const sy = fracY * naturalSize.h
    ctx.clearRect(0, 0, MAG_SIZE, MAG_SIZE)
    ctx.save()
    ctx.beginPath()
    ctx.arc(MAG_SIZE / 2, MAG_SIZE / 2, MAG_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(imgEl, sx - windowSize / 2, sy - windowSize / 2, windowSize, windowSize, 0, 0, MAG_SIZE, MAG_SIZE)
    ctx.restore()
    ctx.strokeStyle = "rgba(255,255,255,0.9)"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(MAG_SIZE / 2 - 10, MAG_SIZE / 2); ctx.lineTo(MAG_SIZE / 2 + 10, MAG_SIZE / 2)
    ctx.moveTo(MAG_SIZE / 2, MAG_SIZE / 2 - 10); ctx.lineTo(MAG_SIZE / 2, MAG_SIZE / 2 + 10)
    ctx.stroke()
  }, [naturalSize])

  const showMagnifierAt = useCallback((fracX: number, fracY: number) => {
    setMagnifierPos({ x: toFrame(fracX * 100, "x"), y: toFrame(fracY * 100, "y") })
    drawMagnifier(fracX, fracY)
  }, [toFrame, drawMagnifier])

// ─── RECT MODE DRAG ─────────────────────────────────────────────────────
  const onDragRect = useCallback((e: PointerEvent) => {
    const drag = dragRef.current
    const frame = frameRef.current
    if (!drag || drag.kind !== "inset" || !frame) return
    const rect = frame.getBoundingClientRect()
    const imgPxW = (imageRect.width / 100) * rect.width
    const imgPxH = (imageRect.height / 100) * rect.height
    const dx = ((e.clientX - drag.startX) / imgPxW) * 100
    const dy = ((e.clientY - drag.startY) / imgPxH) * 100
    let next = { ...drag.startInset }

    if (drag.handle === "move") {
      next.top = clamp(drag.startInset.top + dy, 0, 100 - drag.startInset.bottom - 5)
      next.left = clamp(drag.startInset.left + dx, 0, 100 - drag.startInset.right - 5)
      next.bottom = clamp(drag.startInset.bottom - dy, 0, 100 - next.top - 5)
      next.right = clamp(drag.startInset.right - dx, 0, 100 - next.left - 5)
    } else {
      if (drag.handle.includes("n")) next.top = clamp(drag.startInset.top + dy, 0, 100 - drag.startInset.bottom - 10)
      if (drag.handle.includes("s")) next.bottom = clamp(drag.startInset.bottom - dy, 0, 100 - drag.startInset.top - 10)
      if (drag.handle.includes("w")) next.left = clamp(drag.startInset.left + dx, 0, 100 - drag.startInset.right - 10)
      if (drag.handle.includes("e")) next.right = clamp(drag.startInset.right - dx, 0, 100 - drag.startInset.left - 10)

      if (aspect && naturalSize) {
        const fracRatio = aspect * (naturalSize.h / naturalSize.w)
        if (drag.handle.includes("n") || drag.handle.includes("s")) {
          const fracH = (100 - next.top - next.bottom) / 100
          const targetFracW = fracH * fracRatio
          next.right = clamp(100 - next.left - targetFracW * 100, 0, 100 - next.left - 5)
        } else {
          const fracW = (100 - next.left - next.right) / 100
          const targetFracH = fracW / fracRatio
          if (drag.handle.includes("n")) next.top = clamp(100 - next.bottom - targetFracH * 100, 0, 100 - next.bottom - 5)
          else next.bottom = clamp((1 - targetFracH) * 100, 0, 100 - next.top - 5)
        }
      }
    }
    setInset(next)

    const cornerFrac =
      drag.handle === "nw" ? { x: next.left / 100, y: next.top / 100 } :
      drag.handle === "ne" ? { x: 1 - next.right / 100, y: next.top / 100 } :
      drag.handle === "sw" ? { x: next.left / 100, y: 1 - next.bottom / 100 } :
      drag.handle === "se" ? { x: 1 - next.right / 100, y: 1 - next.bottom / 100 } :
      { x: next.left / 100 + (100 - next.right - next.left) / 200, y: next.top / 100 + (100 - next.bottom - next.top) / 200 }
    showMagnifierAt(cornerFrac.x, cornerFrac.y)
  }, [imageRect, aspect, naturalSize, showMagnifierAt])

  const endDragRect = useCallback(() => {
    dragRef.current = null
    setMagnifierActive(false)
    window.removeEventListener("pointermove", onDragRect)
    window.removeEventListener("pointerup", endDragRect)
  }, [onDragRect])

  const startDragRect = (handle: string) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMagnifierActive(true)
    dragRef.current = { kind: "inset", handle, startX: e.clientX, startY: e.clientY, startInset: inset, startCorners: corners }
    window.addEventListener("pointermove", onDragRect)
    window.addEventListener("pointerup", endDragRect)
  }

  // ─── QUAD MODE DRAG ─────────────────────────────────────────────────────
  const onDragQuad = useCallback((e: PointerEvent) => {
    const drag = dragRef.current
    const frame = frameRef.current
    if (!drag || drag.kind !== "corner" || !frame) return
    const rect = frame.getBoundingClientRect()
    const imgPxW = (imageRect.width / 100) * rect.width
    const imgPxH = (imageRect.height / 100) * rect.height
    const idx = Number(drag.handle)
    const dx = (e.clientX - drag.startX) / imgPxW
    const dy = (e.clientY - drag.startY) / imgPxH
    const start = drag.startCorners[idx]
    const next = [...drag.startCorners] as Corners
    next[idx] = { x: clamp(start.x + dx, 0, 1), y: clamp(start.y + dy, 0, 1) }
    setCorners(next)
    showMagnifierAt(next[idx].x, next[idx].y)
  }, [imageRect, showMagnifierAt])

  const endDragQuad = useCallback(() => {
    dragRef.current = null
    setMagnifierActive(false)
    window.removeEventListener("pointermove", onDragQuad)
    window.removeEventListener("pointerup", endDragQuad)
  }, [onDragQuad])

  const startDragQuad = (idx: number) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMagnifierActive(true)
    dragRef.current = { kind: "corner", handle: String(idx), startX: e.clientX, startY: e.clientY, startInset: inset, startCorners: corners }
    window.addEventListener("pointermove", onDragQuad)
    window.addEventListener("pointerup", endDragQuad)
  }

  // ─── KEYBOARD NUDGE (accessibility) ─────────────────────────────────────
  const NUDGE = 1.5
  const onRectKeyDown = (handle: string) => (e: React.KeyboardEvent) => {
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [0, -NUDGE], ArrowDown: [0, NUDGE], ArrowLeft: [-NUDGE, 0], ArrowRight: [NUDGE, 0],
    }
    const delta = deltas[e.key]
    if (!delta) return
    e.preventDefault()
    dragRef.current = { kind: "inset", handle, startX: 0, startY: 0, startInset: inset, startCorners: corners }
    onDragRect({ clientX: delta[0] * ((frameRef.current?.clientWidth || 1) * imageRect.width / 100 / 100), clientY: delta[1] * ((frameRef.current?.clientHeight || 1) * imageRect.height / 100 / 100) } as PointerEvent)
    dragRef.current = null
  }
  const onQuadKeyDown = (idx: number) => (e: React.KeyboardEvent) => {
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [0, -0.01], ArrowDown: [0, 0.01], ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0],
    }
    const delta = deltas[e.key]
    if (!delta) return
    e.preventDefault()
    const next = [...corners] as Corners
    next[idx] = { x: clamp(corners[idx].x + delta[0], 0, 1), y: clamp(corners[idx].y + delta[1], 0, 1) }
    setCorners(next)
  }

  // ─── ASPECT PRESETS (rect mode only) ────────────────────────────────────
  const applyAspect = (ratio: number | null) => {
    setAspect(ratio)
    if (ratio === null || !naturalSize) return
    const fracRatio = ratio * (naturalSize.h / naturalSize.w)
    let fracW = 0.86, fracH = fracW / fracRatio
    if (fracH > 0.86) { fracH = 0.86; fracW = fracH * fracRatio }
    const left = ((1 - fracW) / 2) * 100
    const top = ((1 - fracH) / 2) * 100
    setInset({ top, left, right: left, bottom: top })
  }

  // ─── MODE SWITCH ────────────────────────────────────────────────────────
  const switchMode = (next: Mode) => {
    if (next === "quad" && mode === "rect") setCorners(insetToCorners(inset))
    if (next === "rect" && mode === "quad") {
      const xs = corners.map((c) => c.x), ys = corners.map((c) => c.y)
      const left = Math.min(...xs) * 100, right = 100 - Math.max(...xs) * 100
      const top = Math.min(...ys) * 100, bottom = 100 - Math.max(...ys) * 100
      setInset({ top, left, right, bottom })
      setAspect(null)
    }
    setMode(next)
  }

  const handleReset = () => {
    setInset(DEFAULT_INSET)
    setCorners(insetToCorners(DEFAULT_INSET))
    setAspect(null)
  }

  const isRectIdentity = inset.top < 0.5 && inset.left < 0.5 && inset.right < 0.5 && inset.bottom < 0.5

  const handleApply = () => {
    if (mode === "quad") {
      const xs = corners.map((c) => c.x), ys = corners.map((c) => c.y)
      const x = Math.min(...xs), y = Math.min(...ys)
      const w = Math.max(...xs) - x, h = Math.max(...ys) - y
      onApply({ x, y, w: Math.max(w, 0.02), h: Math.max(h, 0.02), corners })
      return
    }
    if (isRectIdentity) { onApply(undefined); return }
    const x = inset.left / 100, y = inset.top / 100
    const w = (100 - inset.left - inset.right) / 100
    const h = (100 - inset.top - inset.bottom) / 100
    onApply({ x, y, w, h })
  }

  const cropDimsLabel = useMemo(() => {
    if (!naturalSize) return ""
    if (mode === "quad") {
      const xs = corners.map((c) => c.x), ys = corners.map((c) => c.y)
      const w = Math.round((Math.max(...xs) - Math.min(...xs)) * naturalSize.w)
      const h = Math.round((Math.max(...ys) - Math.min(...ys)) * naturalSize.h)
      return `${w} × ${h}px (perspective-corrected)`
    }
    const w = Math.round(((100 - inset.left - inset.right) / 100) * naturalSize.w)
    const h = Math.round(((100 - inset.top - inset.bottom) / 100) * naturalSize.h)
    return `${w} × ${h}px`
  }, [mode, inset, corners, naturalSize])

  return (
    <div role="dialog" aria-modal="true" aria-label={`Crop ${fileName}`} className="fixed inset-0 z-[200] flex flex-col bg-black/95">
      <div className="absolute inset-0" onClick={requestClose} aria-hidden="true" />

      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-4 py-3 text-white shrink-0">
        <span className="text-sm font-semibold truncate">{fileName}</span>
        <button type="button" onClick={requestClose} aria-label="Cancel crop" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10">
          <X size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>

      {/* ─── MODE TOGGLE ────────────────────────────────────────────────── */}
      {/* Both states now full-opacity text with a visible pill so neither
          reads as disabled/dim — inactive tab gets a translucent
          background instead of floating unstyled text. */}
      <div role="tablist" aria-label="Crop shape" className="relative flex justify-center gap-1.5 px-4 pb-2 shrink-0">
        <button
          type="button" role="tab" aria-selected={mode === "rect"}
          onClick={() => switchMode("rect")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border ${mode === "rect" ? "bg-white text-zinc-900 border-white" : "bg-white/10 border-white/25 text-white hover:bg-white/20"}`}
        >
          <Rectangle size={14} weight="bold" aria-hidden="true" />
          Rectangle
        </button>
        <button
          type="button" role="tab" aria-selected={mode === "quad"}
          onClick={() => switchMode("quad")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border ${mode === "quad" ? "bg-white text-zinc-900 border-white" : "bg-white/10 border-white/25 text-white hover:bg-white/20"}`}
        >
          <Shapes size={14} weight="bold" aria-hidden="true" />
          Free shape
        </button>
      </div>

      {/* ─── ASPECT PRESETS (rect mode only) ───────────────────────────── */}
      {/* Colors set via inline style using the real BRAND.orange hex,
          not a bg-brand-orange Tailwind class — that class only renders
          if "brand-orange" is registered as a theme color, and if it
          isn't, the class silently does nothing, which is what made
          these look dim/dead before. This can't silently fail. */}
      {mode === "rect" && (
        <div role="group" aria-label="Aspect ratio" className="relative flex flex-wrap justify-center gap-1.5 px-4 pb-2 shrink-0">
          {CROP_ASPECT_PRESETS.map((preset) => {
            const selected = aspect === preset.ratio
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={selected}
                onClick={() => applyAspect(preset.ratio)}
                className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-colors border"
                style={{
                  backgroundColor: selected ? BRAND.orange : "rgba(255,255,255,0.14)",
                  borderColor: selected ? BRAND.orange : "rgba(255,255,255,0.32)",
                }}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ─── CROP FRAME ─────────────────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center justify-center p-4 min-h-0">
        <div
          ref={frameRef}
          className="relative"
          style={{ width: "min(90vw, 600px)", height: "min(60vh, 600px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            ref={imgElRef}
            src={imageUrl}
            alt={fileName}
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
            onLoad={(e) => setNaturalSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          />

          {mode === "rect" ? (
            <>
              <div
                className="absolute pointer-events-none"
                style={{
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
                  top: `${toFrame(inset.top, "y")}%`, left: `${toFrame(inset.left, "x")}%`,
                  right: `${100 - toFrame(100 - inset.right, "x")}%`, bottom: `${100 - toFrame(100 - inset.bottom, "y")}%`,
                }}
              />
              <div
                onPointerDown={startDragRect("move")}
                className="absolute border-2 border-white cursor-move touch-none"
                style={{
                  top: `${toFrame(inset.top, "y")}%`, left: `${toFrame(inset.left, "x")}%`,
                  right: `${100 - toFrame(100 - inset.right, "x")}%`, bottom: `${100 - toFrame(100 - inset.bottom, "y")}%`,
                }}
              >
                {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                  <div
                    key={corner}
                    onPointerDown={startDragRect(corner)}
                    onKeyDown={onRectKeyDown(corner)}
                    role="slider"
                    aria-label={`Resize crop from ${corner === "nw" ? "top left" : corner === "ne" ? "top right" : corner === "sw" ? "bottom left" : "bottom right"} corner`}
                    aria-valuetext={cropDimsLabel}
                    tabIndex={0}
                    className={`absolute w-5 h-5 rounded-full bg-white shadow touch-none focus:ring-2 focus:outline-none ${
                      corner === "nw" ? "-top-2.5 -left-2.5 cursor-nwse-resize" :
                      corner === "ne" ? "-top-2.5 -right-2.5 cursor-nesw-resize" :
                      corner === "sw" ? "-bottom-2.5 -left-2.5 cursor-nesw-resize" :
                      "-bottom-2.5 -right-2.5 cursor-nwse-resize"
                    }`}
                    style={{ outlineColor: BRAND.orange }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Dims everything outside the quad, matching rect mode's
                  box-shadow treatment — this was previously missing
                  entirely for free-shape crops, which is why it looked
                  bright/undimmed next to rectangle mode. */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <path
                  d={`M0,0 H100 V100 H0 Z M ${corners.map((c) => `${toFrame(c.x * 100, "x")},${toFrame(c.y * 100, "y")}`).join(" L ")} Z`}
                  fill="rgba(0,0,0,0.6)"
                  fillRule="evenodd"
                />
                <polygon
                  points={corners.map((c) => `${toFrame(c.x * 100, "x")},${toFrame(c.y * 100, "y")}`).join(" ")}
                  fill="rgba(255,255,255,0.06)"
                  stroke="white"
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {corners.map((c, idx) => (
                <div
                  key={idx}
                  onPointerDown={startDragQuad(idx)}
                  onKeyDown={onQuadKeyDown(idx)}
                  role="slider"
                  aria-label={`Move corner ${idx + 1} of 4`}
                  aria-valuetext={cropDimsLabel}
                  tabIndex={0}
                  className="absolute w-5 h-5 -mt-2.5 -ml-2.5 rounded-full border-2 border-white shadow touch-none cursor-move focus:ring-2 focus:outline-none"
                  style={{ top: `${toFrame(c.y * 100, "y")}%`, left: `${toFrame(c.x * 100, "x")}%`, backgroundColor: BRAND.orange }}
                />
              ))}
            </>
          )}

          {/* ─── MAGNIFIER ──────────────────────────────────────────────── */}
          {magnifierActive && magnifierPos && (
            <div
              aria-hidden="true"
              className="absolute rounded-full border-2 border-white shadow-xl overflow-hidden pointer-events-none z-10"
              style={{
                width: MAG_SIZE, height: MAG_SIZE,
                left: `${magnifierPos.x}%`,
                top: `calc(${magnifierPos.y}% - 150px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <canvas ref={magnifierCanvasRef} width={MAG_SIZE} height={MAG_SIZE} className="w-full h-full" />
            </div>
          )}
        </div>
      </div>

      {/* ─── DIMENSIONS ─────────────────────────────────────────────────── */}
      <p className="relative text-center text-xs text-white/50 shrink-0" aria-live="polite">{cropDimsLabel}</p>
      {mode === "quad" && (
        <p className="relative text-center text-[0.7rem] text-white/40 px-6 pt-1 shrink-0">
          The area inside the shape will be straightened into a rectangle — useful for photos taken at an angle.
        </p>
      )}

      {/* ─── ACTIONS ────────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center gap-3 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0">
        <button type="button" onClick={handleReset} className="flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-semibold text-white/70 hover:text-white transition-colors">
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
