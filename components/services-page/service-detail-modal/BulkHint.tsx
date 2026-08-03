"use client"

import { Tag } from "@phosphor-icons/react"
import { getContrastText } from "@/lib/color"

// Discount-type pill (defaults to "Bulk Deal" — the label is a prop so
// any future discount type can reuse this same component with different
// wording) sits centered above the live "Add X more..." hint, which stays
// in the hub's soft accent tint as before.
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
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider"
        style={{ backgroundColor: accent, color: labelTextColor }}
      >
        <Tag size={11} weight="fill" aria-hidden="true" />
        {label}
      </span>

      <div
        className="inline-flex items-center px-3 py-1.5 rounded-full text-[0.8rem] font-bold text-center"
        style={{ backgroundColor: `${accent}14`, color: accent }}
      >
        {hint}
      </div>

      {isDiscount && (
        <p className="text-[0.82rem] font-medium text-zinc-400 dark:text-zinc-500">
          <span className="line-through">R{baseUnitPrice}{priceUnit ? `/${priceUnit}` : ""}</span>
          {" → "}
          <span className="font-black" style={{ color: accent }}>R{effRate}{priceUnit ? `/${priceUnit}` : ""}</span>
          {" each"}
        </p>
      )}
    </div>
  )
}