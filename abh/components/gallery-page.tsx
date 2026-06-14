"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ArrowLeft, ArrowRight, X, Check } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BRAND, HUB_COLORS, HubKey } from "@/lib/brand"
import { PROJECTS } from "@/lib/data"

type HubId = "print" | "doc" | "design" | "eservice" | "tech"

const ROW_ORDER: { id: HubId; label: string; short: string }[] = [
  { id: "print",    label: "Print Hub",      short: "Print" },
  { id: "design",   label: "Design Hub",     short: "Design" },
  { id: "doc",      label: "Document Hub",   short: "Document" },
  { id: "eservice", label: "E-Service Hub",  short: "E-Service" },
  { id: "tech",     label: "Tech Hub",       short: "Tech" },
]

/* ── Image with fallback ── */
function ProjectImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false)
  return err ? (
    <div className={cn("bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center", className)}>
      <span className="text-xs text-zinc-400 select-none">No image</span>
    </div>
  ) : (
    <div className={cn("relative", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        onError={() => setErr(true)}
      />
    </div>
  )
}

type ProjectData = typeof PROJECTS[number]

/* ── Desktop 3D card ── */
function DesktopCard({ project, accent }: { project: ProjectData; accent: string }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [imgIdx,    setImgIdx]    = useState(0)

  return (
    <div className="relative w-full" style={{ perspective: "1200px", height: "360px" }}>
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out"
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-[14px] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          onClick={() => setIsFlipped(true)}
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsFlipped(true) } }}
        >
          <div className="relative h-[180px] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <ProjectImage src={project.image} alt={project.title} className="w-full h-full" />
            <span className="absolute top-3 left-3 text-[0.62rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: accent }}>
              {project.tag}
            </span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <h3 className="font-sans font-black text-sm text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2">{project.title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">{project.shortDesc}</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-[14px] overflow-hidden border flex"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: accent, backgroundColor: "var(--background)" }}
          onClick={() => setIsFlipped(false)}
        >
          {/* Left: image carousel */}
          <div className="w-[42%] shrink-0 flex flex-col border-r border-zinc-100 dark:border-zinc-800">
            <div className="relative flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <ProjectImage src={project.images[imgIdx] ?? project.image} alt={`${project.title} ${imgIdx + 1}`} className="w-full h-full" />
              {project.images.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {project.images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setImgIdx(i) }}
                      className="w-1.5 h-1.5 rounded-full transition-all"
                      style={{ backgroundColor: i === imgIdx ? accent : "#d1d5db" }} aria-label={`Image ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: project details */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-sans font-black text-xs leading-snug text-zinc-900 dark:text-zinc-50 flex-1">{project.title}</h3>
              <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false) }}
                className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0" aria-label="Flip back">
                <X size={10} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <div>
              <p className="text-[0.58rem] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>Goal</p>
              <p className="text-[0.65rem] text-zinc-600 dark:text-zinc-300 leading-relaxed">{project.clientGoal}</p>
            </div>
            <div>
              <p className="text-[0.58rem] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>What we did</p>
              <ul className="space-y-0.5">
                {project.whatWeDid.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[0.62rem] text-zinc-600 dark:text-zinc-300">
                    <Check size={8} weight="bold" className="mt-0.5 shrink-0" style={{ color: accent }} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.58rem] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>Result</p>
              <p className="text-[0.65rem] text-zinc-600 dark:text-zinc-300 leading-relaxed">{project.result}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile card with two-tap flip ── */
function MobileCard({ project, accent }: { project: ProjectData; accent: string }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [tapCount,  setTapCount]  = useState(0)

  const handleTap = () => {
    if (isFlipped) return
    if (tapCount === 0) setTapCount(1)
    else { setTapCount(0); setIsFlipped(true) }
  }

  return (
    <div className="relative w-full" style={{ perspective: "1200px", height: "380px" }}>
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out"
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-[14px] overflow-hidden border flex flex-col cursor-pointer transition-all duration-200"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderColor: tapCount >= 1 ? accent : undefined, backgroundColor: "var(--card)" }}
          onClick={handleTap}
        >
          <div className="relative h-[200px] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <ProjectImage src={project.image} alt={project.title} className="w-full h-full" />
            <span className="absolute top-3 left-3 text-[0.62rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: accent }}>
              {project.tag}
            </span>
          </div>
          <div className="p-5 flex flex-col gap-2">
            <h3 className="font-sans font-black text-sm leading-snug transition-colors duration-200"
              style={{ color: tapCount >= 1 ? accent : undefined }}>{project.title}</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{project.shortDesc}</p>
            {tapCount === 1 && (
              <p className="text-[0.68rem] font-bold mt-1" style={{ color: accent }}>Tap again to flip →</p>
            )}
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-[14px] overflow-y-auto border p-5 flex flex-col gap-3.5 cursor-pointer"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: accent, backgroundColor: "var(--background)" }}
          onClick={() => { setIsFlipped(false); setTapCount(0) }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-sans font-black text-sm leading-snug text-zinc-900 dark:text-zinc-50 flex-1 pr-2">{project.title}</h3>
            <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setTapCount(0) }}
              className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0" aria-label="Flip back">
              <X size={12} weight="bold" aria-hidden="true" />
            </button>
          </div>
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>Goal</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{project.clientGoal}</p>
          </div>
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-widest mb-1.5" style={{ color: accent }}>What we did</p>
            <ul className="space-y-1">
              {project.whatWeDid.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <Check size={10} weight="bold" className="mt-0.5 shrink-0" style={{ color: accent }} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>Result</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{project.result}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Gallery Page ── */
export function GalleryPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [activeFilter,   setActiveFilter]   = useState<HubId | "all">("all")
  const [activeRowIdx,   setActiveRowIdx]   = useState(0)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  const visibleRows = activeFilter === "all"
    ? ROW_ORDER
    : ROW_ORDER.filter(r => r.id === activeFilter)

  // Reset active row when filter changes
  useEffect(() => { setActiveRowIdx(0) }, [activeFilter])

  const goLeft  = () => setActiveRowIdx(i => Math.max(0, i - 1))
  const goRight = () => setActiveRowIdx(i => Math.min(visibleRows.length - 1, i + 1))

  useEffect(() => {
    rowRefs.current[activeRowIdx]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [activeRowIdx])

  // Compute theme-aware accent per hub
  const getAccent = useCallback((id: HubId) => {
    const c = HUB_COLORS[id as HubKey]
    return isDark ? c.tagTextDark : c.tagText
  }, [isDark])

  return (
    <section id="main-content" aria-label="Project portfolio"
      className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="abh-page-title mb-4">Our Portfolio</h1>
          <p className="abh-tagline max-w-2xl mx-auto">Real projects from real clients across all five hubs.</p>
          <div className="abh-divider" aria-hidden="true" />
        </div>

        {/* ── Filter pills ── */}
        <div className="flex flex-wrap gap-2 justify-center mb-10" role="group" aria-label="Filter by hub">
          {/* All Hubs */}
          <button
            onClick={() => setActiveFilter("all")}
            aria-pressed={activeFilter === "all"}
            className="px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-200 border active:scale-95"
            style={
              activeFilter === "all"
                ? { backgroundColor: BRAND.orange, color: "#fff", borderColor: BRAND.orange }
                : { backgroundColor: isDark ? "#27272a" : "#f4f4f5", color: isDark ? "#71717a" : "#a1a1aa", borderColor: "transparent" }
            }
          >
            All Hubs
          </button>

          {/* Hub pills */}
          {ROW_ORDER.map(({ id, short }) => {
            const accent   = getAccent(id)
            const isActive = activeFilter === id
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(isActive ? "all" : id)}
                aria-pressed={isActive}
                className="px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all duration-200 border active:scale-95"
                style={
                  isActive
                    ? { backgroundColor: accent, color: "#fff", borderColor: accent }
                    : { backgroundColor: isDark ? "#27272a" : "#f4f4f5", color: isDark ? "#52525b" : "#a1a1aa", borderColor: "transparent" }
                }
              >
                {short}
              </button>
            )
          })}
        </div>

        {/* ── DESKTOP: Hub rows ── */}
        <div className="hidden md:block space-y-8">
          {visibleRows.map(({ id, label }, rowIdx) => {
            const projects = PROJECTS.filter(p => p.hub === id)
            const accent   = getAccent(id)
            const isActive = rowIdx === activeRowIdx
            return (
              <div
                key={id}
                ref={(el) => { rowRefs.current[rowIdx] = el }}
                className={cn("transition-all duration-300 rounded-[14px] p-5 cursor-pointer", isActive ? "bg-zinc-50/60 dark:bg-zinc-900/40" : "opacity-55 hover:opacity-75")}
                style={isActive ? { boxShadow: `0 0 0 1.5px ${accent}` } : {}}
                onClick={() => setActiveRowIdx(rowIdx)}
              >
                <h2 className="text-[0.68rem] font-black uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: accent }}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                  {label}
                </h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
                  {projects.length === 0
                    ? <p className="text-sm text-zinc-400 italic py-6 px-2 col-span-full text-center">Projects coming soon…</p>
                    : projects.map(project => <DesktopCard key={project.id} project={project} accent={accent} />)
                  }
                </div>
              </div>
            )
          })}

          {/* Row navigation arrows — only show when >1 row visible */}
          {visibleRows.length > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button onClick={goLeft} disabled={activeRowIdx === 0} aria-label="Previous hub row"
                className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm",
                  activeRowIdx === 0
                    ? "opacity-25 cursor-not-allowed border-zinc-200 dark:border-zinc-700"
                    : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 cursor-pointer")}>
                <ArrowLeft size={16} weight="bold" className="text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
              </button>

              {/* Row dots */}
              <div className="flex gap-2">
                {visibleRows.map(({ id }, i) => {
                  const accent = getAccent(id)
                  return (
                    <button key={id} onClick={() => setActiveRowIdx(i)} aria-label={`Go to ${visibleRows[i].label}`}
                      className="w-2 h-2 rounded-full transition-all duration-200"
                      style={{ backgroundColor: i === activeRowIdx ? accent : "#d1d5db", transform: i === activeRowIdx ? "scale(1.5)" : "scale(1)" }} />
                  )
                })}
              </div>

              <button onClick={goRight} disabled={activeRowIdx === visibleRows.length - 1} aria-label="Next hub row"
                className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm",
                  activeRowIdx === visibleRows.length - 1
                    ? "opacity-25 cursor-not-allowed border-zinc-200 dark:border-zinc-700"
                    : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 cursor-pointer")}>
                <ArrowRight size={16} weight="bold" className="text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* ── MOBILE: Vertical feed grouped by hub ── */}
        <div className="md:hidden space-y-10">
          {visibleRows.map(({ id, label }) => {
            const projects = PROJECTS.filter(p => p.hub === id)
            const accent   = getAccent(id)
            return (
              <div key={id}>
                <h2 className="text-[0.68rem] font-black uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: accent }}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
                  {label}
                </h2>
                <div className="space-y-5">
                  {projects.length === 0
                    ? <p className="text-sm text-zinc-400 italic py-4">Projects coming soon…</p>
                    : projects.map(project => <MobileCard key={project.id} project={project} accent={accent} />)
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
