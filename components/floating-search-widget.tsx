"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { MagnifyingGlass, X, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BRAND } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

// Must match the route of your Services main page exactly — this widget
// is hidden everywhere else, including on Services with query params like
// ?hub=print (adjust the check below if you want it to persist through those).
const SERVICES_PATH = "/services"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

// Gallery's dedicated orange pair — same light/dark values as the Navbar's
// "/gallery" entry and PageEdgeGlow's "/gallery" entry, so this widget's
// color matches that identity exactly in both themes instead of a single
// flat hex that only worked in one theme.
const SEARCH_ORANGE = { light: BRAND.orange, dark: BRAND.lightOrange }

// Picks white or near-black based on actual WCAG relative luminance of
// the given background hex, rather than assuming "white always works."
// BRAND.lightOrange (#F9D1B0) is a pale peach — white text/icons on it
// fail contrast badly, which is exactly the bug this fixes. Same helper
// pattern already used in Navbar/AboutPage for the same reason.
function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const contrastWhite = 1.05 / (luminance + 0.05)
  const contrastDark  = (luminance + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#18181b"
}

// ── Distinct glass tokens — heavier blur/saturation and a warm orange
// wash, so this panel reads as its own "search" identity rather than
// reusing the neutral glass from the Quote Calculator / WhatsApp panels. ──
const GLASS = {
  panel: "bg-white/55 dark:bg-zinc-900/45 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 dark:border-white/10",
  item:  "bg-white/85 dark:bg-white/[0.07] border border-white/70 dark:border-white/10",
} as const

// Compact height fits roughly one result row before typing starts; once
// there's a query, the viewport eases open to the fixed "expanded" height
// so the panel doesn't keep resizing as the match count changes.
const RESULTS_HEIGHT_COMPACT  = "76px"
const RESULTS_HEIGHT_EXPANDED = "360px"

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

function buildSearchIndex(): SearchableService[] {
  const all: SearchableService[] = []
  HUB_ORDER.forEach((hubId) => {
    HUBS[hubId].sections.forEach((section) => {
      section.items.forEach((item) => {
        all.push({
          hubId, sectionTitle: section.title,
          name: item.name, price: item.price,
          description: item.description,
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

// Highlights the matched substring of `text` in the hub's own accent
// color and bold weight, so as the person types they can see exactly
// which part of a result is matching.
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
  // FAB icon/X color — computed from accentColor's actual luminance
  // rather than assumed white, so it stays readable in both themes even
  // though accentColor swaps between a dark orange (light mode) and a
  // pale peach (dark mode).
  const fabIconColor = useMemo(() => getReadableTextColor(accentColor), [accentColor])

  const onServicesPage = pathname === SERVICES_PATH
  const hasQuery = query.trim().length > 0

  // Base visibility mirrors the inline search bar's scroll position on the
  // Services page — that bar carries id="abh-inline-search". Unlike the
  // Quote Calculator and WhatsApp FABs, this widget does NOT flicker while
  // actively scrolling — it stays visible continuously once past the
  // trigger point, and only hides again if the inline search bar scrolls
  // back into view (or another widget opens, via useExclusiveWidget).
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

  // Body scroll lock while open — same as WhatsApp panel
  useEffect(() => {
    if (!isOpen) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"; style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""
      style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Back-button / history handling, scoped only to this widget's own open
  // state — pushes one history entry on open, and any close path (backdrop,
  // X, Escape, picking a result) collapses it again. Doesn't touch anything
  // else on the page.
  useEffect(() => {
    if (isOpen) {
      if (!pushedRef.current) {
        window.history.pushState({ abhSearch: true }, "")
        pushedRef.current = true
      }
      setTimeout(() => inputRef.current?.focus(), 200)
    }
    // NOTE: no `else` branch here anymore. Cleanup of the pushed history
    // entry now happens explicitly at each close site instead (see
    // handleClose / pick below) — calling history.back() unconditionally
    // here raced with ServicesPage's own modal history stack: picking a
    // result pushes a NEW entry for the modal, and this effect would then
    // pop THAT entry instead of ours, instantly closing the modal.
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

  // Manual close (backdrop click / X button / Escape / FAB toggle). Nothing
  // else has been pushed to history since we opened, so it's safe to pop
  // our own entry here.
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => setQuery(""), 300)
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    }
  }, [setIsOpen])

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
      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/30 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ── FAB ──────────────────────────────────────────────────────────
          Closed: floats in its own slot above the trigger point, third in
          the stack. Open: reattaches to sit exactly at the bottom-right
          corner of the panel below it (same bottom/right offsets as the
          panel), so it reads as the panel's own handle rather than a
          separate control hovering over the results — and doubles as the
          close button, swapping to an X like the other widgets. */}
      <div
        className={cn(
          "fixed z-[9993] right-4 md:right-6 group/search transition-all duration-200 ease-out motion-reduce:transition-none transform-gpu",
          isOpen
            ? "bottom-24 opacity-100 scale-100 pointer-events-auto"
            : pastTrigger && !isOtherOpen
              ? "bottom-[9.5rem] opacity-100 scale-100 pointer-events-auto"
              : "bottom-[9.5rem] opacity-0 scale-90 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-end gap-2">
          {/* Slide-out label — only ever shown while closed */}
          <span
            className={cn(
              "text-[0.65rem] font-black uppercase tracking-widest whitespace-nowrap pointer-events-none",
              "bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800",
              "transition-all duration-200 ease-out origin-right motion-reduce:transition-none transform-gpu",
              isOpen
                ? "opacity-0 scale-x-0"
                : "opacity-0 scale-x-0 group-hover/search:opacity-100 group-hover/search:scale-x-100"
            )}
            style={{ color: accentColor }}
          >
            Search
          </span>

          <button
            onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
            className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-transform duration-150 ease-out motion-reduce:transition-none transform-gpu"
            style={{ backgroundColor: accentColor, color: fabIconColor }}
            aria-label={isOpen ? "Close search" : "Search services"}
          >
            {isOpen ? <X size={22} weight="bold" /> : <MagnifyingGlass size={24} weight="bold" />}
          </button>
        </div>
      </div>

      {/* ── Panel ────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] rounded-[18px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200 ease-out motion-reduce:animate-none transform-gpu",
            GLASS.panel
          )}
          style={{
            boxShadow: `0 10px 40px ${accentColor}2e, 0 8px 28px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.35)`,
          }}
        >
          {/* Warm tinted wash — gives this panel its own distinct glass
              identity rather than reusing the neutral glass elsewhere. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(160deg, ${accentColor}14 0%, transparent 55%)` }}
            aria-hidden="true"
          />
          {/* Specular highlight strip */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

          {/* Header */}
          <div
            className="relative flex items-center justify-between px-5 py-4 shrink-0 border-b border-white/20 dark:border-white/10"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)" }}
          >
            <h3 className="font-sans font-black text-lg" style={{ color: accentColor }}>Search Services</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-[14px] shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150 bg-zinc-100/70 dark:bg-white/[0.07]"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Search input — simple premium pill: soft glass field, icon
              inline, no default-looking underline/border. */}
          <div className="relative px-5 pt-4 pb-2 shrink-0">
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-full px-4 py-2.5 transition-shadow duration-200 ease-out motion-reduce:transition-none",
                "bg-white/75 dark:bg-white/10 border border-white/70 dark:border-white/10 shadow-sm focus-within:shadow-md"
              )}
            >
              <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-zinc-400 dark:text-zinc-500" />
              <input
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
                  className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors duration-150"
                  aria-label="Clear search"
                >
                  <X size={11} weight="bold" />
                </button>
              )}
            </div>
          </div>

          {/* Results — compact by default (room for ~1 row), eases open
              to a fixed expanded height once the user starts typing so
              the panel doesn't keep resizing as the match count changes. */}
          <div
            className="relative overflow-y-auto px-5 pb-5 pt-2 transition-[height] duration-200 ease-out motion-reduce:transition-none"
            style={{ height: hasQuery ? RESULTS_HEIGHT_EXPANDED : RESULTS_HEIGHT_COMPACT }}
          >
            {!hasQuery ? null : results.length > 0 ? (
              <div className="space-y-1.5">
                {results.map((s, idx) => {
                  const colors = HUB_COLORS[s.hubId as HubKey]
                  const accent = isDark ? colors.tagTextDark : colors.tagText
                  return (
                    <button
                      key={`${s.hubId}-${s.name}-${idx}`}
                      onClick={() => pick(s)}
                      style={{ animationDelay: `${idx * 30}ms`, animationFillMode: "backwards" }}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-[14px] shadow-sm transition-colors duration-150 text-left hover:bg-white/50 dark:hover:bg-white/10 animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none",
                        GLASS.item
                      )}
                    >
                      <div className="w-9 h-9 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${accent}20`, color: accent }}>
                        <HubIcon id={s.hubId} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">
                          {s.matchField === "name"
                            ? <HighlightMatch text={s.name} query={query} color={accent} />
                            : s.name}
                        </p>
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">
                          {s.matchField === "section"
                            ? <HighlightMatch text={s.sectionTitle} query={query} color={accent} />
                            : s.sectionTitle} · {HUBS[s.hubId].title}
                        </p>
                        {s.matchField === "description" && (
                          <p className="text-[0.64rem] font-medium text-zinc-400 dark:text-zinc-500 truncate mt-0.5 normal-case">
                            <HighlightMatch text={matchSnippet(s.description, query)} query={query} color={accent} />
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-black shrink-0" style={{ color: accent }}>{s.price}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div key="empty" className="text-center py-8 animate-in fade-in duration-200 motion-reduce:animate-none">
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No services found</p>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word or WhatsApp us directly.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
      } 
