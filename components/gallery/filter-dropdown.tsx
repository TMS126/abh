"use client"

import { useState } from "react"
import { CaretDown, Funnel } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { getContrastText } from "@/lib/color"
import { ROW_ORDER, HubId, playClickSound } from "@/lib/gallery-helpers"
import { useBackButtonDismiss } from "@/hooks/use-back-button-dismiss"
import { HubIcon } from "@/components/services-page/shared"

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

  const handleSelect = (id: HubId | "all") => {
    playClickSound()
    onSelect(id)
    setOpen(false)
  }

  const options: { id: HubId | "all"; label: string }[] = [
    { id: "all", label: "All hubs" },
    ...ROW_ORDER.map(r => ({ id: r.id, label: r.label })),
  ]
  const currentAccent = activeFilter !== "all" ? getAccent(activeFilter) : blueColor
  const displayedLabel = activeFilter === "all" ? "Select a Hub" : (options.find(o => o.id === activeFilter)?.label ?? "Select a Hub")

  return (
    <>
      {/* ── Desktop pill row — unchanged */}
      <div className="hidden md:flex justify-center flex-wrap gap-2 mb-10">
        {options.map(opt => {
          const accent   = opt.id !== "all" ? getAccent(opt.id as HubId) : undefined
          const isActive = activeFilter === opt.id
          const activeBg = accent ?? blueColor
          const activeText = getContrastText(activeBg)

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              aria-pressed={isActive}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 active:scale-95",
                "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)]",
                "outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              )}
              style={
                isActive
                  ? { backgroundColor: activeBg, color: activeText, ["--tw-ring-color" as any]: activeBg }
                  : {
                      backgroundColor: isDark ? "#18181b" : "#ffffff",
                      color: isDark ? "#e4e4e7" : "#3f3f46",
                      ["--tw-ring-color" as any]: accent ?? blueColor,
                    }
              }
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* ── Mobile — collapsed pill w/ icon, matching the Notice pill pattern:
          solid colored fill, icon in its own circle, opens the listbox
          below on tap, same as before/close animation. */}
      <div className="md:hidden relative flex justify-center mb-10 z-40">
        <button
          onClick={handleToggleClick}
          aria-expanded={open}
          className={cn(
            "flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full",
            "text-[0.78rem] font-black whitespace-nowrap transition-all duration-150 active:scale-95",
            "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.18)] dark:shadow-[0_4px_18px_-3px_rgba(0,0,0,0.7)]",
            "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          )}
          style={{
            backgroundColor: currentAccent,
            color: getContrastText(currentAccent),
            ["--tw-ring-color" as any]: currentAccent,
          }}
        >
          <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white/20">
            {activeFilter !== "all"
              ? <HubIcon id={activeFilter} size={15} color={getContrastText(currentAccent)} />
              : <Funnel size={15} weight="bold" />
            }
          </span>
          {displayedLabel}
          <CaretDown size={13} weight="bold" className={cn("transition-transform duration-200 shrink-0", open && "rotate-180")} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeDropdown} aria-hidden="true" />
            <AnimatePresence>
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
                        onClick={() => handleSelect(opt.id)}
                        className={cn(
                          "w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full",
                          "text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95",
                          "shadow-[0_2px_10px_-2px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_10px_-2px_rgba(0,0,0,0.5)]",
                          "hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.24)] dark:hover:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.6)]",
                          "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        )}
                        style={
                          isActive
                            ? { backgroundColor: activeBg, color: activeText, ["--tw-ring-color" as any]: activeBg }
                            : {
                                backgroundColor: isDark ? "#18181b" : "#ffffff",
                                color: accent ?? (isDark ? "#e4e4e7" : "#3f3f46"),
                                ["--tw-ring-color" as any]: accent ?? blueColor,
                              }
                        }
                      >
                        {opt.id !== "all" && <HubIcon id={opt.id as HubId} size={13} color={isActive ? activeText : accent} />}
                        <span className="truncate">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  )
} 