// app/tools/jpg-to-pdf/constants.ts
import type { HubKey } from "@/lib/brand"
import type { PageSize, ConvertMode } from "./types"

export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
export const MAX_FILES = 20
export const MAX_FILE_SIZE_MB = 15
export const HISTORY_KEY = "abh-jpg-to-pdf-history"

// Phone camera files sometimes report an empty/nonstandard file.type —
// fall back to the extension so real photos aren't rejected.
export const EXT_TYPE_FALLBACK: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
}

// Caps the canvas at 2200px on the long edge — still ~267 DPI on an A4
// page (print-quality) but stops full-resolution phone camera photos
// (often 4000px+) from exceeding mobile canvas memory limits.
export const MAX_CANVAS_DIMENSION = 2200

export const SENDABLE_HUBS: HubKey[] = ["print", "doc", "design", "eservice", "tech"]

export const PAGE_SIZES: Record<PageSize, { w: number; h: number; label: string }> = {
  a4: { w: 210, h: 297, label: "A4" },
  letter: { w: 215.9, h: 279.4, label: "Letter" },
}

export const MODE_LABELS: Record<ConvertMode, string> = {
  merge: "One combined PDF",
  separate: "Separate PDFs",
}

export const PAGE_TIPS = [
  "Converted files save straight to your device — no upload, no waiting.",
  "Crop before converting to trim out backgrounds and clutter.",
  "Bulk-select photos and merge them into one tidy PDF.",
  "Drag the quality slider down for WhatsApp-friendly file sizes.",
  "Rotate sideways photos with one tap before converting.",
  "Need it printed? Send your PDF straight to ApexbytesHub.",
]

export const WHATSAPP_MAGIC_PHRASES = [
  "Chat With Us →",
  "Say Hi on WhatsApp 👋",
  "Tap to Chat",
  "We're Listening 💬",
  "Ping Us Now",
  "Let's Talk →",
]

// ─── CROP MODAL ─────────────────────────────────────────────────────────
// Popular rectangular aspect-ratio presets. `null` ratio = free-form
// rectangle (any width/height). Ratio is width/height.
export const CROP_ASPECT_PRESETS: { label: string; ratio: number | null }[] = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
]

// Grid resolution for the perspective-warp mesh in utils.ts — higher is
// smoother but costs more canvas draw calls (cells * 2 triangles each).
// 14 is a good quality/speed balance for a one-off conversion on mobile.
export const PERSPECTIVE_WARP_GRID = 14
