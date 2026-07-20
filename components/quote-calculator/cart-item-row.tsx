"use client"

import { Trash, Minus, Plus } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { HUBS } from "@/lib/data"
import { GLASS } from "./shared"
import { CartItem, getDisplayName, getEffectiveRate, getBulkHint } from "./lib"

interface CartItemRowProps {
  item: CartItem
  accent: string
  isHighlighted: boolean
  qtyInputRef: (el: HTMLInputElement | null) => void
  onRemove: (id: string) => void
  onClickStep: (id: string, delta: number) => void
  onPressStart: (id: string, delta: number) => void
  onPressEnd: (id: string) => void
  onQtyDraft: (id: string, raw: string) => void
  onQtyBlur: (id: string, qty: number) => void
}

export function CartItemRow({
  item, accent, isHighlighted, qtyInputRef,
  onRemove, onClickStep, onPressStart, onPressEnd, onQtyDraft, onQtyBlur,
}: CartItemRowProps) {
  const qty = item.qty || 1
  const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
  const lineTotal = effRate * qty
  const discounted = effRate < item.unitPrice
  const hint = getBulkHint(item.id, item.name, qty, effRate, item.unitPrice)
  const displayName = `${getDisplayName(item.sectionTitle, item.name)} - ${item.sectionTitle}`
  const hubLabel = HUBS[item.hubId].title

  return (
    <div
      className={cn(
        "p-3 rounded-[14px] shadow-sm space-y-2 transition-all duration-300 ease-out motion-reduce:transition-none",
        GLASS.item,
        isHighlighted && "ring-2 scale-[1.02]"
      )}
      style={isHighlighted ? { ["--tw-ring-color" as any]: accent } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{displayName}</p>
          <p className="text-[0.62rem] font-bold mt-0.5" style={{ color: accent }}>{hubLabel}</p>
        </div>
        <button onClick={() => onRemove(item.id)} className="text-zinc-400 hover:text-red-500 shrink-0 transition-colors duration-150">
          <Trash size={14} weight="bold" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs">
        {discounted && <span className="text-red-400 line-through">R{item.unitPrice}{item.unit ? `/${item.unit}` : ""}</span>}
        <span className="font-bold text-zinc-700 dark:text-zinc-200" style={{ color: discounted ? accent : undefined }}>R{effRate}{item.unit ? `/${item.unit}` : ""}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onClickStep(item.id, -1)}
            onPointerDown={() => onPressStart(item.id, -1)}
            onPointerUp={() => onPressEnd(item.id)}
            onPointerLeave={() => onPressEnd(item.id)}
            onPointerCancel={() => onPressEnd(item.id)}
            className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150 select-none touch-none", GLASS.btn)}
          >
            <Minus size={12} weight="bold" />
          </button>
          <input
            ref={qtyInputRef}
            type="number" min={1}
            value={item.qty === 0 ? "" : item.qty}
            onChange={e => onQtyDraft(item.id, e.target.value)}
            onBlur={() => onQtyBlur(item.id, item.qty)}
            placeholder="1"
            aria-label={`Quantity for ${displayName}`}
            className="w-10 text-center text-xs font-black bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100"
          />
          <button
            onClick={() => onClickStep(item.id, 1)}
            onPointerDown={() => onPressStart(item.id, 1)}
            onPointerUp={() => onPressEnd(item.id)}
            onPointerLeave={() => onPressEnd(item.id)}
            onPointerCancel={() => onPressEnd(item.id)}
            className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150 select-none touch-none", GLASS.btn)}
          >
            <Plus size={12} weight="bold" />
          </button>
        </div>
        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">R{lineTotal}</span>
      </div>
      {hint && (
        <p className={cn("text-[0.6rem] font-bold", discounted ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")}>{hint}</p>
      )}
    </div>
  )
}
