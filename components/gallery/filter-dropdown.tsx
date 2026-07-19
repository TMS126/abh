"use client"

import { useState } from "react"
import { CaretDown, Check } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { ROW_ORDER, HubId, playClickSound } from "@/lib/gallery-helpers"
import { useBackButtonDismiss } from "@/hooks/use-back-button-dismiss"

export function FilterDropdown({
  activeFilter, onSelect, getAccent,
}: {
  activeFilter: HubId | "all"
  onSelect: (f: HubId | "all") => void
  getAccent: (id: HubId) => string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  const [open, setOpen] = useState(false)
  const closeDropdown = useBackButtonDismiss(open, setOpen)

  const handleToggleClick = () => {
    playClickSound()
    if (open) {
      closeDropdown()
    } else {
      setOpen(true)
    }
  }

  const options: { id: HubId | "all"; label: string }[] = [
    { id: "all", label: "All hubs" },
    ...ROW_ORDER.map(r => ({ id: r.id, label: r.label })),
  ]
  const currentAccent = activeFilter !== "all" ? getAccent(activeFilter) : undefined
  const idleLabel      = "Select a Hub"
  const displayedLabel = activeFilter === "all" ? idleLabel : (options.find(o => o.id === activeFilter)?.label ?? idleLabel)

  return (
    <div className="relative flex justify-center mb-10 z-40">
      <button
        onClick={handleToggleClick}
        aria-expanded={open}
        className={cn(
          "relative z-40 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full",
          "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800",
          "font-sans font-bold text-sm text-center",
          "shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)]",
          "hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.5)]",
          "transition-all duration-300 ease-out active:scale-[0.97]"
        )}
        style={currentAccent ? { borderColor: `${currentAccent}45` } : undefined}
      >
        {currentAccent && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentAccent }} />}
        <span style={{ color: currentAccent ?? undefined }} className={!currentAccent ? "text-zinc-800 dark:text-zinc-100" : undefined}>
          {displayedLabel}
        </span>
        <CaretDown size={14} weight="bold" className={cn("transition-transform duration-200 shrink-0", open && "rotate-180")} style={{ color: currentAccent ?? blueColor }} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeDropdown}
            aria-hidden="true"
          />
          <AnimatePresence>
            <motion.div
              role="listbox"
              aria-label="Filter by hub"
              initial={{ opacity: 0, y: -14, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 280, damping: 22, mass: 0.6 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 w-72 rounded-[20px] border border-zinc-100 dark:border-zinc-800 shadow-2xl p-3"
              style={{ backgroundColor: isDark ? "#09090b" : "#ffffff", isolation: "isolate" }}
            >
              <div className="flex flex-wrap gap-2 justify-center">
                {options.map(opt => {
                  const accent   = opt.id !== "all" ? getAccent(opt.id as HubId) : undefined
                  const isActive = activeFilter === opt.id
                  return (
                    <button
                      key={opt.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => { onSelect(opt.id); closeDropdown() }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 border shrink-0"
                      style={
                        isActive
                          ? { backgroundColor: accent ?? blueColor, color: "#ffffff", borderColor: "transparent" }
                          : {
                              backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                              color: accent ?? (isDark ? "#e4e4e7" : "#3f3f46"),
                              borderColor: isDark ? "#27272a" : "#e4e4e7",
                            }
                      }
                    >
                      {accent && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                      )}
                      {opt.label}
                      {isActive && <Check size={12} weight="bold" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
