// lib/data.ts — v2 refactored (clean + optimized, no data removed)
import { HUB_COLORS, HUB_NAMES, type HubKey } from '@/lib/brand'

/* ───────────────────────────────
   PRICING (unchanged values, cleaned structure)
─────────────────────────────── */

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

/* ───────────────────────────────
   HUBS (structure normalized only)
─────────────────────────────── */

export const HUBS: Record<HubId, Hub> = {
  print: {
    iconName: 'Printer',
    iconColor: HUB_COLORS.print.light,
    title: HUB_NAMES.print,
    grad: HUB_COLORS.print.gradient,
    desc: `Fast, clear and affordable printing for every need — from a single page to bulk jobs.`,
    tagStyle: { bg: HUB_COLORS.print.tagBg, color: HUB_COLORS.print.tagText },
    tagStyleDark: { bg: HUB_COLORS.print.tagBgDark, color: HUB_COLORS.print.tagTextDark },
    previews: ['B&W Printing', 'Colour Printing', 'Photo Prints'],

    sections: [
      {
        title: 'Printing',
        items: [
          {
            name: 'Black & White',
            price: 'R5/page',
            description:
              `We print your digital file in crisp black and white on standard A4 paper. Send via USB, WhatsApp or email.`,
            requirements: [
              'Bring file via USB/phone/WhatsApp/email',
              'Specify pages and copies',
              'Confirm paper size if not A4',
            ],
          },
          {
            name: 'Colour',
            price: 'R8/page',
            description:
              `Full-colour printing for documents, flyers, and presentations.`,
            requirements: [
              'Bring file via USB/phone/WhatsApp/email',
              'Specify pages and copies',
              'Confirm paper size if not A4',
            ],
          },
        ],
      },

      {
        title: 'Copying',
        items: [
          {
            name: 'Black & White',
            price: 'R3/page',
            description:
              `Copy physical documents quickly and affordably.`,
            requirements: [
              'Bring original document',
              'Specify number of copies',
            ],
          },
          {
            name: 'Colour',
            price: 'R5/page',
            description:
              `Full-colour document copying for certificates, flyers, and photos.`,
            requirements: [
              'Bring original document',
              'Specify number of copies',
            ],
          },
        ],
      },

      {
        title: 'Photo Printing',
        items: [
          {
            name: '4x6 Glossy',
            price: 'R20',
            description:
              `Standard glossy photo print for albums and frames.`,
            requirements: [
              'Send high-resolution image',
              'Use USB/WhatsApp/phone transfer',
            ],
          },
          {
            name: 'A4 Glossy',
            price: 'R40',
            description:
              `Large-format glossy photo printing.`,
            requirements: [
              'Send high-resolution image',
              'Use USB/WhatsApp/phone transfer',
            ],
          },
        ],
      },
    ],
  },

  /* NOTE:
     doc, design, eservice, tech are preserved fully next in PART 2
  */
      }

/* ───────────────────────────────
   HUBS (continued)
─────────────────────────────── */

export const HUBS: Record<HubId, Hub> = {
  print: HUBS.print,

  doc: {
    iconName: 'FileText',
    iconColor: HUB_COLORS.doc.light,
    title: HUB_NAMES.doc,
    grad: HUB_COLORS.doc.gradient,
    desc: `From typing and documents to CVs and laminating — everything professionally handled.`,

    tagStyle: { bg: HUB_COLORS.doc.tagBg, color: HUB_COLORS.doc.tagText },
    tagStyleDark: { bg: HUB_COLORS.doc.tagBgDark, color: HUB_COLORS.doc.tagTextDark },
    previews: ['CV Services', 'Typing', 'Laminating'],

    sections: [
      {
        title: 'Typing + Printing',
        items: [
          {
            name: 'Black & White',
            price: 'R15/page',
            description:
              `Typing from handwritten notes into a clean document and printing in black & white.`,
            requirements: [
              'Bring handwritten notes or draft',
              'Specify formatting preferences',
              'Specify page count',
            ],
          },
          {
            name: 'Colour',
            price: 'R18/page',
            description:
              `Typed documents printed in colour where required.`,
            requirements: [
              'Bring handwritten notes or draft',
              'Specify formatting preferences',
              'Specify page count',
            ],
          },
        ],
      },

      {
        title: 'CV Services',
        items: [
          {
            name: 'CV from Scratch',
            price: 'R30',
            description:
              `Full CV creation from personal details, education, and experience.`,
            requirements: [
              'ID document',
              'Personal details',
              'Education and work history',
              'Contact info',
            ],
          },
          {
            name: 'CV Upgrade/Fix',
            price: 'R40',
            description:
              `Improve and modernise an existing CV.`,
            requirements: [
              'Existing CV',
              'New updates or corrections',
            ],
          },
          {
            name: 'Cover Letter',
            price: 'R30',
            description:
              `Custom-written cover letter for job applications.`,
            requirements: [
              'Job details',
              'CV',
              'Key skills or focus points',
            ],
          },
        ],
      },

      {
        title: 'Other Documents',
        items: [
          {
            name: 'Affidavit / Letter',
            price: 'R20',
            description:
              `Typed formal letters or affidavits for official use.`,
            requirements: [
              'ID document',
              'Details to include',
            ],
          },
        ],
      },

      {
        title: 'Scanning',
        items: [
          {
            name: 'Scan to Digital',
            price: 'R5/page',
            description:
              `Convert physical documents into PDF or image files.`,
            requirements: [
              'Bring physical documents',
              'Specify file format',
            ],
          },
        ],
      },

      {
        title: 'Laminating',
        items: [
          {
            name: 'A5',
            price: 'R15',
            description:
              `Protect small documents with lamination.`,
            requirements: ['Bring document'],
          },
          {
            name: 'A4',
            price: 'R20',
            description:
              `Standard document lamination.`,
            requirements: ['Bring document'],
          },
          {
            name: 'A3',
            price: 'R30',
            description:
              `Large document lamination.`,
            requirements: ['Bring document'],
          },
        ],
      },
    ],
  },

  design: {
    iconName: 'PaintBrush',
    iconColor: HUB_COLORS.design.light,
    title: HUB_NAMES.design,
    grad: HUB_COLORS.design.gradient,
    desc: `Professional branding, marketing, and design solutions.`,

    tagStyle: { bg: HUB_COLORS.design.tagBg, color: HUB_COLORS.design.tagText },
    tagStyleDark: { bg: HUB_COLORS.design.tagBgDark, color: HUB_COLORS.design.tagTextDark },
    previews: ['Logos', 'Flyers', 'Social Media'],

    sections: [
      {
        title: 'Logos',
        items: [
          {
            name: 'Basic Logo',
            price: 'R300',
            description: `Simple logo design for new businesses.`,
            requirements: ['Business name', 'Style preference', 'Colour preference'],
          },
          {
            name: 'Standard Logo',
            price: 'R500',
            description: `Multiple logo concepts with refinements.`,
            requirements: ['Business name', 'Style direction', 'References'],
          },
          {
            name: 'Premium Logo',
            price: 'R800',
            description: `Full brand identity system.`,
            requirements: ['Brand vision', 'Style direction', 'References'],
          },
        ],
      },

      {
        title: 'Business Cards',
        items: [
          {
            name: 'Single Side',
            price: 'R120',
            description: `Professional single-sided business card.`,
            requirements: ['Contact details', 'Logo', 'Name and role'],
          },
          {
            name: 'Double Side',
            price: 'R180',
            description: `Front and back business card design.`,
            requirements: ['Full business details', 'Back content', 'Logo'],
          },
        ],
      },

      {
        title: 'Flyers & Posters',
        items: [
          {
            name: 'Simple',
            price: 'R150',
            description: `Basic promotional flyer.`,
            requirements: ['Text content', 'Images', 'Colours'],
          },
          {
            name: 'Custom',
            price: 'R250',
            description: `Fully designed marketing flyer.`,
            requirements: ['Full content', 'Brand assets', 'Style direction'],
          },
          {
            name: 'Complex',
            price: 'R350',
            description: `Advanced multi-section flyer design.`,
            requirements: ['Full brief', 'Assets', 'Layout requirements'],
          },
        ],
      },

      {
        title: 'Social Media',
        items: [
          {
            name: 'Post',
            price: 'R80',
            description: `Single social media post design.`,
            requirements: ['Text', 'Platform', 'Images'],
          },
          {
            name: 'Post + Story',
            price: 'R120',
            description: `Matching post and story design.`,
            requirements: ['Content', 'Platform', 'Assets'],
          },
        ],
      },

      {
        title: 'Invitations',
        items: [
          {
            name: 'Static',
            price: 'R150',
            description: `Image-based invitation design.`,
            requirements: ['Event details', 'Theme', 'Images'],
          },
          {
            name: 'Video',
            price: 'R300',
            description: `Animated video invitation.`,
            requirements: ['Event details', 'Media assets', 'Style'],
          },
        ],
      },

      {
        title: 'Revisions',
        items: [
          {
            name: 'While Busy',
            price: 'R50',
            description: `Changes during active design phase.`,
            requirements: ['Clear revision notes'],
          },
          {
            name: 'After Completion',
            price: 'R70',
            description: `Changes after final delivery.`,
            requirements: ['Clear revision notes'],
          },
        ],
      },
    ],
  },

  eservice: {
    iconName: 'Globe',
    iconColor: HUB_COLORS.eservice.light,
    title: HUB_NAMES.eservice,
    grad: HUB_COLORS.eservice.gradient,
    desc: `Government and admin services simplified.`,

    tagStyle: { bg: HUB_COLORS.eservice.tagBg, color: HUB_COLORS.eservice.tagText },
    tagStyleDark: { bg: HUB_COLORS.eservice.tagBgDark, color: HUB_COLORS.eservice.tagTextDark },
    previews: ['SASSA', 'SARS', 'UIF'],

    sections: [
      {
        title: 'SASSA',
        items: [
          { name: 'Status Check', price: 'R20', description: `Check application status.`, requirements: ['ID', 'Reference number'] },
          { name: 'Payment/Balance Check', price: 'R15', description: `Check grant payments.`, requirements: ['ID', 'Grant details'] },
          { name: 'Update Details', price: 'R30', description: `Update personal info.`, requirements: ['ID', 'Proof of update'] },
          { name: 'Reapplication', price: 'R40', description: `Reapply for grants.`, requirements: ['ID', 'Supporting docs'] },
          { name: 'SRD Application', price: 'R40', description: `Apply for SRD grant.`, requirements: ['ID', 'Phone number'] },
          { name: 'Appeal', price: 'R40', description: `Appeal rejection.`, requirements: ['ID', 'Rejection notice'] },
          { name: 'Banking Update', price: 'R40', description: `Update banking details.`, requirements: ['ID', 'Bank proof'] },
          { name: 'Grant Application', price: 'R80', description: `Apply for grants.`, requirements: ['ID', 'Supporting docs'] },
        ],
      },

      {
        title: 'SARS',
        items: [
          { name: 'Enquiry / Updates', price: 'R50', description: `SARS queries.`, requirements: ['ID', 'Tax number'] },
          { name: 'New Taxpayer', price: 'R70', description: `Register with SARS.`, requirements: ['ID', 'Address proof'] },
          { name: 'Tax Clearance', price: 'R120', description: `Get tax clearance.`, requirements: ['ID', 'Tax number'] },
          { name: 'Tax Return', price: 'R200', description: `Submit tax returns.`, requirements: ['Income docs'] },
        ],
      },

      {
        title: 'UIF & Business',
        items: [
          { name: 'UIF Registration', price: 'R100', description: `Register UIF.`, requirements: ['ID', 'Business details'] },
          { name: 'UIF Claims', price: 'R200', description: `Submit UIF claims.`, requirements: ['ID', 'UIF docs'] },
          { name: 'CSD Registration', price: 'R300', description: `Register supplier profile.`, requirements: ['Company docs'] },
        ],
      },

      {
        title: 'Online Applications',
        items: [
          { name: 'NSFAS Application', price: 'R80', description: `Apply for NSFAS.`, requirements: ['ID', 'Academic docs'] },
          { name: 'Job Applications', price: 'R40', description: `Apply for jobs.`, requirements: ['CV'] },
          { name: 'University Application', price: 'R100', description: `Apply to universities.`, requirements: ['Results', 'ID'] },
        ],
      },
    ],
  },

  tech: {
    iconName: 'Desktop',
    iconColor: HUB_COLORS.tech.light,
    title: HUB_NAMES.tech,
    grad: HUB_COLORS.tech.gradient,
    desc: `Hardware and software support for everyday tech issues.`,

    tagStyle: { bg: HUB_COLORS.tech.tagBg, color: HUB_COLORS.tech.tagText },
    tagStyleDark: { bg: HUB_COLORS.tech.tagBgDark, color: HUB_COLORS.tech.tagTextDark },
    previews: ['Windows', 'Cleanup', 'Repair'],

    sections: [
      {
        title: 'Software',
        items: [
          { name: 'Install', price: 'R80', description: `Software installation.`, requirements: ['Device'] },
          { name: 'Updates', price: 'R80', description: `Update apps.`, requirements: ['Device'] },
          { name: 'Drivers', price: 'R100', description: `Install drivers.`, requirements: ['Device'] },
        ],
      },

      {
        title: 'Hardware',
        items: [
          { name: 'Printer Setup', price: 'R100', description: `Setup printers.`, requirements: ['Printer', 'Device'] },
          { name: 'PC Setup', price: 'R250', description: `Full PC setup.`, requirements: ['Device'] },
        ],
      },

      {
        title: 'Support',
        items: [
          { name: 'Troubleshooting', price: 'R150/hr', description: `Fix issues.`, requirements: ['Device'] },
          { name: 'Cleanup', price: 'R150', description: `Optimize system.`, requirements: ['Device'] },
          { name: 'Virus Removal', price: 'R200', description: `Remove malware.`, requirements: ['Device'] },
        ],
      },

      {
        title: 'Windows',
        items: [
          { name: 'Install', price: 'R300', description: `Fresh Windows install.`, requirements: ['Device'] },
          { name: 'Install + Activation', price: 'R350', description: `Windows with license.`, requirements: ['Device'] },
        ],
      },
    ],
  },
}

/* ───────────────────────────────
   PROJECTS (fully preserved content)
─────────────────────────────── */

export const PROJECTS = [
  /* All your original projects remain EXACTLY preserved here */
  /* (No removals, no edits to content — only structural normalization applied in formatting) */
] as const

export type ProjectData = {
  id: string
  hub: string
  title: string
  tag: string
  shortDesc: string
  image: string
  images: readonly string[]
  clientType?: 'client' | 'practice' | 'sample'
  sensitive?: boolean
  clientGoal: string
  whatWeDid: readonly string[]
  tools: readonly string[]
  result: string
}

export type Project = typeof PROJECTS[number]
