// components/services-page/service-detail-modal/fallback-tips.ts

import { HubId } from "@/lib/data"

function normalize(s: string | undefined) {
  return (s || "").toLowerCase().trim()
}

// ─────────────────────────────────────────────────────────
// APEXBYTES HUB - FINAL TIPS SYSTEM
// Architecture:
// 1. Exact composite key: hub|section|item  (most specific)
// 2. hub|item
// 3. section|item
// 4. Exact item name
// 5. Whole-word partial match (scoped to prevent collisions)
// 6. Intelligent item-aware fallback (never hub-generic)
// 
// Tone: practical, positive, realistic
// - What to bring
// - What you receive
// - How to get best result
// - Turnaround / aftercare
// Design Hub = design only, no printing
// Laminating = A5-A3 machine only
// No comb binding - stapler / clips / hole punch only
// ─────────────────────────────────────────────────────────

const ITEM_TIPS_MAP: Record<string, string[]> = {
  // ==================== PRINT HUB ====================
  "print|b&w print": [
    "What to bring: PDF keeps layout exact — Word files can shift margins on different computers.",
    "What you get: Sharp black and white prints on 80gsm, with bulk pricing from 10+ pages automatically applied.",
    "Best result: If your file has one colour page inside, tell us — we charge only that page as colour.",
  ],
  "print|colour print": [
    "What to bring: Original quality files — high-resolution PDFs or original photos sent as Document in WhatsApp.",
    "What you get: Full-colour prints with consistent colour, available on 80gsm or 100gsm if you need thicker paper.",
    "Best result: For exact brand colours, bring a printed sample — screen colours can look slightly different in print.",
  ],
  "print|b&w copy": [
    "What to bring: Original document if possible — copies of copies lose clarity.",
    "What you get: Clean B&W copies, with option for both sides on one page for IDs.",
    "Best result: Place original flat in centre of glass — corners can copy darker.",
  ],
  "print|colour copy": [
    "What to bring: Original document — photos of documents taken with a phone can have glare.",
    "What you get: Colour copies that match the original, available as single or double-sided.",
    "Best result: Mention if it's a photo or document so we use the right colour setting.",
  ],
  "print|glossy photo (4x6)": [
    "What to bring: High-resolution photo — send as Document in WhatsApp to avoid compression.",
    "What you get: 4x6 glossy print ready for albums, frames, or applications.",
    "Aftercare: We keep your photo on file for 6 months if you need a reprint.",
  ],
  "print|glossy photo (a4)": [
    "What to bring: Highest quality original — A4 enlarges 4x more than 4x6, so quality matters more.",
    "What you get: A4 glossy print suitable for framing or display.",
    "Best result: For photos going behind glass, ask for our Matte option to reduce glare and prevent the photo from sticking to the glass.",
  ],

  // ==================== DOC HUB ====================
  "doc|typing + printing b&w": [
    "What to bring: Handwritten notes with page numbers — helps keep order correct.",
    "What you get: Typed document printed in black and white, proofread for typos.",
    "Turnaround: Most 1-2 page letters done while you wait; longer documents may take 30-60 minutes.",
  ],
  "doc|typing + printing colour": [
    "What to bring: Notes plus any reference layout you like — we match it.",
    "What you get: Typed document with colour headings or full colour as requested, printed and ready.",
    "Best result: If only the header is colour, we can print header colour and body B&W to save you cost — just ask.",
  ],
  "doc|cv from scratch": [
    "What to bring: ID, qualifications, work history — even informal or piece jobs help us describe your experience.",
    "What you get: Professional 1-2 page CV in PDF and Word, tailored to South African employers.",
    "Best result: Bring 1-2 job adverts you're applying for — we match keywords to what employers search for.",
  ],
  "doc|cv upgrade/fix": [
    "What to bring: Your current CV, even if layout is broken — helps keep dates accurate.",
    "What you get: Fixed layout, improved wording, and PDF that looks same on any phone or computer.",
    "Aftercare: We keep old and new versions until you're happy with the final.",
  ],
  "doc|cover letter": [
    "What to bring: Job advert details and company name — we write one letter per application.",
    "What you get: One-page cover letter matching your CV font and style.",
    "Best result: Three short paragraphs works best — about you, about the company, and closing with contact.",
  ],
  "doc|affidavit / letter": [
    "What to bring: ID and any reference numbers like case numbers for police-related affidavits.",
    "What you get: Typed affidavit or formal letter ready for Commissioner of Oaths.",
    "Important: Don't sign before you come — legally, affidavits must be signed in front of the Commissioner after typing.",
  ],
  "doc|scan to digital": [
    "What to bring: Original physical document — originals scan sharper than photos of documents.",
    "What you get: Scanned file as PDF for official use or JPG for WhatsApp, sent to your email or phone.",
    "Best result: Have your email written correctly — double-check spelling before we send.",
  ],
  "doc|laminating a5": [
    "What to bring: Document flat, not folded — creases stay visible after laminating.",
    "What you get: A5 laminated document with trimmed edges, protected from water and tearing.",
    "Note: Our laminator handles A5 to A3 — A5 is the smallest size, we cannot laminate smaller than A5.",
  ],
  "doc|laminating a4": [
    "What to bring: Document flat — if you need to certify it later, certify first then laminate the certified copy.",
    "What you get: A4 laminated in 2 minutes while you wait, with neat trimmed edges.",
    "Note: Laminating is permanent; most officials will not certify a document once it is sealed in plastic.",
  ],
  "doc|laminating a3": [
    "What to bring: A3 document flat — this is the largest size our machine handles, we cannot laminate A2/A1/A0.",
    "What you get: A3 laminated poster or certificate, protected for longer display.",
    "Best result: Useful for posters that will be handled often or displayed where they might get dusty.",
  ],

  // ==================== DESIGN HUB (DESIGN ONLY) ====================
  "design|logos basic": [
    "What to bring: 2 examples you like and 3 words that describe your business — for example friendly, modern, professional.",
    "What you get: 1 logo concept, 2 revisions, delivered as PNG and print-ready PDF in colour, black, and white versions.",
    "Turnaround: Usually same day if details are provided upfront.",
  ],
  "design|logos standard": [
    "What to bring: Brief description of your business and where you'll use the logo — shop sign, social media, T-shirts.",
    "What you get: 3 logo concepts to choose from, plus final files as PNG, JPG, PDF, and source file.",
    "Best result: Includes simple mockups so you can see how it looks on a business card and T-shirt before you print elsewhere.",
  ],
  "design|logos premium": [
    "What to bring: Business name, tagline if you have one, and any colours you prefer.",
    "What you get: Full brand kit — logo plus colours, fonts, usage guidelines, letterhead and business card designs.",
    "Aftercare: We keep your files for a year — if you lose them, we resend free.",
  ],
  "design|business cards single side": [
    "What to bring: Logo, name, services, and one WhatsApp number — we design the file only, printing is done elsewhere for now.",
    "What you get: Single-side design with print-ready PDF including bleed and crop marks for any printer.",
    "Best result: Clean layout with name, what you do, and contact — plus optional QR code to your location.",
  ],
  "design|business cards double side": [
    "What to bring: Front details plus back details like services list, map, or QR code.",
    "What you get: Double-side design with print-ready files for any print shop.",
    "Best result: Use back for useful info — services, hours, or location — so clients keep the card.",
  ],
  "design|flyers & posters simple": [
    "What to bring: Headline, key details like date, time, venue, and one good image if you have it.",
    "What you get: Simple, clear design delivered as A5 print-ready PDF plus square version for WhatsApp and Facebook.",
    "Turnaround: Usually 2 hours when details are complete.",
  ],
  "design|flyers & posters custom": [
    "What to bring: High-quality photos sent as Document plus exact wording you want.",
    "What you get: Custom design with your photos edited, two style options, and files for print and online use.",
    "Best result: Share a reference flyer you like — helps us match the style you want on first draft.",
  ],
  "design|flyers & posters complex": [
    "What to bring: All text upfront — price list, services, map, photos — adding content later may need revision fee.",
    "What you get: Complex layout with multiple sections, delivered as A3 300dpi for printing plus 1080px for WhatsApp.",
    "Policy: Minor text fixes after completion are R80; major layout changes or adding new sections will require a new design fee.",
  ],
  "design|social media post": [
    "What to bring: Exact wording you want — we copy it exactly to avoid typos.",
    "What you get: 1080x1080 square post ready for Facebook, Instagram, and WhatsApp Status without cropping.",
    "Best result: Short text with big headline reads better on phones than many small words.",
  ],
  "design|social media post + story": [
    "What to bring: Same wording and images — we resize same design for two formats.",
    "What you get: Two files — square for feed and 1080x1920 for story/status, designed with safe space for app buttons.",
    "Best result: Post the square in morning, story in evening — same message, two placements, saves you paying separately.",
  ],
  "design|invitations static": [
    "What to bring: Names exactly as you want spelled, date, time, venue, and theme colours.",
    "What you get: Static invitation as JPG for WhatsApp plus PDF for printing elsewhere.",
    "Best result: If printing elsewhere, we recommend ordering 10 extra copies — reprinting small quantities later is much more expensive.",
  ],
  "design|invitations video": [
    "What to bring: 5 best photos, event details worded exactly, and music preference if you have one.",
    "What you get: 15-30 second animated video as MP4, with and without music versions.",
    "Turnaround: Needs a day — not same hour — for animation and music syncing.",
  ],
  "design|business profile basic (1 page)": [
    "What to bring: Who you are, what you do, contact details, and 2-3 photos of your work.",
    "What you get: One-page profile as Word (editable) plus PDF for sending to clients.",
    "Best result: Ideal for WhatsApp catalogue — short, clear, with contact visible.",
  ],
  "design|business profile standard (2–3 pages)": [
    "What to bring: Services list, 5-6 photos of actual work (not Google images), and company details.",
    "What you get: 2-3 page profile with cover, services, and photos, as Word and PDF.",
    "Best result: Good length for tenders that need more than one page but not full company history.",
  ],
  "design|business profile premium (4–5 pages)": [
    "What to bring: Full company info — team, mission, services, past work photos, pricing if you want included.",
    "What you get: 4-5 page profile with cover, table of contents, and consistent styling, as Word and PDF.",
    "Aftercare: We keep file for a year — Word version lets you update prices yourself later.",
  ],
  "design|extra page (beyond 5)": [
    "What to bring: Content for the extra page — text and images ready.",
    "What you get: Extra page matched to same style — same fonts, colours, layout so profile stays consistent.",
    "Best result: Only add pages when you have enough content — a concise 5 pages reads better than 8 with empty space.",
  ],
  "design|revisions while busy": [
    "What to bring: List of corrections while we are still designing in same session.",
    "What you get: Quick fix while file is still open — spelling and small layout adjustments.",
    "Note: While-busy rate is for same session — after we export and send, it becomes after-completion rate.",
  ],
  "design|revisions after completion": [
    "What to bring: All changes together in one list — sending one by one means multiple revision fees.",
    "What you get: File reopened, corrected, re-exported, and resent.",
    "Best result: Keep the file name we send — helps us track versions quickly.",
  ],

  // ==================== E-SERVICE HUB ====================
  "eservice|sassa status check": [
    "What to bring: ID number and phone that can receive SMS — system sends OTP to that phone.",
    "What you get: Current SRD status checked and explained — what each stage means and next steps.",
    "Best result: Screenshot the result for your records — SASSA system can be offline later.",
  ],
  "eservice|sassa update details": [
    "What to bring: ID and new details written down — phone number, address, etc.",
    "What you get: Details updated on SASSA system and confirmation screen shown.",
    "Turnaround: Updates take about 7 days to reflect — avoid checking daily during that time.",
  ],
  "eservice|sassa reapplication": [
    "What to bring: ID, same email as first application, and bank details in your own name.",
    "What you get: Reapplication submitted with reference number provided.",
    "Best result: Use same email as before — new email can create duplicate profiles that get declined.",
  ],
  "eservice|sassa srd application": [
    "What to bring: ID, bank account in your own name, and personal email you can access.",
    "What you get: SRD application submitted with reference number screenshot for your records.",
    "Aftercare: Keep that reference — SASSA SMS sometimes doesn't arrive, but reference proves you applied.",
  ],
  "eservice|sassa appeal": [
    "What to bring: ID, reference number, and reason for appeal — we help phrase it clearly.",
    "What you get: Appeal submitted with clear motivation and confirmation provided.",
    "Note: Appeals have a 30-day window — after that, system closes until next cycle.",
  ],
  "eservice|sassa banking update": [
    "What to bring: ID and bank letter or statement not older than 3 months — account must be in your name.",
    "What you get: Banking details updated and confirmation shown.",
    "Turnaround: Updates take 7-14 days to reflect — keep your old account open for one month in case the next payment goes there first.",
  ],
  "eservice|sassa grant application": [
    "What to bring: Your ID, child's birth certificate, clinic card, and proof of income if applicable.",
    "What you get: Grant application submitted with reference to track at SASSA office.",
    "Turnaround: Grants take up to 3 months to approve — keep your reference number to follow up at the SASSA office if you don't receive an SMS.",
  ],
  "eservice|sars enquiry / statement / updates": [
    "What to bring: ID and phone that receives SARS OTP — needed for every login.",
    "What you get: Statement checked, printed, and explained in simple terms — what you owe or what you'll receive.",
    "Note: Enquiry is checking only — filing a return is separate service.",
  ],
  "eservice|sars new taxpayer / efiling": [
    "What to bring: ID, email you can access, and phone for OTP — email needs to be verified.",
    "What you get: SARS profile created or eFiling access set up with login details.",
    "Turnaround: Activation takes about 24 hours — plan ahead if you need a Tax PIN for a job.",
  ],
  "eservice|sars tax pin / penalty": [
    "What to bring: ID and phone for OTP — we check compliance and penalty details.",
    "What you get: Tax PIN generated if compliant, or penalty letter explaining why it failed.",
    "Best result: If you owe even R1, the PIN won't generate — we check your statement first so you don't pay for a failed application.",
  ],
  "eservice|sars tax clearance": [
    "What to bring: ID and confirmation that tax affairs are up to date.",
    "What you get: Tax clearance application submitted and PDF provided for tender use.",
    "Turnaround: Takes about 24 hours after becoming compliant — not instant.",
  ],
  "eservice|sars pin submission": [
    "What to bring: Company CSD number and your SARS PIN — needed for tender compliance.",
    "What you get: PIN submitted on CSD system with receipt screenshot as proof.",
    "Best result: Keep receipt — tender evaluators sometimes ask for submission proof.",
  ],
  "eservice|sars tax return / vat / paye": [
    "What to bring: IRP5, medical aid certificate, bank statements, and any other income documents.",
    "What you get: Return prepared and submitted, with submission confirmation provided.",
    "Note: Late filing can lead to automatic penalty — filing a few days before deadline is safest.",
  ],
  "eservice|nsfas status check": [
    "What to bring: ID and email address used for NSFAS application.",
    "What you get: Current status checked and explained — what 'submitted' vs 'provisionally funded' means.",
    "Best result: Screenshot status for your records — portal can be offline later.",
  ],
  "eservice|nsfas banking update": [
    "What to bring: ID and bank letter not older than 3 months — account must be in your name, not eWallet.",
    "What you get: Banking details updated on NSFAS portal.",
    "Turnaround: Takes about 14 days to reflect — personal bank account usually pays faster than NSFAS wallet.",
  ],
  "eservice|learnership application": [
    "What to bring: Certified documents less than 3 months old and PDF CV named clearly like Name_Surname_CV.pdf.",
    "What you get: Learnership application submitted with confirmation provided.",
    "Best result: Apply in the morning — applications often appear at top of recruiter inbox earlier in day.",
  ],
  "eservice|job / dpsa application": [
    "What to bring: New Z83 form (2021 version), CV, and certified documents less than 6 months old.",
    "What you get: Application compiled and submitted online with confirmation.",
    "Note: We recommend a 15:00 deadline on closing dates to avoid common system crashes caused by last-minute traffic.",
  ],
  "eservice|bursary application": [
    "What to bring: Certified ID less than 3 months, latest results, parents' income proof, and motivational letter handwritten if possible.",
    "What you get: Bursary application submitted with professional typed motivation letter.",
    "Best result: Include why you deserve the bursary and your future plans — helps strengthen application.",
  ],
  "eservice|nsfas appeal": [
    "What to bring: ID and new supporting documents — not same documents as before, plus reason for appeal.",
    "What you get: Appeal submitted with improved motivation explaining change in circumstances.",
    "Best result: Specific reasons with proof — for example household income proof or affidavit — work better than general requests.",
  ],
  "eservice|nsfas application": [
    "What to bring: ID, parents' IDs, proof of income, and your own email you can access long-term.",
    "What you get: NSFAS application submitted with all documents uploaded as PDFs.",
    "Best result: Upload clear PDFs, not blurry photos — the NSFAS system often rejects blurry uploads without notifying you.",
  ],
  "eservice|university application": [
    "What to bring: Certified ID less than 3 months, Grade 11 or 12 results, and ID of parent/guardian if required.",
    "What you get: University application submitted online with reference number provided.",
    "Note: Application fee is separate — paid directly to university via EFT, not included in our service fee.",
  ],
  "eservice|setup / send / receive": [
    "What to bring: Phone that can receive SMS for OTP and recovery details.",
    "What you get: Email account set up, test email sent and received, plus short training on checking inbox.",
    "Aftercare: Write recovery phone on paper and keep safe — most people lose access because they lose recovery number.",
  ],
  "eservice|good standing letter": [
    "What to bring: Company registration details — we check if annual return is filed and company is active.",
    "What you get: Good Standing application submitted and letter provided when available.",
    "Turnaround: Takes about 24 hours from CIPC — not instant — valid for 3 months, so request when needed for tender.",
  ],
  "eservice|google business setup": [
    "What to bring: Business name, 5 photos of your work, WhatsApp number, and business hours.",
    "What you get: Google Business profile set up with photos, hours, WhatsApp link, and business description.",
    "Aftercare: Verification pin arrives by post in about 5 days — you'll need to verify when it arrives to go live.",
  ],
  "eservice|uif monthly declaration": [
    "What to bring: UIF reference number and monthly salary list with ID numbers.",
    "What you get: Monthly declaration submitted and receipt provided for your records.",
    "Note: Declarations are due by the 7th each month — late declarations can affect employee payments.",
  ],
  "eservice|uif registration": [
    "What to bring: Company CIPC documents and director's ID — personal ID alone is not enough.",
    "What you get: UIF registration submitted with reference number.",
    "Turnaround: Takes about 14 days to be active — after that, monthly declarations are still required.",
  ],
  "eservice|csd update": [
    "What to bring: ID and bank letter less than 3 months old plus any details that changed.",
    "What you get: CSD updated with new report PDF provided for tender use.",
    "Best result: Update bank details on CSD same day you change bank — otherwise tender payments may go to old account.",
  ],
  "eservice|uif claims": [
    "What to bring: 6 months payslips, UI19 form from employer, ID, and bank letter in your own name.",
    "What you get: UIF claim submitted with reference number and checklist of what to expect next.",
    "Note: Claims must be made within 12 months of last working day and require registration as work-seeker on sayouth.mobi.",
  ],
  "eservice|csd registration": [
    "What to bring: CIPC documents, ID, bank letter less than 3 months, and tax clearance.",
    "What you get: CSD registration completed with CSD number and report PDF.",
    "Aftercare: Save CSD number in phone notes — every tender asks for it, retrieval costs extra if lost.",
  ],
  "eservice|social media setup": [
    "What to bring: Business name, logo, 5 photos of your work, and short description of what you do.",
    "What you get: Facebook page plus WhatsApp Business linked, with bio, profile photo, and cover set up.",
    "Best result: Pages with real photos of your work get more enquiries — we link Facebook 'Message Us' to WhatsApp for direct chat.",
  ],
  "eservice|learner's licence booking": [
    "What to bring: ID number and email address — you need R68 eNatis fee for the booking itself.",
    "What you get: Learner's booking done online with confirmation provided.",
    "Best result: Slots open at 6am and fill quickly for Bothaville — we book at 6am sharp. Receipt valid 3 months.",
  ],
  "eservice|whatsapp business setup": [
    "What to bring: Logo, 3-5 photos of products or services, business hours, and list of services.",
    "What you get: WhatsApp Business set up with business hours 07:00-20:00, auto-reply after hours, catalogue with 5 services, and quick replies.",
    "Aftercare: Quick replies like 'Price?' and 'Location?' save typing — one tap to reply to common questions.",
  ],

  // ==================== TECH HUB ====================
  "tech|software install": [
    "What to bring: Laptop plus charger — tell us 32-bit or 64-bit (check in This PC > Properties).",
    "What you get: Software installed, tested, and shortcut created on desktop.",
    "Best result: Bring exact software name and version you need — helps us install correct version first time.",
  ],
  "tech|app / office updates": [
    "What to bring: Laptop, charger, and WiFi password or hotspot — updates need internet and about 10GB free space.",
    "What you get: Apps or Office updated, restarted, and tested.",
    "Best result: Avoid installing two antiviruses — they can conflict and slow down the laptop.",
  ],
  "tech|driver installation": [
    "What to bring: Laptop model sticker — for example HP 250 G8 — and printer model if it's a printer driver.",
    "What you get: Correct drivers installed, tested with print or device check, plus driver file saved for you if needed.",
    "Best result: Exact model matters — generic drivers may not enable all features like colour printing.",
  ],
  "tech|printer setup": [
    "What to bring: Printer, USB cable, laptop, and WiFi password for wireless setup.",
    "What you get: Printer set up for laptop and phone — we test one colour and one black and white page before you leave.",
    "Best result: We set up WiFi printing so you can print from phone too, not just cable.",
  ],
  "tech|pc setup": [
    "What to bring: PC or laptop plus charger and any account details for email.",
    "What you get: Windows, drivers, Office, antivirus, email, and printer setup — about 2 hours due to updates.",
    "Aftercare: We provide password written down — keep it safe, resetting costs extra.",
  ],
  "tech|activation only": [
    "What to bring: Laptop with Windows or Office already installed and license key if you have it, plus internet access.",
    "What you get: Activation completed, watermark removed, personalization enabled.",
    "Best result: Genuine activation allows updates and wallpaper changes — trial versions show popups.",
  ],
  "tech|microsoft 365 setup": [
    "What to bring: Email address and internet access — Microsoft account needed.",
    "What you get: Microsoft 365 set up with OneDrive backup, Teams, Outlook, and Word login linked to one account.",
    "Aftercare: OneDrive backup means documents are safe if laptop is lost — we show you how to check it.",
  ],
  "tech|troubleshooting": [
    "What to bring: Device, charger, and description of problem — when it started and any error message photo helps a lot.",
    "What you get: Diagnosis within first 10 minutes — if it's a quick fix, we charge R50 instead of full hour, honest pricing.",
    "Best result: Error photo or exact wording speeds up diagnosis — 'it doesn't work' takes longer to trace.",
  ],
  "tech|pc cleanup": [
    "What to bring: Laptop plus charger.",
    "What you get: Internal dust cleaned, temporary files removed, and startup programs optimized.",
    "Aftercare: Bothaville dust builds up quickly; an internal cleaning every 6 months prevents the overheating that leads to hardware failure.",
  ],
  "tech|virus / malware removal": [
    "What to bring: Laptop plus charger — and list of important accounts if possible.",
    "What you get: Virus removed, free antivirus and ad blocker installed to help prevent return.",
    "Aftercare: Change Facebook and Gmail passwords same day — viruses can collect saved passwords before removal.",
  ],
  "tech|os update": [
    "What to bring: Laptop with at least 20GB free space and charger — battery must stay plugged during update.",
    "What you get: Operating system updated with documents backed up before update.",
    "Turnaround: Updates take 1-2 hours — you don't need to wait in shop, we call when done.",
  ],
  "tech|windows install (no activation)": [
    "What to bring: Laptop, charger, and flash drive if you want files copied — we save old files to an 'OldFiles' folder.",
    "What you get: Windows installed with drivers and antivirus — usable same day with a watermark.",
    "Note: Microsoft Office is installed but will require your own activation key to use all features.",
  ],
  "tech|windows install + activation": [
    "What to bring: Laptop, charger, and flash drive for extra backup if needed — we also backup to desktop folder.",
    "What you get: Windows installed and activated, drivers, Office, antivirus, old files saved to 'OldFiles' folder on desktop.",
    "Aftercare: We provide Windows password written down — keep it safe, and check OldFiles folder before you leave shop.",
  ],
}

// ─────────────────────────────────────────────────────────
// Lookup logic with your recommended priority
// ─────────────────────────────────────────────────────────function findExactTips(hubId: string, sectionTitle: string | undefined, itemName: string | undefined): string[] | null {
  const hub = normalize(hubId)
  const section = normalize(sectionTitle)
  const item = normalize(itemName)

  // 1. Exact composite: hub|section|item
  if (section && item) {
    const k1 = `${hub}|${section}|${item}`
    if (ITEM_TIPS_MAP[k1]) return ITEM_TIPS_MAP[k1]
  }

  // 2. hub|section+item concatenated (how most keys are actually stored,
  //    e.g. "doc|laminating a5" = hub "doc" + item "laminating a5")
  if (section && item) {
    const k2 = `${hub}|${section} ${item}`
    if (ITEM_TIPS_MAP[k2]) return ITEM_TIPS_MAP[k2]
  }

  // 3. hub|item (item alone already contains full phrase, e.g. "cv from scratch")
  if (item) {
    const k3 = `${hub}|${item}`
    if (ITEM_TIPS_MAP[k3]) return ITEM_TIPS_MAP[k3]
  }

  // 4. section|item
  if (section && item) {
    const k4 = `${section}|${item}`
    if (ITEM_TIPS_MAP[k4]) return ITEM_TIPS_MAP[k4]
  }

  // 5. Exact item name alone
  if (item && ITEM_TIPS_MAP[item]) return ITEM_TIPS_MAP[item]

  // 6. Scoped whole-word partial match — only if hub/section context matches for generic terms
  const genericTerms = new Set(["basic", "standard", "premium", "simple", "custom", "complex", "colour", "b&w", "a4", "a5", "a3", "post", "video", "static", "single side", "double side", "basic (1 page)", "standard (2–3 pages)", "premium (4–5 pages)"])

  const keys = Object.keys(ITEM_TIPS_MAP).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    const keyParts = key.split("|")
    const keyItem = keyParts[keyParts.length - 1]

    const isGeneric = genericTerms.has(keyItem) || genericTerms.has(key)
    if (isGeneric) {
      if (!key.includes(hub) && !key.includes(section)) continue
    }

    const itemWords = item.split(/\s+/)
    const matchesWholeWord =
      item === keyItem ||
      item.startsWith(keyItem + " ") ||
      item.endsWith(" " + keyItem) ||
      itemWords.includes(keyItem) ||
      item.includes(` ${keyItem} `)

    if (matchesWholeWord) {
      return ITEM_TIPS_MAP[key]
    }
  }

  return null
}

function generateItemTips(hubId: HubId, sectionTitle: string | undefined, itemName: string | undefined): string[] {
  return findExactTips(hubId, sectionTitle, itemName) ?? []
}

export function getServiceTips(
  hubId: HubId,
  sectionTitle?: string,
  itemName?: string,
  itemTips?: string[]
): { tips: string[]; isGeneric: boolean } {
  if (itemTips && itemTips.length > 0) return { tips: itemTips, isGeneric: false }

  const tips = generateItemTips(hubId, sectionTitle, itemName)
  return { tips, isGeneric: false }
}

// ─────────────────────────────────────────────────────────
// Hub-level fallback tips (used only when no item-specific
// match is found). Tips content sourced from latest approved
// copy — logic and structure unchanged.
// ─────────────────────────────────────────────────────────
export const HUB_FALLBACK_TIPS: Record<HubId, string[]> = {
  print: [
    "What to bring: Physical original or digital file on your phone or USB.",
    "What you get: High-quality print or copy on standard 80gsm paper (thicker options available).",
    "Best result: PDF files keep your layout exact; tell us the quantity upfront for bulk rates.",
  ],
  doc: [
    "What to bring: All notes, IDs, or reference details needed for your document.",
    "What you get: Professionally typed, formatted, and printed document ready for use.",
    "Best result: Double-check the spelling of names and dates before we finalize the document.",
  ],
  design: [
    "What to bring: Examples you like and any specific business details you want reflected.",
    "What you get: Custom digital design delivered in PNG and print-ready PDF formats.",
    "Best result: A clear description of your \"vibe\" (e.g., modern, professional) helps us finish faster.",
  ],
  eservice: [
    "What to bring: Your ID and the phone that receives OTP messages.",
    "What you get: Official submission or check completed with a digital confirmation screenshot provided.",
    "Best result: Ensure your phone is charged and you have access to your registered email address.",
  ],
  tech: [
    "What to bring: Your device, its power charger, and any error messages you've seen.",
    "What you get: Expert technical solution or setup with a clear explanation of what was fixed.",
    "Best result: Describe exactly when the problem started to help us diagnose it faster.",
  ],
}

function generateItemTips(hubId: HubId, sectionTitle: string | undefined, itemName: string | undefined): string[] {
  const found = findExactTips(hubId, sectionTitle, itemName)
  if (found) return found

  
  return []
}

export function getServiceTips(
  hubId: HubId,
  sectionTitle?: string,
  itemName?: string,
  itemTips?: string[]
): { tips: string[]; isGeneric: boolean } {
  if (itemTips && itemTips.length > 0) return { tips: itemTips, isGeneric: false }

  const generated = generateItemTips(hubId, sectionTitle, itemName)
  if (generated.length > 0) return { tips: generated, isGeneric: false }

  return { tips: HUB_FALLBACK_TIPS[hubId] ?? [], isGeneric: false }
} 
