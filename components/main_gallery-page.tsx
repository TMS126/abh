"use client"

import { useCallback, useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { X, Info, MagnifyingGlass, Shuffle, ArrowUp } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { PROJECTS, ProjectData } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"
import { ROW_ORDER, HubId } from "@/lib/gallery-helpers"
import { useGalleryBackStack } from "@/hooks/use-gallery-back-stack"
import { ProjectViewerModal } from "@/components/gallery/project-viewer-modal"
import { ProjectCarousel } from "@/components/gallery/project-carousel"
import { ProjectsPopover } from "@/components/gallery/projects-popover"
import { FilterDropdown } from "@/components/gallery/filter-dropdown"
import { EmptyHubState, GalleryClosingTagline } from "@/components/gallery/empty-and-tagline"

const LIKES_STORAGE_KEY = "apexbytes-gallery-likes"

function GalleryPageInner() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const searchParams = useSearchParams()
  const pathname      = usePathname()
  const [activeFilter,    setActiveFilter]    = useState<HubId | "all">("all")
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [zoomIndex,       setZoomIndex]       = useState<number | null>(null)
  const [searchQuery,     setSearchQuery]     = useState("")
  const [searchFocused,   setSearchFocused]   = useState(false)
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
    const url = selectedProject ? `${pathname}?project=${selectedProject.id}` : pathname
    window.history.replaceState(window.history.state, "", url)
  }, [selectedProject, pathname])

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
    (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.tagTextDark : c.tagText },
    [isDark]
  )
  const filteredRows = activeFilter === "all" ? ROW_ORDER : ROW_ORDER.filter(r => r.id === activeFilter)

  const searchLower = searchQuery.trim().toLowerCase()
  const matchesSearch = useCallback((p: ProjectData) => {
    if (!searchLower) return true
    return (
      p.title.toLowerCase().includes(searchLower) ||
      p.tag.toLowerCase().includes(searchLower) ||
      p.shortDesc.toLowerCase().includes(searchLower)
    )
  }, [searchLower])

  const totalMatches = PROJECTS.filter(
    p => (activeFilter === "all" || p.hub === activeFilter) && matchesSearch(p)
  ).length

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
          <div
            className={cn(
              "flex items-stretch max-w-md mx-auto mb-6 rounded-[14px] overflow-hidden",
              "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800",
              "shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]",
              "transition-colors duration-200 focus-within:border-[#1E6FA8]"
            )}
          >
            <div className="relative flex-1 basis-1/2">
              <MagnifyingGlass
                size={16}
                weight="bold"
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={searchFocused ? "Search" : "Search Project"}
                className="w-full pl-10 pr-9 py-3.5 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none text-left"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all active:scale-90"
                >
                  <X size={11} weight="bold" />
                </button>
              )}
            </div>
            <div className="w-px my-2 bg-zinc-200 dark:bg-zinc-800" />
            <button
              onClick={handleSurprise}
              aria-label="Surprise me with a random project"
              className={cn(
                "flex-1 basis-1/2 flex items-center justify-center gap-1.5 px-3.5 py-3.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap transition-all duration-200 active:scale-95 group/surprise hover:bg-zinc-50 dark:hover:bg-zinc-900",
                surpriseFlash && "scale-90 opacity-60"
              )}
            >
              <Shuffle size={14} weight="bold" className="transition-transform duration-300 group-hover/surprise:rotate-180 text-zinc-400" />
              Pick a project
            </button>
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.1}>
          <FilterDropdown activeFilter={activeFilter} onSelect={setActiveFilter} getAccent={getAccent} />
        </ScrollBounce>

        <ScrollBounce delay={0.14}>
          <div className="max-w-2xl mx-auto mb-16 rounded-[14px] border border-[#1E6FA8]/20 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-5 py-4 flex items-start gap-3">
            <div className="w-12 h-12 shrink-0 rounded-[14px] bg-[#1E6FA8] flex items-center justify-center">
              <Info size={26} weight="fill" color="#fff" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-snug">
                We use high-quality sample photos to represent our services, ensuring the professional standard shown is exactly what you receive.
              </p>
            </div>
          </div>
        </ScrollBounce>

        {searchLower && totalMatches === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6">
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
              No projects match &ldquo;{searchQuery.trim()}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-black underline text-brand-blue"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRows.map((row, rowIndex) => {
              const accent = getAccent(row.id)
              const projects = PROJECTS.filter(p => p.hub === row.id && matchesSearch(p))

              if (projects.length === 0) {
                if (activeFilter !== row.id) return null
                return (
                  <ScrollBounce key={row.id} delay={rowIndex * 0.06}>
                    <div className="rounded-[20px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 shadow-sm transition-shadow duration-300 ease-out p-5 md:p-7">
                      <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: "#1E6FA8" }} />
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2>
                      </div>
                      <EmptyHubState label={row.label} query={searchLower ? searchQuery.trim() : undefined} />
                    </div>
                  </ScrollBounce>
                )
              }

              return (
                <ScrollBounce key={row.id} delay={rowIndex * 0.06}>
                  <div className="rounded-[20px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 shadow-sm p-5 md:p-7">
                    <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                      <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: "#1E6FA8" }} />
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{row.label}</h2>
                      <ProjectsPopover projects={projects} accent={accent} isDark={isDark} onSelect={setSelectedProject} />
                    </div>
                    <ProjectCarousel projects={projects} accent={accent} onSelect={setSelectedProject} likedIds={likedIds} onToggleLike={toggleLike} />
                  </div>
                </ScrollBounce>
              )
            })}
          </div>
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
