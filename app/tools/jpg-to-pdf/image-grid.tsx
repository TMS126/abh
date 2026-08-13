// app/tools/jpg-to-pdf/image-grid.tsx
"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ArrowsClockwise, ArrowCounterClockwise, Crop, X, WarningCircle } from "@phosphor-icons/react"
import type { ImageItem, ConvertError } from "./types"

export function ImageGrid({
  images, rotations, errors, convertedIds, accentColor,
  onToggleSelect, onRotate, onResetRotation, onRemove, onZoom, onCrop, onReorder,
}: {
  images: ImageItem[]
  rotations: Record<string, number>
  errors: ConvertError[]
  convertedIds: Set<string>
  accentColor: string
  onToggleSelect: (id: string) => void
  onRotate: (id: string) => void
  onResetRotation: (id: string) => void
  onRemove: (id: string) => void
  onZoom: (id: string) => void
  onCrop: (id: string) => void
  onReorder: (from: number, to: number) => void
}) {
  const errorFor = (fileName: string) => errors.find((e) => e.fileName === fileName)

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <AnimatePresence initial={false}>
        {images.map((img, index) => {
          const err = errorFor(img.file.name)
          const wasConverted = convertedIds.has(img.id)
          const rotation = rotations[img.id] || 0
          return (
            <motion.li
              key={img.id}
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
              <button type="button" onClick={() => onZoom(img.id)} aria-label={`View ${img.file.name} full size`} className="relative block w-full aspect-square">
                <Image
                  src={img.previewUrl}
                  alt={img.file.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  unoptimized
                />
                {img.crop && (
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[0.62rem] font-black uppercase tracking-widest text-white bg-black/50 px-2 py-0.5 rounded-full">
                    Cropped
                  </span>
                )}
              </button>

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

              <button
                type="button"
                onClick={() => onRemove(img.id)}
                aria-label={`Remove ${img.file.name}`}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
              >
                <X size={14} weight="bold" aria-hidden="true" />
              </button>

              {err && (
                <div className="absolute inset-0 bg-red-600/60 flex items-center justify-center" role="alert">
                  <WarningCircle weight="fill" className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
              )}

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-7 pb-1.5">
                <p className="text-[0.68rem] font-semibold text-white truncate mb-1">{img.file.name}</p>
                <div className="flex items-center justify-between">
                  {wasConverted ? <span className="text-[0.62rem] font-bold uppercase tracking-wide text-white/70">Converted</span> : <span />}
                  <div className="flex items-center gap-0.5">
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
        })}
      </AnimatePresence>
    </ul>
  )
}
