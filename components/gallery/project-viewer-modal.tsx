// components/gallery/project-viewer-modal.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X, CaretLeft, CaretRight, ArrowsLeftRight, WhatsappLogo, EnvelopeSimple, Check } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ } from "@/lib/brand"
import { ProjectData } from "@/lib/data"
import { HubId, BA_HUBS, hubLabelFor, CLIENT_TYPE_LABEL, buildInquireHref } from "@/lib/gallery-helpers"
import { HubIcon, useFocusTrap } from "@/components/services-page/shared"
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

const CHIP = "bg-black/35 backdrop-blur-md border border-white/10 [&_svg]:text-white"

// Graduated size pattern for the desktop image stack — cycled per index so
// a run of images reads as genuinely varied sizes, not uniform tiles.
const STACK_SIZE_RATIOS = [1, 0.72, 1, 0.6, 0.82]

// ===== SCROLL-BOUNDARY FADE — pinned to the top of a scrollable text
// region, so content fades out as it passes beneath the fixed section
// above it instead of being hard-clipped or divided by a border. =====
function ScrollFadeTop() {
  return (
    <div
      aria-hidden="true"
      className="sticky top-0 z-10 h-8 -mb-8 pointer-events-none bg-gradient-to-b from-white dark:from-zinc-950 to-transparent"
    />
  )
}

// ===== EXPANDABLE TEXT — clamps long paragraphs to 4 lines with a fade
// + "Read more…" toggle in the hub's accent color. `forceExpandable`
// makes the clamp/toggle appear regardless of length (used for The Goal,
// which should always offer it even when moderately short). =====
function ExpandableText({ text, accent, forceExpandable = false }: { text: string; accent: string; forceExpandable?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = forceExpandable || text.length > 220

  return (
    <div className="relative">
      <p
        className={cn(
          "text-base text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium",
          !expanded && isLong && "line-clamp-4"
        )}
      >
        {text}
      </p>
      {!expanded && isLong && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-6 h-10 pointer-events-none bg-gradient-to-t from-zinc-50 dark:from-zinc-900/60 to-transparent"
        />
      )}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="relative mt-1.5 text-[0.86rem] font-black focus-visible:outline-none focus-visible:underline"
          style={{ color: accent }}
        >
          {expanded ? "Show less" : "Read more…"}
        </button>
      )}
    </div>
  )
}

// ── Goal / What we did / Result ──
function ProjectDetailsBody({ project, accent }: { project: ProjectData; accent: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5">
        <h4 className="text-[0.74rem] font-black uppercase tracking-widest mb-2 text-zinc-400 dark:text-zinc-500">The Goal</h4>
        <ExpandableText text={project.clientGoal} accent={accent} forceExpandable />
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
        <ExpandableText text={project.result} accent={accent} />
      </div>
    </div>
  )
}

// ===== FLOATING ORDER/ASK PILL — unchanged. =====
function FloatingCTAPill({ project, onClose, accent }: { project: ProjectData; onClose: () => void; accent: string }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-6 pointer-events-none">
      <div
        className="pointer-events-auto flex items-stretch w-full max-w-sm rounded-full overflow-hidden backdrop-blur-xl bg-white/45 dark:bg-zinc-900/40 border border-white/40 dark:border-white/10"
        style={{ boxShadow: "0 16px 38px -10px rgba(0,0,0,0.35), 0 6px 16px -6px rgba(0,0,0,0.2)" }}
      >
        <a
          href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          aria-label={`Order a project like ${project.title} via WhatsApp`}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[0.92rem] font-black transition-opacity active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          style={{ color: accent, ["--tw-ring-color" as any]: accent }}
        >
          <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
          Order
        </a>
        <div className="w-px bg-zinc-300/60 dark:bg-zinc-600/60" aria-hidden="true" />
        <Link
          href={buildInquireHref(project)}
          aria-label={`Ask a question about ${project.title}`}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[0.92rem] font-black transition-opacity active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          style={{ color: accent, ["--tw-ring-color" as any]: accent }}
        >
          <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
          Ask
        </Link>
      </div>
    </div>
  )
}

// ===== FLOATING "OTHER PROJECTS" WIDGET (desktop only) — same floating
// treatment as the CTA pill, centered, sitting just above it. =====
function FloatingOtherProjectsWidget({ siblings, currentId, accent, onSelect }: {
  siblings: ProjectData[]; currentId: string; accent: string; onSelect: (p: ProjectData) => void
}) {
  const others = siblings.filter((p) => p.id !== currentId)
  if (others.length === 0) return null
  return (
    <div className="hidden md:flex fixed inset-x-0 bottom-24 z-30 justify-center px-6 pointer-events-none">
      <div
        className="pointer-events-auto flex items-center gap-2 max-w-xl overflow-x-auto no-scrollbar px-3 py-2.5 rounded-full backdrop-blur-xl bg-white/45 dark:bg-zinc-900/40 border border-white/40 dark:border-white/10"
        style={{ boxShadow: "0 16px 38px -10px rgba(0,0,0,0.3), 0 6px 16px -6px rgba(0,0,0,0.16)" }}
      >
        {others.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            aria-label={`View ${p.title}`}
            className="shrink-0 flex items-center gap-2 pl-1.5 pr-3.5 py-1 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 bg-white/60 dark:bg-zinc-900/60 transition-colors hover:border-current focus-visible:outline-none focus-visible:ring-2"
            style={{ color: accent, ["--tw-ring-color" as any]: accent }}
          >
            <span className="relative w-7 h-7 rounded-full overflow-hidden shrink-0">
              <SafeImage src={p.image} alt={p.title} accent={accent} fill sizes="28px" className="object-cover" />
            </span>
            <span className="text-[0.78rem] font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap max-w-[120px] truncate">{p.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ===== MOBILE IMAGE VIEWER — active image full-size, up to two more peek
// out to the right at progressively smaller scale (not just offset), all
// vertically centered. object-contain + page-matching background so no
// crop and no visible black letterbox bars. =====
function MobileStackedImageViewer({
  images, activeIdx, onPrev, onNext, accent, onTapImage,
}: {
  images: string[]; activeIdx: number; onPrev: () => void; onNext: () => void
  accent: string; onTapImage: (i: number) => void
}) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipe = useRef(false)
  const hasMultiple = images.length > 1

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    didSwipe.current = false
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!hasMultiple) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) < 40 || dy > Math.abs(dx)) return
    didSwipe.current = true
    dx < 0 ? onNext() : onPrev()
  }
  const handleTap = () => {
    if (didSwipe.current) { didSwipe.current = false; return }
    onTapImage(activeIdx)
  }

  return (
    <div className="relative flex items-center gap-2 px-3">
      {hasMultiple && (
        <button
          onClick={onPrev}
          aria-label="Previous image"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-current active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ ["--tw-ring-color" as any]: accent }}
        >
          <CaretLeft size={15} weight="bold" />
        </button>
      )}

      <div className="relative flex-1 aspect-[4/3] max-h-[380px]">
        {images.length > 2 && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[16px] overflow-hidden bg-white dark:bg-zinc-950"
            style={{ transform: "translateX(24px) scale(0.86)", opacity: 0.5, zIndex: 1 }}
          >
            <SafeImage src={images[(activeIdx + 2) % images.length]} alt="" accent={accent} fill sizes="20vw" className="object-contain" />
          </div>
        )}
        {hasMultiple && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[16px] overflow-hidden bg-white dark:bg-zinc-950"
            style={{ transform: "translateX(13px) scale(0.94)", opacity: 0.8, zIndex: 2 }}
          >
            <SafeImage src={images[(activeIdx + 1) % images.length]} alt="" accent={accent} fill sizes="20vw" className="object-contain" />
          </div>
        )}

        <div
          className="relative z-10 w-full h-full rounded-[16px] overflow-hidden cursor-zoom-in bg-white dark:bg-zinc-950"
          style={{ boxShadow: "0 18px 40px -14px rgba(0,0,0,0.35), 0 8px 18px -8px rgba(0,0,0,0.2)" }}
          onClick={handleTap}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <SafeImage
            key={activeIdx}
            src={images[activeIdx]}
            alt={`Image ${activeIdx + 1} of ${images.length}`}
            accent={accent}
            fill
            sizes="90vw"
            className="object-contain animate-in fade-in duration-200"
            priority={activeIdx === 0}
          />

          {/* Floating Like/Share — top-right, over the image */}
          <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", CHIP)}>
              <LikeButton liked={false} onToggle={() => {}} context="header" />
            </div>
          </div>

          {hasMultiple && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[0.68rem] font-bold tracking-widest" aria-live="polite">
              {activeIdx + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {hasMultiple && (
        <button
          onClick={onNext}
          aria-label="Next image"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-current active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ ["--tw-ring-color" as any]: accent }}
        >
          <CaretRight size={15} weight="bold" />
        </button>
      )}
    </div>
  )
}

// ===== DESKTOP VERTICAL IMAGE STACK — up to 5 images, graduated sizes
// (fixed pattern, independent of focus), greyscale when unfocused, hover
// zoom, click behavior: click an unfocused image → focus it; click the
// already-focused image → open zoom. Mouse wheel over the stack shifts
// focus like a mini carousel. =====
function DesktopImageStack({
  images, activeIdx, setActiveIdx, accent, onOpenZoom,
}: {
  images: string[]; activeIdx: number; setActiveIdx: (i: number) => void
  accent: string; onOpenZoom: (i: number) => void
}) {
  const handleWheel = (e: React.WheelEvent) => {
    if (images.length < 2) return
    if (Math.abs(e.deltaY) < 8) return
    e.preventDefault()
    if (e.deltaY > 0) setActiveIdx(activeIdx < images.length - 1 ? activeIdx + 1 : 0)
    else setActiveIdx(activeIdx > 0 ? activeIdx - 1 : images.length - 1)
  }

  return (
    <div className="flex flex-col gap-2.5 w-full h-full" onWheel={handleWheel}>
      {images.map((img, idx) => {
        const isActive = idx === activeIdx
        return (
          <div
            key={idx}
            onClick={() => (isActive ? onOpenZoom(idx) : setActiveIdx(idx))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); isActive ? onOpenZoom(idx) : setActiveIdx(idx) } }}
            aria-label={isActive ? `Open image ${idx + 1} of ${images.length}` : `Focus image ${idx + 1} of ${images.length}`}
            className="group/stackimg relative w-full rounded-[14px] overflow-hidden cursor-pointer bg-white dark:bg-zinc-950 transition-all duration-300"
            style={{
              flexGrow: STACK_SIZE_RATIOS[idx % STACK_SIZE_RATIOS.length],
              flexBasis: 0,
              minHeight: 0,
              boxShadow: isActive ? `0 14px 30px -12px ${accent}55` : "0 4px 12px -6px rgba(0,0,0,0.12)",
            }}
          >
            <SafeImage
              src={img}
              alt={`Image ${idx + 1} of ${images.length}`}
              accent={accent}
              fill
              sizes="34vw"
              className={cn(
                "object-contain transition-all duration-300 md:group-hover/stackimg:scale-105",
                !isActive && "grayscale opacity-70"
              )}
            />
            {isActive && (
              <div className="absolute inset-0 rounded-[14px] pointer-events-none" style={{ boxShadow: `inset 0 0 0 2px ${accent}` }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Header — hub label, title, client-type ──
function ProjectHeader({ project, accent, onClose }: { project: ProjectData; accent: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 px-6 md:px-8 pt-8 pb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <HubIcon id={project.hub as HubId} size={13} color={accent} />
          <span className="text-[0.7rem] font-black uppercase tracking-widest" style={{ color: accent }}>{hubLabelFor(project.hub as HubId)}</span>
        </div>
        <h2 id="project-viewer-title" className="font-black text-lg md:text-xl text-zinc-900 dark:text-zinc-50 leading-snug mt-1 truncate">{project.title}</h2>
        {project.clientType && (
          <p className="text-[0.78rem] italic text-zinc-400 dark:text-zinc-500 mt-0.5">{CLIENT_TYPE_LABEL[project.clientType]}</p>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Close project"
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ ["--tw-ring-color" as any]: accent }}
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  )
}

// ── Desktop only: Like • Project X of Y (with switch arrows) • Share,
// static row directly under the header. ──
function DesktopActionRow({
  project, likedIds, onToggleLike, shareUrl, currentIdx, siblingCount, onPrevProject, onNextProject,
}: {
  project: ProjectData
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  shareUrl: string
  currentIdx: number
  siblingCount: number
  onPrevProject: () => void
  onNextProject: () => void
}) {
  return (
    <div className="grid grid-cols-3 items-center px-6 md:px-8 pt-4 pb-2">
      <div className="justify-self-start">
        <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
      </div>
      <div className="justify-self-center flex items-center gap-2">
        {siblingCount > 1 && (
          <>
            <button
              onClick={onPrevProject}
              aria-label="Previous project"
              className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            >
              <CaretLeft size={13} weight="bold" />
            </button>
            <span className="text-[0.78rem] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap" aria-live="polite">
              Project {currentIdx + 1} of {siblingCount}
            </span>
            <button
              onClick={onNextProject}
              aria-label="Next project"
              className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            >
              <CaretRight size={13} weight="bold" />
            </button>
          </>
        )}
      </div>
      <div className="justify-self-end">
        <ShareButton url={shareUrl} title={project.title} />
      </div>
    </div>
  )
}

// ── Mobile only: floating "Project X of Y" pill, sits at the bottom of
// the image area (Like moved up to the image's top-right corner). ──
function MobileProjectNavPill({ currentIdx, siblingCount, onPrev, onNext, accent, shareUrl, title }: {
  currentIdx: number; siblingCount: number; onPrev: () => void; onNext: () => void
  accent: string; shareUrl: string; title: string
}) {
  return (
    <div className="flex items-center justify-center gap-2 px-3 pt-2">
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", "bg-zinc-100 dark:bg-zinc-900")}>
        {siblingCount > 1 && (
          <button onClick={onPrev} aria-label="Previous project" className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90">
            <CaretLeft size={12} weight="bold" />
          </button>
        )}
        <span className="text-[0.76rem] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
          {siblingCount > 1 ? `Project ${currentIdx + 1} of ${siblingCount}` : "1 project"}
        </span>
        {siblingCount > 1 && (
          <button onClick={onNext} aria-label="Next project" className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90">
            <CaretRight size={12} weight="bold" />
          </button>
        )}
      </div>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", "bg-zinc-100 dark:bg-zinc-900")}>
        <ShareButton url={shareUrl} title={title} />
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
  const [activeImg, setActiveImg] = useState(0)
  const [comparing, setComparing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveImg(0)
    setComparing(false)
  }, [project?.id])

  const currentIdx = project ? siblings.findIndex((p) => p.id === project.id) : -1
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
    if (!project) return
    const total = project.images?.length > 0 ? project.images.length : 1
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return }
      if (zoomIndex !== null || comparing) return
      if (e.key === "ArrowLeft") setActiveImg((i) => (i > 0 ? i - 1 : total - 1))
      if (e.key === "ArrowRight") setActiveImg((i) => (i < total - 1 ? i + 1 : 0))
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [project, zoomIndex, comparing, onClose])

  useFocusTrap(!!project, containerRef)

  if (!project) return null

  const accent = isDark ? HUB_COLORS[project.hub as HubKey].accentDark : HUB_COLORS[project.hub as HubKey].accentLight
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg = (project as any).afterImage as string | undefined
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`

  const goPrevImage = () => setActiveImg((i) => (i > 0 ? i - 1 : allImages.length - 1))
  const goNextImage = () => setActiveImg((i) => (i < allImages.length - 1 ? i + 1 : 0))
  const handleTapImage = (idx: number) => setZoomIndex(idx)

  const beforeAfterToggle = hasBA && (
    <button
      onClick={() => setComparing((v) => !v)}
      aria-label={comparing ? "Show gallery view" : "Show before and after comparison"}
      aria-pressed={comparing}
      className="absolute -top-2 right-3 md:top-3 md:right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.68rem] font-black uppercase tracking-wider bg-black/45 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <ArrowsLeftRight size={12} weight="bold" aria-hidden="true" />
      {comparing ? "Gallery" : "Before/After"}
    </button>
  )

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[10200] bg-white dark:bg-zinc-950 flex flex-col md:flex-row animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-viewer-title"
    >

      {isMobile ? (
        <div className="flex-1 min-h-0 flex flex-col">
          {/* ── Fixed: header + image (Like/Share/nav now float on the image) ── */}
          <div className="shrink-0">
            <ProjectHeader project={project} accent={accent} onClose={onClose} />
            <div className="relative">
              {beforeAfterToggle}
              {comparing && hasBA ? (
                <div className="px-3">
                  <div className="relative aspect-[4/3] max-h-[380px] rounded-[16px] overflow-hidden">
                    <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
                  </div>
                </div>
              ) : (
                <MobileStackedImageViewer
                  images={allImages}
                  activeIdx={activeImg}
                  onPrev={goPrevImage}
                  onNext={goNextImage}
                  accent={accent}
                  onTapImage={handleTapImage}
                />
              )}
            </div>
            <MobileProjectNavPill
              currentIdx={currentIdx}
              siblingCount={siblings.length}
              onPrev={goPrevProject}
              onNext={goNextProject}
              accent={accent}
              shareUrl={shareUrl}
              title={project.title}
            />
          </div>

          {/* ── Scrollable: text only, fades in right below the image ── */}
          <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <ScrollFadeTop />
            <div className="px-6 pt-4 pb-4">
              <ProjectDetailsBody project={project} accent={accent} />
            </div>
            <div className="h-28" aria-hidden="true" />
          </div>
        </div>
      ) : (
        <>
          {/* ── Left panel: image stack, no divider border, symmetric padding ── */}
          <div className="hidden md:flex md:w-[46%] md:h-full md:shrink-0 md:flex-col md:min-h-0">
            <div className="relative flex-1 min-h-0 p-8">
              {beforeAfterToggle}
              {comparing && hasBA ? (
                <div className="relative w-full h-full rounded-[16px] overflow-hidden">
                  <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
                </div>
              ) : (
                <DesktopImageStack
                  images={allImages}
                  activeIdx={activeImg}
                  setActiveIdx={setActiveImg}
                  accent={accent}
                  onOpenZoom={handleTapImage}
                />
              )}
            </div>
          </div>

          {/* ── Right panel: header + action row (fixed), text fades in below ── */}
          <div className="hidden md:flex md:flex-1 md:h-full md:flex-col md:min-h-0">
            <div className="shrink-0 max-w-xl">
              <ProjectHeader project={project} accent={accent} onClose={onClose} />
              <DesktopActionRow
                project={project}
                likedIds={likedIds}
                onToggleLike={onToggleLike}
                shareUrl={shareUrl}
                currentIdx={currentIdx}
                siblingCount={siblings.length}
                onPrevProject={goPrevProject}
                onNextProject={goNextProject}
              />
            </div>
            <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <ScrollFadeTop />
              <div className="max-w-xl px-6 md:px-8 pt-4 pb-4">
                <ProjectDetailsBody project={project} accent={accent} />
              </div>
              <div className="h-28" aria-hidden="true" />
            </div>
          </div>
        </>
      )}

      <FloatingOtherProjectsWidget siblings={siblings} currentId={project.id} accent={accent} onSelect={onNavigate} />
      <FloatingCTAPill project={project} onClose={onClose} accent={accent} />

      {zoomIndex !== null && (
        <ZoomOverlay images={allImages} startIndex={zoomIndex} onClose={onCloseZoom} title={project.title} />
      )}
    </div>
  )
  } 
