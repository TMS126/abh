"use client"

import { useState } from "react"
import { ShoppingCartSimple, Plus, Minus } from "@phosphor-icons/react"

export function QuoteControl({
  inQuote, quoteQty, accent, neutralIconColor, onAdd, onStep,
}: {
  inQuote: boolean; quoteQty: number; accent: string; neutralIconColor: string
  onAdd: () => void; onStep: (delta: number) => void
}) {
  const [pressed, setPressed] = useState(false)

  if (!inQuote) {
    return (
      <button
        type="button"
        onClick={onAdd}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        className="flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-[14px] font-bold text-[0.84rem] transition-all duration-150"
        style={{
          backgroundColor: `${accent}18`,
          color: accent,
          boxShadow: pressed
            ? "inset 0 2px 6px -1px rgba(0,0,0,0.22), inset 0 1px 3px -1px rgba(0,0,0,0.14)"
            : "0 2px 8px -2px rgba(0,0,0,0.12), 0 1px 3px -1px rgba(0,0,0,0.08)",
          transform: pressed ? "translateY(1px) scale(0.97)" : "translateY(0) scale(1)",
        }}
      >
        <ShoppingCartSimple size={18} weight="bold" aria-hidden="true" />
        Add to Quote
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-[14px] py-2 px-2.5" style={{ backgroundColor: "#22c55e10", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.12)" }}>
      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-label="Remove one from quote"
        className="group w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0 transition-colors duration-150 hover:bg-red-500 active:scale-90"
      >
        <Minus size={14} weight="bold" style={{ color: neutralIconColor }} className="transition-colors duration-150 group-hover:!text-white" />
      </button>

      <span className="flex items-center gap-1.5 text-[0.94rem] font-black text-green-600 dark:text-green-400">
        Added
        <span className="text-[0.78rem] font-black px-2 py-0.5 rounded-full bg-green-500/15">{quoteQty}</span>
      </span>

      <button
        type="button"
        onClick={() => onStep(1)}
        aria-label="Add one more to quote"
        className="group w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center shrink-0 transition-colors duration-150 hover:bg-green-500 active:scale-90"
      >
        <Plus size={14} weight="bold" style={{ color: neutralIconColor }} className="transition-colors duration-150 group-hover:!text-white" />
      </button>
    </div>
  )
} 
