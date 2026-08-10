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

// ===== EXPANDABLE TEXT — clamps long paragraphs to 4 lines with a fade
// at the bottom edge and a "Read more…" toggle in the hub's accent
// color. Clicking it removes the clamp + fade; "Show less" restores
// both (the "reverse" behavior). ============================================
function ExpandableText({ text, accent }: { text: string; accent: string }) {
  const [expanded, setExpanded] = useState(false)
  // Simple, reliable overflow signal — real DOM measurement of a
  // line-clamped box is unreliable across browsers, so length is used
  // as a stand-in for "this won't fit in 4 lines."
  const isLong = text.length > 220

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
        <ExpandableText text={project.clientGoal} accent={accent} />
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

// ===== FLOATING ORDER/ASK PILL — one rounded-full clipping container so
// the outer edges read as round and the shared inner edge between the
// two buttons is naturally square/flat. Floats near the bottom (not
// pinned to the viewport edge), acrylic-blurred so page content shows
// faintly through it, with a soft shadow lifting it off the page. =====
function FloatingCTAPill({ project, onClose, accent }: { project: ProjectData; onClose: () => void; accent: string }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center px-6 pointer-events-none" aria-hidden={false}>
      <div
        className="pointer-events-auto flex items-stretch rounded-full overflow-hidden backdrop-blur-md bg-white/78 dark:bg-zinc-900/72 border border-white/50 dark:border-white/10"
        style={{ boxShadow: "0 16px 38px -10px rgba(0,0,0,0.35), 0 6px 16px -6px rgba(0,0,0,0.2)" }}
      >
        <a
          href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          aria-label={`Order a project like ${project.title} via WhatsApp`}
          className="flex items-center gap-2 pl-6 pr-5 py-3.5 text-[0.92rem] font-black transition-opacity active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          style={{ color: accent, ["--tw-ring-color" as any]: accent }}
        >
          <WhatsappLogo size={18} weight="fill" aria-hidden="true" />
          Order
        </a>
        <div className="w-px bg-zinc-300/70 dark:bg-zinc-600/70" aria-hidden="true" />
        <Link
          href={buildInquireHref(project)}
          aria-label={`Ask a question about ${project.title}`}
          className="flex items-center gap-2 pl-5 pr-6 py-3.5 text-[0.92rem] font-black transition-opacity active:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          style={{ color: accent, ["--tw-ring-color" as any]: accent }}
        >
          <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
          Ask
        </Link>
      </div>
    </div>
  )
}

// ── Other Projects — desktop only now; horizontally scrollable pills ──
function OtherProjectsPills({ siblings, currentId, accent, onSelect }: {
  siblings: ProjectData[]; currentId: string; accent: string; onSelect: (p: ProjectData) => void
}) {
  const others = siblings.filter((p) => p.id !== currentId)
  if (others.length === 0) return null
  return (
    <div className="px-6 md:px-8 pb-8 pt-2">
      <p className="text-[0.7rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5">
        Other Projects
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {others.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="shrink-0 flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors hover:border-current focus-visible:outline-none focus-visible:ring-2"
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

// ===== STACKED IMAGE VIEWER — the active image sits on top; up to two
// more images from the set peek out straight behind it (offset down
// and right, no rotation — like a neat stack of photo cards, not a
// fanned-out deck). Arrows live in the gutter beside the frame, never
// on top of the photo. Prev/Next are supplied by the parent so the
// same functions also drive Left/Right arrow-key navigation. =====
function StackedImageViewer({
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
    <div className="relative flex items-center gap-2 px-3 md:px-0">
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

      <div className="relative flex-1 aspect-[4/3] max-h-[380px] md:max-h-none md:aspect-auto md:h-full">
        {/* Peeking card #2 (further back) */}
        {images.length > 2 && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[16px] overflow-hidden"
            style={{ transform: "translate(20px, 20px) scale(0.92)", opacity: 0.45, zIndex: 1 }}
          >
            <SafeImage src={images[(activeIdx + 2) % images.length]} alt="" accent={accent} fill sizes="20vw" className="object-cover" />
          </div>
        )}
        {/* Peeking card #1 (closer) */}
        {hasMultiple && (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[16px] overflow-hidden"
            style={{ transform: "translate(11px, 11px) scale(0.96)", opacity: 0.72, zIndex: 2 }}
          >
            <SafeImage src={images[(activeIdx + 1) % images.length]} alt="" accent={accent} fill sizes="20vw" className="object-cover" />
          </div>
        )}

        {/* Front, active image */}
        <div
          className="relative z-10 w-full h-full rounded-[16px] overflow-hidden cursor-zoom-in"
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
            sizes="(max-width: 768px) 90vw, 500px"
            className="object-cover animate-in fade-in duration-200"
            priority={activeIdx === 0}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.28))" }}
            aria-hidden="true"
          />
          {hasMultiple && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[0.68rem] font-bold tracking-widest"
              aria-live="polite"
            >
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

// ── Compact header — hub label, title, client-type ──
function ProjectHeader({ project, accent, onClose }: { project: ProjectData; accent: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 px-6 md:px-8 pt-6 pb-4">
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

// ── Like • Project X of Y • Share — three-column grid so the counter
// sits truly centered regardless of what's in the outer two slots. ──
function ActionRow({
  project, likedIds, onToggleLike, shareUrl, currentIdx, siblingCount,
}: {
  project: ProjectData
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  shareUrl: string
  currentIdx: number
  siblingCount: number
}) {
  return (
    <div className="grid grid-cols-3 items-center px-6 md:px-8 pt-4 pb-2">
      <div className="justify-self-start">
        <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
      </div>
      <div className="justify-self-center" aria-live="polite">
        {siblingCount > 1 && (
          <span className="text-[0.78rem] font-bold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            Project {currentIdx + 1} of {siblingCount}
          </span>
        )}
      </div>
      <div className="justify-self-end">
        <ShareButton url={shareUrl} title={project.title} />
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

  // ── Keyboard: Escape closes; Left/Right cycle this project's own
  // photos (ignored while the before/after zoom overlay is open). ──
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
  const currentIdx = siblings.findIndex((p) => p.id === project.id)

  const goPrevImage = () => setActiveImg((i) => (i > 0 ? i - 1 : allImages.length - 1))
  const goNextImage = () => setActiveImg((i) => (i < allImages.length - 1 ? i + 1 : 0))
  const handleTapImage = (idx: number) => setZoomIndex(idx)

  const imageBlock = (
    <div className="relative">
      {hasBA && (
        <button
          onClick={() => setComparing((v) => !v)}
          aria-label={comparing ? "Show gallery view" : "Show before and after comparison"}
          aria-pressed={comparing}
          className="absolute -top-2 right-3 md:right-0 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.68rem] font-black uppercase tracking-wider bg-black/45 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowsLeftRight size={12} weight="bold" aria-hidden="true" />
          {comparing ? "Gallery" : "Before/After"}
        </button>
      )}
      {comparing && hasBA ? (
        <div className="px-3 md:px-0">
          <div className="relative aspect-[4/3] max-h-[380px] md:max-h-none md:h-full rounded-[16px] overflow-hidden">
            <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
          </div>
        </div>
      ) : (
        <StackedImageViewer
          images={allImages}
          activeIdx={activeImg}
          onPrev={goPrevImage}
          onNext={goNextImage}
          accent={accent}
          onTapImage={handleTapImage}
        />
      )}
    </div>
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
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-2xl mx-auto">
            <ProjectHeader project={project} accent={accent} onClose={onClose} />
            {imageBlock}
            <ActionRow
              project={project}
              likedIds={likedIds}
              onToggleLike={onToggleLike}
              shareUrl={shareUrl}
              currentIdx={currentIdx}
              siblingCount={siblings.length}
            />
            <div className="px-6 md:px-8 pt-4 pb-4">
              <ProjectDetailsBody project={project} accent={accent} />
            </div>
            {/* Other Projects removed on mobile per spec — the counter in
                ActionRow above covers "which project am I on" instead. */}
            <div className="h-28" aria-hidden="true" />
          </div>
        </div>
      ) : (
        <>
          {/* ── Desktop split: image pinned left, details scroll right ── */}
          <div className="md:w-[46%] md:h-full md:shrink-0 md:flex md:flex-col md:justify-center md:px-10 md:py-10 md:border-r md:border-zinc-100 dark:md:border-zinc-800">
            {imageBlock}
          </div>

          <div className="md:flex-1 md:h-full md:overflow-y-auto">
            <div className="md:max-w-xl">
              <ProjectHeader project={project} accent={accent} onClose={onClose} />
              <ActionRow
                project={project}
                likedIds={likedIds}
                onToggleLike={onToggleLike}
                shareUrl={shareUrl}
                currentIdx={currentIdx}
                siblingCount={siblings.length}
              />
              <div className="px-6 md:px-8 pt-4 pb-4">
                <ProjectDetailsBody project={project} accent={accent} />
              </div>
              <OtherProjectsPills siblings={siblings} currentId={project.id} accent={accent} onSelect={onNavigate} />
              <div className="h-28" aria-hidden="true" />
            </div>
          </div>
        </>
      )}

      <FloatingCTAPill project={project} onClose={onClose} accent={accent} />

      {zoomIndex !== null && (
        <ZoomOverlay images={allImages} startIndex={zoomIndex} onClose={onCloseZoom} title={project.title} />
      )}
    </div>
  )
        } 
