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
import { HubCollectionsGrid } from "@/components/gallery/hub-collections-grid"
import { EmptyHubState, GalleryClosingTagline } from "@/components/gallery/empty-and-tagline"

const LIKES_STORAGE_KEY = "apexbytes-gallery-likes"

function NoticePill() {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        aria-label="Show notice"
        style={{
          backgroundColor: "#1E6FA8",
          boxShadow: "0 10px 28px -8px #1E6FA870, 0 4px 12px -2px rgba(0,0,0,0.25)",
        }}
        className="relative flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full text-white font-black text-[0.94rem] tracking-tight transition-transform active:scale-95 hover:-translate-y-0.5"
      >
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-950 border-2 border-white dark:border-zinc-950 flex items-center justify-center shadow-md">
          <Info size={10} weight="fill" color="#1E6FA8" />
        </span>
        Notice
      </button>
    )
  }

  return (
    <div className="relative w-full max-w-md rounded-[14px] border border-[#1E6FA8]/20 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={() => setExpanded(false)}
        aria-label="Collapse notice"
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/70 dark:bg-black/30 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <X size={12} weight="bold" />
      </button>
      <div className="w-9 h-9 rounded-[10px] bg-[#1E6FA8] flex items-center justify-center shrink-0">
        <Info size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5 pr-6">
        <span className="abh-eyebrow text-[#1E6FA8] block mb-1">Notice</span>
        <p className="abh-body text-[1rem]">
          We use high-quality sample photos to represent our services — the professional standard shown is exactly what you receive.
        </p>
      </div>
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

  const showCollectionsGrid = activeFilter === "all" && !searchLower

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

        {/* ── Notice now sits ABOVE search + hub selector (moved from
            below search per request) ── */}
        <ScrollBounce delay={0.06}>
          <div className="flex justify-center max-w-2xl mx-auto mb-6">
            <NoticePill />
          </div>
        </ScrollBounce>

        {/* ── Search + Shuffle ── */}
        <ScrollBounce delay={0.1}>
          <div className="max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center gap-3 border-b-2 border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors duration-200">
              <div className="flex items-center gap-1 py-3 min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  aria-label="Search projects"
                  size={searchQuery ? Math.max(searchQuery.length, 7) : 7}
                  className="bg-transparent text-base font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none text-right"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all active:scale-90"
                  >
                    <X size={11} weight="bold" />
                  </button>
                )}
                <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-zinc-400" aria-hidden="true" />
              </div>

              <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 shrink-0" aria-hidden="true" />

              <button
                onClick={handleSurprise}
                aria-label="Surprise me with a random project"
                className={cn(
                  "shrink-0 flex items-center gap-1.5 py-3 text-base font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-all duration-200 active:scale-95 group/surprise",
                  surpriseFlash && "scale-90 opacity-60"
                )}
              >
                <Shuffle size={14} weight="bold" className="transition-transform duration-300 group-hover/surprise:rotate-180" aria-hidden="true" />
                Pick for me
              </button>
            </div>
          </div>
        </ScrollBounce>

        <div className="relative z-50">
          <ScrollBounce delay={0.16}>
            <FilterDropdown activeFilter={activeFilter} onSelect={setActiveFilter} getAccent={getAccent} />
          </ScrollBounce>
        </div>

        {searchLower && totalMatches === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6">
            <p className="text-base font-bold text-zinc-500 dark:text-zinc-400">
              No projects match &ldquo;{searchQuery.trim()}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-sm font-black underline text-brand-blue"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {showCollectionsGrid && (
              <ScrollBounce>
                <div className="mb-8">
                  <HubCollectionsGrid
                    isDark={isDark}
                    onSelectHub={setActiveFilter}
                    likedIds={likedIds}
                    onToggleLike={toggleLike}
                    onOpenProject={setSelectedProject}
                  />
                </div>
              </ScrollBounce>
            )}

            <div className={showCollectionsGrid ? "md:hidden" : ""}>
              {filteredRows.map((row, rowIndex) => {
                const accent = getAccent(row.id)
                const projects = PROJECTS.filter(p => p.hub === row.id && matchesSearch(p))

                if (projects.length === 0) {
                  if (activeFilter !== row.id) return null
                  return (
                    <ScrollBounce key={row.id} delay={rowIndex * 0.06}>
                      <div className={cn(
                        "md:rounded-[20px] md:bg-white dark:md:bg-zinc-950/40 md:shadow-md p-0 md:p-7",
                        "border-t-2 border-zinc-100 dark:border-zinc-800 mt-10 pt-8 md:border-t-0 md:mt-0 md:pt-7",
                        "first:border-t-0 first:mt-0 first:pt-0 md:first:pt-7"
                      )}>
                        {/* ---- Hub title bar: accent line now matches
                            this hub's own brand color, not a fixed blue ---- */}
                        <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                          <div className="w-1.5 h-8 rounded-full hidden md:block shrink-0" style={{ backgroundColor: accent }} />
                          <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 hidden md:block">{row.label}</h2>
                        </div>
                        <EmptyHubState label={row.label} query={searchLower ? searchQuery.trim() : undefined} />
                      </div>
                    </ScrollBounce>
                  )
                }

                return (
                  <ScrollBounce key={row.id} delay={rowIndex * 0.06}>
                    <div className={cn(
                      "md:rounded-[20px] md:bg-white dark:md:bg-zinc-950/40 md:shadow-md p-0 md:p-7",
                      "border-t-2 border-zinc-100 dark:border-zinc-800 mt-10 pt-8 md:border-t-0 md:mt-0 md:pt-7",
                      "first:border-t-0 first:mt-0 first:pt-0 md:first:pt-7"
                    )}>
                      {/* ---- Hub title bar: accent line now matches
                          this hub's own brand color, not a fixed blue.
                          Stays confined to this header row (its own
                          mb-6 spacing) so it never touches the carousel
                          card rendered below it. ---- */}
                      <div className="flex items-center gap-4 mb-6 px-4 md:px-6">
                        <div className="w-1.5 h-8 rounded-full hidden md:block shrink-0" style={{ backgroundColor: accent }} />
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 hidden md:block">{row.label}</h2>
                        <div className="hidden md:block md:ml-auto">
                          <ProjectsPopover projects={projects} accent={accent} isDark={isDark} onSelect={setSelectedProject} />
                        </div>
                      </div>
                      <div className="px-4 md:px-0">
                        <ProjectCarousel projects={projects} accent={accent} onSelect={setSelectedProject} likedIds={likedIds} onToggleLike={toggleLike} />
                      </div>
                    </div>
                  </ScrollBounce>
                )
              })}
            </div>
          </>
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
