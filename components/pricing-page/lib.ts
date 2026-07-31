import { HUBS, type HubId } from '@/lib/data'

// ── Constants ──
export const HUB_ORDER: HubId[] = ['print', 'doc', 'design', 'eservice', 'tech']
export const ADOBE_PDF_RED = '#EC1C24'

// ── Price parsing ──
export function parsePrice(price: string): number {
  const match = price.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

// ── Quote calculator bridge ──
export function dispatchAddToQuote(hubId: HubId, sectionTitle: string, name: string, price: string) {
  window.dispatchEvent(new CustomEvent('abh:add-to-quote', { detail: { hubId, sectionTitle, name, price } }))
}

// ── Bulk discount lookup ──
export function bulkDiscountPercent(
  hubId: HubId, sectionTitle: string, itemName: string, baseAmount: number,
  bulkTiers: Record<string, { rate: number }[]>, isScanItem: (n: string) => boolean, scanBulkRate: number
): number | null {
  if (baseAmount <= 0) return null
  const itemId = `${hubId}-${sectionTitle}-${itemName}`
  const tiers = bulkTiers[itemId]
  if (tiers && tiers.length > 0) {
    const bestRate = Math.min(...tiers.map(t => t.rate))
    return Math.round(((baseAmount - bestRate) / baseAmount) * 100)
  }
  if (isScanItem(itemName)) {
    return Math.round(((baseAmount - scanBulkRate) / baseAmount) * 100)
  }
  return null
}

// ── Search ──
export type Result = {
  hubId: HubId
  hubTitle: string
  section: string
  name: string
  price: string
  accent: string
}

export function searchHubs(query: string, accentFor: (id: HubId) => string): Result[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out: Result[] = []
  HUB_ORDER.forEach(hubId => {
    const hub = HUBS[hubId]
    hub.sections.forEach(section => {
      section.items.forEach(item => {
        if (
          item.name.toLowerCase().includes(q) ||
          item.price.toLowerCase().includes(q) ||
          section.title.toLowerCase().includes(q) ||
          hub.title.toLowerCase().includes(q)
        ) {
          out.push({ hubId, hubTitle: hub.title, section: section.title, name: item.name, price: item.price, accent: accentFor(hubId) })
        }
      })
    })
  })
  return out.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
  }
