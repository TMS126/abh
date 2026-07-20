import { HUBS, HubId } from "@/lib/data"

// ─── Hub order ────────────────────────────────────────────────────────────────
export const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

// ─── Bulk pricing tiers ─────────────────────────────────────────────────────
export const BULK_TIERS: Record<string, { min: number; rate: number }[]> = {
  "print-Copying-Black & White":        [{ min: 10, rate: 2 }, { min: 100, rate: 1 }],
  "print-Copying-Colour":               [{ min: 10, rate: 4 }, { min: 50,  rate: 3 }],
  "print-Printing-Black & White":       [{ min: 10, rate: 4 }, { min: 100, rate: 3 }],
  "print-Printing-Colour":              [{ min: 10, rate: 7 }, { min: 50,  rate: 5 }],
  "doc-Typing + Printing-Black & White":[{ min: 10, rate: 10 }],
  "doc-Typing + Printing-Colour":       [{ min: 10, rate: 11 }],
}

export const SCAN_BULK_MIN  = 5
export const SCAN_BULK_RATE = 4
export function isScanItem(name: string) {
  return /scan/i.test(name)
}

export const SECTION_LABEL: Record<string, string> = {
  "Printing": "Print", "Copying": "Copy", "Typing + Printing": "Typing",
}
export function getDisplayName(sectionTitle: string, name: string): string {
  if ((name === "Black & White" || name === "Colour") && SECTION_LABEL[sectionTitle])
    return `${name} ${SECTION_LABEL[sectionTitle]}`
  return name
}

export function getEffectiveRate(id: string, name: string, qty: number, fallback: number): number {
  const tiers = BULK_TIERS[id]
  if (tiers) {
    let rate = fallback
    for (const t of tiers) { if (qty >= t.min) rate = t.rate }
    return rate
  }
  if (isScanItem(name) && qty >= SCAN_BULK_MIN) return Math.min(fallback, SCAN_BULK_RATE)
  return fallback
}

export function getNextTier(id: string, name: string, qty: number) {
  const tiers = BULK_TIERS[id]
  if (tiers) return tiers.find(t => qty < t.min) ?? null
  if (isScanItem(name) && qty < SCAN_BULK_MIN) return { min: SCAN_BULK_MIN, rate: SCAN_BULK_RATE }
  return null
}

export function getBulkHint(id: string, name: string, qty: number, effRate: number, baseRate: number): string | null {
  const next = getNextTier(id, name, qty)
  const discounted = effRate < baseRate
  if (next) {
    const needed = next.min - qty
    return discounted
      ? `Bulk rate applied — add ${needed} more for R${next.rate} each`
      : `Add ${needed} more to unlock R${next.rate} each`
  }
  return discounted ? "Best bulk rate applied" : null
}

export function itemHasBulk(hubId: HubId, sectionTitle: string, itemName: string): boolean {
  const itemId = `${hubId}-${sectionTitle}-${itemName}`
  return !!BULK_TIERS[itemId] || isScanItem(itemName)
}
export function hubHasBulk(hubId: HubId): boolean {
  return HUBS[hubId].sections.some(section =>
    section.items.some(item => itemHasBulk(hubId, section.title, item.name))
  )
}
export function sectionHasBulk(hubId: HubId, sectionTitle: string, items: { name: string }[]): boolean {
  return items.some(item => itemHasBulk(hubId, sectionTitle, item.name))
}

export function parsePrice(price: string): { amount: number; unit: string | null } {
  const match = price.match(/R(\d+(?:\.\d+)?)(?:\/(.+))?/)
  if (!match) return { amount: 0, unit: null }
  return { amount: parseFloat(match[1]), unit: match[2] ?? null }
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string; hubId: HubId; sectionTitle: string; name: string
  unitPrice: number; unit: string | null; qty: number
}

export interface SavedQuote {
  id: string; name: string; savedAt: number; items: CartItem[]
}

export const STORAGE_KEY       = "apexbytes-quote-cart"
export const STORAGE_KEY_SAVED = "apexbytes-saved-quotes"

export function quoteTotals(items: CartItem[]) {
  const total = items.reduce((s, i) => s + getEffectiveRate(i.id, i.name, i.qty || 1, i.unitPrice) * (i.qty || 1), 0)
  const savings = items.reduce((s, i) => s + (i.unitPrice - getEffectiveRate(i.id, i.name, i.qty || 1, i.unitPrice)) * (i.qty || 1), 0)
  const count = items.reduce((s, i) => s + (i.qty || 1), 0)
  return { total, savings, count }
}
