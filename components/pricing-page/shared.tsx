"use client"

import { SealPercent, FilePdf } from '@phosphor-icons/react'
import { ADOBE_PDF_RED } from './lib'

// ── Bulk savings badge ──
export function BulkBadge({ percent }: { percent: number }) {
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

// ── PDF download pill ──
// 14px radius, shadow pops on hover, presses in on active tap.
export function PdfPillButton({ label, onClick, size = 'sm' }: { label: string; onClick: () => void; size?: 'sm' | 'lg' }) {
  const isLg = size === 'lg'
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-2 rounded-[14px] font-black transition-all duration-150 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:shadow-sm active:translate-y-0 ${
        isLg ? 'px-5 py-3 text-sm' : 'px-4 py-2 text-xs'
      }`}
      style={{ color: ADOBE_PDF_RED, borderColor: `${ADOBE_PDF_RED}35`, backgroundColor: `${ADOBE_PDF_RED}0e`, border: '1px solid' }}
    >
      <FilePdf size={isLg ? 20 : 16} weight="fill" />
      {label}
    </button>
  )
}
