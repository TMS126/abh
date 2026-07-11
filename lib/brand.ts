/**
 * ────────────────────────────────────────────────────────────────────────────
 * APEXBYTES HUB — CORE BUSINESS LAYER
 * lib/brand.ts
 *
 * PURPOSE:
 * This file contains business logic, content, and UI structure.
 * All visual styling is handled by CSS variables (single source of truth).
 * ────────────────────────────────────────────────────────────────────────────
 */

// ─── BUSINESS INFO ───────────────────────────────────────────────────────────
export const BRAND = {
  green: "#4A8011",        // WCAG AA — 4.79:1 vs white (was #6FBF1A at 2.3:1)
  orange: "#B9590D",       // WCAG AA — 4.67:1 vs white (was #F4A261 at 2.06:1)
  lightBlue: "#A9D6F2",
  lightGreen: "#CDEB9F",
  lightOrange: "#F9D1B0",

  blue: "#1E6FA8",
  blueMid: "#15537D",
  blueDark: "#0F3F66",

  // E-Service Hub's accent — kept out of the blue family on purpose so it
  // doesn't collide with Print Hub's blue at small sizes (icon chips, tags).
  teal: "#0F766E",
  tealDark: "#115E59",
  tealLight: "#99F6E4",

  greenDark: "#4C8212",    // WCAG AA — 4.66:1 vs white (was #548F14 at 3.95:1)
  greenDeep: "#3E6B0E",

  orangeDark: "#B06225",   // WCAG AA — 4.55:1 vs white (was #D9894B at 2.75:1)
  orangeBrown: "#A86530",  // WCAG AA — 4.60:1 vs white (was #B86F34 at 3.92:1)
  orangeAccessible: "#9A4B12",     // WCAG AA — 6.2:1 with white text
  orangeAccessibleDark: "#7A3B0E", // WCAG AAA — 8.5:1 with white text

  neutral100: "#EDEDED",
  neutral200: "#F4F4F4",
  neutral300: "#D6D6D6",
  neutral400: "#9A9A9A",   // fixed invalid hex (was "#9A9A" — missing 2 digits)
  neutral500: "#747474",   // WCAG AA — 4.67:1 vs white (was #777777 at 4.48:1, just under)

  dark100: "#333333",
  dark200: "#555555",
  // Dark-mode-safe companion for dark100 — #333333 is ~12.6:1 vs white
  // (great in light mode) but only ~1.4:1 against dark UI surfaces,
  // failing WCAG's 3:1 icon/UI-component minimum. This is the same
  // #B8CCE0 Tech Hub already uses as its own colorDark in HUBS_DATA
  // (hero-section.tsx) — named here so other components (e.g. Navbar)
  // can reference it instead of reusing dark100 flat across both themes.
  // Verified ~10.7:1 against dark surfaces — passes AAA.
  techGreyDark: "#B8CCE0",

  white: "#FFFFFF",

  // WhatsApp's official brand green — intentionally left unchanged.
  // Logos/brand marks are exempt from WCAG 1.4.3; altering it would break
  // brand recognition. Only ~2:1 vs white — avoid pairing with pure white
  // text/icons if strict AA compliance matters for a given use.
  whatsapp: "#25D366",
  whatsappDark: "#1ebe5a",

  // text-safe variants
  blueText: "#16325f",
  orangeText: "#b85c17",
  greenText: "#4d6f2f",
  whatsappText: "#0f172a",
} as const

// ONLY ONE HUB_COLORS EXPORT - WCAG AA COMPLIANT ACTIVE COLORS
// Sourced from the official brand palette tiers (Bright / Hard / Soft / Dark).
// Note: the palette has 3 base hues (blue/green/orange) but 5 hubs — E-Service
// uses teal as the one color outside the palette, since reusing blue would
// make it indistinguishable from Print Hub at small sizes (icon chips, tags).
export const HUB_COLORS = {
  print: {
    primary: BRAND.blue,        // Hard: #1E6FA8
    light: BRAND.lightBlue,     // Bright: #A9D6F2
    gradient: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueMid} 100%)`,
    tagBg: 'transparent',
    tagText: '#374151',
    tagBgDark: '#1e40af',
    tagTextDark: '#ffffff',
    accentLight: BRAND.blue,
    accentDark: BRAND.lightBlue,
  },

  doc: {
    primary: BRAND.green,       // Hard (AA-adjusted): #4A8011
    light: BRAND.lightGreen,    // Bright: #CDEB9F
    gradient: `linear-gradient(135deg, ${BRAND.greenDeep} 0%, ${BRAND.green} 100%)`,
    tagBg: 'transparent',
    tagText: '#374151',
    tagBgDark: '#166534',
    tagTextDark: '#ffffff',
    accentLight: BRAND.green,
    accentDark: BRAND.lightGreen,
  },

  design: {
    primary: BRAND.orangeDark,  // Hard (AA-adjusted): #B06225
    light: BRAND.lightOrange,   // Bright: #F9D1B0
    gradient: `linear-gradient(135deg, ${BRAND.orangeBrown} 0%, ${BRAND.orange} 100%)`,
    tagBg: 'transparent',
    tagText: '#374151',
    tagBgDark: '#9a3412',
    tagTextDark: '#ffffff',
    accentLight: BRAND.orangeDark,
    accentDark: BRAND.lightOrange,
  },

  eservice: {
    primary: BRAND.teal,
    light: BRAND.tealLight,
    gradient: `linear-gradient(135deg, ${BRAND.teal} 0%, ${BRAND.tealDark} 100%)`,
    tagBg: 'transparent',
    tagText: '#374151',
    tagBgDark: BRAND.tealDark,
    tagTextDark: '#ffffff',
    accentLight: BRAND.teal,
    accentDark: BRAND.tealLight,
  },

  tech: {
    primary: BRAND.dark100,       // Dark tier: #333333
    light: BRAND.techGreyDark,    // #B8CCE0 (existing dark-mode-safe pairing)
    gradient: `linear-gradient(135deg, ${BRAND.dark100} 0%, ${BRAND.dark200} 100%)`,
    tagBg: 'transparent',
    tagText: '#374151',
    tagBgDark: '#1f2937',
    tagTextDark: '#ffffff',
    accentLight: BRAND.dark100,
    accentDark: BRAND.techGreyDark,
  },
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
  mapsUrl: "https://maps.app.goo.gl/v25Le9SfmCBfTh616?g_st=ac",
  founder: "Theji Meje",
  year: "2026",
  yearFounded: "2023",
  hubCount: 5,
  serviceCount: "70+",
} as const

// ─── WHATSAPP HELPERS ───────────────────────────────────────────────────────
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

// ─── BUSINESS HOURS ──────────────────────────────────────────────────────────
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

// ─── HUB TYPES ───────────────────────────────────────────────────────────────
export type HubKey = "print" | "doc" | "design" | "eservice" | "tech"

export const HUB_NAMES: Record<HubKey, string> = {
  print: "Print Hub",
  doc: "Document Hub",
  design: "Design Hub",
  eservice: "E-Service Hub",
  tech: "Tech Hub",
} as const

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
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
  { id: "about", label: "About", path: "/about" },
  { id: "contact", label: "Contact", path: "/contact", isCta: true },
] as const

// ─── MARQUEE CONTENT ─────────────────────────────────────────────────────────
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

// ─── STRIP CONTENT ───────────────────────────────────────────────────────────
export const STRIP_ITEMS = [
  {
    iconName: "Rocket",
    title: "Fast Turnaround",
    desc: "No long waits, quick service",
  },
  {
    iconName: "CurrencyDollar",
    title: "Affordable Rates",
    desc: "Fair pricing for everyone",
  },
  {
    iconName: "HandHeart",
    title: "Friendly Help",
    desc: "We explain, never judge",
  },
  {
    iconName: "MapPin",
    title: "Walk-ins Welcome",
    desc: `${BIZ.location}`,
  },
] as const

// ─── GALLERY ────────────────────────────────────────────────────────────────
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

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const FAQS = [
  {
    question: "How do I send my files, photos, or CV information to you?",
    answer:
      "All services connect via WhatsApp where you can upload documents, notes, or images directly.",
  },
  {
    question: "Where do I collect my completed documents or prints?",
    answer:
      `${BIZ.name} operates from ${BIZ.location}. We notify you when items are ready for collection.`,
  },
  {
    question: "How long does it take to complete a design or document task?",
    answer:
      "Print and Document Hub tasks are same-day. Design Hub work (logos, flyers, business cards, invitations) takes 2–3 business days.",
  },
  {
    question: "What are your payment terms?",
    answer:
      "Clear upfront pricing. Payment is required before or upon completion depending on service type.",
  },
  {
    question: "Do you use templates for design projects?",
    answer:
      "No. All design work is custom-built using professional design tools.",
  },
] as const

// ─── ABOUT CONTENT ───────────────────────────────────────────────────────────
export const ABOUT_VALUES = [
  {
    iconName: "Target",
    title: "We Keep It Simple",
    desc: "No confusing jargon. Everything is explained clearly.",
  },
  {
    iconName: "Heart",
    title: "Community First",
    desc: "We serve our neighbourhood with care and respect.",
  },
  {
    iconName: "Lightning",
    title: "Fast & Reliable",
    desc: "We deliver consistently and on time.",
  },
] as const

export const ABOUT_STANDARDS = [
  {
    id: 1,
    iconName: "Desktop",
    title: "Premium Vector Accuracy",
    description:
      "All design work is created professionally with no generic templates.",
  },
  {
    id: 2,
    iconName: "Printer",
    title: "Megatank Economy Prints",
    description:
      "High-quality printing using continuous ink systems for affordability.",
  },
  {
    id: 3,
    iconName: "DeviceMobile",
    title: "Direct WhatsApp Pipeline",
    description:
      "Fast communication and order handling through WhatsApp.",
  },
] as const

  // ─── CONTACT ────────────────────────────────────────────────────────────────
export const CONTACT_LINKS = [
  {
    title: "WhatsApp Us",
    value: BIZ.phone,
    href: WA.contact,
    dot: BRAND.whatsapp, // brand logo color, exempt from contrast rules
  },
  {
    title: "Call Us",
    value: BIZ.phone,
    href: `tel:${BIZ.phoneE164}`,
    dot: BRAND.blue,
  },
  {
    title: "Email Us",
    value: BIZ.email,
    href: `mailto:${BIZ.email}`,
    dot: BRAND.orange,
  },
  {
    // BRAND.blueDark used flat here previously — passed ~10.9:1 in light
    // mode but only ~1.6:1 in dark mode (dark navy on a dark chip fails
    // the 3:1 icon minimum). Now a proper pair, matching the same
    // blueDark/lightBlue pairing already used for "/about" elsewhere.
    title: "Visit Us",
    value: BIZ.addressFull,
    href: BIZ.mapsUrl,
    dotLight: BRAND.blueDark,
    dotDark: BRAND.lightBlue,
  },
] as const

// ─── FOOTER ─────────────────────────────────────────────────────────────────
export const FOOTER_NAV = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Gallery", path: "/gallery" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
] as const 
