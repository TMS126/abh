"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X, Check, CaretLeft, CaretRight, ArrowsLeftRight, EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ } from "@/lib/brand"
import { ProjectData } from "@/lib/data"
import { HubId, BA_HUBS, buildInquireHref } from "@/lib/gallery-helpers"
import { SafeImage } from "./safe-image"
import { BeforeAfterSlider } from "./before-after-slider"
import { ZoomOverlay } from "./zoom-overlay"
import { LikeButton, ShareButton } from "./like-share-buttons"

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

function ProjectDetailsBody({ project, accent }: { project: ProjectData; accent: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <h4 className="text-[0.62rem] font-black uppercase tracking-widest mb-2 text-zinc-400 dark:text-zinc-500">The Goal</h4>
        <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">{project.clientGoal}</p>
      </div>
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <h4 className="text-[0.62rem] font-black uppercase tracking-widest mb-2 text-zinc-400 dark:text-zinc-500">What we did</h4>
        <ul className="space-y-2">
          {project.whatWeDid.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-200 font-medium">
              <Check size={14} weight="bold" className="mt-1 shrink-0" style={{ color: accent }} />{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <h4 className="text-[0.62rem] font-black uppercase tracking-widest mb-2 text-zinc-400 dark:text-zinc-500">The Result</h4>
        <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">{project.result}</p>
      </div>
    </div>
  )
}

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
        className={btnBase}
        style={{ borderColor: accent, backgroundColor: `${accent}12`, color: accent }}
      >
        <WhatsappLogo size={20} weight="fill" aria-hidden="true" />
        <span className="text-xs font-black leading-tight">Get a project like this</span>
      </a>
      <Link
        href={buildInquireHref(project)}
        className={btnBase}
        style={{ borderColor: accent, color: accent }}
      >
        <EnvelopeSimple size={20} weight="bold" aria-hidden="true" />
        <span className="text-xs font-black leading-tight">Inquire about this</span>
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
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA     = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg  = (project as any).afterImage  as string | undefined
  const shareUrl  = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`
  const positionLabel = hasSiblings ? `Project ${currentIdx + 1} of ${siblings.length}` : undefined

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
    <div className="fixed inset-0 z-[10200] flex items-end md:items-center justify-center md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className={cn(
        "relative w-full abh-shadow-modal bg-white dark:bg-zinc-950",
        "flex flex-col md:flex-row",
        isMobile
          ? "h-full rounded-none"
          : "border border-zinc-100 dark:border-zinc-800 rounded-[14px] h-[85vh] md:max-w-5xl md:overflow-hidden animate-in zoom-in-95 duration-500",
      )}>

        {/* ── MOBILE: full-page layout ── */}
        {isMobile ? (
          <>
            <div className="relative h-[42%] shrink-0 overflow-hidden bg-zinc-900">
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

                  {/* Top overlay: just close + sibling nav — title/heart/share moved below */}
                  <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-end px-3 pt-3 pb-8 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                    <button
                      onClick={(e) => { e.stopPropagation(); onClose() }}
                      aria-label="Close"
                      className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-90 pointer-events-auto", CHIP)}
                    >
                      <X size={17} weight="bold" />
                    </button>
                  </div>

                  {hasSiblings && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); goPrevProject() }}
                        aria-label="Previous project"
                        className={cn("absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-90", CHIP)}
                      >
                        <CaretLeft size={16} weight="bold" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); goNextProject() }}
                        aria-label="Next project"
                        className={cn("absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-90", CHIP)}
                      >
                        <CaretRight size={16} weight="bold" />
                      </button>
                    </>
                  )}

                  {allImages.length > 1 && (
                    <div className="absolute bottom-0 inset-x-0 z-10 flex justify-center gap-2 px-3 py-2.5 bg-gradient-to-t from-black/55 to-transparent overflow-x-auto no-scrollbar">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setActiveImg(idx) }}
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
                  className={cn("absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.65rem] font-black uppercase tracking-wider", CHIP)}
                >
                  <ArrowsLeftRight size={12} weight="bold" />
                  {comparing ? "Gallery" : "Before / After"}
                </button>
              )}
            </div>

            {/* ── Scrollable body: swipe pill + client type + like/share stay sticky at top, details scroll under them ── */}
            <div
              ref={detailsRef}
              className="flex-1 overflow-y-auto overscroll-contain"
            >
              <div className={cn(
                "sticky top-0 z-20 pt-5 pb-4 px-6 bg-white dark:bg-zinc-950",
                "shadow-[0_10px_14px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_10px_14px_-10px_rgba(0,0,0,0.5)]"
              )}>
                <div className="flex justify-center">
                  <div className={cn("flex flex-col items-center gap-1.5 px-5 py-3 rounded-[16px]", ACRYLIC_PILL)}>
                    <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-50 text-center leading-snug max-w-[240px]">{project.title}</h2>
                    {hasSiblings && (
                      <div className="flex items-center gap-2 text-[0.65rem] font-bold text-zinc-500 dark:text-zinc-400">
                        <button onClick={goPrevProject} aria-label="Previous project" className="active:scale-90 transition-transform">
                          <CaretLeft size={12} weight="bold" />
                        </button>
                        <span>Project {currentIdx + 1}/{siblings.length}</span>
                        <button onClick={goNextProject} aria-label="Next project" className="active:scale-90 transition-transform">
                          <CaretRight size={12} weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {project.clientType && (
                  <p className={cn("text-[0.72rem] italic mt-3 text-center", project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500")}>
                    {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
                    {project.clientType === "client" && "Real client work"}
                    {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
                  </p>
                )}

                <div className="flex justify-center items-center gap-3 mt-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700" onClick={(e) => e.stopPropagation()}>
                    <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700" onClick={(e) => e.stopPropagation()}>
                    <ShareButton url={shareUrl} title={project.title} />
                  </div>
                </div>
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
          // ── DESKTOP: unchanged layout, left/right split ──
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
                  <div
                    className="relative flex-1 overflow-hidden cursor-zoom-in group/img"
                    onClick={handleImageClick}
                  >
                    <div className="absolute inset-0 scale-105">
                      <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="55vw" className="relative object-contain" priority={activeImg === 0} />
                    </div>

                    <div className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
                      <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
                    </div>
                    <div className="absolute top-3 right-14 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
                      <ShareButton url={shareUrl} title={project.title} />
                    </div>

                    {hasSiblings && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); goPrevProject() }} aria-label="Previous project" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors active:scale-90">
                          <CaretLeft size={16} weight="bold" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); goNextProject() }} aria-label="Next project" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors active:scale-90">
                          <CaretRight size={16} weight="bold" />
                        </button>
                        {positionLabel && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[0.62rem] font-bold tracking-widest">
                            {positionLabel}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex justify-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-t border-white/10">
                      {allImages.map((img, idx) => (
                        <button key={idx} onClick={() => setActiveImg(idx)} className={cn("relative shrink-0 w-14 h-14 rounded-[8px] overflow-hidden border-2 transition-all", activeImg === idx ? "scale-105" : "border-transparent opacity-50 hover:opacity-80")} style={activeImg === idx ? { borderColor: accent } : {}}>
                          <SafeImage src={img} alt={`Thumb ${idx + 1}`} accent={accent} fill sizes="56px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {hasBA && (
                <div className="shrink-0 flex border-t border-white/10 bg-zinc-950">
                  <button onClick={() => setComparing(false)} className={cn("flex-1 py-2.5 text-[0.65rem] font-black uppercase tracking-widest transition-all duration-200", !comparing ? "text-white" : "text-white/30 hover:text-white/60")} style={!comparing ? { borderBottom: `2px solid ${accent}` } : {}}>Gallery</button>
                  <button onClick={() => setComparing(true)} className={cn("flex-1 py-2.5 text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-200", comparing ? "text-white" : "text-white/30 hover:text-white/60")} style={comparing ? { borderBottom: `2px solid ${accent}` } : {}}><ArrowsLeftRight size={13} weight="bold" />Before / After</button>
                </div>
              )}
            </div>

            <div className="relative flex flex-col border-zinc-100 dark:border-zinc-800 flex-1 border-t md:h-auto md:flex-none md:border-t-0 md:border-l md:w-[380px]">
              <div className="shrink-0 px-6 md:px-8 pt-6 md:pt-8 relative z-20 bg-white dark:bg-zinc-950">
                <span className="text-[0.7rem] font-black uppercase tracking-widest" style={{ color: accent }}>{project.tag}</span>
                {hasBA && <span className="ml-2 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before &amp; After</span>}
                <h2 className="font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50 leading-[1.1] mt-2">{project.title}</h2>
                {project.clientType && (
                  <p className={cn("text-[0.72rem] italic mt-2", project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500")}>
                    {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
                    {project.clientType === "client" && "Real client work"}
                    {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
                  </p>
                )}
              </div>

              <div ref={detailsRef} className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8 pt-5 md:pt-0 pb-6">
                <ProjectDetailsBody project={project} accent={accent} />
              </div>

              <div className="shrink-0 px-6 md:px-8 pt-4 pb-6 md:pb-8 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-20">
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
