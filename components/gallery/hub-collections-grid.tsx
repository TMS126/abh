"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { ArrowsLeftRight, Image as ImageIcon } from "@phosphor-icons/react"
import { HUB_COLORS, type HubKey } from "@/lib/brand"
import { HUBS, PROJECTS, type HubId, type ProjectData } from "@/lib/data"
import { SafeImage } from "./safe-image"
import { LikeButton, ShareButton } from "./like-share-buttons"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]
const VISIBLE_COUNT = 3

function HubCollectionCard({
  hubId, projects, accent, isDark, likedIds, onToggleLike, onOpenProject, onSelectHub,
}: {
  hubId: HubId
  projects: ProjectData[]
  accent: string
  isDark: boolean
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  onOpenProject: (p: ProjectData) => void
  onSelectHub: (id: HubId) => void
}) {
  const pathname = usePathname()
  const [projectIdx, setProjectIdx] = useState(0)
  const [order, setOrder] = useState<number[]>([0, 1, 2])
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const didSwipe = useRef(false)

  const project = projects[projectIdx]
  const images = project.images?.length ? project.images : [project.image]

  // Reset which image is "big" whenever the active project changes
  useEffect(() => {
    setOrder([0, 1, 2].filter((i) => i < images.length))
  }, [project.id])

  const bigIdx = order[0] ?? 0
  const thumbIdxs = order.slice(1, 3)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    didSwipe.current = false
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (projects.length < 2) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    if (Math.abs(dx) < 40 || dy > Math.abs(dx)) return
    didSwipe.current = true
    setProjectIdx((prev) => (dx < 0 ? (prev + 1) % projects.length : (prev - 1 + projects.length) % projects.length))
  }
  const handleImageClick = () => {
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    onOpenProject(project)
  }

  const swapThumb = (posInOrder: number) => {
    setOrder((prev) => {
      const next = [...prev]
      ;[next[0], next[posInOrder]] = [next[posInOrder], next[0]]
      return next
    })
  }

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${project.id}` : `${pathname}?project=${project.id}`

  return (
    // ---- Outer wrapper: big card container removed. ----
    // No background, border, shadow, or rounded card shape anymore —
    // just left padding to make room for the accent line.
    <div className="pl-4">
      {/* Big image — click opens the project, swipe changes project */}
      <div className="relative aspect-[4/3] cursor-pointer group rounded-[14px] overflow-hidden" onClick={handleImageClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* ---- Accent line container ----
             Thin vertical bar in the hub's accent color, sitting
             right against the left edge of the image, spanning
             exactly the image's height. This replaces the old
             big rounded card container entirely. */}
        <div
          className="absolute -left-4 top-0 bottom-0 w-[3px] rounded-full z-20 pointer-events-none"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />

        <SafeImage src={images[bigIdx]} alt={project.title} accent={accent} fill sizes="(max-width: 1024px) 33vw, 400px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 60%)" }} />

        {projects.length > 1 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-[0.78rem] font-bold">
            <ArrowsLeftRight size={12} weight="bold" aria-hidden="true" />
            Swipe for more {HUBS[hubId].title} projects
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors shrink-0 [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
            <LikeButton liked={likedIds.has(project.id)} onToggle={(e) => { e.stopPropagation(); onToggleLike(project.id) }} context="card" />
          </div>
          <p className="flex-1 min-w-0 text-center text-white text-base font-black truncate px-1">{project.title}</p>
          <div className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center transition-colors shrink-0 [&_svg]:text-white" onClick={(e) => e.stopPropagation()}>
            <ShareButton url={shareUrl} title={project.title} />
          </div>
        </div>
      </div>

      {/* Two square thumbnails — click to swap into the big spot */}
      {thumbIdxs.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-2">
          {thumbIdxs.map((imgIdx, posOffset) => (
            <button key={imgIdx} onClick={() => swapThumb(posOffset + 1)} aria-label="View this image large" className="relative aspect-square rounded-[10px] overflow-hidden">
              <SafeImage src={images[imgIdx]} alt={`${project.title} detail`} accent={accent} fill sizes="150px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Footer — hub name + project count, click filters to this hub */}
      <button onClick={() => onSelectHub(hubId)} className="w-full flex items-center justify-between pt-2 pb-1 text-left">
        <h3 className="font-sans font-black text-xl text-zinc-900 dark:text-zinc-50">{HUBS[hubId].title}</h3>
        <span className="flex items-center gap-1 text-sm font-semibold text-zinc-400 dark:text-zinc-500">
          <ImageIcon size={14} weight="fill" aria-hidden="true" />
          {projects.length}
        </span>
      </button>
    </div>
  )
}

export function HubCollectionsGrid({
  isDark, onSelectHub, likedIds, onToggleLike, onOpenProject,
}: {
  isDark: boolean
  onSelectHub: (hubId: HubId) => void
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  onOpenProject: (p: ProjectData) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const hubEntries = HUB_ORDER.map((hubId) => {
    const hubProjects = PROJECTS.filter((p) => p.hub === hubId)
    if (hubProjects.length === 0) return null
    const accent = isDark ? HUB_COLORS[hubId as HubKey].accentDark : HUB_COLORS[hubId as HubKey].accentLight
    return { hubId, projects: hubProjects, accent }
  }).filter((h): h is NonNullable<typeof h> => h !== null)

  const visible = expanded ? hubEntries : hubEntries.slice(0, VISIBLE_COUNT)
  const remaining = hubEntries.length - VISIBLE_COUNT

  return (
    <div className="hidden md:block">
      <div className="grid grid-cols-3 gap-6">
        {visible.map((h) => (
          <HubCollectionCard
            key={h.hubId}
            hubId={h.hubId}
            projects={h.projects}
            accent={h.accent}
            isDark={isDark}
            likedIds={likedIds}
            onToggleLike={onToggleLike}
            onOpenProject={onOpenProject}
            onSelectHub={onSelectHub}
          />
        ))}
      </div>

      {!expanded && remaining > 0 && (
        <div className="flex justify-center mt-6">
          <button onClick={() => setExpanded(true)} className="px-5 py-2.5 rounded-full text-base font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            {remaining}+ more
          </button>
        </div>
      )}
    </div>
  )
} 