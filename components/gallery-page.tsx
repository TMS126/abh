"use client"

import { useState, useRef, useCallback, useEffect, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { X, Check, Info, CaretLeft, CaretRight, Image as ImageIcon, ArrowsOut, ArrowsLeftRight, ShareNetwork } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ} from "@/lib/brand"
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
  const [copied, setCopied] = useState(false)
  
  const handleShare = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("project", project.id)
    navigator.clipboard.writeText(url.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex justify-between items-start mb-6 shrink-0">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-[14px] inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>{project.tag}</span>
          {hasBA && (
            <span className="text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>Before &amp; After</span>
          )}
          <button 
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check size={12} weight="bold" className="text-green-500" /> : <ShareNetwork size={12} weight="bold" />}
            {copied ? "Link Copied" : "Share"}
          </button>
        </div>
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
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <ArrowsOut size={24} weight="bold" />
              </div>
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-1.5 p-3 bg-zinc-950/50 backdrop-blur-md overflow-x-auto no-scrollbar shrink-0">
              {allImages.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImg(i)} className={cn("relative w-14 h-14 rounded-[8px] overflow-hidden border-2 shrink-0 transition-all", activeImg === i ? "border-white scale-105 z-10 shadow-lg" : "border-transparent opacity-50 hover:opacity-80")}>
                  <SafeImage src={img} alt={`Thumb ${i + 1}`} accent={accent} fill sizes="60px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProjectViewerModal({ project, onClose, zoomIndex, setZoomIndex }: {
  project: ProjectData | null; onClose: () => void; zoomIndex: number | null; setZoomIndex: (i: number | null) => void
}) {
  const [activeImg, setActiveImg] = useState(0)
  const [comparing, setComparing] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => { if (project) { setActiveImg(0); setComparing(false) } }, [project])

  if (!project) return null

  const hubId    = project.hub as HubId
  const c        = HUB_COLORS[hubId as HubKey]
  const accent   = isDark ? c.tagTextDark : c.tagText
  const hasBA    = BA_HUBS.includes(hubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const beforeImg = (project as any).beforeImage
  const afterImg  = (project as any).afterImage
  const allImages = project.gallery && project.gallery.length > 0 ? project.gallery : [project.image]

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full h-full md:max-w-6xl md:h-[85vh] bg-white dark:bg-zinc-950 md:rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <ProjectImageSection project={project} accent={accent} activeImg={activeImg} setActiveImg={setActiveImg} comparing={comparing} setComparing={setComparing} setZoomIndex={setZoomIndex} hasBA={hasBA} beforeImg={beforeImg} afterImg={afterImg} allImages={allImages} />
        
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 h-[60%] md:h-auto overflow-y-auto">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <ProjectHeader project={project} accent={accent} hasBA={hasBA} onClose={onClose} />
            
            <div className="flex-1 space-y-8">
              <section>
                <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 mb-3">The Brief</h3>
                <p className="text-[0.92rem] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{project.description}</p>
              </section>

              {hasBA && (
                <button 
                  onClick={() => setComparing(!comparing)}
                  className={cn("w-full py-3 rounded-[14px] border-2 flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-widest", comparing ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900")}
                >
                  <ArrowsLeftRight size={16} weight="bold" />
                  {comparing ? "Show Gallery" : "Compare Before/After"}
                </button>
              )}

              <section>
                <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 mb-3">The Result</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{project.result}</p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900">
              <a
                href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(`Hi ${BIZ.name}! I saw "${project.title}" in your gallery and I'd like something similar.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-[16px] text-sm font-black text-white shadow-xl transition-all active:scale-[0.98] hover:shadow-green-500/20"
                style={{ backgroundColor: "#25D366" }}
              >
                Get a project like this
              </a>
            </div>
          </div>
        </div>
      </div>

      {zoomIndex !== null && !comparing && (
        <ZoomOverlay images={allImages} startIndex={zoomIndex} onClose={() => setZoomIndex(null)} />
      )}
    </div>
  )
}

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
        {projects.map((project) => (
          <div key={project.id} className="shrink-0 w-full snap-center px-4 md:px-6" style={{ scrollSnapAlign: "center" }}>
            <div className="rounded-[16px] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl cursor-pointer group transition-transform duration-300 active:scale-[0.98]" onClick={() => onSelect(project)}>
              <div className="relative aspect-[16/9] md:aspect-[16/8] bg-zinc-100 dark:bg-zinc-900">
                <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
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

function ProjectsPopover({ projects, accent, isDark, onSelect }: { projects: ProjectData[], accent: string, isDark: boolean, onSelect: (p: ProjectData) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches

  useEffect(() => {
    if (!open) return
    window.history.pushState({ projectsPopover: true }, "")
    const onPop = () => setOpen(false)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [open])

  return (
    <div ref={ref} className="relative ml-auto" onMouseEnter={() => canHover && setOpen(true)} onMouseLeave={() => canHover && setOpen(false)}>
      <button onClick={() => setOpen(o => !o)} className={cn("text-xs font-bold px-3 py-1 rounded-full transition-opacity duration-200 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:scale-105", open && "opacity-0 pointer-events-none")}>
        {projects.length} {projects.length === 1 ? "project" : "projects"}
      </button>
      {open && (
        <div className="absolute right-0 top-0 z-50 w-64 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-3 cursor-pointer" onClick={() => setOpen(false)}>
            <span className="text-[0.65rem] font-black" style={{ color: accent }}>{projects.length} {projects.length === 1 ? "project" : "projects"}</span>
          </div>
          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
            {projects.map(p => (
              <button key={p.id} onClick={() => { onSelect(p); setOpen(false) }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left group/item">
                <div className="w-8 h-8 rounded-[8px] shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                  {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: `${accent}20` }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate group-hover/item:underline" style={{ textDecorationColor: accent }}>{p.title}</p>
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

function HubFilter({ label, active, accent, isDark, onClick }: { label: string; active: boolean; accent?: string; isDark: boolean; onClick: () => void }) {
  const isAll = label.toLowerCase().includes('all')
  return (
    <button onClick={onClick} className={cn("px-5 py-2 rounded-[14px] text-[0.72rem] font-bold transition-all", active ? cn("shadow-md", isAll ? "bg-brand-blue text-white" : (isDark ? "text-zinc-900" : "text-white")) : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800")} style={active && accent && !isAll ? { backgroundColor: accent } : {}}>
      {label}
    </button>
  )
}

function GalleryContent() {
  const searchParams = useSearchParams()
  const pathname      = usePathname()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [activeFilter,    setActiveFilter]    = useState<HubId | "all">("all")
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [zoomIndex,       setZoomIndex]       = useState<number | null>(null)

  // Handle Deep Linking on mount
  useEffect(() => {
    const projectId = searchParams.get("project")
    if (projectId) {
      const project = PROJECTS.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
        setActiveFilter(project.hub as HubId)
      }
    }
  }, [searchParams])

  // Keep the URL in sync with the open project so it's shareable at any
  // point. This rewrites (never adds) the current history entry's URL —
  // the actual push/pop entries are still owned entirely by
  // useGalleryBackStack above, so closing a project (by X, backdrop, or
  // back gesture) naturally clears the param without any extra wiring.
  useEffect(() => {
    const url = selectedProject ? `${pathname}?project=${selectedProject.id}` : pathname
    window.history.replaceState(window.history.state, "", url)
  }, [selectedProject, pathname])

  useGalleryBackStack(selectedProject, setSelectedProject, zoomIndex, setZoomIndex)

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
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <div className="text-center mb-12">
        <h1 className="abh-page-title mb-4">Our Portfolio</h1>
        <p className="abh-tagline max-w-2xl mx-auto">Real results for real clients. Select a category to explore our work in depth.</p>
        <div className="abh-divider" />
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <HubFilter label="All hubs" active={activeFilter === "all"} isDark={isDark} onClick={() => setActiveFilter("all")} />
        {ROW_ORDER.map(row => (
          <HubFilter key={row.id} label={row.short} active={activeFilter === row.id} accent={getAccent(row.id)} isDark={isDark} onClick={() => setActiveFilter(row.id)} />
        ))}
      </div>

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

      <ProjectViewerModal project={selectedProject} onClose={() => setSelectedProject(null)} zoomIndex={zoomIndex} setZoomIndex={setZoomIndex} />
    </div>
  )
}

export function GalleryPage() {
  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 overflow-x-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <GalleryContent />
      </Suspense>
    </section>
  )
}
                                   
