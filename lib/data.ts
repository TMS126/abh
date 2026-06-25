// lib/data.ts — CONTENT ONLY, styling comes from @/lib/brand
import { HUB_COLORS, HUB_NAMES, BRAND, type HubKey } from "@/lib/brand" 

export const PRICING = {
  print: {
    'B&W Print': 'R5/page',
    'Colour Print': 'R8/page',
    'B&W Copy': 'R3/page',
    'Colour Copy': 'R5/page',
    'Glossy Photo (4x6)': 'R20',
    'Glossy Photo (A4)': 'R40',
  },
  doc: {
    'Typing + Print (B&W)': 'R15/page',
    'Typing + Print (Colour)': 'R18/page',
    'Affidavit / Letter': 'R20',
    'CV from Scratch': 'R30',
    'CV Upgrade/Fix': 'R40',
    'Cover Letter': 'R30',
    'Scanning': 'R5/page',
    'Laminating (A5)': 'R15',
    'Laminating (A4)': 'R20',
    'Laminating (A3)': 'R30',
  },
  design: {
    'Logo — Basic': 'R300',
    'Logo — Standard': 'R500',
    'Logo — Premium': 'R800',
    'Business Card (Single Side)': 'R120',
    'Business Card (Double Side)': 'R180',
    'Flyer / Poster — Simple': 'R150',
    'Flyer / Poster — Custom': 'R250',
    'Flyer / Poster — Complex': 'R350',
    'Social Media Post': 'R80',
    'Post + Story': 'R120',
    'Static Invitation': 'R150',
    'Video Invitation': 'R300',
    'Revision — While Busy': 'R50',
    'Revision — After Completion': 'R70',
  },
  eservice: {
    'SASSA Status Check': 'R20',
    'SASSA Payment / Balance Check': 'R15',
    'SASSA Update Details': 'R30',
    'SASSA SRD Application': 'R40',
    'SASSA Reapplication': 'R40',
    'SASSA Banking Update': 'R40',
    'SASSA Appeal': 'R40',
    'SASSA Grant Application': 'R80',
    'SARS Enquiry / Statement / Updates': 'R50',
    'SARS New Taxpayer / eFiling': 'R70',
    'SARS Tax Pin / Penalty': 'R100',
    'SARS Tax Clearance': 'R120',
    'SARS Pin Submission': 'R120',
    'SARS Tax Return / VAT / PAYE': 'R200',
    'PSIRA Status Check': 'R30',
    'PSIRA Update / Certificate': 'R40',
    'PSIRA Lost Certificate': 'R50',
    'PSIRA Renewal / New Registration': 'R80',
    'PSIRA ID Application': 'R100',
    'NSFAS Status Check': 'R20',
    'NSFAS Banking Update': 'R20',
    'Learnership Application': 'R30',
    'Job / DPSA Application': 'R40',
    'Bursary Application': 'R40',
    'NSFAS Appeal': 'R50',
    'NSFAS Application': 'R80',
    'University Application': 'R100',
    'Email Setup / Send / Receive': 'R15',
    'Good Standing Letter': 'R60',
    'Google Business Setup': 'R80',
    'UIF Monthly Declaration': 'R100',
    'UIF Registration': 'R100',
    'CSD Update': 'R120',
    'UIF Claims': 'R200',
    'CSD Registration': 'R300',
    'Social Media Setup': 'R60',
    "Learner's Licence Booking": 'R60',
    'WhatsApp Business Setup': 'R80',
  },
  tech: {
    'Software Install': 'R80',
    'App / Office Updates': 'R80',
    'Driver Installation': 'R100',
    'Printer Setup': 'R100',
    'Activation Only': 'R100',
    'Microsoft 365 Setup': 'R150',
    'Troubleshooting': 'R150/hr',
    'PC Cleanup': 'R150',
    'Virus / Malware Removal': 'R200',
    'OS Update': 'R200',
    'PC Setup': 'R250',
    'Windows Install (No Activation)': 'R300',
    'Windows Install + Activation': 'R350',
  },
} as const

export type HubId = HubKey

export interface ServiceItem {
  name: string
  price: string
  requirements: string[]
  description?: string
}

export interface HubSection {
  title: string
  items: ServiceItem[]
}

export interface Hub {
  iconName: string
  iconColor: string
  title: string
  grad: string
  desc: string
  sections: HubSection[]
  previews: string[]
  tagStyle: { bg: string; color: string }
  tagStyleDark: { bg: string; color: string }
}

export const HUBS: Record<HubId, Hub> = {
  print: {
    iconName: 'Printer',
    iconColor: HUB_COLORS.print.light,
    title: HUB_NAMES.print,
    grad: HUB_COLORS.print.gradient,
    desc: 'Fast, clear and affordable printing for every need — from a single page to bulk jobs.',
    tagStyle: { bg: HUB_COLORS.print.tagBg, color: HUB_COLORS.print.tagText },
    tagStyleDark: { bg: HUB_COLORS.print.tagBgDark, color: HUB_COLORS.print.tagTextDark },
    previews: ['B&W Printing', 'Colour Printing', 'Photo Prints'],
    sections: [
      {
        title: 'Printing',
        items: [
          { name: 'Black & White', price: 'R5/page', description: 'We print your digital file in crisp black and white on standard A4 paper. Send your file via USB, WhatsApp, or email — we handle the rest. Bulk discounts apply from 10 pages.', requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'] },
          { name: 'Colour', price: 'R8/page', description: 'Full-colour printing for documents, presentations, flyers, and anything that needs to stand out. We print your digital file directly — just send it over and collect.', requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'] },
        ],
      },
      {
        title: 'Copying',
        items: [
          { name: 'Black & White', price: 'R3/page', description: "Bring in your original physical document and we'll make as many black and white copies as you need — fast and at one of the most affordable rates around. Great for ID copies, forms, and school work.", requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'] },
          { name: 'Colour', price: 'R5/page', description: "Need an exact colour copy of a certificate, flyer, or photo? Bring in the original and we'll reproduce it faithfully in full colour. Perfect for keeping originals safe while sharing copies.", requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'] },
        ],
      },
      {
        title: 'Photo Printing',
        items: [
          { name: '4x6 Glossy', price: 'R20', description: 'The classic photo size — 4x6 inches printed on glossy photo paper for sharp colour and a professional finish. Perfect for framing, albums, or sending to family.', requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'] },
          { name: 'A4 Glossy', price: 'R40', description: 'Your photo printed large on glossy A4 photo paper. Great for portraits, event photos, or anything you want to display prominently. High resolution recommended for the cleanest result.', requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'] },
        ],
      },
    ],
  },
  doc: {
    iconName: 'FileText',
    iconColor: HUB_COLORS.doc.light,
    title: HUB_NAMES.doc,
    grad: HUB_COLORS.doc.gradient,
    desc: 'From typing and printing to professional CVs and laminating — we handle your paperwork.',
    tagStyle: { bg: HUB_COLORS.doc.tagBg, color: HUB_COLORS.doc.tagText },
    tagStyleDark: { bg: HUB_COLORS.doc.tagBgDark, color: HUB_COLORS.doc.tagTextDark },
    previews: ['CV Services', 'Typing & Documents', 'Laminating'],
    sections: [
      { title: 'Typing + Printing', items: [
        { name: 'Black & White', price: 'R15/page', description: 'You bring your handwritten notes or rough draft, and we type it up neatly and print it out in black and white. Ideal for letters, applications, forms, and school assignments.', requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'] },
        { name: 'Colour', price: 'R18/page', description: 'Same as our typing service but printed in full colour — useful when your document includes colour tables, headings, charts, or needs to make a strong visual impression.', requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'] },
      ]},
      { title: 'CV Services', items: [
        { name: 'CV from Scratch', price: 'R30', description: 'Never had a CV before? We build one for you from the ground up — personal details, education, skills, and work experience — all formatted neatly and ready to hand in or email to employers.', requirements: ['Bring your ID document', 'Provide your personal details, education history, and work experience', 'Bring a recent photo if you want one included', 'Share contact details (phone number, email if available)'] },
        { name: 'CV Upgrade/Fix', price: 'R40', description: "Already have a CV but it's outdated, poorly formatted, or missing key information? We clean it up, restructure it, and add your latest experience so it looks professional and up to date.", requirements: ['Bring your existing CV (digital file or printed copy)', 'Let us know what changes or updates you need', 'Provide any new information to be added'] },
        { name: 'Cover Letter', price: 'R30', description: 'A strong cover letter introduces you to a potential employer before they even read your CV. We write a personalised one based on the job you're applying for, highlighting your key strengths.', requirements: ['Bring details of the job you are applying for', 'Bring your CV for reference', 'Mention key skills or experience you want highlighted'] },
      ]},
      { title: 'Other Documents', items: [
        { name: 'Affidavit / Letter', price: 'R20', description: 'Need an official written statement or a formal letter typed out? We draft and type affidavits, motivation letters, consent letters, and general correspondence to the correct format.', requirements: ['Bring your ID document', 'Provide the details/facts that need to be included', 'Some affidavits may require a visit to the police station or Commissioner of Oaths to be sworn'] },
      ]},
      { title: 'Scanning', items: [
        { name: 'Scan to Digital', price: 'R5/page', description: 'Turn your physical documents into digital files you can store, send, or email. We scan your paperwork and deliver it as a PDF or image directly to your phone, USB, or email.', requirements: ['Bring the original physical document(s) to be scanned', 'Let us know the file format you need (PDF, JPG, etc.)', 'Bring a USB or have WhatsApp/email ready to receive the file'] },
      ]},
      { title: 'Laminating', items: [
        { name: 'A5', price: 'R15', description: 'Protect your A5-sized documents, ID copies, cards, and certificates with a clear laminate seal. Laminating keeps paper from tearing, fading, or getting wet — great for anything you carry daily.', requirements: ['Bring the document or card to be laminated', 'Make sure the item is clean and flat'] },
        { name: 'A4', price: 'R20', description: 'Seal and protect full A4 documents — certificates, results, and important letters — in a clear laminate that makes them durable, waterproof, and presentable for years to come.', requirements: ['Bring the document to be laminated', 'Make sure the document is clean and flat'] },
        { name: 'A3', price: 'R30', description: 'Laminating for large A3 documents like posters, schedules, menus, and price lists. The extra-large laminate pouch keeps them looking sharp even when displayed in busy environments.', requirements: ['Bring the document or poster to be laminated', 'Make sure the item is clean and flat'] },
      ]},
    ],
  },
  design: {
    iconName: 'PaintBrush',
    iconColor: HUB_COLORS.design.light,
    title: HUB_NAMES.design,
    grad: HUB_COLORS.design.gradient,
    desc: 'Professional designs for your brand, events and marketing — eye-catching and print-ready.',
    tagStyle: { bg: HUB_COLORS.design.tagBg, color: HUB_COLORS.design.tagText },
    tagStyleDark: { bg: HUB_COLORS.design.tagBgDark, color: HUB_COLORS.design.tagTextDark },
    previews: ['Logo Design', 'Flyers & Posters', 'Invitations'],
    sections: [
      { title: 'Logos', items: [
        { name: 'Basic Logo', price: 'R300', description: "A clean, simple logo built around your business name. One concept, one round of refinement, delivered in standard formats. Ideal if you're just starting out and need something professional fast.", requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style (modern, classic, playful, etc.)', 'Mention any reference logos you like for inspiration'] },
        { name: 'Standard Logo', price: 'R500', description: 'A more detailed logo with refined typography, iconography, and colour palette. Includes multiple initial concepts so you can choose the direction that best fits your brand — ideal for growing businesses.', requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need multiple initial concepts'] },
        { name: 'Premium Logo', price: 'R800', description: 'A full brand identity treatment — custom icon, refined typography, complete colour system, and multiple file formats (PNG, SVG, PDF). Includes a brand style guide so you always use your logo correctly. Best for established or growing businesses serious about their brand.', requirements: ['Provide your business name and tagline (if any)', 'Share your brand vision, colours, and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need a full brand style guide and multiple file formats'] },
      ]},
      { title: 'Business Cards', items: [
        { name: 'Single Side', price: 'R120', description: "A professionally designed business card printed on one side — your name, business, contact details, and logo laid out cleanly. The first impression you leave in someone's hand.", requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Specify the quantity to be printed'] },
        { name: 'Double Side', price: 'R180', description: 'Make the most of both sides. Front carries your identity; the back can feature your services, social handles, a QR code, or a map. More information, same compact card — maximise every interaction.', requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Let us know what content goes on the back (e.g. services, social media, map)', 'Specify the quantity to be printed'] },
      ]},
      { title: 'Flyers & Posters', items: [
        { name: 'Simple', price: 'R150', description: 'A clean, straightforward flyer with your key information — event details, promo, or announcement — laid out clearly without heavy customisation. Fast turnaround, print-ready.', requirements: ['Provide the text/content to be included (event, promo, contact details)', 'Share any photos or logos to be used', 'Mention your preferred colours or style'] },
        { name: 'Custom', price: 'R250', description: 'A fully designed flyer or poster built around your brand and message. Custom layout, imagery placement, colour matching, and typography — designed to grab attention and communicate clearly.', requirements: ['Provide the text/content to be included', 'Share any photos or logos to be used', 'Mention your preferred colours or style direction', 'Specify size and intended use (print or digital)'] },
        { name: 'Complex', price: 'R350', description: 'For designs that need real creative work — multi-section layouts, detailed imagery, event programmes, or anything with a lot of content that must still look polished and well-structured.', requirements: ['Provide the text/content to be included', 'Share photos, logos, and any reference designs', 'Mention your preferred colours or style direction', 'Specify size, layout complexity, and intended use'] },
      ]},
      { title: 'Social Media', items: [
        { name: 'Post', price: 'R80', description: "A single branded social media post sized and designed for your platform of choice. Whether it's a promotion, announcement, or product highlight — we make it scroll-stopping and on-brand.", requirements: ['Provide the text/message for the post', 'Share any photos or logos to be used', 'Mention the platform (Facebook, Instagram, WhatsApp Status, etc.)'] },
        { name: 'Post + Story', price: 'R120', description: 'Your content designed in two formats at once — a standard post and a matching story. Same message, adapted for both placements so your brand looks consistent across your feed and your stories.', requirements: ['Provide the text/message for the post and story', 'Share any photos or logos to be used', 'Mention the platform(s) the content is for'] },
      ]},
      { title: 'Invitations', items: [
        { name: 'Image/Static', price: 'R150', description: 'A beautifully designed static invitation — the kind you save, share on WhatsApp, or print out. Includes event name, date, time, venue, and your theme or aesthetic direction. Clean, elegant, shareable.', requirements: ['Provide event details (date, time, venue, host)', 'Share any photos or theme preferences', 'Mention your preferred colours or style'] },
        { name: 'Video', price: 'R300', description: 'An animated video invitation that plays like a short clip — text reveals, music, transitions, and your event details brought to life. Makes a far stronger impression when shared on WhatsApp or social media.', requirements: ['Provide event details (date, time, venue, host)', 'Share any photos, video clips, or theme preferences', 'Mention your preferred colours, music, or style'] },
      ]},
      { title: 'Revisions', items: [
        { name: 'While Busy', price: 'R50', description: "Changed your mind mid-way? No problem. Revisions requested while the design is still actively being worked on cost less because we haven't finalised anything yet — it's easier to adjust on the fly.", requirements: ['Clearly describe the changes you would like made', 'This applies only while the project is still in progress'] },
        { name: 'After Completion', price: 'R70', description: 'Need changes after your design has already been delivered and signed off? Post-completion revisions require us to reopen the project file and rework finished elements — this is charged at a slightly higher rate to reflect that.', requirements: ['Clearly describe the changes you would like made', 'This applies once the project has already been delivered/finalized'] },
      ]},
    ],
  },
  eservice: {
    iconName: 'Globe',
    iconColor: HUB_COLORS.eservice.light,
    title: HUB_NAMES.eservice,
    grad: HUB_COLORS.eservice.gradient,
    desc: "Government platforms made easy. We handle registrations, applications and updates so you don't have to stress.",
    tagStyle: { bg: HUB_COLORS.eservice.tagBg, color: HUB_COLORS.eservice.tagText },
    tagStyleDark: { bg: HUB_COLORS.eservice.tagBgDark, color: HUB_COLORS.eservice.tagTextDark },
    previews: ['SASSA', 'SARS eFiling', 'UIF & CSD'],
    sections: [ /* trimmed for brevity - keep your full sections from original */ ],
  },
  tech: {
    iconName: 'Desktop',
    iconColor: HUB_COLORS.tech.light,
    title: HUB_NAMES.tech,
    grad: HUB_COLORS.tech.gradient,
    desc: 'From slow laptops to fresh Windows installs — everyday tech problems solved quickly and affordably.',
    tagStyle: { bg: HUB_COLORS.tech.tagBg, color: HUB_COLORS.tech.tagText },
    tagStyleDark: { bg: HUB_COLORS.tech.tagBgDark, color: HUB_COLORS.tech.tagTextDark },
    previews: ['Windows Install', 'Virus Removal', 'PC Setup'],
    sections: [ /* trimmed */ ],
  },
}

// ─── PROJECTS ────────────────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: "vasep-branding",
    hub: "design" as HubId,
    title: "VASEP — Visual Arts Skills Empowerment Projects",
    tag: HUB_NAMES.design,
    shortDesc: "Full logo and brand identity for a local arts empowerment organisation.",
    image: "/vsp1.jpg",
    images: ["/Vspsktch.jpeg", "/vsp1.jpg", "/Vspm.jpg"],
    clientType: "client" as const,
    clientGoal: "VASEP needed a logo that shows what they do — arts, skills, and community. Something colourful, meaningful, and strong enough to put on merch.",
    whatWeDid: ["Designed a custom logo using a paint palette as the base symbol","Used multiple colours to represent different art disciplines and people","Added paint brushes crossing the palette for that creative feel","Placed a paint bottle on top as the hero element","Set VASEP in bold uppercase with full name underneath","Mocked up the logo on a t-shirt to show how it looks on merch"],
    tools: ["Adobe Illustrator", "Vector logo design", "T-shirt mockup"],
    result: "The client had a full logo ready for print, digital. Colourful, clean, and instantly recognisable as an arts organisation.",
  },
  {
    id: "wedding-party-programme",
    hub: "design" as HubId,
    title: "Wedding Party Programme",
    tag: HUB_NAMES.design,
    shortDesc: "Printed wedding party programme with roles, names, and a celebratory layout.",
    image: "/Wp.png",
    images: ["/wedding_party_blurred.jpg"],
    clientType: "client" as const,
    sensitive: true,
    clientGoal: "The client needed a clean printed programme listing everyone's role at the wedding reception — from MC to cake cutting.",
    whatWeDid: ["Designed a blue and white wedding layout with decorative elements","Listed all roles on the left with matching names on the right","Added floral and ribbon decorations to keep the celebratory feel","Used a dividing gold line between roles and names for readability","Made it print-ready at A4 size"],
    tools: ["Adobe Illustrator", "Print-ready A4 layout"],
    result: "The client received a beautiful, easy-to-read programme that felt personal and matched the wedding's colours.",
  },
  // ... keep all your other projects here, they will automatically use HUB_NAMES for tags
] as const

export type ProjectData = {
  id: string
  hub: HubId
  title: string
  tag: string
  shortDesc: string
  image: string
  images: string[]
  clientType?: "client" | "practice" | "sample"
  clientGoal: string
  whatWeDid: string[]
  tools: string[]
  result: string
  sensitive?: boolean
  beforeAfter?: { before: string; after: string }
}
export type Project = typeof PROJECTS[number] 
