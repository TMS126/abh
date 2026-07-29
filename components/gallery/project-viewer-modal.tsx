"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X, Check, CaretLeft, CaretRight, ArrowsLeftRight, EnvelopeSimple, WhatsappLogo } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, BRAND } from "@/lib/brand"
import { getContrastText } from "@/lib/color"
import { ProjectData } from "@/lib/data"
import { HubId, BA_HUBS, hubLabelFor, buildInquireHref } from "@/lib/gallery-helpers"
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

function ProjectHeader({
  project, hasBA, accent, shrink = 0, isMobile, hasSiblings, onPrev, onNext, positionLabel,
}: {
  project: ProjectData; hasBA: boolean; accent: string; shrink?: number
  isMobile: boolean; hasSiblings: boolean; onPrev: () => void; onNext: () => void; positionLabel?: string
}) {
  const titleStyle = shrink > 0 ? { fontSize: `${1.5 - shrink * 0.45}rem` } : undefined
  const showArrows = isMobile && hasSiblings

  return (
    <div style={{ marginBottom: shrink > 0 ? `${1.5 - shrink * 0.9}rem` : "1.5rem" }}>
      <span className="text-[0.7rem] font-black uppercase tracking-widest" style={{ color: accent }}>
        {project.tag}
      </span>
      {hasBA && (
        <span className="ml-2 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before &amp; After</span>
      )}

      <div className="flex items-center gap-2 mt-2">
        {showArrows && (
          <button
            onClick={onPrev}
            aria-label="Previous project"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            <CaretLeft size={16} weight="bold" />
          </button>
        )}
        <h2
          className="flex-1 min-w-0 font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50 leading-[1.1] transition-[font-size] duration-100"
          style={titleStyle}
        >
          {project.title}
        </h2>
        {showArrows && (
          <button
            onClick={onNext}
            aria-label="Next project"
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            <CaretRight size={16} weight="bold" />
          </button>
        )}
      </div>

      {showArrows && positionLabel && (
        <p className="text-[0.68rem] font-bold text-zinc-400 dark:text-zinc-500 mt-1">{positionLabel}</p>
      )}

      {project.clientType && (
        <p className={cn("text-[0.72rem] italic mt-2", project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500")}>
          {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
          {project.clientType === "client" && "Real client work"}
          {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
        </p>
      )}
    </div>
  )
}

function ProjectImageSection({
  project, accent, activeImg, setActiveImg, comparing, setComparing, onZoom, hasBA, beforeImg, afterImg, allImages,
  hasSiblings, onPrevProject, onNextProject, siblingPosition, liked, onToggleLike, shareUrl,
  isMobile, scrollProgress, onClose,
}: {
  project: ProjectData; accent: string
  activeImg: number; setActiveImg: (i: number) => void
  comparing: boolean; setComparing: (b: boolean) => void
  onZoom: (i: number) => void
  hasBA: boolean; beforeImg?: string; afterImg?: string
  allImages: string[]
  hasSiblings: boolean; onPrevProject: () => void; onNextProject: () => void
  siblingPosition?: string
  liked: boolean; onToggleLike: () => void; shareUrl: string
  isMobile: boolean; scrollProgress: number; onClose: () => void
}) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipeRef = useRef(false)

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
    onZoom(activeImg)
  }

  const IMG_HEIGHT_FULL = 42
  const IMG_HEIGHT_MIN  = 16
  const imgHeightPct = IMG_HEIGHT_FULL - scrollProgress * (IMG_HEIGHT_FULL - IMG_HEIGHT_MIN)

  return (
    <div
      className="md:h-auto md:flex-1 flex flex-col overflow-hidden bg-zinc-900 relative transition-[height] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={isMobile ? { height: `${imgHeightPct}%` } : undefined}
    >
      {comparing && hasBA ? (
        <div className="relative flex-1">
          <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
        </div>
      ) : (
        <>
          <div
            className="relative flex-1 overflow-hidden cursor-zoom-in group/img"
            onClick={handleImageClick}
            onTouchStart={onImageTouchStart}
            onTouchEnd={onImageTouchEnd}
          >
            {isMobile && (
              <img
                src={allImages[activeImg]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl pointer-events-none transition-opacity duration-300"
                style={{ opacity: scrollProgress * 0.85 }}
              />
            )}

            <div className="absolute inset-0 scale-105">
              <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="(max-width: 768px) 100vw, 55vw" className="relative object-contain transition-opacity duration-300" priority={activeImg === 0} />
            </div>

            {/* ── Desktop: unchanged — like top-left, share top-right ── */}
            {!isMobile && (
              <>
                <div
                  className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LikeButton liked={liked} onToggle={(e) => { e.stopPropagation(); onToggleLike() }} context="header" />
                </div>
                <div
                  className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShareButton url={shareUrl} title={project.title} />
                </div>
              </>
            )}

            {/* ── Mobile: X, Heart, Share stacked vertically, bottom-right of image ── */}
            {isMobile && (
              <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onClose() }}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg text-white transition-colors active:scale-90"
                >
                  <X size={18} weight="bold" />
                </button>
                <div
                  className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LikeButton liked={liked} onToggle={(e) => { e.stopPropagation(); onToggleLike() }} context="header" />
                </div>
                <div
                  className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors [&_svg]:text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShareButton url={shareUrl} title={project.title} />
                </div>
              </div>
            )}

            {/* ── Desktop keeps its own prev/next-project arrows + position pill on the image; mobile now handles both via the header instead ── */}
            {!isMobile && hasSiblings && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onPrevProject() }}
                  aria-label="Previous project"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors active:scale-90"
                >
                  <CaretLeft size={16} weight="bold" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNextProject() }}
                  aria-label="Next project"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors active:scale-90"
                >
                  <CaretRight size={16} weight="bold" />
                </button>
                {siblingPosition && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[0.62rem] font-bold tracking-widest">
                    {siblingPosition}
                  </div>
                )}
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex justify-center gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-t border-white/10">
              {allImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImg(idx)}
                  className={cn("relative shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-[8px] overflow-hidden border-2 transition-all", activeImg === idx ? "scale-105" : "border-transparent opacity-50 hover:opacity-80")}
                  style={activeImg === idx ? { borderColor: accent } : {}}
                >
                  <SafeImage src={img} alt={`Thumb ${idx + 1}`} accent={accent} fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {hasBA && (
        <div className="shrink-0 flex border-t border-white/10 bg-zinc-950">
          <button onClick={() => setComparing(false)} className={cn("flex-1 py-2.5 text-[0.65rem] font-black uppercase tracking-widest transition-all duration-200", !comparing ? "text-white" : "text-white/30 hover:text-white/60")} style={!comparing ? { borderBottom: `2px solid ${accent}` } : {}} >Gallery</button>
          <button onClick={() => setComparing(true)} className={cn("flex-1 py-2.5 text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-200", comparing ? "text-white" : "text-white/30 hover:text-white/60")} style={comparing ? { borderBottom: `2px solid ${accent}` } : {}}><ArrowsLeftRight size={13} weight="bold" />Before / After</button>
        </div>
      )}
    </div>
  )
}

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

function ProjectCTAs({ project, onClose, accent, activeImage }: {
  project: ProjectData; onClose: () => void; accent: string; activeImage: string
}) {
  const solidBtnText = getContrastText(accent)

  return (
    <div className="relative rounded-[14px] overflow-hidden p-2.5">
      <img
        src={activeImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 pointer-events-none"
      />
      <div className="absolute inset-0 rounded-[14px]" style={{ backgroundColor: `${accent}55`, backdropFilter: "blur(6px)" }} />

      <div className="relative flex flex-col gap-2.5">
        <a
          href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center justify-center gap-2 py-4 rounded-[14px] text-sm font-black shadow-lg transition-transform active:scale-[0.98] text-center"
          style={{ backgroundColor: accent, color: solidBtnText }}
        >
          <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
          Get a project like this
        </a>
        <Link
          href={buildInquireHref(project)}
          className="flex items-center justify-center gap-2 py-4 rounded-[14px] text-sm font-black border-2 bg-white/90 dark:bg-zinc-950/90 transition-transform active:scale-[0.98] text-center"
          style={{ borderColor: accent, color: accent }}
        >
          <EnvelopeSimple size={16} weight="bold" aria-hidden="true" />
          Inquire about this
        </Link>
      </div>
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
  const [shadowOpacity, setShadowOpacity] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveImg(0)
    setComparing(false)
    setShadowOpacity(0)
    setScrollProgress(0)
    if (detailsRef.current) detailsRef.current.scrollTop = 0
  }, [project?.id])

  const SHADOW_FADE_DISTANCE = 40
  const SHRINK_SCROLL_DISTANCE = 140
  const handleDetailsScroll = () => {
    if (!detailsRef.current) return
    const top = detailsRef.current.scrollTop
    setShadowOpacity(Math.min(top / SHADOW_FADE_DISTANCE, 1))
    setScrollProgress(Math.min(top / SHRINK_SCROLL_DISTANCE, 1))
  }

  const headerFooterShrink = isMobile ? scrollProgress : 0

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
  const siblingPosition = hasSiblings ? `${currentIdx + 1} / ${siblings.length}` : undefined
  const positionLabel   = hasSiblings ? `Project ${currentIdx + 1} of ${siblings.length}` : undefined

  return (
    <div className="fixed inset-0 z-[10200] flex items-end md:items-center justify-center md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className={cn(
        "relative w-full abh-shadow-modal bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800",
        "rounded-t-[20px] md:rounded-[14px]",
        "flex flex-col md:flex-row",
        "h-[95vh] md:h-[85vh] md:max-w-5xl md:overflow-hidden",
        "animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-500",
      )}>

        {/* Desktop-only: X stays top-right of the whole modal. Mobile's X
            lives in the bottom-right vertical stack over the image instead
            (see ProjectImageSection), so it isn't duplicated here. */}
        {!isMobile && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 z-40 w-9 h-9 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg text-white transition-colors active:scale-90"
          >
            <X size={18} weight="bold" />
          </button>
        )}

        <ProjectImageSection
          project={project}
          accent={accent}
          activeImg={activeImg}
          setActiveImg={setActiveImg}
          comparing={comparing}
          setComparing={setComparing}
          onZoom={setZoomIndex}
          hasBA={hasBA}
          beforeImg={beforeImg}
          afterImg={afterImg}
          allImages={allImages}
          hasSiblings={hasSiblings}
          onPrevProject={goPrevProject}
          onNextProject={goNextProject}
          siblingPosition={siblingPosition}
          liked={likedIds.has(project.id)}
          onToggleLike={() => onToggleLike(project.id)}
          shareUrl={shareUrl}
          isMobile={isMobile}
          scrollProgress={scrollProgress}
          onClose={onClose}
        />

        <div
          className={cn(
            "relative flex flex-col border-zinc-100 dark:border-zinc-800",
            "flex-1 border-t md:h-auto md:flex-none md:border-t-0 md:border-l md:w-[380px]"
          )}
        >
          <div
            className="shrink-0 px-6 md:px-8 relative z-20 bg-white dark:bg-zinc-950 transition-[padding] duration-100"
            style={{ paddingTop: `${1.5 - headerFooterShrink * 0.6}rem` }}
          >
            <ProjectHeader
              project={project}
              accent={accent}
              hasBA={hasBA}
              shrink={headerFooterShrink}
              isMobile={isMobile}
              hasSiblings={hasSiblings}
              onPrev={goPrevProject}
              onNext={goNextProject}
              positionLabel={positionLabel}
            />
          </div>

          <div className="relative h-0 z-10 pointer-events-none" aria-hidden>
            <div
              className="absolute -inset-x-6 md:-inset-x-8 -top-px h-5"
              style={{
                opacity: shadowOpacity,
                transition: "opacity 60ms linear",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0) 100%)",
              }}
            />
          </div>

          <div
            ref={detailsRef}
            onScroll={handleDetailsScroll}
            className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-8 pb-6"
          >
            <ProjectDetailsBody project={project} accent={accent} />
            {hasSiblings && !isMobile && (
              <p className="hidden md:block text-[0.65rem] font-medium text-zinc-400 text-center mt-6">
                Use ← → to browse other {hubLabelFor(project.hub)} projects
              </p>
            )}
          </div>

          <div
            className="shrink-0 px-6 md:px-8 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-20 transition-[padding] duration-100"
            style={{
              paddingTop: `${1 - headerFooterShrink * 0.4}rem`,
              paddingBottom: `${1.5 - headerFooterShrink * 0.6}rem`,
            }}
          >
            <ProjectCTAs project={project} onClose={onClose} accent={accent} activeImage={allImages[activeImg]} />
          </div>
        </div>
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