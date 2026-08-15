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

// Single theme-adaptive accent — the whole widget (icon, ring, highlights,
// prices) now uses only this orange pair instead of per-hub colors, per
// the simplified single-accent design.
const SEARCH_ORANGE = { light: BRAND.orange, dark: BRAND.lightOrange }

// ── Idle pill sizing ─────────────────────────────────────────────────
// "130%" of a normal ~44px/220px search bar. Bump these if you want the
// pill bigger/smaller — every animation offset below is derived from them.
const IDLE_HEIGHT = 44
const IDLE_WIDTH = 220
const ICON_SIZE = 20
const ICON_DOCKED_LEFT = 20 // resting (left) position of the icon, in px
// Distance the icon travels from its docked-left spot to dead-center of
// the idle pill — this is what "moves left from its current position"
// animates between.
const ICON_CENTER_OFFSET = IDLE_WIDTH / 2 - ICON_DOCKED_LEFT - ICON_SIZE / 2
// How long the "ApexbytesHub" wording stays visible / hidden per loop.
const LABEL_CYCLE_MS = 2200

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

  // Idle-pill "ApexbytesHub" wording loop. true = label visible / icon
  // docked left. false = label hidden / icon centered. Only runs while
  // the pill is closed — the panel takes over once open.
  const [showLabel, setShowLabel] = useState(false)

  const inputRef     = useRef<HTMLInputElement>(null)
  const pushedRef    = useRef(false)
  const index        = useMemo(buildSearchIndex, [])

  const accentColor = isDark ? SEARCH_ORANGE.dark : SEARCH_ORANGE.light

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

  // "ApexbytesHub" in/out loop — toggles every LABEL_CYCLE_MS while the
  // pill is idle (closed). The icon's left/center position and the
  // wording's opacity are both driven off this single boolean so they
  // move in lockstep. Stops entirely once the panel is open.
  useEffect(() => {
    if (isOpen) { setShowLabel(false); return }
    const id = setInterval(() => setShowLabel((v) => !v), LABEL_CYCLE_MS)
    return () => clearInterval(id)
  }, [isOpen])

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
  //
  // NOTE: no auto-focus here anymore. The input is left unfocused on open
  // so mobile browsers don't pop the keyboard the instant the panel
  // appears — the person taps the pill (1st tap, opens panel), then taps
  // the input itself (2nd tap) to focus it and bring up the keyboard,
  // which is just the input's normal native click-to-focus behavior.
  useEffect(() => {
    if (isOpen) {
      if (!pushedRef.current) {
        window.history.pushState({ abhSearch: true }, "")
        pushedRef.current = true
      }
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

  // Manual close (backdrop click / X button / Escape). Nothing else has
  // been pushed to history since we opened, so it's safe to pop our own
  // entry here.
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
          className="fixed inset-0 z-[9989] bg-black/25 transition-opacity duration-200 ease-out motion-reduce:transition-none"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ── Idle pill ────────────────────────────────────────────────────
          Simple flat search bar (no glass, no glow) matching the
          reference look: white/zinc-900 rounded pill, plain shadow, a
          single theme-adaptive orange icon. While idle it loops the
          "ApexbytesHub" wording in/out — the icon docks left when the
          wording is visible and drifts back to center when it isn't. */}
      {!isOpen && (
        <div
          className={cn(
            "fixed z-[9993] right-4 md:right-6 transition-all duration-200 ease-out motion-reduce:transition-none transform-gpu",
            pastTrigger && !isOtherOpen
              ? "bottom-[9.5rem] opacity-100 scale-100 pointer-events-auto"
              : "bottom-[9.5rem] opacity-0 scale-90 pointer-events-none"
          )}
        >
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Search services"
            className="relative flex items-center rounded-full bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-white/10 active:scale-95 hover:shadow-xl transition-[transform,box-shadow] duration-150 ease-out motion-reduce:transition-none"
            style={{ width: IDLE_WIDTH, height: IDLE_HEIGHT }}
          >
            <MagnifyingGlass
              size={ICON_SIZE}
              weight="bold"
              aria-hidden="true"
              className="absolute transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{
                left: ICON_DOCKED_LEFT,
                top: "50%",
                color: accentColor,
                transform: `translate(${showLabel ? 0 : ICON_CENTER_OFFSET}px, -50%)`,
              }}
            />
            <span
              className="absolute font-sans font-black text-sm whitespace-nowrap transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
              aria-hidden="true"
              style={{
                left: ICON_DOCKED_LEFT + ICON_SIZE + 10,
                top: "50%",
                color: accentColor,
                opacity: showLabel ? 1 : 0,
                transform: `translate(${showLabel ? 0 : 6}px, -50%)`,
              }}
            >
              ApexbytesHub
            </span>
          </button>
        </div>
      )}

      {/* ── Panel ────────────────────────────────────────────────────────
          Plain rounded card — white/zinc-900, one flat border, one plain
          shadow. No blur, no saturation boost, no tinted wash, no glow. */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] rounded-[18px] shadow-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200 ease-out motion-reduce:animate-none transform-gpu"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-zinc-100 dark:border-white/10">
            <h3 className="font-sans font-black text-lg" style={{ color: accentColor }}>Search Services</h3>
            <button
              onClick={handleClose}
              aria-label="Close search"
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150 bg-zinc-100 dark:bg-white/[0.07]"
            >
              <X size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>

          {/* Search input — same flat pill language as the idle control,
              icon permanently docked left (settled, no more sliding).
              Deliberately not autofocused; see the effect above. */}
          <div className="px-5 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-2.5 rounded-full px-4 h-11 bg-zinc-100 dark:bg-white/[0.07] border border-zinc-200 dark:border-white/10 focus-within:border-zinc-300 dark:focus-within:border-white/20 transition-colors duration-150">
              <MagnifyingGlass size={ICON_SIZE} weight="bold" className="shrink-0" style={{ color: accentColor }} aria-hidden="true" />
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

          {/* Results — plain divided list, no glass cards. */}
          <div
            className="overflow-y-auto px-5 pb-5 pt-2 transition-[height] duration-200 ease-out motion-reduce:transition-none"
            style={{ height: hasQuery ? "360px" : "76px" }}
          >
            {!hasQuery ? null : results.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-white/10">
                {results.map((s, idx) => (
                  <button
                    key={`${s.hubId}-${s.name}-${idx}`}
                    onClick={() => pick(s)}
                    className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-white/[0.05] transition-colors duration-150"
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
