import { BIZ } from "../business/info"
import { WA } from "../business/whatsapp"

export const CONTACT_LINKS = [
  {
    title: "WhatsApp Us",
    value: BIZ.phone,
    href: WA.contact,
  },
  {
    title: "Call Us",
    value: BIZ.phone,
    href: `tel:${BIZ.phoneE164}`,
  },
  {
    title: "Email Us",
    value: BIZ.email,
    href: `mailto:${BIZ.email}`,
  },
  {
    title: "Visit Us",
    value: BIZ.addressFull,
    href: BIZ.mapsUrl,
  },
] as const
