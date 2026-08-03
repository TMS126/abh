import { HubId } from "@/lib/data"

// Item-level dynamic tips. If a specific service provides `tips` we use
// those verbatim. Otherwise we try to synthesize short, practical tips
// based on the service's section and item name so the Tips tab is useful
// and focused on the thing the customer is about to request.
// If we can't generate anything useful, fall back to the older hub-level
// tips (still reasonably helpful).
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

function normalize(s: string | undefined) {
  return (s || "").toLowerCase().trim()
}

function generateItemTips(sectionTitle: string | undefined, itemName: string | undefined): string[] {
  const section = normalize(sectionTitle)
  const name = normalize(itemName)
  const combined = `${section} ${name}`
  const tips: string[] = []

  // CV / Resume / Cover letter
  if (combined.includes("cv") || combined.includes("resume") || combined.includes("cover")) {
    tips.push("Bring any existing CV or job adverts you9re applying for — we can tailor keywords and layout to match.")
    tips.push("Use a recent, professional photo only if requested; many employers prefer no photo.")
    tips.push("List out your key achievements with numbers where possible (e.g., “Increased sales 30%”); this helps us write punchy bullet points.")
    return tips
  }

  // Passport / ID / Photo services
  if (combined.includes("passport") || combined.includes("id photo") || combined.includes("photo")) {
    tips.push("Wear neutral clothing and avoid heavy makeup or sunglasses for ID/passport photos.")
    tips.push("If a specific size is required (e.g., passport, visa), tell us up front so we produce the exact dimensions.")
    return tips
  }

  // Printing / Photocopying / Scanning
  if (section.includes("print") || combined.includes("print") || combined.includes("photocopy") || combined.includes("scan")) {
    tips.push("Bring the original document or a high-quality file to avoid blurry scans or low-resolution prints.")
    tips.push("If you need duplex printing or special paper (gloss/matte), mention it when you order.")
    tips.push("For many pages, ask about stapling, binding, or bulk discounts before we print.")
    return tips
  }

  // Business cards / Flyers / Posters / Design
  if (combined.includes("business card") || combined.includes("flyer") || combined.includes("poster") || section.includes("design")) {
    tips.push("Provide your logo (SVG or high-resolution PNG) and any brand colours/hex codes to keep things consistent.")
    tips.push("Specify the final use (print size, social media, WhatsApp) so we export the correct file format and resolution.")
    tips.push("If you want bleed or crop marks for print, tell us — we can prepare print-ready PDFs.")
    return tips
  }

  // Laminating / Binding
  if (combined.includes("lamin") || combined.includes("bind") || combined.includes("binding")) {
    tips.push("Confirm the exact pages you want laminated or bound — laminating is permanent for single pages.")
    tips.push("For documents that must remain editable, choose binding instead of laminating.")
    return tips
  }

  // Technical repairs / Install / Support
  if (section.includes("tech") || combined.includes("repair") || combined.includes("install") || combined.includes("setup")) {
    tips.push("Back up your data before handing over devices — we may need to reset or reinstall to fix problems.")
    tips.push("Bring any chargers, passwords, or account info related to the device; they speed up diagnostics and repairs.")
    tips.push("Describe when the problem started and any recent changes (apps installed, updates) — that9s often the key to a quick fix.")
    return tips
  }

  // eServices / Government forms / Submissions
  if (section.includes("eservice") || combined.includes("sassa") || combined.includes("sars") || combined.includes("nsfas") || combined.includes("application")) {
    tips.push("Bring original ID and any supporting documents (proof of address, bank statements) — portals usually require scans or photos.")
    tips.push("Have your cellphone ready for OTPs and keep an eye on SMS during submission.")
    tips.push("We submit and provide you with a reference number — keep it for tracking and follow-up with the relevant agency.")
    return tips
  }

  // Generic but item-focused: use words in the item name to guess
  if (name.includes("logo") || name.includes("brand") || name.includes("identity")) {
    tips.push("Tell us what feelings or adjectives the brand should communicate (e.g., friendly, professional, modern).")
    tips.push("Share any competitor examples you like so we can avoid accidental similarity.")
    return tips
  }

  if (name.includes("cv") === false && name.length > 0) {
    // If we have an item name but none of the above matched, offer some general, practical tips
    tips.push(`If you have any reference files or examples, bring them — they help us get the first draft right for “${itemName}”.`)
    tips.push("Tell us your final use or deadline so we prioritise format and turnaround correctly.")
    return tips
  }

  return []
}

export function getServiceTips(
  hubId: HubId,
  sectionTitle?: string,
  itemName?: string,
  itemTips?: string[]
): { tips: string[]; isGeneric: boolean } {
  // If the item itself provides tips, use those
  if (itemTips && itemTips.length > 0) return { tips: itemTips, isGeneric: false }

  // First try to generate item-specific tips from the section/title/name
  const generated = generateItemTips(sectionTitle, itemName)
  if (generated.length > 0) return { tips: generated, isGeneric: false }

  // Fall back to hub-level tips if generation failed
  return { tips: HUB_FALLBACK_TIPS[hubId] ?? [], isGeneric: true }
}
