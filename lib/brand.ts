// lib/brand.ts — full file, paste over the current one
/**
 * ────────────────────────────────────────────────────────────────────────────
 * APEXBYTES HUB — CORE BUSINESS LAYER
 * lib/brand.ts
 *
 * PURPOSE:
 * Business logic, content, and UI structure. Visual color is NEVER decided
 * here anymore — globals.css is the only source. This file only re-exports
 * CSS var strings via TOKEN below.
 *
 * ── RULE FOR EVERY COMPONENT ──
 * Never write `isDark ? someHex : someOtherHex` for a color again. Use
 * `TOKEN.*` — each one is a CSS var string, the browser resolves light/dark
 * automatically because the var itself flips inside `.dark` in globals.css.
 * If TOKEN doesn't have the role you need, add it to globals.css first
 * (verified against the real surface it lands on), then add it here —
 * never invent a one-off hex inline in a component.
 * ────────────────────────────────────────────────────────────────────────────
 */

// ─── THEME-AWARE COLOR TOKENS — use these in components ─────────────────────
// Plain CSS var strings. Drop directly into `style={{ color: TOKEN.x }}` or
// `style={{ backgroundColor: TOKEN.x }}`. No isDark check needed — ever.
export const TOKEN = {
  // solid backgrounds (verified for a white icon/label on top)
  brandBlue: "var(--brand-blue)",
  brandOrange: "var(--brand-orange)",
  brandGreen: "var(--brand-green)",
  warningBg: "var(--brand-warning-bg)",

  // on-color pairs for the backgrounds above
  onBrandBlue: "var(--on-brand-blue)",
  onBrandOrange: "var(--on-brand-orange)",
  onBrandGreen: "var(--on-brand-green)",
  onBrandTeal: "var(--on-brand-teal)",
  onWhatsapp: "var(--on-whatsapp)",
  onWhatsappAccessible: "var(--on-whatsapp-accessible)",
  onPastel: "var(--on-pastel)",
  onNeutralDark: "var(--on-neutral-dark)",
  onDestructive: "var(--on-destructive)",

  // text-on-page/card/tint roles — the ones that used to break in dark mode
  blueText: "var(--brand-blue-text)",
  orangeText: "var(--brand-orange-text)",   // also covers the warning-badge label role
  greenText: "var(--brand-green-text)",

  white: "var(--brand-white)",

  // Add to the TOKEN object if not already present:
errorBg: "var(--brand-error-bg)",
errorText: "var(--brand-error-text)",
onBrandGreen: "var(--on-brand-green)",
onBrandBlue: "var(--on-brand-blue)",
onBrandOrange: "var(--on-brand-orange)",
onDestructive: "var(--on-destructive)",
} as const

// ─── RAW HEX — ONLY for JS math that CSS vars can't do (alpha-blended
// strings like `${hex}26`, canvas, gradients built at render time). If you
// don't need string math, use TOKEN above instead. This object mirrors
// globals.css exactly — do not let it drift; if you change a value here,
// change it in globals.css too, same names.
export const HEX = {
  light: {
    blue: "#1E6FA8", blueMid: "#15537D", blueDark: "#0F3F66",
    green: "#4A8011", greenDeep: "#3E6B0E",
    orange: "#B9590D", orangeDark: "#B06225", orangeBrown: "#A86530",
    teal: "#0F766E", tealDark: "#115E59", tealLight: "#99F6E4",
    warningBg: "#9A4B12",
    lightBlue: "#A9D6F2", lightGreen: "#CDEB9F", lightOrange: "#F9D1B0",
    dark100: "#333333", dark200: "#555555", techGreyDark: "#B8CCE0",
  },
  dark: {
    blue: "#1E6FA8", blueMid: "#15537D", blueDark: "#0F3F66", // theme-invariant raw swatches stay identical
    green: "#4A8011", greenDeep: "#3E6B0E",
    orange: "#B9590D", orangeDark: "#B06225", orangeBrown: "#A86530",
    teal: "#0F766E", tealDark: "#115E59", tealLight: "#99F6E4",
    warningBg: "#7A3B0E", // the one raw swatch with an actual dark-surface variant
    lightBlue: "#A9D6F2", lightGreen: "#CDEB9F", lightOrange: "#F9D1B0",
    dark100: "#333333", dark200: "#555555", techGreyDark: "#B8CCE0",
  },
  neutral100: "#EDEDED", neutral200: "#F4F4F4", neutral300: "#D6D6D6",
  neutral400: "#9A9A9A", neutral500: "#747474",
  white: "#FFFFFF",
  whatsapp: "#25D366", whatsappDark: "#1ebe5a",
  whatsappAccessible: "#178540", whatsappAccessibleDark: "#125F2F",
  whatsappText: "#0f172a",
} as const

/** Pick the right raw hex for the current theme. Only reach for this when
 *  you genuinely need a hex string (alpha blending, gradients) — everything
 *  else should use TOKEN. */
export function pickHex<K extends keyof typeof HEX.light>(role: K, isDark: boolean): string {
  return isDark ? HEX.dark[role] : HEX.light[role]
}

// ─── BUSINESS INFO ───────────────────────────────────────────────────────────
// Kept for anything still reading BRAND.* directly by name (dot indicators,
// non-contrast-critical decorative colors). Prefer TOKEN for anything that
// needs to be legible as text or on a solid fill.
export const BRAND = {
  green: HEX.light.green,
  orange: HEX.light.orange,
  lightBlue: HEX.light.lightBlue,
  lightGreen: HEX.light.lightGreen,
  lightOrange: HEX.light.lightOrange,
  blue: HEX.light.blue,
  blueMid: HEX.light.blueMid,
  blueDark: HEX.light.blueDark,
  teal: HEX.light.teal,
  tealDark: HEX.light.tealDark,
  tealLight: HEX.light.tealLight,
  greenDark: "#4C8212",
  greenDeep: HEX.light.greenDeep,
  orangeDark: HEX.light.orangeDark,
  orangeBrown: HEX.light.orangeBrown,
  neutral100: HEX.neutral100,
  neutral200: HEX.neutral200,
  neutral300: HEX.neutral300,
  neutral400: HEX.neutral400,
  neutral500: HEX.neutral500,
  dark100: HEX.light.dark100,
  dark200: HEX.light.dark200,
  techGreyDark: HEX.light.techGreyDark,
  white: HEX.white,
  whatsapp: HEX.whatsapp,
  whatsappDark: HEX.whatsappDark,
  whatsappAccessible: HEX.whatsappAccessible,
  whatsappAccessibleDark: HEX.whatsappAccessibleDark,
  whatsappText: HEX.whatsappText,
} as const

// ─── THEME-FLIPPING BACKGROUND HEX ──────────────────────────────────────────
export const THEME_BG = {
  light: { page: "#FFFFFF", card: "#FFFFFF" },
  dark: { page: "#0D1B2A", card: "#1A2C3E" },
} as const

// ─── HUB COLORS ───────────────────────────────────────────────────────────────
export const HUB_COLORS = {
  print: {
    primary: BRAND.blue,
    light: BRAND.lightBlue,
    gradient: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueMid} 100%)`,
    tagBg: 'transparent', tagText: '#374151', tagBgDark: '#1e40af', tagTextDark: '#ffffff',
    accentLight: BRAND.blue, accentDark: BRAND.lightBlue,
  },
  doc: {
    primary: BRAND.green,
    light: BRAND.lightGreen,
    gradient: `linear-gradient(135deg, ${BRAND.greenDeep} 0%, ${BRAND.green} 100%)`,
    tagBg: 'transparent', tagText: '#374151', tagBgDark: '#166534', tagTextDark: '#ffffff',
    accentLight: BRAND.green, accentDark: BRAND.lightGreen,
  },
  design: {
    primary: BRAND.orangeDark,
    light: BRAND.lightOrange,
    gradient: `linear-gradient(135deg, ${BRAND.orangeBrown} 0%, ${BRAND.orange} 100%)`,
    tagBg: 'transparent', tagText: '#374151', tagBgDark: '#9a3412', tagTextDark: '#ffffff',
    accentLight: BRAND.orangeDark, accentDark: BRAND.lightOrange,
  },
  eservice: {
    primary: BRAND.teal,
    light: BRAND.tealLight,
    gradient: `linear-gradient(135deg, ${BRAND.teal} 0%, ${BRAND.tealDark} 100%)`,
    tagBg: 'transparent', tagText: '#374151', tagBgDark: BRAND.tealDark, tagTextDark: '#ffffff',
    accentLight: BRAND.teal, accentDark: BRAND.tealLight,
  },
  tech: {
    primary: BRAND.dark100,
    light: BRAND.techGreyDark,
    gradient: `linear-gradient(135deg, ${BRAND.dark100} 0%, ${BRAND.dark200} 100%)`,
    tagBg: 'transparent', tagText: '#374151', tagBgDark: '#1f2937', tagTextDark: '#ffffff',
    accentLight: BRAND.dark100, accentDark: BRAND.techGreyDark,
  },
} as const

export const NEUTRAL_ICON_COLOR = {
  light: BRAND.dark100,
  dark: BRAND.techGreyDark,
} as const

export const BIZ = {
  name: "ApexbytesHub",
  tagline: "Your local tech & print partner.",
  location: "Kgotsong, Bothaville",
  phone: "075 333 8260",
  phoneE164: "+27753338260",
  email: "apexbytesza@gmail.com",
  address: "5878 Mpumalanga Section, Kgotsong, Bothaville",
  addressFull: "5878 Mpumalanga Section, Kgotsong, Bothaville, Free State, 9660",
  lat: -27.3790123,
  lng: 26.6599691,
  mapsUrl: "https://maps.app.goo.gl/v25Le9SfmCBfTh616?g_st=ac",
  founder: "Theji Meje",
  year: "2026",
  yearFounded: "2023",
  hubCount: 5,
  serviceCount: "70+",
} as const

export const waLink = (message: string) =>
  `https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(message)}`

export const WA = {
  general: waLink(`Hi ${BIZ.name}! I'm interested in your services. Can you tell me more?`),
  print: waLink(`Hi ${BIZ.name}! I need printing services. Can you help?`),
  doc: waLink(`Hi ${BIZ.name}! I need help with a document or CV. What do I need to bring?`),
  design: waLink(`Hi ${BIZ.name}! I need design work done for my business. Can we discuss?`),
  eservice: waLink(`Hi ${BIZ.name}! I need help with an online government application. Can I come in?`),
  tech: waLink(`Hi ${BIZ.name}! I need to bring my PC in for repairs or setup. Are you available?`),
  gallery: waLink(`Hi ${BIZ.name}! I saw your portfolio and I'd like to enquire about a service.`),
  contact: waLink(`Hi ${BIZ.name}! I'd like to get in touch.`),
} as const

export const HOURS = {
  printAndDoc: {
    label: "Print Hub · Document Hub",
    hours: "Mon – Sun · 07:00 – 20:00",
    note: "Open on Public Holidays",
    open: true,
  },
  techDesignEservice: {
    label: "Tech Hub · Design Hub · E-Service Hub",
    lines: ["Mon – Fri · 09:00 – 17:00", "Sat · 09:00 – 12:00"],
    note: "Sun & Public Holidays · Closed",
    open: false,
  },
  responseTime: "We typically reply within 15 minutes during business hours.",
} as const

export type HubKey = "print" | "doc" | "design" | "eservice" | "tech"

export const HUB_NAMES: Record<HubKey, string> = {
  print: "Print Hub",
  doc: "Document Hub",
  design: "Design Hub",
  eservice: "E-Service Hub",
  tech: "Tech Hub",
} as const

export type NavItem = {
  id: string
  label: string
  path: string
  isCta?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", path: "/" },
  { id: "services", label: "Services", path: "/services" },
  { id: "gallery", label: "Gallery", path: "/gallery" },
  { id: "pricing", label: "Pricing", path: "/pricing" },
  { id: "about", label: "About", path: "/about" },
  { id: "tools", label: "Tools", path: "/tools/jpg-to-pdf" },
  { id: "contact", label: "Contact", path: "/contact", isCta: true },
] as const

export const MARQUEE_ITEMS = [
  "Print & Copy While You Wait",
  "CVs That Help You Get Hired",
  "Document Typing & Fixing",
  "Scan & Laminate Important Papers",
  "Logo Design, Flyers & Business Cards",
  "Social Media Designs for Your Business",
  "Invitations for Any Event",
  "SASSA, SARS & Online Applications Made Easy",
  "Job, NSFAS & Bursary Applications Done For You",
  "Email & Online Help",
  "Computer Setup, Software Installation & Tech Support",
] as const

export const STRIP_ITEMS = [
  { iconName: "Rocket", title: "Fast Turnaround", desc: "No long waits, quick service" },
  { iconName: "CurrencyDollar", title: "Affordable Rates", desc: "Fair pricing for everyone" },
  { iconName: "HandHeart", title: "Friendly Help", desc: "We explain, never judge" },
  { iconName: "MapPin", title: "Walk-ins Welcome", desc: `${BIZ.location}` },
] as const

export const GALLERY_CATEGORIES = [
  { id: "all", label: "All hubs" },
  { id: "print", label: "Print hub" },
  { id: "doc", label: "Document hub" },
  { id: "design", label: "Design hub" },
  { id: "eservice", label: "E-Service hub" },
  { id: "tech", label: "Tech hub" },
] as const

export const GALLERY_ALERT =
  "We are currently curating our gallery to feature our latest local business success stories. The current imagery demonstrates the visual aesthetic and service style of ApexbytesHub. Check back often for fresh project work!"

export const FAQS = [
  {
    question: "How do I send my files, photos, or CV information to you?",
    answer: "All services connect via WhatsApp where you can upload documents, notes, or images directly.",
  },
  {
    question: "Where do I collect my completed documents or prints?",
    answer: `${BIZ.name} operates from ${BIZ.location}. We notify you when items are ready for collection.`,
  },
  {
    question: "How long does it take to complete a design or document task?",
    answer: "Print and Document Hub tasks are same-day. Design Hub work (logos, flyers, business cards, invitations) takes 2–3 business days.",
  },
  {
    question: "What are your payment terms?",
    answer: "Clear upfront pricing. Payment is required before or upon completion depending on service type.",
  },
  {
    question: "Do you use templates for design projects?",
    answer: "No. All design work is custom-built using professional design tools.",
  },
] as const

export const ABOUT_VALUES = [
  { iconName: "Target", title: "We Keep It Simple", desc: "No confusing jargon. Everything is explained clearly." },
  { iconName: "Heart", title: "Community First", desc: "We serve our neighbourhood with care and respect." },
  { iconName: "Lightning", title: "Fast & Reliable", desc: "We deliver consistently and on time." },
] as const

export const ABOUT_STANDARDS = [
  { id: 1, iconName: "Desktop", title: "Premium Vector Accuracy", description: "All design work is created professionally with no generic templates." },
  { id: 2, iconName: "Printer", title: "Megatank Economy Prints", description: "High-quality printing using continuous ink systems for affordability." },
  { id: 3, iconName: "DeviceMobile", title: "Direct WhatsApp Pipeline", description: "Fast communication and order handling through WhatsApp." },
] as const

export const CONTACT_LINKS = [
  { title: "WhatsApp Us", value: BIZ.phone, href: WA.contact, dot: BRAND.whatsapp },
  { title: "Call Us", value: BIZ.phone, href: `tel:${BIZ.phoneE164}`, dot: BRAND.blue },
  { title: "Email Us", value: BIZ.email, href: `mailto:${BIZ.email}`, dot: BRAND.orange },
  {
    title: "Visit Us",
    value: BIZ.addressFull,
    href: BIZ.mapsUrl,
    dotLight: BRAND.blueDark,
    dotDark: BRAND.lightBlue,
  },
] as const

export const FOOTER_NAV = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Gallery", path: "/gallery" },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
  { label: "Tools", path: "/tools/jpg-to-pdf" },
  { label: "Contact", path: "/contact" },
] as const 
