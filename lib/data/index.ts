// lib/data/index.ts

import type { HubId, Hub } from './types'
import { printHub } from './hubs/print'
import { docHub } from './hubs/doc'
import { designHub } from './hubs/design'
import { eserviceHub } from './hubs/eservice'
import { techHub } from './hubs/tech'

export * from './types'
export * from './turnaround'
export * from './projects'

export const HUBS: Record<HubId, Hub> = {
  print: printHub,
  doc: docHub,
  design: designHub,
  eservice: eserviceHub,
  tech: techHub,
}

export const CURRENCY_SYMBOL = 'R'

export type PriceUnit = 'flat' | 'page' | 'hr'

export interface PriceEntry {
  rate: number
  unit: PriceUnit
}

// Parses ServiceItem.price strings (e.g. "R20", "R5/page", "R150/hr") into
// a structured PriceEntry. If a price string doesn't match the expected
// pattern, this logs a dev-only warning instead of silently producing a
// wrong number — a malformed price should be loud, not invisible.
const PRICE_PATTERN = /^R\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(page|hr))?$/i

function parsePrice(raw: string): PriceEntry {
  const match = raw.trim().match(PRICE_PATTERN)
  if (!match) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[lib/data] Could not parse price "${raw}" — expected formats like "R20", "R5/page", or "R150/hr". Defaulting to rate 0.`
      )
    }
    return { rate: 0, unit: 'flat' }
  }
  const rate = parseFloat(match[1])
  const unit = (match[2]?.toLowerCase() as PriceUnit) || 'flat'
  return { rate, unit }
}

// Formats a PriceEntry back into display text, e.g. { rate: 5, unit: 'page' } -> "R5/page"
export function formatPrice(entry: PriceEntry): string {
  const suffix = entry.unit === 'flat' ? '' : `/${entry.unit}`
  return `${CURRENCY_SYMBOL}${entry.rate}${suffix}`
}

// ── SINGLE SOURCE OF TRUTH ────────────────────────────────────────────────
// PRICING is now DERIVED, not hand-typed. It walks HUBS — the same data
// every hub page, modal, and quote calculator already reads from — and
// parses each ServiceItem.price string into a structured entry. There is
// no second place to edit a price: change it on the ServiceItem inside
// the relevant lib/data/hubs/*.ts file, and this updates automatically,
// with zero risk of the two ever disagreeing again.
//
// Generic over the Hub/HubSection/ServiceItem interfaces in types.ts —
// doesn't hardcode any hub-specific item names, so it's correct for all
// five hubs regardless of their individual contents.
//
// Keyed by [hubId][sectionTitle][itemName] rather than a flat
// [hubId][itemName]. This is NOT optional — item names are not unique
// within a hub across sections (confirmed: Print Hub's "Black & White"
// and "Colour" both appear under its "Printing" section, R5/page &
// R8/page, AND separately under "Copying", R3/page & R5/page — a flat
// lookup would let one silently overwrite the other).
function derivePricing(hubs: Record<HubId, Hub>): Record<HubId, Record<string, Record<string, PriceEntry>>> {
  const result = {} as Record<HubId, Record<string, Record<string, PriceEntry>>>
  for (const hubId of Object.keys(hubs) as HubId[]) {
    const bySection: Record<string, Record<string, PriceEntry>> = {}
    for (const section of hubs[hubId].sections) {
      const byItem: Record<string, PriceEntry> = {}
      for (const item of section.items) {
        byItem[item.name] = parsePrice(item.price)
      }
      bySection[section.title] = byItem
    }
    result[hubId] = bySection
  }
  return result
}

/**
 * The live pricing table, generated fresh from HUBS at module load. Never
 * hand-edit a value here — there is nothing to edit; it isn't static data.
 * Shape: PRICING[hubId][sectionTitle][itemName] -> { rate, unit }
 *
 * NOTE — SHAPE CHANGE from the old hand-typed version: this used to be a
 * flat PRICING[hubId][itemName] object. That flat shape is what let the
 * old data drift silently (see the SASSA name-mismatch example) and is
 * unsafe given the cross-section name collisions above. If anything in
 * the codebase still reads PRICING with the old flat two-level access
 * (e.g. `PRICING.print['B&W Print']`), it needs updating to either the
 * new three-level path or, better, the getServicePrice() helper below.
 */
export const PRICING = derivePricing(HUBS)

/**
 * Convenience lookup: "what does this exact service cost". Searches every
 * section in the given hub for an item with this exact name. Returns
 * undefined if not found — treat that as "unpriced," not as "free."
 *
 * If the same item name exists in more than one section of the hub, pass
 * sectionTitle to disambiguate. Without it, the first match is returned
 * and a dev-mode warning is logged so the ambiguity is visible rather
 * than silently picking (possibly) the wrong one.
 */
export function getServicePrice(hubId: HubId, itemName: string, sectionTitle?: string): PriceEntry | undefined {
  const hub = PRICING[hubId]
  if (!hub) return undefined

  if (sectionTitle) return hub[sectionTitle]?.[itemName]

  const matches = Object.entries(hub).filter(([, items]) => itemName in items)
  if (matches.length > 1 && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[lib/data] getServicePrice("${hubId}", "${itemName}") is ambiguous — found in sections: ${matches.map(([title]) => title).join(', ')}. Pass sectionTitle to disambiguate.`
    )
  }
  return matches[0]?.[1]?.[itemName]
  }
