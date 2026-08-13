// app/tools/jpg-to-pdf/results-panel.tsx
"use client"

import { useState, useEffect } from "react"
import { CheckCircle, PaperPlaneTilt, Plus } from "@phosphor-icons/react"
import { HUB_NAMES, type HubKey } from "@/lib/brand"
import { SimpleDropdown } from "@/components/ui/simple-dropdown"
import { SENDABLE_HUBS } from "./constants"
import type { ConvertedFile } from "./types"

export function ResultsPanel({
  convertedFiles, selectedHub, setSelectedHub, sendNotice, accentColor, onSend, onAddMore,
}: {
  convertedFiles: ConvertedFile[]
  selectedHub: HubKey
  setSelectedHub: (h: HubKey) => void
  sendNotice: string | null
  accentColor: string
  onSend: (file: ConvertedFile) => void
  onAddMore: () => void
}) {
  const [fileName, setFileName] = useState(convertedFiles[0]?.fileName || "")

  useEffect(() => {
    if (convertedFiles.length > 0) setFileName(convertedFiles[0].fileName)
  }, [convertedFiles])

  if (convertedFiles.length === 0) return null
  const activeFile = convertedFiles.find((f) => f.fileName === fileName) || convertedFiles[0]

  return (
    <div className="mt-8 abh-card p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <CheckCircle weight="fill" className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
        <span className="text-sm font-black text-green-700 dark:text-green-300">
          {convertedFiles.length} PDF{convertedFiles.length > 1 ? "s" : ""} downloaded
        </span>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">Want help with this? Send it to a Hub.</p>

      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {convertedFiles.length > 1 && (
          <SimpleDropdown
            label="File"
            value={fileName}
            accentColor={accentColor}
            onChange={setFileName}
            options={convertedFiles.map((f) => ({ value: f.fileName, label: f.fileName }))}
          />
        )}
        <SimpleDropdown
          label="Hub"
          value={selectedHub}
          accentColor={accentColor}
          onChange={(v) => setSelectedHub(v as HubKey)}
          options={SENDABLE_HUBS.map((hub) => ({ value: hub, label: HUB_NAMES[hub] }))}
        />
      </div>

      <div className="flex flex-col gap-2 max-w-[320px] mx-auto">
        <button
          type="button"
          onClick={() => onSend(activeFile)}
          className="flex items-center justify-center gap-2 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-brand-blue hover:text-brand-blue transition-colors"
        >
          <PaperPlaneTilt weight="fill" className="w-4 h-4" aria-hidden="true" />
          Send to {HUB_NAMES[selectedHub]}
        </button>
        <button type="button" onClick={onAddMore} className="abh-btn-primary justify-center py-2.5 px-4 font-semibold">
          <Plus size={16} weight="bold" aria-hidden="true" />
          Add more photos
        </button>
      </div>

      {sendNotice && <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400" aria-live="polite">{sendNotice}</p>}
    </div>
  )
}
