// app/tools/jpg-to-pdf/utils.ts
import { HISTORY_KEY, EXT_TYPE_FALLBACK, MAX_CANVAS_DIMENSION, PERSPECTIVE_WARP_GRID } from "./constants"
import type { HistoryEntry, CropRect, CropPoint } from "./types"

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

// ─── THUMBNAIL GENERATION ────────────────────────────────────────────────
// Grid thumbnails use a small (≤480px) downscaled JPEG instead of the raw
// original file, so the browser isn't holding a full-resolution decode in
// memory per image for the whole session just to render a grid tile.
export async function generateThumbnail(file: File, maxDim = 480): Promise<string> {
  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file)
      try {
        const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
        const w = Math.max(1, Math.round(bitmap.width * scale))
        const h = Math.max(1, Math.round(bitmap.height * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas not supported on this device.")
        ctx.drawImage(bitmap, 0, 0, w, h)
        return await new Promise<string>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error("Thumbnail generation failed.")); return }
            resolve(URL.createObjectURL(blob))
          }, "image/jpeg", 0.7)
        })
      } finally {
        bitmap.close()
      }
    }
  } catch {
    // fall through to the raw-file fallback below
  }
  return URL.createObjectURL(file)
}

// ─── PERSPECTIVE WARP (for free four-corner crops) ─────────────────────
// Canvas 2D has no native projective-transform draw call, so a quad crop
// (trapezium, rhombus, any four free corners) is approximated by
// subdividing the output rectangle into a fine grid, bilinearly
// interpolating each grid vertex's matching source point from the four
// corners, and drawing each grid cell as two affine-warped triangles.
// This is the standard technique for perspective correction on canvas
// without WebGL, and is visually indistinguishable from a true projective
// warp at this grid resolution for photographed-document use cases.

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function lerpPoint(a: CropPoint, b: CropPoint, t: number): CropPoint {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
}

// Draws one affine-warped triangle: clips to the destination triangle,
// then applies the unique affine transform that maps the three source
// points onto the three destination points, and draws the full source
// image through that clip/transform (only the clipped triangle survives).
function drawAffineTriangle(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  src: [CropPoint, CropPoint, CropPoint],
  dst: [CropPoint, CropPoint, CropPoint]
) {
  const [s0, s1, s2] = src
  const [d0, d1, d2] = dst

  const denom = (s1.x - s0.x) * (s2.y - s0.y) - (s2.x - s0.x) * (s1.y - s0.y)
  if (Math.abs(denom) < 1e-8) return // degenerate triangle, skip

  const a = ((d1.x - d0.x) * (s2.y - s0.y) - (d2.x - d0.x) * (s1.y - s0.y)) / denom
  const b = ((d1.y - d0.y) * (s2.y - s0.y) - (d2.y - d0.y) * (s1.y - s0.y)) / denom
  const c = ((d2.x - d0.x) * (s1.x - s0.x) - (d1.x - d0.x) * (s2.x - s0.x)) / denom
  const d = ((d2.y - d0.y) * (s1.x - s0.x) - (d1.y - d0.y) * (s2.x - s0.x)) / denom
  const e = d0.x - a * s0.x - c * s0.y
  const f = d0.y - b * s0.x - d * s0.y

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(d0.x, d0.y)
  ctx.lineTo(d1.x, d1.y)
  ctx.lineTo(d2.x, d2.y)
  ctx.closePath()
  ctx.clip()
  ctx.transform(a, b, c, d, e, f)
  ctx.drawImage(source, 0, 0)
  ctx.restore()
}

// corners are in source-image pixel space, order TL, TR, BR, BL.
function warpQuadToCanvas(
  source: CanvasImageSource,
  corners: [CropPoint, CropPoint, CropPoint, CropPoint],
  outW: number,
  outH: number
): HTMLCanvasElement {
  const [tl, tr, br, bl] = corners
  const canvas = document.createElement("canvas")
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported on this device.")

  const grid = PERSPECTIVE_WARP_GRID
  for (let gy = 0; gy < grid; gy++) {
    const t0 = gy / grid, t1 = (gy + 1) / grid
    // Source-space edge points for this row, via bilinear interpolation
    // of the quad's left/right edges.
    const srcLeft0 = lerpPoint(tl, bl, t0), srcRight0 = lerpPoint(tr, br, t0)
    const srcLeft1 = lerpPoint(tl, bl, t1), srcRight1 = lerpPoint(tr, br, t1)

    for (let gx = 0; gx < grid; gx++) {
      const u0 = gx / grid, u1 = (gx + 1) / grid
      const s00 = lerpPoint(srcLeft0, srcRight0, u0)
      const s10 = lerpPoint(srcLeft0, srcRight0, u1)
      const s01 = lerpPoint(srcLeft1, srcRight1, u0)
      const s11 = lerpPoint(srcLeft1, srcRight1, u1)

      const d00: CropPoint = { x: u0 * outW, y: t0 * outH }
      const d10: CropPoint = { x: u1 * outW, y: t0 * outH }
      const d01: CropPoint = { x: u0 * outW, y: t1 * outH }
      const d11: CropPoint = { x: u1 * outW, y: t1 * outH }

      drawAffineTriangle(ctx, source, [s00, s10, s01], [d00, d10, d01])
      drawAffineTriangle(ctx, source, [s10, s11, s01], [d10, d11, d01])
    }
  }
  return canvas
}

// ─── IMAGE PROCESSING ────────────────────────────────────────────────────
// Two decode paths, both used by both crop styles:
//
// 1. compressViaBitmap — preferred. createImageBitmap() decodes off the
//    main thread with a much smaller memory footprint than an <img> tag.
//
// 2. compressViaImageElement — fallback for browsers without
//    createImageBitmap, or if the bitmap path itself throws. Includes one
//    automatic retry on decode failure, since these failures are often
//    transient under memory pressure and can clear a moment later.

function rectRegion(sourceW: number, sourceH: number, rotation: number, crop?: CropRect) {
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

function drawRectToDataUrl(
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

// Renders a quad (perspective) crop: warps the four corners flat, then
// applies rotation as a second pass on the warped result.
function drawQuadToDataUrl(
  source: CanvasImageSource,
  sourceW: number, sourceH: number,
  corners: [CropPoint, CropPoint, CropPoint, CropPoint],
  boundingW: number, boundingH: number,
  rotation: number, quality: number
) {
  const pxCorners = corners.map((c) => ({ x: c.x * sourceW, y: c.y * sourceH })) as [CropPoint, CropPoint, CropPoint, CropPoint]
  const scale = Math.min(1, MAX_CANVAS_DIMENSION / Math.max(boundingW, boundingH))
  const flatW = Math.max(1, Math.round(boundingW * scale))
  const flatH = Math.max(1, Math.round(boundingH * scale))
  const flattened = warpQuadToCanvas(source, pxCorners, flatW, flatH)

  if (rotation === 0) {
    return { dataUrl: flattened.toDataURL("image/jpeg", quality), width: flatW, height: flatH }
  }
  const swap = rotation === 90 || rotation === 270
  const width = swap ? flatH : flatW
  const height = swap ? flatW : flatH
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported on this device.")
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(flattened, -flatW / 2, -flatH / 2)
  return { dataUrl: canvas.toDataURL("image/jpeg", quality), width, height }
}

async function compressViaBitmap(
  file: File, rotation: number, quality: number, crop?: CropRect
): Promise<{ dataUrl: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  try {
    if (crop?.corners) {
      const boundingW = Math.max(1, crop.w * bitmap.width)
      const boundingH = Math.max(1, crop.h * bitmap.height)
      return drawQuadToDataUrl(bitmap, bitmap.width, bitmap.height, crop.corners, boundingW, boundingH, rotation, quality)
    }
    const { sx, sy, sw, sh, scale, width, height } = rectRegion(bitmap.width, bitmap.height, rotation, crop)
    const dataUrl = drawRectToDataUrl(bitmap, sx, sy, sw, sh, width, height, scale, rotation, quality)
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
        let result: { dataUrl: string; width: number; height: number }
        if (crop?.corners) {
          const boundingW = Math.max(1, crop.w * img.naturalWidth)
          const boundingH = Math.max(1, crop.h * img.naturalHeight)
          result = drawQuadToDataUrl(img, img.naturalWidth, img.naturalHeight, crop.corners, boundingW, boundingH, rotation, quality)
        } else {
          const { sx, sy, sw, sh, scale, width, height } = rectRegion(img.naturalWidth, img.naturalHeight, rotation, crop)
          result = { dataUrl: drawRectToDataUrl(img, sx, sy, sw, sh, width, height, scale, rotation, quality), width, height }
        }
        URL.revokeObjectURL(objectUrl)
        resolve(result)
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
      reject(new Error("Could not read this image. Tap refresh to try again."))
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
