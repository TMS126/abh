// Pricing data for all services
export const PRICING = {
  print: {
    'B&W Print': 'R5/page',
    'Colour Print': 'R8/page',
    'B&W Copy': 'R3/page',
    'Colour Copy': 'R5/page',
    'Bulk Printing': 'Ask us',
    '4×6 Glossy': 'R20',
    'A4 Glossy': 'R40'
  },
  doc: {
    'B&W Typing': 'R15/page',
    'Colour Typing': 'R18/page',
    'CV from scratch': 'R30',
    'CV upgrade': 'R40',
    'Cover letter': 'R30',
    'Affidavit/Letter': 'R20',
    'Scanning': 'R5/page',
    'A5 Laminate': 'R12',
    'A4 Laminate': 'R15',
    'A3 Laminate': 'R30'
  },
  design: {
    'Logo - Basic': 'R300',
    'Logo - Standard': 'R500',
    'Logo - Premium': 'R800',
    'Business Card 1-side': 'R120',
    'Business Card 2-side': 'R180',
    'Flyer - Simple': 'R150',
    'Flyer - Custom': 'R250',
    'Flyer - Complex': 'R350',
    'Social Post': 'R80',
    'Post + Story': 'R120',
    'Image Invite': 'R150',
    'Video Invite': 'R300',
    'Revision (active)': 'R50',
    'Revision (after)': 'R70'
  },
  eservice: {
    'SASSA Status': 'R10',
    'SASSA Payment': 'R15',
    'SASSA Update': 'R20',
    'SASSA Reapply': 'R30',
    'SRD': 'R30',
    'SASSA Appeal': 'R40',
    'Banking Update': 'R30',
    'Grant Application': 'R70',
    'SARS Enquiry': 'R50',
    'SARS eFiling': 'R70',
    'Tax Pin/Penalty': 'R100',
    'SARS Clearance': 'R120',
    'Tax Return/VAT': 'R150',
    'Pin Submission': 'R200',
    'PSIRA Status': 'R20',
    'PSIRA Update': 'R30',
    'Lost Certificate': 'R50',
    'PSIRA Renewal': 'R80',
    'ID Application': 'R100',
    'NSFAS Status': 'R15',
    'NSFAS Banking': 'R20',
    'Learnership': 'R30',
    'Job Application': 'R40',
    'Bursary': 'R40',
    'NSFAS Appeal': 'R50',
    'NSFAS Apply': 'R60',
    'University Apply': 'R80',
    'Email Setup': 'R15',
    'Google Business': 'R80',
    'Good Standing': 'R60',
    'UIF Monthly': 'R80',
    'CSD Update': 'R100',
    'UIF Registration': 'R100',
    'UIF Claims': 'R150',
    'CSD Registration': 'R250',
    'Social Setup': 'R50',
    'Learner Booking': 'R50',
    'WhatsApp Business': 'R60'
  },
  tech: {
    'Software Install': 'R80',
    'Driver Install': 'R80',
    'Updates': 'R80',
    'Printer Setup': 'R100',
    'PC Setup': 'R200',
    'Troubleshooting': 'R150/hr',
    'PC Cleanup': 'R150',
    'Virus Removal': 'R180',
    'OS Update': 'R180',
    'Windows Install': 'R250',
    'Windows + Activation': 'R320',
    'Activation Only': 'R100',
    'Microsoft 365': 'R120'
  }
} as const

export type HubId = 'print' | 'doc' | 'design' | 'eservice' | 'tech'

export interface HubSection {
  title: string
  items: string[]
}

export interface Hub {
  icon: string
  title: string
  sub: string
  desc: string
  sections: HubSection[]
  highlights: { name: string; price: string }[]
  colorClass: string
}

export const HUBS: Record<HubId, Hub> = {
  print: {
    icon: '🖨️',
    title: 'Print Hub',
    sub: 'Fast, clear and affordable printing for every need',
    desc: "We handle all your printing and copying needs — from a single page to bulk jobs. Black & white or full colour, standard documents or glossy photos.",
    colorClass: 'hub-print',
    highlights: [
      { name: 'B&W Print', price: 'R5/page' },
      { name: 'Colour Print', price: 'R8/page' },
      { name: 'Photo Prints', price: 'From R20' }
    ],
    sections: [
      { title: '🖨️ Printing & Copying', items: ['B&W Print', 'Colour Print', 'B&W Copy', 'Colour Copy', 'Bulk Printing'] },
      { title: '🖼️ Photo Printing', items: ['4×6 Glossy', 'A4 Glossy'] }
    ]
  },
  doc: {
    icon: '📄',
    title: 'Document Hub',
    sub: 'Professional documents, CVs, scanning & laminating',
    desc: "From typing and printing your documents to crafting a standout CV — we take care of your paperwork so you don't have to stress about it.",
    colorClass: 'hub-doc',
    highlights: [
      { name: 'CV Creation', price: 'R30' },
      { name: 'Cover Letters', price: 'R30' },
      { name: 'Laminating', price: 'From R12' }
    ],
    sections: [
      { title: '📝 Typing & Documents', items: ['B&W Typing', 'Colour Typing', 'Affidavit/Letter'] },
      { title: '📄 CV Services', items: ['CV from scratch', 'CV upgrade', 'Cover letter'] },
      { title: '📠 Scanning', items: ['Scanning'] },
      { title: '🛡️ Laminating', items: ['A5 Laminate', 'A4 Laminate', 'A3 Laminate'] }
    ]
  },
  design: {
    icon: '🎨',
    title: 'Design Hub',
    sub: 'Professional designs for your brand, events & marketing',
    desc: 'Stand out with eye-catching, professional designs. Whether you need a brand identity, marketing material, event invitations, or social media content — we create work that looks great.',
    colorClass: 'hub-design',
    highlights: [
      { name: 'Logo Design', price: 'From R300' },
      { name: 'Flyers', price: 'From R150' },
      { name: 'Business Cards', price: 'From R120' }
    ],
    sections: [
      { title: '🧩 Logo & Branding', items: ['Logo - Basic', 'Logo - Standard', 'Logo - Premium', 'Business Card 1-side', 'Business Card 2-side'] },
      { title: '📢 Marketing Design', items: ['Flyer - Simple', 'Flyer - Custom', 'Flyer - Complex', 'Social Post', 'Post + Story'] },
      { title: '🎉 Event Design', items: ['Image Invite', 'Video Invite'] },
      { title: '🔄 Revisions', items: ['Revision (active)', 'Revision (after)'] }
    ]
  },
  eservice: {
    icon: '🌐',
    title: 'E-Service Hub',
    sub: 'Government & online services handled correctly, without the stress',
    desc: 'Government platforms can be confusing. We help you register, apply, update and manage everything online — saving you transport, time and frustration.',
    colorClass: 'hub-eservice',
    highlights: [
      { name: 'SASSA', price: 'From R10' },
      { name: 'SARS', price: 'From R50' },
      { name: 'PSIRA', price: 'From R20' }
    ],
    sections: [
      { title: '🏛️ SASSA Services', items: ['SASSA Status', 'SASSA Payment', 'SASSA Update', 'SASSA Reapply', 'SRD', 'SASSA Appeal', 'Banking Update', 'Grant Application'] },
      { title: '🧾 SARS Services', items: ['SARS Enquiry', 'SARS eFiling', 'Tax Pin/Penalty', 'SARS Clearance', 'Tax Return/VAT', 'Pin Submission'] },
      { title: '🪪 PSIRA Services', items: ['PSIRA Status', 'PSIRA Update', 'Lost Certificate', 'PSIRA Renewal', 'ID Application'] },
      { title: '📚 Applications', items: ['NSFAS Status', 'NSFAS Banking', 'Learnership', 'Job Application', 'Bursary', 'NSFAS Appeal', 'NSFAS Apply', 'University Apply'] },
      { title: '📧 Digital Services', items: ['Email Setup', 'Google Business', 'Social Setup', 'Learner Booking', 'WhatsApp Business'] },
      { title: '🏢 Business Services', items: ['Good Standing', 'UIF Monthly', 'CSD Update', 'UIF Registration', 'UIF Claims', 'CSD Registration'] }
    ]
  },
  tech: {
    icon: '💻',
    title: 'Tech Hub',
    sub: 'Software installs, repairs & hardware setup',
    desc: "From slow laptops to fresh Windows installs — we sort out everyday tech problems quickly and affordably. No jargon, just results.",
    colorClass: 'hub-tech',
    highlights: [
      { name: 'Windows Install', price: 'R250' },
      { name: 'Virus Removal', price: 'R180' },
      { name: 'PC Cleanup', price: 'R150' }
    ],
    sections: [
      { title: '⚙️ Software & Systems', items: ['Software Install', 'Driver Install', 'Updates', 'Windows Install', 'Windows + Activation', 'Activation Only', 'Microsoft 365'] },
      { title: '🔌 Hardware & Setup', items: ['Printer Setup', 'PC Setup'] },
      { title: '🛠️ Repairs & Optimization', items: ['Troubleshooting', 'PC Cleanup', 'Virus Removal', 'OS Update'] }
    ]
  }
}
