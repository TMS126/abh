// FILE: app/tools/jpg-to-pdf/page.tsx
// Nav/Footer are rendered globally from app/layout.tsx, so this page
// automatically sits between them — no wrapper needed here for that.
// Requires: npm install jspdf (already added earlier)
"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import {
  UploadSimple,
  X,
  ArrowUp,
  ArrowDown,
  FilePdf,
  Spinner,
  WarningCircle,
  CheckCircle,
  Stack,
  Files,
} from "@phosphor-icons/react"
import { jsPDF } from "jspdf"
import { BRAND } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

// ─── TYPES ──────────────────────────────────────────────────────────────
type ImageItem = {
  id: string
  file: File
  previewUrl: string
}

type ConvertMode = "merge" | "separate"

type ConvertError = {
  fileName: string
  reason: string
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const MAX_FILES = 30
const MAX_FILE_SIZE_MB = 15

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [mode, setMode] = useState<ConvertMode>("merge")
  const [isConverting, setIsConverting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<ConvertError[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── FILE HANDLING ──────────────────────────────────────────────────
  // Validates each incoming file individually so rejections can name the
  // exact file and exact reason, instead of one generic error for the batch.
  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      setSuccessMessage(null)
      const incomingErrors: ConvertError[] = []
      const accepted: ImageItem[] = []

      const currentCount = images.length
      let slotsLeft = MAX_FILES - currentCount

      Array.from(fileList).forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          incomingErrors.push({
            fileName: file.name,
            reason: "Unsupported file type — only JPG and PNG images are allowed.",
          })
          return
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          incomingErrors.push({
            fileName: file.name,
            reason: `File is too large (over ${MAX_FILE_SIZE_MB}MB). Try a smaller image.`,
          })
          return
        }
        if (slotsLeft <= 0) {
          incomingErrors.push({
            fileName: file.name,
            reason: `Skipped — you've reached the ${MAX_FILES} image limit.`,
          })
          return
        }
        slotsLeft -= 1
        accepted.push({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })
      })

      if (accepted.length > 0) setImages((prev) => [...prev, ...accepted])
      setErrors(incomingErrors)
    },
    [images.length]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = "" // allow re-selecting the same file
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.id !== id)
    })
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev]
      const swapIndex = index + direction
      if (swapIndex < 0 || swapIndex >= next.length) return prev
      ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      return next
    })
  }

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setImages([])
    setErrors([])
    setSuccessMessage(null)
  }

  // ─── IMAGE / PDF HELPERS ────────────────────────────────────────────
  const loadImageDimensions = (url: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => reject(new Error("Could not read image dimensions."))
      img.src = url
    })

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Could not read the file."))
      reader.readAsDataURL(file)
    })

  const fitToA4 = (width: number, height: number) => {
    const pageWidth = 210
    const pageHeight = 297
    const margin = 10
    const maxW = pageWidth - margin * 2
    const maxH = pageHeight - margin * 2
    const ratio = Math.min(maxW / width, maxH / height)
    const renderW = width * ratio
    const renderH = height * ratio
    return {
      pageWidth,
      pageHeight,
      x: (pageWidth - renderW) / 2,
      y: (pageHeight - renderH) / 2,
      renderW,
      renderH,
    }
  }

  // ─── CONVERT: MERGE MODE ────────────────────────────────────────────
  // All images become pages of a single PDF.
  const convertMerged = async () => {
    const pdf = new jsPDF({ unit: "mm" })
    const failures: ConvertError[] = []
    let addedAny = false

    for (let i = 0; i < images.length; i++) {
      const { file, previewUrl } = images[i]
      try {
        const dataUrl = await fileToDataUrl(file)
        const { width, height } = await loadImageDimensions(previewUrl)
        const { x, y, renderW, renderH } = fitToA4(width, height)
        if (addedAny) pdf.addPage()
        const format = file.type === "image/png" ? "PNG" : "JPEG"
        pdf.addImage(dataUrl, format, x, y, renderW, renderH)
        addedAny = true
      } catch (err) {
        failures.push({
          fileName: file.name,
          reason: err instanceof Error ? err.message : "Failed to process this image.",
        })
      }
    }

    if (addedAny) pdf.save("apexbyteshub-converted.pdf")
    return failures
  }

  // ─── CONVERT: SEPARATE MODE ─────────────────────────────────────────
  // Each image becomes its own single-page PDF and downloads individually.
  // A short delay between saves avoids the browser silently blocking a
  // burst of simultaneous downloads.
  const convertSeparate = async () => {
    const failures: ConvertError[] = []

    for (let i = 0; i < images.length; i++) {
      const { file, previewUrl } = images[i]
      try {
        const dataUrl = await fileToDataUrl(file)
        const { width, height } = await loadImageDimensions(previewUrl)
        const { x, y, renderW, renderH } = fitToA4(width, height)
        const pdf = new jsPDF({ unit: "mm" })
        const format = file.type === "image/png" ? "PNG" : "JPEG"
        pdf.addImage(dataUrl, format, x, y, renderW, renderH)
        const baseName = file.name.replace(/\.[^/.]+$/, "")
        pdf.save(`${baseName}.pdf`)
        if (i < images.length - 1) await new Promise((r) => setTimeout(r, 350))
      } catch (err) {
        failures.push({
          fileName: file.name,
          reason: err instanceof Error ? err.message : "Failed to process this image.",
        })
      }
    }

    return failures
  }

  const handleConvert = async () => {
    if (images.length === 0) return
    setIsConverting(true)
    setErrors([])
    setSuccessMessage(null)

    try {
      const failures = mode === "merge" ? await convertMerged() : await convertSeparate()

      if (failures.length > 0) setErrors(failures)

      const succeededCount = images.length - failures.length
      if (succeededCount > 0) {
        setSuccessMessage(
          mode === "merge"
            ? `PDF created from ${succeededCount} image${succeededCount > 1 ? "s" : ""}.`
            : `${succeededCount} PDF${succeededCount > 1 ? "s" : ""} downloaded.`
        )
      }
    } catch (err) {
      setErrors([
        {
          fileName: "General",
          reason: err instanceof Error ? err.message : "Something went wrong during conversion.",
        },
      ])
    } finally {
      setIsConverting(false)
    }
  }

  // ─── UI ──────────────────────────────────────────────────────────────
  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-zinc-950 pt-32 pb-24 px-6 md:px-8">
      <div className="max-w-[720px] mx-auto">
        {/* ── Page header — centered, matches site's abh-* heading style ── */}
        <ScrollBounce>
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-[14px] mb-5"
              style={{ backgroundColor: `${BRAND.blue}14` }}
            >
              <FilePdf weight="fill" className="w-7 h-7" style={{ color: BRAND.blue }} />
            </div>
            <h1 className="font-sans font-black text-3xl md:text-4xl tracking-tight text-zinc-900 dark:text-white mb-3">
              JPG to PDF
            </h1>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Convert images into a PDF right in your browser. Nothing is uploaded — your files
              never leave your device.
            </p>
          </div>
        </ScrollBounce>

        {/* ── Mode toggle — centered ── */}
        <ScrollBounce>
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-1 gap-1">
              <button
                type="button"
                onClick={() => setMode("merge")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-black transition-all ${
                  mode === "merge"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <Stack weight="bold" className="w-4 h-4" />
                One combined PDF
              </button>
              <button
                type="button"
                onClick={() => setMode("separate")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-black transition-all ${
                  mode === "separate"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <Files weight="bold" className="w-4 h-4" />
                Separate PDFs
              </button>
            </div>
          </div>
        </ScrollBounce>
        <p className="text-center text-sm text-zinc-400 mb-10 -mt-6">
          {mode === "merge"
            ? "All images will be combined into a single PDF file."
            : "Each image will be saved as its own PDF file."}
        </p>

        {/* ── Drop zone — centered content ── */}
        <ScrollBounce>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`rounded-[14px] border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 py-14 px-6 text-center ${
              isDragging
                ? "border-brand-blue bg-brand-blue/5"
                : "border-zinc-200 dark:border-zinc-800 hover:border-brand-blue/50"
            }`}
          >
            <UploadSimple weight="bold" className="w-8 h-8 text-zinc-400" />
            <p className="font-medium text-zinc-700 dark:text-zinc-300">
              Drag & drop images here, or tap to browse
            </p>
            <p className="text-sm text-zinc-400">
              JPG or PNG · up to {MAX_FILES} images · {MAX_FILE_SIZE_MB}MB each
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </ScrollBounce>

        {/* ── Errors — specific, one line per file ── */}
        {errors.length > 0 && (
          <div className="mt-6 rounded-[14px] border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <WarningCircle weight="fill" className="w-5 h-5 text-red-500 shrink-0" />
              <span className="font-black text-sm text-red-700 dark:text-red-300">
                {errors.length} issue{errors.length > 1 ? "s" : ""} found
              </span>
            </div>
            <ul className="flex flex-col gap-1 pl-7">
              {errors.map((err, i) => (
                <li key={i} className="text-sm text-red-600 dark:text-red-400">
                  <span className="font-semibold">{err.fileName}:</span> {err.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Success message ── */}
        {successMessage && (
          <div className="mt-6 rounded-[14px] border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-4 flex items-center gap-2">
            <CheckCircle weight="fill" className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {successMessage}
            </span>
          </div>
        )}

        {/* ── Selected images list ── */}
        {images.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[0.84rem] font-black uppercase tracking-widest text-zinc-400">
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </h2>
              <button
                type="button"
                onClick={clearAll}
                className="text-sm font-semibold text-zinc-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>

            <ul className="flex flex-col gap-3">
              {images.map((img, index) => (
                <li
                  key={img.id}
                  className="flex items-center gap-4 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3"
                >
                  <div className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800">
                    <Image src={img.previewUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <span className="flex-1 min-w-0 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {img.file.name}
                  </span>
                  {mode === "merge" && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-brand-blue disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                      >
                        <ArrowUp weight="bold" className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        aria-label="Move down"
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-brand-blue disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors"
                      >
                        <ArrowDown weight="bold" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label="Remove image"
                    className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X weight="bold" className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="mt-8 w-full rounded-[14px] font-black py-4 flex items-center justify-center gap-2 text-white active:scale-[0.99] transition-all disabled:opacity-60"
              style={{ backgroundColor: BRAND.blue }}
            >
              {isConverting ? (
                <>
                  <Spinner weight="bold" className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FilePdf weight="fill" className="w-5 h-5" />
                  {mode === "merge" ? "Convert to PDF" : "Convert to PDFs"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  )
          } 
