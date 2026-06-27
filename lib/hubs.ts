import { HUB_COLORS, HUB_NAMES, type HubKey } from '@/lib/brand'
import { PRICING } from '@/lib/data'
import type { Hub } from '@/lib/types'

export type HubId = HubKey

export const HUBS: Record<HubId, Hub> = {

  // ───────────────────────── PRINT ─────────────────────────
  print: {
    iconName: 'Printer',
    iconColor: HUB_COLORS.print.light,
    title: HUB_NAMES.print,
    grad: HUB_COLORS.print.gradient,
    desc: 'Fast, affordable printing, copying and photo services.',
    previews: ['Printing', 'Copying', 'Photos'],
    tagStyle: { bg: HUB_COLORS.print.tagBg, color: HUB_COLORS.print.tagText },
    tagStyleDark: { bg: HUB_COLORS.print.tagBgDark, color: HUB_COLORS.print.tagTextDark },

    sections: [
      {
        title: 'Printing',
        items: [
          { name: 'B&W Print', price: PRICING.print['B&W Print'], requirements: ['Send file or bring USB'] },
          { name: 'Colour Print', price: PRICING.print['Colour Print'], requirements: ['Send file or bring USB'] }
        ]
      },
      {
        title: 'Copying',
        items: [
          { name: 'B&W Copy', price: PRICING.print['B&W Copy'], requirements: ['Bring original document'] },
          { name: 'Colour Copy', price: PRICING.print['Colour Copy'], requirements: ['Bring original document'] }
        ]
      },
      {
        title: 'Photo Printing',
        items: [
          { name: 'Glossy Photo (4x6)', price: PRICING.print['Glossy Photo (4x6)'], requirements: ['Send high-quality image'] },
          { name: 'Glossy Photo (A4)', price: PRICING.print['Glossy Photo (A4)'], requirements: ['Send high-quality image'] }
        ]
      }
    ]
  },

  // ───────────────────────── DOC ─────────────────────────
  doc: {
    iconName: 'FileText',
    iconColor: HUB_COLORS.doc.light,
    title: HUB_NAMES.doc,
    grad: HUB_COLORS.doc.gradient,
    desc: 'Typing, CVs, scanning and document services.',
    previews: ['CVs', 'Typing', 'Laminating'],
    tagStyle: { bg: HUB_COLORS.doc.tagBg, color: HUB_COLORS.doc.tagText },
    tagStyleDark: { bg: HUB_COLORS.doc.tagBgDark, color: HUB_COLORS.doc.tagTextDark },

    sections: [
      {
        title: 'Typing & Printing',
        items: [
          { name: 'Typing + Print (B&W)', price: PRICING.doc['Typing + Print (B&W)'], requirements: ['Handwritten notes'] },
          { name: 'Typing + Print (Colour)', price: PRICING.doc['Typing + Print (Colour)'], requirements: ['Handwritten notes'] }
        ]
      },
      {
        title: 'CV Services',
        items: [
          { name: 'CV from Scratch', price: PRICING.doc['CV from Scratch'], requirements: ['Personal details'] },
          { name: 'CV Upgrade/Fix', price: PRICING.doc['CV Upgrade/Fix'], requirements: ['Existing CV'] },
          { name: 'Cover Letter', price: PRICING.doc['Cover Letter'], requirements: ['Job details'] }
        ]
      },
      {
        title: 'Documents',
        items: [
          { name: 'Affidavit / Letter', price: PRICING.doc['Affidavit / Letter'], requirements: ['Details of content'] }
        ]
      },
      {
        title: 'Scanning',
        items: [
          { name: 'Scanning', price: PRICING.doc['Scanning'], requirements: ['Physical documents'] }
        ]
      },
      {
        title: 'Laminating',
        items: [
          { name: 'A5 Laminating', price: PRICING.doc['Laminating (A5)'], requirements: ['Document'] },
          { name: 'A4 Laminating', price: PRICING.doc['Laminating (A4)'], requirements: ['Document'] },
          { name: 'A3 Laminating', price: PRICING.doc['Laminating (A3)'], requirements: ['Document'] }
        ]
      }
    ]
  },

  // ───────────────────────── DESIGN ─────────────────────────
  design: {
    iconName: 'PaintBrush',
    iconColor: HUB_COLORS.design.light,
    title: HUB_NAMES.design,
    grad: HUB_COLORS.design.gradient,
    desc: 'Logos, flyers, business cards and marketing design.',
    previews: ['Logos', 'Flyers', 'Cards'],
    tagStyle: { bg: HUB_COLORS.design.tagBg, color: HUB_COLORS.design.tagText },
    tagStyleDark: { bg: HUB_COLORS.design.tagBgDark, color: HUB_COLORS.design.tagTextDark },

    sections: [
      {
        title: 'Logos',
        items: [
          { name: 'Logo — Basic', price: PRICING.design['Logo — Basic'], requirements: ['Business name'] },
          { name: 'Logo — Standard', price: PRICING.design['Logo — Standard'], requirements: ['Business details'] },
          { name: 'Logo — Premium', price: PRICING.design['Logo — Premium'], requirements: ['Brand direction'] }
        ]
      },
      {
        title: 'Business Cards',
        items: [
          { name: 'Single Side', price: PRICING.design['Business Card (Single Side)'], requirements: ['Details'] },
          { name: 'Double Side', price: PRICING.design['Business Card (Double Side)'], requirements: ['Full info'] }
        ]
      },
      {
        title: 'Flyers / Posters',
        items: [
          { name: 'Simple', price: PRICING.design['Flyer / Poster — Simple'], requirements: ['Text'] },
          { name: 'Custom', price: PRICING.design['Flyer / Poster — Custom'], requirements: ['Content + images'] },
          { name: 'Complex', price: PRICING.design['Flyer / Poster — Complex'], requirements: ['Full brief'] }
        ]
      },
      {
        title: 'Social Media',
        items: [
          { name: 'Post', price: PRICING.design['Social Media Post'], requirements: ['Content'] },
          { name: 'Post + Story', price: PRICING.design['Post + Story'], requirements: ['Content'] }
        ]
      },
      {
        title: 'Invitations',
        items: [
          { name: 'Static Invitation', price: PRICING.design['Static Invitation'], requirements: ['Event details'] },
          { name: 'Video Invitation', price: PRICING.design['Video Invitation'], requirements: ['Event details'] }
        ]
      }
    ]
  },

  // ───────────────────────── ESERVICE (FULL) ─────────────────────────
  eservice: {
    iconName: 'Globe',
    iconColor: HUB_COLORS.eservice.light,
    title: HUB_NAMES.eservice,
    grad: HUB_COLORS.eservice.gradient,
    desc: 'Government services, applications, registrations and online submissions.',
    previews: ['SASSA', 'SARS', 'NSFAS', 'UIF', 'CSD'],
    tagStyle: { bg: HUB_COLORS.eservice.tagBg, color: HUB_COLORS.eservice.tagText },
    tagStyleDark: { bg: HUB_COLORS.eservice.tagBgDark, color: HUB_COLORS.eservice.tagTextDark },

    sections: [
      {
        title: 'SASSA',
        items: [
          { name: 'Status Check', price: PRICING.eservice['SASSA Status Check'], requirements: ['ID'] },
          { name: 'Payment / Balance Check', price: PRICING.eservice['SASSA Payment / Balance Check'], requirements: ['ID'] },
          { name: 'Update Details', price: PRICING.eservice['SASSA Update Details'], requirements: ['ID + proof'] },
          { name: 'SRD Application', price: PRICING.eservice['SASSA SRD Application'], requirements: ['ID'] },
          { name: 'Reapplication', price: PRICING.eservice['SASSA Reapplication'], requirements: ['ID'] },
          { name: 'Banking Update', price: PRICING.eservice['SASSA Banking Update'], requirements: ['ID + bank details'] },
          { name: 'Appeal', price: PRICING.eservice['SASSA Appeal'], requirements: ['ID + rejection'] },
          { name: 'Grant Application', price: PRICING.eservice['SASSA Grant Application'], requirements: ['ID + documents'] }
        ]
      },
      {
        title: 'SARS',
        items: [
          { name: 'Enquiry / Statement / Updates', price: PRICING.eservice['SARS Enquiry / Statement / Updates'], requirements: ['ID'] },
          { name: 'New Taxpayer / eFiling', price: PRICING.eservice['SARS New Taxpayer / eFiling'], requirements: ['ID'] },
          { name: 'Tax Pin / Penalty', price: PRICING.eservice['SARS Tax Pin / Penalty'], requirements: ['ID'] },
          { name: 'Tax Clearance', price: PRICING.eservice['SARS Tax Clearance'], requirements: ['ID'] },
          { name: 'Pin Submission', price: PRICING.eservice['SARS Pin Submission'], requirements: ['ID'] },
          { name: 'Tax Return / VAT / PAYE', price: PRICING.eservice['SARS Tax Return / VAT / PAYE'], requirements: ['Income docs'] }
        ]
      },
      {
        title: 'PSIRA',
        items: [
          { name: 'Status Check', price: PRICING.eservice['PSIRA Status Check'], requirements: ['ID'] },
          { name: 'Update / Certificate', price: PRICING.eservice['PSIRA Update / Certificate'], requirements: ['ID'] },
          { name: 'Lost Certificate', price: PRICING.eservice['PSIRA Lost Certificate'], requirements: ['ID + affidavit'] },
          { name: 'Renewal / Registration', price: PRICING.eservice['PSIRA Renewal / New Registration'], requirements: ['ID'] },
          { name: 'ID Application', price: PRICING.eservice['PSIRA ID Application'], requirements: ['ID'] }
        ]
      },
      {
        title: 'NSFAS / Education',
        items: [
          { name: 'Status Check', price: PRICING.eservice['NSFAS Status Check'], requirements: ['ID'] },
          { name: 'Banking Update', price: PRICING.eservice['NSFAS Banking Update'], requirements: ['ID'] },
          { name: 'Learnership Application', price: PRICING.eservice['Learnership Application'], requirements: ['ID'] },
          { name: 'Job / DPSA Application', price: PRICING.eservice['Job / DPSA Application'], requirements: ['CV'] },
          { name: 'Bursary Application', price: PRICING.eservice['Bursary Application'], requirements: ['Results'] },
          { name: 'NSFAS Appeal', price: PRICING.eservice['NSFAS Appeal'], requirements: ['ID'] },
          { name: 'NSFAS Application', price: PRICING.eservice['NSFAS Application'], requirements: ['ID'] },
          { name: 'University Application', price: PRICING.eservice['University Application'], requirements: ['Results'] }
        ]
      },
      {
        title: 'Business Services',
        items: [
          { name: 'Good Standing Letter', price: PRICING.eservice['Good Standing Letter'], requirements: ['Company docs'] },
          { name: 'Google Business Setup', price: PRICING.eservice['Google Business Setup'], requirements: ['Business info'] },
          { name: 'UIF Monthly Declaration', price: PRICING.eservice['UIF Monthly Declaration'], requirements: ['Employee data'] },
          { name: 'UIF Registration', price: PRICING.eservice['UIF Registration'], requirements: ['Company info'] },
          { name: 'UIF Claims', price: PRICING.eservice['UIF Claims'], requirements: ['UI19'] },
          { name: 'CSD Update', price: PRICING.eservice['CSD Update'], requirements: ['CSD info'] },
          { name: 'CSD Registration', price: PRICING.eservice['CSD Registration'], requirements: ['CIPC docs'] }
        ]
      },
      {
        title: 'Digital Services',
        items: [
          { name: 'Email Setup / Send / Receive', price: PRICING.eservice['Email Setup / Send / Receive'], requirements: ['Phone'] },
          { name: 'Social Media Setup', price: PRICING.eservice['Social Media Setup'], requirements: ['Business info'] },
          { name: "Learner's Licence Booking", price: PRICING.eservice["Learner's Licence Booking"], requirements: ['ID'] },
          { name: 'WhatsApp Business Setup', price: PRICING.eservice['WhatsApp Business Setup'], requirements: ['Business info'] }
        ]
      }
    ]
  },

  // ───────────────────────── TECH ─────────────────────────
  tech: {
    iconName: 'Desktop',
    iconColor: HUB_COLORS.tech.light,
    title: HUB_NAMES.tech,
    grad: HUB_COLORS.tech.gradient,
    desc: 'Tech support, installations, repairs and PC services.',
    previews: ['Windows', 'Fixes', 'Setup'],
    tagStyle: { bg: HUB_COLORS.tech.tagBg, color: HUB_COLORS.tech.tagText },
    tagStyleDark: { bg: HUB_COLORS.tech.tagBgDark, color: HUB_COLORS.tech.tagTextDark },

    sections: [
      {
        title: 'Software',
        items: [
          { name: 'Software Install', price: PRICING.tech['Software Install'], requirements: ['Device'] },
          { name: 'App / Office Updates', price: PRICING.tech['App / Office Updates'], requirements: ['Device'] },
          { name: 'Driver Installation', price: PRICING.tech['Driver Installation'], requirements: ['Device'] }
        ]
      },
      {
        title: 'Hardware',
        items: [
          { name: 'Printer Setup', price: PRICING.tech['Printer Setup'], requirements: ['Printer + PC'] },
          { name: 'PC Setup', price: PRICING.tech['PC Setup'], requirements: ['Device'] }
        ]
      },
      {
        title: 'Support',
        items: [
          { name: 'Troubleshooting', price: PRICING.tech['Troubleshooting'], requirements: ['Device'] },
          { name: 'PC Cleanup', price: PRICING.tech['PC Cleanup'], requirements: ['Device'] },
          { name: 'Virus / Malware Removal', price: PRICING.tech['Virus / Malware Removal'], requirements: ['Device'] },
          { name: 'OS Update', price: PRICING.tech['OS Update'], requirements: ['Device'] }
        ]
      },
      {
        title: 'Windows & Office',
        items: [
          { name: 'Windows Install (No Activation)', price: PRICING.tech['Windows Install (No Activation)'], requirements: ['Device'] },
          { name: 'Windows Install + Activation', price: PRICING.tech['Windows Install + Activation'], requirements: ['Device'] },
          { name: 'Activation Only', price: PRICING.tech['Activation Only'], requirements: ['Device'] },
          { name: 'Microsoft 365 Setup', price: PRICING.tech['Microsoft 365 Setup'], requirements: ['Device'] }
        ]
      }
    ]
  }
}
