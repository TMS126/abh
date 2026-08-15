// components/floating-search-widget.tsx
"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { MagnifyingGlass, X, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

// Must match the route of your Services main page exactly — this widget
// is hidden everywhere else, including on Services with query params like
// ?hub=print (adjust the check below if you want it to persist through those).
const SERVICES_PATH = "/services"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

// Single theme-adaptive accent for the icon and result highlights.
const SEARCH_ORANGE = { light: BRAND.orange, dark: BRAND.lightOrange }

// ── Sizing ───────────────────────────────────────────────────────────
const CLOSED_SIZE = 56  // bare icon hit-area, matches the other FABs
const PILL_WIDTH = 272  // modest open width — not a full panel

interface SearchableService {
  hubId: HubId; sectionTitle: string; name: string
  price: string; description: string; requirements: string[]
}

// matchField records WHICH field actually satisfied the search query, so
// the UI can highlight that exact field instead of always assuming the
// match was in the item's name (it often isn't — e.g. a query matching
// only the section title or description previously left every result
// looking un-highlighted, even though a match clearly existed).
interface SearchResult extends SearchableService {
  matchField: "name" | "section" | "description"
}

interface SelectedService {
  name: string; price: string; hubId: HubId
  sectionTitle: string; requirements: string[]; desc?: string
}

// AUDIT FIX: item.description is typed `description?: string` in
// lib/data.ts (ServiceItem). Every item happens to have one today, but
// without this fallback, an item added later without a description would
// make s.description undefined — and s.description.toLowerCase() /
// matchSnippet(s.description, ...) below would throw at runtime the first
// time someone searched with that item in the index.
function buildSearchIndex(): SearchableService[] {
  const all: SearchableService[] = []
  HUB_ORDER.forEach((hubId) => {
    HUBS[hubId].sections.forEach((section) => {
      section.items.forEach((item) => {
        all.push({
          hubId, sectionTitle: section.title,
          name: item.name, price: item.price,
          description: item.description ?? "",
          requirements: item.requirements,
        })
      })
    })
  })
  return all
}

function HubIcon({ id, size = 16, color }: { id: HubId; size?: number; color?: string }) {
  const p = { size, weight: "fill" as const, color: color ?? "currentColor", "aria-hidden": true }
  switch (id) {
    case "print":    return <Printer    {...p} />
    case "doc":      return <FileText   {...p} />
    case "design":   return <PaintBrush {...p} />
    case "eservice": return <Globe      {...p} />
    case "tech":     return <Desktop    {...p} />
  }
}

// Highlights the matched substring of `text` in the widget's single
// accent color and bold weight, so as the person types they can see
// exactly which part of a result is matching.
function HighlightMatch({ text, query, color }: { text: string; query: string; color: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color, fontWeight: 900 }}>{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  )
}

// Short highlighted snippet of context around a match inside a longer
// field (used for description matches, where showing the whole
// description would be too long for the result row).
function matchSnippet(text: string, query: string, radius = 28): string {
  const q = query.trim().toLowerCase()
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return text.slice(0, radius * 2)
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + q.length + radius)
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`
}

/**
 * Sends the chosen service to the Services page. The page listens for this
 * on `window` and opens its existing ServiceDetailModal — this keeps the
 * widget fully decoupled from page state now that it lives in the root
 * layout rather than inside the page tree.
 */
function dispatchSelectService(svc: SelectedService) {
  window.dispatchEvent(new CustomEvent<SelectedService>("abh:selectService", { detail: svc }))
}

export function FloatingSearchWidget() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === "dark"

  useEffect(() => { setMounted(true) }, [])

  const [isOpen, setIsOpen, isOtherOpen] = useExclusiveWidget("search")
  const [query, setQuery]         = useState("")
  const [pastTrigger, setPastTrigger] = useState(false)

  const inputRef     = useRef<HTMLInputElement>(null)
  const pushedRef    = useRef(false)
  const index        = useMemo(buildSearchIndex, [])

  const accentColor = isDark ? SEARCH_ORANGE.dark : SEARCH_ORANGE.light
  // Same drop-shadow glow the original icon had — theme-adaptive since
  // it's built from accentColor.
  const iconGlow = `drop-shadow(0 4px 10px ${accentColor}80) drop-shadow(0 2px 4px rgba(0,0,0,0.3))`

  const onServicesPage = pathname === SERVICES_PATH
  const hasQuery = query.trim().length > 0

  // Base visibility mirrors the inline search bar's scroll position on the
  // Services page — that bar carries id="abh-inline-search". This widget
  // stays visible continuously once past the trigger point, and only
  // hides again if the inline search bar scrolls back into view (or
  // another widget opens, via useExclusiveWidget).
  useEffect(() => {
    if (!onServicesPage) { setPastTrigger(false); return }
    const check = () => {
      const el = document.getElementById("abh-inline-search")
      if (!el) { setPastTrigger(false); return }
      setPastTrigger(el.getBoundingClientRect().bottom < 0)
    }
    check()
    window.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check)
    return () => {
      window.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [onServicesPage])

  // Force-close if the route changes away from Services (no back-nav side effect)
  useEffect(() => {
    if (!onServicesPage && isOpen) {
      pushedRef.current = false
      setIsOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onServicesPage])

  // Back-button handling, scoped only to this widget's own open state —
  // pushes one history entry on open, and any close path (outside click,
  // Escape, picking a result) collapses it again.
  //
  // NOTE: no auto-focus here. The input is left unfocused on open so
  // mobile browsers don't pop the keyboard the instant the pill grows —
  // tapping the icon (1st tap) grows the pill, tapping the input itself
  // (2nd tap) focuses it and brings up the keyboard, via the input's own
  // native click-to-focus behavior.
  useEffect(() => {
    if (isOpen && !pushedRef.current) {
      window.history.pushState({ abhSearch: true }, "")
      pushedRef.current = true
    }
  }, [isOpen])

  useEffect(() => {
    const onPop = () => {
      if (!pushedRef.current) return
      pushedRef.current = false
      setIsOpen(false)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [setIsOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => setQuery(""), 200)
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    }
  }, [setIsOpen])

  const handleOpen = useCallback(() => {
    if (!isOpen) setIsOpen(true)
  }, [isOpen, setIsOpen])

  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [isOpen, handleClose])

  // Determines WHICH field matched, per result, so the render can
  // highlight that exact field instead of assuming it was always the name.
  const results = useMemo((): SearchResult[] => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const matches: SearchResult[] = []
    for (const s of index) {
      let matchField: SearchResult["matchField"] | null = null
      if (s.name.toLowerCase().includes(q)) matchField = "name"
      else if (s.sectionTitle.toLowerCase().includes(q)) matchField = "section"
      else if (s.description.toLowerCase().includes(q)) matchField = "description"
      if (matchField) matches.push({ ...s, matchField })
      if (matches.length >= 8) break
    }
    return matches
  }, [query, index])

  // Picking a result opens ServiceDetailModal on the page, which pushes
  // its own history entry on top of ours. We deliberately do NOT call
  // history.back() here — that would pop the modal's entry instead of
  // ours. We just drop our claim on the entry; the next real back-button
  // press absorbs it harmlessly (our popstate listener checks pushedRef
  // first and no-ops once it's already false).
  const pick = (s: SearchableService) => {
    dispatchSelectService({
      name: s.name, price: s.price, hubId: s.hubId,
      sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description,
    })
    setIsOpen(false)
    setQuery("")
    pushedRef.current = false
  }

  if (!onServicesPage) return null

  return (
    <>
      {/* Invisible outside-click catcher — no visual dimming, this is a
          small popover now, not a full-screen modal. */}
      {isOpen && (
        <div className="fixed inset-0 z-[9989]" onClick={handleClose} aria-hidden="true" />
      )}

      <div
        className={cn(
          "fixed z-[9993] right-4 md:right-6 transition-all duration-200 ease-out motion-reduce:transition-none transform-gpu",
          pastTrigger && !isOtherOpen
            ? "bottom-[9.5rem] opacity-100 scale-100 pointer-events-auto"
            : "bottom-[9.5rem] opacity-0 scale-90 pointer-events-none"
        )}
      >
        {/* ── The pill ─────────────────────────────────────────────────
            Right-anchored, so animating `width` alone makes it grow
            leftward. Bare icon at rest (no visible background — "icon
            only before touch"); on hover/click the background/border/
            shadow fade in and the box widens into the exact plain pill
            from the reference screenshot, with the icon sliding to the
            left edge as the flex layout reflows. */}
        <div
          onMouseEnter={handleOpen}
          className="relative flex items-center rounded-full overflow-hidden transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: isOpen ? PILL_WIDTH : CLOSED_SIZE, height: CLOSED_SIZE }}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-lg transition-opacity duration-300 ease-out motion-reduce:transition-none",
              isOpen ? "opacity-100" : "opacity-0"
            )}
            aria-hidden="true"
          />

          <button
            onClick={handleOpen}
            aria-label="Search services"
            className="relative z-10 w-14 h-14 shrink-0 flex items-center justify-center active:scale-90 hover:scale-110 transition-transform duration-150 ease-out motion-reduce:transition-none"
          >
            <MagnifyingGlass
              size={22}
              weight="bold"
              aria-hidden="true"
              style={{ color: accentColor, filter: iconGlow }}
            />
          </button>

          <div
            className={cn(
              "relative z-10 flex-1 min-w-0 flex items-center gap-2 pr-4 transition-opacity duration-200 ease-out motion-reduce:transition-none",
              isOpen ? "opacity-100 delay-150" : "opacity-0 pointer-events-none"
            )}
          >
            <label htmlFor="floating-search-input" className="sr-only">Search a service</label>
            <input
              id="floating-search-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a service..."
              className="flex-1 bg-transparent text-sm font-medium text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400/70 dark:placeholder:text-zinc-500/70 min-w-0 outline-none border-none appearance-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-700 transition-colors duration-150"
                aria-label="Clear search"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* ── Results dropdown ─────────────────────────────────────────
            Sits just below the pill, sized to its content — no fixed
            height, grows only as tall as the result list needs (capped
            with a max-height + scroll as a safety net). */}
        {isOpen && hasQuery && (
          <div
            className="absolute top-[calc(100%+8px)] right-0 rounded-[16px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ease-out motion-reduce:animate-none"
            style={{ width: PILL_WIDTH }}
          >
            <div className="max-h-[280px] overflow-y-auto p-2">
              {results.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-white/10">
                  {results.map((s, idx) => (
                    <button
                      key={`${s.hubId}-${s.name}-${idx}`}
                      onClick={() => pick(s)}
                      className="w-full flex items-center gap-3 py-2.5 px-1 text-left hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-colors duration-150"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}1f`, color: accentColor }}
                      >
                        <HubIcon id={s.hubId} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">
                          {s.matchField === "name"
                            ? <HighlightMatch text={s.name} query={query} color={accentColor} />
                            : s.name}
                        </p>
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">
                          {s.matchField === "section"
                            ? <HighlightMatch text={s.sectionTitle} query={query} color={accentColor} />
                            : s.sectionTitle} · {HUBS[s.hubId].title}
                        </p>
                        {s.matchField === "description" && (
                          <p className="text-[0.64rem] font-medium text-zinc-400 dark:text-zinc-500 truncate mt-0.5 normal-case">
                            <HighlightMatch text={matchSnippet(s.description, query)} query={query} color={accentColor} />
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-black shrink-0" style={{ color: accentColor }}>{s.price}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No services found</p>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
        } 
