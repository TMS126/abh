"use client"

import { useCallback, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { ArrowsLeftRight } from "@phosphor-icons/react"
import { ProjectData } from "@/lib/data"
import { HUB_COLORS } from "@/lib/brand"
import { BA_HUBS, CLIENT_TYPE_LABEL, HubId, hubLabelFor } from "@/lib/gallery-helpers"
import { SafeImage } from "./safe-image"
import { LikeButton, ShareButton } from "./like-share-buttons"

// ============================================================
// Project Card (single carousel slide)
// ============================================================

function ProjectCard({
  project, accent, onSelect, liked, onToggleLike, position,
}: {
  project: ProjectData; accent: string; onSelect: (p: ProjectData) => void
  liked: boolean; onToggleLike: (e: React.MouseEvent) => void; position?: string
}) {
  const pathname = usePathname()
  const hasBA = BA_HUBS.includes(project.hub as HubId) && !!(project as any).beforeImage && !!(project as any).afterImage
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`

  // The header/footer bars are ALWAYS dark (bg-zinc-950/90) in both themes,
  // so their content must use theme-independent, dark-surface-safe colors —
  // not the page `accent` (which is near-black for Tech in light mode, and a
  // pale pastel for every hub in dark mode). accentDark is the bright variant
  // (readable label text on dark); accentLight is the AA-dark variant (safe
  // fill behind the badge's white text).
  const hubColors = HUB_COLORS[project.hub as HubId] ?? HUB_COLORS.print
  const labelColor = hubColors.accentDark
  const badgeBg = hubColors.accentLight

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(project)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(project) } }}
      className="w-full h-full text-left cursor-pointer"
    >
      <div className="relative w-full h-full rounded-[16px] overflow-hidden">
        <SafeImage src={project.image} alt={project.title} accent={accent} fill sizes="(max-width: 640px) 100vw, 448px" className="object-cover" />

        {/* ---- Header bar: hub label + before/after badge ---- */}
        <div className="absolute top-0 inset-x-0 flex items-center gap-2 px-3 py-2.5 bg-zinc-950/90 z-20">
          <span className="flex-1 min-w-0 text-[0.9rem] font-black truncate" style={{ color: labelColor }}>
            {hubLabelFor(project.hub)}
          </span>
          {hasBA && (
            <span
              className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.66rem] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: badgeBg }}
            >
              <ArrowsLeftRight size={9} weight="bold" />
              B&amp;A
            </span>
          )}
        </div>

        {/* ---- Position indicator (e.g. "2/5") ---- */}
        {position && (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/85 text-[0.74rem] font-bold z-20">
            {position}
          </div>
        )}

        {/* ---- Like / share action stack ----
             z-30 (above the footer bar's z-10) and bottom-24 so the
             circles sit fully clear of the footer bar instead of
             being overlapped/clipped by it. */}
        <div className="absolute bottom-24 right-3 flex flex-col items-center gap-2 z-30">
          <div onClick={(e) => e.stopPropagation()} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center [&_svg]:text-white [&_svg]:w-4 [&_svg]:h-4">
            <LikeButton liked={liked} onToggle={onToggleLike} context="card" />
          </div>
          <div onClick={(e) => e.stopPropagation()} className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center [&_svg]:text-white [&_svg]:w-4 [&_svg]:h-4">
            <ShareButton url={shareUrl} title={project.title} />
          </div>
        </div>

        {/* ---- Footer: title + client type ---- */}
        <div className="absolute bottom-0 inset-x-0 px-3 py-3 bg-zinc-950/90 z-10">
          <h3 className="text-white font-black text-[1.14rem] leading-snug">{project.title}</h3>
          {project.clientType && (
            <p className="text-white/70 text-[0.82rem] italic mt-1">
              {CLIENT_TYPE_LABEL[project.clientType]}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Swipe Carousel (drives multiple ProjectCards, touch + drag)
// ============================================================

function SwipeCarousel({
  projects, accent, onSelect, likedIds, onToggleLike,
}: {
  projects: ProjectData[]; accent: string; onSelect: (p: ProjectData) => void
  likedIds: Set<string>; onToggleLike: (id: string) => void
}) {
  const n = projects.length
  const [active, setActive] = useState(0)
  const [dragX, setDragX]   = useState(0)
  const touchStartX = useRef<number | null>(null)
  const dragMoved    = useRef(false)

  const goTo = useCallback((i: number) => setActive(((i % n) + n) % n), [n])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])
  const next = useCallback(() => goTo(active + 1), [active, goTo])

  // ---- Touch handlers (mobile swipe) ----
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    dragMoved.current = false
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.touches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 5) dragMoved.current = true
    setDragX(dx)
  }
  const onTouchEnd = () => {
    if (Math.abs(dragX) > 60) (dragX < 0 ? next() : prev())
    setDragX(0)
    touchStartX.current = null
  }

  // ---- Slot positioning (active / adjacent / hidden) ----
  // Adjacent ("back") slides are darkened via brightness only —
  // never grayscale/desaturated — so they still read as color
  // photos, just dimmed to push focus onto the active project.
  const slotStyle = (offset: number): React.CSSProperties => {
    const abs = Math.abs(offset)
    if (abs === 0) {
      return { transform: `translateX(${dragX}px) scale(1)`, opacity: 1, zIndex: 30, filter: "none" }
    }
    if (abs === 1) {
      return {
        transform: `translateX(${offset * 90 + dragX * 0.4}%) scale(0.88)`,
        opacity: 1,
        zIndex: 20,
        filter: "brightness(0.5)",
      }
    }
    return {
      transform: `translateX(${offset * 150}%) scale(0.8)`,
      opacity: 0,
      zIndex: 10,
      filter: "brightness(0.5)",
      pointerEvents: "none",
    }
  }

  return (
    <div className="relative">
      <div
        className="relative w-full aspect-[4/3]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {projects.map((project, i) => {
          let offset = i - active
          if (offset > n / 2) offset -= n
          if (offset < -n / 2) offset += n
          if (Math.abs(offset) > 2) return null

          const isActive = offset === 0

          return (
            <div
              key={project.id}
              aria-hidden={!isActive}
              className="absolute inset-0 transition-[transform,opacity,filter] duration-500 ease-out"
              style={slotStyle(offset)}
              onClick={() => { if (!isActive && !dragMoved.current) goTo(i) }}
            >
              <ProjectCard
                project={project}
                accent={accent}
                onSelect={(p) => { if (isActive && !dragMoved.current) onSelect(p) }}
                liked={likedIds.has(project.id)}
                onToggleLike={(e) => { e.stopPropagation(); onToggleLike(project.id) }}
                position={`${i + 1}/${n}`}
              />
            </div>
          )
        })}
      </div>

      {/* ---- Dot pagination ---- */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {projects.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to project ${i + 1}`}
            onClick={() => goTo(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === active ? "18px" : "6px", backgroundColor: i === active ? accent : undefined }}
          >
            <span
              className={i === active ? "sr-only" : "block h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Public API: ProjectCarousel
// Consistent card-swipe UI across all breakpoints. No frame, no
// center accent line — the hub-accent vertical line lives next
// to the hub title elsewhere, not here.
// ============================================================

export function ProjectCarousel({ projects, accent, onSelect, likedIds, onToggleLike }: {
  projects: ProjectData[]; accent: string; onSelect: (p: ProjectData) => void
  likedIds: Set<string>; onToggleLike: (id: string) => void
}) {
  return (
    <div className="max-w-md mx-auto">
      {projects.length === 1 ? (
        <div className="aspect-[4/3]">
          <ProjectCard
            project={projects[0]}
            accent={accent}
            onSelect={onSelect}
            liked={likedIds.has(projects[0].id)}
            onToggleLike={(e) => { e.stopPropagation(); onToggleLike(projects[0].id) }}
          />
        </div>
      ) : (
        <SwipeCarousel
          projects={projects}
          accent={accent}
          onSelect={onSelect}
          likedIds={likedIds}
          onToggleLike={onToggleLike}
        />
      )}
    </div>
  )
} 
