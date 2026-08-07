// components/gallery/gallery-page.tsx
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

// ===== NOTICE PILL — motion now matches Services page's NoticeNotification
// exactly: max-width morph on the collapsed pill + grid-rows expand for the
// detail card, instead of the old fade+slide-in treatment. =====
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

  // ── Jumps the open viewer modal to a different hub entirely, keeping the
  // modal open — used by the in-viewer hub filter row. ──
  const handleViewerHubSwitch = useCallback((hubId: HubId) => {
    setActiveFilter(hubId)
    const pool = PROJECTS.filter(p => p.hub === hubId && matchesSearch(p))
    if (pool.length > 0) setSelectedProject(pool[0])
  }, [matchesSearch])

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

        {/* ── Search + Shuffle — one unified pill. The search field uses
            the Contact page's input treatment; Shuffle is a true pill
            button nested flush inside the container's right edge, sized
            to sit cleanly inside without clipping or overlapping the
            outer border. ── */}
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
        rowOrder={ROW_ORDER}
        getAccent={getAccent}
        onSelectHub={handleViewerHubSwitch}
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
