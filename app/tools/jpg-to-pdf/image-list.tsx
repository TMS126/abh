// app/tools/jpg-to-pdf/image-list.tsx
"use client"

import Image from "next/image"
import { useState } from "react"
import { ArrowUp, ArrowDown, ArrowsClockwise, X, CheckCircle, WarningCircle } from "@phosphor-icons/react"
import type { ImageItem, ConvertMode, ConvertError } from "./types"

export function ImageList({
  images, mode, rotations, errors, convertedIds, accentColor,
  onToggleSelect, onRotate, onMove, onRemove, onReorder,
}: {
  images: ImageItem[]
  mode: ConvertMode
  rotations: Record<string, number>
  errors: ConvertError[]
  convertedIds: Set<string>
  accentColor: string
  onToggleSelect: (id: string) => void
  onRotate: (id: string) => void
  onMove: (index: number, dir: -1 | 1) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
}) {
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const errorFor = (fileName: string) => errors.find((e) => e.fileName === fileName)

  return (
    <ul className="flex flex-col gap-2.5">
      {images.map((img, index) => {
        const err = errorFor(img.file.name)
        const wasConverted = convertedIds.has(img.id)
        return (
          <li
            key={img.id}
            draggable={mode === "merge"}
            onDragStart={() => setDragFrom(index)}
            onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index) }}
            onDrop={() => { if (dragFrom !== null) onReorder(dragFrom, index); setDragFrom(null); setDragOverIndex(null) }}
            onDragEnd={() => { setDragFrom(null); setDragOverIndex(null) }}
            className={`flex items-center gap-3 rounded-[14px] border p-2.5 transition-all ${
              dragOverIndex === index ? "border-brand-blue bg-brand-blue/5" : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40"
            } ${mode === "merge" ? "cursor-grab active:cursor-grabbing" : ""} ${!img.selected ? "opacity-50" : ""}`}
          >
            <button
              type="button"
              onClick={() => onToggleSelect(img.id)}
              aria-pressed={img.selected}
              aria-label={img.selected ? `Deselect ${img.file.name}` : `Select ${img.file.name}`}
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors"
              style={img.selected ? { backgroundColor: accentColor, borderColor: accentColor } : { borderColor: "#d4d4d8" }}
            >
              {img.selected && <CheckCircle weight="fill" className="w-full h-full text-white" aria-hidden="true" />}
            </button>

            <div
              className="relative w-12 h-12 rounded-[10px] overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800"
              style={{ transform: `rotate(${rotations[img.id] || 0}deg)` }}
            >
              <Image src={img.previewUrl} alt="" fill className="object-cover" unoptimized />
              {err && (
                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center" title={err.reason}>
                  <WarningCircle weight="fill" className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="block truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">{img.file.name}</span>
              {wasConverted && <span className="text-[0.68rem] font-bold uppercase tracking-wide text-zinc-400">Already converted</span>}
            </div>

            <button type="button" onClick={() => onRotate(img.id)} aria-label="Rotate image" className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-brand-blue transition-colors shrink-0">
              <ArrowsClockwise weight="bold" className="w-4 h-4" />
            </button>

            {mode === "merge" && (
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move up" className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-brand-blue disabled:opacity-30 transition-colors">
                  <ArrowUp weight="bold" className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => onMove(index, 1)} disabled={index === images.length - 1} aria-label="Move down" className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-brand-blue disabled:opacity-30 transition-colors">
                  <ArrowDown weight="bold" className="w-4 h-4" />
                </button>
              </div>
            )}

            <button type="button" onClick={() => onRemove(img.id)} aria-label="Remove image" className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0">
              <X weight="bold" className="w-4 h-4" />
            </button>
          </li>
        )
      })}
    </ul>
  )
} 
