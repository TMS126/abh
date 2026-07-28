// ─────────────────────────────────────────────────────────────────────────
// Contact page — static data & pure helper functions
// (hub color mapping, vCard generation, map embed URL)
// ─────────────────────────────────────────────────────────────────────────

import { BRAND, BIZ, HUB_COLORS, type HubKey } from "@/lib/brand"

// ── Hub → color mapping for the service-select dropdown ──
export const FORM_HUB_KEYS: Record<string, HubKey | null> = {
  "Print Hub":                  "print",
  "Document Hub":                "doc",
  "Design Hub":                  "design",
  "E-Service Hub":               "eservice",
  "Tech Hub":                    "tech",
  "Not Sure — Help Me Choose":  null,
}

export function getFormHubColor(opt: string, isDark: boolean): string {
  const key = FORM_HUB_KEYS[opt]
  if (!key) return isDark ? BRAND.neutral400 : BRAND.neutral500
  const c = HUB_COLORS[key]
  return isDark ? c.accentDark : c.accentLight
}

export const CONTACT_GREY = { light: BRAND.dark100, dark: "#B8CCE0" }

// ── vCard download ──
export function downloadBusinessVCard() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:Theji Meje ApexbytesHub`,
    `N:ApexbytesHub;Theji Meje;;;`,
    `ORG:ApexbytesHub`,
    `TITLE:Founder & Lead Designer`,
    `TEL;TYPE=CELL,PREF:+27753338260`,
    `EMAIL;TYPE=WORK:apexbytesza@gmail.com`,
    `ADR;TYPE=WORK:;;5878 Mpumalanga Section;Kgotsong;Bothaville;9660;South Africa`,
    `URL:https://v0-apexbytes-hub-website.vercel.app/`,
    `NOTE:Apexbytes Hub — Print\\, Design\\, Docs\\, Tech & E-Services in Kgotsong\\, Bothaville.`,
    "END:VCARD",
  ].join("\r\n")

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = "ApexbytesHub.vcf"
  a.click()
  URL.revokeObjectURL(url)
}

// ── Map embed URL ──
// Uses OpenStreetMap's embed endpoint — no API key required and reliably
// loads on Vercel's production environment. Google's no-key `output=embed`
// trick was tried first but returned a broken/failed iframe in production
// (works inconsistently depending on host/network, since it's an
// undocumented workaround rather than a supported embed format).
export function buildOsmEmbedSrc(lat: number, lng: number) {
  const deltaLat = 0.003
  const deltaLng = 0.004
  const bbox = [lng - deltaLng, lat - deltaLat, lng + deltaLng, lat + deltaLat].join(",")
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`
}

export const MAP_EMBED_SRC = buildOsmEmbedSrc(BIZ.lat, BIZ.lng)
export const MAP_LOAD_TIMEOUT_MS = 7000
