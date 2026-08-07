"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { X, Info, ArrowSquareOut } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { HUB_COLORS } from "@/lib/brand"
import { HUBS, HubId, HUB_DISCLAIMERS } from "@/lib/data"
import { HubIcon, useFocusTrap } from "./shared"
import { getTurnaround, SelectedService } from "./lib"
import { sectionHasBulk, itemHasBulk } from "../quote-calculator/lib"

export function HubModal({ hubId, onClose, onSelectService }: {
  hubId: HubId | null
  originSide?: "left" | "right"
  onClose: () => void
  onSelectService: (svc: SelectedService) => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setOpenSectionIdx(0), [hubId])
  useFocusTrap(!!hubId, containerRef)

  if (!hubId) return null
  const hub = HUBS[hubId]
  const colors = HUB_COLORS[hubId]
  const accent = isDark ? colors.accentDark : colors.accentLight

  const hubDisclaimer = HUB_DISCLAIMERS[hubId]
  const activeSection = openSectionIdx !== null ? hub.sections[openSectionIdx] : null
  const activeSectionDesc = activeSection?.desc

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-3 md:p-4">
      {/* ===== BACKDROP ===== */}
      <motion.div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* ===== MODAL CONTAINER ===== */}
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={hub.title}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col outline-none rounded-[14px]"
        style={{ boxShadow: "0 45px 100px -20px rgba(0,0,0,0.55), 0 20px 48px -14px rgba(0,0,0,0.4)" }}
      >
        {/* ===== HEADER ===== */}
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0 gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[14px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 shrink-0">
              <HubIcon id={hubId} size={26} color={accent} />
            </div>
            <div className="min-w-0">
              <h2 className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 truncate">{hub.title}</h2>
              <p className="text-[0.8rem] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
                {hub.sections.reduce((sum, s) => sum + s.items.length, 0)} services available
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/gallery?hub=${hubId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[0.8rem] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150 whitespace-nowrap"
            >
              Gallery
              <ArrowSquareOut size={11} weight="bold" aria-hidden="true" />
            </Link>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150 shrink-0"
            >
              <X size={18} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8 pb-8 md:pb-10">

          {/* ===== SECTION SELECTOR ===== */}
          <div role="tablist" aria-label="Service categories" className="flex flex-wrap justify-center gap-x-7 gap-y-3 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            {hub.sections.map((section, sIdx) => {
              const isOpen = openSectionIdx === sIdx
              const hasBulk = sectionHasBulk(hubId, section.title, section.items)
              return (
                <button
                  key={sIdx}
                  role="tab"
                  aria-selected={isOpen}
                  onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                >
                  <span
                    className="relative pb-1.5 text-[1.05rem] font-black tracking-tight whitespace-nowrap transition-colors duration-200 border-b-2 -mb-[17px]"
                    style={{ borderColor: isOpen ? accent : "transparent", color: isOpen ? accent : (isDark ? "#a1a1aa" : "#71717a") }}
                  >
                    {section.title}
                    {hasBulk && (
                      <span aria-label="Bulk pricing available" className="ml-1.5 text-[0.6rem] font-black uppercase tracking-wide opacity-60">
                        · Bulk
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ===== SECTION DESCRIPTION ===== */}
          {activeSectionDesc && (
            <div key={openSectionIdx} className="mb-5 animate-in fade-in slide-in-from-top-1 duration-200">
              <p className="text-[0.98rem] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {activeSectionDesc}
              </p>
            </div>
          )}

          {/* ===== SERVICE ITEMS LIST ===== */}
          {activeSection && (
            <div key={`items-${openSectionIdx}`} className="abh-shadow-nested-group rounded-[14px] bg-zinc-50 dark:bg-zinc-900/50 p-3 md:p-4 grid grid-cols-1 gap-2 animate-in fade-in duration-200">
              {activeSection.items.map((item, iIdx) => (
                  <button
                    key={iIdx}
                    onClick={() =>
                      onSelectService({
                        name: item.name,
                        price: item.price,
                        hubId,
                        sectionTitle: activeSection.title,
                        requirements: item.requirements,
                        desc: item.description,
                        turnaround: getTurnaround(activeSection.title, item.name),
                        tips: item.tips ? [...item.tips] : undefined,
                      })
                    }
                    className="flex items-center justify-between px-4 py-3.5 rounded-[10px] bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-colors duration-150 active:scale-[0.99] w-full"
                  >
                    <span className="text-[0.97rem] font-semibold text-zinc-700 dark:text-zinc-200 text-left flex items-center gap-2">
                      {itemHasBulk(hubId, activeSection.title, item.name) && (
                        <span className="shrink-0 text-[0.58rem] font-black uppercase tracking-wide text-zinc-400">
                          Bulk ·
                        </span>
                      )}
                      {item.name}
                    </span>
                    <span className="text-[0.97rem] font-black shrink-0 ml-3" style={{ color: accent }}>{item.price}</span>
                  </button>
              ))}
            </div>
          )}

          {/* ===== HUB DISCLAIMER ===== */}
          {hubDisclaimer && (
            <div className="mt-6 flex items-start gap-2">
              <Info size={13} weight="bold" aria-hidden="true" className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[0.86rem] font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed">{hubDisclaimer}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 
