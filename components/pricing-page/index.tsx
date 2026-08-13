// components/pricing-page/index.tsx
'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { CaretDown, CaretUp, Lightning, SealPercent, WhatsappLogo } from '@phosphor-icons/react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ScrollBounce } from '@/components/scroll-bounce'
import { HUBS, type HubId } from '@/lib/data'
import { BRAND, BIZ, waLink } from '@/lib/brand'
import { BULK_TIERS, isScanItem, SCAN_BULK_RATE } from '@/components/quote-calculator/lib'
import { PricingSearchInput, PricingSearchResults } from './search-bar'
import { HubAccordionCard } from './hub-card'
import { PdfPillButton } from './shared'
import { HUB_ORDER, dispatchAddToQuote, bulkDiscountPercent, parsePrice, searchHubs } from './lib'
import { BackToTopButton, useBackToTop } from '@/components/back-to-top-button'
import { CtaBar } from '@/components/strip-section'

export default function PricingPage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === 'dark'
  const [openHubs, setOpenHubs] = useState<Set<HubId>>(new Set())
  const [query, setQuery] = useState('')
  const hubRefs = useRef<Partial<Record<HubId, HTMLDivElement | null>>>({})
  const showBackToTop = useBackToTop()

  const [justAdded, setJustAdded] = useState<string | null>(null)
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current) }, [])

  // FIX: single brand-blue accent everywhere on this page instead of each
  // hub pulling its own HUB_COLORS accent (blue/green/orange/teal all at
  // once). Cuts the color count way down and lets blue lead like requested.
  const accent = isDark ? BRAND.lightBlue : BRAND.blue

  const toggleHub = useCallback((id: HubId) => {
    setOpenHubs(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const allOpen = openHubs.size === HUB_ORDER.length
  const toggleAll = useCallback(() => setOpenHubs(allOpen ? new Set() : new Set(HUB_ORDER)), [allOpen])

  const jumpToHub = useCallback((hubId: HubId) => {
    setOpenHubs(prev => {
      if (prev.has(hubId)) return prev
      const next = new Set(prev)
      next.add(hubId)
      return next
    })
    requestAnimationFrame(() => hubRefs.current[hubId]?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  const handleAdd = useCallback((hubId: HubId, sectionTitle: string, name: string, price: string) => {
    dispatchAddToQuote(hubId, sectionTitle, name, price)
    const key = `${hubId}-${sectionTitle}-${name}`
    setJustAdded(key)
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current)
    addedTimerRef.current = setTimeout(() => setJustAdded(null), 900)
  }, [])

  const results = useMemo(() => (query.trim() ? searchHubs(query, () => accent) : null), [query, isDark])

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
      <style>{`[data-widget="whatsapp-fab"] { display: none !important; }`}</style>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1">

          {/* FIX: max-w-2xl → 980px shell, matching the contact page's
              container width instead of a narrow mobile-width column. */}
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
                          className="relative pb-1 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150"
                          style={isOpen ? { color: accent } : undefined}
                        >
                          {HUBS[hubId].title}
                          <span
                            className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full transition-opacity duration-200"
                            style={{ backgroundColor: accent, opacity: isOpen ? 1 : 0 }}
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-[14px] text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-150 active:scale-95 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
                    >
                      {allOpen ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
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
              // FIX: single stacked column → 2-col grid at md+ so hub cards
              // sit side by side on desktop instead of one long thin list.
              <div className="grid md:grid-cols-2 gap-4 items-start">
                {HUB_ORDER.map((hubId, idx) => (
                  <ScrollBounce key={hubId} delay={idx * 0.06}>
                    <HubAccordionCard
                      hubId={hubId}
                      accent={accent}
                      isOpen={openHubs.has(hubId)}
                      onToggle={() => toggleHub(hubId)}
                      justAdded={justAdded}
                      onAdd={(section, name, price) => handleAdd(hubId, section, name, price)}
                      onDownload={() => handleHubDownload(hubId)}
                      bulkPercentFor={(section, name, price) =>
                        bulkDiscountPercent(hubId, section, name, parsePrice(price), BULK_TIERS, isScanItem, SCAN_BULK_RATE)
                      }
                      cardRef={(el) => { hubRefs.current[hubId] = el }}
                    />
                  </ScrollBounce>
                ))}
              </div>
            )}

            <ScrollBounce delay={0.24}>
              <div className="no-print flex justify-center pt-2">
                <PdfPillButton label="Download Full Pricing Catalog" onClick={handleDownload} size="lg" />
              </div>
            </ScrollBounce>

            {/* FIX: was a loud orange-tinted card (colored bg + colored
                shadow) plus a separate green tip line. Now one neutral
                abh-card, orange and green trimmed down to small icon-only
                accents so blue stays dominant on the page. */}
            <ScrollBounce delay={0.3}>
              <div className="abh-card px-5 py-5 space-y-3">
                <p className="text-xs flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300">
                  <Lightning size={14} weight="fill" className="shrink-0 mt-0.5" style={{ color: BRAND.orange }} />
                  <span><span className="font-black">Rush fee:</span> A 50% surcharge applies when same-session or urgent turnaround is required.</span>
                </p>
                <p className="text-xs flex items-start gap-1.5 text-zinc-600 dark:text-zinc-300">
                  <SealPercent size={14} weight="fill" className="shrink-0 mt-0.5" style={{ color: accent }} />
                  <span>Look for the % badge next to a service — that's how much bulk pricing can save you.</span>
                </p>
              </div>
            </ScrollBounce>

          </div>

          {/* FIX: page had no CTA bar. Added the shared CtaBar (same one
              Home/Services use) with copy specific to pricing/quotes. */}
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
