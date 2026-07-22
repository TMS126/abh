"use client"

import { useCallback, useRef, useState } from "react"
import { CaretLeft, CaretRight, ArrowsLeftRight } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { ProjectData } from "@/lib/data"
import { BA_HUBS, CLIENT_TYPE_BADGE_BG, CLIENT_TYPE_LABEL, HubId } from "@/lib/gallery-helpers"
import { SafeImage } from "./safe-image"
import { LikeButton } from "./like-share-buttons"

// SHADOW FIX (real cause): overflow-x-auto on the scrolling track was
// implicitly forcing overflow-y to 'auto' too — this is a CSS spec quirk,
// not a bug in this file: when one axis is set to something other than
// 'visible', the other axis can't stay 'visible' either, so it silently
// clips. That's what hard-cut the card's box-shadow right at the track's
// vertical edge. There's no way to keep one axis clipping and the other
// fully open via overflow properties alone — the only real fix is making
// sure the shadow never actually exceeds the padding box, so there's
// nothing left for that forced auto to clip. Slide padding bumped from
// py-3/py-4 to py-11/py-14 (44–56px), and the hover shadow's reach
// trimmed slightly, so the shadow's max extent now sits safely inside
// the padding on both mobile and desktop.
//
// SINGLE SOURCE OF TRUTH: resting + hover shadow values now live in
// .abh-shadow-project-card (globals.css). The hover glow tint still needs
// to be per-hub-color dynamic, so it's passed via the --hub-shadow CSS
// custom property (was already being set here but never actually used —
// the old onMouseEnter/onMouseLeave handlers duplicated the same values
// as inline JS instead of letting the CSS class's :hover rule read the var).
export function ProjectCarousel({ projects, accent, onSelect, likedIds, onToggleLike }: {
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
                  <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2">
                    <LikeButton
                      liked={likedIds.has(project.id)}
                      onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }}
                      context="card"
                    />
                    {project.clientType && (
                      <span
                        className="text-[0.58rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-lg backdrop-blur-sm whitespace-nowrap"
                        style={{ backgroundColor: CLIENT_TYPE_BADGE_BG[project.clientType] }}
                      >
                        {CLIENT_TYPE_LABEL[project.clientType]}
                      </span>
                    )}
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
