"use client"

import { useState } from "react"
import { CaretDown, Check } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { getContrastText } from "@/lib/color"
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
                      "flex items-center justify-center gap-1.5 px-3 py-2 rounded-full",
                      "text-[10px] font-bold whitespace-nowrap transition-all duration-150 active:scale-95",
                      "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)]",
                      "hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.24)] dark:hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.6)]"
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
            {/*
              Single lightweight glass panel behind the pill group — one
              backdrop-blur-md layer only (no stacked/nested blurs, no
              saturate), so the gaps and corners around the pills no longer
              let page content bleed through. Each pill still carries its
              own solid background on top for contrast/legibility.
            */}
            <motion.div
              role="listbox"
              aria-label="Filter by hub"
              initial={{ opacity: 0, y: -14, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 280, damping: 22, mass: 0.6 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 w-[calc(100vw-2rem)] max-w-sm"
              style={{ isolation: "isolate" }}
            >
              <div
                className={cn(
                  "flex flex-wrap justify-center gap-2 p-2.5 rounded-[24px]",
                  "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md",
                  "border border-white/50 dark:border-white/10",
                  "shadow-xl dark:shadow-black/40"
                )}
              >
                {options.map(opt => {
                  const accent   = opt.id !== "all" ? getAccent(opt.id as HubId) : undefined
                  const isActive = activeFilter === opt.id
                  const activeBg = accent ?? blueColor
                  const activeText = getContrastText(activeBg)

                  return (
                    <button
                      key={opt.id}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => { onSelect(opt.id); closeDropdown() }}
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full",
                        "text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95",
                        "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)]",
                        "hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.24)] dark:hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.6)]"
                      )}
                      style={
                        isActive
                          ? { backgroundColor: activeBg, color: activeText }
                          : {
                              backgroundColor: isDark ? "#18181b" : "#ffffff",
                              color: accent ?? (isDark ? "#e4e4e7" : "#3f3f46"),
                            }
                      }
                    >
                      {accent && (
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: accent,
                            boxShadow: isActive ? `0 0 0 1.5px ${activeText}` : undefined,
                          }}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                      {isActive && <Check size={12} weight="bold" className="shrink-0" />}
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
