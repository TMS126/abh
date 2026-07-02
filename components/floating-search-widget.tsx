"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { X, MagnifyingGlass, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BIZ, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"

// Must match the route of your Services main page exactly — this widget
// is hidden everywhere else, including on Services with query params like
// ?hub=print (adjust the check below if you want it to persist through those).
const SERVICES_PATH = "/services"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

interface SearchableService {
  hubId: HubId; sectionTitle: string; name: string
  price: string; description: string; requirements: string[]
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

function HubIcon({ id, size = 18, color }: { id: HubId; size?: number; color?: string }) {
  const p = { size, weight: "fill" as const, color: color ?? "currentColor", "aria-hidden": true }
  switch (id) {
    case "print":    return <Printer    {...p} />
    case "doc":      return <FileText   {...p} />
    case "design":   return <PaintBrush {...p} />
    case "eservice": return <Globe      {...p} />
    case "tech":     return <Desktop    {...p} />
  }
}

/**
 * Sends the chosen service to the Services page. The page listens for this
 * on `window` and opens its existing ServiceDetailModal — this keeps the
 * widget fully decoupled from page state now that it lives in the root
 * layout rather than inside the page tree. This is also the fix for the
 * "tapping a result does nothing" bug: previously this component called an
 * `onSelect` prop it no longer has access to from outside the page.
 */
function dispatchSelectService(svc: SelectedService) {
  window.dispatchEvent(new CustomEvent<SelectedService>("abh:selectService", { detail: svc }))
}

export function FloatingSearchWidget() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState("")
  const [visible, setVisible] = useState(false)

  const inputRef  = useRef<HTMLInputElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const pushedRef = useRef(false)
  const index     = useMemo(buildSearchIndex, [])

  const onServicesPage = pathname === SERVICES_PATH

  // Visibility mirrors the inline search bar's scroll position on the
  // Services page — that bar carries id="abh-inline-search".
  useEffect(() => {
    if (!onServicesPage) { setVisible(false); return }
    const check = () => {
      const el = document.getElementById("abh-inline-search")
      if (!el) { setVisible(false); return }
      setVisible(el.getBoundingClientRect().bottom < 0)
    }
    check()
    window.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check)
    return () => {
      window.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [onServicesPage])

  // Reset state whenever navigating off the Services page
  useEffect(() => {
    if (!onServicesPage) {
      setOpen(false)
      setQuery("")
      pushedRef.current = false
    }
  }, [onServicesPage])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index
      .filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, index])

  const openSearch = () => {
    setOpen(true)
    if (!pushedRef.current) {
      window.history.pushState({ abhSearch: true }, "")
      pushedRef.current = true
    }
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  // Closing collapses the extra history entry (if any) so back-navigation
  // keeps behaving normally afterwards — same self-contained pattern as
  // before: this widget only ever closes itself, nothing else.
  const closeSearch = useCallback(() => {
    setOpen(false)
    setQuery("")
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    }
  }, [])

  const pick = (s: SearchableService) => {
    dispatchSelectService({
      name: s.name, price: s.price, hubId: s.hubId,
      sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description,
    })
    closeSearch()
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closeSearch()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, closeSearch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [closeSearch])

  useEffect(() => {
    const onPop = () => {
      if (!pushedRef.current) return
      pushedRef.current = false
      setOpen(false)
      setQuery("")
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  if (!onServicesPage) return null

  return (
    <div
      ref={wrapRef}
      className={cn(
        // Same bottom-right FAB column as the Quote Calculator and WhatsApp
        // widgets, stacked directly above the Quote Calculator icon.
        // NOTE: I don't have the source for QuoteCalculatorWidget/WhatsAppFAB,
        // so this 92px offset is an estimate (56px button + ~36px gap+margin).
        // Nudge `bottom-[92px]` up/down to match your exact FAB spacing.
        "fixed right-4 z-[9993] transition-all duration-300",
        "bottom-[152px]",
        visible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"
      )}
    >
      {/* Closed: solid brand-orange widget button */}
      {!open && (
        <button
          onClick={openSearch}
          aria-label="Search services"
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ backgroundColor: "#F4A261" }}
        >
          <MagnifyingGlass size={24} weight="bold" color="#fff" />
        </button>
      )}

      {/* Open: expanded search input, anchored to the same bottom-right spot, 14px radius */}
      {open && (
        <div className="absolute bottom-0 right-0 flex items-center gap-2 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.18)] rounded-[14px] px-4 py-2.5 w-[min(90vw,380px)]">
          <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none min-w-0 text-center focus:text-left"
          />
          {query && (
            <button onClick={() => setQuery("")} className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 shrink-0">
              <X size={11} weight="bold" />
            </button>
          )}
          <button onClick={closeSearch} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 shrink-0 transition-colors">
            <X size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Results dropdown — opens upward since the widget sits near the bottom edge */}
      {open && query.trim().length > 0 && (
        <div className="absolute bottom-full right-0 mb-2 w-[min(90vw,380px)] bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.map((s, idx) => {
                const colors = HUB_COLORS[s.hubId as HubKey]
                const accent = isDark ? colors.tagTextDark : colors.tagText
                return (
                  <button
                    key={`${s.hubId}-${s.name}-${idx}`}
                    onClick={() => pick(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}>
                      <HubIcon id={s.hubId} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{s.name}</p>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 truncate">{s.sectionTitle} · {HUBS[s.hubId].title}</p>
                    </div>
                    <span className="text-xs font-black shrink-0" style={{ color: accent }}>{s.price}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">No services found</p>
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word or WhatsApp us directly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
