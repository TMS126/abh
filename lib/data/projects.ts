import { HUB_NAMES } from '@/lib/brand'
import type { HubId } from './types'

export const PROJECTS = [
  {
    id: "vasep-branding", 
    hub: "design" as HubId, title: "VASEP — Visual Arts Skills Empowerment Projects", tag: HUB_NAMES.design,
    shortDesc: "Full logo for a local arts empowerment organisation, in Kgotsong.",
    image: "/vsp1.webp", 
    images: ["/vsp1.webp", "/Vspsktch.webp", "/Vspm.webp"], 
    clientType: "client" as const,
    clientGoal: `VASEP needed a logo that shows what they do — arts, skills, and community. Something colourful, meaningful, and strong enough to put on merch.`,
    whatWeDid: ["Designed a custom logo using a paint palette as the base symbol","Used multiple colours to represent different art disciplines and people","Added paint brushes crossing the palette for that creative feel","Placed a paint bottle on top as the hero element","Set VASEP in bold uppercase with full name underneath","Mocked up the logo on a t-shirt to show how it looks on merch"],
    tools: ["Adobe Illustrator", "Vector logo design", "T-shirt mockup"],
    result: `The client had a full logo ready for print, digital. Colourful, clean, and instantly recognisable as an arts organisation.`,
  },
  {
    id: "apexbytes-business-card", hub: "design" as HubId, title: "Apexbytes Business Card Design", tag: HUB_NAMES.design,
    shortDesc: "Double-sided business card for the (old) Apexbytes brand — clean, minimal, and professional.",
    image: "/abbc.webp", images: ["/abbc.webp"], clientType: "practice" as const,
    clientGoal: "Design a business card that looks clean and professional — something that represents the (old) Apexbytes brand without being too busy.",
    whatWeDid: ["Designed front with brand logo, founder name, and role","Back features the brand icon large on a dark navy background in orange","Kept everything minimal — no clutter, just the essentials","Double-sided layout with strong contrast between front and back"],
    tools: ["Adobe Illustrator", "Double-sided business card format"],
    result: "A sharp, professional card that stands out and represents the brand well.",
  },
  {
    id: "shuttle-flyer", hub: "design" as HubId, title: "Sol's Shuttle Services", tag: HUB_NAMES.design,
    shortDesc: "A local shuttle service — flyer.",
    image: "/Sol.webp", images: ["/Sol.webp", "/sol1.webp" ], clientType: "client" as const,
    clientGoal: "Sol needed a complete design for his shuttle service — a flyer to share rates for customers.",
    whatWeDid: ["Designed full pricing layout (Day vs Evening rates)","Structured pricing into clear distance ranges","Added service areas section","Included important notices (deposit, surcharge, negotiable distances)","Created transport-themed visual design","Positioned vehicle image for brand identity"],
    tools: ["Adobe Illustrator", "Print + WhatsApp-friendly layout design", "High contrast readability (dark + gold theme)"],
    result: "The client received a professional, easy-to-read pricing flyer that clearly communicates services and builds trust with customers.",
  },
  {
    id: "cv-creation", hub: "doc" as HubId, title: "CV Creation for First-Time Job Seeker", tag: HUB_NAMES.doc,
    shortDesc: "Built a complete professional CV from scratch for a first-time job applicant.",
    image: "/cv-2.webp", 
    images: ["/cv-1.webp", "/cv-2.webp", "/cv-3.webp"], 
    clientType: "sample" as const,
    clientGoal: "Client had no CV and needed a professional document to apply for jobs.",
    whatWeDid: ["Created CV from scratch","Structured personal information clearly","Added skills and experience sections","Formatted document professionally","Printed final CV"],
    tools: ["Microsoft Word", "Clean, structured formatting"],
    result: "Client received a complete, professional CV ready for job applications.",
  },
  {
    id: "rekaofela-bulk-print", hub: "print" as HubId, title: "Rekaofeela Social Club — Constitution Print", tag: HUB_NAMES.print,
    shortDesc: "Typed and printed 100+ copies of a kasi stokvel group's official rules document.",
    image: "/rsc1.webp", images: ["/rsc2.webp", "/rsc.webp"], clientType: "client" as const,
    clientGoal: "Rekaofeela Social Club, a local stokvel group in Kgotsong, needed their official rules printed in bulk so every member could have a personal copy.",
    whatWeDid: ["Formatted the document clearly for easy reading","Printed 100+ copies in black and white","Ensured consistent print quality across the entire batch"],
    tools: ["Microsoft Word", "Canon Megatank — bulk B&W printing"],
    result: "Every Rekaofeela Social Club member received a clean, printed copy of the group's rules — professionally done and ready for their meeting.",
  },
  {
    id: "sassa-srd", hub: "eservice" as HubId, title: "SASSA SRD Application Assistance", tag: HUB_NAMES.eservice,
    shortDesc: "Assisted client with correctly completing and submitting their SRD grant application.",
    image: "/laptop-1.webp", images: ["/laptop-1.webp", "/laptop-2.webp", "/laptop-3.webp"], clientType: "sample" as const,
    clientGoal: "Client needed help applying for SRD grant correctly.",
    whatWeDid: ["Completed SRD application","Verified personal details","Submitted application successfully"],
    tools: ["Online government portal"],
    result: "Application submitted correctly without errors.",
  },
  {
    id: "laptop-cleanup", hub: "tech" as HubId, title: "Laptop Cleanup and Software Installation", tag: HUB_NAMES.tech,
    shortDesc: "Removed viruses, cleaned system files and installed essential software on a slow laptop.",
    image: "/cleaning.webp", images: ["/cleaning.webp", "/software.webp", "/setup.webp"], clientType: "sample" as const,
    clientGoal: "Client's laptop was slow and needed essential software installed.",
    whatWeDid: ["Removed viruses","Cleaned system files","Installed Microsoft Office","Updated operating system"],
    tools: ["System cleanup tools", "Software installation"],
    result: "Laptop became faster and ready for daily use.",
  },
  {
    id: "pure-african-herbs", hub: "design" as HubId, title: "Pure African Herbs — Flyer Design", tag: HUB_NAMES.design,
    shortDesc: "Health services poster for a local herbal specialist in Bothaville.",
    image: "/Ahm.webp", 
    images: ["/Aphp1.webp", "/Aphp2.webp", "/Ahm.webp"], 
    clientType: "client" as const,
    clientGoal: "The client needed a professional flyer for their herbal health practice — something that lists conditions they treat, contact details, pricing, and hours. It also needed to work as a big A-board outside the shop.",
    whatWeDid: ["Designed a green health-themed layout matching the herbal brand","Organised conditions treated into a clean bullet list","Added pricing, specialist name, and contact numbers clearly","Included shop address and trading hours at the bottom","Created an A-board version for outdoor display","Added organic and no-side-effects trust badges"],
    tools: ["Adobe Illustrator", "Print-ready A4 and A-board format"],
    result: "Client had a professional flyer and A-board ready to attract walk-ins and answer common questions before clients even step inside.",
  },
  {
    id: "illusion-technologies", hub: "design" as HubId, title: "Illusion Technologies — Brand Identity", tag: HUB_NAMES.design,
    shortDesc: "Full corporate brand identity concept for a drone tech company. Portfolio practice project.",
    image: "/Itw.webp", 
    images: ["/20230527_194537.webp", "/Itp.webp", "/Itw.webp", "/Itm2.webp"], 
    clientType: "practice" as const,
    clientGoal: "Explore what a premium tech brand identity looks like — logo design, mockups on buildings and office spaces, business card design, and a brand showcase layout.",
    whatWeDid: ["Designed the Illusion Technologies wordmark with a custom S-letter detail","Added a small blue accent on the S to break the dark monotone","Created logo variants on white and dark backgrounds","Mocked up the logo on a glass office building exterior","Mocked up the brand in an office interior setting","Designed matching business cards on dark textured stock","Built a full brand showcase poster layout"],
    tools: ["Adobe Illustrator", "Photoshop mockups", "Brand presentation layout"],
    result: "A complete brand identity concept showing how Illusion Technologies would look across digital and physical touchpoints. Done as a portfolio piece to demonstrate premium corporate branding skills.",
  },
] as const

export type ProjectData = {
  id: string; hub: string; title: string; tag: string; shortDesc: string
  image: string; images: readonly string[]; clientType?: "client" | "practice" | "sample"
  sensitive?: boolean; clientGoal: string; whatWeDid: readonly string[]
  tools: readonly string[]; result: string
}
export type Project = typeof PROJECTS[number]
