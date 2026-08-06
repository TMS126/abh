"use client"

import { Tag } from "@phosphor-icons/react"
import { getContrastText } from "@/lib/color"

// Merged into a single pill — solid-accent label half + soft-accent-tint
// hint half, sitting flush against each other instead of stacked as two
// separate pills. Each half keeps its own original coloring (solid fill
// for the label, ${accent}14 tint for the hint) — only the layout changed.
export function BulkHint({
  hint, accent, isDiscount, baseUnitPrice, effRate, priceUnit, label = "Bulk Deal",
}: {
  hint: string; accent: string; isDiscount: boolean
  baseUnitPrice: number; effRate: number; priceUnit: string | null
  label?: string
}) {
  const labelTextColor = getContrastText(accent)

  return (
    <div className="animate-in fade-in duration-200 flex flex-col items-center gap-2 px-1">
      <div className="inline-flex items-stretch rounded-full overflow-hidden shadow-sm">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-wider"
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

      {isDiscount && (
        <p className="text-[0.82rem] font-medium text-zinc-400 dark:text-zinc-500 text-center">
          <span className="line-through">R{baseUnitPrice}{priceUnit ? `/${priceUnit}` : ""}</span>
          {" → "}
          <span className="font-black" style={{ color: accent }}>R{effRate}{priceUnit ? `/${priceUnit}` : ""}</span>
          {" each"}
        </p>
      )}
    </div>
  )
}
