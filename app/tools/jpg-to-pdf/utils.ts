// app/tools/jpg-to-pdf/utils.ts
import { HISTORY_KEY, EXT_TYPE_FALLBACK, MAX_CANVAS_DIMENSION } from "./constants"
import type { HistoryEntry, CropRect } from "./types"

const pad2 = (n: number) => String(n).padStart(2, "0")

function stamp(date = new Date()) {
  return {
    date: `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${String(date.getFullYear()).slice(2)}`,
    time: `${pad2(date.getHours())}${pad2(date.getMinutes())}`,
  }
}

function slugify(name: string) {
  const base = name.replace(/\.[^/.]+$/, "")
  const clean = base.toLowerCase().replace(/[^a-z0-9]+/g, "")
  return clean.slice(0, 10) || "img"
}

export function buildFileName(sourceLabel: string, usedNames: Set<string>) {
  const { date, time } = stamp()
  const slug = slugify(sourceLabel)
  let name = `abh_pdf-${slug}-${date}${time}.pdf`
  let n = 2
  while (usedNames.has(name)) {
    name = `abh_pdf-${slug}-${date}${time}-${n}.pdf`
    n++
  }
  usedNames.add(name)
  return name
}

// Falls back to the file extension when the browser reports an empty or
// nonstandard MIME type — common with some Android camera captures.
export function resolveFileType(file: File, acceptedTypes: string[]): string | null {
  if (acceptedTypes.includes(file.type)) return file.type
  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  const fallback = EXT_TYPE_FALLBACK[ext]
  return fallback && acceptedTypes.includes(fallback) ? fallback : null
}

export function qualityLabel(q: number) {
  if (q >= 0.85) return "High quality"
  if (q >= 0.6) return "Balanced"
  return "Smaller file"
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatLocalDateTime(isoDate: string) {
  const d = new Date(isoDate)
  const datePart = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" })
  const timePart = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  return `${datePart} · ⌚ ${timePart}`
}

export const loadHistory = (): HistoryEntry[] => {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const saveHistory = (entries: HistoryEntry[]) => {
  try { window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 8))) } catch {}
}

export const clearHistory = () => {
  try { window.localStorage.removeItem(HISTORY_KEY) } catch {}
}

// ─── IMAGE PROCESSING ────────────────────────────────────────────────────
// Two decode paths:
//
// 1. compressViaBitmap — preferred. createImageBitmap() decodes off the
//    main thread with a much smaller memory footprint than an <img> tag,
//    which is what actually fixes "Could not read this image" on large
//    phone photos (the failure is a real decode-under-memory-pressure
//    issue, not a logic bug — it gets worse the more images/conversions
//    have already run in the session).
//
// 2. compressViaImageElement — fallback for browsers without
//    createImageBitmap, or if the bitmap path itself throws. Includes one
//    automatic retry on decode failure, since these failures are often
//    transient and clear a moment later once the browser reclaims memory,
//    rather than surfacing an error to the user on the first hiccup.
//
// Both paths cap output at MAX_CANVAS_DIMENSION and ignore degenerate
// crop rects (avoids a zero-size canvas).

function resolveCropAndSize(sourceW: number, sourceH: number, rotation: number, crop?: CropRect) {
  const validCrop = crop && crop.w > 0.02 && crop.h > 0.02 ? crop : { x: 0, y: 0, w: 1, h: 1 }
  const sx = validCrop.x * sourceW
  const sy = validCrop.y * sourceH
  const sw = Math.max(1, validCrop.w * sourceW)
  const sh = Math.max(1, validCrop.h * sourceH)
  const swap = rotation === 90 || rotation === 270
  const rawW = swap ? sh : sw
  const rawH = swap ? sw : sh
  const scale = Math.min(1, MAX_CANVAS_DIMENSION / Math.max(rawW, rawH))
  const width = Math.max(1, Math.round(rawW * scale))
  const height = Math.max(1, Math.round(rawH * scale))
  return { sx, sy, sw, sh, scale, width, height }
}

function drawToDataUrl(
  source: CanvasImageSource,
  sx: number, sy: number, sw: number, sh: number,
  width: number, height: number, scale: number, rotation: number, quality: number
) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported on this device.")
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(scale, scale)
  ctx.drawImage(source, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh)
  return canvas.toDataURL("image/jpeg", quality)
}

async function compressViaBitmap(
  file: File, rotation: number, quality: number, crop?: CropRect
): Promise<{ dataUrl: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  try {
    const { sx, sy, sw, sh, scale, width, height } = resolveCropAndSize(bitmap.width, bitmap.height, rotation, crop)
    const dataUrl = drawToDataUrl(bitmap, sx, sy, sw, sh, width, height, scale, rotation, quality)
    return { dataUrl, width, height }
  } finally {
    bitmap.close()
  }
}

function compressViaImageElement(
  file: File, rotation: number, quality: number, crop: CropRect | undefined, attempt = 1
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      try {
        const { sx, sy, sw, sh, scale, width, height } = resolveCropAndSize(img.naturalWidth, img.naturalHeight, rotation, crop)
        const dataUrl = drawToDataUrl(img, sx, sy, sw, sh, width, height, scale, rotation, quality)
        URL.revokeObjectURL(objectUrl)
        resolve({ dataUrl, width, height })
      } catch (err) {
        URL.revokeObjectURL(objectUrl)
        reject(err instanceof Error ? err : new Error("Failed to process this image on this device."))
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // Transient decode failures under memory pressure are common with
      // large photos — retry once before giving up.
      if (attempt < 2) {
        setTimeout(() => {
          compressViaImageElement(file, rotation, quality, crop, attempt + 1).then(resolve, reject)
        }, 250)
        return
      }
      reject(new Error("Could not read this image — try removing and re-adding it."))
    }
    img.src = objectUrl
  })
}

export const compressImage = async (
  file: File,
  rotation: number,
  quality: number,
  crop?: CropRect
): Promise<{ dataUrl: string; width: number; height: number }> => {
  if (typeof createImageBitmap === "function") {
    try {
      return await compressViaBitmap(file, rotation, quality, crop)
    } catch {
      // fall through to the <img>-based path below
    }
  }
  return compressViaImageElement(file, rotation, quality, crop)
}

export const fitToPage = (width: number, height: number, page: { w: number; h: number }) => {
  const margin = 10
  const maxW = page.w - margin * 2
  const maxH = page.h - margin * 2
  const ratio = Math.min(maxW / width, maxH / height)
  const renderW = width * ratio
  const renderH = height * ratio
  return { x: (page.w - renderW) / 2, y: (page.h - renderH) / 2, renderW, renderH }
}
