// lib/data.ts — Content only. Styling comes from @/lib/brand.
import { HUB_COLORS, HUB_NAMES, type HubKey } from '@/lib/brand'

export const PRICING = {
  print: {
    'B&W Print': 'R5/page',
    'Colour Print': 'R8/page',
    'B&W Copy': 'R3/page',
    'Colour Copy': 'R5/page',
    'Glossy Photo (4x6)': 'R20',
    'Glossy Photo (A4)': 'R40'
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
    'Laminating (A3)': 'R30'
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
    'Revision — After Completion': 'R70'
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
    'WhatsApp Business Setup': 'R80'
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
    'Windows Install + Activation': 'R350'
  }
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

// ─── HUBS ─────────────────────────────────────────────────────────────────────

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
              `We print your digital file in crisp black and white on standard A4 paper. Send your file via USB, WhatsApp, or email — we handle the rest. Bulk discounts apply from 10 pages.`,
            requirements: [
              'Bring your file on a USB, phone, or send it via WhatsApp/email',
              'Let us know the number of pages and copies needed',
              'Specify paper size if not standard A4'
            ]
          },
          {
            name: 'Colour',
            price: 'R8/page',
            description:
              `Full-colour printing for documents, presentations, flyers, and anything that needs to stand out. We print your digital file directly — just send it over and collect.`,
            requirements: [
              'Bring your file on a USB, phone, or send it via WhatsApp/email',
              'Let us know the number of pages and copies needed',
              'Specify paper size if not standard A4'
            ]
          }
        ]
      },

      {
        title: 'Copying',
        items: [
          {
            name: 'Black & White',
            price: 'R3/page',
            description:
              `Bring in your original physical document and we'll make as many black and white copies as you need — fast and affordable. Great for ID copies, forms, and school work.`,
            requirements: [
              'Bring original document',
              'Specify number of copies'
            ]
          },
          {
            name: 'Colour',
            price: 'R5/page',
            description:
              `Exact colour reproduction of your document, certificate, or photo. Ideal for preserving originals while sharing copies.`,
            requirements: [
              'Bring original document',
              'Specify number of copies'
            ]
          }
        ]
      },

      {
        title: 'Photo Printing',
        items: [
          {
            name: '4x6 Glossy',
            price: 'R20',
            description:
              `Classic photo print on glossy paper with sharp colour and professional finish.`,
            requirements: [
              'Send high-resolution image via WhatsApp/email/USB',
              'Ensure image quality is good for printing'
            ]
          },
          {
            name: 'A4 Glossy',
            price: 'R40',
            description:
              `Large format photo print for portraits or display purposes.`,
            requirements: [
              'Send high-resolution image',
              'Avoid low-quality compressed images'
            ]
          }
        ]
      }
    ]
  },

  // ─── DOC HUB ────────────────────────────────────────────────────────────────

  doc: {
    iconName: 'FileText',
    iconColor: HUB_COLORS.doc.light,
    title: HUB_NAMES.doc,
    grad: HUB_COLORS.doc.gradient,
    desc: `From typing and printing to professional CVs and laminating — we handle your paperwork.`,
    tagStyle: { bg: HUB_COLORS.doc.tagBg, color: HUB_COLORS.doc.tagText },
    tagStyleDark: { bg: HUB_COLORS.doc.tagBgDark, color: HUB_COLORS.doc.tagTextDark },
    previews: ['CV Services', 'Typing & Documents', 'Laminating'],
    sections: [
      {
        title: 'Typing + Printing',
        items: [
          {
            name: 'Black & White',
            price: 'R15/page',
            description:
              `We type handwritten or rough drafts into clean formatted documents and print them.`,
            requirements: [
              'Bring handwritten notes or draft',
              'Specify formatting needs',
              'Confirm number of pages'
            ]
          },
          {
            name: 'Colour',
            price: 'R18/page',
            description:
              `Typed documents printed in colour for charts, headings, or presentations.`,
            requirements: [
              'Bring notes or draft',
              'Specify formatting',
              'Confirm pages'
            ]
          }
        ]
      },

      {
        title: 'CV Services',
        items: [
          {
            name: 'CV from Scratch',
            price: 'R30',
            description:
              `Full CV creation for first-time job seekers.`,
            requirements: [
              'ID document',
              'Personal details',
              'Education history',
              'Work experience (if any)'
            ]
          },
          {
            name: 'CV Upgrade/Fix',
            price: 'R40',
            description:
              `Improve formatting, structure, and content of existing CV.`,
            requirements: [
              'Existing CV',
              'Updates needed'
            ]
          },
          {
            name: 'Cover Letter',
            price: 'R30',
            description:
              `Custom cover letter tailored to job application.`,
            requirements: [
              'Job details',
              'CV reference',
              'Key skills'
            ]
          }
        ]
      },

      {
        title: 'Other Documents',
        items: [
          {
            name: 'Affidavit / Letter',
            price: 'R20',
            description:
              `Formal typed letters or affidavits for official use.`,
            requirements: [
              'ID document',
              'Details to include',
              'Supporting info if needed'
            ]
          }
        ]
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
              'Bring documents',
              'Specify format (PDF/JPG)',
              'USB or WhatsApp/email delivery'
            ]
          }
        ]
      },

      {
        title: 'Laminating',
        items: [
          {
            name: 'A5',
            price: 'R15',
            description: `Protect small documents with lamination.`,
            requirements: ['Bring document clean and flat']
          },
          {
            name: 'A4',
            price: 'R20',
            description: `Standard document lamination.`,
            requirements: ['Bring document clean and flat']
          },
          {
            name: 'A3',
            price: 'R30',
            description: `Large format lamination for posters.`,
            requirements: ['Bring document clean and flat']
          }
        ]
      }
    ]
  },

  // ─── DESIGN HUB (START) ────────────────────────────────────────────────────

  design: {
    iconName: 'PaintBrush',
    iconColor: HUB_COLORS.design.light,
    title: HUB_NAMES.design,
    grad: HUB_COLORS.design.gradient,
    desc: `Professional designs for branding, marketing, and events.`,
    tagStyle: { bg: HUB_COLORS.design.tagBg, color: HUB_COLORS.design.tagText },
    tagStyleDark: { bg: HUB_COLORS.design.tagBgDark, color: HUB_COLORS.design.tagTextDark },
    previews: ['Logo Design', 'Flyers', 'Social Media'],
    sections: [
      {
        title: 'Logos',
        items: [
          {
            name: 'Basic Logo',
            price: 'R300',
            description: `Simple logo for startups and small businesses.`,
            requirements: ['Business name', 'Style preference']
          },
          {
            name: 'Standard Logo',
            price: 'R500',
            description: `Multiple concepts and refinements.`,
            requirements: ['Business details', 'Style direction']
          },
          {
            name: 'Premium Logo',
            price: 'R800',
            description: `Full branding identity package.`,
            requirements: ['Full brand vision']
          }
        ]
      },

      {
        title: 'Business Cards',
        items: [
          {
            name: 'Single Side',
            price: 'R120',
            description: `Clean professional business card.`,
            requirements: ['Contact details', 'Logo']
          },
          {
            name: 'Double Side',
            price: 'R180',
            description: `Front and back design with extra info.`,
            requirements: ['Business info', 'Back content']
          }
        ]
      },

      {
        title: 'Flyers & Posters',
        items: [
          {
            name: 'Simple',
            price: 'R150',
            description: `Basic promotional flyer.`,
            requirements: ['Text content', 'Images if any']
          },
          {
            name: 'Custom',
            price: 'R250',
            description: `Fully designed marketing flyer.`,
            requirements: ['Full content', 'Brand style']
          },
          {
            name: 'Complex',
            price: 'R350',
            description: `Multi-section professional layout.`,
            requirements: ['Detailed content']
          }
        ]
      }
    ]
  }
   }

// ─── DESIGN HUB (CONTINUED) ────────────────────────────────────────────────

design: {
  iconName: 'PaintBrush',
  iconColor: HUB_COLORS.design.light,
  title: HUB_NAMES.design,
  grad: HUB_COLORS.design.gradient,
  desc: `Professional designs for branding, marketing, and events.`,
  tagStyle: { bg: HUB_COLORS.design.tagBg, color: HUB_COLORS.design.tagText },
  tagStyleDark: { bg: HUB_COLORS.design.tagBgDark, color: HUB_COLORS.design.tagTextDark },
  previews: ['Logo Design', 'Flyers', 'Social Media'],

  sections: [
    {
      title: 'Logos',
      items: [
        { name: 'Basic Logo', price: 'R300', description: `Simple logo for startups and small businesses.`, requirements: ['Business name', 'Style preference'] },
        { name: 'Standard Logo', price: 'R500', description: `Multiple concepts and refinements.`, requirements: ['Business details', 'Style direction'] },
        { name: 'Premium Logo', price: 'R800', description: `Full branding identity package.`, requirements: ['Full brand vision'] }
      ]
    },

    {
      title: 'Business Cards',
      items: [
        { name: 'Single Side', price: 'R120', description: `Clean professional business card.`, requirements: ['Contact details', 'Logo'] },
        { name: 'Double Side', price: 'R180', description: `Front and back design with extra info.`, requirements: ['Business info', 'Back content'] }
      ]
    },

    {
      title: 'Flyers & Posters',
      items: [
        { name: 'Simple', price: 'R150', description: `Basic promotional flyer.`, requirements: ['Text content', 'Images if any'] },
        { name: 'Custom', price: 'R250', description: `Fully designed marketing flyer.`, requirements: ['Full content', 'Brand style'] },
        { name: 'Complex', price: 'R350', description: `Multi-section professional layout.`, requirements: ['Detailed content'] }
      ]
    },

    {
      title: 'Social Media',
      items: [
        { name: 'Post', price: 'R80', description: `Single branded social media post.`, requirements: ['Text content', 'Platform'] },
        { name: 'Post + Story', price: 'R120', description: `Matched post + story design.`, requirements: ['Content', 'Platform'] }
      ]
    },

    {
      title: 'Invitations',
      items: [
        { name: 'Static Invitation', price: 'R150', description: `Designed invite image.`, requirements: ['Event details'] },
        { name: 'Video Invitation', price: 'R300', description: `Animated video invite.`, requirements: ['Event details', 'Media assets'] }
      ]
    },

    {
      title: 'Revisions',
      items: [
        { name: 'While Busy', price: 'R50', description: `Changes during active design stage.`, requirements: ['Describe changes'] },
        { name: 'After Completion', price: 'R70', description: `Changes after delivery.`, requirements: ['Describe changes'] }
      ]
    }
  ]
},

// ─── ESERVICE HUB ───────────────────────────────────────────────────────────

eservice: {
  iconName: 'Globe',
  iconColor: HUB_COLORS.eservice.light,
  title: HUB_NAMES.eservice,
  grad: HUB_COLORS.eservice.gradient,
  desc: `Government platforms made easy — we handle applications, updates, and registrations.`,
  tagStyle: { bg: HUB_COLORS.eservice.tagBg, color: HUB_COLORS.eservice.tagText },
  tagStyleDark: { bg: HUB_COLORS.eservice.tagBgDark, color: HUB_COLORS.eservice.tagTextDark },
  previews: ['SASSA', 'SARS', 'NSFAS', 'UIF', 'CSD'],

  sections: [
    {
      title: 'SASSA',
      items: [
        { name: 'Status Check', price: 'R20', description: `Check grant/application status.`, requirements: ['ID', 'Reference number'] },
        { name: 'Payment/Balance Check', price: 'R15', description: `Check payment status.`, requirements: ['ID', 'SASSA card details'] },
        { name: 'Update Details', price: 'R30', description: `Update SASSA profile information.`, requirements: ['ID', 'New details proof'] },
        { name: 'SRD Application', price: 'R40', description: `Apply for R350 SRD grant.`, requirements: ['ID', 'Phone number'] },
        { name: 'Reapplication', price: 'R40', description: `Reapply for declined/lapsed grant.`, requirements: ['ID', 'Previous record'] },
        { name: 'Appeal', price: 'R40', description: `Appeal rejected application.`, requirements: ['ID', 'Decline notice'] },
        { name: 'Banking Update', price: 'R40', description: `Update payment banking details.`, requirements: ['ID', 'Bank proof'] },
        { name: 'Grant Application', price: 'R80', description: `Apply for full SASSA grants.`, requirements: ['ID', 'Supporting docs'] }
      ]
    },

    {
      title: 'SARS',
      items: [
        { name: 'Enquiry / Updates', price: 'R50', description: `SARS account queries.`, requirements: ['ID', 'Tax number'] },
        { name: 'New Taxpayer / eFiling', price: 'R70', description: `Register on SARS system.`, requirements: ['ID', 'Proof of address'] },
        { name: 'Tax Pin / Penalty', price: 'R100', description: `PIN or penalty handling.`, requirements: ['ID', 'SARS notice'] },
        { name: 'Tax Clearance', price: 'R120', description: `Tax clearance certificate.`, requirements: ['ID', 'Tax number'] },
        { name: 'Pin Submission', price: 'R120', description: `Submit SARS PIN.`, requirements: ['ID', 'Reference'] },
        { name: 'Tax Return / VAT / PAYE', price: 'R200', description: `Full tax filing.`, requirements: ['Income docs', 'ID'] }
      ]
    },

    {
      title: 'PSIRA',
      items: [
        { name: 'Status Check', price: 'R30', description: `Check registration status.`, requirements: ['ID', 'PSIRA number'] },
        { name: 'Update / Certificate', price: 'R40', description: `Update details or certificate.`, requirements: ['ID', 'PSIRA number'] },
        { name: 'Lost Certificate', price: 'R50', description: `Replacement certificate.`, requirements: ['ID', 'Affidavit'] },
        { name: 'Renewal / Registration', price: 'R80', description: `New or renewal registration.`, requirements: ['ID', 'Training docs'] },
        { name: 'ID Application', price: 'R100', description: `PSIRA ID card application.`, requirements: ['ID', 'Photo'] }
      ]
    },

    {
      title: 'Online Applications',
      items: [
        { name: 'NSFAS Status Check', price: 'R20', description: `Check NSFAS status.`, requirements: ['ID'] },
        { name: 'NSFAS Banking Update', price: 'R20', description: `Update NSFAS banking.`, requirements: ['ID', 'Bank proof'] },
        { name: 'Learnership Application', price: 'R30', description: `Apply for learnerships.`, requirements: ['ID', 'CV'] },
        { name: 'Job / DPSA Application', price: 'R40', description: `Government job applications.`, requirements: ['ID', 'CV'] },
        { name: 'Bursary Application', price: 'R40', description: `Apply for bursaries.`, requirements: ['Academic docs'] },
        { name: 'NSFAS Appeal', price: 'R50', description: `Appeal NSFAS decision.`, requirements: ['ID', 'Letter'] },
        { name: 'NSFAS Application', price: 'R80', description: `Full NSFAS application.`, requirements: ['ID', 'School results'] },
        { name: 'University Application', price: 'R100', description: `Apply to universities.`, requirements: ['Matric results'] }
      ]
    },

    {
      title: 'UIF & Business Services',
      items: [
        { name: 'UIF Monthly Declaration', price: 'R100', description: `Monthly UIF filing.`, requirements: ['Employer info'] },
        { name: 'UIF Registration', price: 'R100', description: `Register UIF account.`, requirements: ['Company docs'] },
        { name: 'UIF Claims', price: 'R200', description: `File UIF claim.`, requirements: ['UI19', 'Bank details'] },
        { name: 'CSD Registration', price: 'R300', description: `Supplier database registration.`, requirements: ['CIPC docs'] },
        { name: 'CSD Update', price: 'R120', description: `Update supplier profile.`, requirements: ['Company info'] },
        { name: 'Good Standing Letter', price: 'R60', description: `CIPC compliance proof.`, requirements: ['Company number'] },
        { name: 'Google Business Setup', price: 'R80', description: `Google listing setup.`, requirements: ['Business info'] }
      ]
    }
  ]
},

// ─── TECH HUB ───────────────────────────────────────────────────────────────

tech: {
  iconName: 'Desktop',
  iconColor: HUB_COLORS.tech.light,
  title: HUB_NAMES.tech,
  grad: HUB_COLORS.tech.gradient,
  desc: `Hardware, software, cleanup, and full system support.`,
  tagStyle: { bg: HUB_COLORS.tech.tagBg, color: HUB_COLORS.tech.tagText },
  tagStyleDark: { bg: HUB_COLORS.tech.tagBgDark, color: HUB_COLORS.tech.tagTextDark },
  previews: ['Windows Install', 'Virus Removal', 'Setup'],

  sections: [
    {
      title: 'Software',
      items: [
        { name: 'Software Install', price: 'R80', description: `Install apps safely.`, requirements: ['Device', 'Installer'] },
        { name: 'Driver Installation', price: 'R100', description: `Fix hardware drivers.`, requirements: ['Device'] },
        { name: 'App / Office Updates', price: 'R80', description: `Update software.`, requirements: ['Device'] }
      ]
    },

    {
      title: 'Hardware',
      items: [
        { name: 'Printer Setup', price: 'R100', description: `Connect and configure printer.`, requirements: ['Printer', 'PC'] },
        { name: 'PC Setup', price: 'R250', description: `Full new PC setup.`, requirements: ['Device'] }
      ]
    },

    {
      title: 'Support',
      items: [
        { name: 'Troubleshooting', price: 'R150/hr', description: `Fix unknown issues.`, requirements: ['Device', 'Issue description'] },
        { name: 'PC Cleanup', price: 'R150', description: `Speed up slow PC.`, requirements: ['Device'] },
        { name: 'Virus Removal', price: 'R200', description: `Remove malware.`, requirements: ['Device'] },
        { name: 'OS Update', price: 'R200', description: `Update Windows safely.`, requirements: ['Device'] }
      ]
    },

    {
      title: 'Windows & Office',
      items: [
        { name: 'Windows Install (No Activation)', price: 'R300', description: `Fresh Windows install.`, requirements: ['Backup data'] },
        { name: 'Windows Install + Activation', price: 'R350', description: `Full licensed install.`, requirements: ['Key'] },
        { name: 'Activation Only', price: 'R100', description: `Activate Windows.`, requirements: ['License key'] },
        { name: 'Microsoft 365 Setup', price: 'R150', description: `Install Office suite.`, requirements: ['Login'] }
      ]
    }
  ]
},

// ─── PROJECTS (FULL RESTORE) ────────────────────────────────────────────────

export const PROJECTS = [
  {
    id: "vasep-branding",
    hub: "design",
    title: "VASEP — Visual Arts Skills Empowerment Projects",
    tag: HUB_NAMES.design,
    shortDesc: "Full logo and brand identity for a local arts empowerment organisation.",
    image: "/vsp1.jpg",
    images: ["/Vspsktch.jpeg", "/vsp1.jpg", "/Vspm.jpg"],
    clientType: "client",
    clientGoal: `VASEP needed a logo that shows what they do — arts, skills, and community.`,
    whatWeDid: [
      "Designed paint palette base symbol",
      "Used multi-colour identity system",
      "Paint brushes + bottle concept",
      "Bold typography lockup",
      "T-shirt mockup branding"
    ],
    tools: ["Adobe Illustrator", "Vector design", "Mockups"],
    result: "Complete brand identity ready for print and digital use."
  },

  {
    id: "shuttle-flyer",
    hub: "design",
    title: "Sol's Shuttle Services",
    tag: HUB_NAMES.design,
    shortDesc: "Flyer and brand design for shuttle service.",
    image: "/Sol.jpg",
    images: ["/Sol.jpg"],
    clientType: "client",
    clientGoal: "Needed pricing flyer and brand identity.",
    whatWeDid: ["Pricing layout", "Service areas", "Transport visuals"],
    tools: ["Illustrator"],
    result: "Clear, professional transport flyer."
  },

  {
    id: "cv-creation",
    hub: "doc",
    title: "CV Creation for First-Time Job Seeker",
    tag: HUB_NAMES.doc,
    shortDesc: "Built CV from scratch.",
    image: "/gallery/docu/cv-2.jpg",
    images: ["/gallery/docu/cv-1.jpg", "/gallery/docu/cv-2.jpg", "/gallery/docu/cv-3.jpg"],
    clientType: "sample",
    clientGoal: "No CV existed.",
    whatWeDid: ["Full CV creation", "Formatting", "Print ready"],
    tools: ["Word"],
    result: "Professional CV delivered."
  },

  {
    id: "rekaofela-bulk-print",
    hub: "print",
    title: "Rekaofela Society — Stokvel Rules Print",
    tag: HUB_NAMES.print,
    shortDesc: "Bulk printing job.",
    image: "/gallery/print/printer.jpg",
    images: ["/gallery/print/printer.jpg"],
    clientType: "client",
    clientGoal: "Print stokvel rules for members.",
    whatWeDid: ["Typing", "Formatting", "100+ prints"],
    tools: ["Word", "Printer"],
    result: "Distributed copies to members."
  },

  {
    id: "sassa-srd",
    hub: "eservice",
    title: "SASSA SRD Application Assistance",
    tag: HUB_NAMES.eservice,
    shortDesc: "Assisted SRD application.",
    image: "/gallery/eservice/laptop-1.jpg",
    images: ["/gallery/eservice/laptop-1.jpg"],
    clientType: "sample",
    clientGoal: "Help applying for SRD.",
    whatWeDid: ["Application submission"],
    tools: ["Online portal"],
    result: "Application successfully submitted."
  },

  {
    id: "laptop-cleanup",
    hub: "tech",
    title: "Laptop Cleanup and Software Installation",
    tag: HUB_NAMES.tech,
    shortDesc: "Cleaned and optimized laptop.",
    image: "/gallery/tech/cleaning.jpg",
    images: ["/gallery/tech/cleaning.jpg"],
    clientType: "sample",
    clientGoal: "Fix slow laptop.",
    whatWeDid: ["Virus removal", "Cleanup", "Office install"],
    tools: ["System tools"],
    result: "Improved performance significantly."
  },

  {
    id: "pure-african-herbs",
    hub: "design",
    title: "Pure African Herbs — Flyer & A-Board Design",
    tag: HUB_NAMES.design,
    shortDesc: "Herbal business branding.",
    image: "/Ahm.jpg",
    images: ["/Aphp1.png", "/Aphp2.jpg", "/Ahm.jpg"],
    clientType: "client",
    clientGoal: "Marketing flyer + A-board.",
    whatWeDid: ["Health layout", "Service list", "A-board design"],
    tools: ["Illustrator"],
    result: "Attractive walk-in marketing design."
  },

  {
    id: "apexbytes-business-card",
    hub: "design",
    title: "Apexbytes Business Card Design",
    tag: HUB_NAMES.design,
    shortDesc: "Minimal brand card.",
    image: "/abbc.jpg",
    images: ["/abbc.jpg"],
    clientType: "client",
    clientGoal: "Clean professional card.",
    whatWeDid: ["Front design", "Back branding", "Minimal layout"],
    tools: ["Illustrator"],
    result: "Professional brand identity card."
  },

  {
    id: "wedding-party-programme",
    hub: "design",
    title: "Wedding Party Programme",
    tag: HUB_NAMES.design,
    shortDesc: "Event programme design.",
    image: "/Wp.png",
    images: ["/wedding_party_blurred.jpg"],
    clientType: "client",
    sensitive: true,
    clientGoal: "Wedding programme layout.",
    whatWeDid: ["Role layout", "Decorative styling", "Print formatting"],
    tools: ["Illustrator"],
    result: "Elegant printed programme."
  },

  {
    id: "illusion-technologies",
    hub: "design",
    title: "Illusion Technologies — Brand Identity",
    tag: HUB_NAMES.design,
    shortDesc: "Corporate brand concept.",
    image: "/Itw.jpg",
    images: ["/20230527_194537.jpg", "/Itp.jpg", "/Itw.jpg", "/Itm2.jpg"],
    clientType: "practice",
    clientGoal: "Premium tech brand exploration.",
    whatWeDid: [
      "Wordmark design",
      "Logo variants",
      "Building mockups",
      "Business cards",
      "Brand board"
    ],
    tools: ["Illustrator", "Photoshop"],
    result: "Full corporate identity concept."
  }
]
