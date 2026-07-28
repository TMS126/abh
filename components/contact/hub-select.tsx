// ─────────────────────────────────────────────────────────────────────────
// HubSelect — custom dropdown for choosing a service hub on the form
// ─────────────────────────────────────────────────────────────────────────
"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { CaretDown } from "@phosphor-icons/react"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { FORM_HUB_KEYS, getFormHubColor } from "@/lib/contact-data"

export function HubSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen,   setIsOpen]   = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const ref                     = useRef<HTMLDivElement>(null)
  const { resolvedTheme }       = useTheme()
  const isDark                  = mounted && resolvedTheme === "dark"
  const options                 = Object.keys(FORM_HUB_KEYS)
  const activeColor             = value ? getFormHubColor(value, isDark) : undefined

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select a service hub"
        className="w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-background text-[0.84rem] font-semibold transition-all flex items-center justify-between gap-3 border-zinc-100 dark:border-zinc-800"
        style={{
          borderColor: value ? activeColor : (isOpen ? BRAND.blue : undefined),
          color:       value ? activeColor : (isDark ? "#9A9A9A" : "#777777"),
        }}
      >
        <span>{value || "Select a hub"}</span>
        <CaretDown
          weight="bold"
          aria-hidden="true"
          className={cn(
            "w-4 h-4 shrink-0 transition-transform duration-300",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      {isOpen && (
        <div role="listbox" className="absolute z-50 mt-1.5 w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[14px] shadow-xl overflow-hidden">
          {options.map((opt) => {
            const color = getFormHubColor(opt, isDark)
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={value === opt}
                onClick={() => { onChange(opt); setIsOpen(false) }}
                className="w-full px-4 py-3 text-left text-[0.84rem] font-semibold flex items-center gap-3 text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                onMouseEnter={(e) => { e.currentTarget.style.color = color }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "inherit" }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
