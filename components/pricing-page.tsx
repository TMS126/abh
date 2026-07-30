'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import {
  MagnifyingGlass, CaretDown, CaretUp,
  FilePdf, PlusCircle, Check, Lightning, SealPercent,
} from '@phosphor-icons/react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ScrollBounce } from '@/components/scroll-bounce'
import { HUBS, type HubId } from '@/lib/data'
import { HUB_COLORS, BRAND, BIZ, waLink, type HubKey } from '@/lib/brand'
import { HUB_PREVIEWS } from '@/components/services-page/lib'
import { HubIcon } from '@/components/services-page/shared'
import { BULK_TIERS, isScanItem, SCAN_BULK_RATE } from '@/components/quote-calculator/lib'
import { cn } from '@/lib/utils'

const HUB_ORDER: HubId[] = ['print', 'doc', 'design', 'eservice', 'tech']

const ADOBE_PDF_RED = '#EC1C24'

function parsePrice(price: string): number {
  const match = price.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

function dispatchAddToQuote(hubId: HubId, sectionTitle: string, name: string, price: string) {
  window.dispatchEvent(new CustomEvent('abh:add-to-quote', { detail: { hubId, sectionTitle, name, price } }))
}

function bulkDiscountPercent(hubId: HubId, sectionTitle: string, itemName: string, baseAmount: number): number | null {
  if (baseAmount <= 0) return null
  const itemId = `${hubId}-${sectionTitle}-${itemName}`
  const tiers = BULK_TIERS[itemId]
  if (tiers && tiers.length > 0) {
    const bestRate = Math.min(...tiers.map(t => t.rate))
    return Math.round(((baseAmount - bestRate) / baseAmount) * 100)
  }
  if (isScanItem(itemName)) {
    return Math.round(((baseAmount - SCAN_BULK_RATE) / baseAmount) * 100)
  }
  return null
}

function BulkBadge({ percent }: { percent: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[0.62rem] font-black text-emerald-600 dark:text-emerald-400"
      aria-label={`Up to ${percent}% off with bulk pricing`}
    >
      <SealPercent size={11} weight="fill" />
      {percent}%
    </span>
  )
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
  const hubRefs = useRef<Partial<Record<HubId, HTMLDivElement | null>>>({})

  const [justAdded, setJustAdded] = useState<string | null>(null)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }, [])

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

  const allOpen = openHubs.size === HUB_ORDER.length
  const toggleAll = useCallback(() => {
    setOpenHubs(allOpen ? new Set() : new Set(HUB_ORDER))
  }, [allOpen])

  const jumpToHub = useCallback((hubId: HubId) => {
    setOpenHubs(prev => {
      if (prev.has(hubId)) return prev
      const next = new Set(prev)
      next.add(hubId)
      return next
    })
    requestAnimationFrame(() => {
      hubRefs.current[hubId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const handleAdd = useCallback((hubId: HubId, sectionTitle: string, name: string, price: string) => {
    dispatchAddToQuote(hubId, sectionTitle, name, price)
    const key = `${hubId}-${sectionTitle}-${name}`
    setJustAdded(key)
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => setJustAdded(null), 900)
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

  const handleHubDownload = useCallback((hubId: HubId) => {
    const link = document.createElement('a')
    link.href = `/ApexbytesHub_Pricing_${hubId}.pdf`
    link.download = `ApexbytesHub_Pricing_${HUBS[hubId].title.replace(/\s+/g, '_')}.pdf`
    link.click()
  }, [])

  const noResultsWaLink = waLink(`Hi ${BIZ.name}! I couldn't find "${query}" on your pricing page — is this something you offer?`)

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <style>{`
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

            {/* Search — plain underline, no box, matches the InlineSearchBar
                feel used on the Services page. */}
            <ScrollBounce delay={0.08}>
              <div className="no-print sticky top-[calc(var(--nav-h,74px)+0.5rem)] z-10 mb-6 bg-background">
                <div className="relative flex items-center border-b-2 border-zinc-200 dark:border-zinc-800 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors duration-200">
                  <MagnifyingGlass
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
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
                    className="w-full pl-7 pr-1 py-3 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none"
                  />
                </div>
              </div>
            </ScrollBounce>

            {/* Jump-nav — text-only, underline in the hub's own color while
                that hub is open. Expand/Collapse is its own separate,
                centered button below, not grouped with the filters. */}
            {results === null && (
              <>
                <ScrollBounce delay={0.1}>
                  <div className="no-print flex flex-wrap justify-center gap-x-4 gap-y-2 mb-5">
                    {HUB_ORDER.map(hubId => {
                      const isOpen = openHubs.has(hubId)
                      const accent = accentFor(hubId)
                      return (
                        <button
                          key={hubId}
                          onClick={() => jumpToHub(hubId)}
                          className="relative pb-1 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150"
                          style={isOpen ? { color: accent } : undefined}
                        >
                          {HUBS[hubId].title}
                          <span
                            className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full transition-opacity duration-200"
                            style={{ backgroundColor: accent, opacity: isOpen ? 1 : 0 }}
                            aria-hidden="true"
                          />
                        </button>
                      )
                    })}
                  </div>
                </ScrollBounce>

                <ScrollBounce delay={0.14}>
                  <div className="no-print flex justify-center mb-8">
                    <button
                      onClick={toggleAll}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 transition-colors duration-150 active:scale-95 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {allOpen ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                      {allOpen ? 'Collapse all' : 'Expand all'}
                    </button>
                  </div>
                </ScrollBounce>
              </>
            )}

            {/* Content */}
            <div ref={contentRef} className="space-y-3">
              {results !== null ? (
                results.length === 0 ? (
                  <ScrollBounce>
                    <div className="text-center py-12">
                      <p className="abh-body mb-4">
                        No results for{' '}
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          "{query}"
                        </span>
                      </p>
                      <a
                        href={noResultsWaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-black text-white transition-all duration-150 active:scale-95 hover:-translate-y-0.5 shadow-md"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        Can't find it? Ask us on WhatsApp
                      </a>
                    </div>
                  </ScrollBounce>
                ) : (
                  <ScrollBounce>
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-400 pb-1">
                        {results.length} result{results.length !== 1 ? 's' : ''} — lowest first
                      </p>
                      {results.map((r, i) => {
                        const key = `${r.hubId}-${r.section}-${r.name}`
                        const pct = bulkDiscountPercent(r.hubId, r.section, r.name, parsePrice(r.price))
                        return (
                          <div key={i} className="abh-card flex items-center gap-3 px-4 py-3 transition-shadow duration-200 hover:shadow-md">
                            {/* Raw icon, no bg fill */}
                            <HubIcon id={r.hubId} size={20} color={r.accent} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                                <span className="truncate">{r.name}</span>
                                {pct !== null && <BulkBadge percent={pct} />}
                              </p>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {r.hubTitle} · {r.section}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-black" style={{ color: r.accent }}>{r.price}</span>
                              <button
                                onClick={() => handleAdd(r.hubId, r.section, r.name, r.price)}
                                aria-label={`Add ${r.name} to quote`}
                                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110"
                                style={{ color: justAdded === key ? '#16a34a' : r.accent }}
                              >
                                {justAdded === key
                                  ? <Check size={20} weight="bold" />
                                  : <PlusCircle size={20} weight="fill" />}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollBounce>
                )
              ) : (
                HUB_ORDER.map((hubId, idx) => {
                  const hub    = HUBS[hubId]
                  const accent = accentFor(hubId)
                  const isOpen = openHubs.has(hubId)
                  const serviceCount = hub.sections.reduce((sum, s) => sum + s.items.length, 0)

                  return (
                    <ScrollBounce key={hubId} delay={idx * 0.06}>
                      <div
                        ref={(el) => { hubRefs.current[hubId] = el }}
                        className={cn(
                          "abh-card overflow-hidden transition-shadow duration-300 hover:shadow-md",
                          isOpen && "border-zinc-300 dark:border-zinc-700"
                        )}
                        style={{ scrollMarginTop: 'calc(var(--nav-h, 74px) + 4.5rem)' }}
                      >
                        {/* Hub toggle — raw icon (no bg), previews on the
                            left; service count right-aligned in a fixed
                            column so digits line up across every hub row
                            regardless of how many digits the count has;
                            chevron sits after it, same fixed gap. */}
                        <button
                          onClick={() => toggleHub(hubId)}
                          aria-expanded={isOpen}
                          aria-controls={`pricing-hub-${hubId}`}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-4 py-4 transition-colors duration-200 text-left",
                            isOpen && "bg-zinc-50 dark:bg-white/[0.03]"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <HubIcon id={hubId} size={20} color={accent} />
                            <div className="min-w-0">
                              <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 truncate">
                                {hub.title}
                              </p>
                              <p className="text-xs text-zinc-400 mt-0.5 truncate">
                                {HUB_PREVIEWS[hubId].join(' · ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className="w-6 text-right text-sm font-black tabular-nums text-zinc-400 dark:text-zinc-500"
                              aria-label={`${serviceCount} services`}
                            >
                              {serviceCount}
                            </span>
                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0", isOpen && "bg-zinc-100 dark:bg-white/10")}>
                              {isOpen
                                ? <CaretUp size={16} weight="bold" className="text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                                : <CaretDown size={16} weight="bold" className="text-zinc-400" aria-hidden="true" />
                              }
                            </div>
                          </div>
                        </button>

                        {/* Hub sections */}
                        {isOpen && (
                          <div id={`pricing-hub-${hubId}`} className="border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-1 duration-200">
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
                                  {/* Section label — bumped up from 11px to
                                      13px, items below stay at text-sm/14px
                                      as before (unchanged). */}
                                  <div className="flex items-center gap-2 mb-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} aria-hidden="true" />
                                    <p className="text-[0.8125rem] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                      {section.title}
                                    </p>
                                  </div>

                                  <div className="space-y-1">
                                    {sorted.map(item => {
                                      const key = `${hubId}-${section.title}-${item.name}`
                                      const pct = bulkDiscountPercent(hubId, section.title, item.name, parsePrice(item.price))
                                      return (
                                        <div
                                          key={item.name}
                                          className="flex items-center justify-between gap-3 py-1.5 px-1.5 -mx-1.5 rounded-[10px] transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                                        >
                                          <span className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 min-w-0">
                                            <span className="truncate">{item.name}</span>
                                            {pct !== null && <BulkBadge percent={pct} />}
                                          </span>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-sm font-black" style={{ color: accent }}>{item.price}</span>
                                            <button
                                              onClick={() => handleAdd(hubId, section.title, item.name, item.price)}
                                              aria-label={`Add ${item.name} to quote`}
                                              className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110"
                                              style={{ color: justAdded === key ? '#16a34a' : accent }}
                                            >
                                              {justAdded === key
                                                ? <Check size={16} weight="bold" />
                                                : <PlusCircle size={18} weight="fill" />}
                                            </button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}

                            {/* Turnaround footer */}
                            <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-white/[0.02]">
                              <p className="text-xs text-zinc-400">
                                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Turnaround: </span>
                                {hub.turnaround}
                              </p>
                            </div>

                            {/* Per-hub PDF download — icon only */}
                            <div className="no-print px-4 py-3 flex justify-center border-t border-zinc-100 dark:border-zinc-800">
                              <button
                                onClick={() => handleHubDownload(hubId)}
                                aria-label={`Download ${hub.title} price list as PDF`}
                                title={`Download ${hub.title} price list as PDF`}
                                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 hover:scale-110"
                                style={{ color: ADOBE_PDF_RED }}
                              >
                                <FilePdf size={20} weight="fill" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollBounce>
                  )
                })
              )}
            </div>

            {/* Full catalog PDF download — icon only */}
            <ScrollBounce delay={0.24}>
              <div className="no-print flex justify-center mt-8">
                <button
                  onClick={handleDownload}
                  aria-label="Download full pricing catalog as PDF"
                  title="Download full pricing catalog as PDF"
                  className="w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-90 hover:scale-105 shadow-sm hover:shadow-md"
                  style={{ color: ADOBE_PDF_RED, borderColor: `${ADOBE_PDF_RED}35`, backgroundColor: `${ADOBE_PDF_RED}0a` }}
                >
                  <FilePdf size={22} weight="fill" />
                </button>
              </div>
            </ScrollBounce>

            <ScrollBounce delay={0.3}>
              <div
                className="mt-6 rounded-[14px] border px-5 py-4 space-y-2"
                style={{ borderColor: `${BRAND.orange}35`, backgroundColor: `${BRAND.orange}0a` }}
              >
                <p className="text-xs flex items-start gap-1.5" style={{ color: BRAND.orange }}>
                  <Lightning size={14} weight="fill" className="shrink-0 mt-0.5" />
                  <span><span className="font-black">Rush fee:</span> A 50% surcharge applies when same-session or urgent turnaround is required.</span>
                </p>
                <p className="text-xs flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <SealPercent size={14} weight="fill" className="shrink-0 mt-0.5" />
                  <span>Look for the % badge next to a service — that's how much bulk pricing can save you.</span>
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