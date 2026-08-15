// components/quote-calculator/cart-item-card.tsx
"use client"

import { Trash, Minus, Plus } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { HUBS } from "@/lib/data"
import { CartItem, getDisplayName, getEffectiveRate, getBulkHint, getBulkProgress } from "./lib"

interface CartItemCardProps {
  item: CartItem
  accent: string
  isHighlighted: boolean
  cardRef?: (el: HTMLDivElement | null) => void
  onRemove: (id: string) => void
  onClickStep: (id: string, delta: number) => void
  onPressStart: (id: string, delta: number) => void
  onPressEnd: (id: string) => void
}

export function CartItemCard({
  item, accent, isHighlighted, cardRef,
  onRemove, onClickStep, onPressStart, onPressEnd,
}: CartItemCardProps) {
  const qty = item.qty || 1
  const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
  const lineTotal = effRate * qty
  const discounted = effRate < item.unitPrice
  const hint = getBulkHint(item.id, item.name, qty, effRate, item.unitPrice, item.unit)
  const progress = getBulkProgress(item.id, item.name, qty)
  const displayName = `${getDisplayName(item.sectionTitle, item.name)} - ${item.sectionTitle}`
  const hubLabel = HUBS[item.hubId].title

  return (
    <div
      ref={cardRef}
      role="listitem"
      className={cn(
        "shrink-0 w-[230px] p-3.5 rounded-[16px] snap-start bg-white dark:bg-zinc-800 space-y-2 transition-all duration-300 ease-out motion-reduce:transition-none",
        isHighlighted && "ring-2 scale-[1.02]"
      )}
      style={{
        boxShadow: `0 6px 16px -3px ${accent}40, 0 3px 8px -2px rgba(0,0,0,0.18)`,
        ...(isHighlighted ? { ["--tw-ring-color" as any]: accent } : {}),
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 leading-tight">{displayName}</p>
          <p className="text-[0.62rem] font-bold mt-0.5" style={{ color: accent }}>{hubLabel}</p>
        </div>
        <button onClick={() => onRemove(item.id)} aria-label={`Remove ${displayName} from quote`} className="text-zinc-400 hover:text-red-500 shrink-0 transition-colors duration-150">
          <Trash size={14} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {discounted && <span className="text-red-400 line-through">R{item.unitPrice}{item.unit ? `/${item.unit}` : ""}</span>}
        <span className="font-bold text-zinc-700 dark:text-zinc-200" style={{ color: discounted ? accent : undefined }}>R{effRate}{item.unit ? `/${item.unit}` : ""}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center rounded-full overflow-hidden bg-black/5 dark:bg-white/10">
          <button
            onClick={() => onClickStep(item.id, -1)}
            onPointerDown={() => onPressStart(item.id, -1)}
            onPointerUp={() => onPressEnd(item.id)}
            onPointerLeave={() => onPressEnd(item.id)}
            onPointerCancel={() => onPressEnd(item.id)}
            aria-label={`Decrease quantity for ${displayName}`}
            className="w-9 h-9 flex items-center justify-center active:bg-black/10 dark:active:bg-white/20 transition-colors duration-150 select-none touch-none"
          >
            <Minus size={13} weight="bold" aria-hidden="true" />
          </button>
          <span className="text-xs font-black w-6 text-center text-zinc-800 dark:text-zinc-100" aria-label={`Quantity ${qty}`}>{qty}</span>
          <button
            onClick={() => onClickStep(item.id, 1)}
            onPointerDown={() => onPressStart(item.id, 1)}
            onPointerUp={() => onPressEnd(item.id)}
            onPointerLeave={() => onPressEnd(item.id)}
            onPointerCancel={() => onPressEnd(item.id)}
            aria-label={`Increase quantity for ${displayName}`}
            className="w-9 h-9 flex items-center justify-center active:bg-black/10 dark:active:bg-white/20 transition-colors duration-150 select-none touch-none"
          >
            <Plus size={13} weight="bold" aria-hidden="true" />
          </button>
        </div>
        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">R{lineTotal}</span>
      </div>

      {progress?.showDots && (
        <div className="flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: progress.target }).map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: i < progress.current ? accent : `${accent}30` }}
            />
          ))}
          <span className="text-[0.6rem] font-black ml-1" style={{ color: accent }}>
            {progress.current}/{progress.target}
          </span>
        </div>
      )}

      {hint && (
        <p className={cn("text-[0.62rem] font-bold leading-snug", discounted ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")} role="status">
          {hint}
        </p>
      )}
    </div>
  )
}
