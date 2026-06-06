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
    'Laminating (A5)': 'R12',
    'Laminating (A4)': 'R15',
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
    'SASSA Status Check': 'R10',
    'SASSA Payment/Balance': 'R15',
    'SASSA Update': 'R20',
    'SASSA Reapply': 'R30',
    'SASSA SRD': 'R30',
    'SASSA Appeal': 'R40',
    'SASSA Banking Update': 'R30',
    'SASSA Grant Application': 'R70',
    'SARS Enquiry/Statement': 'R50',
    'SARS eFiling/New Taxpayer': 'R70',
    'SARS Tax Pin/Penalty': 'R100',
    'SARS Clearance': 'R120',
    'SARS Tax Return/VAT/PAYE': 'R150',
    'SARS Pin Submission': 'R200',
    'PSIRA Status': 'R20',
    'PSIRA Update/Certificate': 'R30',
    'PSIRA Lost Certificate': 'R50',
    'PSIRA Renewal/New': 'R80',
    'PSIRA ID Application': 'R100',
    'NSFAS Status': 'R15',
    'NSFAS Banking Update': 'R20',
    'Learnership Application': 'R30',
    'Job/DPSA Application': 'R40',
    'Bursary Application': 'R40',
    'NSFAS Appeal': 'R50',
    'NSFAS Application': 'R60',
    'University Application': 'R80',
    'Email Setup/Send/Receive': 'R15',
    'Good Standing Letter': 'R60',
    'Google Business Setup': 'R80',
    'UIF Monthly Declaration': 'R80',
    'CSD Update': 'R100',
    'UIF Registration': 'R100',
    'UIF Claims': 'R150',
    'CSD Registration': 'R250',
    'Social Media Setup': 'R50',
    "Learner's Licence Booking": 'R50',
    'WhatsApp Business Setup': 'R60',
  },
  tech: {
    'Software Install': 'R80',
    'Driver Installation': 'R80',
    'App/Office Updates': 'R80',
    'Printer Setup': 'R100',
    'PC Setup': 'R200',
    'Troubleshooting': 'R150/hr',
    'PC Cleanup': 'R150',
    'Virus/Malware Removal': 'R180',
    'OS Update': 'R180',
    'Windows Install (No Activation)': 'R250',
    'Windows Install + Activation': 'R320',
    'Activation Only': 'R100',
    'Microsoft 365 Setup': 'R120',
  },
} as const

export type HubId = 'print' | 'doc' | 'design' | 'eservice' | 'tech'

export interface ServiceItem {
  name: string
  price: string
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
    iconColor: '#A9D6F2',
    title: 'Print Hub',
    grad: 'linear-gradient(135deg, #1E6FA8, #0F3F66)',
    desc: 'Fast, clear and affordable printing for every need — from a single page to bulk jobs.',
    tagStyle: { bg: '#EBF5FB', color: '#0F3F66' },
    tagStyleDark: { bg: '#1E3A52', color: '#A9D6F2' },
    previews: ['B&W Printing', 'Colour Printing', 'Photo Prints'],
    sections: [
      {
        title: 'Printing',
        items: [
          { name: 'Black & White', price: 'R5/page' },
          { name: 'Colour', price: 'R8/page' },
        ],
      },
      {
        title: 'Copying',
        items: [
          { name: 'Black & White', price: 'R3/page' },
          { name: 'Colour', price: 'R5/page' },
        ],
      },
      {
        title: 'Photo Printing',
        items: [
          { name: '4x6 Glossy', price: 'R20' },
          { name: 'A4 Glossy', price: 'R40' },
        ],
      },
    ],
  },
  doc: {
    iconName: 'FileText',
    iconColor: '#CDEB9F',
    // ← Renamed from "Document Hub" to "Docu Hub"
    title: 'Docu Hub',
    grad: 'linear-gradient(135deg, #3E6B0E, #6FBF1A)',
    desc: 'From typing and printing to professional CVs and laminating — we handle your paperwork.',
    tagStyle: { bg: '#EAFAF1', color: '#3E6B0E' },
    tagStyleDark: { bg: '#1A3010', color: '#CDEB9F' },
    previews: ['CV Services', 'Typing & Docs', 'Laminating'],
    sections: [
      {
        title: 'Typing + Printing',
        items: [
          { name: 'Black & White', price: 'R15/page' },
          { name: 'Colour', price: 'R18/page' },
        ],
      },
      {
        title: 'CV Services',
        items: [
          { name: 'CV from Scratch', price: 'R30' },
          { name: 'CV Upgrade/Fix', price: 'R40' },
          { name: 'Cover Letter', price: 'R30' },
        ],
      },
      {
        title: 'Other Documents',
        items: [
          { name: 'Affidavit / Letter', price: 'R20' },
        ],
      },
      {
        title: 'Scanning',
        items: [
          { name: 'Scan to Digital', price: 'R5/page' },
        ],
      },
      {
        title: 'Laminating',
        items: [
          { name: 'A5', price: 'R12' },
          { name: 'A4', price: 'R15' },
          { name: 'A3', price: 'R30' },
        ],
      },
    ],
  },
  design: {
    iconName: 'PaintBrush',
    iconColor: '#F9D1B0',
    title: 'Design Hub',
    grad: 'linear-gradient(135deg, #B86F34, #F4A261)',
    desc: 'Professional designs for your brand, events and marketing — eye-catching and print-ready.',
    tagStyle: { bg: '#FEF3C7', color: '#B86F34' },
    tagStyleDark: { bg: '#3A2010', color: '#F9D1B0' },
    previews: ['Logo Design', 'Flyers & Posters', 'Invitations'],
    sections: [
      {
        title: 'Logos',
        items: [
          { name: 'Basic Logo', price: 'R300' },
          { name: 'Standard Logo', price: 'R500' },
          { name: 'Premium Logo', price: 'R800' },
        ],
      },
      {
        title: 'Business Cards',
        items: [
          { name: 'Single Side', price: 'R120' },
          { name: 'Double Side', price: 'R180' },
        ],
      },
      {
        title: 'Flyers & Posters',
        items: [
          { name: 'Simple', price: 'R150' },
          { name: 'Custom', price: 'R250' },
          { name: 'Complex', price: 'R350' },
        ],
      },
      {
        title: 'Social Media',
        items: [
          { name: 'Post', price: 'R80' },
          { name: 'Post + Story', price: 'R120' },
        ],
      },
      {
        title: 'Invitations',
        items: [
          { name: 'Image/Static', price: 'R150' },
          { name: 'Video', price: 'R300' },
        ],
      },
      {
        title: 'Revisions',
        items: [
          { name: 'While Busy', price: 'R50' },
          { name: 'After Completion', price: 'R70' },
        ],
      },
    ],
  },
  eservice: {
    iconName: 'Globe',
    iconColor: '#A9D6F2',
    title: 'E-Service Hub',
    grad: 'linear-gradient(135deg, #0F3F66, #15537D)',
    desc: "Government platforms made easy. We handle registrations, applications and updates so you don't have to stress.",
    tagStyle: { bg: '#EBF5FB', color: '#0F3F66' },
    tagStyleDark: { bg: '#1E3A52', color: '#A9D6F2' },
    previews: ['SASSA', 'SARS eFiling', 'UIF & CSD'],
    sections: [
      {
        title: 'SASSA',
        items: [
          { name: 'Status Check', price: 'R20' },
          { name: 'Payment/Balance Check', price: 'R15' },
          { name: 'Update Details', price: 'R30' },
          { name: 'Reapplication', price: 'R40' },
          { name: 'SRD Application', price: 'R40' },
          { name: 'Appeal', price: 'R40' },
          { name: 'Banking Update', price: 'R60' },
          { name: 'Grant Application', price: 'R80' },
        ],
      },
      {
        title: 'SARS',
        items: [
          { name: 'Enquiry / Statement', price: 'R50' },
          { name: 'New Taxpayer / eFiling', price: 'R70' },
          { name: 'Tax Pin / Penalty', price: 'R100' },
          { name: 'Tax Clearance', price: 'R120' },
          { name: 'Tax Return / VAT / PAYE', price: 'R150' },
          { name: 'Pin Submission', price: 'R200' },
        ],
      },
      {
        title: 'PSIRA',
        items: [
          { name: 'PSIRA Status Check', price: 'R20' },
          { name: 'Update / Certificate', price: 'R50' },
          { name: 'Lost Certificate', price: 'R60' },
          { name: 'Renewal / New Registration', price: 'R80' },
          { name: 'ID Application', price: 'R100' },
        ],
      },
      {
        title: 'Online Applications',
        items: [
          { name: 'NSFAS Status Check', price: 'R20' },
          { name: 'NSFAS Banking Update', price: 'R30' },
          { name: 'Learnership Application', price: 'R30' },
          { name: 'Job / DPSA Application', price: 'R40' },
          { name: 'Bursary Application', price: 'R40' },
          { name: 'NSFAS Appeal', price: 'R50' },
          { name: 'NSFAS Application', price: 'R60' },
          { name: 'University Application', price: 'R80' },
        ],
      },
      {
        title: 'Email Services',
        items: [
          { name: 'Setup / Send / Receive', price: 'R15' },
        ],
      },
      {
        title: 'Business Services',
        items: [
          { name: 'Good Standing Letter', price: 'R60' },
          { name: 'Google Business Setup', price: 'R80' },
          { name: 'UIF Monthly Declaration', price: 'R80' },
          { name: 'CSD Update', price: 'R100' },
          { name: 'UIF Registration', price: 'R100' },
          { name: 'UIF Claims', price: 'R150' },
          { name: 'CSD Registration', price: 'R250' },
        ],
      },
      {
        title: 'Digital Setup',
        items: [
          { name: 'Social Media Setup', price: 'R50' },
          { name: "Learner's Licence Booking", price: 'R50' },
          { name: 'WhatsApp Business Setup', price: 'R60' },
        ],
      },
    ],
  },
  tech: {
    iconName: 'Desktop',
    iconColor: '#B8CCE0',
    title: 'Tech Hub',
    grad: 'linear-gradient(135deg, #2C3E50, #4A6785)',
    desc: 'From slow laptops to fresh Windows installs — everyday tech problems solved quickly and affordably.',
    tagStyle: { bg: '#F0F3F6', color: '#2C3E50' },
    tagStyleDark: { bg: '#1E2A38', color: '#B8CCE0' },
    previews: ['Windows Install', 'Virus Removal', 'PC Setup'],
    sections: [
      {
        title: 'Software',
        items: [
          { name: 'Software Install', price: 'R80' },
          { name: 'Driver Installation', price: 'R80' },
          { name: 'App / Office Updates', price: 'R80' },
        ],
      },
      {
        title: 'Hardware',
        items: [
          { name: 'Printer Setup', price: 'R100' },
          { name: 'PC Setup', price: 'R200' },
        ],
      },
      {
        title: 'Support',
        items: [
          { name: 'Troubleshooting', price: 'R150/hr' },
          { name: 'PC Cleanup', price: 'R150' },
          { name: 'Virus / Malware Removal', price: 'R180' },
          { name: 'OS Update', price: 'R180' },
        ],
      },
      {
        title: 'Windows & Office',
        items: [
          { name: 'Windows Install (No Activation)', price: 'R250' },
          { name: 'Windows Install + Activation', price: 'R320' },
          { name: 'Activation Only', price: 'R100' },
          { name: 'Microsoft 365 Setup', price: 'R120' },
        ],
      },
    ],
  },
}
