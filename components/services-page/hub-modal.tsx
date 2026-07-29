"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { X, Info, ArrowSquareOut } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { HUB_COLORS } from "@/lib/brand"
import { HUBS, HubId, HUB_DISCLAIMERS } from "@/lib/data"
import { HubIcon, useFocusTrap, DragHandle, shouldDismissOnDrag } from "./shared"
import { getTurnaround, SelectedService } from "./lib"

export function HubModal({ hubId, originSide = "right", onClose, onSelectService }: {
  hubId: HubId | null
  originSide?: "left" | "right"
  onClose: () => void
  onSelectService: (svc: SelectedService) => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setOpenSectionIdx(0) }, [hubId])

  useFocusTrap(!!hubId, containerRef)

  if (!hubId) return null
  const hub         = HUBS[hubId]
  const colors      = HUB_COLORS[hubId]
  const accent      = isDark ? colors.accentDark : colors.accentLight
  const solidAccent = colors.accentLight

  const hubDisclaimer = HUB_DISCLAIMERS[hubId]

  const activeSection     = openSectionIdx !== null ? hub.sections[openSectionIdx] : null
  const activeSectionDesc = activeSection?.desc

  // Enters from whichever side the triggering card's arrow pointed to —
  // "120%" (not 100%) guarantees it starts fully off-screen regardless of
  // the modal's own width at the moment the animation begins.
  const offscreenX = originSide === "left" ? "-120%" : "120%"

  return (
    <div className="fixed inset-0 z-[10100] flex items-center justify-center p-3 md:p-4">
      <motion.div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={hub.title}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_e, info) => { if (shouldDismissOnDrag(info)) onClose() }}
        initial={{ x: offscreenX, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: offscreenX, opacity: 0 }}
        transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[88vh] flex flex-col outline-none rounded-[20px] cursor-grab active:cursor-grabbing"
        style={{ boxShadow: `0 45px 100px -20px rgba(0,0,0,0.55), 0 20px 48px -14px rgba(0,0,0,0.4), 0 10px 24px -8px ${accent}50` }}
      >
        <DragHandle />

        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0 gap-3" style={{ backgroundColor: `${accent}05` }}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-[14px] flex items-center justify-center shadow-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" style={{ border: `2px solid ${accent}` }}>
              <HubIcon id={hubId} size={28} color={accent} />
            </div>
            <div className="min-w-0">
              <h2 className="abh-card-heading text-xl md:text-2xl truncate">{hub.title}</h2>
              <p className="abh-label mt-0.5" style={{ color: accent }}>
                {hub.sections.reduce((sum, s) => sum + s.items.length, 0)} Available Services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/gallery?hub=${hubId}`}
              className="group/gallerylink flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-tight whitespace-nowrap border-2 transition-all duration-200 hover:text-white"
              style={{ borderColor: accent, color: accent }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = solidAccent }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
            >
              View in Gallery
              <ArrowSquareOut size={12} weight="bold" aria-hidden="true" />
            </Link>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              <X size={20} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8">

          <div role="tablist" aria-label="Service categories" className="flex flex-wrap justify-center gap-2 mb-5">
            {hub.sections.map((section, sIdx) => {
              const isOpen = openSectionIdx === sIdx
              return (
                <button
                  key={sIdx}
                  role="tab"
                  aria-selected={isOpen}
                  onClick={() => setOpenSectionIdx(isOpen ? null : sIdx)}
                  className={`px-3.5 py-1.5 rounded-full text-[0.7rem] font-black tracking-tight whitespace-nowrap transition-all duration-200 ${
                    isOpen ? "text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                  style={isOpen ? { backgroundColor: solidAccent, boxShadow: `0 10px 24px -6px ${solidAccent}90, 0 4px 10px -2px ${solidAccent}70` } : {}}
                >
                  {section.title}
                </button>
              )
            })}
          </div>

          {activeSectionDesc && (
            <div
              key={openSectionIdx}
              className="mb-5 rounded-[12px] p-4 border animate-in fade-in slide-in-from-top-1 duration-200"
              style={{ borderColor: `${accent}25`, backgroundColor: `${accent}08`, boxShadow: `0 8px 22px -6px ${accent}45, 0 3px 10px -2px rgba(0,0,0,0.2)` }}
            >
              <p className="text-[0.82rem] leading-relaxed text-zinc-600 dark:text-zinc-300">{activeSectionDesc}</p>
            </div>
          )}

          {activeSection && (
            <div key={`items-${openSectionIdx}`} className="abh-shadow-nested-group rounded-[14px] bg-zinc-50 dark:bg-zinc-900/50 p-3 md:p-4 grid grid-cols-1 gap-2 animate-in fade-in duration-200">
              {activeSection.items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  onClick={() => onSelectService({
                    name: item.name, price: item.price, hubId,
                    sectionTitle: activeSection.title,
                    requirements: item.requirements, desc: item.description,
                    turnaround: getTurnaround(activeSection.title, item.name),
                  })}
                  className="abh-shadow-nested-item flex items-center justify-between p-3.5 md:p-4 rounded-[14px] bg-white dark:bg-zinc-900 border border-transparent transition-all"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent" }}
                >
                  <span className="text-[0.84rem] font-black text-zinc-800 dark:text-zinc-200 text-left">{item.name}</span>
                  <span className="text-[0.84rem] font-black shrink-0 ml-3" style={{ color: accent }}>{item.price}</span>
                </button>
              ))}
            </div>
          )}

          {hubDisclaimer && (
            <div className="mt-6 flex items-start gap-2">
              <Info size={13} weight="bold" aria-hidden="true" className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[0.72rem] font-medium text-zinc-400 dark:text-zinc-500 leading-relaxed">
                {hubDisclaimer}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 