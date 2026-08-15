// components/quote-calculator/cart-item-chip.tsx
"use client"

import { X, Minus, Plus } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { GLASS } from "./shared"
import { CartItem, getDisplayName, getEffectiveRate } from "./lib"

interface CartItemChipProps {
  item: CartItem
  accent: string
  isHighlighted: boolean
  onRemove: (id: string) => void
  onClickStep: (id: string, delta: number) => void
  onPressStart: (id: string, delta: number) => void
  onPressEnd: (id: string) => void
  chipRef?: (el: HTMLDivElement | null) => void
}

export function CartItemChip({
  item, accent, isHighlighted, onRemove, onClickStep, onPressStart, onPressEnd, chipRef,
}: CartItemChipProps) {
  const qty = item.qty || 1
  const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
  const lineTotal = effRate * qty
  const displayName = getDisplayName(item.sectionTitle, item.name)

  return (
    <div
      ref={chipRef}
      role="listitem"
      className={cn(
        "shrink-0 flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full border-l-[3px] shadow-sm snap-start transition-all duration-300 ease-out motion-reduce:transition-none",
        GLASS.item,
        isHighlighted && "ring-2 scale-[1.03]"
      )}
      style={{
        borderLeftColor: accent,
        ...(isHighlighted ? { ["--tw-ring-color" as any]: accent } : {}),
      }}
    >
      <div className="flex flex-col leading-tight min-w-0 max-w-[92px]">
        <span className="text-[0.68rem] font-black text-zinc-800 dark:text-zinc-200 truncate">{displayName}</span>
        <span className="text-[0.62rem] font-bold" style={{ color: accent }}>R{lineTotal}</span>
      </div>

      <div className="flex items-center rounded-full overflow-hidden bg-black/5 dark:bg-white/10 shrink-0">
        <button
          onClick={() => onClickStep(item.id, -1)}
          onPointerDown={() => onPressStart(item.id, -1)}
          onPointerUp={() => onPressEnd(item.id)}
          onPointerLeave={() => onPressEnd(item.id)}
          onPointerCancel={() => onPressEnd(item.id)}
          aria-label={`Decrease quantity for ${displayName}`}
          className="w-6 h-6 flex items-center justify-center active:bg-black/10 dark:active:bg-white/20 transition-colors duration-150 select-none touch-none"
        >
          <Minus size={10} weight="bold" aria-hidden="true" />
        </button>
        <span className="text-[0.65rem] font-black w-4 text-center text-zinc-800 dark:text-zinc-100" aria-label={`Quantity ${qty}`}>{qty}</span>
        <button
          onClick={() => onClickStep(item.id, 1)}
          onPointerDown={() => onPressStart(item.id, 1)}
          onPointerUp={() => onPressEnd(item.id)}
          onPointerLeave={() => onPressEnd(item.id)}
          onPointerCancel={() => onPressEnd(item.id)}
          aria-label={`Increase quantity for ${displayName}`}
          className="w-6 h-6 flex items-center justify-center active:bg-black/10 dark:active:bg-white/20 transition-colors duration-150 select-none touch-none"
        >
          <Plus size={10} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${displayName} from quote`}
        className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-500 shrink-0 transition-colors duration-150"
      >
        <X size={11} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
} 
