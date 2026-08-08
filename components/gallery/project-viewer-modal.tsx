// components/gallery/project-viewer-modal.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  X, ArrowsLeftRight, WhatsappLogo, EnvelopeSimple, Check,
  Heart, PaperPlaneTilt, CaretLeft, CaretRight,
} from "@phosphor-icons/react"
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

const CHIP = "bg-black/35 backdrop-blur-md border border-white/10 [&_svg]:text-white"

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

// ── Other Projects — horizontally scrollable pills, mobile only (desktop
// uses the peeking side-posts instead) ──
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

// ── Image peek carousel (mobile) — neighbouring IMAGES within the same
// project visible in pieces at the edges, native scroll-snap so it's
// swipeable on touch without custom drag handling. ──
function ImagePeekCarousel({
  images, activeIdx, setActiveIdx, accent, onTapImage,
}: {
  images: string[]; activeIdx: number; setActiveIdx: (i: number) => void
  accent: string; onTapImage: (i: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScroll = useRef(false)

  const onScroll = useCallback(() => {
    if (!trackRef.current || isProgrammaticScroll.current) return
    const track = trackRef.current
    const slideW = track.scrollWidth / images.length
    const idx = Math.round(track.scrollLeft / slideW)
    const clamped = Math.max(0, Math.min(idx, images.length - 1))
    if (clamped !== activeIdx) setActiveIdx(clamped)
  }, [images.length, activeIdx, setActiveIdx])

  useEffect(() => {
    if (!trackRef.current) return
    const slideW = trackRef.current.scrollWidth / images.length
    isProgrammaticScroll.current = true
    trackRef.current.scrollTo({ left: slideW * activeIdx, behavior: "smooth" })
    const t = setTimeout(() => { isProgrammaticScroll.current = false }, 400)
    return () => clearTimeout(t)
  }, [activeIdx, images.length])

  return (
    <div
      ref={trackRef}
      onScroll={onScroll}
      className="flex h-full overflow-x-auto no-scrollbar snap-x snap-mandatory px-[8%] gap-3"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {images.map((img, idx) => (
        <div
          key={idx}
          onClick={() => onTapImage(idx)}
          className="relative h-full shrink-0 rounded-[14px] overflow-hidden cursor-zoom-in transition-opacity duration-200"
          style={{ width: "84%", scrollSnapAlign: "center", opacity: idx === activeIdx ? 1 : 0.45 }}
        >
          <SafeImage src={img} alt={`Image ${idx + 1}`} accent={accent} fill sizes="84vw" className="object-cover" priority={idx === 0} />
        </div>
      ))}
    </div>
  )
}

// ── Desktop sibling peek — the neighbouring PROJECT's thumbnail, cut off
// at the viewport edge, with a small circular hub-icon badge overlapping
// its bottom edge (stand-in for Instagram's avatar). Clicking it (or the
// chevron beside it) navigates straight to that project. ──
function SiblingPeek({ project, side, onSelect }: {
  project: ProjectData; side: "left" | "right"; onSelect: () => void
}) {
  const accent = HUB_COLORS[project.hub as HubKey].accentLight
  return (
    <button
      onClick={onSelect}
      aria-label={`View ${project.title}`}
      className={cn(
        "relative hidden md:block shrink-0 w-[220px] h-[420px] rounded-[18px] overflow-hidden opacity-70 hover:opacity-90 transition-opacity duration-200",
        side === "left" ? "-mr-4" : "-ml-4"
      )}
    >
      <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="220px" className="object-cover" />
      <span
        className={cn(
          "absolute bottom-3 w-9 h-9 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-md bg-white dark:bg-zinc-900",
          side === "left" ? "left-3" : "right-3"
        )}
      >
        <HubIcon id={project.hub as HubId} size={16} color={accent} />
      </span>
    </button>
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

  const currentIdx = project ? siblings.findIndex((p) => p.id === project.id) : -1
  const prevProject = currentIdx > 0 ? siblings[currentIdx - 1] : null
  const nextProject = currentIdx !== -1 && currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null

  // ── Escape closes; arrow keys move between PROJECTS on desktop
  // (Instagram-style), zoom overlay handles its own Escape when open ──
  useEffect(() => {
    if (!project || zoomIndex !== null) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && prevProject) onNavigate(prevProject)
      if (e.key === "ArrowRight" && nextProject) onNavigate(nextProject)
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [project, zoomIndex, onClose, prevProject, nextProject, onNavigate])

  if (!project) return null

  const accent = isDark ? HUB_COLORS[project.hub as HubKey].accentDark : HUB_COLORS[project.hub as HubKey].accentLight
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg = (project as any).afterImage as string | undefined
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`
  const waOrderHref = `https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`

  const handleTapImage = (idx: number) => {
    if (idx === activeImg) {
      setZoomIndex(idx)
    } else {
      setActiveImg(idx)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10200] bg-white dark:bg-zinc-950 md:bg-black/85 flex flex-col md:items-center md:justify-center animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >

      {/* ══════════════════ MOBILE — unchanged full-bleed immersive viewer ══════════════════ */}
      <div className="flex md:hidden flex-col h-full">
        <div className="relative shrink-0 h-[42vh] bg-zinc-900">
          {comparing && hasBA ? (
            <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
          ) : (
            <ImagePeekCarousel
              images={allImages}
              activeIdx={activeImg}
              setActiveIdx={setActiveImg}
              accent={accent}
              onTapImage={handleTapImage}
            />
          )}

          <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between gap-3 px-5 pt-5 pb-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            <div className="min-w-0 pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <HubIcon id={project.hub as HubId} size={13} color="#fff" />
                <span className="text-[0.7rem] font-black uppercase tracking-widest text-white/85">{hubLabelFor(project.hub as HubId)}</span>
              </div>
              <h2 className="font-black text-lg text-white leading-snug mt-1 truncate max-w-[68vw]">{project.title}</h2>
              {project.clientType && (
                <p className="text-[0.78rem] italic text-white/60 mt-0.5">{CLIENT_TYPE_LABEL[project.clientType]}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className={cn("shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform active:scale-90 pointer-events-auto", CHIP)}
            >
              <X size={17} weight="bold" />
            </button>
          </div>

          {!comparing && (
            <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", CHIP)}>
                <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
              </div>
              {hasBA && (
                <button
                  onClick={() => setComparing(true)}
                  aria-label="Show before and after comparison"
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.72rem] font-black uppercase tracking-wider", CHIP)}
                >
                  <ArrowsLeftRight size={12} weight="bold" aria-hidden="true" />
                  Before / After
                </button>
              )}
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", CHIP)}>
                <ShareButton url={shareUrl} title={project.title} />
              </div>
            </div>
          )}
          {comparing && (
            <button
              onClick={() => setComparing(false)}
              aria-label="Show gallery view"
              className={cn("absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.72rem] font-black uppercase tracking-wider", CHIP)}
            >
              Gallery
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-6 pt-6 pb-4">
            <ProjectDetailsBody project={project} accent={accent} />
          </div>
          <div className="px-6 pb-4">
            <ProjectCTAs project={project} onClose={onClose} accent={accent} />
          </div>
          <OtherProjectsPills siblings={siblings} currentId={project.id} accent={accent} onSelect={onNavigate} />
        </div>
      </div>

      {/* ══════════════════ DESKTOP — Instagram-style: peeking siblings +
          chevrons outside a centered white card, close top-right of the
          whole viewport ══════════════════ */}
      <div className="hidden md:flex items-center justify-center w-full h-full px-4">

        <button
          onClick={onClose}
          aria-label="Close"
          className="fixed top-6 right-6 z-30 w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={20} weight="bold" />
        </button>

        <button
          onClick={() => prevProject && onNavigate(prevProject)}
          disabled={!prevProject}
          aria-label="Previous project"
          className="shrink-0 w-11 h-11 mr-4 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          <CaretLeft size={20} weight="bold" />
        </button>

        {prevProject && (
          <SiblingPeek project={prevProject} side="left" onSelect={() => onNavigate(prevProject)} />
        )}

        {/* ── Main card ── */}
        <div className="relative z-10 w-full max-w-[900px] max-h-[90vh] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4">

          {/* Header row — hub icon + name, turnaround as timestamp-style */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accent}15` }}
              >
                <HubIcon id={project.hub as HubId} size={16} color={accent} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.86rem] font-bold text-zinc-800 dark:text-zinc-100 truncate">
                  {hubLabelFor(project.hub as HubId)}
                  {project.clientType && (
                    <span className="font-normal text-zinc-400 dark:text-zinc-500"> · {CLIENT_TYPE_LABEL[project.clientType]}</span>
                  )}
                </p>
                {project.turnaround && (
                  <p className="text-[0.72rem] text-zinc-400 dark:text-zinc-500">{project.turnaround}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* Image */}
            <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-900">
              {comparing && hasBA ? (
                <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
              ) : (
                <SafeImage
                  src={allImages[activeImg]}
                  alt={`${project.title} — image ${activeImg + 1}`}
                  accent={accent}
                  fill
                  sizes="900px"
                  className="object-cover cursor-zoom-in"
                  priority
                />
              )}
              {!comparing && (
                <div
                  className="absolute inset-0 cursor-zoom-in"
                  onClick={() => setZoomIndex(activeImg)}
                  aria-hidden="true"
                />
              )}
              {hasBA && (
                <button
                  onClick={() => setComparing((c) => !c)}
                  aria-label="Toggle before and after comparison"
                  className={cn("absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[0.72rem] font-black uppercase tracking-wider", CHIP)}
                >
                  <ArrowsLeftRight size={12} weight="bold" aria-hidden="true" />
                  {comparing ? "Gallery" : "Before / After"}
                </button>
              )}
              {allImages.length > 1 && !comparing && (
                <div className="absolute bottom-3 right-3 flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      aria-label={`View image ${idx + 1}`}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        idx === activeImg ? "bg-white w-4" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Icon row — Like / Order / Share ... Ask (Instagram's
                heart / comment / share ... bookmark row, mapped to the
                real actions this project actually has) */}
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <div className="flex items-center gap-4">
                <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="header" />
                <a
                  href={waOrderHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Order a project like ${project.title} via WhatsApp`}
                  className="text-zinc-700 dark:text-zinc-200 hover:opacity-60 transition-opacity"
                >
                  <WhatsappLogo size={22} weight="regular" />
                </a>
                <ShareButton url={shareUrl} title={project.title} />
              </div>
              <Link
                href={buildInquireHref(project)}
                aria-label={`Ask a question about ${project.title}`}
                className="text-zinc-700 dark:text-zinc-200 hover:opacity-60 transition-opacity"
              >
                <EnvelopeSimple size={22} weight="regular" />
              </Link>
            </div>

            {/* Caption-style area — project title as the "username" line,
                Goal/What We Did/Result standing in for the caption body
                (this project has no comment thread to show underneath) */}
            <div className="px-5 pb-2 pt-1">
              <p className="text-[0.92rem] text-zinc-800 dark:text-zinc-100">
                <span className="font-bold">{project.title}</span>{" "}
                <span className="text-zinc-600 dark:text-zinc-300">{project.tag}</span>
              </p>
            </div>

            <div className="px-5 pb-6">
              <ProjectDetailsBody project={project} accent={accent} />
            </div>
          </div>

          {/* Bottom action bar — Order / Ask, standing in for Instagram's
              comment-input row */}
          <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800">
            <ProjectCTAs project={project} onClose={onClose} accent={accent} />
          </div>
        </div>

        {nextProject && (
          <SiblingPeek project={nextProject} side="right" onSelect={() => onNavigate(nextProject)} />
        )}

        <button
          onClick={() => nextProject && onNavigate(nextProject)}
          disabled={!nextProject}
          aria-label="Next project"
          className="shrink-0 w-11 h-11 ml-4 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-0 disabled:pointer-events-none"
        >
          <CaretRight size={20} weight="bold" />
        </button>
      </div>

      {zoomIndex !== null && (
        <ZoomOverlay images={allImages} startIndex={zoomIndex} onClose={onCloseZoom} title={project.title} />
      )}
    </div>
  )
    } 
