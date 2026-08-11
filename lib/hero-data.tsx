// lib/hero-data.ts
// Hub metadata for the hero-section photo collage. Color values are now
// derived from HUB_COLORS (lib/brand.ts) instead of a separate hardcoded
// mapping — the old version had drifted: E-Service used blue-family hex
// values here despite HUB_COLORS deliberately using teal for E-Service to
// avoid colliding with Print's blue, and Tech hardcoded "#B8CCE0" as a raw
// string instead of referencing BRAND.techGreyDark. Single source now.
import {
  Printer,
  FileText,
  PaintBrush,
  Globe,
  Desktop,
} from "@phosphor-icons/react"
import { BRAND, HUB_COLORS } from "@/lib/brand"

export const HUBS_DATA = [
  {
    id: "print",
    name: "Print Hub",
    icon: (active: boolean) => (
      <Printer size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Printer,
    colorLight: HUB_COLORS.print.accentLight,
    colorDark:  HUB_COLORS.print.accentDark,
    services: [
      { name: "B&W Print",        price: "R5"  },
      { name: "Colour Print",     price: "R8"  },
      { name: "B&W Copy",         price: "R3"  },
      { name: "Colour Copy",      price: "R5"  },
      { name: "Photo 4x6 Glossy", price: "R20" },
      { name: "Photo A4 Glossy",  price: "R40" },
    ],
  },
  {
    id: "doc",
    name: "Docu Hub",
    icon: (active: boolean) => (
      <FileText size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: FileText,
    colorLight: HUB_COLORS.doc.accentLight,
    colorDark:  HUB_COLORS.doc.accentDark,
    services: [
      { name: "CV from Scratch",    price: "R30" },
      { name: "CV Upgrade",         price: "R40" },
      { name: "Cover Letter",       price: "R30" },
      { name: "Affidavit / Letter", price: "R20" },
      { name: "Scanning (per page)", price: "R5" },
      { name: "Laminating A4",      price: "R15" },
    ],
  },
  {
    id: "design",
    name: "Design Hub",
    icon: (active: boolean) => (
      <PaintBrush size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: PaintBrush,
    colorLight: HUB_COLORS.design.accentLight,
    colorDark:  HUB_COLORS.design.accentDark,
    services: [
      { name: "Logo (Basic)",       price: "R300" },
      { name: "Logo (Standard)",    price: "R500" },
      { name: "Business Card",      price: "R120" },
      { name: "Flyer (Custom)",     price: "R250" },
      { name: "Social Media Post",  price: "R80"  },
      { name: "Invitation (Image)", price: "R150" },
    ],
  },
  {
    id: "eservice",
    name: "E-Service Hub",
    icon: (active: boolean) => (
      <Globe size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Globe,
    // FIX: was BRAND.blueMid / BRAND.lightBlue — blue family, colliding
    // with Print Hub exactly as brand.ts's own comment warns against.
    colorLight: HUB_COLORS.eservice.accentLight,
    colorDark:  HUB_COLORS.eservice.accentDark,
    services: [
      { name: "SASSA Status Check",         price: "R20"  },
      { name: "SASSA SRD Application",      price: "R40"  },
      { name: "SASSA Grant Application",    price: "R80"  },
      { name: "SARS New Taxpayer / eFiling", price: "R70" },
      { name: "NSFAS Application",          price: "R80"  },
      { name: "UIF Claims",                 price: "R200" },
    ],
  },
  {
    id: "tech",
    name: "Tech Hub",
    icon: (active: boolean) => (
      <Desktop size={28} weight={active ? "fill" : "regular"} aria-hidden="true" />
    ),
    Icon: Desktop,
    // FIX: colorDark was a hardcoded "#B8CCE0" string — now references
    // the token (HUB_COLORS.tech.accentDark === BRAND.techGreyDark),
    // same value but no longer silently divergeable.
    colorLight: HUB_COLORS.tech.accentLight,
    colorDark:  HUB_COLORS.tech.accentDark,
    services: [
      { name: "Software Install",              price: "R80"  },
      { name: "PC Setup",                      price: "R250" },
      { name: "Virus Removal",                 price: "R200" },
      { name: "Windows Install + Activation",  price: "R350" },
      { name: "Microsoft 365 Setup",           price: "R150" },
      { name: "Troubleshooting (per hr)",      price: "R150" },
    ],
  },
]

export function pickRandomService(hubIndex: number, excludeName?: string) {
  const list = HUBS_DATA[hubIndex].services
  if (list.length === 1) return list[0]
  let next = list[Math.floor(Math.random() * list.length)]
  let attempts = 0
  while (next.name === excludeName && attempts < 5) {
    next = list[Math.floor(Math.random() * list.length)]
    attempts++
  }
  return next
} 
