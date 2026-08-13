// app/tools/jpg-to-pdf/constants.ts
import type { HubKey } from "@/lib/brand"
import type { PageSize, ConvertMode } from "./types"

// webp added alongside jpg/png — well-supported, safe to accept as input.
export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
export const MAX_FILES = 20
export const MAX_FILE_SIZE_MB = 15
export const HISTORY_KEY = "abh-jpg-to-pdf-history"

export const SENDABLE_HUBS: HubKey[] = ["print", "doc", "design", "eservice", "tech"]

export const PAGE_SIZES: Record<PageSize, { w: number; h: number; label: string }> = {
  a4: { w: 210, h: 297, label: "A4" },
  letter: { w: 215.9, h: 279.4, label: "Letter" },
}

export const MODE_LABELS: Record<ConvertMode, string> = {
  merge: "One combined PDF",
  separate: "Separate PDFs",
} 
