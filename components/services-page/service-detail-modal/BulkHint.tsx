"use client"

// "Add X more to unlock…" hint, shown as a small tinted pill in the
// hub's own accent — muted/dim the same way the Quote stepper looks
// once an item's been added (soft accent tint, no hard border). No
// percent icon here; that lives on the neutral "Bulk" badges elsewhere
// on the page — this is a live contextual hint, not a static label.
export function BulkHint({ hint, accent, isDiscount, baseUnitPrice, effRate, priceUnit }: {
  hint: string; accent: string; isDiscount: boolean
  baseUnitPrice: number; effRate: number; priceUnit: string | null
}) {
  return (
    <div className="animate-in fade-in duration-200 space-y-1.5 px-1">
      <div
        className="inline-flex items-center px-3 py-1.5 rounded-full text-[0.8rem] font-bold"
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
