// components/gallery/gallery-page.tsx
"use client"

import { useCallback, useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { X, Info, MagnifyingGlass, Shuffle, ArrowUp, Heart } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { PROJECTS, ProjectData } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"
import { ROW_ORDER, HubId } from "@/lib/gallery-helpers"
import { useGalleryBackStack } from "@/hooks/use-gallery-back-stack"
import { ProjectViewerModal } from "@/components/gallery/project-viewer-modal"
import { SafeImage } from "@/components/gallery/safe-image"
import { HubIcon } from "@/components/services-page/shared"
import { GalleryClosingTagline } from "@/components/gallery/empty-and-tagline"

const LIKES_STORAGE_KEY = "apexbytes-gallery-likes"

function NoticePill() {
  const [expanded, setExpanded] = useState(false)
  const pillBg = "#1E6FA8"

  return (
    <div
      className="mx-auto w-full overflow-hidden"
      style={{
        maxWidth: expanded ? "28rem" : "120px",
        borderRadius: "14px",
        border: expanded ? "1px solid rgba(30,111,168,0.2)" : "none",
        backgroundColor: expanded ? undefined : pillBg,
        boxShadow: expanded
          ? undefined
          : "0 4px 14px -4px rgba(0,0,0,0.22), 0 2px 6px -2px rgba(0,0,0,0.14)",
        transition:
          "max-width 300ms ease-in-out, box-shadow 300ms ease-in-out, background-color 300ms ease-in-out, border 300ms ease-in-out",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse notice" : "Show notice"}
        className={cn(
          "w-full flex items-center gap-2 transition-all duration-300 ease-in-out active:scale-[0.97]",
          expanded
            ? "px-5 py-3.5 justify-between bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10"
            : "pl-4 pr-5 py-2.5 justify-center"
        )}
      >
        {!expanded && (
          <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/25 shrink-0">
            <Info size={10} weight="fill" color="#fff" aria-hidden="true" />
          </span>
        )}
        {expanded && (
          <div className="w-7 h-7 rounded-[8px] bg-[#1E6FA8] flex items-center justify-center shrink-0">
            <Info size={14} weight="fill" color="#fff" aria-hidden="true" />
          </div>
        )}
        <span
          className={cn(
            "whitespace-nowrap font-black text-[0.9rem] tracking-tight transition-colors duration-300 ease-in-out",
            expanded ? "text-[#1E6FA8] flex-1 text-left" : "text-white"
          )}
        >
          {expanded ? "Notice" : "Notice"}
        </span>
        <X
          size={14}
          weight="bold"
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-opacity duration-300 ease-in-out text-zinc-400",
            expanded ? "opacity-100" : "opacity-0 w-0 h-0"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pt-1">
            <p className="abh-body text-[1rem]">
              We use high-quality sample photos to represent our services — the professional standard shown is exactly what you receive.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Hub-filter circles — "All" + one per hub, styled like Instagram Story
// avatars but with hub icons instead of photos. Solid accent ring (no
// gradient) only on the active circle; a horizontally-scrollable row. ──
function HubFilterCircles({
  activeFilter, onSelect, getAccent, isDark,
}: {
  activeFilter: HubId | "all"
  onSelect: (id: HubId | "all") => void
  getAccent: (id: HubId) => string
  isDark: boolean
}) {
  const neutralIconColor = isDark ? "#a1a1aa" : "#71717a"

  return (
    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-1 pb-1">
      <button
        onClick={() => onSelect("all")}
        aria-pressed={activeFilter === "all"}
        aria-label="All projects"
        className="shrink-0 flex flex-col items-center gap-1.5"
      >
        <span
          className="w-16 h-16 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border-2 transition-colors"
          style={{ borderColor: activeFilter === "all" ? "#1E6FA8" : "transparent" }}
        >
          <span className={cn("text-[0.8rem] font-black", activeFilter === "all" ? "text-[#1E6FA8]" : "text-zinc-500 dark:text-zinc-400")}>All</span>
        </span>
        <span className="text-[0.72rem] font-bold text-zinc-500 dark:text-zinc-400">All</span>
      </button>

      {ROW_ORDER.map((row) => {
        const isActive = activeFilter === row.id
        const accent = getAccent(row.id)
        return (
          <button
            key={row.id}
            onClick={() => onSelect(row.id)}
            aria-pressed={isActive}
            aria-label={row.label}
            className="shrink-0 flex flex-col items-center gap-1.5"
          >
            <span
              className="w-16 h-16 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border-2 transition-colors"
              style={{ borderColor: isActive ? accent : "transparent" }}
            >
              <HubIcon id={row.id} size={26} color={isActive ? accent : neutralIconColor} />
            </span>
            <span className="text-[0.72rem] font-bold text-zinc-500 dark:text-zinc-400 max-w-[64px] truncate">{row.short}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Instagram-style feed grid — 3 columns, square crop, small gaps,
// rounded corners. Desktop hover darkens the image and shows the hub tag
// + a like heart; tap/click always opens the viewer. ──
function ProjectGrid({
  projects, likedIds, onToggleLike, onSelect,
}: {
  projects: ProjectData[]
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  onSelect: (p: ProjectData) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {projects.map((p) => {
        const liked = likedIds.has(p.id)
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            aria-label={`View ${p.title}`}
            className="group relative aspect-square rounded-[10px] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
          >
            <SafeImage
              src={p.image}
              alt={p.title}
              accent="#1E6FA8"
              fill
              sizes="(max-width: 768px) 33vw, 300px"
              className="object-cover transition-transform duration-300 md:group-hover:scale-105"
            />

            <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-200 flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onToggleLike(p.id) }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); onToggleLike(p.id) } }}
                aria-label={liked ? "Unlike" : "Like"}
                aria-pressed={liked}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors"
              >
                <Heart size={18} weight={liked ? "fill" : "bold"} color={liked ? "#ef4444" : "#ffffff"} />
              </span>
              <span className="text-white text-[0.68rem] font-bold px-2.5 py-1 rounded-full bg-white/15 whitespace-nowrap">
                {p.tag}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function GalleryPageInner() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const searchParams = useSearchParams()
  const pathname      = usePathname()
  const [activeFilter,    setActiveFilter]    = useState<HubId | "all">("all")
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [zoomIndex,       setZoomIndex]       = useState<number | null>(null)
  const [searchQuery,     setSearchQuery]     = useState("")
  const [surpriseFlash,   setSurpriseFlash]   = useState(false)
  const [likedIds,        setLikedIds]        = useState<Set<string>>(new Set())
  const [showBackToTop,   setShowBackToTop]   = useState(false)
  const likesHydrated = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIKES_STORAGE_KEY)
      if (raw) setLikedIds(new Set(JSON.parse(raw)))
    } catch {}
    likesHydrated.current = true
  }, [])
  useEffect(() => {
    if (!likesHydrated.current) return
    try { localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likedIds))) } catch {}
  }, [likedIds])

  const toggleLike = useCallback((id: string) => {
    setLikedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const { closeProject, closeZoom } = useGalleryBackStack(selectedProject, setSelectedProject, zoomIndex, setZoomIndex)

  useEffect(() => {
    const projectId = searchParams.get("project")
    if (!projectId) return
    const match = PROJECTS.find(p => p.id === projectId)
    if (match) {
      setActiveFilter(match.hub as HubId)
      setSelectedProject(match)
    }
  }, [searchParams])

  useEffect(() => {
    const hubParam = searchParams.get("hub")
    if (!hubParam) return
    const isValidHub = ROW_ORDER.some(r => r.id === hubParam)
    if (isValidHub) setActiveFilter(hubParam as HubId)
  }, [searchParams])

  useEffect(() => {
    if (!selectedProject) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"; style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""; style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [selectedProject])

  const getAccent = useCallback(
    (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.accentDark : c.accentLight },
    [isDark]
  )

  const searchLower = searchQuery.trim().toLowerCase()
  const matchesSearch = useCallback((p: ProjectData) => {
    if (!searchLower) return true
    return (
      p.title.toLowerCase().includes(searchLower) ||
      p.tag.toLowerCase().includes(searchLower) ||
      p.shortDesc.toLowerCase().includes(searchLower)
    )
  }, [searchLower])

  // Single unified feed, filtered by the active circle + search — no more
  // per-hub carousels/rows.
  const visibleProjects = PROJECTS.filter(
    p => (activeFilter === "all" || p.hub === activeFilter) && matchesSearch(p)
  )

  const handleSurprise = useCallback(() => {
    if (PROJECTS.length === 0) return
    setSurpriseFlash(true)
    setTimeout(() => {
      let pool = PROJECTS
      if (selectedProject && PROJECTS.length > 1) {
        pool = PROJECTS.filter(p => p.id !== selectedProject.id)
      }
      const pick = pool[Math.floor(Math.random() * pool.length)]
      setActiveFilter(pick.hub as HubId)
      setSelectedProject(pick)
      setSurpriseFlash(false)
    }, 220)
  }, [selectedProject])

  const modalSiblings = selectedProject ? PROJECTS.filter(p => p.hub === selectedProject.hub) : []

  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        <ScrollBounce>
          <div className="text-center mb-12">
            <h1 className="abh-page-title mb-4">Our Portfolio</h1>
            <p className="abh-tagline max-w-2xl mx-auto">Real results for real clients. Select a category to explore our work in depth.</p>
            <div className="abh-divider" />
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.06}>
          <div className="flex justify-center max-w-2xl mx-auto mb-6">
            <NoticePill />
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.1}>
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-brand-blue transition-all duration-200">
              <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-zinc-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                aria-label="Search projects"
                className="min-w-0 flex-1 py-2.5 bg-transparent text-base font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all active:scale-90"
                >
                  <X size={11} weight="bold" />
                </button>
              )}

              <button
                onClick={handleSurprise}
                aria-label="Surprise me with a random project"
                className={cn(
                  "shrink-0 flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[0.82rem] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all duration-200 active:scale-95 group/surprise whitespace-nowrap",
                  surpriseFlash && "scale-90 opacity-60"
                )}
              >
                <Shuffle size={13} weight="bold" className="transition-transform duration-300 group-hover/surprise:rotate-180" aria-hidden="true" />
                Pick for me
              </button>
            </div>
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.16}>
          <div className="mb-10">
            <HubFilterCircles activeFilter={activeFilter} onSelect={setActiveFilter} getAccent={getAccent} isDark={isDark} />
          </div>
        </ScrollBounce>

        {visibleProjects.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6">
            <p className="text-base font-bold text-zinc-500 dark:text-zinc-400">
              {searchLower ? `No projects match "${searchQuery.trim()}"` : "No projects in this category yet"}
            </p>
            {searchLower && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-sm font-black underline text-brand-blue"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <ScrollBounce>
            <ProjectGrid projects={visibleProjects} likedIds={likedIds} onToggleLike={toggleLike} onSelect={setSelectedProject} />
          </ScrollBounce>
        )}

        <ScrollBounce>
          <GalleryClosingTagline />
        </ScrollBounce>
      </div>

      <ProjectViewerModal
        project={selectedProject}
        onClose={closeProject}
        zoomIndex={zoomIndex}
        setZoomIndex={setZoomIndex}
        onCloseZoom={closeZoom}
        pathname={pathname}
        siblings={modalSiblings}
        onNavigate={setSelectedProject}
        likedIds={likedIds}
        onToggleLike={toggleLike}
      />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 left-4 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
          showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <ArrowUp size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
      </button>
    </section>
  )
}

function GallerySkeleton() {
  return (
    <section className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)] pb-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
        <h1 className="abh-page-title mb-4">Our Portfolio</h1>
        <div className="abh-divider" />
      </div>
    </section>
  )
}

export function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryPageInner />
    </Suspense>
  )
            } 
