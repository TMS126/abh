// components/ui/simple-dropdown.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { CaretDown, Check } from "@phosphor-icons/react"

export interface DropdownOption {
  value: string
  label: string
}

export function SimpleDropdown({
  label, value, options, onChange, accentColor,
}: {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  accentColor: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
      >
        <span className="text-zinc-400 font-medium">{label}:</span>
        {current?.label}
        <CaretDown weight="bold" className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
      </button>
      {open && (
        <ul role="listbox" className="absolute z-30 mt-1.5 min-w-full w-max rounded-[12px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-1.5">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-[8px] text-sm font-medium text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {opt.label}
                {opt.value === value && <Check weight="bold" className="w-4 h-4" style={{ color: accentColor }} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
