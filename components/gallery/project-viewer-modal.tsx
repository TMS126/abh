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

// Shared "‹ Project X/Y ›" nav control — used in both mobile and desktop
// info-panel headers, replacing the old overlay arrows that sat ON the
// image itself (those were misleading — they looked like photo-swipe
// controls but actually changed the whole project).
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

// CTA labels shortened to single, intent-differentiated words: "Order"
// for the direct WhatsApp purchase path, "Ask" for the lower-commitment
// inquiry path — rather than the literal "Get"/"Inquire" suggested, since
// two near-synonyms side by side read as redundant, not as two distinct
// choices.
function ProjectCTAs({ project, onClose, accent }: {
  project: ProjectData; onClose: () => void; accent: string
}) {
  const btnBase = "flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-[14px] border-2 text-center transition-all active:scale-[0.97]"
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <a
        href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        aria-label={`Order a project like ${project.title} via WhatsApp`}
        className={btnBase}
        style={{ borderColor: accent, backgroundColor: `${accent}12`, color: accent }}
      >
        <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
        <span className="text-sm font-black leading-tight">Order</span>
      </a>
      <Link
        href={buildInquireHref(project)}
        aria-label={`Ask a question about ${project.title}`}
        className={btnBase}
        style={{ borderColor: accent, color: accent }}
      >
        <EnvelopeSimple size={20} weight="bold" aria-hidden="true" />
        <span className="text-sm font-black leading-tight">Ask</span>
      </Link>
    </div>
  )
}

export function ProjectViewerModal({
  project, onClose, zoomIndex, setZoomIndex, onCloseZoom, pathname, siblings, onNavigate, likedIds, onToggleLike,
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
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const isMobile = useIsMobile()
  const [activeImg,  setActiveImg]  = useState(0)
  const [comparing,  setComparing]  = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipeRef = useRef(false)

  useEffect(() => {
    setActiveImg(0)
    setComparing(false)
    if (detailsRef.current) detailsRef.current.scrollTop = 0
  }, [project?.id])

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

  useEffect(() => {
    if (!project || zoomIndex !== null) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  goPrevProject()
      if (e.key === "ArrowRight") goNextProject()
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [project, zoomIndex, goPrevProject, goNextProject])

  if (!project) return null

  const accent    = isDark ? HUB_COLORS[project.hub as HubKey].accentDark : HUB_COLORS[project.hub as HubKey].accentLight
  // The image column, its thumbnail strip and the B/A tab bar are ALWAYS dark
  // (bg-zinc-900 / bg-zinc-950) in both themes, so accents shown against them
  // must use the always-bright variant — not the page `accent`, which is the
  // near-black light variant in light mode and would vanish on the dark bar.
  const accentOnDark = HUB_COLORS[project.hub as HubKey].accentDark
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA     = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg  = (project as any).afterImage  as string | undefined
  const shareUrl  = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`

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
        // "One card" unification: consistent border wraps the WHOLE modal
        // (image + info panel together) rather than each half looking
        // like its own separate zone.
        "border border-zinc-200 dark:border-zinc-800",
        isMobile
          ? "h-full rounded-none border-x-0"
          : "rounded-[14px] h-[85vh] md:max-w-5xl md:overflow-hidden animate-in zoom-in-95 duration-500",
      )}>

        {isMobile ? (
          <>
            {/* Image shrunk from 42% to 38% of vertical space */}
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

                  <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-end px-3 pt-3 pb-8 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); onClose() }}
                      aria-label="Close"
                      className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-90 pointer-events-auto", CHIP)}
                    >
                      <X size={17} weight="bold" />
                    </button>
                  </div>

                  {/* Like/Share moved HERE — stacked vertically on the
                      image's right edge, mid-height — replacing the old
                      position in the sticky header pill below the title.
                      Project-nav arrows removed from the image entirely
                      (see ProjectNav in the info panel below instead). */}
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

            <div ref={detailsRef} className="flex-1 overflow-y-auto overscroll-contain">
              <div className={cn(
                "sticky top-0 z-20 pt-5 pb-4 px-6 bg-white dark:bg-zinc-950",
                "shadow-[0_10px_14px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_10px_14px_-10px_rgba(0,0,0,0.5)]"
              )}>
                <div className="flex justify-center">
                  <div className={cn("flex flex-col items-center gap-2 px-5 py-3 rounded-[16px]", ACRYLIC_PILL)}>
                    {/* Title font shrunk + clamped to a single line so
                        long titles don't push the layout around. */}
                    <h2 className="font-black text-base text-zinc-900 dark:text-zinc-50 text-center leading-snug max-w-[260px] truncate">
                      {project.title}
                    </h2>
                    <ProjectNav current={currentIdx + 1} total={siblings.length} onPrev={goPrevProject} onNext={goNextProject} accent={accent} />
                  </div>
                </div>

                {project.clientType && (
                  <p className={cn("text-[0.86rem] italic mt-3 text-center", project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500")}>
                    {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
                    {project.clientType === "client" && "Real client work"}
                    {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
                  </p>
                )}
              </div>

              <div className="px-6 pt-4 pb-6">
                <ProjectDetailsBody project={project} accent={accent} />
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

                    {/* Like/Share stay on the image on desktop (plenty of
                        room here), but project-nav arrows are removed —
                        navigation now lives next to "Project X/Y" in the
                        info panel header instead. */}
                    <div className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
                      <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
                    </div>
                    <div className="absolute top-3 right-14 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
                      <ShareButton url={shareUrl} title={project.title} />
                    </div>
                  </div>
                  {allImages.length > 1 && (
                    // Thumbnails shrunk (w-14 h-14 → w-11 h-11) to match
                    // mobile's size and free up more room for the main image
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
              {/* Acrylic header treatment now matches mobile, instead of
                  a plain flat bg. */}
              <div className={cn("shrink-0 px-6 md:px-8 pt-6 md:pt-8 pb-5 relative z-20 bg-white dark:bg-zinc-950", "shadow-[0_10px_14px_-10px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_14px_-10px_rgba(0,0,0,0.4)]")}>
                <span className="text-[0.84rem] font-black uppercase tracking-widest" style={{ color: accent }}>{project.tag}</span>
                {hasBA && <span className="ml-2 text-[0.72rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before &amp; After</span>}
                {/* Title shrunk (from text-3xl/4xl) and clamped to one line */}
                <h2 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50 leading-snug mt-2 truncate">{project.title}</h2>
                {project.clientType && (
                  <p className={cn("text-[0.86rem] italic mt-2", project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500")}>
                    {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
                    {project.clientType === "client" && "Real client work"}
                    {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
                  </p>
                )}
                <div className="mt-3">
                  <ProjectNav current={currentIdx + 1} total={siblings.length} onPrev={goPrevProject} onNext={goNextProject} accent={accent} />
                </div>
              </div>

              <div ref={detailsRef} className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8 pt-5 pb-6">
                <ProjectDetailsBody project={project} accent={accent} />
              </div>

              {/* Footer bg treatment now matches mobile's acrylic feel */}
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
