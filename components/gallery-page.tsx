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

const BA_HUBS: HubId[] = ["design", "tech"]

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

// Tiny synthesized "click" — no audio asset needed. Used for the Select-Hub
// pill so pressing it gives real tactile feedback. Wrapped in try/catch:
// some browsers block AudioContext until a user gesture has happened
// elsewhere on the page, and this must never throw or block the click.
function playClickSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx  = new AudioCtx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(680, ctx.currentTime)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.09)
  } catch {
    // Audio blocked/unavailable — fail silently, never block the click.
  }
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
function ZoomOverlay({ images, startIndex, onClose, title }: {
  images: string[]
  startIndex: number
  onClose: () => void
  title: string
}) {
  const [idx, setIdx]   = useState(startIndex)
  const touchStartX     = useRef(0)
  const touchStartY     = useRef(0)

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
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
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
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors hover:opacity-80"
      style={{ backgroundColor: `${blueColor}15`, color: blueColor }}
    >
      {shared ? <Check size={16} weight="bold" className="text-green-500" /> : canNativeShare ? <ShareNetwork size={16} weight="bold" /> : <LinkSimple size={16} weight="bold" />}
    </button>
  )
}

// ─── Like (heart) button ──────────────────────────────────────────────────────
function LikeButton({ liked, onToggle, context = "header" }: {
  liked: boolean
  onToggle: (e: React.MouseEvent) => void
  context?: "card" | "header"
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  return (
    <button
      onClick={onToggle}
      aria-label={liked ? "Unlike this project" : "Like this project"}
      aria-pressed={liked}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 hover:opacity-80",
        context === "card" && "bg-black/40 hover:bg-black/60 backdrop-blur-sm"
      )}
      style={context === "header" ? { backgroundColor: `${blueColor}15`, color: blueColor } : undefined}
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
            {/* object-contain (was object-cover) — shows the whole image
                centered rather than cropping it to fill the frame. Matters
                most for portrait documents like CVs viewed in this
                landscape-ish pane; nothing gets cut off anymore. */}
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

// ─── Project details BODY — Goal / What we did / Result only. ─────────────────
// Split out of the old combined "ProjectDetailsPanel" so this piece can be
// the ONLY scrollable region inside the viewer's right-hand panel, with the
// header pinned above it and the CTA buttons pinned below it (see
// ProjectViewerModal for the surrounding flex layout).
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

// ─── Project CTAs — pinned footer, split out of the old combined panel ────────
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

        {/* Right panel — now three independent flex regions instead of one
            big scrollable column: a pinned header, a pinned CTA footer, and
            ONLY the middle (Goal / What We Did / Result) actually scrolls.
            Previously the whole panel scrolled together, so the title and
            the "Get a project like this" buttons disappeared as soon as you
            scrolled past them. */}
        <div
          className={cn(
            "relative flex flex-col border-zinc-100 dark:border-zinc-800",
            "h-[60%] border-t md:h-auto md:border-t-0 md:border-l md:w-[380px]"
          )}
        >
          {/* Pinned header — title, tag, like/share/close */}
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

          {/* Scroll-shadow indicator — sits right at the header/scroll
              boundary, fades in as the middle section scrolls under it. */}
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

          {/* ONLY this region scrolls */}
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

          {/* Pinned CTA footer */}
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

// ─── Unified swipe carousel ───────────────────────────────────────────────────
// Cards now pick up the project's hub color on hover — border, glow shadow,
// and title text all tint via CSS custom properties (--hub-accent /
// --hub-shadow), same pattern as the Services hub cards. Cards also now sit
// under a permanent deep, layered shadow (not just on hover) plus a hover
// lift, for a "floating above the page" 3D feel rather than a flat card.
function ProjectCarousel({ projects, accent, onSelect, likedIds, onToggleLike }: {
  projects: ProjectData[]; accent: string; onSelect: (p: ProjectData) => void
  likedIds: Set<string>; onToggleLike: (id: string) => void
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef    = useRef<HTMLDivElement>(null)
  const isDragging  = useRef(false)
  const startX      = useRef(0)
  const scrollStart = useRef(0)
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
            <div
              style={{ '--hub-accent': accent, '--hub-shadow': `${accent}55` } as any}
              className={cn(
                "group rounded-[16px] overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 hover:border-[var(--hub-accent)]",
                "bg-white dark:bg-zinc-950 cursor-pointer will-change-transform",
                "transition-all duration-300 ease-out active:scale-[0.98] hover:-translate-y-1.5"
              )}
              style={{
                boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55), 0 10px 24px -12px rgba(0,0,0,0.35)",
                '--hub-accent': accent,
                '--hub-shadow': `${accent}55`,
              } as any}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 36px 70px -16px ${accent}55, 0 14px 30px -10px rgba(0,0,0,0.4)`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 30px 60px -20px rgba(0,0,0,0.55), 0 10px 24px -12px rgba(0,0,0,0.35)"
              }}
              onClick={() => { if (!dragMoved.current) onSelect(project) }}
            >
              <div className="relative aspect-[16/9] md:aspect-[16/8] bg-zinc-100 dark:bg-zinc-900">
                <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {/* Bottom fade — was a flat black-to-transparent wash that
                    could look like a solid block over busy photos. Now a
                    proper multi-stop gradient anchored at the bottom, so
                    the title/tag text stays readable without hiding more
                    of the image than necessary. */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 22%, rgba(0,0,0,0.22) 48%, rgba(0,0,0,0) 75%)",
                  }}
                />
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
                  <h3 className="text-white font-black text-xl md:text-2xl leading-tight transition-colors duration-300 group-hover:text-[var(--hub-accent)]">{project.title}</h3>
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
          // rounded-full → rounded-[14px], matching the rest of the site's
          // pill/badge radius instead of a fully round chip.
          "text-xs font-bold px-3 py-1 rounded-[14px] transition-opacity duration-200",
          "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:scale-105",
          open && "opacity-0 pointer-events-none"
        )}
        aria-expanded={open}
      >
        {projects.length} {projects.length === 1 ? "project" : "projects"}
      </button>

      {open && (
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
// Centered "keycap" pill. Outside-close now uses a real full-screen backdrop
// (same pattern as the modals elsewhere in this file) instead of a
// document-level "mousedown" listener. The old listener raced against the
// option buttons' own onClick on touch devices — sometimes the dropdown
// would start closing on the SAME tap that was supposed to pick a hub,
// eating that tap and requiring a second one. A backdrop can't race like
// that: taps on it only ever close the dropdown and never reach anything
// underneath, and taps on the option buttons (rendered above the backdrop)
// always register on the first press. The toggle button also now plays a
// short synthesized click on press.
function FilterDropdown({
  activeFilter, onSelect, getAccent,
}: {
  activeFilter: HubId | "all"
  onSelect: (f: HubId | "all") => void
  getAccent: (id: HubId) => string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
  const [open, setOpen] = useState(false)
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
    if (open && !pushedRef.current) {
      window.history.pushState({ filterDropdown: true }, "")
      pushedRef.current = true
    }
    if (!open && pushedRef.current) {
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

  const handleToggleClick = () => {
    playClickSound()
    if (open) {
      closeDropdown()
    } else {
      setOpen(true)
    }
  }

  const options: { id: HubId | "all"; label: string }[] = [
    { id: "all", label: "All hubs" },
    ...ROW_ORDER.map(r => ({ id: r.id, label: r.label })),
  ]
  const currentAccent = activeFilter !== "all" ? getAccent(activeFilter) : undefined
  const idleLabel      = "Select a Hub"
  const displayedLabel = activeFilter === "all" ? idleLabel : (options.find(o => o.id === activeFilter)?.label ?? idleLabel)
  const pillColor       = currentAccent ?? blueColor

  return (
    <div className="relative flex justify-center mb-10">
      <button
        onClick={handleToggleClick}
        aria-expanded={open}
        className="relative z-30 inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-white dark:bg-zinc-950 font-sans font-black text-sm text-center transition-all duration-300 ease-out active:translate-y-[3px]"
        style={{
          boxShadow: open
            ? `0 2px 0 ${pillColor}70, 0 3px 10px rgba(0,0,0,0.2)`
            : `0 5px 0 ${pillColor}70, 0 12px 24px -8px rgba(0,0,0,0.3)`,
          transform: open ? "translateY(3px)" : "translateY(0)",
          transitionProperty: "box-shadow, transform",
        }}
      >
        {currentAccent && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentAccent }} />}
        <span style={{ color: currentAccent ?? undefined }} className={!currentAccent ? "text-zinc-800 dark:text-zinc-100" : undefined}>
          {displayedLabel}
        </span>
        <CaretDown size={14} weight="bold" className={cn("transition-transform duration-200 shrink-0", open && "rotate-180")} style={{ color: currentAccent ?? blueColor }} />
      </button>

      {open && (
        <>
          {/* Full-screen backdrop — captures every outside tap so it can
              only ever close the dropdown, never also trigger whatever's
              underneath. Sits below the dropdown list (z-20) but above
              everything else on the page. */}
          <div
            className="fixed inset-0 z-20"
            onClick={closeDropdown}
            aria-hidden="true"
          />
          <div
            role="listbox"
            aria-label="Filter by hub"
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-30 w-64 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
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
        </>
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

// ─── Closing tagline ──────────────────────────────────────────────────────────
function GalleryClosingTagline() {
  return (
    <div className="relative mt-4 mb-4 overflow-hidden rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-6 py-10 md:py-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#1E6FA8]" />
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Like what you see?</p>
      <p className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        Your project could be our next favourite. Let's bring it to life at Apexbytes Hub.
      </p>
    </div>
  )
}

const LIKES_STORAGE_KEY = "apexbytes-gallery-likes"

function GalleryPageInner() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const blueColor = isDark ? BRAND.lightBlue : BRAND.blue
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

        <div
          className="flex items-stretch max-w-md mx-auto mb-6 rounded-[14px] bg-white dark:bg-zinc-950 border-2 overflow-hidden transition-all duration-300 ease-out shadow-md hover:shadow-lg hover:-translate-y-0.5"
          style={{ borderColor: blueColor }}
        >
          <div className="relative flex-1 basis-1/2">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: blueColor }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={searchFocused ? "Search" : "Search Project"}
              className="w-full pl-10 pr-9 py-4 bg-transparent font-sans font-black text-base outline-none text-left placeholder:opacity-50"
              style={{ color: blueColor }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: `${blueColor}18`, color: blueColor }}
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>
          <div className="w-px my-2" style={{ backgroundColor: `${blueColor}35` }} />
          <button
            onClick={handleSurprise}
            aria-label="Surprise me with a random project"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${blueColor}0d` }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "" }}
            className={cn(
              "flex-1 basis-1/2 flex items-center justify-center gap-1.5 px-3.5 py-4 font-sans font-black text-base whitespace-nowrap transition-all duration-200 active:scale-95 group/surprise",
              surpriseFlash && "scale-90 opacity-60"
            )}
            style={{ color: blueColor }}
          >
            <Shuffle size={14} weight="bold" className="transition-transform duration-300 group-hover/surprise:rotate-180" />
            Surprise me
          </button>
        </div>

        <FilterDropdown activeFilter={activeFilter} onSelect={setActiveFilter} getAccent={getAccent} />

        <div className="max-w-2xl mx-auto mb-16 rounded-[14px] border border-[#1E6FA8]/20 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-12 h-12 shrink-0 rounded-[14px] bg-[#1E6FA8] flex items-center justify-center">
            <Info size={26} weight="fill" color="#fff" />
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
          <div className="space-y-8">
            {filteredRows.map(row => {
              const accent = getAccent(row.id)
              const projects = PROJECTS.filter(p => p.hub === row.id && matchesSearch(p))

              if (projects.length === 0) {
                if (activeFilter !== row.id) return null
                return (
                  <div key={row.id} className="rounded-[20px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 shadow-sm transition-shadow duration-300 ease-out p-5 md:p-7">
                    {/* px-4 md:px-6 added so the vertical bar + hub name +
                        project-count pill line up with the carousel image's
                        left/right edges below (the carousel adds that same
                        inset on its own slide wrapper, so without matching
                        it here the header sat flush against the card's own
                        padding while the image sat further in). */}
                    <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: "#1E6FA8" }} />
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2>
                    </div>
                    <EmptyHubState label={row.label} query={searchLower ? searchQuery.trim() : undefined} />
                  </div>
                )
              }

              return (
                <div key={row.id} className="rounded-[20px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 shadow-sm transition-shadow duration-300 ease-out p-5 md:p-7">
                  <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                    {/* Vertical bar now fixed brand blue (#1E6FA8), same as
                        the notice icon and closing-tagline top bar, instead
                        of the theme-adaptive blueColor. */}
                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: "#1E6FA8" }} />
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2>
                    <ProjectsPopover projects={projects} accent={accent} isDark={isDark} onSelect={setSelectedProject} />
                  </div>
                  <ProjectCarousel projects={projects} accent={accent} onSelect={setSelectedProject} likedIds={likedIds} onToggleLike={toggleLike} />
                </div>
              )
            })}
          </div>
        )}

        <GalleryClosingTagline />
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
