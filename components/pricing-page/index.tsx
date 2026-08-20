// components/pricing-page/index.tsx
'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Lightning, SealPercent, WhatsappLogo } from '@phosphor-icons/react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ScrollBounce } from '@/components/scroll-bounce'
import { HUBS, type HubId } from '@/lib/data'
import { BRAND, TOKEN, BIZ, waLink } from '@/lib/brand'
import { itemHasBulk, hubHasBulk } from '@/components/quote-calculator/lib'
import { PricingSearchInput, PricingSearchResults } from './search-bar'
import { HubAccordionCard } from './hub-card'
import { PdfPillButton } from './shared'
import { HUB_ORDER, dispatchAddToQuote, dispatchRemoveFromQuote, parsePrice, searchHubs } from './lib'
import { BackToTopButton, useBackToTop } from '@/components/back-to-top-button'
import { CtaBar } from '@/components/strip-section'
import { NoticePill } from '@/components/notice-pill'

export default function PricingPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === 'dark'
  const [openHubs, setOpenHubs] = useState<Set<HubId>>(new Set())
  const [query, setQuery] = useState('')
  const hubRefs = useRef<Partial<Record<HubId, HTMLDivElement | null>>>({})
  const showBackToTop = useBackToTop()

  // FIX: new — dismissible state for the translucent rush-fee/bulk notice,
  // replacing the old solid orange card. Matches the NoticePill pattern
  // used on Services/Gallery.
  const [pricingNoticeDismissed, setPricingNoticeDismissed] = useState(false)

  const [justAdded, setJustAdded] = useState<string | null>(null)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }, [])

  const accent = isDark ? BRAND.lightBlue : BRAND.blue

  const toggleHub = useCallback((id: HubId) => {
    setOpenHubs(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // FIX: clicking an already-open hub's top pill now closes it instead of
  // being a no-op. Only scrolls when actually opening — closing shouldn't
  // yank the page anywhere.
  const jumpToHub = useCallback((hubId: HubId) => {
    const wasOpen = openHubs.has(hubId)
    setOpenHubs(prev => {
      const next = new Set(prev)
      if (wasOpen) next.delete(hubId)
      else next.add(hubId)
      return next
    })
    if (!wasOpen) {
      requestAnimationFrame(() => hubRefs.current[hubId]?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }, [openHubs])

  const allOpen = openHubs.size === HUB_ORDER.length
  const toggleAll = useCallback(() => setOpenHubs(allOpen ? new Set() : new Set(HUB_ORDER)), [allOpen])

  const handleAdd = useCallback((hubId: HubId, sectionTitle: string, name: string, price: string) => {
    dispatchAddToQuote(hubId, sectionTitle, name, price)
    const key = `${hubId}-${sectionTitle}-${name}`
    setJustAdded(key)
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => setJustAdded(null), 900)
  }, [])

  const handleRemove = useCallback((hubId: HubId, sectionTitle: string, name: string, price: string) => {
    dispatchRemoveFromQuote(hubId, sectionTitle, name, price)
  }, [])

  const results = useMemo(() => (query.trim() ? searchHubs(query, () => accent) : null), [query, isDark])

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = '/ApexbytesHub_Pricing_Catalog_v2.pdf'
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

  // FIX: root fix for the desktop layout bug. A single 2-col CSS grid
  // shares row height across BOTH columns — when one accordion opens tall,
  // its whole grid row stretches and pushes the card next to AND below it
  // out of alignment. Splitting into two independent flex columns means
  // each column's height is its own; opening a card in column A never
  // touches column B's position.
  const leftColumn = HUB_ORDER.filter((_, i) => i % 2 === 0)
  const rightColumn = HUB_ORDER.filter((_, i) => i % 2 === 1)

  const renderHubCard = (hubId: HubId) => {
    const idx = HUB_ORDER.indexOf(hubId)
    return (
      <ScrollBounce key={hubId} delay={idx * 0.06}>
        <HubAccordionCard
          hubId={hubId}
          accent={accent}
          isOpen={openHubs.has(hubId)}
          onToggle={() => toggleHub(hubId)}
          justAdded={justAdded}
          onAdd={(section, name, price) => handleAdd(hubId, section, name, price)}
          onRemove={(section, name, price) => handleRemove(hubId, section, name, price)}
          onDownload={() => handleHubDownload(hubId)}
          hasBulk={(section, name) => itemHasBulk(hubId, section, name)}
          hubHasBulk={hubHasBulk(hubId)}
          cardRef={(el) => { hubRefs.current[hubId] = el }}
        />
      </ScrollBounce>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <style>{`[data-widget="whatsapp-fab"] { display: none !important; }`}</style>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1">

          <section className="px-4 md:px-8 pt-[calc(var(--nav-h)+2rem)] pb-10">
            <div className="max-w-[980px] mx-auto">
              <ScrollBounce><h1 className="abh-page-title mb-3">Pricing</h1></ScrollBounce>
              <p className="abh-tagline max-w-xl mx-auto text-center">All services across all hubs — clear prices, no surprises.</p>
              <div className="abh-divider" />
            </div>
          </section>

          <div className="max-w-[980px] mx-auto px-4 pb-16 space-y-8">

            <ScrollBounce delay={0.08}>
              <div className="no-print sticky top-[calc(var(--nav-h,74px)+0.5rem)] z-10 bg-background max-w-2xl mx-auto">
                <PricingSearchInput query={query} setQuery={setQuery} />
              </div>
            </ScrollBounce>

            {results === null && (
              <div className="space-y-5">
                <ScrollBounce delay={0.1}>
                  <div className="no-print flex flex-wrap justify-center gap-x-5 gap-y-2.5">
                    {HUB_ORDER.map(hubId => {
                      const isOpen = openHubs.has(hubId)
                      return (
                        <button
                          key={hubId}
                          onClick={() => jumpToHub(hubId)}
                          aria-pressed={isOpen}
                          aria-label={isOpen ? `Collapse ${HUBS[hubId].title}` : `Expand and jump to ${HUBS[hubId].title}`}
                          className="relative pb-1 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 rounded-sm"
                          style={isOpen ? { color: accent, ['--tw-ring-color' as any]: accent } : { ['--tw-ring-color' as any]: accent }}
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
                  <div className="no-print flex justify-center">
                    <button
                      onClick={toggleAll}
                      aria-label={allOpen ? 'Collapse all pricing hubs' : 'Expand all pricing hubs'}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2"
                      style={{ ['--tw-ring-color' as any]: accent }}
                    >
                      {allOpen ? 'Collapse all' : 'Expand all'}
                    </button>
                  </div>
                </ScrollBounce>
              </div>
            )}

            {results !== null ? (
              results.length === 0 ? (
                <ScrollBounce>
                  <div className="text-center py-12">
                    <p className="abh-body mb-4">
                      No results for <span className="font-semibold text-zinc-700 dark:text-zinc-300">"{query}"</span>
                    </p>
                    <a
                      href={noResultsWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="abh-wa-btn inline-flex px-4 py-2.5 text-xs"
                    >
                      <WhatsappLogo size={14} weight="fill" aria-hidden="true" />
                      Can't find it? Ask us on WhatsApp
                    </a>
                  </div>
                </ScrollBounce>
              ) : (
                <ScrollBounce>
                  <PricingSearchResults results={results} justAdded={justAdded} onAdd={handleAdd} />
                </ScrollBounce>
              )
            ) : (
              <>
                {/* Mobile — single stacked column, natural document order */}
                <div className="md:hidden space-y-4">
                  {HUB_ORDER.map(hubId => renderHubCard(hubId))}
                </div>

                {/* Desktop — two independent flex columns, not a shared grid */}
                <div className="hidden md:flex gap-4 items-start">
                  <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {leftColumn.map(hubId => renderHubCard(hubId))}
                  </div>
                  <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {rightColumn.map(hubId => renderHubCard(hubId))}
                  </div>
                </div>
              </>
            )}

            <ScrollBounce delay={0.24}>
              <div className="no-print flex justify-center pt-2">
                <PdfPillButton label="Download Full Pricing Catalog" onClick={handleDownload} size="lg" />
              </div>
            </ScrollBounce>

            {/* FIX: solid orange card → translucent NoticePill, same
                component used on Services/Gallery. Orange now comes from
                TOKEN.orangeText (theme-aware CSS var) instead of the raw
                BRAND.orange hex, which is what read as muddy brown on the
                dark background. */}
            {!pricingNoticeDismissed && (
              <ScrollBounce delay={0.3}>
                <div className="flex justify-center">
                  <NoticePill
                    variant="warning"
                    Icon={Lightning}
                    collapsedLabel="Pricing Info"
                    expandedLabel="Rush Fees & Bulk Pricing"
                    isDark={isDark}
                    onDismiss={() => setPricingNoticeDismissed(true)}
                  >
                    <span className="font-black" style={{ color: TOKEN.orangeText }}>Rush fee:</span> A 50% surcharge applies when same-session or urgent turnaround is required.
                    {' '}Look for the <span className="inline-flex items-center gap-0.5 font-black" style={{ color: accent }}><SealPercent size={12} weight="fill" aria-hidden="true" /> Bulk</span> tag next to a service — larger quantities get a better rate.
                  </NoticePill>
                </div>
              </ScrollBounce>
            )}

          </div>

          <CtaBar
            title="Not Sure What It'll Cost?"
            description="Send us your job and we'll quote it exactly — no guesswork, no hidden fees."
            buttonText="Get a Quick Quote"
            buttonHref={waLink(`Hi ${BIZ.name}! I'd like a quote for a job — can you help me work out the price?`)}
          />

        </main>

        <BackToTopButton visible={showBackToTop} className="no-print" />

        <Footer />
      </div>
    </>
  )
      } 
