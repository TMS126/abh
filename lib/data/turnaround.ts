import type { HubId } from './types'

export const TURNAROUND: Record<string, string> = {
  "Printing":            "15–30 mins",
  "Copying":             "10–20 mins",
  "Photo Printing":      "20–40 mins",
  "Scanning":            "10–15 mins",
  "Laminating":          "10–20 mins",
  "Typing + Printing":   "1–3 hours",
  "CV Services":         "1–3 hours",
  "Other Documents":     "1–2 hours",
  "Logos":               "2–3 days",
  "Business Cards":      "1–2 days",
  "Flyers & Posters":    "1–2 days",
  "Social Media":        "24–48 hours",
  "Invitations":         "1–2 days",
  "Business Profile":    "2–4 days",
  "Revisions":           "2–6 hours",
  "SASSA":               "24 hours",
  "SARS":                "24 hours",
  "PSIRA":               "1–2 days",
  "Online Applications": "24 hours",
  "Email Services":      "15–30 mins",
  "Business Services":   "1–2 days",
  "Digital Setup":       "2–4 hours",
  "Software":            "1–3 hours",
  "Hardware":            "1–2 days",
  "Support":             "2–6 hours",
  "Windows & Office":    "2–6 hours",
}

export const TURNAROUND_OVERRIDE: Record<string, string> = {
  "Premium Logo":               "3–5 days",
  "Standard Logo":              "3–5 days",
  "Cover Letter":                "2–4 hours",
  "Video":                       "3–5 days",
  "Tax Return / VAT / PAYE":     "2–3 days",
  "Good Standing Letter":        "3–5 days",
  "Google Business Setup":       "2–4 hours",
  "UIF Registration":            "2–3 days",
  "UIF Monthly Declaration":     "2–3 days",
  "UIF Claims":                  "2–3 days",
  "CSD Registration":            "1–2 days",
  "Learner's Licence Booking":   "24 hours",
  "PC Setup":                    "2–6 hours",
  "PC Cleanup":                  "2–6 hours",
  "Virus / Malware Removal":     "2–6 hours",
}

export const TURNAROUND_DISCLAIMER =
  "Turnaround times are estimates based on standard volume. Factors such as load shedding, third-party system downtime (SARS/SASSA/PSIRA), or complex revision requests may affect final delivery. We appreciate your patience as we ensure the highest quality for your work."

export const HUB_DISCLAIMERS: Record<HubId, string> = {
  print:
    "Please note: Turnaround times are estimates based on standard volume. Factors such as load shedding, large bulk orders, or specialized paper availability may affect final delivery. We appreciate your patience as we ensure the highest print quality for your work.",
  doc:
    "Please note: Turnaround times are estimates based on the length and complexity of the document. Factors such as load shedding or the volume of typing required may affect final delivery. We appreciate your patience as we ensure your documents are professional and error-free.",
  design:
    "Please note: Turnaround times are estimates based on current design queues. Factors such as the complexity of your design brief, the number of requested revisions, and the creative process may affect final delivery. We appreciate your patience as we craft a high-quality visual identity for your brand.",
  eservice:
    "Please note: Turnaround times are estimates based on standard processing. Factors such as third-party system downtime (SARS, SASSA, PSIRA, or CSD), internet connectivity, or government portal delays may affect final delivery. We appreciate your patience as we navigate these external systems to complete your application.",
  tech:
    "Please note: Turnaround times are estimates based on the nature of the technical issue. Factors such as hardware part availability, the complexity of the repair/installation, or data backup requirements may affect final delivery. We appreciate your patience as we ensure your technology is secure and fully functional.",
}
