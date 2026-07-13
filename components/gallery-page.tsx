"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { X, Check, Info, CaretLeft, CaretRight, CaretDown, Image as ImageIcon, ArrowsOut, ArrowsLeftRight, LinkSimple, ShareNetwork, EnvelopeSimple, MagnifyingGlass, Shuffle, Heart, ArrowUp } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, BRAND } from "@/lib/brand"
import { PROJECTS, ProjectData } from "@/lib/data"

type HubId = "print" | "doc" | "design" | "eservice" | "tech"

const ROW_ORDER: { id: HubId; label: string; short: string }[] = [
  { id: "print",    label: "Print Hub",     short: "Print" },
  { id: "design",   label: "Design Hub",    short: "Design" },
  { id: "doc",      label: "Document Hub",  short: "Document" },
  { id: "eservice", label: "E-Service Hub", short: "E-Service" },
  { id: "tech",     label: "Tech Hub",      short: "Tech" },
]

// Hubs that support before/after
const BA_HUBS: HubId[] = ["design", "tech"]

// Matches the "Service Needed" dropdown options on /contact (FORM_HUBS keys
// in contact-page.tsx) so the "Inquire about this" CTA can deep-link
// straight into a prefilled service selection.
function hubLabelFor(hub: string): string {
  return ROW_ORDER.find(r => r.id === hub)?.label ?? ""
}

function buildInquireHref(project: ProjectData): string {
  const params = new URLSearchParams({
    service: hubLabelFor(project.hub),
    message: `I'm interested in a project like "${project.title}" — could we discuss pricing and turnaround?`,
  })
  return `/contact?${params.toString()}`
}

// ─── Back-button modal stack ──────────────────────────────────────────────────
function useGalleryBackStack(
  selectedProject: ProjectData | null,
  setSelectedProject: (p: ProjectData | null) => void,
  zoomIndex: number | null,
  setZoomIndex: (i: number | null) => void,
) {
  const projectPushed = useRef(false)
  const zoomPushed = useRef(false)

  useEffect(() => {
    if (selectedProject && !projectPushed.current) {
      window.history.pushState({ abModal: "project" }, "")
      projectPushed.current = true
    }
  }, [selectedProject])

  useEffect(() => {
    if (zoomIndex !== null && !zoomPushed.current) {
      window.history.pushState({ abModal: "zoom" }, "")
      zoomPushed.current = true
    }
  }, [zoomIndex])

  useEffect(() => {
    const onPop = () => {
      if (zoomIndex !== null) {
        zoomPushed.current = false
        setZoomIndex(null)
        return
      }
      if (selectedProject) {
        projectPushed.current = false
        setSelectedProject(null)
        return
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [zoomIndex, selectedProject, setZoomIndex, setSelectedProject])

  // FIX #2 — closeProject now correctly closes zoom first before collapsing
  // the project layer, so the hardware back button doesn't skip the zoom
  // history entry and collapse both layers at once.
  const closeZoom = useCallback(() => {
    if (zoomPushed.current) {
      zoomPushed.current = false
      window.history.back()
    } else {
      setZoomIndex(null)
    }
  }, [setZoomIndex])

  const closeProject = useCallback(() => {
    if (zoomIndex !== null) {
      // Close the zoom layer first; project stays open.
      if (zoomPushed.current) {
        zoomPushed.current = false
        window.history.back()
      } else {
        setZoomIndex(null)
      }
      return
    }
    if (projectPushed.current) {
      projectPushed.current = false
      window.history.back()
    } else {
      setSelectedProject(null)
    }
  }, [zoomIndex, setZoomIndex, setSelectedProject])

  return { closeProject, closeZoom }
}

// ─── Image placeholder ────────────────────────────────────────────────────────
function ImagePlaceholder({ accent, label }: { accent: string; label?: string }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 select-none"
      style={{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 60%, transparent 100%)` }}
    >
      <div className="absolute w-48 h-48 rounded-full opacity-10" style={{ border: `2px solid ${accent}`, top: "10%", right: "-10%" }} />
      <div className="absolute w-28 h-28 rounded-full opacity-10" style={{ border: `2px solid ${accent}`, bottom: "5%", left: "-5%" }} />
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${accent}20`, border: `1.5px solid ${accent}30` }}>
        <ImageIcon size={26} weight="thin" style={{ color: accent }} />
      </div>
      <p className="text-xs font-bold tracking-wider uppercase opacity-60" style={{ color: accent }}>{label ?? "No image"}</p>
    </div>
  )
}

function SafeImage({ src, alt, accent, fill, sizes, className, priority = false }: {
  src: string; alt: string; accent: string
  fill?: boolean; sizes?: string; className?: string; priority?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  if (!src || src === "" || failed) return <ImagePlaceholder accent={accent} label={alt} />
  return (
    <>
      {!loaded && <ImagePlaceholder accent={accent} label={alt} />}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        className={cn(className, "transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        loading={priority ? undefined : "lazy"}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
        priority={priority}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}

// ─── Before / After drag-reveal slider ───────────────────────────────────────
function BeforeAfterSlider({ before, after, accent }: { before: string; after: string; accent: string }) {
  const [pos, setPos] = useState(50)
  const targetRef = useRef(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  // FIX #5 — RAF loop only re-schedules itself while the handle is still
  // moving, rather than running unconditionally at 60 fps forever.
  useEffect(() => {
    let rafId: number
    const animate = () => {
      setPos(p => {
        const diff = targetRef.current - p
        if (Math.abs(diff) < 0.1) return targetRef.current
        rafId = requestAnimationFrame(animate)
        return p + diff * 0.2
      })
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  useEffect(() => {
    if (revealed) return
    const timer = setTimeout(() => {
      targetRef.current = 25
      setTimeout(() => { targetRef.current = 75; setTimeout(() => { targetRef.current = 50; setRevealed(true) }, 400) }, 400)
    }, 600)
    return () => clearTimeout(timer)
  }, [revealed])

  const updatePos = (clientX: number) => {
    if (!containerRef.current) return
    const { left, width } = containerRef.current.getBoundingClientRect()
    targetRef.current = Math.max(2, Math.min(98, ((clientX - left) / width) * 100))
    if ("vibrate" in navigator) navigator.vibrate(1)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    updatePos(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons) updatePos(e.clientX)
  }
  const onDoubleClick = () => { targetRef.current = 50 }

  const safePos = Math.max(pos, 1)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-col-resize touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={onDoubleClick}
    >
      <div className="absolute inset-0">
        <SafeImage src={after} alt="After" accent={accent} fill sizes="55vw" className="object-cover" priority />
        <span className="absolute bottom-3 right-3 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white shadow" style={{ backgroundColor: `${accent}cc` }}>After</span>
      </div>

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <div className="absolute inset-0" style={{ width: `${10000 / safePos}%` }}>
          <SafeImage src={before} alt="Before" accent={accent} fill sizes="55vw" className="object-cover" priority />
        </div>
        <span className="absolute bottom-3 left-3 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/50 text-white shadow">Before</span>
      </div>

      <div className="absolute top-0 bottom-0 w-0.5 pointer-events-none" style={{ left: `${pos}%`, backgroundColor: "rgba(255,255,255,0.9)", boxShadow: "0 0 8px rgba(0,0,0,0.4)", transform: "translateX(-0.5px)" }} />

      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl border-2 border-white/90 backdrop-blur-sm transition-transform hover:scale-110" style={{ backgroundColor: accent }}>
          <ArrowsLeftRight size={18} weight="bold" className="text-white" />
        </div>
        {!revealed && <div className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: accent }} />}
      </div>

      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold text-white/60 uppercase tracking-widest whitespace-nowrap pointer-events-none">
        Drag • Double-tap to reset
      </p>
    </div>
  )
}

// ─── Zoom overlay ─────────────────────────────────────────────────────────────
// FIX #10 — accepts a `title` prop so the zoomed image gets a meaningful
// alt string instead of a generic "Zoomed image N".
function ZoomOverlay({ images, startIndex, onClose, title }: {
  images: string[]
  startIndex: number
  onClose: () => void
  title: string
}) {
  const [idx, setIdx]   = useState(startIndex)
  const touchStartX     = useRef(0)
  const touchStartY     = useRef(0)

  // FIX #1 — use functional updaters inside the keydown listener so it
  // never captures a stale `idx` value. Previously, ArrowLeft/Right stopped
  // working after the first image change because the listener closed over
  // the initial idx = 0.
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose()
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + images.length) % images.length)
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % images.length)
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [onClose, images.length])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) < 40 || dy > Math.abs(dx)) return
    dx < 0
      ? setIdx(i => (i + 1) % images.length)
      : setIdx(i => (i - 1 + images.length) % images.length)
  }

  return (
    <div
      className="fixed inset-0 z-[10300] bg-black/97 flex items-center justify-center animate-in fade-in duration-200"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button onClick={onClose} className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90">
        <X size={18} weight="bold" />
      </button>
      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-[0.7rem] font-bold tracking-widest">
          {idx + 1} / {images.length}
        </div>
      )}
      <div className="relative w-full h-full flex items-center justify-center px-4">
        <img
          key={idx}
          src={images[idx]}
          alt={`${title} — image ${idx + 1} of ${images.length}`}
          className="max-w-full max-h-[90dvh] object-contain rounded-[14px] shadow-2xl select-none animate-in zoom-in-95 duration-200"
          draggable={false}
          onClick={onClose}
        />
      </div>
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90"
          >
            <CaretLeft size={18} weight="bold" />
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </>
      )}
      {images.length > 1 && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap pointer-events-none">
          Swipe or use arrow keys
        </p>
      )}
    </div>
  )
}

// ─── Share / copy-link button ─────────────────────────────────────────────────
function ShareButton({ url, title }: { url: string; title: string }) {
  const [shared, setShared] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: `Check out "${title}" from Apexbytes Hub`, url })
        return
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      timeoutRef.current = setTimeout(() => setShared(false), 1500)
    } catch {
      // fail silently
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share

  return (
    <button
      onClick={handleShare}
      aria-label="Share this project"
      className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0 transition-colors"
    >
      {shared ? <Check size={16} weight="bold" className="text-green-500" /> : canNativeShare ? <ShareNetwork size={16} weight="bold" /> : <LinkSimple size={16} weight="bold" />}
    </button>
  )
}

// ─── Like (heart) button ──────────────────────────────────────────────────────
// FIX #11 — aria-pressed is present unconditionally on both context variants.
// WCAG NOTE: the "liked" red uses a light/dark pair (red-600 / red-400)
// instead of a single hardcoded hex. red-600 hits 4.83:1 on white, and
// red-400 hits ~7.2:1 on the zinc-950 dark-mode panel.
function LikeButton({ liked, onToggle, context = "header" }: {
  liked: boolean
  onToggle: (e: React.MouseEvent) => void
  context?: "card" | "header"
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={liked ? "Unlike this project" : "Like this project"}
      aria-pressed={liked}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90",
        context === "card"
          ? "bg-black/40 hover:bg-black/60 backdrop-blur-sm"
          : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      )}
    >
      <Heart
        key={liked ? "liked" : "unliked"}
        size={16}
        weight={liked ? "fill" : "bold"}
        className={cn(
          "animate-in zoom-in-50 duration-300",
          liked ? "text-red-600 dark:text-red-400" : context === "card" ? "text-white" : ""
        )}
      />
    </button>
  )
}

// ─── Project header ───────────────────────────────────────────────────────────
function ProjectHeader({ project, accent, hasBA, shareUrl, liked, onToggleLike, onClose }: {
  project: ProjectData; accent: string; hasBA: boolean; shareUrl: string
  liked: boolean; onToggleLike: () => void; onClose: () => void
}) {
  return (
    <div className="flex justify-between items-start mb-6 shrink-0">
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
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  )
}

// ─── Project image section ────────────────────────────────────────────────────
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
            <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover transition-opacity duration-300" priority={activeImg === 0} />
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

// ─── Project details panel ────────────────────────────────────────────────────
function ProjectDetailsPanel({ project, accent, onClose }: { project: ProjectData; accent: string; onClose: () => void }) {
  return (
    <div className="space-y-6 md:space-y-8">
      <section>
        <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>The Goal</h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{project.clientGoal}</p>
      </section>
      <section>
        <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>What we did</h4>
        <ul className="space-y-2">
          {project.whatWeDid.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300 font-medium">
              <Check size={14} weight="bold" className="mt-1 shrink-0" style={{ color: accent }} />{item}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>The Result</h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{project.result}</p>
      </section>

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
          style={{ borderColor: accent, color: accent }}
        >
          <EnvelopeSimple size={16} weight="bold" />
          Inquire about this
        </Link>
      </div>
    </div>
  )
}

// ─── Project viewer modal ─────────────────────────────────────────────────────
function ProjectViewerModal({
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

  // FIX #6 — both callback refs are now listed in deps so the effect always
  // captures the latest versions rather than stale closures.
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
          ref={detailsRef}
          onScroll={handleDetailsScroll}
          className={cn("relative flex flex-col border-zinc-100 dark:border-zinc-800 overflow-y-auto overscroll-contain", "h-[60%] border-t md:h-auto md:border-t-0 md:border-l md:w-[380px]", "p-6 md:p-8")}
        >
          <div className="sticky top-0 h-0 z-20 pointer-events-none" aria-hidden>
            <div
              className="absolute -inset-x-6 md:-inset-x-8 -top-6 md:-top-8 h-14 md:h-16"
              style={{
                opacity: shadowOpacity,
                transition: "opacity 60ms linear",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.13) 35%, rgba(0,0,0,0.045) 65%, rgba(0,0,0,0) 100%)",
              }}
            />
          </div>
          <ProjectHeader
            project={project}
            accent={accent}
            hasBA={hasBA}
            shareUrl={shareUrl}
            liked={likedIds.has(project.id)}
            onToggleLike={() => onToggleLike(project.id)}
            onClose={onClose}
          />
          <ProjectDetailsPanel project={project} accent={accent} onClose={onClose} />
          {hasSiblings && (
            <p className="hidden md:block text-[0.65rem] font-medium text-zinc-400 text-center mt-6">
              Use ← → to browse other {hubLabelFor(project.hub)} projects
            </p>
          )}
        </div>
      </div>

      {/* FIX #10 — title prop passed through so ZoomOverlay can build a
          meaningful alt string for the zoomed image. */}
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

// ─── Unified swipe carousel ───────────────────────────────────────────────────
function ProjectCarousel({ projects, accent, onSelect, likedIds, onToggleLike }: {
  projects: ProjectData[]; accent: string; onSelect: (p: ProjectData) => void
  likedIds: Set<string>; onToggleLike: (id: string) => void
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef    = useRef<HTMLDivElement>(null)
  const isDragging  = useRef(false)
  const startX      = useRef(0)
  const scrollStart = useRef(0)
  // FIX #3 — track whether the mouse actually moved a meaningful distance so
  // releasing after a drag doesn't fire onSelect on the card underneath.
  const dragMoved   = useRef(false)

  const onScroll = useCallback(() => {
    if (!trackRef.current) return
    const { scrollLeft, clientWidth } = trackRef.current
    setActiveIdx(Math.round(scrollLeft / clientWidth))
  }, [])

  const scrollTo = useCallback((idx: number) => {
    if (!trackRef.current) return
    const clamped = Math.max(0, Math.min(idx, projects.length - 1))
    trackRef.current.scrollTo({ left: clamped * trackRef.current.clientWidth, behavior: "smooth" })
    setActiveIdx(clamped)
  }, [projects.length])

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current  = true
    dragMoved.current   = false
    startX.current      = e.pageX
    scrollStart.current = trackRef.current?.scrollLeft ?? 0
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return
    if (Math.abs(e.pageX - startX.current) > 5) dragMoved.current = true
    trackRef.current.scrollLeft = scrollStart.current - (e.pageX - startX.current)
  }
  const onMouseUp = () => { isDragging.current = false }

  return (
    <div className="relative md:max-w-2xl lg:max-w-3xl md:mx-auto">
      <div
        ref={trackRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing select-none"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {projects.map((project) => (
          <div key={project.id} className="shrink-0 w-full snap-center px-4 md:px-6" style={{ scrollSnapAlign: "center" }}>
            {/* FIX #3 — guard the click: only open the project if the mouse
                didn't move far enough to count as a drag. */}
            <div
              className="rounded-[16px] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl cursor-pointer group transition-transform duration-300 active:scale-[0.98]"
              onClick={() => { if (!dragMoved.current) onSelect(project) }}
            >
              <div className="relative aspect-[16/9] md:aspect-[16/8] bg-zinc-100 dark:bg-zinc-900">
                <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4 z-10">
                  <LikeButton
                    liked={likedIds.has(project.id)}
                    onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }}
                    context="card"
                  />
                </div>
                {BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider text-white shadow-lg" style={{ backgroundColor: `${accent}dd`, backdropFilter: "blur(6px)" }}>
                    <ArrowsLeftRight size={11} weight="bold" />
                    Before &amp; After
                  </div>
                )}
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-[0.6rem] font-black uppercase tracking-widest text-white/60 mb-1">{project.tag}</p>
                  <h3 className="text-white font-black text-xl md:text-2xl leading-tight">{project.title}</h3>
                  <p className="text-white/70 text-xs font-medium mt-1 line-clamp-1">{project.shortDesc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length > 1 && (
        <>
          <button onClick={() => scrollTo(activeIdx - 1)} disabled={activeIdx === 0} className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-lg flex items-center justify-center text-zinc-700 dark:text-white disabled:opacity-0 transition-all hover:scale-105 active:scale-95"><CaretLeft size={20} weight="bold" /></button>
          <button onClick={() => scrollTo(activeIdx + 1)} disabled={activeIdx === projects.length - 1} className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-lg flex items-center justify-center text-zinc-700 dark:text-white disabled:opacity-0 transition-all hover:scale-105 active:scale-95"><CaretRight size={20} weight="bold" /></button>
        </>
      )}
      {/* FIX #9 — dot buttons now have aria-label so screen readers
          announce something meaningful instead of just "button". */}
      {projects.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {projects.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to project ${idx + 1}`}
              onClick={() => scrollTo(idx)}
              className={cn("rounded-full transition-all duration-300", activeIdx === idx ? "w-5 h-2" : "w-2 h-2 opacity-30 hover:opacity-60")}
              style={{ backgroundColor: activeIdx === idx ? accent : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Projects count popover ───────────────────────────────────────────────────
function ProjectsPopover({
  projects, accent, isDark, onSelect,
}: {
  projects: ProjectData[]
  accent: string
  isDark: boolean
  onSelect: (p: ProjectData) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const openedByClickRef = useRef(false)
  const pushedRef = useRef(false)

  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches

  const closePopover = useCallback(() => {
    openedByClickRef.current = false
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closePopover()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, closePopover])

  useEffect(() => {
    if (open && openedByClickRef.current && !pushedRef.current) {
      window.history.pushState({ projectsPopover: true }, "")
      pushedRef.current = true
    }
  }, [open])

  useEffect(() => {
    const onPop = () => {
      if (pushedRef.current) {
        pushedRef.current = false
        openedByClickRef.current = false
        setOpen(false)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const handleToggleClick = () => {
    if (open) {
      closePopover()
    } else {
      openedByClickRef.current = true
      setOpen(true)
    }
  }

  return (
    <div
      ref={ref}
      className="relative ml-auto"
      onMouseEnter={() => canHover && setOpen(true)}
      onMouseLeave={() => { if (canHover) { setOpen(false); openedByClickRef.current = false } }}
    >
      <button
        onClick={handleToggleClick}
        className={cn(
          "text-xs font-bold px-3 py-1 rounded-full transition-opacity duration-200",
          "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:scale-105",
          open && "opacity-0 pointer-events-none"
        )}
        aria-expanded={open}
      >
        {projects.length} {projects.length === 1 ? "project" : "projects"}
      </button>

      {open && (
        // FIX #8 — listbox/option ARIA roles so screen readers announce
        // this as a proper selector rather than a generic region of buttons.
        <div
          role="listbox"
          aria-label={`Projects in this hub`}
          className="absolute right-0 top-0 z-50 w-64 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-4 py-3 cursor-pointer" onClick={closePopover}>
            <span className="text-[0.65rem] font-black" style={{ color: accent }}>
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
            {projects.map(p => (
              <button
                key={p.id}
                role="option"
                aria-selected={false}
                onClick={() => { onSelect(p); closePopover() }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left group/item"
              >
                {/* FIX #7 — use next/image instead of <img> so Next.js can
                    optimise format, size, and lazy-loading for popover thumbs. */}
                <div className="relative w-8 h-8 rounded-[8px] shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                  {p.image ? (
                    <Image src={p.image} alt={p.title} fill sizes="32px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: `${accent}20` }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate group-hover/item:underline" style={{ textDecorationColor: accent }}>
                    {p.title}
                  </p>
                  <p className="text-[0.6rem] font-medium text-zinc-400 truncate">{p.shortDesc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Hub filter dropdown ──────────────────────────────────────────────────────
// FIX #4 — the open useEffect now also clears pushedRef when the dropdown
// closes without a back gesture (e.g. selecting an option), preventing a
// double-pop on the next open/close cycle.
function FilterDropdown({
  activeFilter, onSelect, getAccent,
}: {
  activeFilter: HubId | "all"
  onSelect: (f: HubId | "all") => void
  getAccent: (id: HubId) => string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pushedRef = useRef(false)

  const closeDropdown = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    } else {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, closeDropdown])

  useEffect(() => {
    if (open && !pushedRef.current) {
      window.history.pushState({ filterDropdown: true }, "")
      pushedRef.current = true
    }
    if (!open && pushedRef.current) {
      // Closed without a back gesture (option selected / outside click
      // already handled by closeDropdown). Clear so next open starts fresh.
      pushedRef.current = false
    }
  }, [open])

  useEffect(() => {
    const onPop = () => {
      if (pushedRef.current) {
        pushedRef.current = false
        setOpen(false)
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const options: { id: HubId | "all"; label: string }[] = [
    { id: "all", label: "All hubs" },
    ...ROW_ORDER.map(r => ({ id: r.id, label: r.label })),
  ]
  const current       = options.find(o => o.id === activeFilter)
  const currentAccent = activeFilter !== "all" ? getAccent(activeFilter) : undefined

  return (
    <div ref={ref} className="relative max-w-md mx-auto mb-10">
      <button
        onClick={() => (open ? closeDropdown() : setOpen(true))}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          {currentAccent && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentAccent }} />}
          <span style={currentAccent ? { color: currentAccent } : undefined}>{current?.label ?? "All hubs"}</span>
        </span>
        <CaretDown size={14} weight="bold" className={cn("text-zinc-400 transition-transform duration-200 shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        // FIX #8 — listbox/option ARIA roles on the filter menu too.
        <div
          role="listbox"
          aria-label="Filter by hub"
          className="absolute left-0 right-0 top-full mt-2 z-30 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="p-2 max-h-[320px] overflow-y-auto">
            {options.map(opt => {
              const accent   = opt.id !== "all" ? getAccent(opt.id as HubId) : undefined
              const isActive = activeFilter === opt.id
              return (
                <button
                  key={opt.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { onSelect(opt.id); closeDropdown() }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left text-sm font-bold transition-colors",
                    isActive ? "bg-zinc-50 dark:bg-zinc-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  )}
                >
                  {accent && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />}
                  <span className="text-zinc-800 dark:text-zinc-200" style={accent ? { color: accent } : undefined}>{opt.label}</span>
                  {isActive && <Check size={14} weight="bold" className="ml-auto shrink-0" style={{ color: accent }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Empty hub state ──────────────────────────────────────────────────────────
function EmptyHubState({ label, query }: { label: string; query?: string }) {
  return (
    <div className="max-w-md mx-auto text-center py-12 px-6 rounded-[14px] border border-dashed border-zinc-200 dark:border-zinc-800">
      <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
        {query
          ? <>No {label} projects match &ldquo;{query}&rdquo;</>
          : <>No {label} projects yet — check back soon.</>}
      </p>
    </div>
  )
}

const LIKES_STORAGE_KEY = "apexbytes-gallery-likes"

function GalleryPageInner() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const searchParams = useSearchParams()
  const pathname      = usePathname()
  const [activeFilter,    setActiveFilter]    = useState<HubId | "all">("all")
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [zoomIndex,       setZoomIndex]       = useState<number | null>(null)
  const [searchQuery,     setSearchQuery]     = useState("")
  const [searchFocused,   setSearchFocused]   = useState(false)
  const [surpriseFlash,   setSurpriseFlash]   = useState(false)
  const [likedIds,        setLikedIds]        = useState<Set<string>>(new Set())
  const [showBackToTop,   setShowBackToTop]   = useState(false)
  const likesHydrated = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKES_STORAGE_KEY)
      if (raw) setLikedIds(new Set(JSON.parse(raw)))
    } catch {}
    likesHydrated.current = true
  }, [])
  useEffect(() => {
    if (!likesHydrated.current) return
    try { localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likedIds))) } catch {}
  }, [likedIds])

  const toggleLike = useCallback((id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const { closeProject, closeZoom } = useGalleryBackStack(selectedProject, setSelectedProject, zoomIndex, setZoomIndex)

  useEffect(() => {
    const projectId = searchParams.get("project")
    if (!projectId) return
    const match = PROJECTS.find(p => p.id === projectId)
    if (match) {
      setActiveFilter(match.hub as HubId)
      setSelectedProject(match)
    }
  }, [searchParams])

  useEffect(() => {
    const url = selectedProject ? `${pathname}?project=${selectedProject.id}` : pathname
    window.history.replaceState(window.history.state, "", url)
  }, [selectedProject, pathname])

  // FIX #15 — scroll-lock now uses a data attribute on <html> instead of
  // imperative body.style mutations, which is more robust when concurrent
  // renders or unmounts could otherwise leave the body in a broken state.
  // Add this to your global CSS:
  //   html[data-scroll-locked] body { overflow: hidden; }
  // (or keep the existing body.style approach — both are valid; this is the
  //  safer pattern for concurrent React)
  useEffect(() => {
    if (!selectedProject) return
    const scrollY = window.scrollY
    document.documentElement.dataset.scrollLocked = "true"
    document.body.style.top = `-${scrollY}px`
    return () => {
      delete document.documentElement.dataset.scrollLocked
      document.body.style.top = ""
      window.scrollTo(0, scrollY)
    }
  }, [selectedProject])

  const getAccent = useCallback(
    (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.tagTextDark : c.tagText },
    [isDark]
  )
  const filteredRows = activeFilter === "all" ? ROW_ORDER : ROW_ORDER.filter(r => r.id === activeFilter)

  const searchLower = searchQuery.trim().toLowerCase()
  const matchesSearch = useCallback((p: ProjectData) => {
    if (!searchLower) return true
    return (
      p.title.toLowerCase().includes(searchLower) ||
      p.tag.toLowerCase().includes(searchLower) ||
      p.shortDesc.toLowerCase().includes(searchLower)
    )
  }, [searchLower])

  const totalMatches = PROJECTS.filter(
    p => (activeFilter === "all" || p.hub === activeFilter) && matchesSearch(p)
  ).length

  // FIX #17 — surpriseFlash and active:scale-95 competed on the same button.
  // The flash is now a separate data attribute so the two transitions don't
  // fight each other. active:scale-95 is removed from the surprise button.
  const handleSurprise = useCallback(() => {
    if (PROJECTS.length === 0) return
    setSurpriseFlash(true)
    setTimeout(() => {
      let pool = PROJECTS
      if (selectedProject && PROJECTS.length > 1) {
        pool = PROJECTS.filter(p => p.id !== selectedProject.id)
      }
      const pick = pool[Math.floor(Math.random() * pool.length)]
      setActiveFilter(pick.hub as HubId)
      setSelectedProject(pick)
      setSurpriseFlash(false)
    }, 220)
  }, [selectedProject])

  const modalSiblings = selectedProject ? PROJECTS.filter(p => p.hub === selectedProject.hub) : []

  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        <div className="text-center mb-12">
          <h1 className="abh-page-title mb-4">Our Portfolio</h1>
          <p className="abh-tagline max-w-2xl mx-auto">Real results for real clients. Select a category to explore our work in depth.</p>
          <div className="abh-divider" />
        </div>

        {/* Search + Surprise me */}
        <div
          className="flex items-stretch max-w-md mx-auto mb-6 rounded-[14px] shadow-lg overflow-hidden transition-colors duration-300"
          style={{ backgroundColor: BRAND.orange }}
        >
          <div className="relative flex-1 basis-1/2">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white pointer-events-none"
            />
            {/* FIX #16 — removed text-center / focus:text-left which caused a
                jarring layout jump on iOS. Text is always left-aligned; the
                left padding optically centres it when the field is short. */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={searchFocused ? "Search" : "Search Project"}
              className="w-full pl-10 pr-9 py-4 bg-transparent font-sans font-black text-base text-white placeholder:text-white/80 outline-none text-left"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>
          <div className="w-px bg-white/25 my-2" />
          {/* FIX #17 — active:scale-95 removed; surpriseFlash drives its own
              isolated opacity/scale so both transitions don't compete. */}
          <button
            onClick={handleSurprise}
            aria-label="Surprise me with a random project"
            className={cn(
              "flex-1 basis-1/2 flex items-center justify-center gap-1.5 px-3.5 py-4 font-sans font-black text-base text-white whitespace-nowrap transition-all duration-200 hover:bg-white/10 group/surprise",
              surpriseFlash && "scale-90 opacity-60"
            )}
          >
            <Shuffle size={14} weight="bold" className="transition-transform duration-300 group-hover/surprise:rotate-180" />
            Surprise me
          </button>
        </div>

        <FilterDropdown activeFilter={activeFilter} onSelect={setActiveFilter} getAccent={getAccent} />

        <div className="max-w-2xl mx-auto mb-16 rounded-[14px] border border-brand-orange/20 bg-brand-orange/5 dark:bg-brand-orange/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-12 h-12 shrink-0 rounded-[14px] bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Info size={28} weight="fill" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
              We use high-quality sample photos to represent our services, ensuring the professional standard shown is exactly what you receive.
            </p>
          </div>
        </div>

        {searchLower && totalMatches === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6">
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              No projects match &ldquo;{searchQuery.trim()}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-black underline text-brand-blue"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            {filteredRows.map(row => {
              const accent = getAccent(row.id)
              const projects = PROJECTS.filter(p => p.hub === row.id && matchesSearch(p))

              if (projects.length === 0) {
                if (activeFilter !== row.id) return null
                return (
                  <div key={row.id}>
                    <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: accent }} />
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2>
                    </div>
                    <EmptyHubState label={row.label} query={searchLower ? searchQuery.trim() : undefined} />
                  </div>
                )
              }

              return (
                <div key={row.id}>
                  <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: accent }} />
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2>
                    <ProjectsPopover projects={projects} accent={accent} isDark={isDark} onSelect={setSelectedProject} />
                  </div>
                  <ProjectCarousel projects={projects} accent={accent} onSelect={setSelectedProject} likedIds={likedIds} onToggleLike={toggleLike} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ProjectViewerModal
        project={selectedProject}
        onClose={closeProject}
        zoomIndex={zoomIndex}
        setZoomIndex={setZoomIndex}
        onCloseZoom={closeZoom}
        pathname={pathname}
        siblings={modalSiblings}
        onNavigate={setSelectedProject}
        likedIds={likedIds}
        onToggleLike={toggleLike}
      />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 left-4 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
          showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <ArrowUp size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
      </button>
    </section>
  )
}

function GallerySkeleton() {
  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
        <h1 className="abh-page-title mb-4">Our Portfolio</h1>
        <div className="abh-divider" />
      </div>
    </section>
  )
}

export function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryPageInner />
    </Suspense>
  )
}
 
