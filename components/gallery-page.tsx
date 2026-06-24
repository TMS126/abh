"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Check, Info, CaretLeft, CaretRight, Image as ImageIcon, ArrowsOut, ArrowsLeftRight } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey } from "@/lib/brand"
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

// ─── Back-button modal stack ──────────────────────────────────────────────────
// Three layers: project modal → zoom overlay.
// Each back gesture closes only the topmost layer.
function useGalleryBackStack(
  selectedProject: ProjectData | null,
  setSelectedProject: (p: ProjectData | null) => void,
  zoomIndex: number | null,
  setZoomIndex: (i: number | null) => void,
) {
  const prevProject = useRef<ProjectData | null>(null)
  const prevZoom    = useRef<number | null>(null)

  // Push history entry when project opens
  useEffect(() => {
    if (selectedProject && selectedProject !== prevProject.current) {
      window.history.pushState({ abModal: "project" }, "")
      prevProject.current = selectedProject
    }
  }, [selectedProject])

  // Push history entry when zoom opens
  useEffect(() => {
    if (zoomIndex !== null && zoomIndex !== prevZoom.current) {
      window.history.pushState({ abModal: "zoom" }, "")
      prevZoom.current = zoomIndex
    }
  }, [zoomIndex])

  // popstate = back button / swipe-back gesture
  useEffect(() => {
    const onPop = () => {
      // Innermost first
      if (zoomIndex !== null) {
        setZoomIndex(null)
        prevZoom.current = null
        // Re-push project entry so next back closes the project modal
        window.history.pushState({ abModal: "project" }, "")
        return
      }
      if (selectedProject) {
        setSelectedProject(null)
        prevProject.current = null
        return
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [zoomIndex, selectedProject, setZoomIndex, setSelectedProject])
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

// ─── Full-screen zoom overlay ─────────────────────────────────────────────────
// ─── Before / After drag-reveal slider ───────────────────────────────────────
function BeforeAfterSlider({ before, after, accent }: { before: string; after: string; accent: string }) {
  const [pos, setPos] = useState(50)
  const targetRef = useRef(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()
  const [revealed, setRevealed] = useState(false)

  // Spring animation
  useEffect(() => {
    const animate = () => {
      setPos(p => {
        const diff = targetRef.current - p
        return Math.abs(diff) < 0.1 ? targetRef.current : p + diff * 0.2
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [])

  // Initial sweep hint
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
    if ('vibrate' in navigator) navigator.vibrate(1)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    updatePos(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons) updatePos(e.clientX)
  }
  const onDoubleClick = () => { targetRef.current = 50 }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none cursor-col-resize touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onDoubleClick={onDoubleClick}
    >
      {/* AFTER — full base */}
      <div className="absolute inset-0">
        <SafeImage src={after} alt="After" accent={accent} fill sizes="55vw" className="object-cover" priority />
        <span className="absolute bottom-3 right-3 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white shadow" style={{ backgroundColor: `${accent}cc` }}>After</span>
      </div>

      {/* BEFORE — clipped left */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <div className="absolute inset-0" style={{ width: `${10000 / pos}%` }}>
          <SafeImage src={before} alt="Before" accent={accent} fill sizes="55vw" className="object-cover" priority />
        </div>
        <span className="absolute bottom-3 left-3 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/50 text-white shadow">Before</span>
      </div>

      {/* Divider line */}
      <div className="absolute top-0 bottom-0 w-0.5 pointer-events-none" style={{ left: `${pos}%`, backgroundColor: "rgba(255,255,255,0.9)", boxShadow: "0 0 8px rgba(0,0,0,0.4)", transform: "translateX(-0.5px)" }} />

      {/* Handle */}
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

function ZoomOverlay({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx]     = useState(startIndex)
  const touchStartX       = useRef(0)
  const touchStartY       = useRef(0)

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose()
      if (e.key === "ArrowLeft")  prev()
      if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) < 40 || dy > Math.abs(dx)) return
    dx < 0 ? next() : prev()
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
          alt={`Zoomed image ${idx + 1}`}
          className="max-w-full max-h-[90dvh] object-contain rounded-[14px] shadow-2xl select-none animate-in zoom-in-95 duration-200"
          draggable={false}
          onClick={onClose}
        />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90"><CaretLeft size={18} weight="bold" /></button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-90"><CaretRight size={18} weight="bold" /></button>
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


// ─── Project Viewer Components ───────────────────────────────────────────────
function ProjectHeader({ project, accent, hasBA, onClose }: {
  project: ProjectData; accent: string; hasBA: boolean; onClose: () => void
}) {
  return (
    <div className="flex justify-between items-start mb-6 shrink-0">
      <div>
        <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-[14px] mb-3 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>{project.tag}</span>
        {hasBA && (
          <span className="ml-2 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before & After</span>
        )}
        <h2 className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-tight mt-1">{project.title}</h2>
        {project.clientType && (
          <p className={cn("text-[0.72rem] italic mt-1", project.clientType === "sample" ? "text-brand-orange" : "text-zinc-400 dark:text-zinc-500")}>
            {project.clientType === "practice" && "Practice design — portfolio project, not a real client"}
            {project.clientType === "client" && "Real client work"}
            {project.clientType === "sample" && "Representative example — reflects our work, not an actual client project"}
          </p>
        )}
      </div>
      <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0 ml-3 transition-colors">
        <X size={18} weight="bold" />
      </button>
    </div>
  )
}

function ProjectImageSection({ project, accent, activeImg, setActiveImg, comparing, setComparing, setZoomIndex, hasBA, beforeImg, afterImg, allImages }: any) {
  return (
    <div className="h-[40%] md:h-auto md:flex-1 flex flex-col overflow-hidden bg-zinc-900">
      {comparing && hasBA ? (
        <div className="relative flex-1">
          <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
        </div>
      ) : (
        <>
          <div className="relative flex-1 overflow-hidden cursor-zoom-in group/img" onClick={() => setZoomIndex(activeImg)}>
            <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover transition-opacity duration-300" priority={activeImg === 0} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5"><ArrowsOut size={18} weight="bold" className="text-white" /></div>
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-t border-white/10">
              {allImages.map((img: string, idx: number) => (
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

function ProjectDetailsPanel({ project, accent }: { project: ProjectData; accent: string }) {
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
    </div>
  )
}

// ─── Project viewer modal ─────────────────────────────────────────────────────
function ProjectViewerModal({
  project, onClose, zoomIndex, setZoomIndex,
}: {
  project: ProjectData | null
  onClose: () => void
  zoomIndex: number | null
  setZoomIndex: (i: number | null) => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [activeImg,  setActiveImg]  = useState(0)
  const [comparing,  setComparing]  = useState(false)

  useEffect(() => { setActiveImg(0); setZoomIndex(null); setComparing(false) }, [project?.id])

  if (!project) return null

  const accent    = isDark ? HUB_COLORS[project.hub as HubKey].tagTextDark : HUB_COLORS[project.hub as HubKey].tagText
  const allImages = project.images?.length > 0 ? project.images : [project.image]
  const hasBA     = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage as string | undefined
  const afterImg  = (project as any).afterImage  as string | undefined

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

        {/* Image / Compare section */}
        <div className="h-[40%] md:h-auto md:flex-1 flex flex-col overflow-hidden bg-zinc-900">

          {comparing && hasBA ? (
            /* ── Before / After slider ── */
            <div className="relative flex-1">
              <BeforeAfterSlider before={beforeImg!} after={afterImg!} accent={accent} />
            </div>
          ) : (
            /* ── Normal image viewer ── */
            <>
              <div className="relative flex-1 overflow-hidden cursor-zoom-in group/img" onClick={() => setZoomIndex(activeImg)}>
                <SafeImage src={allImages[activeImg]} alt={`${project.title} view ${activeImg + 1}`} accent={accent} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-2.5"><ArrowsOut size={18} weight="bold" className="text-white" /></div>
                </div>
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

          {/* Toggle bar — only for B/A projects */}
          {hasBA && (
            <div className="shrink-0 flex border-t border-white/10 bg-zinc-950">
              <button
                onClick={() => setComparing(false)}
                className={cn("flex-1 py-2.5 text-[0.65rem] font-black uppercase tracking-widest transition-all duration-200", !comparing ? "text-white" : "text-white/30 hover:text-white/60")}
                style={!comparing ? { borderBottom: `2px solid ${accent}` } : {}}
              >
                Gallery
              </button>
              <button
                onClick={() => setComparing(true)}
                className={cn("flex-1 py-2.5 text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all duration-200", comparing ? "text-white" : "text-white/30 hover:text-white/60")}
                style={comparing ? { borderBottom: `2px solid ${accent}` } : {}}
              >
                <ArrowsLeftRight size={13} weight="bold" />
                Before / After
              </button>
            </div>
          )}
        </div>

        {/* Details panel */}
        <div className={cn("relative flex flex-col border-zinc-100 dark:border-zinc-800 overflow-y-auto overscroll-contain", "h-[60%] border-t md:h-auto md:border-t-0 md:border-l md:w-[380px]", "p-6 md:p-8")}>
          <div className="flex justify-between items-start mb-6 shrink-0">
            <div>
              <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-[14px] mb-3 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>{project.tag}</span>
              {hasBA && (
                <span className="ml-2 text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before &amp; After</span>
              )}
              <h2 className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-tight mt-1">{project.title}</h2>
              {project.clientType === "practice" && (
                <p className="text-[0.72rem] italic text-zinc-400 dark:text-zinc-500 mt-1">
                  Practice design — portfolio project, not a real client
                </p>
              )}
              {project.clientType === "client" && (
                <p className="text-[0.72rem] italic text-zinc-400 dark:text-zinc-500 mt-1">
                  Real client work
                </p>
              )}
              {project.clientType === "sample" && (
                <p className="text-[0.72rem] italic text-brand-orange mt-1">
                  Representative example — reflects our work, not an actual client project
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0 ml-3 transition-colors">
              <X size={18} weight="bold" />
            </button>
          </div>
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
          </div>
        </div>
      </div>

      {/* Zoom overlay sits on top — back button closes this first */}
      {zoomIndex !== null && !comparing && (
        <ZoomOverlay images={allImages} startIndex={zoomIndex} onClose={() => setZoomIndex(null)} />
      )}
    </div>
  )
}

// ─── Unified swipe carousel ───────────────────────────────────────────────────
function ProjectCarousel({ projects, accent, onSelect }: { projects: ProjectData[]; accent: string; onSelect: (p: ProjectData) => void }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef   = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX     = useRef(0)
  const scrollStart = useRef(0)

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

  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; startX.current = e.pageX; scrollStart.current = trackRef.current?.scrollLeft ?? 0 }
  const onMouseMove = (e: React.MouseEvent) => { if (!isDragging.current || !trackRef.current) return; trackRef.current.scrollLeft = scrollStart.current - (e.pageX - startX.current) }
  const onMouseUp   = () => { isDragging.current = false }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing select-none"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {projects.map((project, i) => (
          <div key={project.id} className="shrink-0 w-full snap-center px-4 md:px-6" style={{ scrollSnapAlign: "center" }}>
            <div className="rounded-[16px] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl cursor-pointer group transition-transform duration-300 active:scale-[0.98]" onClick={() => onSelect(project)}>
              <div className="relative aspect-[16/9] md:aspect-[16/8] bg-zinc-100 dark:bg-zinc-900">
                <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* B/A badge */}
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
      {projects.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {projects.map((_, idx) => (
            <button key={idx} onClick={() => scrollTo(idx)}
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

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Fix 1st-click issue: only use hover on devices that support it
  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches

  // Mobile back button closes popover first
  useEffect(() => {
    if (!open) return
    const state = { projectsPopover: true }
    window.history.pushState(state, "")
    const onPop = (e: PopStateEvent) => {
      setOpen(false)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [open])

  return (
    <div 
      ref={ref} 
      className="relative ml-auto"
      onMouseEnter={() => canHover && setOpen(true)}
      onMouseLeave={() => canHover && setOpen(false)}
    >
      {/* Spacer pill - keeps position, never shifts layout */}
      <button
        onClick={() => setOpen(o => !o)}
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
        <div className="absolute right-0 top-0 z-50 w-64 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 cursor-pointer" onClick={() => setOpen(false)}>
            <span className="text-[0.65rem] font-black" style={{ color: accent }}>
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); setOpen(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left group/item"
              >
                <div className="w-8 h-8 rounded-[8px] shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
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



// ─── Hub filter pill ─────────────────────────────────────────────────────────
function HubFilter({ label, active, accent, isDark, onClick }: {
  label: string; active: boolean; accent?: string; isDark: boolean; onClick: () => void
}) {
  const isAll = label.toLowerCase().includes('all')
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-2 rounded-[14px] text-[0.72rem] font-bold transition-all",
        active
          ? cn("shadow-md", isAll ? "bg-brand-blue text-white" : (isDark ? "text-zinc-900" : "text-white"))
          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
      )}
      style={active && accent && !isAll ? { backgroundColor: accent } : {}}
    >
      {label}
    </button>
  )
}

export function GalleryPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [activeFilter,    setActiveFilter]    = useState<HubId | "all">("all")
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [zoomIndex,       setZoomIndex]       = useState<number | null>(null)

  // Back button: zoom → project → page (modal by modal)
  useGalleryBackStack(selectedProject, setSelectedProject, zoomIndex, setZoomIndex)

  // Scroll lock while project modal is open
  useEffect(() => {
    if (!selectedProject) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"; style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""
      style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [selectedProject])

  const getAccent = useCallback(
    (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.tagTextDark : c.tagText },
    [isDark]
  )
  const filteredRows = activeFilter === "all" ? ROW_ORDER : ROW_ORDER.filter(r => r.id === activeFilter)

  return (
    <section className="min-h-screen bg-background pb-24 overflow-x-hidden">
      <div className="max-w-[980px] mx-auto px-4 md:px-8">

        <div className="pt-[calc(var(--nav-h)+2rem)] pb-8">
          <h1 className="abh-page-title mb-3">Our Portfolio</h1>
          <p className="abh-tagline max-w-xl">Real results for real clients. Select a category to explore our work in depth.</p>
          <div className="abh-divider" />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          <HubFilter label="All hubs" active={activeFilter === "all"} isDark={isDark} onClick={() => setActiveFilter("all")} />
          {ROW_ORDER.map(row => (
            <HubFilter
              key={row.id}
              label={row.short}
              active={activeFilter === row.id}
              accent={getAccent(row.id)}
              isDark={isDark}
              onClick={() => setActiveFilter(row.id)}
            />
          ))}
        </div>

        {/* Notice — consistent with Services page */}
        <div className="mb-16 rounded-[14px] border border-brand-orange/20 bg-brand-orange/5 dark:bg-brand-orange/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="w-12 h-12 shrink-0 rounded-[14px] bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Info size={28} weight="fill" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
              We use high-quality sample photos to represent our services, ensuring the professional standard shown is exactly what you receive.
            </p>
          </div>
        </div>

        {/* Hub rows */}
        <div className="space-y-20">
          {filteredRows.map(row => {
            const projects = PROJECTS.filter(p => p.hub === row.id)
            if (projects.length === 0) return null
            const accent = getAccent(row.id)
            return (
              <div key={row.id}>
                <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                  <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: accent }} />
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2>
                  <ProjectsPopover projects={projects} accent={accent} isDark={isDark} onSelect={setSelectedProject} />
                </div>
                <ProjectCarousel projects={projects} accent={accent} onSelect={setSelectedProject} />
              </div>
            )
          })}
        </div>
      </div>

      <ProjectViewerModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        zoomIndex={zoomIndex}
        setZoomIndex={setZoomIndex}
      />
    </section>
  )
}
 
 
 
 


  
