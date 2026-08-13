// components/pricing-page/shared.tsx
"use client"

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { SealPercent, FilePdf } from '@phosphor-icons/react'

// ── Bulk pricing flag ──
// FIX: no percentage shown anymore — just flags that bulk pricing applies
// to this item. The actual bulkDiscountPercent() math still lives in
// lib.ts for wherever a real number needs to show (e.g. quote cart totals).
export function BulkBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[0.68rem] font-black uppercase tracking-wide px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
      aria-label="Bulk pricing available for this item"
    >
      <SealPercent size={11} weight="fill" aria-hidden="true" />
      Bulk pricing
    </span>
  )
}

// ── PDF download pill ──
const ADOBE_RED_LIGHT = '#EC1C24'
const ADOBE_RED_DARK = '#F0857D'
// FIX: new — solid hover state for the red (full-catalog) variant only.
// Darker than rest-state red, white text on top clears WCAG AA.
const ADOBE_RED_HOVER_LIGHT = '#A9121A'
const ADOBE_RED_HOVER_DARK = '#C23A33'

export function PdfPillButton({
  label, onClick, size = 'sm', color,
}: {
  label: string
  onClick: () => void
  size?: 'sm' | 'lg'
  /** Pass a hub accent for per-hub download buttons. Omit for the full-catalog
   *  button — that one is always red and never takes a hub color, even on hover. */
  color?: string
}) {
  const { resolvedTheme } = useTheme()
  const [hovered, setHovered] = useState(false)
  const isDark = resolvedTheme === 'dark'
  const isLg = size === 'lg'
  const isHub = Boolean(color)

  const restColor = isHub ? color! : (isDark ? ADOBE_RED_DARK : ADOBE_RED_LIGHT)
  const hoverSolid = isDark ? ADOBE_RED_HOVER_DARK : ADOBE_RED_HOVER_LIGHT
  const showSolidHover = !isHub && hovered

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-2 rounded-[14px] font-black transition-all duration-150 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 active:shadow-sm active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900 ${
        isLg ? 'px-5 py-3 text-[1.05rem]' : 'px-4 py-2 text-[0.9rem]'
      }`}
      style={{
        color: showSolidHover ? '#ffffff' : restColor,
        borderColor: showSolidHover ? hoverSolid : `${restColor}35`,
        backgroundColor: showSolidHover ? hoverSolid : `${restColor}12`,
        border: '1px solid',
        ['--tw-ring-color' as any]: restColor,
      }}
    >
      <FilePdf size={isLg ? 20 : 16} weight="fill" aria-hidden="true" />
      {label}
    </button>
  )
} 
