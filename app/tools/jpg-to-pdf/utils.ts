// app/tools/jpg-to-pdf/utils.ts
import { HISTORY_KEY } from "./constants"
import type { HistoryEntry } from "./types"

const pad2 = (n: number) => String(n).padStart(2, "0")

function stamp(date = new Date()) {
  return {
    date: `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()}`,
    time: `${pad2(date.getHours())}${pad2(date.getMinutes())}`,
  }
}

const shortenName = (fileName: string) => {
  const base = fileName.replace(/\.[^/.]+$/, "").replace(/\s+/g, "")
  return (base.slice(0, 6) || "IMG").toUpperCase()
}

// Smart naming: date + time baked into every filename, with a
// collision-safe suffix so a batch converted in the same minute never
// silently overwrites a sibling file.
export function buildMergedFileName() {
  const { date, time } = stamp()
  return `ABH-${date}-${time}.pdf`
}

export function buildSeparateFileName(originalName: string, usedNames: Set<string>) {
  const { date, time } = stamp()
  const base = shortenName(originalName)
  let fileName = `${base}-${date}-${time}.pdf`
  let n = 2
  while (usedNames.has(fileName)) {
    fileName = `${base}-${date}-${time}-${n}.pdf`
    n++
  }
  usedNames.add(fileName)
  return fileName
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Local date + time in whatever timezone/locale the user's device is
// currently set to — no hardcoded region, so "Recent" always reflects
// wherever the person actually is.
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
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 8)))
  } catch {}
}

export const clearHistory = () => {
  try {
    window.localStorage.removeItem(HISTORY_KEY)
  } catch {}
}

// ─── IMAGE PROCESSING ────────────────────────────────────────────────────
export const compressImage = (
  file: File,
  rotation: number,
  quality: number
): Promise<{ dataUrl: string; width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const swap = rotation === 90 || rotation === 270
      const width = swap ? img.naturalHeight : img.naturalWidth
      const height = swap ? img.naturalWidth : img.naturalHeight
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      URL.revokeObjectURL(objectUrl)
      if (!ctx) {
        reject(new Error("Canvas not supported on this device."))
        return
      }
      ctx.translate(width / 2, height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      resolve({ dataUrl: canvas.toDataURL("image/jpeg", quality), width, height })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Could not read this image."))
    }
    img.src = objectUrl
  })

export const fitToPage = (width: number, height: number, page: { w: number; h: number }) => {
  const margin = 10
  const maxW = page.w - margin * 2
  const maxH = page.h - margin * 2
  const ratio = Math.min(maxW / width, maxH / height)
  const renderW = width * ratio
  const renderH = height * ratio
  return { x: (page.w - renderW) / 2, y: (page.h - renderH) / 2, renderW, renderH }
}
