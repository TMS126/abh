// app/tools/jpg-to-pdf/results-panel.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, PaperPlaneTilt, Plus, DownloadSimple } from "@phosphor-icons/react"
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
  useEffect(() => { if (convertedFiles.length > 0) setFileName(convertedFiles[0].fileName) }, [convertedFiles])

  return (
    <AnimatePresence>
      {convertedFiles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-8 abh-card p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle weight="fill" className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
            <span className="text-sm font-black text-green-700 dark:text-green-300">
              {convertedFiles.length} file{convertedFiles.length > 1 ? "s" : ""} converted
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mb-6">
            <DownloadSimple size={13} weight="bold" aria-hidden="true" />
            Saved to your device automatically
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {convertedFiles.length > 1 && (
              <SimpleDropdown label="File" value={fileName} accentColor={accentColor} onChange={setFileName}
                options={convertedFiles.map((f) => ({ value: f.fileName, label: f.fileName }))} />
            )}
            <SimpleDropdown label="Hub" value={selectedHub} accentColor={accentColor}
              onChange={(v) => setSelectedHub(v as HubKey)}
              options={SENDABLE_HUBS.map((hub) => ({ value: hub, label: HUB_NAMES[hub] }))} />
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-w-[380px] mx-auto">
            <button
              type="button"
              onClick={() => onSend(convertedFiles.find((f) => f.fileName === fileName) || convertedFiles[0])}
              className="col-span-2 flex items-center justify-center gap-2 rounded-[12px] py-3 px-4 text-sm font-black text-white transition-transform active:scale-[0.98]"
              style={{ backgroundColor: accentColor }}
            >
              <PaperPlaneTilt weight="fill" className="w-4 h-4" aria-hidden="true" />
              Send to ApexbytesHub · {HUB_NAMES[selectedHub]}
            </button>
            <button
              type="button"
              onClick={onAddMore}
              className="col-span-2 flex items-center justify-center gap-2 rounded-[12px] border border-zinc-200 dark:border-zinc-800 py-2.5 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              <Plus size={16} weight="bold" aria-hidden="true" />
              Add more photos
            </button>
          </div>

          {sendNotice && <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400" aria-live="polite">{sendNotice}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  )
              } 
