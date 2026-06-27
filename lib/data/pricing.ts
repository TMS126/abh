// lib/data/pricing.ts

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

export type PricingCategory = keyof typeof PRICING
export type PricingMap = typeof PRICING
