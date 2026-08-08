// components/gallery/project-viewer-modal.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CaretLeft, CaretRight, ArrowsLeftRight, WhatsappLogo } from "@phosphor-icons/react"
import { X } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ } from "@/lib/brand"
import { ProjectData } from "@/lib/data"
import { HubId, BA_HUBS, buildInquireHref } from "@/lib/gallery-helpers"
import { HubIcon } from "@/components/services-page/shared"
import { SafeImage } from "./safe-image"
import { BeforeAfterSlider } from "./before-after-slider"
import { ZoomOverlay } from "./zoom-overlay"
import { LikeButton, ShareButton } from "./like-share-buttons"
import { Check, EnvelopeSimple } from "@phosphor-icons/react"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isMobile
}

const CHIP = "bg-black/30 backdrop-blur-md border border-white/10 [&_svg]:text-white"
const ACRYLIC_PILL = "bg-zinc-100/80 dark:bg-zinc-800/70 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-700/50"

// How much scroll (px) it takes for the info-panel header to fully shrink
// and go translucent — matches the Hub modal's SHRINK_DISTANCE feel.
const HEADER_SHRINK_DISTANCE = 70

function ProjectNav({ current, total, onPrev, onNext, accent }: {
  current: number; total: number; onPrev: () => void; onNext: () => void; accent: string
}) {
  if (total <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 text-[0.8rem] font-bold text-zinc-500 dark:text-zinc-400">
      <button
        onClick={onPrev}
        aria-label="Previous project"
        className="w-7 h-7 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 active:scale-90 transition-transform hover:border-current"
        style={{ color: accent }}
      >
        <CaretLeft size={13} weight="bold" />
      </button>
      <span>Project {current} of {total}</span>
      <button
        onClick={onNext}
        aria-label="Next project"
        className="w-7 h-7 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 active:scale-90 transition-transform hover:border-current"
        style={{ color: accent }}
      >
        <CaretRight size={13} weight="bold" />
      </button>
    </div>
  )
}

function ProjectDetailsBody({ project, accent }: { project: ProjectData; accent: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <h4 className="text-[0.74rem] font-black uppercase tracking-widest mb-2 text-zinc-400 dark:text-zinc-500">The Goal</h4>
        <p className="text-base text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">{project.clientGoal}</p>
      </div>
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <h4 className="text-[0.74rem] font-black uppercase tracking-widest mb-2 text-zinc-400 dark:text-zinc-500">What we did</h4>
        <ul className="space-y-2">
          {project.whatWeDid.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base text-zinc-700 dark:text-zinc-200 font-medium">
              <Check size={14} weight="bold" className="mt-1 shrink-0" style={{ color: accent }} />{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <h4 className="text-[0.74rem] font-black uppercase tracking-widest mb-2 text-zinc-400 dark:text-zinc-500">The Result</h4>
        <p className="text-base text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">{project.result}</p>
      </div>
    </div>
  )
}

// Minimal CTAs — plain text+icon, no filled/bordered boxes, split by a
// single thin divider (same footer language as the service detail modal).
function ProjectCTAs({ project, onClose, accent }: {
  project: ProjectData; onClose: () => void; accent: string
}) {
  const btnBase = "flex-1 flex items-center justify-center gap-2 py-3 text-[0.92rem] font-bold transition-opacity active:opacity-60"
  return (
    <div className="flex items-stretch justify-center gap-4">
      <a
        href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        aria-label={`Order a project like ${project.title} via WhatsApp`}
        className={btnBase}
        style={{ color: accent }}
      >
        <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
        Order
      </a>
      <div className="w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
      <Link
        href={buildInquireHref(project)}
        aria-label={`Ask a question about ${project.title}`}
        className={btnBase}
        style={{ color: accent }}
      >
        <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
        Ask
      </Link>
    </div>
  )
}

// ── Mini "other projects" widget — same idea as the Hub modal's "other
// hubs" switcher: small thumbnail row for quick access to sibling
// projects within the same hub, shown only when there's more than one. ──
function OtherProjectsWidget({ siblings, currentId, accent, onSelect }: {
  siblings: ProjectData[]; currentId: string; accent: string; onSelect: (p: ProjectData) => void
}) {
  const others = siblings.filter((p) => p.id !== currentId)
  if (others.length === 0) return null
  return (
    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <p className="text-[0.7rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5 text-center">
        More from this hub
      </p>
      <div
        className="flex gap-2 overflow-x-auto no-scrollbar p-2 rounded-[14px]"
        style={{ boxShadow: "0 8px 20px -10px rgba(0,0,0,0.10), 0 2px 6px -2px rgba(0,0,0,0.05)" }}
      >
        {others.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            aria-label={`View ${p.title}`}
            className="relative shrink-0 w-16 h-16 rounded-[10px] overflow-hidden border-2 border-transparent hover:border-current transition-colors"
            style={{ color: accent }}
          >
            <SafeImage src={p.image} alt={p.title} accent={accent} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Compact hub-filter chip row — sits over the top of the image so the
// user can jump the whole viewer to a different hub's projects. ──
function HubFilterRow({ rowOrder, activeHub, getAccent, onSelect }: {
  rowOrder: { id: HubId; label: string }[]
  activeHub: HubId
  getAccent: (id: HubId) => string
  onSelect: (id: HubId) => void
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
      {rowOrder.map((r) => {
        const isActive = r.id === activeHub
        const accent = getAccent(r.id)
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            aria-pressed={isActive}
            aria-label={r.label}
            className={cn(
              "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              CHIP,
              isActive && "ring-2 ring-white/80"
            )}
          >
            <HubIcon id={r.id} size={15} color={isActive ? accent : "#ffffff"} />
          </button>
        )
      })}
    </div>
  )
}

export function ProjectViewerModal({
  project, onClose, zoomIndex, setZoomIndex, onCloseZoom, pathname, siblings, onNavigate, likedIds, onToggleLike,
  rowOrder, getAccent, onSelectHub,
}: {
  project: ProjectData | null
  onClose: () => void
  zoomIndex: number | null
  setZoomIndex: (i: number | null) => void
  onCloseZoom: () => void
  pathname: string
  siblings: ProjectData[]
  onNavigate: (p: ProjectData) => void
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  rowOrder?: { id: HubId; label: string }[]
  getAccent?: (id: HubId) => string
  onSelectHub?: (id: HubId) => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isMobile = useIsMobile()
  const [activeImg,  setActiveImg]  = useState(0)
  const [comparing,  setComparing]  = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const detailsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipeRef = useRef(false)

  useEffect(() => {
    setActiveImg(0)
    setComparing(false)
    setScrollProgress(0)
    if (detailsRef.current) detailsRef.current.scrollTop = 0
  }, [project?.id])

  const handleDetailsScroll = useCallback(() => {
    if (!detailsRef.current) return
    setScrollProgress(Math.min(detailsRef.current.scrollTop / HEADER_SHRINK_DISTANCE, 1))
  }, [])

  const currentIdx = project ? siblings.findIndex(p => p.id === project.id) : -1
  const hasSiblings = siblings.length > 1 && currentIdx !== -1

  const goPrevProject = useCallback(() => {
    if (!hasSiblings) return
    const i = (currentIdx - 1 + siblings.length) % siblings.length
    onNavigate(siblings[i])
  }, [hasSiblings, currentIdx, siblings, onNavigate])

  const goNextProject = useCallback(() => {
    if (!hasSiblings) return
    const i = (currentIdx + 1) % siblings.length
    onNavigate(siblings[i])
  }, [hasSiblings, currentIdx, siblings, onNavigate])

  // components/gallery/project-viewer-modal.tsx (keydown effect only — everything
// else in the file is unchanged from the last version I sent)

  useEffect(() => {
    if (!project || zoomIndex !== null) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose()
      if (e.key === "ArrowLeft")  goPrevProject()
      if (e.key === "ArrowRight") goNextProject()
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [project, zoomIndex, goPrevProject, goNextProject, onClose])

  if (!project) return null

  const accent    = isDark ? HUB_COLORS[project.hub as HubKey].accentDark : HUB_COLORS[project.hub as HubKey].accentLight
  const accentOnDark = HUB_COLORS[project.hub as HubKey].accentDark
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA     = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg  = (project as any).afterImage  as string | undefined
  const shareUrl  = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`

  // Header background dims/blurs and shrinks its padding as the info panel
  // scrolls, so content passes visually behind a translucent floating bar
  // rather than a solid opaque one.
  const headerBg = isDark
    ? `rgba(9,9,11,${1 - scrollProgress * 0.5})`
    : `rgba(255,255,255,${1 - scrollProgress * 0.5})`

  const onImageTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    didSwipeRef.current = false
  }
  const onImageTouchEnd = (e: React.TouchEvent) => {
    if (allImages.length < 2) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) < 40 || dy > Math.abs(dx)) return
    didSwipeRef.current = true
    setActiveImg(dx < 0 ? (activeImg + 1) % allImages.length : (activeImg - 1 + allImages.length) % allImages.length)
  }
  const handleImageClick = () => {
    if (didSwipeRef.current) { didSwipeRef.current = false; return }
    setZoomIndex(activeImg)
  }

  return (
    <div className="fixed inset-0 z-[10200] flex items-end md:items-center justify-center md:p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className={cn(
        "relative w-full abh-shadow-modal bg-white dark:bg-zinc-950",
        "flex flex-col md:flex-row",
        "border border-zinc-200 dark:border-zinc-800",
        isMobile
          ? "h-full rounded-none border-x-0"
          : "rounded-[14px] h-[85vh] md:max-w-5xl md:overflow-hidden animate-in zoom-in-95 duration-500",
      )}>

        {isMobile ? (
          <>
            <div className="relative h-[38%] shrink-0 overflow-hidden bg-zinc-900">
              {comparing && hasBA ? (
                <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
              ) : (
                <div
                  className="relative w-full h-full cursor-zoom-in"
                  onClick={handleImageClick}
                  onTouchStart={onImageTouchStart}
                  onTouchEnd={onImageTouchEnd}
                >
                  <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="100vw" className="object-contain" priority />

                  <div className="absolute top-0 inset-x-0 z-20 flex flex-col gap-2 px-3 pt-3 pb-8 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                      {rowOrder && getAccent && onSelectHub ? (
                        <HubFilterRow rowOrder={rowOrder} activeHub={project.hub as HubId} getAccent={getAccent} onSelect={onSelectHub} />
                      ) : <span />}
                      <button
                        onClick={(e) => { e.stopPropagation(); onClose() }}
                        aria-label="Close"
                        className={cn("shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-90", CHIP)}
                      >
                        <X size={17} weight="bold" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-colors", CHIP)} onClick={(e) => e.stopPropagation()}>
                      <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
                    </div>
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-colors", CHIP)} onClick={(e) => e.stopPropagation()}>
                      <ShareButton url={shareUrl} title={project.title} />
                    </div>
                  </div>

                  {allImages.length > 1 && (
                    <div className="absolute bottom-0 inset-x-0 z-10 flex justify-center gap-2 px-3 py-2.5 bg-gradient-to-t from-black/55 to-transparent overflow-x-auto no-scrollbar">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setActiveImg(idx) }}
                          aria-label={`View image ${idx + 1} of ${allImages.length}`}
                          className={cn("relative shrink-0 w-11 h-11 rounded-[8px] overflow-hidden border-2 transition-all", activeImg === idx ? "scale-105 border-white" : "border-white/20 opacity-60")}
                        >
                          <SafeImage src={img} alt={`Thumb ${idx + 1}`} accent={accent} fill sizes="44px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasBA && (
                <button
                  onClick={() => setComparing(v => !v)}
                  aria-label={comparing ? "Show gallery view" : "Show before and after comparison"}
                  className={cn("absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.78rem] font-black uppercase tracking-wider", CHIP)}
                >
                  <ArrowsLeftRight size={12} weight="bold" aria-hidden="true" />
                  {comparing ? "Gallery" : "Before / After"}
                </button>
              )}
            </div>

            <div ref={detailsRef} onScroll={handleDetailsScroll} className="flex-1 overflow-y-auto overscroll-contain">
              {/* Floating header — dims/blurs and shrinks as content scrolls
                  behind it, instead of staying solid/opaque. */}
              <div
                className="sticky top-0 z-20 px-6 transition-[padding,background-color] duration-150 ease-out"
                style={{
                  backgroundColor: headerBg,
                  backdropFilter: scrollProgress > 0.05 ? "blur(10px)" : undefined,
                  WebkitBackdropFilter: scrollProgress > 0.05 ? "blur(10px)" : undefined,
                  paddingTop: `${20 - scrollProgress * 8}px`,
                  paddingBottom: `${16 - scrollProgress * 6}px`,
                  boxShadow: scrollProgress > 0.05
                    ? (isDark ? "0 10px 14px -10px rgba(0,0,0,0.5)" : "0 10px 14px -10px rgba(0,0,0,0.18)")
                    : "none",
                }}
              >
                <div className="flex justify-center">
                  <div className={cn("flex flex-col items-center gap-2 px-5 rounded-[16px] transition-[padding] duration-150", ACRYLIC_PILL)} style={{ paddingTop: `${12 - scrollProgress * 4}px`, paddingBottom: `${12 - scrollProgress * 4}px` }}>
                    <h2 className="font-black text-base text-zinc-900 dark:text-zinc-50 text-center leading-snug max-w-[260px] truncate">
                      {project.title}
                    </h2>
                    <ProjectNav current={currentIdx + 1} total={siblings.length} onPrev={goPrevProject} onNext={goNextProject} accent={accent} />
                  </div>
                </div>

                {project.clientType && (
                  <p
                    className="text-[0.86rem] italic mt-3 text-center transition-opacity duration-150"
                    style={{ opacity: 1 - scrollProgress, height: scrollProgress > 0.9 ? 0 : "auto" }}
                  >
                    <span className={project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500"}>
                      {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
                      {project.clientType === "client" && "Real client work"}
                      {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
                    </span>
                  </p>
                )}
              </div>

              <div className="px-6 pt-4 pb-6">
                <ProjectDetailsBody project={project} accent={accent} />
                <OtherProjectsWidget siblings={siblings} currentId={project.id} accent={accent} onSelect={onNavigate} />
              </div>
            </div>

            <div className="shrink-0 px-6 pt-4 pb-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-20">
              <ProjectCTAs project={project} onClose={onClose} accent={accent} />
            </div>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-40 w-9 h-9 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg text-white transition-colors active:scale-90"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="md:h-auto md:flex-1 flex flex-col overflow-hidden bg-zinc-900 relative">
              {comparing && hasBA ? (
                <div className="relative flex-1">
                  <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
                </div>
              ) : (
                <>
                  <div className="relative flex-1 overflow-hidden cursor-zoom-in group/img" onClick={handleImageClick}>
                    <div className="absolute inset-0 scale-105">
                      <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="55vw" className="relative object-contain" priority={activeImg === 0} />
                    </div>

                    {rowOrder && getAccent && onSelectHub && (
                      <div className="absolute top-3 left-3 right-16 z-20" onClick={(e) => e.stopPropagation()}>
                        <HubFilterRow rowOrder={rowOrder} activeHub={project.hub as HubId} getAccent={getAccent} onSelect={onSelectHub} />
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
                      <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
                    </div>
                    <div className="absolute bottom-3 left-14 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
                      <ShareButton url={shareUrl} title={project.title} />
                    </div>
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex justify-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-t border-white/10">
                      {allImages.map((img, idx) => (
                        <button key={idx} onClick={() => setActiveImg(idx)} aria-label={`View image ${idx + 1} of ${allImages.length}`} className={cn("relative shrink-0 w-11 h-11 rounded-[8px] overflow-hidden border-2 transition-all", activeImg === idx ? "scale-105" : "border-transparent opacity-50 hover:opacity-80")} style={activeImg === idx ? { borderColor: accentOnDark } : {}}>
                          <SafeImage src={img} alt={`Thumb ${idx + 1}`} accent={accent} fill sizes="44px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {hasBA && (
                <div className="shrink-0 flex border-t border-white/10 bg-zinc-950">
                  <button onClick={() => setComparing(false)} aria-pressed={!comparing} className={cn("flex-1 py-2.5 text-[0.78rem] font-black uppercase tracking-widest transition-all duration-200", !comparing ? "text-white" : "text-white/30 hover:text-white/60")} style={!comparing ? { borderBottom: `2px solid ${accentOnDark}` } : {}}>Gallery</button>
                  <button onClick={() => setComparing(true)} aria-pressed={comparing} className={cn("flex-1 py-2.5 text-[0.78rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-200", comparing ? "text-white" : "text-white/30 hover:text-white/60")} style={comparing ? { borderBottom: `2px solid ${accentOnDark}` } : {}}><ArrowsLeftRight size={13} weight="bold" aria-hidden="true" />Before / After</button>
                </div>
              )}
            </div>

            <div className="relative flex flex-col border-zinc-100 dark:border-zinc-800 flex-1 border-t md:h-auto md:flex-none md:border-t-0 md:border-l md:w-[380px]">
              {/* Floating, shrinking, dimming header — same treatment as
                  the Hub modal, driven by the same detailsRef scroll. */}
              <div
                className="shrink-0 px-6 md:px-8 relative z-20 transition-[padding,background-color] duration-150 ease-out"
                style={{
                  backgroundColor: headerBg,
                  backdropFilter: scrollProgress > 0.05 ? "blur(10px)" : undefined,
                  WebkitBackdropFilter: scrollProgress > 0.05 ? "blur(10px)" : undefined,
                  paddingTop: `${28 - scrollProgress * 10}px`,
                  paddingBottom: `${20 - scrollProgress * 8}px`,
                  boxShadow: scrollProgress > 0.05
                    ? (isDark ? "0 10px 14px -10px rgba(0,0,0,0.4)" : "0 10px 14px -10px rgba(0,0,0,0.12)")
                    : "none",
                }}
              >
                <span className="text-[0.84rem] font-black uppercase tracking-widest" style={{ color: accent }}>{project.tag}</span>
                {hasBA && <span className="ml-2 text-[0.72rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before &amp; After</span>}
                <h2
                  className="font-sans font-black text-zinc-900 dark:text-zinc-50 leading-snug mt-2 truncate transition-[font-size] duration-150"
                  style={{ fontSize: `${20 - scrollProgress * 4}px` }}
                >
                  {project.title}
                </h2>
                {project.clientType && (
                  <p
                    className="text-[0.86rem] italic mt-2 transition-opacity duration-150"
                    style={{ opacity: 1 - scrollProgress, height: scrollProgress > 0.9 ? 0 : "auto" }}
                  >
                    <span className={project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500"}>
                      {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
                      {project.clientType === "client" && "Real client work"}
                      {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
                    </span>
                  </p>
                )}
                <div className="mt-3">
                  <ProjectNav current={currentIdx + 1} total={siblings.length} onPrev={goPrevProject} onNext={goNextProject} accent={accent} />
                </div>
              </div>

              <div ref={detailsRef} onScroll={handleDetailsScroll} className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8 pt-5 pb-6">
                <ProjectDetailsBody project={project} accent={accent} />
                <OtherProjectsWidget siblings={siblings} currentId={project.id} accent={accent} onSelect={onNavigate} />
              </div>

              <div className={cn("shrink-0 px-6 md:px-8 pt-4 pb-6 md:pb-8 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-20", "shadow-[0_-6px_14px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-6px_14px_-10px_rgba(0,0,0,0.4)]")}>
                <ProjectCTAs project={project} onClose={onClose} accent={accent} />
              </div>
            </div>
          </>
        )}
      </div>

      {zoomIndex !== null && !comparing && (
        <ZoomOverlay
          images={allImages}
          startIndex={zoomIndex}
          onClose={onCloseZoom}
          title={project.title}
        />
      )}
    </div>
  )
}  
