// components/pricing-page/hub-card.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { CaretDown, CaretUp, DownloadSimple, Plus, Check, SealPercent, Clock } from '@phosphor-icons/react'
import { HUBS, type HubId } from '@/lib/data'
import { parsePrice } from './lib'

// ── Turnaround times per hub ──────────────────────────────────────────────────

const TURNAROUND: Record<HubId, { label: string; detail: string }> = {
  print: {
    label: 'Ready while you wait',
    detail: 'B&W & colour prints done on the spot. Photos may take 5–10 min.',
  },
  doc: {
    label: '15 min – 1 hour',
    detail: 'Typing, CVs and letters done same session. Laminating is instant.',
  },
  design: {
    label: '1–3 business days',
    detail: 'Logos take 2–3 days. Flyers, posts and cards are usually 1 day.',
  },
  eservice: {
    label: 'Same session',
    detail: 'Most applications and checks done while you wait. Complex cases may vary.',
  },
  tech: {
    label: '30 min – same day',
    detail: 'Software installs are quick. Virus removal and OS installs may take a few hours.',
  },
}

// ── Shared section header ──────────────────────────────────────────────────────

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="mb-2.5">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-200">
        {title}
      </p>
      <span
        className="block w-8 h-[3px] rounded-full mt-1.5 transition-colors duration-200"
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
      className="rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 transition-all duration-200 hover:bg-red-500 hover:border-red-500 hover:text-white active:scale-90 shrink-0"
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
  alwaysShowAdd = false,
}: {
  hubId: HubId
  section: string
  item: { name: string; price: string }
  accent: string
  justAdded: string | null
  isBulk: boolean
  onAdd: (section: string, name: string, price: string) => void
  alwaysShowAdd?: boolean
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
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 transition-colors duration-200"
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
          className={[
            'w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90',
            alwaysShowAdd
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          ].join(' ')}
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

// ── Turnaround footer strip ───────────────────────────────────────────────────

function TurnaroundStrip({ hubId, hubColor }: { hubId: HubId; hubColor: string }) {
  const t = TURNAROUND[hubId]
  return (
    <div className="flex items-start gap-2.5 px-5 py-3.5 bg-zinc-50/80 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
      <Clock
        size={14}
        className="shrink-0 mt-0.5"
        style={{ color: hubColor }}
        aria-hidden="true"
        weight="bold"
      />
      <div className="min-w-0">
        <span className="text-xs font-black" style={{ color: hubColor }}>
          {t.label}
        </span>
        <span className="text-xs text-zinc-400 ml-1.5">{t.detail}</span>
      </div>
    </div>
  )
}

// ── HubCompactCard — desktop 5-column selector card ───────────────────────────

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
        'w-full text-left rounded-2xl border px-4 py-4 transition-all duration-200',
        'bg-white dark:bg-zinc-900 active:scale-[0.98]',
        isSelected
          ? 'shadow-sm ring-1 rounded-b-none border-b-0 relative z-10'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm',
      ].join(' ')}
      style={
        isSelected
          ? { borderColor: hubColor, ['--tw-ring-color' as string]: hubColor }
          : undefined
      }
    >
      {/* Hub name */}
      <p
        className="text-sm font-bold mb-2.5 truncate transition-colors duration-200"
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

      {/* Footer — service count accented when selected */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold transition-colors duration-200"
          style={isSelected ? { color: hubColor } : { color: '#a1a1aa' }}
        >
          {total} services
        </span>
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

// ── HubExpandedPanel — desktop: two separate cards showing relation ────────────
//   Left card  = hub identity (title, description, turnaround)
//   Right card = services list
//   Connected by a subtle visual bridge (shared top border color + connector dot)

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
  const total = hub.sections.reduce((n, s) => n + s.items.length, 0)
  const turnaround = TURNAROUND[hubId]

  // Animate in on hubId change
  const [visible, setVisible] = useState(false)
  const prevHub = useRef<HubId | null>(null)

  useEffect(() => {
    if (prevHub.current !== hubId) {
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 30)
      prevHub.current = hubId
      return () => clearTimeout(t)
    }
  }, [hubId])

  return (
    <div
      className="grid grid-cols-[280px_1fr] gap-0 -mt-px"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 220ms ease, transform 220ms ease',
      }}
      aria-live="polite"
    >
      {/* ── Left: Hub identity card ── */}
      <div
        className="rounded-bl-2xl border border-t-0 border-r-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col"
        style={{ borderLeftColor: hubColor, borderLeftWidth: 3 }}
      >
        {/* Connector dot bridging compact card → identity card */}
        <div className="px-6 pt-6 pb-4 flex-1">
          {/* Hub accent line */}
          <span
            className="block w-10 h-1 rounded-full mb-4"
            style={{ backgroundColor: hubColor }}
            aria-hidden="true"
          />

          <h2
            className="text-2xl font-black tracking-tight mb-1 leading-tight"
            style={{ color: hubColor, filter: isDark ? 'brightness(1.6) saturate(1.1)' : undefined }}
          >
            {hub.title}
          </h2>

          {/* Service count — accented */}
          <p className="text-sm font-bold mb-4" style={{ color: hubColor, opacity: 0.7 }}>
            {total} services
          </p>

          {/* Previews */}
          <ul className="space-y-1.5 mb-6">
            {hub.previews.map(p => (
              <li key={p} className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: hubColor, opacity: 0.5 }}
                />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{p}</span>
              </li>
            ))}
          </ul>

          {/* Download */}
          <div className="flex items-center gap-2 mt-auto">
            <DownloadPill onClick={onDownload} size={34} />
            <span className="text-xs text-zinc-400">Download PDF</span>
          </div>
        </div>

        {/* Turnaround — bottom of identity card */}
        <div
          className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 rounded-bl-2xl"
          style={{ borderLeftColor: hubColor }}
        >
          <div className="flex items-start gap-2">
            <Clock size={13} weight="bold" style={{ color: hubColor }} className="shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-black" style={{ color: hubColor }}>{turnaround.label}</p>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{turnaround.detail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Services card ── */}
      <div className="rounded-br-2xl border border-t-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
        {/* Section list — scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[460px]">
          {hub.sections.map(section => {
            const sorted = [...section.items].sort(
              (a, b) => parsePrice(a.price) - parsePrice(b.price)
            )
            return (
              <div key={section.title} className="px-6 py-4">
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
                    alwaysShowAdd={false}
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* Relation bridge footer */}
        <div className="flex items-center gap-2 px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: hubColor }}
            aria-hidden="true"
          />
          <p className="text-xs text-zinc-400">
            Prices are fixed — no hidden fees.
          </p>
        </div>
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
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-shadow duration-200"
      style={isOpen ? { borderColor: hubColor } : undefined}
    >
      {/* Toggle header */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-1 h-8 rounded-full shrink-0 transition-colors duration-200"
            style={{ backgroundColor: hubColor }}
          />
          <div className="min-w-0">
            <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
              {hub.title}
            </p>
            <p className="text-sm mt-0.5" style={{ color: isOpen ? hubColor : '#a1a1aa' }}>
              <span className="font-bold">{total} services</span>
              {hubHasBulk ? ' · Bulk deals available' : ''}
            </p>
          </div>
        </div>
        {isOpen
          ? <CaretUp size={14} className="text-zinc-400 shrink-0 transition-transform duration-200" aria-hidden="true" />
          : <CaretDown size={14} className="text-zinc-400 shrink-0 transition-transform duration-200" aria-hidden="true" />
        }
      </button>

      {/* Expanded content — simple height animation via max-height */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '9999px' : '0px' }}
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <>
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
                          alwaysShowAdd={true}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>

              {/* Turnaround — mobile */}
              <TurnaroundStrip hubId={hubId} hubColor={hubColor} />

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: hubColor }}
                    aria-hidden="true"
                  />
                  <p className="text-xs text-zinc-400">No hidden fees.</p>
                </div>
                <DownloadPill onClick={onDownload} size={32} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
 
