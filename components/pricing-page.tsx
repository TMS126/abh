'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { MagnifyingGlass, CaretDown, CaretUp, FileArrowDown } from '@phosphor-icons/react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ScrollBounce } from '@/components/scroll-bounce'
import { HUBS, type HubId } from '@/lib/data'
import { HUB_COLORS, BRAND, type HubKey } from '@/lib/brand'
import { HUB_PREVIEWS } from '@/components/services-page/lib'
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
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === 'dark'
  const [openHubs, setOpenHubs] = useState<Set<HubId>>(new Set())
  const [query, setQuery] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const accentFor = (hubId: HubId) => {
    const c = HUB_COLORS[hubId as HubKey]
    return isDark ? c.accentDark : c.accentLight
  }

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
              accent: accentFor(hubId),
            })
          }
        })
      })
    })
    return out.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  }, [query, isDark])

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = '/ApexbytesHub_Pricing_Catalog.pdf'
    link.download = 'ApexbytesHub_Pricing_Catalog.pdf'
    link.click()
  }, [])

  return (
    <>
      <style>{`
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

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1">

          {/* ── Hero ── */}
          <section className="px-4 md:px-8 pt-[calc(var(--nav-h)+2rem)] pb-8">
            <div className="max-w-2xl mx-auto">
              <ScrollBounce>
                <h1 className="abh-page-title mb-3">Pricing</h1>
              </ScrollBounce>
              <p className="abh-tagline max-w-xl mx-auto text-center">
                All services across all hubs — clear prices, no surprises.
              </p>
              <div className="abh-divider" />
            </div>
          </section>

          <div className="max-w-2xl mx-auto px-4 pb-16">

            {/* Search + Download bar */}
            <ScrollBounce delay={0.08}>
              <div className="no-print sticky top-[calc(var(--nav-h,74px)+0.5rem)] z-10 mb-6 flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlass
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
                    weight="bold"
                    aria-hidden="true"
                  />
                  <label htmlFor="pricing-search" className="sr-only">Search any service or price</label>
                  <input
                    id="pricing-search"
                    type="text"
                    placeholder="Search any service or price…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border rounded-[14px] bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 border-zinc-100 dark:border-zinc-800 outline-none focus:border-brand-blue transition-all shadow-sm"
                  />
                </div>

                <button
                  onClick={handleDownload}
                  aria-label="Download pricing catalog as PDF"
                  className="no-print shrink-0 flex items-center gap-2 px-4 py-3 rounded-[14px] font-medium text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5 shadow-lg"
                  style={{ backgroundColor: BRAND.blue }}
                >
                  <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                  <span>PDF</span>
                </button>
              </div>
            </ScrollBounce>

            {/* Content */}
            <div ref={contentRef} className="space-y-3">
              {results !== null ? (
                results.length === 0 ? (
                  <ScrollBounce>
                    <div className="text-center py-12">
                      <p className="abh-body">
                        No results for{' '}
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          "{query}"
                        </span>
                      </p>
                    </div>
                  </ScrollBounce>
                ) : (
                  <ScrollBounce>
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 pb-1">
                        {results.length} result{results.length !== 1 ? 's' : ''} — lowest first
                      </p>
                      {results.map((r, i) => (
                        <div
                          key={i}
                          className="abh-card flex items-center justify-between gap-3 px-4 py-3"
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
                  </ScrollBounce>
                )
              ) : (
                HUB_ORDER.map((hubId, idx) => {
                  const hub    = HUBS[hubId]
                  const accent = accentFor(hubId)
                  const isOpen = openHubs.has(hubId)

                  return (
                    <ScrollBounce key={hubId} delay={idx * 0.06}>
                      <div
                        className="abh-card overflow-hidden transition-all duration-300"
                        style={{ borderColor: isOpen ? `${accent}50` : undefined }}
                      >
                        {/* Hub toggle */}
                        <button
                          onClick={() => toggleHub(hubId)}
                          aria-expanded={isOpen}
                          aria-controls={`pricing-hub-${hubId}`}
                          className="w-full flex items-center justify-between px-4 py-4 transition-all duration-200 text-left"
                          style={isOpen ? { backgroundColor: `${accent}08` } : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-1.5 h-9 rounded-full shrink-0 transition-all duration-300"
                              style={{ backgroundColor: accent }}
                              aria-hidden="true"
                            />
                            <div>
                              <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                                {hub.title}
                              </p>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {HUB_PREVIEWS[hubId].join(' · ')}
                              </p>
                            </div>
                          </div>
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200"
                            style={isOpen ? { backgroundColor: `${accent}18` } : undefined}
                          >
                            {isOpen
                              ? <CaretUp size={16} weight="bold" style={{ color: accent }} aria-hidden="true" />
                              : <CaretDown size={16} weight="bold" className="text-zinc-400" aria-hidden="true" />
                            }
                          </div>
                        </button>

                        {/* Hub sections */}
                        {isOpen && (
                          <div id={`pricing-hub-${hubId}`} className="border-t" style={{ borderColor: `${accent}25` }}>
                            {hub.sections.map((section, si) => {
                              const sorted = [...section.items].sort(
                                (a, b) => parsePrice(a.price) - parsePrice(b.price)
                              )
                              return (
                                <div
                                  key={section.title}
                                  className={cn(
                                    'px-4 py-3',
                                    si > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''
                                  )}
                                >
                                  {/* Section label */}
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} aria-hidden="true" />
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
                    </ScrollBounce>
                  )
                })
              )}
            </div>

            {/* Rush fee notice */}
            <ScrollBounce delay={0.3}>
              <div className="mt-8 rounded-[14px] border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 px-5 py-4">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <span className="font-black">⚡ Rush fee:</span> A 50% surcharge applies when same-session or urgent turnaround is required.
                </p>
              </div>
            </ScrollBounce>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}