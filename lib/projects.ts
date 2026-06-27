import type { HubId } from "./types"

export type Project = {
  id: string
  hub: HubId
  title: string
  tag: string
  shortDesc: string
  image: string
  images: string[]
  clientType?: "client" | "practice" | "sample"
  sensitive?: boolean
  clientGoal: string
  whatWeDid: string[]
  tools: string[]
  result: string
}

export const PROJECTS: Project[] = [
  {
    id: "vasep-branding",
    hub: "design",
    title: "VASEP — Visual Arts Skills Empowerment Projects",
    tag: "Design",
    shortDesc: "Full logo and brand identity for a local arts empowerment organisation.",
    image: "/vsp1.jpg",
    images: ["/Vspsktch.jpeg", "/vsp1.jpg", "/Vspm.jpg"],
    clientType: "client",
    clientGoal:
      "VASEP needed a logo that shows what they do — arts, skills, and community. Something colourful, meaningful, and strong enough to put on merch.",
    whatWeDid: [
      "Designed a custom logo using a paint palette as the base symbol",
      "Used multiple colours to represent different art disciplines and people",
      "Added paint brushes crossing the palette for creative identity",
      "Placed paint bottle as a hero element",
      "Set VASEP text in bold uppercase with full name below",
      "Mocked up logo on merchandise"
    ],
    tools: ["Adobe Illustrator", "Vector Design", "Mockups"],
    result:
      "A colourful, professional identity ready for print, digital use, and branding materials."
  },

  {
    id: "shuttle-flyer",
    hub: "design",
    title: "Sol's Shuttle Services",
    tag: "Design",
    shortDesc: "Branding package for a local shuttle service.",
    image: "/Sol.jpg",
    images: ["/Sol.jpg"],
    clientType: "client",
    clientGoal:
      "Client needed a flyer, logo, and business card for shuttle services.",
    whatWeDid: [
      "Created pricing structure (day vs evening rates)",
      "Organised travel distance tiers",
      "Added service areas and notes",
      "Designed transport-themed layout"
    ],
    tools: ["Adobe Illustrator"],
    result:
      "Clear, professional pricing flyer for customer communication."
  },

  {
    id: "cv-creation",
    hub: "doc",
    title: "CV Creation for First-Time Job Seeker",
    tag: "Documents",
    shortDesc: "Built a professional CV from scratch.",
    image: "/gallery/docu/cv-2.jpg",
    images: [
      "/gallery/docu/cv-1.jpg",
      "/gallery/docu/cv-2.jpg",
      "/gallery/docu/cv-3.jpg"
    ],
    clientType: "sample",
    clientGoal: "Client had no CV and needed a professional job-ready document.",
    whatWeDid: [
      "Created CV from scratch",
      "Structured personal info clearly",
      "Added skills and experience sections",
      "Formatted professionally"
    ],
    tools: ["Microsoft Word"],
    result: "Complete CV ready for job applications."
  },

  {
    id: "rekaofela-bulk-print",
    hub: "print",
    title: "Rekaofela Society — Stokvel Rules Print",
    tag: "Print",
    shortDesc: "Typed and printed 100+ copies of stokvel rules.",
    image: "/gallery/print/printer.jpg",
    images: ["/gallery/print/printer.jpg"],
    clientType: "client",
    clientGoal:
      "Stokvel needed formal printed copies of their rules for all members.",
    whatWeDid: [
      "Typed handwritten rules",
      "Formatted document for clarity",
      "Printed 100+ copies",
      "Ensured consistent output"
    ],
    tools: ["Microsoft Word", "Canon Megatank"],
    result: "Every member received a clean printed copy of rules."
  },

  {
    id: "sassa-srd",
    hub: "eservice",
    title: "SASSA SRD Application Assistance",
    tag: "eService",
    shortDesc: "Assisted with SRD grant application submission.",
    image: "/gallery/eservice/laptop-1.jpg",
    images: [
      "/gallery/eservice/laptop-1.jpg",
      "/gallery/eservice/laptop-2.jpg",
      "/gallery/eservice/laptop-3.jpg"
    ],
    clientType: "sample",
    clientGoal: "Client needed help applying for SRD grant correctly.",
    whatWeDid: [
      "Completed SRD application",
      "Verified details",
      "Submitted successfully"
    ],
    tools: ["SASSA Online Portal"],
    result: "Application submitted without errors."
  },

  {
    id: "laptop-cleanup",
    hub: "tech",
    title: "Laptop Cleanup and Software Installation",
    tag: "Tech",
    shortDesc: "Cleaned slow laptop and installed software.",
    image: "/gallery/tech/cleaning.jpg",
    images: [
      "/gallery/tech/cleaning.jpg",
      "/gallery/tech/software.jpg",
      "/gallery/tech/setup.jpg"
    ],
    clientType: "sample",
    clientGoal: "Laptop was slow and needed optimization.",
    whatWeDid: [
      "Removed viruses",
      "Cleaned system files",
      "Installed Microsoft Office",
      "Updated system"
    ],
    tools: ["System Tools", "Windows Utilities"],
    result: "Laptop became faster and usable again."
  },

  {
    id: "pure-african-herbs",
    hub: "design",
    title: "Pure African Herbs — Flyer & A-Board Design",
    tag: "Design",
    shortDesc: "Health services flyer and outdoor A-board design.",
    image: "/Ahm.jpg",
    images: ["/Aphp1.png", "/Aphp2.jpg", "/Ahm.jpg"],
    clientType: "client",
    clientGoal:
      "Herbal clinic needed a professional flyer and outdoor board.",
    whatWeDid: [
      "Designed health-themed green layout",
      "Structured treatments clearly",
      "Added pricing and contact details",
      "Created A-board version"
    ],
    tools: ["Adobe Illustrator"],
    result:
      "Professional marketing material for both print and street visibility."
  },

  {
    id: "apexbytes-business-card",
    hub: "design",
    title: "Apexbytes Business Card Design",
    tag: "Design",
    shortDesc: "Minimal double-sided business card design.",
    image: "/abbc.jpg",
    images: ["/abbc.jpg"],
    clientType: "client",
    clientGoal: "Clean, professional brand business card.",
    whatWeDid: [
      "Front: logo and identity",
      "Back: bold brand icon layout",
      "Minimal clean structure"
    ],
    tools: ["Adobe Illustrator"],
    result: "Modern, professional business card."
  },

  {
    id: "wedding-party-programme",
    hub: "design",
    title: "Wedding Party Programme",
    tag: "Design",
    shortDesc: "Printed wedding programme layout.",
    image: "/Wp.png",
    images: ["/wedding_party_blurred.jpg"],
    clientType: "client",
    sensitive: true,
    clientGoal: "List wedding roles and participants clearly.",
    whatWeDid: [
      "Designed structured layout",
      "Added decorative elements",
      "Improved readability",
      "Created A4 print version"
    ],
    tools: ["Adobe Illustrator"],
    result: "Elegant printed wedding programme."
  },

  {
    id: "illusion-technologies",
    hub: "design",
    title: "Illusion Technologies — Brand Identity",
    tag: "Design",
    shortDesc: "Full corporate identity concept.",
    image: "/Itw.jpg",
    images: ["/20230527_194537.jpg", "/Itp.jpg", "/Itw.jpg", "/Itm2.jpg"],
    clientType: "practice",
    clientGoal: "Explore premium tech branding concept.",
    whatWeDid: [
      "Designed wordmark logo",
      "Created brand variations",
      "Mocked up office branding",
      "Designed business cards"
    ],
    tools: ["Adobe Illustrator", "Photoshop"],
    result:
      "Full concept branding system for portfolio demonstration."
  }
]
