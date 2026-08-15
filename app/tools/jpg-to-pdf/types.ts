// app/tools/jpg-to-pdf/types.ts
import type { HubKey } from "@/lib/brand"

export type CropPoint = { x: number; y: number } // relative 0..1 of original image

export type CropRect = {
  x: number
  y: number
  w: number
  h: number
  corners?: [CropPoint, CropPoint, CropPoint, CropPoint]
}

export type ImageItem = {
  id: string
  file: File
  previewUrl: string
  selected: boolean
  crop?: CropRect
  // SHA-256 of the file's actual bytes — the real identity check used to
  // detect "this is the same photo" on re-upload, replacing the old
  // name+size+lastModified guess.
  hash?: string
}

export type ConvertMode = "merge" | "separate"
export type PageSize = "a4" | "letter"

export type ConvertError = { fileName: string; reason: string; id?: string }
export type ConvertedFile = { fileName: string; blob: Blob; sourceIds: string[] }
export type HistoryEntry = { fileName: string; isoDate: string }
export type ReconvertPrompt = { overlapCount: number; totalCount: number } | null

export type { HubKey } 
