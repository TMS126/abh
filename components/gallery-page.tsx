"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Check, Info, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { PROJECTS, ProjectData } from "@/lib/data"

type HubId = "print" | "doc" | "design" | "eservice" | "tech"
const ROW_ORDER: { id: HubId; label: string; short: string }[] = [
  { id: "print",    label: "Print Hub",      short: "Print" },
  { id: "design",   label: "Design Hub",     short: "Design" },
  { id: "doc",      label: "Document Hub",   short: "Document" },
  { id: "eservice", label: "E-Service Hub",  short: "E-Service" },
  { id: "tech",     label: "Tech Hub",       short: "Tech" },
]

function ProjectViewerModal({ project, onClose }: { project: ProjectData | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === "dark"
  useEffect(() => {
    if (!project) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [project, onClose])
  if (!project) return null
  const accent = isDark ? HUB_COLORS[project.hub as HubKey].tagTextDark : HUB_COLORS[project.hub as HubKey].tagText
  const allImages = project.images.length > 0 ? project.images : [project.image]

  return (
    <div className="fixed inset-0 z-[10200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-zinc-800">
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-4 md:p-8 space-y-6">
          {allImages.map((img, idx) => (
            <div key={idx} className="relative aspect-[16/10] rounded-[14px] overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
              <Image src={img} alt={`${project.title} view ${idx + 1}`} fill className="object-cover" sizes="100vw" />
            </div>
          ))}
        </div>
        <div className="w-full md:w-[380px] p-8 flex flex-col border-l border-zinc-100 dark:border-zinc-800 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[0.65rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>{project.tag}</span>
              <h2 className="font-sans font-black text-2xl text-zinc-900 dark:text-zinc-50 leading-tight">{project.title}</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200"><X size={20} weight="bold" /></button>
          </div>
          <div className="space-y-8">
            <section><h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>The Goal</h4><p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{project.clientGoal}</p></section>
            <section><h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>What we did</h4><ul className="space-y-2">{project.whatWeDid.map((item, i) => (<li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300 font-medium"><Check size={14} weight="bold" className="mt-1 shrink-0" style={{ color: accent }} />{item}</li>))}</ul></section>
            <section><h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>The Result</h4><p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">{project.result}</p></section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Carousel({ projects, onSelect }: { projects: ProjectData[]; onSelect: (p: ProjectData) => void }) {
  const [centerIdx, setCenterIdx] = useState(0); const containerRef = useRef<HTMLDivElement>(null)
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const scrollLeft = containerRef.current.scrollLeft; const cardWidth = 400 + 24
    const idx = Math.round(scrollLeft / cardWidth); if (idx !== centerIdx) setCenterIdx(idx)
  }, [centerIdx])
  const scrollToIndex = (idx: number) => {
    if (!containerRef.current) return
    const cardWidth = 400 + 24; containerRef.current.scrollTo({ left: idx * cardWidth, behavior: "smooth" })
  }

  return (
    <div className="relative group/carousel">
      <div ref={containerRef} onScroll={handleScroll} className="flex gap-6 overflow-x-auto pb-12 pt-12 px-[calc(50%-200px)] snap-x snap-mandatory no-scrollbar">
        {projects.map((project, idx) => {
          const isCenter = idx === centerIdx
          return (
            <div key={project.id} className={cn("snap-center shrink-0 w-[400px] transition-all duration-500 cursor-pointer", isCenter ? "scale-110 z-10 opacity-100" : "scale-90 opacity-40 blur-[1px]")} onClick={() => isCenter ? onSelect(project) : scrollToIndex(idx)}>
              <div className="rounded-[14px] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                <div className="relative aspect-[4/3]">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-white mb-2 inline-block border border-white/20">{project.tag}</span>
                    <h3 className="text-white font-black text-xl leading-tight">{project.title}</h3>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={() => scrollToIndex(centerIdx - 1)} disabled={centerIdx === 0} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xl flex items-center justify-center text-zinc-800 dark:text-white disabled:opacity-0 transition-all opacity-0 group-hover/carousel:opacity-100 z-20"><CaretLeft size={24} weight="bold" /></button>
      <button onClick={() => scrollToIndex(centerIdx + 1)} disabled={centerIdx === projects.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xl flex items-center justify-center text-zinc-800 dark:text-white disabled:opacity-0 transition-all opacity-0 group-hover/carousel:opacity-100 z-20"><CaretRight size={24} weight="bold" /></button>
    </div>
  )
}

export function GalleryPage() {
  const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === "dark"
  const [activeFilter, setActiveFilter] = useState<HubId | "all">("all")
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [selectedProject])
  const getAccent = useCallback((id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.tagTextDark : c.tagText }, [isDark])
  const filteredRows = activeFilter === "all" ? ROW_ORDER : ROW_ORDER.filter(r => r.id === activeFilter)

  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="abh-page-title mb-4">Our Portfolio</h1>
          <p className="abh-tagline max-w-2xl mx-auto">Real results for real clients. Select a category to explore our work in depth.</p>
          <div className="abh-divider" />
        </div>
        <div className="flex flex-col md:flex-row gap-2 justify-center mb-16">
          <button onClick={() => setActiveFilter("all")} className={cn("px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all", activeFilter === "all" ? "bg-brand-blue text-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800")}>All Hubs</button>
          {ROW_ORDER.map(row => {
            const accent = getAccent(row.id); const isActive = activeFilter === row.id
            return <button key={row.id} onClick={() => setActiveFilter(row.id)} className={cn("px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all", isActive ? "text-white shadow-lg" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800")} style={isActive ? { backgroundColor: accent } : {}}>{row.short}</button>
          })}
        </div>
        <div className="max-w-2xl mx-auto mb-16 p-6 rounded-[14px] border border-brand-blue/20 bg-brand-blue/5 dark:bg-brand-blue/10 flex items-center gap-6">
          <div className="w-12 h-12 shrink-0 rounded-[14px] bg-brand-blue/10 flex items-center justify-center text-brand-blue"><Info size={28} weight="fill" /></div>
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 leading-relaxed">Note: We use high-quality sample photos to represent our services, ensuring the professional standard shown is exactly what you receive.</p>
        </div>
        <div className="space-y-24">
          {filteredRows.map(row => {
            const projects = PROJECTS.filter(p => p.hub === row.id); if (projects.length === 0) return null
            return (
              <div key={row.id} className="relative">
                <div className="flex items-center gap-4 mb-8 px-4"><div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: getAccent(row.id) }} /><h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2><span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-auto">{projects.length} Projects</span></div>
                <div className="md:hidden flex flex-col gap-6 px-4">
                  {projects.map(p => (
                    <div key={p.id} className="w-full" onClick={() => setSelectedProject(p)}>
                      <div className="rounded-[14px] overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                        <div className="relative aspect-[16/10]"><Image src={p.image} alt={p.title} fill className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /><div className="absolute bottom-4 left-4 right-4"><h3 className="font-black text-lg text-white leading-tight">{p.title}</h3></div></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block"><Carousel projects={projects} onSelect={setSelectedProject} /></div>
              </div>
            )
          })}
        </div>
      </div>
      <ProjectViewerModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  )
}
