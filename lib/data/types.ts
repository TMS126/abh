/* lib/data/types.ts */
/**
 * ────────────────────────────────────────────────────────────────────────
 * CORE DATA SHAPES FOR THE SITE'S SERVICE CATALOG
 *
 * Every hub (Print, Doc, Design, E-Service, Tech) is built from these three
 * shapes: ServiceItem -> HubSection -> Hub. Nothing renders on the site
 * unless it fits one of these interfaces, so changes here affect every
 * hub file in lib/data/hubs/*.
 * ────────────────────────────────────────────────────────────────────────
 */

import { type HubKey } from '@/lib/brand'

// HubId is just an alias of HubKey (print/doc/design/eservice/tech) so
// the data layer and the brand/color layer always stay in sync.
export type HubId = HubKey

// ── A single sellable service (e.g. "NSFAS Status Check") ──
export interface ServiceItem {
  name: string                // Display name shown on the item row and modal title
  price: string                // Display price string, e.g. "R20"
  requirements: string[]       // "Needs" tab bullet list in the service modal
  description?: string         // "Description" tab text (optional)
  tips?: string[]               // Optional manual tip override (falls back to fallback-tips.ts if absent)

  // NOTICE FIELD — powers the orange "!" badge system.
  // If this is set to any non-empty string, the service will show an
  // orange warning icon on: the hub card, the section tab, the item row,
  // and inside the service detail modal (tap to read the full message).
  // Leave undefined/omitted for every normal service — nothing changes
  // for those. Only set this when there's a genuine live issue worth
  // flagging to the customer (e.g. a government system outage/delay).
  notice?: string
}

// ── A group of services inside a hub (e.g. "SASSA" tab, "Laminating") ──
export interface HubSection {
  title: string
  desc?: string
  items: ServiceItem[]
}

// ── A full hub (e.g. E-Service Hub) ──
export interface Hub {
  iconName: string
  iconColor: string
  title: string
  grad: string
  desc: string
  turnaround: string
  sections: HubSection[]
  previews: string[]
  tagStyle: { bg: string; color: string }
  tagStyleDark: { bg: string; color: string }
}
