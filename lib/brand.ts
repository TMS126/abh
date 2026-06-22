/**
 * ────────────────────────────────────────────────────────────────────────────
 * APEXBYTES HUB — BRAND EPICENTER
 * lib/brand.ts
 *
 * ✅ SINGLE SOURCE OF TRUTH for all branding, content, and configuration.
 * Every component imports from here. Change once — updates everywhere.
 * ────────────────────────────────────────────────────────────────────────────
 */

// ─── BRAND COLORS (Updated from User Palette) ────────────────────────────────
export const BRAND = {
  // Bright (High Energy)
  green:        "#6FBF1A",
  orange:       "#F4A261",
  lightBlue:    "#A9D6F2",
  lightGreen:   "#CDEB9F",
  lightOrange:  "#F9D1B0",

  // Hard (Brand Anchors)
  blue:         "#1E6FA8",
  blueMid:      "#15537D",
  blueDark:     "#0F3F66",
  greenDark:    "#548F14",
  orangeDark:   "#D9894B",

  // Soft (Subtle Neutrals)
  neutral100:   "#EDEDED",
  neutral200:   "#F4F4F4",
  neutral300:   "#D6D6D6",
  neutral400:   "#9A9A9A",
  neutral500:   "#777777",

  // Dark (Foundational)
  dark100:      "#333333",
  dark200:      "#555555",
  greenDeep:    "#3E6B0E",
  orangeBrown:  "#B86F34",
  white:        "#FFFFFF",

  // Special
  whatsapp:     "#25D366",
  whatsappDark: "#1ebe5a",
} as const

// ─── BUSINESS CONSTANTS ──────────────────────────────────────────────────────
export const BIZ = {
  name:         "ApexbytesHub",
  nameShort:    "ApexbytesHub",
  tagline:      "Your local tech & print partner.",
  location:     "Kgotsong, Bothaville",
  phone:        "075 333 8260",
  phoneE164:    "+27753338260",
  email:        "apexbytesza@gmail.com",
  address:      "5878 Mpumalanga Section, Kgotsong, Bothaville",
  addressFull:  "5878 Mpumalanga Section, Kgotsong, Bothaville, Free State, 9660",
  mapsUrl:      "https://maps.app.goo.gl/v25Le9SfmCBfTh616?g_st=ac",
  founder:      "Theji Meje",
  year:         "2026",
  hubCount:     5,
  serviceCount: "70+",
} as const

// ─── WHATSAPP HELPERS ───────────────────────────────────────────────────────
export const waLink = (message: string) =>
  `https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(message)}`

export const WA = {
  general:    waLink(`Hi ${BIZ.name}! I'm interested in your services. Can you tell me more?`),
  print:      waLink(`Hi ${BIZ.name}! I need printing services. Can you help?`),
  doc:        waLink(`Hi ${BIZ.name}! I need help with a document or CV. What do I need to bring?`),
  design:     waLink(`Hi ${BIZ.name}! I need design work done for my business. Can we discuss?`),
  eservice:   waLink(`Hi ${BIZ.name}! I need help with an online government application. Can I come in?`),
  tech:       waLink(`Hi ${BIZ.name}! I need to bring my PC in for repairs or setup. Are you available?`),
  gallery:    waLink(`Hi ${BIZ.name}! I saw your portfolio and I'd like to enquire about a service.`),
  contact:    waLink(`Hi ${BIZ.name}! I'd like to get in touch.`),
} as const

// ─── BUSINESS HOURS ──────────────────────────────────────────────────────────
export const HOURS = {
  printAndDoc: {
    label:  "Print Hub · Document Hub",
    hours:  "Mon – Sun · 07:00 – 20:00",
    note:   "Open on Public Holidays",
    open:   true,
  },
  techDesignEservice: {
    label:  "Tech Hub · Design Hub · E-Service Hub",
    lines:  ["Mon – Fri · 09:00 – 17:00", "Sat · 09:00 – 12:00"],
    note:   "Sun & Public Holidays · Closed",
    open:   false,
  },
  responseTime: "We typically reply within 15 minutes during business hours.",
} as const

// ─── HUB NAMES & KEYS ────────────────────────────────────────────────────────
export type HubKey = "print" | "doc" | "design" | "eservice" | "tech"

export const HUB_NAMES: Record<HubKey, string> = {
  print:    "Print Hub",
  doc:      "Document Hub",
  design:   "Design Hub",
  eservice: "E-Service Hub",
  tech:     "Tech Hub",
} as const

// ─── HUB COLOR MAP (for dynamic JS usage) ─────────────────────────────────────
export const HUB_COLORS: Record<HubKey, {
  primary:    string   // main brand color for this hub
  light:      string   // light accent / icon color
  gradient:   string   // card gradient background
  tagBg:      string   // light mode tag background
  tagText:    string   // light mode tag text
  tagBgDark:  string   // dark mode tag background
  tagTextDark:string   // dark mode tag text
}> = {
  print: {
    primary:     BRAND.blue,
    light:       BRAND.lightBlue,
    gradient:    `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueMid} 100%)`,
    tagBg:       "#EBF5FB",
    tagText:     BRAND.blueDark,
    tagBgDark:   "#1E3A52",
    tagTextDark: BRAND.lightBlue,
  },
  doc: {
    primary:     BRAND.green,
    light:       BRAND.lightGreen,
    gradient:    `linear-gradient(135deg, ${BRAND.greenDeep} 0%, ${BRAND.green} 100%)`,
    tagBg:       "#EAFAF1",
    tagText:     BRAND.greenDeep,
    tagBgDark:   "#1A3010",
    tagTextDark: BRAND.lightGreen,
  },
  design: {
    primary:     BRAND.orangeDark,
    light:       BRAND.lightOrange,
    gradient:    `linear-gradient(135deg, ${BRAND.orangeBrown} 0%, ${BRAND.orange} 100%)`,
    tagBg:       "#FEF3C7",
    tagText:     BRAND.orangeBrown,
    tagBgDark:   "#3A2010",
    tagTextDark: BRAND.lightOrange,
  },
  eservice: {
    primary:     BRAND.lightBlue,
    light:       BRAND.lightBlue,
    gradient:    `linear-gradient(135deg, #15537D 0%, ${BRAND.blueMid} 100%)`,
    tagBg:       "#EBF5FB",
    tagText:     "#1565A0",
    tagBgDark:   "#1E3A52",
    tagTextDark: "#5FB3F0",
  },
  tech: {
    primary:     "#B8CCE0",
    light:       "#B8CCE0",
    gradient:    `linear-gradient(135deg, #333333 0%, #555555 100%)`,
    tagBg:       BRAND.neutral100,
    tagText:     "#3D4148",
    tagBgDark:   "#3D4148",
    tagTextDark: "#C9CDD3",
  },
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
export type NavItem = {
  id: string;
  label: string;
  path: string;
  isCta?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "home",     label: "Home",     path: "/" },
  { id: "services", label: "Services", path: "/services" },
  { id: "gallery",  label: "Gallery",  path: "/gallery" },
  { id: "about",    label: "About",    path: "/about" },
  { id: "contact",  label: "Contact",  path: "/contact", isCta: true },
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

// ─── STRIP / VALUE PROPS ─────────────────────────────────────────────────────
export const STRIP_ITEMS = [
  {
    iconName: "Rocket",
    color:    BRAND.blue,
    title:    "Fast Turnaround",
    desc:     "No long waits, quick service",
  },
  {
    iconName: "CurrencyDollar",
    color:    BRAND.green,
    title:    "Affordable Rates",
    desc:     "Fair pricing for everyone",
  },
  {
    iconName: "HandHeart",
    color:    BRAND.orange,
    title:    "Friendly Help",
    desc:     "We explain, never judge",
  },
  {
    iconName: "MapPin",
    color:    BRAND.blue,
    title:    "Walk-ins Welcome",
    desc:     `${BIZ.location}`,
  },
] as const

// ─── CATEGORY FILTERS (Gallery) ──────────────────────────────────────────────
export const GALLERY_CATEGORIES = [
  { id: "all",      label: "All hubs" },
  { id: "print",    label: "Print hub" },
  { id: "doc",      label: "Document hub" },
  { id: "design",   label: "Design hub" },
  { id: "eservice", label: "E-Service hub" },
  { id: "tech",     label: "Tech hub" },
] as const

// ─── ALERT NOTICE (Gallery) ──────────────────────────────────────────────────
export const GALLERY_ALERT =
  "We are currently curating our gallery to feature our latest local business success stories. The current imagery demonstrates the visual aesthetic and service style of ApexbytesHub. Check back often for fresh project work!"

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const FAQS = [
  {
    question: "How do I send my files, photos, or CV information to you?",
    answer:   "Completely frictionless. When you click any service on our platform it generates a pre-typed WhatsApp message. Upload your documents, rough notes, or images directly through that chat. We'll confirm receipt and start working on your project.",
  },
  {
    question: "Where do I collect my completed documents or prints?",
    answer:   `${BIZ.name} is a home-based studio in ${BIZ.location}. Collect physical prints and laminated materials directly from our location once we notify you. Digital-only files are sent securely to your WhatsApp or email.`,
  },
  {
    question: "How long does it take to complete a design or document task?",
    answer:   "Basic admin services, digital checks, and standard print-and-laminate tasks are typically same-day. Custom design work or full CV overhauls take 24–48 hours depending on requirements. We'll give you an exact timeline when you reach out.",
  },
  {
    question: "What are your payment terms?",
    answer:   "Clear, upfront pricing. Standard checks are payable on execution. For premium custom design or high-volume print runs we require confirmation before production begins. We accept cash and EFT.",
  },
  {
    question: "Do you use generic online templates for design projects?",
    answer:   "No. All layouts, vector files, and brand assets are built from scratch using industry-standard design tools — never generic consumer-level web templates.",
  },
] as const

// ─── ABOUT PAGE CONTENT ──────────────────────────────────────────────────────
export const ABOUT_VALUES = [
  {
    iconName: "Target",
    color:    BRAND.green,
    title:    "We Keep It Simple",
    desc:     "No confusing jargon. We explain everything in plain language.",
  },
  {
    iconName: "Heart",
    color:    BRAND.green,
    title:    "Community First",
    desc:     "We serve our neighbourhood with pride and genuine care.",
  },
  {
    iconName: "Lightning",
    color:    BRAND.green,
    title:    "Fast & Reliable",
    desc:     "We respect your time and always deliver with consistency.",
  },
] as const

export const ABOUT_STANDARDS = [
  {
    id:          1,
    iconName:    "Desktop",
    title:       "Premium Vector Accuracy",
    description: "We design entirely on our studio workstation using professional vector tools. No generic, low-quality templates — every logo, card layout, and letterhead is built custom for sharp, professional output.",
  },
  {
    id:          2,
    iconName:    "Printer",
    title:       "Megatank Economy Prints",
    description: "Equipped with the high-yield Canon Pixma G3420 continuous ink system, we provide rich, vibrant color layouts and documents at a fraction of the price of massive commercial retailers.",
  },
  {
    id:          4,
    iconName:    "DeviceMobile",
    title:       "Direct WhatsApp Pipeline",
    description: "No long automated queues or unreturned emails. Our business runs directly via a secure WhatsApp pipeline, ensuring your orders, updates, and tracking stay fast and personal.",
  },
] as const

// ─── CONTACT PAGE CONTENT ────────────────────────────────────────────────────
export const CONTACT_LINKS = [
  {
    dot:   BRAND.whatsapp,
    title: "WhatsApp Us",
    value: BIZ.phone,
    href:  WA.contact,
  },
  {
    dot:   BRAND.blue,
    title: "Call Us",
    value: BIZ.phone,
    href:  `tel:${BIZ.phoneE164}`,
  },
  {
    dot:   BRAND.orangeDark,
    title: "Email Us",
    value: BIZ.email,
    href:  `mailto:${BIZ.email}`,
  },
  {
    dot:   BRAND.blueDark,
    title: "Visit Us",
    value: BIZ.addressFull,
    href:  BIZ.mapsUrl,
  },
] as const

// ─── FOOTER LINKS ────────────────────────────────────────────────────────────
export const FOOTER_NAV = [
  { label: "Home",       path: "/" },
  { label: "Services",   path: "/services" },
  { label: "Gallery",    path: "/gallery" },
  { label: "About",   path: "/about" },
  { label: "Contact",    path: "/contact" },
] as const
 
