// app/tools/jpg-to-pdf/use-jpg-to-pdf.ts
"use client"

import { useState, useCallback, useEffect } from "react"
import { jsPDF } from "jspdf"
import { BIZ, waLink } from "@/lib/brand"
import { ACCEPTED_TYPES, MAX_FILES, MAX_FILE_SIZE_MB, PAGE_SIZES } from "./constants"
import { buildFileName, compressImage, fitToPage, loadHistory, saveHistory, clearHistory, resolveFileType, generateThumbnail } from "./utils"
import type { ImageItem, ConvertMode, PageSize, ConvertError, ConvertedFile, HistoryEntry, ReconvertPrompt, CropRect } from "./types"

export function useJpgToPdf() {
  // ─── STATE ──────────────────────────────────────────────────────────────
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
  const [sendNotice, setSendNotice] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [estimatedBytes, setEstimatedBytes] = useState<number | null>(null)
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set())

  useEffect(() => setHistory(loadHistory()), [])

  // ─── LIVE SIZE ESTIMATE ─────────────────────────────────────────────────
  // Guards against a stale estimate finishing after a newer one has
  // already started — since the decode cascade can now take a few
  // attempts on a large file, this avoids wasted work being computed and
  // applied after it's no longer relevant.
  useEffect(() => {
    const selected = images.filter((img) => img.selected)
    if (selected.length === 0) { setEstimatedBytes(null); return }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const sample = selected[0]
        const { dataUrl } = await compressImage(sample.file, rotations[sample.id] || 0, quality, sample.crop)
        if (cancelled) return
        const sampleBytes = Math.round((dataUrl.length * 3) / 4)
        const ratio = sampleBytes / sample.file.size
        const totalOriginal = selected.reduce((sum, img) => sum + img.file.size, 0)
        setEstimatedBytes(Math.round(totalOriginal * ratio))
      } catch {
        if (!cancelled) setEstimatedBytes(null)
      }
    }, 350)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [images, quality, rotations])

  // ─── FILE INTAKE ────────────────────────────────────────────────────────
  const addFiles = useCallback((fileList: FileList | File[]) => {
    setConvertedFiles([])
    setSendNotice(null)
    setReconvertPrompt(null)
    const incomingErrors: ConvertError[] = []
    const toAppend: ImageItem[] = []
    const replacements: { targetId: string; file: File; previewUrl: string }[] = []
    let slotsLeft = MAX_FILES - images.length

    Array.from(fileList).forEach((file) => {
      if (!resolveFileType(file, ACCEPTED_TYPES)) {
        incomingErrors.push({ fileName: file.name, reason: "Unsupported type — JPG, PNG or WEBP only." })
        return
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        incomingErrors.push({ fileName: file.name, reason: `Over ${MAX_FILE_SIZE_MB}MB — try a smaller image.` })
        return
      }

      const existing = images.find(
        (img) => img.file.name === file.name && img.file.size === file.size && img.file.lastModified === file.lastModified
      )
      if (existing) {
        replacements.push({ targetId: existing.id, file, previewUrl: URL.createObjectURL(file) })
        return
      }

      if (slotsLeft <= 0) {
        incomingErrors.push({ fileName: file.name, reason: `Skipped — ${MAX_FILES} image limit reached.` })
        return
      }
      slotsLeft -= 1
      toAppend.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        selected: true,
      })
    })

    if (replacements.length > 0) {
      setImages((prev) =>
        prev.map((img) => {
          const r = replacements.find((rep) => rep.targetId === img.id)
          if (!r) return img
          URL.revokeObjectURL(img.previewUrl)
          return { ...img, file: r.file, previewUrl: r.previewUrl, selected: true, crop: undefined }
        })
      )
      setRotations((prev) => {
        const next = { ...prev }
        replacements.forEach((r) => { delete next[r.targetId] })
        return next
      })
      setConvertedIds((prev) => {
        const next = new Set(prev)
        replacements.forEach((r) => next.delete(r.targetId))
        return next
      })
      setErrors((prev) => prev.filter((e) => !replacements.some((r) => r.targetId === e.id)))
    }

    if (toAppend.length > 0) setImages((prev) => [...prev, ...toAppend])

    const toThumbnail = [
      ...toAppend.map((item) => ({ id: item.id, file: item.file })),
      ...replacements.map((r) => ({ id: r.targetId, file: r.file })),
    ]
    toThumbnail.forEach((item) => {
      generateThumbnail(item.file)
        .then((thumbUrl) => {
          setImages((prev) =>
            prev.map((img) => {
              if (img.id !== item.id) return img
              URL.revokeObjectURL(img.previewUrl)
              return { ...img, previewUrl: thumbUrl }
            })
          )
        })
        .catch(() => {})
    })

    setErrors(incomingErrors)
  }, [images])

  // ─── IMAGE ACTIONS ──────────────────────────────────────────────────────
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

  const retryImage = async (id: string) => {
    const target = images.find((img) => img.id === id)
    if (!target) return
    setRetryingIds((prev) => new Set([...prev, id]))
    try {
      await compressImage(target.file, rotations[id] || 0, quality, target.crop)
      setErrors((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setErrors((prev) => [
        ...prev.filter((e) => e.id !== id),
        {
          fileName: target.file.name,
          id,
          reason: "Still can't read this image. Try re-saving or re-exporting the photo, then re-upload it.",
        },
      ])
    } finally {
      setRetryingIds((prev) => { const next = new Set(prev); next.delete(id); return next })
    }
  }

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

  // ─── DOWNLOAD HELPER ────────────────────────────────────────────────────
  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  // ─── CONVERSION ─────────────────────────────────────────────────────────
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
            failures.push({ fileName: file.name, reason: err instanceof Error ? err.message : "Failed to process.", id })
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
            failures.push({ fileName: file.name, reason: err instanceof Error ? err.message : "Failed to process.", id })
          }
          setProgress(Math.round(((i + 1) / targets.length) * 100))
        }
      }

      if (failures.length > 0) setErrors(failures)
      setConvertedFiles(results)

      const failedIds = new Set(failures.map((f) => f.id))
      const succeededIds = targets.filter((tg) => !failedIds.has(tg.id)).map((tg) => tg.id)
      if (succeededIds.length > 0) {
        setConvertedIds((prev) => new Set([...prev, ...succeededIds]))
      }

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

  // ─── SEND ───────────────────────────────────────────────────────────────
  const handleSend = async (file: ConvertedFile) => {
    setSendNotice(null)
    const message = `Hi ${BIZ.name}! I converted a PDF using your JPG to PDF tool (${file.fileName}) and would like some help with it.`

    const canNativeShare =
      typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator &&
      navigator.canShare({ files: [new File([file.blob], file.fileName, { type: "application/pdf" })] })

    if (canNativeShare) {
      try {
        await navigator.share({ files: [new File([file.blob], file.fileName, { type: "application/pdf" })], title: file.fileName, text: message })
        setSendNotice("Share sheet opened — pick WhatsApp to send it over.")
        return
      } catch {
        // user cancelled — fall through to WhatsApp fallback
      }
    }
    window.open(waLink(message), "_blank", "noopener,noreferrer")
    setSendNotice(`WhatsApp opened — attach "${file.fileName}" before sending.`)
  }

  const clearRecents = () => { clearHistory(); setHistory([]) }
  const selectedCount = images.filter((img) => img.selected).length

  // ─── RETURN ─────────────────────────────────────────────────────────────
  return {
    images, mode, setMode, pageSize, setPageSize, quality, setQuality,
    rotations, isConverting, progress, errors, convertedFiles, convertedIds, reconvertPrompt,
    sendNotice, history, selectedCount, estimatedBytes, retryingIds,
    addFiles, removeImage, toggleSelect, selectAll, rotateImage, resetRotation, setCrop, retryImage, reorder,
    clearAll, requestConvert, resolveReconvert, handleSend, clearRecents,
  }
          } 
