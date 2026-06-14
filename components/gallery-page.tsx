"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ArrowLeft, ArrowRight, X, Check, Info, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BRAND, HUB_COLORS, HubKey } from "@/lib/brand"
import { PROJECTS, ProjectData } from "@/lib/data"

type HubId = "print" | "doc" | "design" | "eservice" | "tech"

const ROW_ORDER: { id: HubId; label: string; short: string }[] = [
  { id: "print",    label: "Print Hub",      short: "Print" },
  { id: "design",   label: "Design Hub",     short: "Design" },
  { id: "doc",      label: "Document Hub",   short: "Document" },
  { id: "eservice", label: "E-Service Hub",  short: "E-Service" },
  { id: "tech",     label: "Tech Hub",       short: "Tech" },
]

function ProjectImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-zinc-100 dark:bg-[#27272A]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

function ProjectViewerModal({ project, onClose }: { project: ProjectData | null; onClose: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [imgIdx, setImgIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

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
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#18181B] rounded-[14px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] animate-in zoom-in-95 duration-500 border border-zinc-100 dark:border-[#27272A]">

        {/* Left: Scrollable Images */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-[#09090B] p-4 md:p-8 space-y-6" ref={scrollRef}>
          {allImages.map((img, idx) => (
            <div key={idx} className="relative aspect-[4/3] rounded-[14px] overflow-hidden shadow-lg border border-zinc-200 dark:border-[#27272A]">
              <Image src={img} alt={`${project.title} view ${idx + 1}`} fill className="object-cover" sizes="100vw" />
            </div>
          ))}
        </div>

        {/* Right: Project Details */}
        <div className="w-full md:w-[380px] p-8 flex flex-col border-l border-zinc-100 dark:border-[#27272A] overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[0.65rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block" style={{ backgroundColor: `${accent}15`, color: accent }}>
                {project.tag}
              </span>
              <h2 className="font-sans font-black text-2xl text-zinc-900 dark:text-[#FAFAFA] leading-tight">{project.title}</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#27272A] flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
              <X size={20} weight="bold" />
            </button>
          </div>

          <div className="space-y-8">
            <section>
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>The Goal</h4>
              <p className="text-sm text-zinc-600 dark:text-[#A1A1AA] leading-relaxed font-medium">{project.clientGoal}</p>
            </section>

            <section>
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>What we did</h4>
              <ul className="space-y-2">
                {project.whatWeDid.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-[#A1A1AA] font-medium">
                    <Check size={14} weight="bold" className="mt-1 shrink-0" style={{ color: accent }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-[0.65rem] font-black uppercase tracking-widest mb-3" style={{ color: accent }}>The Result</h4>
              <p className="text-sm text-zinc-600 dark:text-[#A1A1AA] leading-relaxed font-medium">{project.result}</p>
            </section>
          </div>

          <div className="mt-auto pt-8">
            <div className="p-4 rounded-[14px] bg-zinc-50 dark:bg-[#27272A] border border-zinc-100 dark:border-[#27272A] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Info size={18} weight="fill" />
              </div>
              <p className="text-[0.65rem] font-bold text-zinc-500 dark:text-[#A1A1AA]">Scroll the image panel to see all project views.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GalleryPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [activeFilter, setActiveFilter] = useState<HubId | "all">("all")
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)

  /* Scroll lock when project viewer is open */
  useEffect(() => {
    if (selectedProject) {
      document.body.classList.add("scroll-locked")
    } else {
      document.body.classList.remove("scroll-locked")
    }
    return () => { document.body.classList.remove("scroll-locked") }
  }, [selectedProject])

  const getAccent = useCallback((id: HubId) => {
    const c = HUB_COLORS[id as HubKey]
    return isDark ? c.tagTextDark : c.tagText
  }, [isDark])

  const filteredRows = activeFilter === "all" ? ROW_ORDER : ROW_ORDER.filter(r => r.id === activeFilter)

  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="abh-page-title mb-4">Our Portfolio</h1>
          <p className="abh-tagline max-w-2xl mx-auto">Real results for real clients. Select a category to explore our work in depth.</p>
          <div className="abh-divider" />
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-16">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              activeFilter === "all" ? "bg-brand-blue text-white shadow-lg" : "bg-zinc-100 dark:bg-[#27272A] text-zinc-500 hover:bg-zinc-200"
            )}
          >
            All Hubs
          </button>
          {ROW_ORDER.map(row => {
            const accent = getAccent(row.id)
            const isActive = activeFilter === row.id
            return (
              <button
                key={row.id}
                onClick={() => setActiveFilter(row.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  isActive ? "text-white shadow-lg" : "bg-zinc-100 dark:bg-[#27272A] text-zinc-500 hover:bg-zinc-200"
                )}
                style={isActive ? { backgroundColor: accent } : {}}
              >
                {row.short}
              </button>
            )
          })}
        </div>

        {/* Warning Container */}
        <div className="max-w-2xl mx-auto mb-16 p-6 rounded-[14px] border border-brand-blue/20 bg-brand-blue/5 dark:bg-brand-blue/10 flex items-center gap-6">
          <div className="w-12 h-12 shrink-0 rounded-[14px] bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <Info size={28} weight="fill" />
          </div>
          <p className="text-sm font-bold text-zinc-600 dark:text-[#A1A1AA] leading-relaxed">
            Note: We use high-quality sample photos to represent our services, ensuring the professional standard shown is exactly what you receive.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-24">
          {filteredRows.map(row => {
            const projects = PROJECTS.filter(p => p.hub === row.id)
            const accent = getAccent(row.id)
            if (projects.length === 0) return null

            return (
              <div key={row.id} className="relative">
                <div className="flex items-center gap-4 mb-8 px-4">
                  <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: accent }} />
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-[#FAFAFA]">{row.label}</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-auto">{projects.length} Projects</span>
                </div>

                {/* Mobile: single column */}
                <div className="flex flex-col gap-4 md:hidden">
                  {projects.map(p => (
                    <div key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer">
                      <div className="rounded-[14px] overflow-hidden border border-zinc-100 dark:border-[#27272A] bg-white dark:bg-[#18181B]">
                        <div className="relative aspect-[4/3]">
                          <Image src={p.image} alt={p.title} fill className="object-cover" />
                        </div>
                        <div className="p-4">
                          <span className="text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-zinc-100 dark:bg-[#27272A] text-zinc-500 mb-2 inline-block">{p.tag}</span>
                          <h3 className="font-black text-sm text-zinc-900 dark:text-[#FAFAFA] line-clamp-1">{p.title}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet: 2-col grid */}
                <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
                  {projects.map(p => (
                    <div key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer">
                      <div className="rounded-[14px] overflow-hidden border border-zinc-100 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="relative aspect-[4/3]">
                          <Image src={p.image} alt={p.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <span className="text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-white mb-2 inline-block border border-white/20">{p.tag}</span>
                            <h3 className="text-white font-black text-lg leading-tight">{p.title}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: 3-col grid */}
                <div className="hidden lg:grid grid-cols-3 gap-4">
                  {projects.map(p => (
                    <div key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer">
                      <div className="rounded-[14px] overflow-hidden border border-zinc-100 dark:border-[#27272A] bg-white dark:bg-[#18181B] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="relative aspect-[4/3]">
                          <Image src={p.image} alt={p.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <span className="text-[0.6rem] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-white mb-2 inline-block border border-white/20">{p.tag}</span>
                            <h3 className="text-white font-black text-lg leading-tight">{p.title}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ProjectViewerModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  )
}
