// app/tools/jpg-to-pdf/use-jpg-to-pdf.ts
"use client"

import { useState, useCallback, useEffect } from "react"
import { jsPDF } from "jspdf"
import { BIZ, HUB_NAMES, waLink, type HubKey } from "@/lib/brand"
import { ACCEPTED_TYPES, MAX_FILES, MAX_FILE_SIZE_MB, PAGE_SIZES } from "./constants"
import { buildFileName, compressImage, fitToPage, loadHistory, saveHistory, clearHistory } from "./utils"
import type { ImageItem, ConvertMode, PageSize, ConvertError, ConvertedFile, HistoryEntry, ReconvertPrompt, CropRect } from "./types"

export function useJpgToPdf() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [mode, setMode] = useState<ConvertMode>("merge")
  const [pageSize, setPageSize] = useState<PageSize>("a4")
  const [quality, setQuality] = useState(0.75)
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<ConvertError[]>([])
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set())
  const [reconvertPrompt, setReconvertPrompt] = useState<ReconvertPrompt>(null)
  const [selectedHub, setSelectedHub] = useState<HubKey>("print")
  const [sendNotice, setSendNotice] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [estimatedBytes, setEstimatedBytes] = useState<number | null>(null)

  useEffect(() => setHistory(loadHistory()), [])

  // Live size estimate: sample the first selected image at the current
  // quality/rotation/crop and extrapolate across the selection.
  useEffect(() => {
    const selected = images.filter((img) => img.selected)
    if (selected.length === 0) { setEstimatedBytes(null); return }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const sample = selected[0]
        const { dataUrl } = await compressImage(sample.file, rotations[sample.id] || 0, quality, sample.crop)
        const sampleBytes = Math.round((dataUrl.length * 3) / 4)
        const ratio = sampleBytes / sample.file.size
        const totalOriginal = selected.reduce((sum, img) => sum + img.file.size, 0)
        if (!cancelled) setEstimatedBytes(Math.round(totalOriginal * ratio))
      } catch {
        if (!cancelled) setEstimatedBytes(null)
      }
    }, 350)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [images, quality, rotations])

  const addFiles = useCallback((fileList: FileList | File[]) => {
    setConvertedFiles([])
    setSendNotice(null)
    setReconvertPrompt(null)
    const incomingErrors: ConvertError[] = []
    const accepted: ImageItem[] = []
    let slotsLeft = MAX_FILES - images.length

    Array.from(fileList).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        incomingErrors.push({ fileName: file.name, reason: "Unsupported type — JPG, PNG or WEBP only." })
        return
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        incomingErrors.push({ fileName: file.name, reason: `Over ${MAX_FILE_SIZE_MB}MB — try a smaller image.` })
        return
      }
      if (slotsLeft <= 0) {
        incomingErrors.push({ fileName: file.name, reason: `Skipped — ${MAX_FILES} image limit reached.` })
        return
      }
      slotsLeft -= 1
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        selected: true,
      })
    })

    if (accepted.length > 0) setImages((prev) => [...prev, ...accepted])
    setErrors(incomingErrors)
  }, [images.length])

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.id !== id)
    })
    setRotations((prev) => { const { [id]: _d, ...rest } = prev; return rest })
  }

  const toggleSelect = (id: string) => setImages((p) => p.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)))
  const selectAll = (value: boolean) => setImages((p) => p.map((i) => ({ ...i, selected: value })))
  const rotateImage = (id: string) => setRotations((p) => ({ ...p, [id]: ((p[id] || 0) + 90) % 360 }))
  const resetRotation = (id: string) => setRotations((p) => ({ ...p, [id]: 0 }))
  const setCrop = (id: string, crop: CropRect | undefined) => setImages((p) => p.map((i) => (i.id === id ? { ...i, crop } : i)))

  const reorder = (from: number, to: number) => {
    if (from === to || Number.isNaN(from)) return
    setImages((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    setImages([])
    setRotations({})
    setErrors([])
    setConvertedFiles([])
    setSendNotice(null)
    setReconvertPrompt(null)
  }

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  const runConvert = async (idsToConvert: string[]) => {
    const targets = images.filter((img) => idsToConvert.includes(img.id))
    if (targets.length === 0) return

    setIsConverting(true)
    setProgress(0)
    setErrors([])
    setConvertedFiles([])
    setSendNotice(null)

    const failures: ConvertError[] = []
    const results: ConvertedFile[] = []
    const usedNames = new Set<string>()

    try {
      if (mode === "merge") {
        const pdf = new jsPDF({ unit: "mm", format: [PAGE_SIZES[pageSize].w, PAGE_SIZES[pageSize].h] })
        let addedAny = false
        for (let i = 0; i < targets.length; i++) {
          const { id, file, crop } = targets[i]
          try {
            const { dataUrl, width, height } = await compressImage(file, rotations[id] || 0, quality, crop)
            const { x, y, renderW, renderH } = fitToPage(width, height, PAGE_SIZES[pageSize])
            if (addedAny) pdf.addPage([PAGE_SIZES[pageSize].w, PAGE_SIZES[pageSize].h])
            pdf.addImage(dataUrl, "JPEG", x, y, renderW, renderH)
            addedAny = true
          } catch (err) {
            failures.push({ fileName: file.name, reason: err instanceof Error ? err.message : "Failed to process." })
          }
          setProgress(Math.round(((i + 1) / targets.length) * 100))
        }
        if (addedAny) {
          const blob = pdf.output("blob") as Blob
          const fileName = buildFileName(`batch${targets.length}`, usedNames)
          triggerDownload(blob, fileName)
          results.push({ fileName, blob, sourceIds: targets.map((t) => t.id) })
        }
      } else {
        for (let i = 0; i < targets.length; i++) {
          const { id, file, crop } = targets[i]
          try {
            const { dataUrl, width, height } = await compressImage(file, rotations[id] || 0, quality, crop)
            const { x, y, renderW, renderH } = fitToPage(width, height, PAGE_SIZES[pageSize])
            const pdf = new jsPDF({ unit: "mm", format: [PAGE_SIZES[pageSize].w, PAGE_SIZES[pageSize].h] })
            pdf.addImage(dataUrl, "JPEG", x, y, renderW, renderH)
            const blob = pdf.output("blob") as Blob
            const fileName = buildFileName(file.name, usedNames)
            triggerDownload(blob, fileName)
            results.push({ fileName, blob, sourceIds: [id] })
            if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 300))
          } catch (err) {
            failures.push({ fileName: file.name, reason: err instanceof Error ? err.message : "Failed to process." })
          }
          setProgress(Math.round(((i + 1) / targets.length) * 100))
        }
      }

      if (failures.length > 0) setErrors(failures)
      setConvertedFiles(results)
      setConvertedIds((prev) => new Set([...prev, ...idsToConvert]))

      if (results.length > 0) {
        const nowIso = new Date().toISOString()
        const entries = results.map((r) => ({ fileName: r.fileName, isoDate: nowIso }))
        const updated = [...entries, ...history].slice(0, 8)
        setHistory(updated)
        saveHistory(updated)
      }
    } catch (err) {
      setErrors([{ fileName: "General", reason: err instanceof Error ? err.message : "Something went wrong." }])
    } finally {
      setIsConverting(false)
    }
  }

  const requestConvert = () => {
    const selected = images.filter((img) => img.selected)
    if (selected.length === 0) return
    const overlap = selected.filter((img) => convertedIds.has(img.id))
    if (overlap.length > 0) {
      setReconvertPrompt({ overlapCount: overlap.length, totalCount: selected.length })
      return
    }
    runConvert(selected.map((img) => img.id))
  }

  const resolveReconvert = (choice: "all" | "new-only" | "cancel") => {
    setReconvertPrompt(null)
    if (choice === "cancel") return
    const selected = images.filter((img) => img.selected)
    const ids = choice === "all" ? selected.map((i) => i.id) : selected.filter((i) => !convertedIds.has(i.id)).map((i) => i.id)
    if (ids.length > 0) runConvert(ids)
  }

  const handleSendToHub = async (file: ConvertedFile) => {
    setSendNotice(null)
    const hubLabel = HUB_NAMES[selectedHub]
    const message = `Hi ${BIZ.name}! I converted a PDF using your JPG to PDF tool (${file.fileName}) and would like help from the ${hubLabel} with it — printing, reference, or whatever you'd recommend.`

    const canNativeShare =
      typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator &&
      navigator.canShare({ files: [new File([file.blob], file.fileName, { type: "application/pdf" })] })

    if (canNativeShare) {
      try {
        await navigator.share({ files: [new File([file.blob], file.fileName, { type: "application/pdf" })], title: file.fileName, text: message })
        setSendNotice(`Share sheet opened — pick WhatsApp and send to ${hubLabel}.`)
        return
      } catch {
        // user cancelled — fall through to WhatsApp fallback
      }
    }
    window.open(waLink(message), "_blank", "noopener,noreferrer")
    setSendNotice(`WhatsApp opened — attach "${file.fileName}" before sending to ${hubLabel}.`)
  }

  const clearRecents = () => { clearHistory(); setHistory([]) }
  const selectedCount = images.filter((img) => img.selected).length

  return {
    images, mode, setMode, pageSize, setPageSize, quality, setQuality,
    rotations, isConverting, progress, errors, convertedFiles, convertedIds, reconvertPrompt,
    selectedHub, setSelectedHub, sendNotice, history, selectedCount, estimatedBytes,
    addFiles, removeImage, toggleSelect, selectAll, rotateImage, resetRotation, setCrop, reorder,
    clearAll, requestConvert, resolveReconvert, handleSendToHub, clearRecents,
  }
      } 
