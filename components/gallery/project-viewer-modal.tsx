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
import { HubIcon } from "@/components/services-page/shared"
import { SafeImage } from "./safe-image"
import { BeforeAfterSlider } from "./before-after-slider"
import { ZoomOverlay } from "./zoom-overlay"
import { LikeButton, ShareButton } from "./like-share-buttons"

// ── Goal / What we did / Result ──
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

// ── Order / Ask CTAs ──
function ProjectCTAs({ project, onClose, accent }: { project: ProjectData; onClose: () => void; accent: string }) {
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
      <Link href={buildInquireHref(project)} aria-label={`Ask a question about ${project.title}`} className={btnBase} style={{ color: accent }}>
        <EnvelopeSimple size={18} weight="bold" aria-hidden="true" />
        Ask
      </Link>
    </div>
  )
}

// ── Other Projects — horizontally scrollable pills ──
function OtherProjectsPills({ siblings, currentId, accent, onSelect }: {
  siblings: ProjectData[]; currentId: string; accent: string; onSelect: (p: ProjectData) => void
}) {
  const others = siblings.filter((p) => p.id !== currentId)
  if (others.length === 0) return null
  return (
    <div className="px-6 pb-8 pt-2">
      <p className="text-[0.7rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2.5">
        Other Projects
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {others.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="shrink-0 flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors hover:border-current"
            style={{ color: accent }}
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

// ── Single-image viewer — exactly ONE image visible/focused at a time,
// no adjacent-image peeking. Swipe (touch) or the arrow buttons change
// the index by exactly one, never more. Arrows sit in the horizontal
// padding gutter AROUND the image (outside its rounded edge), not
// overlaid on the photo itself. Image fills full width, object-cover
// crops as needed rather than letterboxing.
function SingleImageViewer({
  images, activeIdx, setActiveIdx, accent, onTapImage,
}: {
  images: string[]; activeIdx: number; setActiveIdx: (i: number) => void
  accent: string; onTapImage: (i: number) => void
}) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipe = useRef(false)
  const hasMultiple = images.length > 1

  const goPrev = useCallback(() => setActiveIdx(activeIdx > 0 ? activeIdx - 1 : images.length - 1), [activeIdx, images.length, setActiveIdx])
  const goNext = useCallback(() => setActiveIdx(activeIdx < images.length - 1 ? activeIdx + 1 : 0), [activeIdx, images.length, setActiveIdx])

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
    // Exactly one step per swipe, regardless of swipe speed/distance.
    dx < 0 ? goNext() : goPrev()
  }
  const handleTap = () => {
    if (didSwipe.current) { didSwipe.current = false; return }
    onTapImage(activeIdx)
  }

  return (
    <div className="relative flex items-center gap-2 px-3 md:px-4">
      {hasMultiple && (
        <button
          onClick={goPrev}
          aria-label="Previous image"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-current active:scale-90"
          style={{ ["--tw-hover-color" as any]: accent }}
        >
          <CaretLeft size={15} weight="bold" />
        </button>
      )}

      <div
        className="relative flex-1 aspect-[4/3] max-h-[380px] rounded-[16px] overflow-hidden cursor-zoom-in"
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

        {/* Soft persistent fade at the bottom edge of the image itself —
            not scroll-triggered, always present — so the photo blends
            into the page rather than ending with a hard cut. */}
        <div
          className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.28))" }}
          aria-hidden="true"
        />

        {hasMultiple && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[0.68rem] font-bold tracking-widest">
            {activeIdx + 1} / {images.length}
          </div>
        )}
      </div>

      {hasMultiple && (
        <button
          onClick={goNext}
          aria-label="Next image"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-current active:scale-90"
          style={{ ["--tw-hover-color" as any]: accent }}
        >
          <CaretRight size={15} weight="bold" />
        </button>
      )}
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
  const [activeImg, setActiveImg] = useState(0)
  const [comparing, setComparing] = useState(false)

  useEffect(() => {
    setActiveImg(0)
    setComparing(false)
  }, [project?.id])

  useEffect(() => {
    if (!project || zoomIndex !== null) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [project, zoomIndex, onClose])

  if (!project) return null

  const accent = isDark ? HUB_COLORS[project.hub as HubKey].accentDark : HUB_COLORS[project.hub as HubKey].accentLight
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg = (project as any).afterImage as string | undefined
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`

  const handleTapImage = (idx: number) => {
    setZoomIndex(idx)
  }

  return (
    <div className="fixed inset-0 z-[10200] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label={project.title}>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto">

          {/* ── Header — sits ABOVE the image on the plain page
              background now, not overlaid on the photo. ── */}
          <div className="flex items-start justify-between gap-3 px-6 md:px-8 pt-6 pb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <HubIcon id={project.hub as HubId} size={13} color={accent} />
                <span className="text-[0.7rem] font-black uppercase tracking-widest" style={{ color: accent }}>{hubLabelFor(project.hub as HubId)}</span>
              </div>
              <h2 className="font-black text-lg md:text-xl text-zinc-900 dark:text-zinc-50 leading-snug mt-1 truncate">{project.title}</h2>
              {project.clientType && (
                <p className="text-[0.78rem] italic text-zinc-400 dark:text-zinc-500 mt-0.5">{CLIENT_TYPE_LABEL[project.clientType]}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-transform active:scale-90"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* ── Image — single focused image, arrows in the gutter
              beside it, not on top of it. Reduced from a fixed 42vh to
              a capped aspect ratio, freeing up more room for the info
              below without needing to scroll as far. ── */}
          <div className="relative">
            {comparing && hasBA ? (
              <div className="px-3 md:px-4">
                <div className="relative aspect-[4/3] max-h-[380px] rounded-[16px] overflow-hidden">
                  <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
                </div>
              </div>
            ) : (
              <SingleImageViewer
                images={allImages}
                activeIdx={activeImg}
                setActiveIdx={setActiveImg}
                accent={accent}
                onTapImage={handleTapImage}
              />
            )}
          </div>

          {/* ── Action row — like / before-after / share, now sitting
              below the image as a plain row on the page background,
              not floating chips over the photo. ── */}
          <div className="flex items-center justify-between px-6 md:px-8 pt-4 pb-2">
            <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
            {hasBA && (
              <button
                onClick={() => setComparing((v) => !v)}
                aria-label={comparing ? "Show gallery view" : "Show before and after comparison"}
                className="flex items-center gap-1.5 text-[0.78rem] font-black uppercase tracking-wider transition-opacity active:opacity-60"
                style={{ color: accent }}
              >
                <ArrowsLeftRight size={13} weight="bold" aria-hidden="true" />
                {comparing ? "Gallery" : "Before / After"}
              </button>
            )}
            <ShareButton url={shareUrl} title={project.title} />
          </div>

          {/* ── Info — everything below flows continuously from here,
              no hard section boundary against the image above it. ── */}
          <div className="px-6 md:px-8 pt-4 pb-4">
            <ProjectDetailsBody project={project} accent={accent} />
          </div>
          <div className="px-6 md:px-8 pb-4">
            <ProjectCTAs project={project} onClose={onClose} accent={accent} />
          </div>
          <OtherProjectsPills siblings={siblings} currentId={project.id} accent={accent} onSelect={onNavigate} />
        </div>
      </div>

      {zoomIndex !== null && (
        <ZoomOverlay images={allImages} startIndex={zoomIndex} onClose={onCloseZoom} title={project.title} />
      )}
    </div>
  )
      } 
