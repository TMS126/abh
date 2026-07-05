"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { MagnifyingGlass, X, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

// Must match the route of your Services main page exactly — this widget
// is hidden everywhere else, including on Services with query params like
// ?hub=print (adjust the check below if you want it to persist through those).
const SERVICES_PATH = "/services"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

// ── Same glass tokens as QuoteCalculatorWidget / WhatsAppFAB ──────────────────
const GLASS = {
  panel: "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10",
  item:  "bg-white/80 dark:bg-white/[0.06] border border-white/70 dark:border-white/[0.08]",
  btn:   "bg-zinc-100/70 dark:bg-white/[0.07] border border-white/60 dark:border-white/10",
} as const

const ACCENT_ORANGE = "#F4A261"

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
  const isDark = resolvedTheme === "dark"

  const [isOpen, setIsOpen, isOtherOpen] = useExclusiveWidget("search")
  const [query, setQuery]         = useState("")
  const [pastTrigger, setPastTrigger] = useState(false)

  const inputRef     = useRef<HTMLInputElement>(null)
  const pushedRef    = useRef(false)
  const index        = useMemo(buildSearchIndex, [])

  const onServicesPage = pathname === SERVICES_PATH

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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index
      .filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      .slice(0, 8)
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
          className="fixed inset-0 z-[9989] bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ── FAB — third slot in the stack, above the Quote Calculator ──── */}
      <div
        className={cn(
  "fixed z-[9992] right-4 bottom-[9.5rem] group/search",
  "transition-all duration-300",
  pastTrigger && !isOtherOpen
    ? "opacity-100 scale-100 pointer-events-auto"
    : "opacity-0 scale-90 pointer-events-none"
)}
      >
        <div className="flex items-center justify-end gap-2">
          {/* Slide-out label */}
          <span className={cn(
            "text-[0.65rem] font-black uppercase tracking-widest whitespace-nowrap",
            "bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800",
            "transition-all duration-300 origin-right",
            isOpen
              ? "opacity-0 scale-x-0 pointer-events-none"
              : "opacity-0 scale-x-0 group-hover/search:opacity-100 group-hover/search:scale-x-100"
          )}
          style={{ color: ACCENT_ORANGE }}
          >
            Search
          </span>

          {/* Fully round FAB — matches the Quote Calculator / WhatsApp circles */}
          <button
            onClick={() => setIsOpen(o => !o)}
            className="relative w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-transform duration-200"
            style={{ backgroundColor: ACCENT_ORANGE }}
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
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] rounded-[14px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300",
            GLASS.panel
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)" }}
        >
          {/* Specular highlight strip */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-white/20 dark:border-white/10"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)" }}
          >
            <h3 className="font-sans font-black text-lg" style={{ color: ACCENT_ORANGE }}>Search Services</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-[14px] shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors bg-zinc-100/70 dark:bg-white/[0.07]"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Search input — no visible border anywhere, 14px corners, soft shadow */}
          <div className="px-5 pt-3 pb-1.5 shrink-0">
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-[14px] shadow-sm bg-white/80 dark:bg-white/[0.06]">
              <MagnifyingGlass size={16} weight="bold" className="shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none appearance-none border-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none min-w-0 text-center px-2"
              />
              {query && (
                <button onClick={() => setQuery("")} className="w-5 h-5 rounded-[14px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 shrink-0">
                  <X size={11} weight="bold" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-5 pt-2">
            {query.trim().length === 0 ? (
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 text-center py-8">
                Start typing to find a service — CV, laminating, SASSA
              </p>
            ) : results.length > 0 ? (
              <div className="space-y-1.5">
                {results.map((s, idx) => {
                  const colors = HUB_COLORS[s.hubId as HubKey]
                  const accent = isDark ? colors.tagTextDark : colors.tagText
                  return (
                    <button
                      key={`${s.hubId}-${s.name}-${idx}`}
                      onClick={() => pick(s)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-[14px] shadow-sm transition-colors text-left hover:bg-white/40 dark:hover:bg-white/10 bg-white/80 dark:bg-white/[0.06]"
                    >
                      <div className="w-9 h-9 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${accent}20`, color: accent }}>
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
              <div className="text-center py-8">
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
