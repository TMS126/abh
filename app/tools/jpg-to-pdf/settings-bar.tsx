// app/tools/jpg-to-pdf/settings-bar.tsx
"use client"

import { SimpleDropdown } from "@/components/ui/simple-dropdown"
import { PAGE_SIZES, MODE_LABELS } from "./constants"
import { qualityLabel, formatBytes } from "./utils"
import type { ConvertMode, PageSize } from "./types"

export function SettingsBar({
  mode, setMode, pageSize, setPageSize, quality, setQuality, originalBytes, estimatedBytes, accentColor,
}: {
  mode: ConvertMode
  setMode: (m: ConvertMode) => void
  pageSize: PageSize
  setPageSize: (p: PageSize) => void
  quality: number
  setQuality: (q: number) => void
  originalBytes: number | null
  estimatedBytes: number | null
  accentColor: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
        <SimpleDropdown
          label="Output" value={mode} accentColor={accentColor}
          onChange={(v) => setMode(v as ConvertMode)}
          options={(Object.keys(MODE_LABELS) as ConvertMode[]).map((key) => ({ value: key, label: MODE_LABELS[key] }))}
        />
        <SimpleDropdown
          label="Size" value={pageSize} accentColor={accentColor}
          onChange={(v) => setPageSize(v as PageSize)}
          options={(Object.keys(PAGE_SIZES) as PageSize[]).map((key) => ({ value: key, label: PAGE_SIZES[key].label }))}
        />
      </div>

      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="quality-slider" className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Quality</label>
          <span className="text-sm font-bold" style={{ color: accentColor }}>{qualityLabel(quality)}</span>
        </div>
        <input
          id="quality-slider"
          type="range"
          min={0.4}
          max={0.95}
          step={0.05}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          aria-valuetext={qualityLabel(quality)}
          className="w-full"
          style={{ accentColor }}
        />
        <div className="flex justify-between text-[0.7rem] text-zinc-400 mt-1">
          <span>Smaller file</span>
          <span>High quality</span>
        </div>
        {originalBytes !== null && (
          <p className="text-xs text-zinc-400 mt-2.5 text-center" aria-live="polite">
            Original {formatBytes(originalBytes)} → Estimated {estimatedBytes !== null ? formatBytes(estimatedBytes) : "…"}
          </p>
        )}
      </div>
    </div>
  )
} 
