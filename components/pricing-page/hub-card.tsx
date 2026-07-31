"use client"

import { CaretDown, CaretUp, Check, PlusCircle } from '@phosphor-icons/react'
import { HUBS, type HubId } from '@/lib/data'
import { HubIcon } from '@/components/services-page/shared'
import { HUB_PREVIEWS } from '@/components/services-page/lib'
import { cn } from '@/lib/utils'
import { BulkBadge, PdfPillButton } from './shared'
import { parsePrice } from './lib'

export function HubAccordionCard({
  hubId, accent, isOpen, onToggle, justAdded, onAdd, onDownload, bulkPercentFor, cardRef,
}: {
  hubId: HubId
  accent: string
  isOpen: boolean
  onToggle: () => void
  justAdded: string | null
  onAdd: (section: string, name: string, price: string) => void
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
        className={cn('w-full flex items-center justify-between gap-3 px-5 py-5 transition-colors duration-200 text-left', isOpen && 'bg-zinc-50 dark:bg-white/[0.03]')}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <HubIcon id={hubId} size={22} color={accent} />
          <div className="min-w-0">
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 truncate">{hub.title}</p>
            <p className="text-xs text-zinc-400 mt-1 truncate">{HUB_PREVIEWS[hubId].join(' · ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="w-6 text-right text-sm font-black tabular-nums text-zinc-400 dark:text-zinc-500" aria-label={`${serviceCount} services`}>
            {serviceCount}
          </span>
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0', isOpen && 'bg-zinc-100 dark:bg-white/10')}>
            {isOpen ? <CaretUp size={16} weight="bold" className="text-zinc-500 dark:text-zinc-400" /> : <CaretDown size={16} weight="bold" className="text-zinc-400" />}
          </div>
        </div>
      </button>

      {/* ── Animated expand — grid-rows trick, content always mounted ── */}
      <div className={cn('grid transition-[grid-template-rows] duration-300 ease-in-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div id={`pricing-hub-${hubId}`} className="border-t border-zinc-100 dark:border-zinc-800">
            {hub.sections.map((section, si) => {
              const sorted = [...section.items].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
              return (
                <div key={section.title} className={cn('px-5 py-5', si > 0 && 'border-t border-zinc-100 dark:border-zinc-800')}>
                  {/* ── Category pill ── */}
                  <span
                    className="inline-block text-[0.72rem] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3.5"
                    style={{ color: accent, backgroundColor: `${accent}12` }}
                  >
                    {section.title}
                  </span>

                  <div className="space-y-2.5">
                    {sorted.map(item => {
                      const key = `${hubId}-${section.title}-${item.name}`
                      const pct = bulkPercentFor(section.title, item.name, item.price)
                      return (
                        <div key={item.name} className="flex items-center justify-between gap-3 py-1.5 px-2 -mx-2 rounded-[10px] transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                          <span className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 min-w-0">
                            <span className="truncate">{item.name}</span>
                            {pct !== null && <BulkBadge percent={pct} />}
                          </span>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-sm font-black" style={{ color: accent }}>{item.price}</span>
                            <button
                              onClick={() => onAdd(section.title, item.name, item.price)}
                              aria-label={`Add ${item.name} to quote`}
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90 hover:scale-110"
                              style={{ color: justAdded === key ? '#16a34a' : accent }}
                            >
                              {justAdded === key ? <Check size={16} weight="bold" /> : <PlusCircle size={18} weight="fill" />}
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
            <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-white/[0.02]">
              <p className="text-xs text-zinc-400">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Turnaround: </span>
                {hub.turnaround}
              </p>
            </div>

            {/* ── PDF pill ── */}
            <div className="no-print px-5 py-5 flex justify-center border-t border-zinc-100 dark:border-zinc-800">
              <PdfPillButton label="Download PDF" onClick={onDownload} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
