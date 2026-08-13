// app/tools/jpg-to-pdf/use-jpg-to-pdf.ts
"use client"

import { useState, useCallback, useEffect } from "react"
import { jsPDF } from "jspdf"
import { BIZ, HUB_NAMES, waLink, type HubKey } from "@/lib/brand"
import { ACCEPTED_TYPES, MAX_FILES, MAX_FILE_SIZE_MB, PAGE_SIZES, QUALITY_VALUES } from "./constants"
import { buildMergedFileName, buildSeparateFileName, compressImage, fitToPage, loadHistory, saveHistory, clearHistory } from "./utils"
import type { ImageItem, ConvertMode, PageSize, QualityPreset, ConvertError, ConvertedFile, HistoryEntry, ReconvertPrompt } from "./types"

export function useJpgToPdf() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [mode, setMode] = useState<ConvertMode>("merge")
  const [pageSize, setPageSize] = useState<PageSize>("a4")
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>("balanced")
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

  useEffect(() => setHistory(loadHistory()), [])

  const quality = QUALITY_VALUES[qualityPreset].value

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      setConvertedFiles([])
      setSendNotice(null)
      setReconvertPrompt(null)
      const incomingErrors: ConvertError[] = []
      const accepted: ImageItem[] = []
      let slotsLeft = MAX_FILES - images.length

      Array.from(fileList).forEach((file) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          incomingErrors.push({ fileName: file.name, reason: "Unsupported type — JPG and PNG only." })
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
    },
    [images.length]
  )

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.id !== id)
    })
    setRotations((prev) => {
      const { [id]: _drop, ...rest } = prev
      return rest
    })
  }

  const toggleSelect = (id: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img)))
  }

  const selectAll = (value: boolean) => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: value })))
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

  const rotateImage = (id: string) => {
    setRotations((prev) => ({ ...prev, [id]: ((prev[id] || 0) + 90) % 360 }))
  }

  const reorder = (from: number, to: number) => {
    if (from === to) return
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
          const { id, file } = targets[i]
          try {
            const { dataUrl, width, height } = await compressImage(file, rotations[id] || 0, quality)
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
          const fileName = buildMergedFileName()
          triggerDownload(blob, fileName)
          results.push({ fileName, blob, sourceIds: targets.map((t) => t.id) })
        }
      } else {
        for (let i = 0; i < targets.length; i++) {
          const { id, file } = targets[i]
          try {
            const { dataUrl, width, height } = await compressImage(file, rotations[id] || 0, quality)
            const { x, y, renderW, renderH } = fitToPage(width, height, PAGE_SIZES[pageSize])
            const pdf = new jsPDF({ unit: "mm", format: [PAGE_SIZES[pageSize].w, PAGE_SIZES[pageSize].h] })
            pdf.addImage(dataUrl, "JPEG", x, y, renderW, renderH)
            const blob = pdf.output("blob") as Blob
            const fileName = buildSeparateFileName(file.name, usedNames)
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
    const ids = choice === "all"
      ? selected.map((img) => img.id)
      : selected.filter((img) => !convertedIds.has(img.id)).map((img) => img.id)
    if (ids.length > 0) runConvert(ids)
  }

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
        // user cancelled — fall through to WhatsApp fallback
      }
    }

    window.open(waLink(message), "_blank", "noopener,noreferrer")
    setSendNotice(`WhatsApp opened — attach "${file.fileName}" before sending to ${hubLabel}.`)
  }

  const clearRecents = () => {
    clearHistory()
    setHistory([])
  }

  const selectedCount = images.filter((img) => img.selected).length

  return {
    images, mode, setMode, pageSize, setPageSize, qualityPreset, setQualityPreset,
    rotations, isConverting, progress, errors, convertedFiles, convertedIds, reconvertPrompt,
    selectedHub, setSelectedHub, sendNotice, history, selectedCount,
    addFiles, removeImage, toggleSelect, selectAll, moveImage, rotateImage, reorder,
    clearAll, requestConvert, resolveReconvert, handleSendToHub, clearRecents,
  }
}
