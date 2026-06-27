import { BIZ } from "./info"

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
