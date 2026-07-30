"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { CaretLeft, CaretRight, ArrowsLeftRight } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { ProjectData } from "@/lib/data"
import { BA_HUBS, CLIENT_TYPE_BADGE_BG, CLIENT_TYPE_LABEL, HubId, hubLabelFor } from "@/lib/gallery-helpers"
import { SafeImage } from "./safe-image"
import { LikeButton, ShareButton } from "./like-share-buttons"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isMobile
}

// ─── Mobile card — hub name (not caps, hub-colored) top-left, project count
// badge top-right corner, heart+share grouped bottom-right over the image,
// title/client-type on the solid bottom bar.
function MobileProjectCard({
  project, accent, onSelect, liked, onToggleLike, position,
}: {
  project: ProjectData; accent: string; onSelect: (p: ProjectData) => void
  liked: boolean; onToggleLike: (e: React.MouseEvent) => void; position: string
}) {
  const pathname = usePathname()
  const hasBA = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`

  return (
    <button onClick={() => onSelect(project)} className="w-full text-left">
      <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden">
        <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="100vw" className="object-cover" />

        {/* Top bar — hub name only, not all-caps, hub-colored */}
        <div className="absolute top-0 inset-x-0 flex items-center gap-2 px-3 py-2.5 bg-zinc-950/90">
          <span className="flex-1 min-w-0 text-[0.75rem] font-black truncate" style={{ color: accent }}>
            {hubLabelFor(project.hub)}
          </span>
          {hasBA && (
            <span
              className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.55rem] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: accent }}
            >
              <ArrowsLeftRight size={9} weight="bold" />
              B&amp;A
            </span>
          )}
        </div>

        {/* Position badge — top-right corner */}
        <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/80 text-[0.62rem] font-bold">
          {position}
        </div>

        {/* Heart + share — grouped, bottom-right, over the image */}
        <div className="absolute bottom-16 right-2.5 flex flex-col items-center gap-2">
          <div onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center [&_svg]:text-white">
            <LikeButton liked={liked} onToggle={onToggleLike} context="card" />
          </div>
          <div onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center [&_svg]:text-white">
            <ShareButton url={shareUrl} title={project.title} />
          </div>
        </div>

        {/* Bottom bar — solid, title never truncates, wraps freely */}
        <div className="absolute bottom-0 inset-x-0 px-3 py-3 bg-zinc-950/90">
          <h3 className="text-white font-black text-[0.95rem] leading-snug">{project.title}</h3>
          {project.clientType && (
            <p className="text-white/70 text-[0.68rem] italic mt-1">
              {CLIENT_TYPE_LABEL[project.clientType]}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

// Shows the first project full-size; if more exist, two faint offset layers
// peek out behind it to hint at a stack. Full browsing of the rest happens
// via the "N projects" popover already in the row header.
function StackedMobileCard({
  projects, accent, onSelect, liked, onToggleLike,
}: {
  projects: ProjectData[]; accent: string; onSelect: (p: ProjectData) => void
  liked: boolean; onToggleLike: (e: React.MouseEvent) => void
}) {
  const extra = projects.length - 1
  return (
    <div className="relative">
      {extra > 0 && (
        <>
          <div className="absolute inset-x-4 -bottom-2 top-2 rounded-[16px] bg-zinc-300/50 dark:bg-zinc-700/50 -z-20 scale-[0.94]" />
          <div className="absolute inset-x-2 -bottom-1 top-1 rounded-[16px] bg-zinc-200/70 dark:bg-zinc-800/70 -z-10 scale-[0.97]" />
        </>
      )}
      <MobileProjectCard
        project={projects[0]}
        accent={accent}
        onSelect={onSelect}
        liked={liked}
        onToggleLike={onToggleLike}
        position={`1/${projects.length}`}
      />
    </div>
  )
}

export function ProjectCarousel({ projects, accent, onSelect, likedIds, onToggleLike }: {
  projects: ProjectData[]; accent: string; onSelect: (p: ProjectData) => void
  likedIds: Set<string>; onToggleLike: (id: string) => void
}) {
  const isMobile = useIsMobile()
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

  if (isMobile) {
    return (
      <StackedMobileCard
        projects={projects}
        accent={accent}
        onSelect={onSelect}
        liked={likedIds.has(projects[0].id)}
        onToggleLike={(e) => { e.stopPropagation(); onToggleLike(projects[0].id) }}
      />
    )
  }

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
          <div key={project.id} className="shrink-0 w-full snap-center px-6 md:px-8 py-11 md:py-14" style={{ scrollSnapAlign: "center" }}>
            <div
              className="group abh-shadow-project-card rounded-[16px] cursor-pointer will-change-transform transition-all duration-300 ease-out active:scale-[0.98] hover:-translate-y-1.5"
              style={{
                ["--hub-accent" as any]: accent,
                ["--hub-shadow" as any]: `${accent}55`,
              }}
              onClick={() => { if (!dragMoved.current) onSelect(project) }}
            >
              <div className="relative rounded-[16px] overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 group-hover:border-[var(--hub-accent)] bg-white dark:bg-zinc-950 transition-colors duration-300">
                <div className="relative aspect-[16/9] md:aspect-[16/8] bg-zinc-100 dark:bg-zinc-900">
                  <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-white font-black text-xl md:text-2xl leading-tight transition-colors duration-300 group-hover:text-[var(--hub-accent)]">{project.title}</h3>
                      <p className="text-white/70 text-xs font-medium mt-1 line-clamp-1">{project.shortDesc}</p>
                    </div>
                    {project.clientType && (
                      <span
                        className="shrink-0 text-[0.58rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-lg backdrop-blur-sm whitespace-nowrap"
                        style={{ backgroundColor: CLIENT_TYPE_BADGE_BG[project.clientType] }}
                      >
                        {CLIENT_TYPE_LABEL[project.clientType]}
                      </span>
                    )}
                  </div>
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
        <div className="flex justify-center gap-2 -mt-6">
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
