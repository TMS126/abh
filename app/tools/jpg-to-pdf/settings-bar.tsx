// app/tools/jpg-to-pdf/settings-bar.tsx
"use client"

import { SimpleDropdown } from "@/components/ui/simple-dropdown"
import { PAGE_SIZES, QUALITY_VALUES, MODE_LABELS } from "./constants"
import type { ConvertMode, PageSize, QualityPreset } from "./types"

export function SettingsBar({
  mode, setMode, pageSize, setPageSize, qualityPreset, setQualityPreset, accentColor,
}: {
  mode: ConvertMode
  setMode: (m: ConvertMode) => void
  pageSize: PageSize
  setPageSize: (p: PageSize) => void
  qualityPreset: QualityPreset
  setQualityPreset: (q: QualityPreset) => void
  accentColor: string
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <SimpleDropdown
        label="Output"
        value={mode}
        accentColor={accentColor}
        onChange={(v) => setMode(v as ConvertMode)}
        options={(Object.keys(MODE_LABELS) as ConvertMode[]).map((key) => ({ value: key, label: MODE_LABELS[key] }))}
      />
      <SimpleDropdown
        label="Size"
        value={pageSize}
        accentColor={accentColor}
        onChange={(v) => setPageSize(v as PageSize)}
        options={(Object.keys(PAGE_SIZES) as PageSize[]).map((key) => ({ value: key, label: PAGE_SIZES[key].label }))}
      />
      <SimpleDropdown
        label="Quality"
        value={qualityPreset}
        accentColor={accentColor}
        onChange={(v) => setQualityPreset(v as QualityPreset)}
        options={(Object.keys(QUALITY_VALUES) as QualityPreset[]).map((key) => ({ value: key, label: QUALITY_VALUES[key].label }))}
      />
    </div>
  )
} 
