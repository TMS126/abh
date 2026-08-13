// app/tools/jpg-to-pdf/page.tsx
// Requires: npm install jspdf
"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { UploadSimple, X, ArrowUp, ArrowDown, FilePdf, Spinner } from "@phosphor-icons/react"
import { jsPDF } from "jspdf"

type ImageItem = {
  id: string
  file: File
  previewUrl: string
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const MAX_FILES = 30

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── FILE HANDLING ─────────────────────────────────────────────────────
  const addFiles = useCallback((fileList: FileList | File[]) => {
    setError(null)
    const incoming = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type))

    if (incoming.length === 0) {
      setError("Please select JPG or PNG images.")
      return
    }

    setImages((prev) => {
      const combined = [...prev]
      for (const file of incoming) {
        if (combined.length >= MAX_FILES) break
        combined.push({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })
      }
      return combined
    })
  }, [])

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

  // ─── PDF GENERATION ────────────────────────────────────────────────────
  const loadImageDimensions = (url: string): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = url
    })

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleConvert = async () => {
    if (images.length === 0) return
    setIsConverting(true)
    setError(null)

    try {
      const pdf = new jsPDF({ unit: "mm" })
      // A4 in mm, with a small margin
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const maxW = pageWidth - margin * 2
      const maxH = pageHeight - margin * 2

      for (let i = 0; i < images.length; i++) {
        const { file, previewUrl } = images[i]
        const dataUrl = await fileToDataUrl(file)
        const { width, height } = await loadImageDimensions(previewUrl)

        // Fit image to page while preserving aspect ratio
        const ratio = Math.min(maxW / width, maxH / height)
        const renderW = width * ratio
        const renderH = height * ratio
        const x = (pageWidth - renderW) / 2
        const y = (pageHeight - renderH) / 2

        if (i > 0) pdf.addPage()

        const format = file.type === "image/png" ? "PNG" : "JPEG"
        pdf.addImage(dataUrl, format, x, y, renderW, renderH)
      }

      pdf.save("apexbyteshub-converted.pdf")
    } catch (err) {
      console.error(err)
      setError("Something went wrong converting your images. Please try again.")
    } finally {
      setIsConverting(false)
    }
  }

  // ─── UI ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 pt-24 pb-20 px-6 md:px-8">
      <div className="max-w-[720px] mx-auto">
        <h1 className="font-sans font-black text-3xl tracking-tight text-zinc-900 dark:text-white mb-3">
          JPG to PDF
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 mb-10 max-w-md">
          Convert one or more images into a single PDF, right in your browser. Nothing is
          uploaded — your files never leave your device.
        </p>

        {/* Drop zone */}
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
            Drag & drop images here, or click to browse
          </p>
          <p className="text-sm text-zinc-400">JPG or PNG · up to {MAX_FILES} images</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Selected images list */}
        {images.length > 0 && (
          <div className="mt-10">
            <h2 className="text-[0.84rem] font-black uppercase tracking-widest mb-4 text-zinc-400">
              {images.length} image{images.length > 1 ? "s" : ""} selected
            </h2>
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
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      aria-label="Remove image"
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <X weight="bold" className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="mt-8 w-full rounded-[14px] bg-brand-blue text-white font-black py-4 flex items-center justify-center gap-2 hover:bg-brand-blue/90 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {isConverting ? (
                <>
                  <Spinner weight="bold" className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FilePdf weight="fill" className="w-5 h-5" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
