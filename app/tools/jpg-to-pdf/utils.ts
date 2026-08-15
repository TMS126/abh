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

// ─── FILE IDENTITY (SHA-256) ─────────────────────────────────────────────
// True content-based identity: hashes the file's actual bytes, so a
// re-uploaded photo is recognized as "the same file" even if the OS/app
// changed its name or lastModified timestamp on export/share, and two
// genuinely different files are never confused just because they share
// those metadata fields.
export async function hashFile(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const digest = await crypto.subtle.digest("SHA-256", buffer)
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("")
  } catch {
    // crypto.subtle requires a secure (https) context and modern browser
    // support. Falls back to a metadata-based key rather than blocking
    // the upload entirely — still functional, just not a true hash.
    return `fallback:${file.name}:${file.size}:${file.lastModified}`
  }
}

// ─── ADAPTIVE DECODE PIPELINE ────────────────────────────────────────────
// Decodes AT a reduced size directly (via createImageBitmap's resize
// options) instead of decoding full-resolution first and shrinking after
// — this is what avoids the memory spike that caused "could not read
// this image" on large photos. Cascades through progressively smaller
// targets, then falls back to a manual <img>+canvas path with the same
// cascade, before ever reporting failure.

const DECODE_SIZE_CASCADE = [MAX_CANVAS_DIMENSION, 1600, 1200, 900, 600, 400] as const

function probeDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight
      URL.revokeObjectURL(url)
      if (w > 0 && h > 0) resolve({ w, h })
      else reject(new Error("Image reported zero dimensions."))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read this image's dimensions.")) }
    img.src = url
  })
}

function cappedDims(naturalW: number, naturalH: number, maxDim: number) {
  const scale = Math.min(1, maxDim / Math.max(naturalW, naturalH))
  return { w: Math.max(1, Math.round(naturalW * scale)), h: Math.max(1, Math.round(naturalH * scale)) }
}

type DecodedSource = { source: CanvasImageSource; width: number; height: number; cleanup: () => void }

async function decodeViaBitmapCascade(file: File, naturalW: number, naturalH: number): Promise<DecodedSource> {
  if (typeof createImageBitmap !== "function") throw new Error("createImageBitmap unsupported")
  let lastErr: unknown
  for (const target of DECODE_SIZE_CASCADE) {
    const { w, h } = cappedDims(naturalW, naturalH, target)
    try {
      const bitmap = await createImageBitmap(file, { resizeWidth: w, resizeHeight: h, resizeQuality: "medium" })
      return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() }
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Bitmap decode failed at every size.")
}

function decodeViaImageElementCascade(file: File, naturalW: number, naturalH: number): Promise<DecodedSource> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      let lastErr: unknown
      for (const target of DECODE_SIZE_CASCADE) {
        const { w, h } = cappedDims(naturalW, naturalH, target)
        try {
          const canvas = document.createElement("canvas")
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Canvas not supported on this device.")
          ctx.drawImage(img, 0, 0, w, h)
          URL.revokeObjectURL(url)
          resolve({ source: canvas, width: w, height: h, cleanup: () => {} })
          return
        } catch (err) {
          lastErr = err
        }
      }
      URL.revokeObjectURL(url)
      reject(lastErr instanceof Error ? lastErr : new Error("Could not process this image at any size."))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read this image.")) }
    img.src = url
  })
}

async function withTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch {
    await new Promise((r) => setTimeout(r, 300))
    return fn()
  }
}

async function decodeSourceAdaptive(file: File): Promise<DecodedSource> {
  const { w: naturalW, h: naturalH } = await probeDimensions(file)
  try {
    return await withTransientRetry(() => decodeViaBitmapCascade(file, naturalW, naturalH))
  } catch {
    return await withTransientRetry(() => decodeViaImageElementCascade(file, naturalW, naturalH))
  }
}

// ─── THUMBNAIL GENERATION ────────────────────────────────────────────────
export async function generateThumbnail(file: File, maxDim = 480): Promise<string> {
  try {
    const { source, width, height, cleanup } = await decodeSourceAdaptive(file)
    try {
      const scale = Math.min(1, maxDim / Math.max(width, height))
      const w = Math.max(1, Math.round(width * scale))
      const h = Math.max(1, Math.round(height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas not supported on this device.")
      ctx.drawImage(source, 0, 0, w, h)
      return await new Promise<string>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error("Thumbnail generation failed.")); return }
          resolve(URL.createObjectURL(blob))
        }, "image/jpeg", 0.7)
      })
    } finally {
      cleanup()
    }
  } catch {
    return URL.createObjectURL(file)
  }
    }

// ─── PERSPECTIVE WARP (for free four-corner crops) ─────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function lerpPoint(a: CropPoint, b: CropPoint, t: number): CropPoint {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
}

function drawAffineTriangle(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  src: [CropPoint, CropPoint, CropPoint],
  dst: [CropPoint, CropPoint, CropPoint]
) {
  const [s0, s1, s2] = src
  const [d0, d1, d2] = dst
  const denom = (s1.x - s0.x) * (s2.y - s0.y) - (s2.x - s0.x) * (s1.y - s0.y)
  if (Math.abs(denom) < 1e-8) return
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

// ─── CANVAS RENDER HELPERS ───────────────────────────────────────────────
// Return the raw canvas rather than encoding immediately, so both
// compressImage (full-size, cap = MAX_CANVAS_DIMENSION) and
// generateCroppedPreview (thumbnail-size, cap = maxDim) can share the
// exact same crop/warp/rotation math and only differ in output size.

function computeRectPlan(sourceW: number, sourceH: number, rotation: number, crop: CropRect | undefined, cap: number) {
  const validCrop = crop && crop.w > 0.02 && crop.h > 0.02 ? crop : { x: 0, y: 0, w: 1, h: 1 }
  const sx = validCrop.x * sourceW
  const sy = validCrop.y * sourceH
  const sw = Math.max(1, validCrop.w * sourceW)
  const sh = Math.max(1, validCrop.h * sourceH)
  const swap = rotation === 90 || rotation === 270
  const rawW = swap ? sh : sw
  const rawH = swap ? sw : sh
  const scale = Math.min(1, cap / Math.max(rawW, rawH))
  const width = Math.max(1, Math.round(rawW * scale))
  const height = Math.max(1, Math.round(rawH * scale))
  return { sx, sy, sw, sh, scale, width, height }
}

function renderRectCanvas(source: CanvasImageSource, plan: ReturnType<typeof computeRectPlan>, rotation: number): HTMLCanvasElement {
  const { sx, sy, sw, sh, scale, width, height } = plan
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported on this device.")
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(scale, scale)
  ctx.drawImage(source, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh)
  return canvas
}

function renderQuadCanvas(
  source: CanvasImageSource,
  sourceW: number, sourceH: number,
  corners: [CropPoint, CropPoint, CropPoint, CropPoint],
  boundingW: number, boundingH: number,
  rotation: number, cap: number
): HTMLCanvasElement {
  const pxCorners = corners.map((c) => ({ x: c.x * sourceW, y: c.y * sourceH })) as [CropPoint, CropPoint, CropPoint, CropPoint]
  const scale = Math.min(1, cap / Math.max(boundingW, boundingH))
  const flatW = Math.max(1, Math.round(boundingW * scale))
  const flatH = Math.max(1, Math.round(boundingH * scale))
  const flattened = warpQuadToCanvas(source, pxCorners, flatW, flatH)
  if (rotation === 0) return flattened
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
  return canvas
}

// ─── IMAGE PROCESSING ────────────────────────────────────────────────────
export const compressImage = async (
  file: File,
  rotation: number,
  quality: number,
  crop?: CropRect
): Promise<{ dataUrl: string; width: number; height: number }> => {
  const { source, width: srcW, height: srcH, cleanup } = await decodeSourceAdaptive(file)
  try {
    let canvas: HTMLCanvasElement
    if (crop?.corners) {
      const boundingW = Math.max(1, crop.w * srcW)
      const boundingH = Math.max(1, crop.h * srcH)
      canvas = renderQuadCanvas(source, srcW, srcH, crop.corners, boundingW, boundingH, rotation, MAX_CANVAS_DIMENSION)
    } else {
      const plan = computeRectPlan(srcW, srcH, rotation, crop, MAX_CANVAS_DIMENSION)
      canvas = renderRectCanvas(source, plan, rotation)
    }
    return { dataUrl: canvas.toDataURL("image/jpeg", quality), width: canvas.width, height: canvas.height }
  } finally {
    cleanup()
  }
}

// Produces a small preview reflecting the ACTUAL crop/rotation that will
// be converted — used to update the grid thumbnail after a crop is
// applied, so the person sees what they cropped, not the original photo.
export async function generateCroppedPreview(file: File, crop: CropRect, rotation: number, maxDim = 480): Promise<string> {
  const { source, width: srcW, height: srcH, cleanup } = await decodeSourceAdaptive(file)
  try {
    let canvas: HTMLCanvasElement
    if (crop.corners) {
      const boundingW = Math.max(1, crop.w * srcW)
      const boundingH = Math.max(1, crop.h * srcH)
      canvas = renderQuadCanvas(source, srcW, srcH, crop.corners, boundingW, boundingH, rotation, maxDim)
    } else {
      const plan = computeRectPlan(srcW, srcH, rotation, crop, maxDim)
      canvas = renderRectCanvas(source, plan, rotation)
    }
    return await new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Preview generation failed.")); return }
        resolve(URL.createObjectURL(blob))
      }, "image/jpeg", 0.75)
    })
  } finally {
    cleanup()
  }
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
