"use client"

import { Tag } from "@phosphor-icons/react"
import { getContrastText } from "@/lib/color"

// Compact inline bulk hint — merged pill like before but kept strictly
// one-line/two-column so it never grows the height of the parent when it
// appears. Removes vertical animation that caused the add/quoted block to
// jump when the hint mounted.
export function BulkHint({
  hint, accent, isDiscount, baseUnitPrice, effRate, priceUnit, label = "Bulk Deal",
}: {
  hint: string; accent: string; isDiscount: boolean
  baseUnitPrice: number; effRate: number; priceUnit: string | null
  label?: string
}) {
  const labelTextColor = getContrastText(accent)

  return (
    <div className="inline-flex items-center gap-2 px-1">
      <div className="inline-flex items-stretch rounded-full overflow-hidden shadow-sm">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-wider whitespace-nowrap"
          style={{ backgroundColor: accent, color: labelTextColor }}
        >
          <Tag size={11} weight="fill" aria-hidden="true" />
          {label}
        </span>
        <span
          className="inline-flex items-center px-3 py-1.5 text-[0.8rem] font-bold text-center"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          {hint}
        </span>
      </div>

      {/* Price indicator shown inline to avoid changing layout height when
          the hint appears. Keeps a consistent single-line footprint. */}
      {isDiscount && (
        <span className="text-[0.78rem] font-medium text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
          <span className="line-through mr-1">R{baseUnitPrice}{priceUnit ? `/${priceUnit}` : ""}</span>
          <span className="font-black" style={{ color: accent }}>R{effRate}{priceUnit ? `/${priceUnit}` : ""}</span>
          <span className="ml-1 text-[0.75rem] text-zinc-400 dark:text-zinc-500">each</span>
        </span>
      )}
    </div>
  )
}
