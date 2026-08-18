// app/tools/jpg-to-pdf/use-jpg-to-pdf.ts
"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { jsPDF } from "jspdf"
import { BIZ, waLink } from "@/lib/brand"
import { ACCEPTED_TYPES, MAX_FILES, MAX_FILE_SIZE_MB, PAGE_SIZES } from "./constants"
import { buildFileName, compressImage, fitToPage, loadHistory, saveHistory, clearHistory, resolveFileType, generateThumbnail, generateCroppedPreview, hashFile } from "./utils"
import type { ImageItem, ConvertMode, PageSize, ConvertError, ConvertedFile, HistoryEntry, ReconvertPrompt, CropRect, ImageFilter } from "./types"

export function useJpgToPdf() {
  // ─── STATE ──────────────────────────────────────────────────────────────
  const [images, setImages] = useState<ImageItem[]>([])
  const [mode, setMode] = useState<ConvertMode>("merge")
  const [pageSize, setPageSize] = useState<PageSize>("a4")
  const [quality, setQuality] = useState(0.75)
  const [rotations, setRotations] = useState<Record<string, number>>({})
  const [filters, setFilters] = useState<Record<string, ImageFilter>>({})
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

  // Always-fresh snapshot of images, readable from inside async work
  // (hashing, preview regeneration) without depending on stale closures.
  const imagesRef = useRef<ImageItem[]>(images)
  useEffect(() => { imagesRef.current = images }, [images])

  useEffect(() => setHistory(loadHistory()), [])

  // ─── LIVE SIZE ESTIMATE ─────────────────────────────────────────────────
  useEffect(() => {
    const selected = images.filter((img) => img.selected)
    if (selected.length === 0) { setEstimatedBytes(null); return }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const sample = selected[0]
        const { dataUrl } = await compressImage(sample.file, rotations[sample.id] || 0, quality, sample.crop, filters[sample.id])
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
  }, [images, quality, rotations, filters])

  // ─── FILE INTAKE ────────────────────────────────────────────────────────
  // Identity is decided by SHA-256 of the file's actual bytes (see
  // hashFile in utils.ts), not name/size/lastModified — a re-uploaded
  // photo replaces its existing grid entry in place no matter what the
  // OS renamed it to; two different files are never confused just
  // because their metadata happens to match.
  const addFiles = useCallback((fileList: FileList | File[]) => {
    setConvertedFiles([])
    setSendNotice(null)
    setReconvertPrompt(null)
    const incomingErrors: ConvertError[] = []
    const candidates: File[] = []

    Array.from(fileList).forEach((file) => {
      if (!resolveFileType(file, ACCEPTED_TYPES)) {
        incomingErrors.push({ fileName: file.name, reason: "Unsupported type — JPG, PNG or WEBP only." })
        return
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        incomingErrors.push({ fileName: file.name, reason: `Over ${MAX_FILE_SIZE_MB}MB — try a smaller image.` })
        return
      }
      candidates.push(file)
    })

    if (candidates.length === 0) { setErrors(incomingErrors); return }

    ;(async () => {
      const hashed = await Promise.all(candidates.map(async (file) => ({ file, hash: await hashFile(file) })))

      const working = [...imagesRef.current]
      const toThumbnail: { id: string; file: File }[] = []
      const replacedIds: string[] = []
      let slotsLeft = MAX_FILES - working.length

      hashed.forEach(({ file, hash }) => {
        const existingIdx = working.findIndex((img) => img.hash === hash)
        if (existingIdx !== -1) {
          const existing = working[existingIdx]
          URL.revokeObjectURL(existing.previewUrl)
          working[existingIdx] = { ...existing, file, hash, previewUrl: URL.createObjectURL(file), selected: true, crop: undefined }
          replacedIds.push(existing.id)
          toThumbnail.push({ id: existing.id, file })
          return
        }
        if (slotsLeft <= 0) {
          incomingErrors.push({ fileName: file.name, reason: `Skipped — ${MAX_FILES} image limit reached.` })
          return
        }
        slotsLeft -= 1
        const id = `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`
        working.push({ id, file, hash, previewUrl: URL.createObjectURL(file), selected: true })
        toThumbnail.push({ id, file })
      })

      setImages(working)
      imagesRef.current = working

      if (replacedIds.length > 0) {
        // Re-uploaded content is treated as a fresh photo — rotation,
        // filter, and "already converted" status don't carry over.
        setRotations((prev) => { const next = { ...prev }; replacedIds.forEach((id) => { delete next[id] }); return next })
        setFilters((prev) => { const next = { ...prev }; replacedIds.forEach((id) => { delete next[id] }); return next })
        setConvertedIds((prev) => { const next = new Set(prev); replacedIds.forEach((id) => next.delete(id)); return next })
      }

      toThumbnail.forEach((item) => {
        generateThumbnail(item.file)
          .then((thumbUrl) => {
            setImages((prev) => prev.map((img) => {
              if (img.id !== item.id) return img
              URL.revokeObjectURL(img.previewUrl)
              return { ...img, previewUrl: thumbUrl }
            }))
          })
          .catch(() => {})
      })

      setErrors(incomingErrors)
    })()
  }, [])

  // ─── IMAGE ACTIONS ──────────────────────────────────────────────────────
  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.id !== id)
    })
    setRotations((prev) => { const { [id]: _d, ...rest } = prev; return rest })
    setFilters((prev) => { const { [id]: _f, ...rest } = prev; return rest })
    // A removed image's id could otherwise linger in convertedIds forever.
    setConvertedIds((prev) => { const next = new Set(prev); next.delete(id); return next })
  }

  const toggleSelect = (id: string) => setImages((p) => p.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)))
  const selectAll = (value: boolean) => setImages((p) => p.map((i) => ({ ...i, selected: value })))

  // Grid thumbnail must reflect what will actually be converted — crop,
  // rotation (when cropped — see rotateImage note below), and filter are
  // all passed explicitly by the caller rather than re-read off a
  // possibly-stale ref, so a preview never lags one state update behind.
  const regeneratePreview = useCallback(async (id: string, crop: CropRect | undefined, rotation: number, filter: ImageFilter) => {
    const target = imagesRef.current.find((img) => img.id === id)
    if (!target) return
    try {
      const thumbUrl = await generateCroppedPreview(target.file, crop, rotation, filter)
      setImages((prev) => prev.map((img) => {
        if (img.id !== id) return img
        URL.revokeObjectURL(img.previewUrl)
        return { ...img, previewUrl: thumbUrl }
      }))
    } catch {
      // Leave the existing preview in place rather than breaking the thumbnail.
    }
  }, [])

  // Rotation is normally shown via a CSS transform in the grid (cheap,
  // instant). It only gets BAKED into the thumbnail pixels here when the
  // image is cropped — because a quad/perspective crop's math depends on
  // rotation, the crop itself has to be redrawn. (image-grid.tsx applies
  // 0deg of CSS rotation for cropped images specifically to avoid double-
  // rotating an image that's already baked.)
  const rotateImage = (id: string) => {
    const next = ((rotations[id] || 0) + 90) % 360
    setRotations((p) => ({ ...p, [id]: next }))
    const target = imagesRef.current.find((img) => img.id === id)
    if (target?.crop) regeneratePreview(id, target.crop, next, filters[id] || "none")
  }

  const resetRotation = (id: string) => {
    setRotations((p) => ({ ...p, [id]: 0 }))
    const target = imagesRef.current.find((img) => img.id === id)
    if (target?.crop) regeneratePreview(id, target.crop, 0, filters[id] || "none")
  }

  const setCrop = (id: string, crop: CropRect | undefined) => {
    setImages((p) => p.map((i) => (i.id === id ? { ...i, crop } : i)))
    regeneratePreview(id, crop, rotations[id] || 0, filters[id] || "none")
  }

  // Filter changes always bake through the canvas (grayscale/B&W/sepia
  // aren't representable as a simple CSS transform on the thumbnail).
  // Rotation is only baked alongside it if the image is also cropped —
  // otherwise the uncropped thumbnail keeps rotating live via CSS.
  const setFilter = (id: string, filter: ImageFilter) => {
    setFilters((p) => ({ ...p, [id]: filter }))
    const target = imagesRef.current.find((img) => img.id === id)
    if (!target) return
    const bakedRotation = target.crop ? (rotations[id] || 0) : 0
    regeneratePreview(id, target.crop, bakedRotation, filter)
  }

  const retryImage = async (id: string) => {
    const target = images.find((img) => img.id === id)
    if (!target) return
    setRetryingIds((prev) => new Set([...prev, id]))
    try {
      await compressImage(target.file, rotations[id] || 0, quality, target.crop, filters[id])
      setErrors((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setErrors((prev) => [
        ...prev.filter((e) => e.id !== id),
        { fileName: target.file.name, id, reason: "Still can't read this image. Try re-saving or re-exporting the photo, then re-upload it." },
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
    setFilters({})
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
            const { dataUrl, width, height } = await compressImage(file, rotations[id] || 0, quality, crop, filters[id])
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
            const { dataUrl, width, height } = await compressImage(file, rotations[id] || 0, quality, crop, filters[id])
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
      if (succeededIds.length > 0) setConvertedIds((prev) => new Set([...prev, ...succeededIds]))

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
    rotations, filters, isConverting, progress, errors, convertedFiles, convertedIds, reconvertPrompt,
    sendNotice, history, selectedCount, estimatedBytes, retryingIds,
    addFiles, removeImage, toggleSelect, selectAll, rotateImage, resetRotation, setCrop, setFilter, retryImage, reorder,
    clearAll, requestConvert, resolveReconvert, handleSend, clearRecents,
  }
          } 
