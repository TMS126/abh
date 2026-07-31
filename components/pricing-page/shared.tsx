"use client"

import { useTheme } from 'next-themes'
import { SealPercent, FilePdf } from '@phosphor-icons/react'

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
// Light mode keeps true Adobe red; dark mode softens to a muted rose so it
// doesn't read as an error/alert against the dark navy card background.
const PDF_RED_LIGHT = '#EC1C24'
const PDF_RED_DARK  = '#F0857D'

export function PdfPillButton({ label, onClick, size = 'sm' }: { label: string; onClick: () => void; size?: 'sm' | 'lg' }) {
  const { resolvedTheme } = useTheme()
  const isLg = size === 'lg'
  const color = resolvedTheme === 'dark' ? PDF_RED_DARK : PDF_RED_LIGHT

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-2 rounded-[14px] font-black transition-all duration-150 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:shadow-sm active:translate-y-0 ${
        isLg ? 'px-5 py-3 text-sm' : 'px-4 py-2 text-xs'
      }`}
      style={{ color, borderColor: `${color}35`, backgroundColor: `${color}12`, border: '1px solid' }}
    >
      <FilePdf size={isLg ? 20 : 16} weight="fill" />
      {label}
    </button>
  )
} 
