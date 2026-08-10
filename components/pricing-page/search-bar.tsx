// components/pricing-page/search.tsx
// (Assuming this path based on the relative imports "./lib" and "./shared" —
// flag me if the actual file lives elsewhere and I'll re-anchor.)
"use client"

import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { Check, PlusCircle } from '@phosphor-icons/react'
import { HubIcon } from '@/components/services-page/shared'
import { BulkBadge } from './shared'
import { Result } from './lib'

// ===== SEARCH INPUT — now matches the Services page's InlineSearchBar
// exactly: rounded-[14px] boxed container, solid neutral border,
// brand-blue focus border, white/zinc-900 fill, left-aligned text (not
// centered), plus the same clear (X) button when there's a query. =====
export function PricingSearchInput({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="flex items-center gap-2.5 px-4 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-brand-blue transition-all duration-200">
        <MagnifyingGlass size={16} weight="bold" className="text-zinc-400 pointer-events-none shrink-0" aria-hidden="true" />
        <label htmlFor="pricing-search" className="sr-only">Search any service or price</label>
        <input
          id="pricing-search"
          type="text"
          placeholder="Search any service or price…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="min-w-0 flex-1 py-3 pr-8 bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none text-base font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none appearance-none [-webkit-appearance:none]"
        />
      </div>
      {query && (
        <button
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600"
        >
          <X size={12} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

// ── Search results list — unchanged ──
export function PricingSearchResults({
  results, justAdded, onAdd,
}: {
  results: Result[]
  justAdded: string | null
  onAdd: (hubId: Result['hubId'], section: string, name: string, price: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-[0.9rem] text-zinc-400 pb-1">
        {results.length} result{results.length !== 1 ? 's' : ''} — lowest first
      </p>
      {results.map((r, i) => {
        const key = `${r.hubId}-${r.section}-${r.name}`
        return (
          <div key={i} className="abh-card flex items-center gap-3 px-4 py-4 transition-shadow duration-200 hover:shadow-md">
            <HubIcon id={r.hubId} size={20} color={r.accent} />
            <div className="min-w-0 flex-1">
              <p className="text-[1.05rem] font-semibold text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                <span className="truncate">{r.name}</span>
              </p>
              <p className="text-[0.9rem] text-zinc-400 mt-0.5">{r.hubTitle} · {r.section}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[1.05rem] font-black" style={{ color: r.accent }}>{r.price}</span>
              <button
                onClick={() => onAdd(r.hubId, r.section, r.name, r.price)}
                aria-label={`Add ${r.name} to quote`}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110"
                style={{ color: justAdded === key ? '#16a34a' : r.accent }}
              >
                {justAdded === key ? <Check size={20} weight="bold" /> : <PlusCircle size={20} weight="fill" />}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
} 
