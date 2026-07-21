'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { HUBS, type HubId } from '@/lib/data'

const HUB_ORDER: HubId[] = ['print', 'doc', 'design', 'eservice', 'tech']

function parsePrice(price: string): number {
  const match = price.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

type Result = {
  hubId: HubId
  hubTitle: string
  section: string
  name: string
  price: string
  accent: string
}

export default function PricingPage() {
  const [openHubs, setOpenHubs] = useState<Set<HubId>>(new Set())
  const [query, setQuery] = useState('')

  const toggleHub = useCallback((id: HubId) => {
    setOpenHubs(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const results = useMemo((): Result[] | null => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const out: Result[] = []
    HUB_ORDER.forEach(hubId => {
      const hub = HUBS[hubId]
      hub.sections.forEach(section => {
        section.items.forEach(item => {
          if (
            item.name.toLowerCase().includes(q) ||
            item.price.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q) ||
            hub.title.toLowerCase().includes(q)
          ) {
            out.push({
              hubId,
              hubTitle: hub.title,
              section: section.title,
              name: item.name,
              price: item.price,
              accent: hub.tagStyle.color,
            })
          }
        })
      })
    })
    return out.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  }, [query])

  const handleDownload = useCallback(() => {
    setOpenHubs(new Set(HUB_ORDER))
    setTimeout(() => window.print(), 350)
  }, [])

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-gray-950 pb-24">

        {/* Page header */}
        <div className="px-4 pt-8 pb-5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pricing
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            All services across all hubs — clear prices, no surprises.
          </p>
        </div>

        {/* Sticky search + download bar */}
        <div className="no-print sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search any service or price..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={handleDownload}
            title="Download as PDF"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pt-4 space-y-3 max-w-2xl mx-auto">

          {results !== null ? (
            /* ── Search results ── */
            results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No results for{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    "{query}"
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 pb-1">
                  {results.length} result{results.length !== 1 ? 's' : ''} — low to high
                </p>
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.hubTitle} · {r.section}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold shrink-0"
                      style={{ color: r.accent }}
                    >
                      {r.price}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ── Hub accordions ── */
            HUB_ORDER.map(hubId => {
              const hub = HUBS[hubId]
              const isOpen = openHubs.has(hubId)
              const accent = hub.tagStyle.color

              return (
                <div
                  key={hubId}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  {/* Hub toggle button */}
                  <button
                    onClick={() => toggleHub(hubId)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {hub.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {hub.previews.join(' · ')}
                        </p>
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    }
                  </button>

                  {/* Hub sections */}
                  {isOpen && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      {hub.sections.map((section, si) => {
                        const sorted = [...section.items].sort(
                          (a, b) => parsePrice(a.price) - parsePrice(b.price)
                        )
                        return (
                          <div
                            key={section.title}
                            className={`px-4 py-3 ${
                              si > 0
                                ? 'border-t border-gray-100 dark:border-gray-800'
                                : ''
                            }`}
                          >
                            {/* Section label */}
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2.5">
                              {section.title}
                            </p>
                            {/* Items */}
                            <div className="space-y-2.5">
                              {sorted.map(item => (
                                <div
                                  key={item.name}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {item.name}
                                  </span>
                                  <span
                                    className="text-sm font-bold shrink-0"
                                    style={{ color: accent }}
                                  >
                                    {item.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}

                      {/* Turnaround footer */}
                      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                        <p className="text-xs text-gray-400">
                          <span className="font-medium text-gray-500 dark:text-gray-300">
                            Turnaround:
                          </span>{' '}
                          {hub.turnaround}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
    }
