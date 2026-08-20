// components/pricing-page/hub-card.tsx
'use client'

import { CaretDown, CaretUp, DownloadSimple, Plus, Check, SealPercent } from '@phosphor-icons/react'
import { HUBS, type HubId } from '@/lib/data'
import { parsePrice } from './lib'

const IMPORTANT_NOTE = "No hidden fees — the price shown is the price you pay."

// ── Shared section header (bold label + short divider) ────────────────────────

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="mb-2.5">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-200">
        {title}
      </p>
      <span
        className="block w-8 h-[3px] rounded-full mt-1.5"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    </div>
  )
}

// ── Shared round download button ───────────────────────────────────────────────

function DownloadPill({ onClick, size = 36 }: { onClick: () => void; size?: number }) {
  return (
    <button
      onClick={onClick}
      aria-label="Download hub PDF"
      className="rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 transition-all duration-150 hover:!bg-red-500 hover:!border-red-500 hover:!text-white active:scale-90 shrink-0"
      style={{ width: size, height: size }}
    >
      <DownloadSimple size={Math.round(size * 0.48)} weight="bold" aria-hidden="true" />
    </button>
  )
}

// ── Shared item row ───────────────────────────────────────────────────────────

function ServiceRow({
  hubId,
  section,
  item,
  accent,
  justAdded,
  isBulk,
  onAdd,
}: {
  hubId: HubId
  section: string
  item: { name: string; price: string }
  accent: string
  justAdded: string | null
  isBulk: boolean
  onAdd: (section: string, name: string, price: string) => void
}) {
  const key = `${hubId}-${section}-${item.name}`
  const added = justAdded === key

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 group border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base text-zinc-700 dark:text-zinc-300 truncate">
          {item.name}
        </span>
        {isBulk && (
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: `${accent}15`, color: accent }}
          >
            <SealPercent size={9} weight="fill" aria-hidden="true" />
            Bulk
          </span>
        )}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-base font-black text-zinc-900 dark:text-white tabular-nums">
          {item.price}
        </span>
        <button
          onClick={() => onAdd(section, item.name, item.price)}
          aria-label={added ? 'Added to quote' : `Add ${item.name} to quote`}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          style={{
            backgroundColor: added ? accent : `${accent}18`,
            color: added ? 'white' : accent,
          }}
        >
          {added
            ? <Check size={11} weight="bold" aria-hidden="true" />
            : <Plus size={11} weight="bold" aria-hidden="true" />
          }
        </button>
      </div>
    </div>
  )
}

// ── HubCompactCard — desktop 5-column selector card (image 1) ─────────────────

interface HubCompactCardProps {
  hubId: HubId
  isSelected: boolean
  isDark: boolean
  accent: string
  hubHasBulk: boolean
  onSelect: () => void
}

export function HubCompactCard({
  hubId,
  isSelected,
  isDark,
  accent,
  hubHasBulk,
  onSelect,
}: HubCompactCardProps) {
  const hub = HUBS[hubId]
  const hubColor = hub.tagStyle.color
  const total = hub.sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <button
      onClick={onSelect}
      aria-pressed={isSelected}
      className={[
        'w-full text-left rounded-2xl border px-4 py-4 transition-all duration-150',
        'bg-white dark:bg-zinc-900 hover:shadow-sm active:scale-[0.98]',
        isSelected
          ? 'shadow-sm ring-1 rounded-b-none border-b-0 relative z-10'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
      ].join(' ')}
      style={
        isSelected
          ? { borderColor: hubColor, ['--tw-ring-color' as string]: hubColor }
          : undefined
      }
    >
      {/* Hub name */}
      <p
        className="text-sm font-bold mb-2.5 truncate"
        style={{ color: hubColor, filter: isDark ? 'brightness(1.6) saturate(1.1)' : undefined }}
      >
        {hub.title}
      </p>

      {/* Preview bullets */}
      <ul className="space-y-1 mb-3">
        {hub.previews.slice(0, 3).map(p => (
          <li key={p} className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{p}</span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">{total} services</span>
        {hubHasBulk && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400">
            <SealPercent size={10} weight="fill" aria-hidden="true" />
            Bulk
          </span>
        )}
      </div>
    </button>
  )
}

// ── HubExpandedPanel — desktop full-width expanded panel (image 2) ────────────

interface HubExpandedPanelProps {
  hubId: HubId
  accent: string
  isDark: boolean
  justAdded: string | null
  onAdd: (section: string, name: string, price: string) => void
  onDownload: () => void
  hasBulk: (section: string, name: string) => boolean
}

export function HubExpandedPanel({
  hubId,
  accent,
  isDark,
  justAdded,
  onAdd,
  onDownload,
  hasBulk,
}: HubExpandedPanelProps) {
  const hub = HUBS[hubId]
  const hubColor = hub.tagStyle.color

  return (
    <div className="rounded-b-2xl rounded-t-none border border-t-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden -mt-px">

      {/* Panel header — image 2 large title */}
      <div className="px-8 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
        <h2
          className="text-3xl font-black tracking-tight mb-1"
          style={{ color: hubColor, filter: isDark ? 'brightness(1.6) saturate(1.1)' : undefined }}
        >
          {hub.title}
        </h2>
        <p className="text-base text-zinc-400">
          {hub.previews.join(' · ')}
        </p>
      </div>

      {/* Sections */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {hub.sections.map(section => {
          const sorted = [...section.items].sort(
            (a, b) => parsePrice(a.price) - parsePrice(b.price)
          )
          return (
            <div key={section.title} className="px-8 py-5">
              <SectionHeader title={section.title} color={hubColor} />
              {sorted.map(item => (
                <ServiceRow
                  key={item.name}
                  hubId={hubId}
                  section={section.title}
                  item={item}
                  accent={accent}
                  justAdded={justAdded}
                  isBulk={hasBulk(section.title, item.name)}
                  onAdd={onAdd}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Panel footer */}
      <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30">
        <p className="text-sm text-zinc-400">{IMPORTANT_NOTE}</p>
        <DownloadPill onClick={onDownload} size={38} />
      </div>
    </div>
  )
}

// ── HubAccordionCard — mobile full-width accordion ────────────────────────────

interface HubAccordionCardProps {
  hubId: HubId
  accent: string
  isOpen: boolean
  onToggle: () => void
  justAdded: string | null
  onAdd: (section: string, name: string, price: string) => void
  onRemove: (section: string, name: string, price: string) => void
  onDownload: () => void
  hasBulk: (section: string, name: string) => boolean
  hubHasBulk: boolean
  cardRef: (el: HTMLDivElement | null) => void
}

export function HubAccordionCard({
  hubId,
  accent,
  isOpen,
  onToggle,
  justAdded,
  onAdd,
  onDownload,
  hasBulk,
  hubHasBulk,
  cardRef,
}: HubAccordionCardProps) {
  const hub = HUBS[hubId]
  const hubColor = hub.tagStyle.color
  const total = hub.sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div
      ref={cardRef}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
    >
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-1 h-8 rounded-full shrink-0"
            style={{ backgroundColor: hubColor }}
          />
          <div className="min-w-0">
            <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
              {hub.title}
            </p>
            <p className="text-sm text-zinc-400 mt-0.5">
              {total} services{hubHasBulk ? ' · Bulk deals available' : ''}
            </p>
          </div>
        </div>
        {isOpen
          ? <CaretUp size={14} className="text-zinc-400 shrink-0" aria-hidden="true" />
          : <CaretDown size={14} className="text-zinc-400 shrink-0" aria-hidden="true" />
        }
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {hub.sections.map(section => {
              const sorted = [...section.items].sort(
                (a, b) => parsePrice(a.price) - parsePrice(b.price)
              )
              return (
                <div key={section.title} className="px-4 py-3">
                  <SectionHeader title={section.title} color={hubColor} />
                  {sorted.map(item => (
                    <ServiceRow
                      key={item.name}
                      hubId={hubId}
                      section={section.title}
                      item={item}
                      accent={accent}
                      justAdded={justAdded}
                      isBulk={hasBulk(section.title, item.name)}
                      onAdd={onAdd}
                    />
                  ))}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30">
            <p className="text-xs text-zinc-400">{IMPORTANT_NOTE}</p>
            <DownloadPill onClick={onDownload} size={32} />
          </div>
        </div>
      )}
    </div>
  )
                          } 
