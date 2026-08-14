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

// id is present for conversion failures (tied to a specific ImageItem) so
// duplicate filenames don't misattribute an error/overlay onto the wrong
// thumbnail. id is absent for intake-time rejections (oversized/unsupported
// files never become an ImageItem, so there's nothing to tie them to).
export type ConvertError = { fileName: string; reason: string; id?: string }
export type ConvertedFile = { fileName: string; blob: Blob; sourceIds: string[] }
export type HistoryEntry = { fileName: string; isoDate: string }
export type ReconvertPrompt = { overlapCount: number; totalCount: number } | null

export type { HubKey } 
