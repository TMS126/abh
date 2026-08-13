// FILE: app/tools/jpg-to-pdf/page.tsx
// Nav/Footer are rendered globally from app/layout.tsx — this page sits
// between them automatically, no wrapper needed here.
// Requires: npm install jspdf (already added)
"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import {
  UploadSimple,
  X,
  ArrowUp,
  ArrowDown,
  FilePdf,
  WarningCircle,
  CheckCircle,
  Stack,
  Files,
  PaperPlaneTilt,
} from "@phosphor-icons/react"
import { jsPDF } from "jspdf"
import { BRAND, BIZ, HUB_NAMES, WA, waLink, type HubKey } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

// ─── TYPES ──────────────────────────────────────────────────────────────
type ImageItem = { id: string; file: File; previewUrl: string }
type ConvertMode = "merge" | "separate"
type ConvertError = { fileName: string; reason: string }
type ConvertedFile = { fileName: string; blob: Blob }

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"]
const MAX_FILES = 20
const MAX_FILE_SIZE_MB = 15

// Hubs that make sense to send a converted PDF to — website/business
// services only, matching the brief (printing, reference, docs).
const SENDABLE_HUBS: HubKey[] = ["print", "doc", "design", "eservice", "tech"]

// ─── FILENAME HELPERS ───────────────────────────────────────────────────
// Format: {first 6 chars of original name}-ABH-{DDMMYYYY}.pdf
// Merged files (no single source name) use: ABH-{DDMMYYYY}.pdf
const pad2 = (n: number) => String(n).padStart(2, "0")

const dateStamp = () => {
  const d = new Date()
  return `${pad2(d.getDate())}${pad2(d.getMonth() + 1)}${d.getFullYear()}`
}

const shortenName = (fileName: string) => {
  const base = fileName.replace(/\.[^/.]+$/, "").replace(/\s+/g, "")
  return (base.slice(0, 6) || "IMG").toUpperCase()
}

const buildMergedFileName = () => `ABH-${dateStamp()}.pdf`
const buildSeparateFileName = (originalName: string) => `${shortenName(originalName)}-ABH-${dateStamp()}.pdf`

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [mode, setMode] = useState<ConvertMode>("merge")
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<ConvertError[]>([])
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const [selectedHub, setSelectedHub] = useState<HubKey>("print")
  const [sendNotice, setSendNotice] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── FILE HANDLING ──────────────────────────────────────────────────
  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      setConvertedFiles([])
      setSendNotice(null)
      const incomingErrors: ConvertError[] = []
      const accepted: ImageItem[] = []
      let slotsLeft = MAX_FILES - images.length

      Array.from(fileList).forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          incomingErrors.push({ fileName: file.name, reason: "Unsupported file type — only JPG and PNG images are allowed." })
          return
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          incomingErrors.push({ fileName: file.name, reason: `File is too large (over ${MAX_FILE_SIZE_MB}MB). Try a smaller image.` })
          return
        }
        if (slotsLeft <= 0) {
          incomingErrors.push({ fileName: file.name, reason: `Skipped — you've reached the ${MAX_FILES} image limit.` })
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
    e.target.value = ""
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
    setConvertedFiles([])
    setSendNotice(null)
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
    return { x: (pageWidth - renderW) / 2, y: (pageHeight - renderH) / 2, renderW, renderH }
  }

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  // ─── CONVERT: MERGE MODE — all images become pages of one PDF ───────
  const convertMerged = async (): Promise<{ failures: ConvertError[]; results: ConvertedFile[] }> => {
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
        pdf.addImage(dataUrl, file.type === "image/png" ? "PNG" : "JPEG", x, y, renderW, renderH)
        addedAny = true
      } catch (err) {
        failures.push({ fileName: file.name, reason: err instanceof Error ? err.message : "Failed to process this image." })
      }
      setProgress(Math.round(((i + 1) / images.length) * 100))
    }

    if (!addedAny) return { failures, results: [] }
    const blob = pdf.output("blob") as Blob
    const fileName = buildMergedFileName()
    triggerDownload(blob, fileName)
    return { failures, results: [{ fileName, blob }] }
  }

  // ─── CONVERT: SEPARATE MODE — each image becomes its own PDF ────────
  const convertSeparate = async (): Promise<{ failures: ConvertError[]; results: ConvertedFile[] }> => {
    const failures: ConvertError[] = []
    const results: ConvertedFile[] = []

    for (let i = 0; i < images.length; i++) {
      const { file, previewUrl } = images[i]
      try {
        const dataUrl = await fileToDataUrl(file)
        const { width, height } = await loadImageDimensions(previewUrl)
        const { x, y, renderW, renderH } = fitToA4(width, height)
        const pdf = new jsPDF({ unit: "mm" })
        pdf.addImage(dataUrl, file.type === "image/png" ? "PNG" : "JPEG", x, y, renderW, renderH)
        const blob = pdf.output("blob") as Blob
        const fileName = buildSeparateFileName(file.name)
        triggerDownload(blob, fileName)
        results.push({ fileName, blob })
        if (i < images.length - 1) await new Promise((r) => setTimeout(r, 350))
      } catch (err) {
        failures.push({ fileName: file.name, reason: err instanceof Error ? err.message : "Failed to process this image." })
      }
      setProgress(Math.round(((i + 1) / images.length) * 100))
    }

    return { failures, results }
  }

  const handleConvert = async () => {
    if (images.length === 0) return
    setIsConverting(true)
    setProgress(0)
    setErrors([])
    setConvertedFiles([])
    setSendNotice(null)

    try {
      const { failures, results } = mode === "merge" ? await convertMerged() : await convertSeparate()
      if (failures.length > 0) setErrors(failures)
      setConvertedFiles(results)
    } catch (err) {
      setErrors([{ fileName: "General", reason: err instanceof Error ? err.message : "Something went wrong during conversion." }])
    } finally {
      setIsConverting(false)
    }
  }

  // ─── SEND TO HUB ─────────────────────────────────────────────────────
  // Tries the native Share sheet first (works with WhatsApp on most mobile
  // browsers when a PDF is attached). If unsupported, falls back to opening
  // a prefilled WhatsApp chat — wa.me links can't attach files, so the
  // fallback message asks the visitor to attach the already-downloaded PDF.
  const handleSendToHub = async (file: ConvertedFile) => {
    setSendNotice(null)
    const hubLabel = HUB_NAMES[selectedHub]
    const message = `Hi ${BIZ.name}! I converted a PDF using your JPG to PDF tool (${file.fileName}) and would like help from the ${hubLabel} with it — printing, reference, or whatever you'd recommend.`

    const canNativeShare =
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      "canShare" in navigator &&
      navigator.canShare({ files: [new File([file.blob], file.fileName, { type: "application/pdf" })] })

    if (canNativeShare) {
      try {
        await navigator.share({
          files: [new File([file.blob], file.fileName, { type: "application/pdf" })],
          title: file.fileName,
          text: message,
        })
        setSendNotice(`Share sheet opened — pick WhatsApp and send to ${hubLabel}.`)
        return
      } catch {
        // user cancelled the native share — fall through to WhatsApp fallback
      }
    }

    window.open(waLink(message), "_blank", "noopener,noreferrer")
    setSendNotice(`WhatsApp opened — please attach the downloaded "${file.fileName}" before sending to ${hubLabel}.`)
  }

  // ─── UI ──────────────────────────────────────────────────────────────
  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-zinc-950 pt-32 pb-24 px-6 md:px-8">
      <div className="max-w-[720px] mx-auto">
        {/* ── Page header — centered ── */}
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
          <div className="flex justify-center mb-2">
            <div className="inline-flex rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-1 gap-1">
              <button
                type="button"
                onClick={() => setMode("merge")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-black transition-all ${mode === "merge" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}
              >
                <Stack weight="bold" className="w-4 h-4" />
                One combined PDF
              </button>
              <button
                type="button"
                onClick={() => setMode("separate")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-black transition-all ${mode === "separate" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}
              >
                <Files weight="bold" className="w-4 h-4" />
                Separate PDFs
              </button>
            </div>
          </div>
        </ScrollBounce>
        <p className="text-center text-sm text-zinc-400 mb-10">
          {mode === "merge" ? "All images will be combined into a single PDF file." : "Each image will be saved as its own PDF file."}
        </p>

        {/* ── Drop zone ── */}
        <ScrollBounce>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`rounded-[14px] border-2 border-dashed cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 py-14 px-6 text-center ${isDragging ? "border-brand-blue bg-brand-blue/5" : "border-zinc-200 dark:border-zinc-800 hover:border-brand-blue/50"}`}
          >
            <UploadSimple weight="bold" className="w-8 h-8 text-zinc-400" />
            <p className="font-medium text-zinc-700 dark:text-zinc-300">Drag & drop images here, or tap to browse</p>
            <p className="text-sm text-zinc-400">JPG or PNG · up to {MAX_FILES} images · {MAX_FILE_SIZE_MB}MB each</p>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleFileInput} className="hidden" />
          </div>
        </ScrollBounce>

        {/* ── Errors — specific, one line per file ── */}
        {errors.length > 0 && (
          <div className="mt-6 rounded-[14px] border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <WarningCircle weight="fill" className="w-5 h-5 text-red-500 shrink-0" />
              <span className="font-black text-sm text-red-700 dark:text-red-300">{errors.length} issue{errors.length > 1 ? "s" : ""} found</span>
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

        {/* ── Selected images list ── */}
        {images.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[0.84rem] font-black uppercase tracking-widest text-zinc-400">
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </h2>
              <button type="button" onClick={clearAll} className="text-sm font-semibold text-zinc-400 hover:text-red-500 transition-colors">
                Clear all
              </button>
            </div>

            <ul className="flex flex-col gap-3">
              {images.map((img, index) => (
                <li key={img.id} className="flex items-center gap-4 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3">
                  <div className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800">
                    <Image src={img.previewUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <span className="flex-1 min-w-0 truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">{img.file.name}</span>
                  {mode === "merge" && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Move up" className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-brand-blue disabled:opacity-30 transition-colors">
                        <ArrowUp weight="bold" className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} aria-label="Move down" className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-brand-blue disabled:opacity-30 transition-colors">
                        <ArrowDown weight="bold" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button type="button" onClick={() => removeImage(img.id)} aria-label="Remove image" className="w-8 h-8 rounded-[10px] flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0">
                    <X weight="bold" className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            {/* ── Convert button — circular progress + intentionally
                narrower than full width so it never sits under the
                floating QuoteCalculatorWidget FAB in the bottom corner ── */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full max-w-[260px] rounded-[14px] font-black py-3.5 flex items-center justify-center gap-3 text-white active:scale-[0.99] transition-all disabled:opacity-80"
                style={{ backgroundColor: BRAND.blue }}
              >
                {isConverting ? (
                  <>
                    {/* Circular percentage indicator */}
                    <svg viewBox="0 0 36 36" className="w-6 h-6 shrink-0 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none" stroke="#ffffff" strokeWidth="3"
                        strokeDasharray={2 * Math.PI * 15.5}
                        strokeDashoffset={2 * Math.PI * 15.5 * (1 - progress / 100)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 200ms ease-out" }}
                      />
                    </svg>
                    <span className="text-sm">{progress}%</span>
                  </>
                ) : (
                  <>
                    <FilePdf weight="fill" className="w-5 h-5" />
                    {mode === "merge" ? "Convert to PDF" : "Convert to PDFs"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Post-conversion: download confirmed + send to a Hub ── */}
        {convertedFiles.length > 0 && (
          <div className="mt-10 rounded-[14px] border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle weight="fill" className="w-5 h-5 text-green-600 shrink-0" />
              <span className="text-sm font-black text-green-700 dark:text-green-300">
                {convertedFiles.length} PDF{convertedFiles.length > 1 ? "s" : ""} downloaded to your device
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
              Want ApexbytesHub to help with printing or anything else? Send it straight to a Hub.
            </p>

            {/* Hub picker */}
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {SENDABLE_HUBS.map((hubKey) => (
                <button
                  key={hubKey}
                  type="button"
                  onClick={() => setSelectedHub(hubKey)}
                  className={`px-3.5 py-2 rounded-[10px] text-sm font-black border-2 transition-all ${
                    selectedHub === hubKey
                      ? "text-white border-transparent"
                      : "text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  }`}
                  style={selectedHub === hubKey ? { backgroundColor: BRAND.blue } : undefined}
                >
                  {HUB_NAMES[hubKey]}
                </button>
              ))}
            </div>

            {/* Per-file send buttons */}
            <div className="flex flex-col gap-2 max-w-[360px] mx-auto">
              {convertedFiles.map((file) => (
                <button
                  key={file.fileName}
                  type="button"
                  onClick={() => handleSendToHub(file)}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  <PaperPlaneTilt weight="fill" className="w-4 h-4" />
                  Send {file.fileName} to {HUB_NAMES[selectedHub]}
                </button>
              ))}
            </div>

            {sendNotice && (
              <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">{sendNotice}</p>
            )}
          </div>
        )}
      </div>
    </main>
  )
} 
