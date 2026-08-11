// components/gallery/gallery-page.tsx
"use client"

import { useCallback, useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { X, Info, MagnifyingGlass, Shuffle } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BRAND, HUB_COLORS, HubKey } from "@/lib/brand"
import { PROJECTS, ProjectData } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"
import { ROW_ORDER, HubId, hubLabelFor, CLIENT_TYPE_LABEL } from "@/lib/gallery-helpers"
import { useGalleryBackStack } from "@/hooks/use-gallery-back-stack"
import { ProjectViewerModal } from "@/components/gallery/project-viewer-modal"
import { SafeImage } from "@/components/gallery/safe-image"
import { LikeButton, ShareButton } from "@/components/gallery/like-share-buttons"
import { HubIcon } from "@/components/services-page/shared"
import { GalleryClosingTagline } from "@/components/gallery/empty-and-tagline"
import { NoticePill } from "@/components/notice-pill"
import { BackToTopButton, useBackToTop } from "@/components/back-to-top-button"

const LIKES_STORAGE_KEY = "apexbytes-gallery-likes"

// ── Hub-filter circles ──
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
    <div className="flex items-center justify-center flex-wrap gap-4 overflow-x-auto no-scrollbar px-1 pb-1">
      <button
        onClick={() => onSelect("all")}
        aria-pressed={activeFilter === "all"}
        aria-label="All projects"
        className="group shrink-0 flex flex-col items-center gap-1.5"
      >
        <span
          className="relative w-16 h-16 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border-2 transition-colors overflow-hidden"
          style={{ borderColor: activeFilter === "all" ? BRAND.blue : "transparent" }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
            style={{ backgroundColor: `${BRAND.blue}30` }}
          />
          <span className={cn("relative text-[0.8rem] font-black", activeFilter === "all" ? "text-brand-blue" : "text-zinc-500 dark:text-zinc-400")}>All</span>
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
            className="group shrink-0 flex flex-col items-center gap-1.5"
          >
            <span
              className="relative w-16 h-16 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border-2 transition-colors overflow-hidden"
              style={{ borderColor: isActive ? accent : "transparent" }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"
                style={{ backgroundColor: `${accent}30` }}
              />
              <span className="relative">
                <HubIcon id={row.id} size={26} color={isActive ? accent : neutralIconColor} />
              </span>
            </span>
            <span className="text-[0.72rem] font-bold text-zinc-500 dark:text-zinc-400 max-w-[64px] truncate">{row.short}</span>
          </button>
        )
      })}
    </div>
  )
}

function ProjectGrid({
  projects, likedIds, onToggleLike, onSelect, pathname,
}: {
  projects: ProjectData[]
  likedIds: Set<string>
  onToggleLike: (id: string) => void
  onSelect: (p: ProjectData) => void
  pathname: string
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
      {projects.map((p) => {
        const liked = likedIds.has(p.id)
        const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${pathname}?project=${p.id}` : `${pathname}?project=${p.id}`
        return (
          <div key={p.id} className="flex flex-col">
            <button
              onClick={() => onSelect(p)}
              aria-label={`View ${p.title}`}
              className="group relative aspect-square rounded-[10px] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
            >
              <SafeImage
                src={p.image}
                alt={p.title}
                accent={BRAND.blue}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-[0.68rem] font-black text-white backdrop-blur-md whitespace-nowrap"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              >
                {hubLabelFor(p.hub)}
              </span>
            </button>

            <div className="flex items-start justify-between gap-2 mt-2 px-0.5">
              <button onClick={() => onSelect(p)} className="flex items-center gap-1.5 min-w-0 text-left">
                <HubIcon id={p.hub as HubId} size={14} color={BRAND.blue} />
                <span className="min-w-0">
                  <span className="block text-[0.8rem] font-black text-zinc-800 dark:text-zinc-100 truncate">{p.title}</span>
                  {p.clientType && (
                    <span className="block text-[0.68rem] font-medium text-zinc-400 dark:text-zinc-500 truncate">{CLIENT_TYPE_LABEL[p.clientType]}</span>
                  )}
                </span>
              </button>
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <ShareButton url={shareUrl} title={p.title} />
                <LikeButton liked={liked} onToggle={(e) => { e.stopPropagation(); onToggleLike(p.id) }} context="card" />
              </div>
            </div>
          </div>
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
  const showBackToTop = useBackToTop()
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
            {/* FIX: was a hardcoded #1E6FA8 duplicate of NoticeNotification
                from services-page — now the shared component with an
                explicit expanded label (previously stuck on "Notice" in
                both states). */}
            <NoticePill
              accentColor={BRAND.blue}
              Icon={Info}
              collapsedLabel="Notice"
              expandedLabel="A Note on Our Photos"
              isDark={isDark}
            >
              We use high-quality sample photos to represent our services — the professional standard shown is exactly what you receive.
            </NoticePill>
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
            <div className="max-w-6xl mx-auto">
              <ProjectGrid projects={visibleProjects} likedIds={likedIds} onToggleLike={toggleLike} onSelect={setSelectedProject} pathname={pathname} />
            </div>
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

      <BackToTopButton visible={showBackToTop} />
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
