// components/ui/simple-dropdown.tsx
"use client"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import { CaretDown, Check } from "@phosphor-icons/react"

export interface DropdownOption {
  value: string
  label: string
}

// Portaled straight into document.body via createPortal. This is the
// real fix for the overlap bug: any ancestor with a CSS transform
// (Framer Motion sets these inline, and these dropdowns sit inside
// ScrollBounce) becomes the containing block for position:fixed
// descendants instead of the viewport — so the old fixed-positioned
// list was anchoring to the wrong box. Portaling to <body> sidesteps
// that entirely, regardless of what wraps the trigger.
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
  const [mounted, setMounted] = useState(false)
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => setMounted(true), [])

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const left = Math.min(Math.max(8, r.left), window.innerWidth - 232)
    setRect({ top: r.bottom + 6, left, width: r.width })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false) }
    function onScroll() { setOpen(false) } // avoid a stale-position popover
    function onResize() { setOpen(false) }
    document.addEventListener("keydown", onKey)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    return () => {
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
      >
        <span className="text-zinc-400 font-medium">{label}:</span>
        {current?.label}
        <CaretDown weight="bold" className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && rect && mounted && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            style={{ position: "fixed", top: rect.top, left: rect.left, minWidth: rect.width }}
            className="z-[9999] w-max max-w-[220px] rounded-[12px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl p-1.5"
          >
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
        </>,
        document.body
      )}
    </>
  )
} 
