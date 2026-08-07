"use client"

import { useState, useEffect, useRef, type TouchEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { X, Info, ArrowSquareOut } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId, HUB_DISCLAIMERS } from "@/lib/data"
import { HubIcon, useFocusTrap } from "./shared"
import { getTurnaround, HUB_ORDER, SelectedService } from "./lib"
import { sectionHasBulk, itemHasBulk } from "../quote-calculator/lib"

// ── Swipe-to-swap-sections thresholds — same values as the service detail
// modal's tab-swipe, so the gesture feel is consistent across both modals.
const SWIPE_MIN_DX = 48
const SWIPE_DOMINANCE = 1.4

// ── Header shrink-on-scroll distance (px of body scroll to fully shrink) ──
const SHRINK_DISTANCE = 90

export function HubModal({ hubId, onClose, onSelectService, onSwitchHub }: {
  hubId: HubId | null
  originSide?: "left" | "right"
  onClose: () => void
  onSelectService: (svc: SelectedService) => void
  onSwitchHub: (hubId: HubId) => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [openSectionIdx, setOpenSectionIdx] = useState<number | null>(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setOpenSectionIdx(0)
    setScrollProgress(0)
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [hubId])
  useFocusTrap(!!hubId, containerRef)

  if (!hubId) return null
  const hub = HUBS[hubId]
  const colors = HUB_COLORS[hubId]
  const accent = isDark ? colors.accentDark : colors.accentLight

  const hubDisclaimer = HUB_DISCLAIMERS[hubId]
  const activeSection = openSectionIdx !== null ? hub.sections[openSectionIdx] : null
  const activeSectionDesc = activeSection?.desc

  // ── Header shrink — driven purely by body scrollTop, so it reverses
  // automatically when scrolling back up. ──
  const handleBodyScroll = () => {
    if (!bodyRef.current) return
    const top = bodyRef.current.scrollTop
    setScrollProgress(Math.min(top / SHRINK_DISTANCE, 1))
  }

  // ── Swipe body left/right to move to the next/previous section ──
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }
  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || openSectionIdx === null) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_DX || Math.abs(dx) < Math.abs(dy) * SWIPE_DOMINANCE) return
    if (dx < 0 && openSectionIdx < hub.sections.length - 1) setOpenSectionIdx(openSectionIdx + 1)
    else if (dx > 0 && openSectionIdx > 0) setOpenSectionIdx(openSectionIdx - 1)
  }

  const titleFontSize = 28 - scrollProgress * 8
  const subtitleOpacity = 1 - scrollProgress

  return (
    <div className="fixed inset-0 z-[10100] flex flex-col items-center justify-center gap-3 p-3 md:p-4 overflow-y-auto">
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
        className="relative z-10 w-full max-w-2xl bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800 max-h-[76vh] flex flex-col outline-none rounded-[14px]"
        style={{ boxShadow: "0 45px 100px -20px rgba(0,0,0,0.55), 0 20px 48px -14px rgba(0,0,0,0.4)" }}
      >
        {/* ===== HEADER — shrinks smoothly as the body scrolls ===== */}
        <div
          className="relative px-6 md:px-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0 gap-3 transition-[padding] duration-150 ease-out"
          style={{ paddingTop: `${24 - scrollProgress * 8}px`, paddingBottom: `${24 - scrollProgress * 8}px` }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <HubIcon id={hubId} size={28 - scrollProgress * 6} color={accent} />
            <div className="min-w-0">
              <h2
                className="font-sans font-black text-zinc-900 dark:text-zinc-50 truncate transition-[font-size] duration-150 ease-out"
                style={{ fontSize: `${titleFontSize}px` }}
              >
                {hub.title}
              </h2>
              <p
                className="text-[0.82rem] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 transition-opacity duration-150"
                style={{ opacity: subtitleOpacity, height: subtitleOpacity > 0.05 ? "auto" : 0 }}
              >
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

          {/* Shadow that fades in under the header as content scrolls beneath it */}
          <div
            className="absolute left-0 right-0 -bottom-4 h-4 pointer-events-none"
            aria-hidden="true"
            style={{
              opacity: scrollProgress,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        </div>

        {/* ===== BODY ===== */}
        <div
          ref={bodyRef}
          onScroll={handleBodyScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8 pb-8 md:pb-10"
        >

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
                    <span className="text-[1.02rem] font-semibold text-zinc-700 dark:text-zinc-200 text-left flex items-center gap-2">
                      {itemHasBulk(hubId, activeSection.title, item.name) && (
                        <span className="shrink-0 text-[0.58rem] font-black uppercase tracking-wide text-zinc-400">
                          Bulk ·
                        </span>
                      )}
                      {item.name}
                    </span>
                    <span className="text-[1.02rem] font-black shrink-0 ml-3" style={{ color: accent }}>{item.price}</span>
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

      {/* ===== OTHER HUBS — mini switcher row, only rendered while a hub
          modal is open ===== */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="relative z-10 w-full max-w-2xl flex gap-2 overflow-x-auto no-scrollbar px-1"
      >
        {HUB_ORDER.filter((id) => id !== hubId).map((id) => {
          const otherColors = HUB_COLORS[id as HubKey]
          const otherAccent = isDark ? otherColors.accentDark : otherColors.accentLight
          return (
            <button
              key={id}
              onClick={() => onSwitchHub(id)}
              className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-[14px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:-translate-y-0.5 transition-all duration-150 active:scale-95"
            >
              <HubIcon id={id} size={16} color={otherAccent} />
              <span className="text-[0.78rem] font-bold text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                {HUBS[id].title}
              </span>
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}  
