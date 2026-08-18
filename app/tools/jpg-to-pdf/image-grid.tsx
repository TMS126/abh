// app/tools/jpg-to-pdf/image-grid.tsx
"use client"

import { memo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ArrowsClockwise, ArrowCounterClockwise, Crop, X, WarningCircle, CircleNotch, Palette } from "@phosphor-icons/react"
import { formatBytes } from "./utils"
import { FILTER_CYCLE, FILTER_LABELS } from "./constants"
import type { ImageItem, ConvertError, ImageFilter } from "./types"

function nextFilterIn(current: ImageFilter): ImageFilter {
  const idx = FILTER_CYCLE.indexOf(current)
  return FILTER_CYCLE[(idx + 1) % FILTER_CYCLE.length]
}

function GridItem({
  img, index, rotation, filter, err, isRetrying, wasConverted, accentColor,
  onToggleSelect, onRotate, onResetRotation, onRemove, onZoom, onCrop, onRetry, onReorder, onSetFilter,
}: {
  img: ImageItem
  index: number
  rotation: number
  filter: ImageFilter
  err: ConvertError | undefined
  isRetrying: boolean
  wasConverted: boolean
  accentColor: string
  onToggleSelect: (id: string) => void
  onRotate: (id: string) => void
  onResetRotation: (id: string) => void
  onRemove: (id: string) => void
  onZoom: (id: string) => void
  onCrop: (id: string) => void
  onRetry: (id: string) => void
  onReorder: (from: number, to: number) => void
  onSetFilter: (id: string, filter: ImageFilter) => void
}) {
  // A cropped image already has its rotation baked into the thumbnail
  // pixels (see rotateImage in use-jpg-to-pdf.ts) — applying the CSS
  // transform on top of that would double-rotate it. Uncropped images
  // still rotate live via CSS since nothing's baked in yet.
  const cssRotation = img.crop ? 0 : rotation
  const upcoming = nextFilterIn(filter)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.18 }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onReorder(Number(e.dataTransfer.getData("text/plain")), index)}
      className={`relative rounded-[14px] overflow-hidden border bg-zinc-100 dark:bg-zinc-900 ${!img.selected ? "opacity-45" : ""} ${err ? "border-red-300 dark:border-red-800" : "border-zinc-200 dark:border-zinc-800"}`}
    >
      {/* ─── IMAGE / ZOOM TRIGGER ────────────────────────────────────── */}
      <button type="button" onClick={() => onZoom(img.id)} aria-label={`View ${img.file.name} full size`} className="relative block w-full aspect-square">
        <Image
          src={img.previewUrl}
          alt={img.file.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
          style={{ transform: `rotate(${cssRotation}deg)` }}
          unoptimized
        />
        {img.crop && (
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[0.62rem] font-black uppercase tracking-widest text-white bg-black/50 px-2 py-0.5 rounded-full">
            {img.crop.corners ? "Shaped" : "Cropped"}
          </span>
        )}
      </button>

      {/* ─── SELECT TOGGLE ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onToggleSelect(img.id)}
        aria-pressed={img.selected}
        aria-label={img.selected ? `Deselect ${img.file.name}` : `Select ${img.file.name}`}
        className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-black/30"
        style={img.selected ? { backgroundColor: accentColor, borderColor: accentColor } : { borderColor: "#ffffff" }}
      >
        {img.selected && <CheckCircle weight="fill" className="w-full h-full text-white" aria-hidden="true" />}
      </button>

      {/* ─── REMOVE ──────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onRemove(img.id)}
        aria-label={`Remove ${img.file.name}`}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
      >
        <X size={14} weight="bold" aria-hidden="true" />
      </button>

      {/* ─── ERROR OVERLAY ───────────────────────────────────────────── */}
      {/* Refresh now actually re-attempts decoding this file (see
          retryImage in the hook) rather than just hiding the error text —
          shows a spinner while that check runs, and only clears once a
          real decode succeeds. */}
      {err && (
        <div
          className="absolute inset-0 bg-red-600/70 flex flex-col items-center justify-center gap-2 px-3 text-center pointer-events-none"
          role="alert"
        >
          <WarningCircle weight="fill" className="w-6 h-6 text-white shrink-0" aria-hidden="true" />
          <p className="text-[0.68rem] font-semibold text-white leading-tight">{err.reason}</p>
          <button
            type="button"
            onClick={() => onRetry(img.id)}
            disabled={isRetrying}
            aria-label={`Retry ${img.file.name}`}
            aria-busy={isRetrying}
            className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/25 hover:bg-white/40 disabled:opacity-70 text-white text-[0.62rem] font-bold px-3 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isRetrying ? (
              <CircleNotch size={12} weight="bold" className="animate-spin" aria-hidden="true" />
            ) : (
              <ArrowsClockwise size={12} weight="bold" aria-hidden="true" />
            )}
            {isRetrying ? "Checking…" : "Refresh"}
          </button>
        </div>
      )}

      {/* ─── BOTTOM OVERLAY: NAME, SIZE, ACTIONS ─────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-7 pb-1.5">
        <p className="text-[0.68rem] font-semibold text-white truncate mb-1">{img.file.name}</p>
        <p className="text-[0.6rem] text-white/60 mb-1">
          {formatBytes(img.file.size)}
          {filter !== "none" && <span className="text-white/85"> · {FILTER_LABELS[filter]}</span>}
        </p>
        <div className="flex items-center justify-between">
          {wasConverted ? <span className="text-[0.62rem] font-bold uppercase tracking-wide text-white/70">Converted</span> : <span />}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onSetFilter(img.id, upcoming)}
              aria-label={`Filter for ${img.file.name}: ${FILTER_LABELS[filter]}. Tap for ${FILTER_LABELS[upcoming]}.`}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Palette size={14} weight={filter !== "none" ? "fill" : "bold"} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onCrop(img.id)} aria-label={`Crop ${img.file.name}`} className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <Crop size={14} weight="bold" aria-hidden="true" />
            </button>
            {rotation !== 0 && (
              <button type="button" onClick={() => onResetRotation(img.id)} aria-label={`Reset rotation for ${img.file.name}`} className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={() => onRotate(img.id)} aria-label={`Rotate ${img.file.name} 90 degrees`} className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <ArrowsClockwise size={14} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  )
}

const MemoGridItem = memo(GridItem)

export function ImageGrid({
  images, rotations, filters, errors, retryingIds, convertedIds, accentColor,
  onToggleSelect, onRotate, onResetRotation, onRemove, onZoom, onCrop, onRetry, onReorder, onSetFilter,
}: {
  images: ImageItem[]
  rotations: Record<string, number>
  filters: Record<string, ImageFilter>
  errors: ConvertError[]
  retryingIds: Set<string>
  convertedIds: Set<string>
  accentColor: string
  onToggleSelect: (id: string) => void
  onRotate: (id: string) => void
  onResetRotation: (id: string) => void
  onRemove: (id: string) => void
  onZoom: (id: string) => void
  onCrop: (id: string) => void
  onRetry: (id: string) => void
  onReorder: (from: number, to: number) => void
  onSetFilter: (id: string, filter: ImageFilter) => void
}) {
  const errorFor = (img: ImageItem) =>
    errors.find((e) => (e.id ? e.id === img.id : e.fileName === img.file.name))

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <AnimatePresence initial={false}>
        {images.map((img, index) => (
          <MemoGridItem
            key={img.id}
            img={img}
            index={index}
            rotation={rotations[img.id] || 0}
            filter={filters[img.id] || "none"}
            err={errorFor(img)}
            isRetrying={retryingIds.has(img.id)}
            wasConverted={convertedIds.has(img.id)}
            accentColor={accentColor}
            onToggleSelect={onToggleSelect}
            onRotate={onRotate}
            onResetRotation={onResetRotation}
            onRemove={onRemove}
            onZoom={onZoom}
            onCrop={onCrop}
            onRetry={onRetry}
            onReorder={onReorder}
            onSetFilter={onSetFilter}
          />
        ))}
      </AnimatePresence>
    </ul>
  )
  } 
