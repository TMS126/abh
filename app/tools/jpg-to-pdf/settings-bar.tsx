// app/tools/jpg-to-pdf/settings-bar.tsx
"use client"

import { SimpleDropdown } from "@/components/ui/simple-dropdown"
import { BRAND } from "@/lib/brand"
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
      {/* ─── OUTPUT / SIZE DROPDOWNS ────────────────────────────────────── */}
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

      {/* ─── QUALITY SLIDER ─────────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="quality-slider" className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">Quality</label>
          <span className="text-sm font-bold" style={{ color: accentColor }}>{qualityLabel(quality)}</span>
        </div>

        {/* Track/thumb colors are set as CSS custom properties from the
            real BRAND.green / BRAND.orange hex values, then referenced
            via Tailwind's arbitrary-value bracket syntax
            (bg-[var(--slider-track)]) — this bypasses any dependency on
            "brand-green"/"brand-orange" existing as registered Tailwind
            theme colors, which was the likely cause of the dim/dead
            look if those names weren't defined in the config. */}
        <input
          id="quality-slider"
          type="range"
          min={0.4}
          max={0.95}
          step={0.05}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          aria-label="Conversion quality"
          aria-valuetext={qualityLabel(quality)}
          style={{ "--slider-track": BRAND.green, "--slider-thumb": BRAND.orange } as React.CSSProperties}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[var(--slider-track)]
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--slider-thumb)] [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--slider-track)]
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--slider-thumb)]
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
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
