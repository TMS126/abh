// components/pricing-page/hub-card.tsx
"use client"

import { CaretDown, CaretUp, Check, PlusCircle, MinusCircle } from '@phosphor-icons/react'
import { HUBS, type HubId } from '@/lib/data'
import { HUB_PREVIEWS } from '@/components/services-page/lib'
import { cn } from '@/lib/utils'
import { PdfPillButton } from './shared'
import { parsePrice } from './lib'

export function HubAccordionCard({
  hubId, accent, isOpen, onToggle, justAdded, onAdd, onRemove, onDownload, bulkPercentFor, cardRef,
}: {
  hubId: HubId
  accent: string
  isOpen: boolean
  onToggle: () => void
  justAdded: string | null
  onAdd: (section: string, name: string, price: string) => void
  // FIX: new — mirrors onAdd. Wire this to a dispatchRemoveFromQuote(...)
  // in index.tsx the same way handleAdd wires to dispatchAddToQuote(...).
  onRemove: (section: string, name: string, price: string) => void
  onDownload: () => void
  bulkPercentFor: (section: string, name: string, price: string) => number | null
  cardRef: (el: HTMLDivElement | null) => void
}) {
  const hub = HUBS[hubId]
  const serviceCount = hub.sections.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <div
      ref={cardRef}
      className={cn('abh-card overflow-hidden transition-shadow duration-300 hover:shadow-md', isOpen && 'border-zinc-300 dark:border-zinc-700')}
      style={{ scrollMarginTop: 'calc(var(--nav-h, 74px) + 4.5rem)' }}
    >
      {/* ── Toggle header ── */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`pricing-hub-${hubId}`}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-6 py-6 transition-colors duration-200 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900',
          isOpen && 'bg-zinc-50 dark:bg-white/[0.03]'
        )}
        style={{ ['--tw-ring-color' as any]: accent }}
      >
        <div className="min-w-0">
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 truncate tracking-tight">{hub.title}</p>
          <p className="text-[0.9rem] text-zinc-400 mt-1.5 truncate">{HUB_PREVIEWS[hubId].join(' · ')}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="w-6 text-right text-[1.05rem] font-black tabular-nums text-zinc-400 dark:text-zinc-500" aria-label={`${serviceCount} services in this hub`}>
            {serviceCount}
          </span>
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0', isOpen && 'bg-zinc-100 dark:bg-white/10')} aria-hidden="true">
            {isOpen ? <CaretUp size={16} weight="bold" className="text-zinc-500 dark:text-zinc-400" /> : <CaretDown size={16} weight="bold" className="text-zinc-400" />}
          </div>
        </div>
      </button>

      {/* ── Animated expand — grid-rows trick, content always mounted ── */}
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-in-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div id={`pricing-hub-${hubId}`} className="border-t-2 border-zinc-100 dark:border-zinc-800">
            {hub.sections.map((section, si) => {
              const sorted = [...section.items].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
              return (
                <div key={section.title} className={cn('px-6 py-7', si > 0 && 'border-t-2 border-zinc-100 dark:border-zinc-800')}>
                  {/* FIX: section title enlarged (0.78rem → 1.05rem, still
                      uppercase/tracked but reads as a real heading now,
                      e.g. "CV Services" instead of a small eyebrow tag). */}
                  <h3
                    className="text-[1.05rem] font-black uppercase tracking-[0.08em] mb-5"
                    style={{ color: accent }}
                  >
                    {section.title}
                  </h3>

                  <div className="space-y-1" role="list">
                    {sorted.map(item => {
                      const key = `${hubId}-${section.title}-${item.name}`
                      // FIX: percent no longer shown — badge is now a plain
                      // boolean flag ("bulk pricing applies to this item"),
                      // not "save 17%". Per-item surcharge/extra-fee flags
                      // aren't in the data shape passed to this component
                      // (only name/price) — wire a `hasSurcharge` flag through
                      // once that data's available and this renders the same way.
                      const hasBulk = bulkPercentFor(section.title, item.name, item.price) !== null
                      return (
                        <div
                          key={item.name}
                          role="listitem"
                          className="flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-[10px] transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-white/[0.03]"
                        >
                          <span className="text-[1.05rem] text-zinc-700 dark:text-zinc-300 flex items-center gap-2 min-w-0">
                            <span className="truncate">{item.name}</span>
                            {hasBulk && (
                              <span
                                className="text-[0.68rem] font-black uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                                aria-label="Bulk pricing available for this item"
                              >
                                Bulk pricing
                              </span>
                            )}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* FIX: new — remove from quote, sits left of price */}
                            <button
                              onClick={() => onRemove(section.title, item.name, item.price)}
                              aria-label={`Remove ${item.name} from your quote cart`}
                              title="Remove from quote"
                              className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            >
                              <MinusCircle size={18} weight="fill" aria-hidden="true" />
                            </button>

                            <span className="text-[1.05rem] font-black tabular-nums" style={{ color: accent }}>
                              {item.price}
                            </span>

                            <button
                              onClick={() => onAdd(section.title, item.name, item.price)}
                              aria-label={justAdded === key ? `${item.name} added to your quote cart` : `Add ${item.name} to your quote cart`}
                              title="Add to quote"
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110 focus-visible:outline-none focus-visible:ring-2"
                              style={{ color: justAdded === key ? '#16a34a' : accent, ['--tw-ring-color' as any]: accent }}
                            >
                              {justAdded === key ? <Check size={16} weight="bold" aria-hidden="true" /> : <PlusCircle size={18} weight="fill" aria-hidden="true" />}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* ── Turnaround ── */}
            <div className="px-6 py-4 border-t-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-white/[0.02]">
              <p className="text-[0.9rem] text-zinc-400">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Turnaround: </span>
                {hub.turnaround}
              </p>
            </div>

            {/* ── PDF pill — BLOCKED: needs shared.tsx to add hub-accent
                styling here (currently just label/onClick, no color prop) ── */}
            <div className="no-print px-6 py-6 flex justify-center border-t-2 border-zinc-100 dark:border-zinc-800">
              <PdfPillButton label="Download PDF" onClick={onDownload} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
            } 
