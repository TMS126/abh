// Pricing data for all services - matches the HTML version
export const PRICING = {
  print: {
    'B&W Print / Copy': 'R2/page',
    'Colour Print / Copy': 'R5/page',
    'Bulk Printing': 'From R1.50/page',
    'Glossy Photo (4x6)': 'R15',
    'Glossy Photo (A4)': 'R35'
  },
  doc: {
    'Typing + Print (B&W)': 'R20',
    'Typing + Print (Colour)': 'R30',
    'Affidavit / Letter Typing': 'R25',
    'CV Creation': 'R80',
    'CV Revamp': 'R50',
    'Cover Letter': 'R40',
    'Scanning to Digital': 'R5/page',
    'Laminating (A5)': 'R10',
    'Laminating (A4)': 'R15',
    'Laminating (A3)': 'R20'
  },
  design: {
    'Logo — Starter': 'R150',
    'Logo — Standard': 'R300',
    'Logo — Full Brand': 'R500',
    'Business Card (Single Side)': 'R120',
    'Business Card (Double Side)': 'R180',
    'Flyer / Poster — Basic': 'R80',
    'Flyer / Poster — Standard': 'R150',
    'Flyer / Poster — Premium': 'R250',
    'Social Media Post': 'R60',
    'Post + Story': 'R100',
    'Static Invitation': 'R80',
    'Video Invitation': 'R200',
    'Revision — During Project': 'Free',
    'Revision — After Completion': 'R50'
  },
  eservice: {
    // SASSA
    'Status Check': 'R20',
    'SRD Application': 'R30',
    'Banking Update': 'R25',
    'Grant Application': 'R40',
    'Appeal Submission': 'R35',
    'Change of Contact Details': 'R20',
    'Payment Date / Balance Check': 'R15',
    'Reapplication (after rejection)': 'R35',
    // SARS
    'Enquiry': 'R20',
    'eFiling Registration': 'R50',
    'New Taxpayer Registration': 'R60',
    'Contact Details Update': 'R25',
    'Banking Details Update': 'R25',
    'Statement of Account Request': 'R30',
    'Tax Compliance Pin Issuing': 'R40',
    'Tax Clearance Certificate': 'R50',
    'Tax Return / ITR12 (Simple)': 'R80',
    'Auto Assessment (Accept / Edit)': 'R40',
    'VAT Registration': 'R100',
    'PAYE Registration': 'R100',
    'Penalty Remission Request': 'R60',
    // Applications
    'Job Application': 'R30',
    'University Application': 'R50',
    'NSFAS Application': 'R40',
    'Bursary Application': 'R40',
    'Learnership Application': 'R35',
    'Internship Application': 'R35',
    'Government Jobs (DPSA)': 'R30',
    'NSFAS Appeal': 'R40',
    'NSFAS Banking Detail Update': 'R25',
    'NSFAS Status Check': 'R15',
    // PSIRA
    'Certificate Assistance': 'R40',
    'Renewal': 'R40',
    'ID Application': 'R50',
    'New Registration (Grade E)': 'R60',
    'PSIRA Status Check': 'R20',
    'Address / Contact Update': 'R25',
    'Lost Certificate Application': 'R40',
    // Business
    'CSD Registration': 'R80',
    'CSD Update': 'R40',
    'UIF Registration': 'R60',
    'UIF Claims': 'R50',
    'UIF uFiling Registration': 'R50',
    'UIF Employer Registration': 'R60',
    'UIF Monthly Declaration': 'R30',
    'Letter of Good Standing': 'R50',
    'Google My Business Setup': 'R100',
    // Digital
    'Home Affairs Status Check': 'R20',
    "DLTC Learner's Licence Booking": 'R30',
    'WhatsApp Business Setup': 'R60',
    'Social Media Account Setup': 'R50',
    'Email Setup / Assistance': 'R40'
  },
  tech: {
    'Minor Software Install': 'R30',
    'Windows / Office Install (Unactivated)': 'R80',
    'Windows / Office Install + Activation': 'R120',
    'Windows Activation Only': 'R60',
    'App & Office Updates': 'R30',
    'Full Windows OS Update': 'R50',
    'Driver Installation': 'R40',
    'Microsoft 365 Setup': 'R80',
    'PC Setup & Hardware': 'R100',
    'Printer Setup': 'R60',
    'Troubleshooting': 'From R50',
    'Virus / Malware Removal': 'R100',
    'PC Cleanup / Optimization': 'R80'
  }
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
  icon: string
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
    icon: '🖨️',
    title: 'Print Hub',
    grad: 'linear-gradient(135deg, #1E6FA8, #0F3F66)',
    desc: 'Fast, clear and affordable printing for every need — from a single page to bulk jobs.',
    tagStyle: { bg: '#EBF5FB', color: '#0F3F66' },
    tagStyleDark: { bg: '#1E3A52', color: '#A9D6F2' },
    previews: ['B&W Printing', 'Colour Printing', 'Photo Prints'],
    sections: [
      { 
        title: '🖨️ Printing & Copying', 
        items: [
          { name: 'B&W Print / Copy', price: 'R2/page' },
          { name: 'Colour Print / Copy', price: 'R5/page' },
          { name: 'Bulk Printing', price: 'From R1.50/page' }
        ]
      },
      { 
        title: '🖼️ Photo Printing', 
        items: [
          { name: 'Glossy Photo (4x6)', price: 'R15' },
          { name: 'Glossy Photo (A4)', price: 'R35' }
        ]
      }
    ]
  },
  doc: {
    icon: '📄',
    title: 'Document Hub',
    grad: 'linear-gradient(135deg, #3E6B0E, #6FBF1A)',
    desc: "From typing and printing to professional CVs and laminating — we handle your paperwork.",
    tagStyle: { bg: '#EAFAF1', color: '#3E6B0E' },
    tagStyleDark: { bg: '#1A3010', color: '#CDEB9F' },
    previews: ['CV Creation', 'Typing & Documents', 'Laminating'],
    sections: [
      { 
        title: '📝 Typing & Documents', 
        items: [
          { name: 'Typing + Print (B&W)', price: 'R20' },
          { name: 'Typing + Print (Colour)', price: 'R30' },
          { name: 'Affidavit / Letter Typing', price: 'R25' }
        ]
      },
      { 
        title: '📄 CV Services', 
        items: [
          { name: 'CV Creation', price: 'R80' },
          { name: 'CV Revamp', price: 'R50' },
          { name: 'Cover Letter', price: 'R40' }
        ]
      },
      { 
        title: '📠 Scanning', 
        items: [
          { name: 'Scanning to Digital', price: 'R5/page' }
        ]
      },
      { 
        title: '🛡️ Laminating', 
        items: [
          { name: 'Laminating (A5)', price: 'R10' },
          { name: 'Laminating (A4)', price: 'R15' },
          { name: 'Laminating (A3)', price: 'R20' }
        ]
      }
    ]
  },
  design: {
    icon: '🎨',
    title: 'Design Hub',
    grad: 'linear-gradient(135deg, #B86F34, #F4A261)',
    desc: 'Professional designs for your brand, events and marketing — eye-catching and print-ready.',
    tagStyle: { bg: '#FEF3C7', color: '#B86F34' },
    tagStyleDark: { bg: '#3A2010', color: '#F9D1B0' },
    previews: ['Logo Design', 'Flyers & Posters', 'Invitations'],
    sections: [
      { 
        title: '🧩 Logo & Branding', 
        items: [
          { name: 'Logo — Starter', price: 'R150' },
          { name: 'Logo — Standard', price: 'R300' },
          { name: 'Logo — Full Brand', price: 'R500' },
          { name: 'Business Card (Single Side)', price: 'R120' },
          { name: 'Business Card (Double Side)', price: 'R180' }
        ]
      },
      { 
        title: '📢 Marketing Design', 
        items: [
          { name: 'Flyer / Poster — Basic', price: 'R80' },
          { name: 'Flyer / Poster — Standard', price: 'R150' },
          { name: 'Flyer / Poster — Premium', price: 'R250' },
          { name: 'Social Media Post', price: 'R60' },
          { name: 'Post + Story', price: 'R100' }
        ]
      },
      { 
        title: '🎉 Event Design', 
        items: [
          { name: 'Static Invitation', price: 'R80' },
          { name: 'Video Invitation', price: 'R200' }
        ]
      },
      { 
        title: '🔄 Revisions', 
        items: [
          { name: 'Revision — During Project', price: 'Free' },
          { name: 'Revision — After Completion', price: 'R50' }
        ]
      }
    ]
  },
  eservice: {
    icon: '🌐',
    title: 'E-Service Hub',
    grad: 'linear-gradient(135deg, #0F3F66, #15537D)',
    desc: "Government platforms made easy. We handle registrations, applications, and updates so you don't have to stress.",
    tagStyle: { bg: '#EBF5FB', color: '#0F3F66' },
    tagStyleDark: { bg: '#1E3A52', color: '#A9D6F2' },
    previews: ['SASSA', 'SARS eFiling', 'UIF Claims'],
    sections: [
      { 
        title: '🏛️ SASSA Services', 
        items: [
          { name: 'Status Check', price: 'R20' },
          { name: 'SRD Application', price: 'R30' },
          { name: 'Banking Update', price: 'R25' },
          { name: 'Grant Application', price: 'R40' },
          { name: 'Appeal Submission', price: 'R35' },
          { name: 'Change of Contact Details', price: 'R20' },
          { name: 'Payment Date / Balance Check', price: 'R15' },
          { name: 'Reapplication (after rejection)', price: 'R35' }
        ]
      },
      { 
        title: '🧾 SARS Services', 
        items: [
          { name: 'Enquiry', price: 'R20' },
          { name: 'eFiling Registration', price: 'R50' },
          { name: 'New Taxpayer Registration', price: 'R60' },
          { name: 'Contact Details Update', price: 'R25' },
          { name: 'Banking Details Update', price: 'R25' },
          { name: 'Statement of Account Request', price: 'R30' },
          { name: 'Tax Compliance Pin Issuing', price: 'R40' },
          { name: 'Tax Clearance Certificate', price: 'R50' },
          { name: 'Tax Return / ITR12 (Simple)', price: 'R80' },
          { name: 'Auto Assessment (Accept / Edit)', price: 'R40' },
          { name: 'VAT Registration', price: 'R100' },
          { name: 'PAYE Registration', price: 'R100' },
          { name: 'Penalty Remission Request', price: 'R60' }
        ]
      },
      { 
        title: '🌍 Applications', 
        items: [
          { name: 'Job Application', price: 'R30' },
          { name: 'University Application', price: 'R50' },
          { name: 'NSFAS Application', price: 'R40' },
          { name: 'Bursary Application', price: 'R40' },
          { name: 'Learnership Application', price: 'R35' },
          { name: 'Internship Application', price: 'R35' },
          { name: 'Government Jobs (DPSA)', price: 'R30' },
          { name: 'NSFAS Appeal', price: 'R40' },
          { name: 'NSFAS Banking Detail Update', price: 'R25' },
          { name: 'NSFAS Status Check', price: 'R15' }
        ]
      },
      { 
        title: '🪪 PSIRA Services', 
        items: [
          { name: 'Certificate Assistance', price: 'R40' },
          { name: 'Renewal', price: 'R40' },
          { name: 'ID Application', price: 'R50' },
          { name: 'New Registration (Grade E)', price: 'R60' },
          { name: 'PSIRA Status Check', price: 'R20' },
          { name: 'Address / Contact Update', price: 'R25' },
          { name: 'Lost Certificate Application', price: 'R40' }
        ]
      },
      { 
        title: '🏢 Business Services', 
        items: [
          { name: 'CSD Registration', price: 'R80' },
          { name: 'CSD Update', price: 'R40' },
          { name: 'UIF Registration', price: 'R60' },
          { name: 'UIF Claims', price: 'R50' },
          { name: 'UIF uFiling Registration', price: 'R50' },
          { name: 'UIF Employer Registration', price: 'R60' },
          { name: 'UIF Monthly Declaration', price: 'R30' },
          { name: 'Letter of Good Standing', price: 'R50' },
          { name: 'Google My Business Setup', price: 'R100' }
        ]
      },
      { 
        title: '📧 Digital Services', 
        items: [
          { name: 'Home Affairs Status Check', price: 'R20' },
          { name: "DLTC Learner's Licence Booking", price: 'R30' },
          { name: 'WhatsApp Business Setup', price: 'R60' },
          { name: 'Social Media Account Setup', price: 'R50' },
          { name: 'Email Setup / Assistance', price: 'R40' }
        ]
      }
    ]
  },
  tech: {
    icon: '💻',
    title: 'Tech Hub',
    grad: 'linear-gradient(135deg, #2C3E50, #4A6785)',
    desc: "From slow laptops to fresh Windows installs — everyday tech problems solved quickly and affordably.",
    tagStyle: { bg: '#F0F3F6', color: '#2C3E50' },
    tagStyleDark: { bg: '#1E2A38', color: '#B8CCE0' },
    previews: ['Windows Install', 'Virus Removal', 'PC Optimization'],
    sections: [
      { 
        title: '⚙️ Software & Systems', 
        items: [
          { name: 'Minor Software Install', price: 'R30' },
          { name: 'Windows / Office Install (Unactivated)', price: 'R80' },
          { name: 'Windows / Office Install + Activation', price: 'R120' },
          { name: 'Windows Activation Only', price: 'R60' },
          { name: 'App & Office Updates', price: 'R30' },
          { name: 'Full Windows OS Update', price: 'R50' },
          { name: 'Driver Installation', price: 'R40' },
          { name: 'Microsoft 365 Setup', price: 'R80' }
        ]
      },
      { 
        title: '🔌 Hardware & Setup', 
        items: [
          { name: 'PC Setup & Hardware', price: 'R100' },
          { name: 'Printer Setup', price: 'R60' }
        ]
      },
      { 
        title: '🛠️ Repairs & Optimization', 
        items: [
          { name: 'Troubleshooting', price: 'From R50' },
          { name: 'Virus / Malware Removal', price: 'R100' },
          { name: 'PC Cleanup / Optimization', price: 'R80' }
        ]
      }
    ]
  }
}
