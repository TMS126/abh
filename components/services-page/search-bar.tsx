"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { MagnifyingGlass, X } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS } from "@/lib/data"
import { HubIcon } from "./shared"
import { buildSearchIndex, SearchableService, SelectedService } from "./lib"

export function InlineSearchBar({ onSelect }: { onSelect: (svc: SelectedService) => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const index = useMemo(buildSearchIndex, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)).slice(0, 8)
  }, [query, index])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const pick = (s: SearchableService) => {
    onSelect({ name: s.name, price: s.price, hubId: s.hubId, sectionTitle: s.sectionTitle, requirements: s.requirements, desc: s.description, turnaround: s.turnaround })
    setQuery(""); setFocused(false)
  }

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-md">
      <MagnifyingGlass size={18} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      <input
        type="text" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)}
        placeholder="Search services…"
        className="w-full pl-11 pr-10 py-3.5 rounded-[14px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-[#1E6FA8] transition-colors text-center focus:text-left"
      />
      {query && (
        <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600">
          <X size={12} weight="bold" />
        </button>
      )}
      {focused && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-950 rounded-[14px] border border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-150">
          {results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto p-2">
              {results.map((s, idx) => {
                const colors = HUB_COLORS[s.hubId as HubKey]
                const accent = isDark ? colors.accentDark : colors.accentLight
                return (
                  <button key={`${s.hubId}-${s.name}-${idx}`} onClick={() => pick(s)} className="w-full flex items-center gap-3 p-3 rounded-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left">
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
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mt-1">Try a different word, or WhatsApp us directly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
              }
