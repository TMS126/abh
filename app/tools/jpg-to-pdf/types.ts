// app/tools/jpg-to-pdf/types.ts
import type { HubKey } from "@/lib/brand"

export type CropRect = { x: number; y: number; w: number; h: number } // relative 0..1 of original image

export type ImageItem = {
  id: string
  file: File
  previewUrl: string
  selected: boolean
  crop?: CropRect
}

export type ConvertMode = "merge" | "separate"
export type PageSize = "a4" | "letter"

export type ConvertError = { fileName: string; reason: string }
export type ConvertedFile = { fileName: string; blob: Blob; sourceIds: string[] }
export type HistoryEntry = { fileName: string; isoDate: string }
export type ReconvertPrompt = { overlapCount: number; totalCount: number } | null

export type { HubKey } 
