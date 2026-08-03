import { HubId } from "@/lib/data"

// Item-level dynamic tips. Checked most-specific-first: exact service
// keywords → section-level → hub-level fallback. Keeps the Tips tab
// genuinely tailored to what the customer is about to request rather
// than generic hub advice.
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

// ── Item-specific tip generator ──
// Ordered from most specific keyword matches to broadest. Returns as soon
// as a category matches, so a "Black & White Printing" item gets its own
// exact tips rather than falling into the generic "print" catch-all below it.
function generateItemTips(sectionTitle: string | undefined, itemName: string | undefined): string[] {
  const section = normalize(sectionTitle)
  const name = normalize(itemName)
  const combined = `${section} ${name}`

  // Black & White printing/copying
  if ((combined.includes("black") && combined.includes("white")) && (section.includes("print") || section.includes("copy"))) {
    return [
      "Black & white keeps small text sharpest — great for documents, contracts, and anything text-heavy.",
      "Photos and graphics convert to greyscale automatically; if contrast matters, colour usually reads clearer.",
      "Bulk pricing kicks in automatically from 10+ pages — mention your page count upfront.",
    ]
  }

  // Colour printing/copying
  if (combined.includes("colour") && (section.includes("print") || section.includes("copy"))) {
    return [
      "Bring your file in its original resolution — low-res images can look blurry or pixelated when printed large.",
      "If exact brand colours matter (logo, letterhead), let us know — screen colours and print colours can shift slightly.",
      "Bulk pricing kicks in automatically from 10+ pages — mention your page count upfront.",
    ]
  }

  // CV / Resume / Cover letter
  if (combined.includes("cv") || combined.includes("resume") || combined.includes("cover")) {
    return [
      "Bring any existing CV or job adverts you're applying for — we can tailor keywords and layout to match.",
      "Use a recent, professional photo only if requested; many employers prefer no photo.",
      "List out your key achievements with numbers where possible (e.g. \"Increased sales 30%\") — this helps us write punchy bullet points.",
    ]
  }

  // Passport / ID / Photo services
  if (combined.includes("passport") || combined.includes("id photo") || combined.includes("photo")) {
    return [
      "Wear neutral clothing and avoid heavy makeup or sunglasses for ID/passport photos.",
      "If a specific size is required (passport, visa, etc.), tell us up front so we produce the exact dimensions.",
    ]
  }

  // Business cards
  if (combined.includes("business card")) {
    return [
      "Provide your logo (SVG or high-resolution PNG) and exact contact details — double-check spelling before we print.",
      "Decide between single or double-sided upfront; double-sided fits a QR code or social handles nicely.",
      "Matte or gloss finish? Let us know your preference before the final print run.",
    ]
  }

  // Flyers / Posters
  if (combined.includes("flyer") || combined.includes("poster")) {
    return [
      "Share the exact event/promo details (date, time, price) written out — avoids last-minute text changes.",
      "Tell us the intended size and where it'll be displayed (print, WhatsApp, social) so we export it correctly.",
      "A clear headline and one strong image usually outperform a flyer packed with text.",
    ]
  }

  // Invitations
  if (combined.includes("invitation")) {
    return [
      "Share the full event details (date, time, venue, dress code if any) exactly as you want them worded.",
      "Video invitations take longer to produce — let us know your date so we can plan turnaround.",
      "Send us any theme colours or reference invitations you like the style of.",
    ]
  }

  // Logo / Brand identity
  if (name.includes("logo") || name.includes("brand") || name.includes("identity")) {
    return [
      "Tell us what feelings or adjectives the brand should communicate (e.g. friendly, professional, modern).",
      "Share any competitor examples you like so we can avoid accidental similarity.",
      "Standard and Premium tiers include multiple concepts — decide upfront if you want options to choose from.",
    ]
  }

  // Social media posts
  if (section.includes("social") || combined.includes("social media")) {
    return [
      "Tell us which platform it's for (Instagram, Facebook, WhatsApp Status) — sizing differs between them.",
      "Share the exact caption/message wording so nothing gets typo'd or reworded by accident.",
    ]
  }

  // Letterhead
  if (combined.includes("letterhead")) {
    return [
      "Provide your logo, business name, and contact details exactly as they should appear — this becomes a template you'll reuse.",
      "Let us know if you need both a digital (Word/PDF) and print-ready version.",
    ]
  }

  // Laminating / Binding
  if (combined.includes("lamin") || combined.includes("bind")) {
    return [
      "Confirm the exact pages you want laminated — laminating is permanent, so double-check before we start.",
      "For documents you'll need to edit later, choose binding instead of laminating.",
    ]
  }

  // Affidavits / typed letters
  if (combined.includes("affidavit") || combined.includes("letter")) {
    return [
      "Bring your ID document — most affidavits and formal letters need it for reference.",
      "Some affidavits require swearing in front of a Commissioner of Oaths after typing — ask us if yours does.",
    ]
  }

  // Scanning
  if (combined.includes("scan")) {
    return [
      "Bring the original physical document — scan quality depends on the condition of what you bring in.",
      "Let us know the file format you need (PDF, JPG) and where it should be sent.",
    ]
  }

  // Generic printing / photocopying (catch-all within Print/Docu hubs, after the more specific B&W/colour checks above)
  if (section.includes("print") || combined.includes("photocopy")) {
    return [
      "Bring the original document or a high-quality file to avoid blurry scans or low-resolution prints.",
      "For many pages, ask about stapling, binding, or bulk discounts before we print.",
    ]
  }

  // Tech repairs / installs / setup
  if (section.includes("tech") || combined.includes("repair") || combined.includes("install") || combined.includes("setup")) {
    return [
      "Back up your data before handing over devices — we may need to reset or reinstall to fix problems.",
      "Bring any chargers, passwords, or account info related to the device; they speed up diagnostics and repairs.",
      "Describe when the problem started and any recent changes (apps installed, updates) — that's often the key to a quick fix.",
    ]
  }

  // eServices / Government forms
  if (section.includes("eservice") || combined.includes("sassa") || combined.includes("sars") || combined.includes("nsfas") || combined.includes("application")) {
    return [
      "Bring original ID and any supporting documents (proof of address, bank statements) — portals usually require scans or photos.",
      "Have your cellphone ready for OTPs and keep an eye on SMS during submission.",
      "We submit and provide you with a reference number — keep it for tracking and follow-up with the relevant agency.",
    ]
  }

  // Nothing matched a specific category — fall back to a general, still item-aware tip
  if (itemName) {
    return [
      `If you have any reference files or examples, bring them — they help us get the first draft right for "${itemName}".`,
      "Tell us your final use or deadline so we prioritise format and turnaround correctly.",
    ]
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

  // Try to generate item-specific tips from the section/name
  const generated = generateItemTips(sectionTitle, itemName)
  if (generated.length > 0) return { tips: generated, isGeneric: false }

  // Fall back to hub-level tips if generation failed
  return { tips: HUB_FALLBACK_TIPS[hubId] ?? [], isGeneric: true }
}