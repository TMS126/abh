"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X, Check, CaretLeft, CaretRight, ArrowsOut, ArrowsLeftRight, EnvelopeSimple, Heart } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, BRAND } from "@/lib/brand"
import { ProjectData } from "@/lib/data"
import { HubId, BA_HUBS, hubLabelFor, buildInquireHref } from "@/lib/gallery-helpers"
import { SafeImage } from "./safe-image"
import { BeforeAfterSlider } from "./before-after-slider"
import { ZoomOverlay } from "./zoom-overlay"
import { LikeButton, ShareButton } from "./like-share-buttons"

function ProjectHeader({ project, accent, hasBA, shareUrl, liked, onToggleLike, onClose }: {
  project: ProjectData; accent: string; hasBA: boolean; shareUrl: string
  liked: boolean; onToggleLike: () => void; onClose: () => void
}) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-[14px] mb-3 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>{project.tag}</span>
        {hasBA && (
          <span className="ml-2 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before &amp; After</span>
        )}
        <h2 className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-tight mt-1">{project.title}</h2>
        {project.clientType && (
          <p className={cn("text-[0.72rem] italic mt-1", project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500")}>
            {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
            {project.clientType === "client" && "Real client work"}
            {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
          </p>
        )}
        {liked && (
          <p className="flex items-center gap-1 text-[0.68rem] font-bold text-red-600 dark:text-red-400 mt-1.5 animate-in fade-in duration-300">
            <Heart size={11} weight="fill" />
            You liked this
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <LikeButton liked={liked} onToggle={(e) => { e.stopPropagation(); onToggleLike() }} context="header" />
        <ShareButton url={shareUrl} title={project.title} />
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  )
}

function ProjectImageSection({
  project, accent, activeImg, setActiveImg, comparing, setComparing, onZoom, hasBA, beforeImg, afterImg, allImages,
  hasSiblings, onPrevProject, onNextProject, siblingPosition,
}: {
  project: ProjectData; accent: string
  activeImg: number; setActiveImg: (i: number) => void
  comparing: boolean; setComparing: (b: boolean) => void
  onZoom: (i: number) => void
  hasBA: boolean; beforeImg?: string; afterImg?: string
  allImages: string[]
  hasSiblings: boolean; onPrevProject: () => void; onNextProject: () => void
  siblingPosition?: string
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

  return (
    <div className="h-[40%] md:h-auto md:flex-1 flex flex-col overflow-hidden bg-zinc-900">
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
            <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-contain transition-opacity duration-300" priority={activeImg === 0} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5"><ArrowsOut size={18} weight="bold" className="text-white" /></div>
            </div>

            {hasSiblings && (
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
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-black/40 text-white text-[0.6rem] font-bold tracking-widest">
                    {siblingPosition}
                  </div>
                )}
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-t border-white/10">
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

function ProjectDetailsBody({ project }: { project: ProjectData }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  return (
    <div className="space-y-6 md:space-y-8">
      <section>
        <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: blueColor }}>The Goal</h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{project.clientGoal}</p>
      </section>
      <section>
        <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: blueColor }}>What we did</h4>
        <ul className="space-y-2">
          {project.whatWeDid.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300 font-medium">
              <Check size={14} weight="bold" className="mt-1 shrink-0" style={{ color: blueColor }} />{item}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: blueColor }}>The Result</h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{project.result}</p>
      </section>
    </div>
  )
}

function ProjectCTAs({ project, onClose }: { project: ProjectData; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  return (
    <div className="space-y-2.5">
      <a
        href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[14px] text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
        style={{ backgroundColor: "#25D366" }}
      >
        Get a project like this
      </a>
      <Link
        href={buildInquireHref(project)}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[14px] text-sm font-bold border-2 transition-transform active:scale-[0.98]"
        style={{ borderColor: blueColor, color: blueColor }}
      >
        <EnvelopeSimple size={16} weight="bold" />
        Inquire about this
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
  const [activeImg,  setActiveImg]  = useState(0)
  const [comparing,  setComparing]  = useState(false)
  const [shadowOpacity, setShadowOpacity] = useState(0)
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveImg(0)
    setComparing(false)
    setShadowOpacity(0)
    if (detailsRef.current) detailsRef.current.scrollTop = 0
  }, [project?.id])

  const SHADOW_FADE_DISTANCE = 40
  const handleDetailsScroll = () => {
    if (!detailsRef.current) return
    const ratio = Math.min(detailsRef.current.scrollTop / SHADOW_FADE_DISTANCE, 1)
    setShadowOpacity(ratio)
  }

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

  const accent    = isDark ? HUB_COLORS[project.hub as HubKey].tagTextDark : HUB_COLORS[project.hub as HubKey].tagText
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA     = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg  = (project as any).afterImage  as string | undefined
  const shareUrl  = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`
  const siblingPosition = hasSiblings ? `${currentIdx + 1} / ${siblings.length}` : undefined

  return (
    <div className="fixed inset-0 z-[10200] flex items-end md:items-center justify-center md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className={cn(
        "relative w-full bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-100 dark:border-zinc-800",
        "rounded-t-[20px] md:rounded-[14px]",
        "flex flex-col md:flex-row",
        "h-[95vh] md:h-[85vh] md:max-w-5xl md:overflow-hidden",
        "animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-500",
      )}>

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
        />

        <div
          className={cn(
            "relative flex flex-col border-zinc-100 dark:border-zinc-800",
            "h-[60%] border-t md:h-auto md:border-t-0 md:border-l md:w-[380px]"
          )}
        >
          <div className="shrink-0 px-6 md:px-8 pt-6 md:pt-8 relative z-20 bg-white dark:bg-zinc-950">
            <ProjectHeader
              project={project}
              accent={accent}
              hasBA={hasBA}
              shareUrl={shareUrl}
              liked={likedIds.has(project.id)}
              onToggleLike={() => onToggleLike(project.id)}
              onClose={onClose}
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
            <ProjectDetailsBody project={project} />
            {hasSiblings && (
              <p className="hidden md:block text-[0.65rem] font-medium text-zinc-400 text-center mt-6">
                Use ← → to browse other {hubLabelFor(project.hub)} projects
              </p>
            )}
          </div>

          <div className="shrink-0 px-6 md:px-8 pt-4 pb-6 md:pb-8 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-20">
            <ProjectCTAs project={project} onClose={onClose} />
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
