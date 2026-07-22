'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { MagnifyingGlass, CaretDown, CaretUp, FileArrowDown } from '@phosphor-icons/react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HUBS, type HubId } from '@/lib/data'
import { HUB_COLORS, type HubKey } from '@/lib/brand'
import { cn } from '@/lib/utils'

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
  const contentRef = useRef<HTMLDivElement>(null)

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
              accent: HUB_COLORS[hubId as HubKey].accentLight,
            })
          }
        })
      })
    })
    return out.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  }, [query])

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = '/ApexbytesHub_Pricing_Catalog.pdf'
    link.download = 'ApexbytesHub_Pricing_Catalog.pdf'
    link.click()
  }, [])

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.45s ease both;
        }
        .hub-card-open {
          animation: fadeUp 0.3s ease both;
        }
        @media print {
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <style>{`
        [data-widget="quote-calculator"],
        [data-widget="whatsapp-fab"] {
          display: none !important;
        }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-[#081428] flex flex-col">
        <Navbar />

        <main className="flex-1 pt-[calc(var(--nav-h,74px)+2rem)] pb-16">
          <div className="max-w-2xl mx-auto px-4">

            {/* Page heading */}
            <div className="fade-up mb-8 text-center">
              <h1 className="font-sans font-black text-3xl md:text-4xl text-zinc-900 dark:text-zinc-50 mb-2">
                Pricing
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                All services across all hubs — clear prices, no surprises.
              </p>
              <div className="mt-4 mx-auto h-[3px] w-10 rounded-full bg-[#1E6FA8]" />
            </div>

            {/* Search + Download bar */}
            <div
              className="no-print fade-up sticky top-[calc(var(--nav-h,74px)+0.5rem)] z-10 mb-6 flex gap-2"
              style={{ animationDelay: '0.08s' }}
            >
              <div className="relative flex-1">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                  weight="bold"
                />
                <input
                  type="text"
                  placeholder="Search any service or price…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-[14px] border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1E6FA8]/30 focus:border-[#1E6FA8] transition-colors shadow-sm"
                />
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                className="no-print flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-[#1E6FA8] hover:bg-[#1a5f92] active:scale-95 text-white text-sm font-bold transition-all duration-200 shadow-md shrink-0"
              >
                <FileArrowDown size={18} weight="bold" />
                <span>PDF</span>
              </button>
            </div>

            {/* Content */}
            <div ref={contentRef} className="space-y-3">
              {results !== null ? (
                results.length === 0 ? (
                  <div className="text-center py-12 fade-up">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      No results for{' '}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        "{query}"
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 fade-up">
                    <p className="text-xs text-zinc-400 pb-1">
                      {results.length} result{results.length !== 1 ? 's' : ''} — lowest first
                    </p>
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_1px_6px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                        style={{ animationDelay: `${i * 0.03}s` }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                            {r.name}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {r.hubTitle} · {r.section}
                          </p>
                        </div>
                        <span className="text-sm font-black shrink-0" style={{ color: r.accent }}>
                          {r.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                HUB_ORDER.map((hubId, idx) => {
                  const hub    = HUBS[hubId]
                  const colors = HUB_COLORS[hubId as HubKey]
                  const accent = colors.accentLight
                  const isOpen = openHubs.has(hubId)

                  return (
                    <div
                      key={hubId}
                      className="rounded-[14px] border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 shadow-[0_1px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.55)]"
                      style={{
                        borderColor: isOpen ? `${accent}50` : undefined,
                        animationDelay: `${0.1 + idx * 0.07}s`,
                      }}
                    >
                      {/* Hub toggle */}
                      <button
                        onClick={() => toggleHub(hubId)}
                        className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-zinc-900 transition-all duration-200 text-left"
                        style={isOpen ? { backgroundColor: `${accent}08` } : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1.5 h-9 rounded-full shrink-0 transition-all duration-300"
                            style={{ backgroundColor: accent }}
                          />
                          <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                              {hub.title}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {hub.previews?.join(' · ') ?? ''}
                            </p>
                          </div>
                        </div>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200"
                          style={isOpen ? { backgroundColor: `${accent}18` } : undefined}
                        >
                          {isOpen
                            ? <CaretUp size={16} weight="bold" style={{ color: accent }} />
                            : <CaretDown size={16} weight="bold" className="text-zinc-400" />
                          }
                        </div>
                      </button>

                      {/* Hub sections */}
                      {isOpen && (
                        <div className="hub-card-open border-t" style={{ borderColor: `${accent}25` }}>
                          {hub.sections.map((section, si) => {
                            const sorted = [...section.items].sort(
                              (a, b) => parsePrice(a.price) - parsePrice(b.price)
                            )
                            return (
                              <div
                                key={section.title}
                                className={cn(
                                  'px-4 py-3 bg-white dark:bg-zinc-900',
                                  si > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''
                                )}
                              >
                                {/* Section label */}
                                <div className="flex items-center gap-2 mb-2.5">
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: accent }}>
                                    {section.title}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  {sorted.map(item => (
                                    <div
                                      key={item.name}
                                      className="flex items-center justify-between gap-3 py-1"
                                    >
                                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                        {item.name}
                                      </span>
                                      <span className="text-sm font-black shrink-0" style={{ color: accent }}>
                                        {item.price}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}

                          {/* Turnaround footer */}
                          <div
                            className="px-4 py-2.5 border-t"
                            style={{ borderColor: `${accent}25`, backgroundColor: `${accent}06` }}
                          >
                            <p className="text-xs text-zinc-400">
                              <span className="font-semibold" style={{ color: accent }}>Turnaround: </span>
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

            {/* Rush fee notice */}
            <div
              className="fade-up mt-8 rounded-[14px] border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 px-5 py-4"
              style={{ animationDelay: '0.5s' }}
            >
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <span className="font-black">⚡ Rush fee:</span> A 50% surcharge applies when same-session or urgent turnaround is required.
              </p>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
                                    } 
