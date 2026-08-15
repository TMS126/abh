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

// Kept for backward compatibility — nothing currently imports this directly,
// but it existed in the original file so anything that might reference it
// (e.g. a future admin panel) won't break.
export const CURRENCY_SYMBOL = 'R'

export type PriceUnit = 'flat' | 'page' | 'hr'

export interface PriceEntry {
  rate: number
  unit: PriceUnit
}

// Formats a PriceEntry back into display text, e.g. { rate: 5, unit: 'page' } -> "R5/page"
export function formatPrice(entry: PriceEntry): string {
  const suffix = entry.unit === 'flat' ? '' : `/${entry.unit}`
  return `${CURRENCY_SYMBOL}${entry.rate}${suffix}`
}

export const PRICING = {
  print: {
    'B&W Print': { rate: 5, unit: 'page' },
    'Colour Print': { rate: 8, unit: 'page' },
    'B&W Copy': { rate: 3, unit: 'page' },
    'Colour Copy': { rate: 5, unit: 'page' },
    'Glossy Photo (4x6)': { rate: 20, unit: 'flat' },
    'Glossy Photo (A4)': { rate: 40, unit: 'flat' },
  },
  doc: {
    'Typing + Print (B&W)': { rate: 15, unit: 'page' },
    'Typing + Print (Colour)': { rate: 18, unit: 'page' },
    'Affidavit / Letter': { rate: 15, unit: 'page' },
    'CV from Scratch': { rate: 30, unit: 'flat' },
    'CV Upgrade/Fix': { rate: 40, unit: 'flat' },
    'Cover Letter': { rate: 30, unit: 'flat' },
    'Scanning': { rate: 5, unit: 'page' },
    'Laminating (A5)': { rate: 15, unit: 'flat' },
    'Laminating (A4)': { rate: 20, unit: 'flat' },
    'Laminating (A3)': { rate: 30, unit: 'flat' },
  },
  design: {
    'Logo — Basic': { rate: 300, unit: 'flat' },
    'Logo — Standard': { rate: 500, unit: 'flat' },
    'Logo — Premium': { rate: 800, unit: 'flat' },
    'Business Card (Single Side)': { rate: 120, unit: 'flat' },
    'Business Card (Double Side)': { rate: 180, unit: 'flat' },
    'Flyer / Poster — Simple': { rate: 150, unit: 'flat' },
    'Flyer / Poster — Custom': { rate: 250, unit: 'flat' },
    'Flyer / Poster — Complex': { rate: 350, unit: 'flat' },
    'Social Media Post': { rate: 80, unit: 'flat' },
    'Post + Story': { rate: 120, unit: 'flat' },
    'Static Invitation': { rate: 150, unit: 'flat' },
    'Video Invitation': { rate: 300, unit: 'flat' },
    'Business Profile — Basic (1pg)': { rate: 250, unit: 'flat' },
    'Business Profile — Standard (2-3pg)': { rate: 400, unit: 'flat' },
    'Business Profile — Premium (4-5pg)': { rate: 600, unit: 'flat' },
    'Business Profile — Extra Page': { rate: 80, unit: 'page' },
    'Revision — While Busy': { rate: 50, unit: 'flat' },
    'Revision — After Completion': { rate: 70, unit: 'flat' },
  },
  eservice: {
    'SASSA Status Check': { rate: 20, unit: 'flat' },
    'SASSA Update Details': { rate: 40, unit: 'flat' },
    'SASSA Reapplication': { rate: 40, unit: 'flat' },
    'SASSA SRD Application': { rate: 40, unit: 'flat' },
    'SASSA Appeal': { rate: 40, unit: 'flat' },
    'SASSA Banking Update': { rate: 50, unit: 'flat' },
    'SASSA Grant Application': { rate: 80, unit: 'flat' },
    'SARS Enquiry / Statement / Updates': { rate: 50, unit: 'flat' },
    'SARS New Taxpayer / eFiling': { rate: 70, unit: 'flat' },
    'SARS Tax Pin / Penalty': { rate: 100, unit: 'flat' },
    'SARS Tax Clearance': { rate: 120, unit: 'flat' },
    'SARS Pin Submission': { rate: 120, unit: 'flat' },
    'SARS Tax Return / VAT / PAYE': { rate: 200, unit: 'flat' },
    'NSFAS Status Check': { rate: 20, unit: 'flat' },
    'NSFAS Banking Update': { rate: 40, unit: 'flat' },
    'Learnership Application': { rate: 40, unit: 'flat' },
    'Job / DPSA Application': { rate: 40, unit: 'flat' },
    'Bursary Application': { rate: 40, unit: 'flat' },
    'NSFAS Appeal': { rate: 50, unit: 'flat' },
    'NSFAS Application': { rate: 80, unit: 'flat' },
    'University Application': { rate: 100, unit: 'flat' },
    'Email Setup / Send / Receive': { rate: 15, unit: 'flat' },
    'Good Standing Letter': { rate: 60, unit: 'flat' },
    'Google Business Setup': { rate: 80, unit: 'flat' },
    'UIF Monthly Declaration': { rate: 100, unit: 'flat' },
    'UIF Registration': { rate: 100, unit: 'flat' },
    'CSD Update': { rate: 120, unit: 'flat' },
    'UIF Claims': { rate: 200, unit: 'flat' },
    'CSD Registration': { rate: 300, unit: 'flat' },
    'Social Media Setup': { rate: 60, unit: 'flat' },
    "Learner's Licence Booking": { rate: 60, unit: 'flat' },
    'WhatsApp Business Setup': { rate: 80, unit: 'flat' },
  },
  tech: {
    'Software Install': { rate: 80, unit: 'flat' },
    'App / Office Updates': { rate: 80, unit: 'flat' },
    'Driver Installation': { rate: 100, unit: 'flat' },
    'Printer Setup': { rate: 100, unit: 'flat' },
    'Activation Only': { rate: 100, unit: 'flat' },
    'Microsoft 365 Setup': { rate: 150, unit: 'flat' },
    'Troubleshooting': { rate: 150, unit: 'hr' },
    'PC Cleanup': { rate: 150, unit: 'flat' },
    'Virus / Malware Removal': { rate: 200, unit: 'flat' },
    'OS Update': { rate: 200, unit: 'flat' },
    'PC Setup': { rate: 250, unit: 'flat' },
    'Windows Install (No Activation)': { rate: 300, unit: 'flat' },
    'Windows Install + Activation': { rate: 350, unit: 'flat' },
  },
} as const satisfies Record<HubId, Record<string, PriceEntry>> 
