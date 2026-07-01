"use client"

import { useState, useRef, useEffect } from "react"
import { X, Check, Eye, ArrowsLeftRight, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BRAND, HUB_NAMES } from "@/lib/brand"
import { PROJECTS, ProjectData } from "@/lib/data"

type HubId = HubKey

// SafeImage component for handling sensitive project images
function SafeImage({ src, alt, fill, className, sensitive, revealed, ...props }: any) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      {...props}
    />
  )
}

const ROW_ORDER: { id: HubId; label: string; short: string }[] = [
  { id: "print", label: HUB_NAMES.print, short: "Print" },
  { id: "design", label: HUB_NAMES.design, short: "Design" },
  { id: "doc", label: HUB_NAMES.doc, short: "Document" },
  { id: "eservice", label: HUB_NAMES.eservice, short: "E-Service" },
  { id: "tech", label: HUB_NAMES.tech, short: "Tech" },
]

const BA_HUBS: HubId[] = ["design", "tech"]

function useGalleryBackStack(selectedProject: ProjectData | null, setSelectedProject: (p: ProjectData | null) => void, zoomIndex: number | null, setZoomIndex: (i: number | null) => void) {
  const prevProject = useRef<ProjectData | null>(null)
  const prevZoom = useRef<number | null>(null)

  useEffect(() => {
    if (selectedProject && selectedProject!== prevProject.current) {
      window.history.pushState({ modal: "project" }, "")
      prevProject.current = selectedProject
    }
  }, [selectedProject])

  useEffect(() => {
    if (zoomIndex!== null && zoomIndex!== prevZoom.current) {
      window.history.pushState({ modal: "zoom" }, "")
      prevZoom.current = zoomIndex
    }
  }, [zoomIndex])

  useEffect(() => {
    const onPop = () => {
      if (zoomIndex!== null) { setZoomIndex(null); prevZoom.current = null; window.history.pushState({ modal: "project" }, ""); return }
      if (selectedProject) { setSelectedProject(null); prevProject.current = null }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [zoomIndex, selectedProject, setZoomIndex, setSelectedProject])
}

function BeforeAfterSlider({ before, after, accent }: { before: string; after: string; accent: string }) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)

  const update = (x: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos(Math.max(5, Math.min(95, ((x - rect.left) / rect.width) * 100)))
  }

  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden select-none touch-none cursor-col-resize"
      onPointerDown={e => update(e.clientX)} onPointerMove={e => e.buttons && update(e.clientX)}>
      <div className="absolute inset-0"><SafeImage src={after} alt="After" fill className="object-cover" /><span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full bg-black/70 text-white">After</span></div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}><div className="absolute inset-0" style={{ width: `${10000/pos}%` }}><SafeImage src={before} alt="Before" fill className="object-cover" /></div><span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full bg-black/70 text-white">Before</span></div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: `${pos}%` }} />
      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${pos}%` }}><div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: accent }}><ArrowsLeftRight size={16} className="text-white" /></div></div>
    </div>
  )
}

function ProjectViewerModal({ project, onClose, zoomIndex, setZoomIndex }: any) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [activeImg, setActiveImg] = useState(0)
  const [comparing, setComparing] = useState(false)
  const [revealed, setRevealed] = useState(!project?.sensitive)

  useEffect(() => { setActiveImg(0); setComparing(false); setRevealed(!project?.sensitive) }, [project?.id])

  if (!project) return null
  const accent = isDark? HUB_COLORS[project.hub as HubKey].tagTextDark : HUB_COLORS[project.hub as HubKey].tagText
  const images = project.images?.length? project.images : [project.image]
  const hasBA = BA_HUBS.includes(project.hub) && project.beforeAfter

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full h-[95vh] md:h-[85vh] md:max-w-5xl bg-white dark:bg-zinc-950 rounded-t-2xl md:rounded-2xl flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 bg-black relative">
          {comparing && hasBA? (
            <BeforeAfterSlider before={project.beforeAfter.before} after={project.beforeAfter.after} accent={accent} />
          ) : (
            <div className="w-full h-full relative cursor-zoom-in" onClick={() => project.sensitive &&!revealed? setRevealed(true) : setZoomIndex(activeImg)}>
              <SafeImage src={images[activeImg]} alt={project.title} fill className="object-contain" sensitive={project.sensitive} revealed={revealed} />
              {project.sensitive &&!revealed && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
                  <button className="px-4 py-2 bg-white/20 rounded-full text-white font-bold flex items-center gap-2"><Eye size={18} />Tap to reveal</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full md:w-96 p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>{project.tag}</span>
              <h2 className="text-xl font-black mt-2">{project.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X size={20} /></button>
          </div>
          <div className="space-y-4 text-sm">
            <div><h4 className="font-bold mb-1" style={{ color: accent }}>Goal</h4><p className="text-zinc-600 dark:text-zinc-400">{project.clientGoal}</p></div>
            <div><h4 className="font-bold mb-1" style={{ color: accent }}>What we did</h4><ul className="space-y-1">{project.whatWeDid.map((t: string, i: number) => <li key={i} className="flex gap-2"><Check size={14} style={{ color: accent }} className="mt-0.5 shrink-0" />{t}</li>)}</ul></div>
            <div><h4 className="font-bold mb-1" style={{ color: accent }}>Result</h4><p className="text-zinc-600 dark:text-zinc-400">{project.result}</p></div>
          </div>
        </div>
      </div>
      {zoomIndex!== null && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center" onClick={() => setZoomIndex(null)}>
          <img src={images[zoomIndex]} className="max-w-full max-h-full object-contain" alt="" />
          <button className="absolute top-4 right-4 text-white p-2"><X size={24} /></button>
        </div>
      )}
    </div>
  )
}

function HubFilter({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isAll = label.toLowerCase().includes('all')
  const hubId = isAll ? null : (label.toLowerCase().replace(' hub', '').replace('-', '') as HubId)
  const colors = hubId ? HUB_COLORS[hubId] : null

  // Active state: use hub's primary color with contrast
  const activeBg = mounted && isDark 
    ? (isAll ? BRAND.blue : colors?.light)
    : (isAll ? BRAND.blue : colors?.primary)
  
  const activeText = mounted && isDark ? (isAll ? BRAND.lightBlue : colors?.primary) : 'white'

  // Inactive state: outline with hub color
  const inactiveBorder = mounted && isDark
    ? (isAll ? BRAND.lightBlue : colors?.light)
    : (isAll ? BRAND.blue : colors?.primary)
  
  const inactiveText = mounted && isDark
    ? (isAll ? BRAND.lightBlue : colors?.light)
    : (isAll ? BRAND.blue : colors?.primary)

  const inactiveHoverBg = mounted && isDark
    ? (isAll ? `${BRAND.lightBlue}10` : `${colors?.light}10`)
    : (isAll ? `${BRAND.blue}10` : `${colors?.primary}10`)

  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: active ? activeBg : 'transparent',
        color: active ? activeText : inactiveText,
        border: active ? 'none' : `2px solid ${inactiveBorder}`,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = inactiveHoverBg
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {label}
    </button>
  )
}

// Carousel component with swipe support
function ProjectCarousel({ projects, onProjectClick }: { projects: ProjectData[]; onProjectClick: (p: ProjectData) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showArrows, setShowArrows] = useState({ left: false, right: true })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowArrows({
          left: scrollLeft > 10,
          right: scrollLeft < scrollWidth - clientWidth - 10,
        })
      }
    }
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener("scroll", checkScroll)
    return () => el?.removeEventListener("scroll", checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative -mx-4 md:mx-0">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-4 shrink-0" />
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => onProjectClick(p)}
            className="flex-shrink-0 w-64 h-80 rounded-xl overflow-hidden cursor-pointer group snap-center transition-transform hover:scale-105"
          >
            <div className="relative w-full h-full bg-zinc-200 dark:bg-zinc-800">
              <SafeImage src={p.image} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col items-end justify-end p-4">
                <div className="text-right w-full">
                  <p className="text-xs text-white/70 mb-1">{p.tag}</p>
                  <h3 className="font-bold text-white text-sm line-clamp-2">{p.title}</h3>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="w-4 shrink-0" />
      </div>

      {mounted && showArrows.left && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-zinc-900 shadow-lg hover:scale-110 transition-transform"
          aria-label="Scroll left"
        >
          <CaretLeft size={20} weight="fill" />
        </button>
      )}
      {mounted && showArrows.right && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-zinc-900 shadow-lg hover:scale-110 transition-transform"
          aria-label="Scroll right"
        >
          <CaretRight size={20} weight="fill" />
        </button>
      )}
    </div>
  )
}

export default function GalleryPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [filter, setFilter] = useState<HubId | "all">("all")
  const [project, setProject] = useState<ProjectData | null>(null)
  const [zoom, setZoom] = useState<number | null>(null)

  useGalleryBackStack(project, setProject, zoom, setZoom)

  const getAccent = (id: HubId) => isDark? HUB_COLORS[id].tagTextDark : HUB_COLORS[id].tagText
  const rows = filter === "all"? ROW_ORDER : ROW_ORDER.filter(r => r.id === filter)

  return (
    <section className="min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-24">
        <h1 className="abh-page-title mb-3">Our Portfolio</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">Real work for real clients in {BRAND.location || "Kgotsong"}.</p>

        <div className="flex flex-wrap gap-2 mb-10">
          <HubFilter label="All hubs" active={filter === "all"} onClick={() => setFilter("all")} />
          {ROW_ORDER.map(r => (
            <HubFilter key={r.id} label={r.short} active={filter === r.id} onClick={() => setFilter(r.id)} />
          ))}
        </div>

        <div className="space-y-16">
          {rows.map(row => {
            const items = PROJECTS.filter(p => p.hub === row.id)
            if (!items.length) return null
            const accent = getAccent(row.id)
            const hasMany = items.length > 4
            const carouselItems = hasMany ? items.slice(0, 4) : items
            const gridItems = hasMany ? items.slice(4) : []

            return (
              <div key={row.id}>
                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: accent }} />
                  {row.label}
                </h2>

                {/* Carousel for featured projects */}
                {carouselItems.length > 0 && (
                  <div className="mb-8">
                    <ProjectCarousel projects={carouselItems} onProjectClick={setProject} />
                  </div>
                )}

                {/* Grid for remaining projects */}
                {gridItems.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gridItems.map(p => (
                      <div key={p.id} onClick={() => setProject(p)} className="group cursor-pointer rounded-xl overflow-hidden border bg-white dark:bg-zinc-900 hover:shadow-xl transition-all">
                        <div className="aspect-video relative bg-zinc-900">
                          <SafeImage src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" sensitive={p.sensitive} revealed={false} />
                          {p.sensitive && <div className="absolute inset-0 bg-black/50 backdrop-blur-2xl flex items-center justify-center"><span className="text-white text-xs font-bold px-3 py-1.5 bg-white/20 rounded-full">Sensitive</span></div>}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-xs opacity-70">{p.tag}</p>
                            <h3 className="font-bold">{p.title}</h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <ProjectViewerModal project={project} onClose={() => setProject(null)} zoomIndex={zoom} setZoomIndex={setZoom} />
    </section>
  )
}
