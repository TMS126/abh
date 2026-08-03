import { HubId } from "@/lib/data"

// Hub-level fallback tips — shown in the Tips tab for any service that
// doesn't have its own item-specific `tips` array (currently only
// Docu Hub → CV Services has specific ones). Written to resonate with
// what that hub's clients actually ask about, so every hub gets a
// genuinely useful Tips tab instead of losing the tab outside CV Services.
export const HUB_FALLBACK_TIPS: Record<HubId, string[]> = {
  print: [
    "Send your file ahead via WhatsApp or email if you can — it saves time when you arrive.",
    "Double-check page count and colour vs. black & white before printing, especially for larger jobs.",
    "Ask about bulk pricing if you're printing more than a few pages — it kicks in automatically from 10+.",
  ],
  doc: [
    "Bring any reference documents (ID, existing CV, prior letters) — it speeds up typing and formatting.",
    "Mention deadlines upfront so we can flag anything that needs rushing.",
    "For anything official (affidavits, certified documents), ask us whether it needs to be sworn or certified afterward.",
  ],
  design: [
    "The more reference images or examples you share, the closer the first draft lands to what you want.",
    "Decide on your must-have colours/text upfront — it avoids extra revision rounds later.",
    "Let us know where the design will be used (print, WhatsApp, social media) — it changes the sizing and format.",
  ],
  eservice: [
    "Bring your ID and any reference numbers (SASSA, SARS, NSFAS) you already have — it speeds up the whole process.",
    "Make sure your cellphone is with you and reachable — most portals send an OTP during submission.",
    "Government processing after submission is outside our control — we'll give you your reference number to track it yourself.",
  ],
  tech: [
    "Back up anything important before bringing your device in, especially for installs or repairs.",
    "Describe exactly what's going wrong (when it started, any error messages) — it helps us diagnose faster.",
    "Bring your charger and any relevant license keys or logins if the job needs them.",
  ],
}

export function getServiceTips(hubId: HubId, itemTips?: string[]): { tips: string[]; isGeneric: boolean } {
  if (itemTips && itemTips.length > 0) return { tips: itemTips, isGeneric: false }
  return { tips: HUB_FALLBACK_TIPS[hubId] ?? [], isGeneric: true }
}
