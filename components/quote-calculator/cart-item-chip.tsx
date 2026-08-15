// components/quote-calculator/cart-item-chip.tsx
"use client"

import { X, Minus, Plus } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
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
        "shrink-0 flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-full border-l-[3px] snap-start bg-white dark:bg-zinc-800 transition-all duration-300 ease-out motion-reduce:transition-none",
        isHighlighted && "ring-2 scale-[1.03]"
      )}
      style={{
        borderLeftColor: accent,
        // ── Pop-out shadow: accent-tinted alpha glow so it lifts off the
        // background in both light and dark mode, not just a flat black shadow ──
        boxShadow: `0 4px 12px -2px ${accent}40, 0 2px 6px -1px rgba(0,0,0,0.18)`,
        ...(isHighlighted ? { ["--tw-ring-color" as any]: accent } : {}),
      }}
    >
      <div className="flex flex-col leading-tight min-w-0 max-w-[104px]">
        <span className="text-[0.7rem] font-black text-zinc-800 dark:text-zinc-200 truncate">{displayName}</span>
        <span className="text-[0.64rem] font-bold" style={{ color: accent }}>R{lineTotal}</span>
      </div>

      <div className="flex items-center rounded-full overflow-hidden bg-black/5 dark:bg-white/10 shrink-0">
        <button
          onClick={() => onClickStep(item.id, -1)}
          onPointerDown={() => onPressStart(item.id, -1)}
          onPointerUp={() => onPressEnd(item.id)}
          onPointerLeave={() => onPressEnd(item.id)}
          onPointerCancel={() => onPressEnd(item.id)}
          aria-label={`Decrease quantity for ${displayName}`}
          className="w-7 h-7 flex items-center justify-center active:bg-black/10 dark:active:bg-white/20 transition-colors duration-150 select-none touch-none"
        >
          <Minus size={11} weight="bold" aria-hidden="true" />
        </button>
        <span className="text-[0.68rem] font-black w-4 text-center text-zinc-800 dark:text-zinc-100" aria-label={`Quantity ${qty}`}>{qty}</span>
        <button
          onClick={() => onClickStep(item.id, 1)}
          onPointerDown={() => onPressStart(item.id, 1)}
          onPointerUp={() => onPressEnd(item.id)}
          onPointerLeave={() => onPressEnd(item.id)}
          onPointerCancel={() => onPressEnd(item.id)}
          aria-label={`Increase quantity for ${displayName}`}
          className="w-7 h-7 flex items-center justify-center active:bg-black/10 dark:active:bg-white/20 transition-colors duration-150 select-none touch-none"
        >
          <Plus size={11} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${displayName} from quote`}
        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 shrink-0 transition-colors duration-150"
      >
        <X size={12} weight="bold" aria-hidden="true" />
      </button>
    </div>
  )
} 
