import { HUB_COLORS, HUB_NAMES } from '@/lib/brand'
import type { Hub } from '../types'

export const docHub: Hub = {
  iconName: 'FileText', iconColor: HUB_COLORS.doc.light, title: HUB_NAMES.doc, grad: HUB_COLORS.doc.gradient,
  desc: `From typing and printing to professional CVs and laminating — we handle your paperwork.`,
  turnaround: "Same-day, no exceptions.",
  tagStyle: { bg: HUB_COLORS.doc.tagBg, color: HUB_COLORS.doc.tagText },
  tagStyleDark: { bg: HUB_COLORS.doc.tagBgDark, color: HUB_COLORS.doc.tagTextDark },
  previews: ['CV Services', 'Typing & Documents', 'Laminating'],
  sections: [
    { title: 'Typing + Printing', desc: `Handwritten notes or a rough draft, typed up neatly and printed out — B&W or colour.`, items: [
      { name: 'Black & White', price: 'R15/page', description: `You bring your handwritten notes or rough draft, and we type it up neatly and print it out in black and white. Ideal for letters, applications, forms, and school assignments.`, requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'] },
      { name: 'Colour', price: 'R18/page', description: `Same as our typing service but printed in full colour — useful when your document includes colour tables, headings, charts, or needs to make a strong visual impression.`, requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'] },
    ]},
    { title: 'CV Services', desc: `From a first CV built from nothing to a full professional upgrade, plus cover letters that get noticed.`, items: [
      {
        name: 'CV from Scratch', price: 'R30',
        description: `Never had a CV before? We build one for you from the ground up — personal details, education, skills, and work experience — all formatted neatly and ready to hand in or email to employers.`,
        requirements: ['Bring your ID document', 'Provide your personal details, education history, and work experience', 'Bring a recent photo if you want one included', 'Share contact details (phone number, email if available)'],
        tips: [
          "Have your ID number, school/qualification names, and dates ready beforehand — it speeds things up a lot.",
          "List your work history in order, most recent first, even if it was informal or short-term work.",
          "Mention 2–3 real personal strengths (e.g. punctual, hardworking, good with people) — plain language works better than buzzwords.",
        ],
      },
      {
        name: 'CV Upgrade/Fix', price: 'R40',
        description: `Already have a CV but it's outdated, poorly formatted, or missing key information? We clean it up, restructure it, and add your latest experience so it looks professional and up to date.`,
        requirements: ['Bring your existing CV (digital file or printed copy)', 'Let us know what changes or updates you need', 'Provide any new information to be added'],
        tips: [
          "Bring your current CV as a digital file if you can — a clear photo works too, but a file updates faster.",
          "Tell us what's outdated first (old job, old contact number) so we fix what matters most, first.",
          "If you're applying somewhere specific, mention it — we can tailor the layout slightly to suit that job.",
        ],
      },
      {
        name: 'Cover Letter', price: 'R30',
        description: `A strong cover letter introduces you to a potential employer before they even read your CV. We write a personalised one based on the job you're applying for, highlighting your key strengths.`,
        requirements: ['Bring details of the job you are applying for', 'Bring your CV for reference', 'Mention key skills or experience you want highlighted'],
        tips: [
          "Tell us the exact job title and company name — a personalised letter gets noticed far more than a generic one.",
          "Mention one specific reason you want that job, not just 'I need work' — even a short reason helps.",
          "Keep it to one page — we'll help trim it down to the strongest points if it runs long.",
        ],
      },
    ]},
    { title: 'Other Documents', desc: `Affidavits and formal letters, typed and printed correctly for banks, schools, landlords, or the police station.`, items: [
      { name: 'Affidavit / Letter', price: 'R15/page', description: `Need a formal letter or affidavit typed and printed? We handle the wording, formatting, and printing — whether it's for a bank, school, landlord, or the police station. Some affidavits need to be sworn in front of a Commissioner of Oaths after printing.`, requirements: ['Bring your ID document', 'Provide the details/facts that need to be included', 'Some affidavits may require a visit to the police station or Commissioner of Oaths to be sworn'] },
    ]},
    { title: 'Scanning', desc: `Turn physical paperwork into a digital file you can save, email, or upload anywhere.`, items: [
      { name: 'Scan to Digital', price: 'R5/page', description: `We scan your physical documents and convert them into a digital file — PDF or image — that you can save, email, or upload. Perfect for preserving important paperwork or sending documents without going to the post office.`, requirements: ['Bring the original physical document(s) to be scanned', 'Let us know the file format you need (PDF, JPG, etc.)', 'Bring a USB or have WhatsApp/email ready to receive the file'] },
    ]},
    { title: 'Laminating', desc: `Protect certificates, cards, and notices with a clear laminate finish — A5 up to A3.`, items: [
      { name: 'A5', price: 'R15', description: `Protect your A5-sized documents, cards, or certificates with a clear laminate cover — keeping them safe from water, dirt, and damage. Great for ID-sized documents and small certificates.`, requirements: ['Bring the document or card to be laminated', 'Make sure the item is clean and flat'] },
      { name: 'A4', price: 'R20', description: `Standard A4 laminating for certificates, notices, timetables, or any document you want to protect and keep looking professional long-term.`, requirements: ['Bring the document to be laminated', 'Make sure the document is clean and flat'] },
      { name: 'A3', price: 'R30', description: `A3 laminating for larger posters, notices, or display materials. Perfect for menus, school timetables, or anything you need to stick up and keep looking clean.`, requirements: ['Bring the document or poster to be laminated', 'Make sure the item is clean and flat'] },
    ]},
  ],
}
