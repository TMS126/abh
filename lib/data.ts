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

export type HubId = 'print' | 'doc' | 'design' | 'eservice' | 'tech'

export interface ServiceItem {
  name: string
  price: string
  description: string
  requirements: string[]
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
    grad: 'linear-gradient(135deg, #1E6FA8 0%, #0F3F66 100%)',
    desc: 'Fast, clear and affordable printing for every need — from a single page to bulk jobs.',
    tagStyle: { bg: '#EBF5FB', color: '#0F3F66' },
    tagStyleDark: { bg: '#1E3A52', color: '#A9D6F2' },
    previews: ['B&W Printing', 'Colour Printing', 'Photo Prints'],
    sections: [
      {
        title: 'Printing',
        items: [
          { name: 'Black & White', price: 'R5/page', description: 'Standard black-and-white printing straight from your file — for assignments, forms, and everyday documents.', requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'] },
          { name: 'Colour', price: 'R8/page', description: 'Full-colour printing for documents, designs, and anything that needs to stand out.', requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'] },
        ],
      },
      {
        title: 'Copying',
        items: [
          { name: 'Black & White', price: 'R3/page', description: 'Photocopying of a physical document you already have, in black and white.', requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'] },
          { name: 'Colour', price: 'R5/page', description: 'Photocopying of a physical document you already have, in full colour.', requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'] },
        ],
      },
      {
        title: 'Photo Printing',
        items: [
          { name: '4x6 Glossy', price: 'R20', description: 'A classic glossy photo print, ideal for albums, frames, or keepsakes.', requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'] },
          { name: 'A4 Glossy', price: 'R40', description: 'A large glossy photo print, great for portraits, posters, or display pieces.', requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'] },
        ],
      },
    ],
  },
  doc: {
    iconName: 'FileText',
    iconColor: '#CDEB9F',
    title: 'Docu Hub',
    grad: 'linear-gradient(135deg, #3E6B0E 0%, #6FBF1A 100%)',
    desc: 'From typing and printing to professional CVs and laminating — we handle your paperwork.',
    tagStyle: { bg: '#EAFAF1', color: '#3E6B0E' },
    tagStyleDark: { bg: '#1A3010', color: '#CDEB9F' },
    previews: ['CV Services', 'Typing & Documents', 'Laminating'],
    sections: [
      {
        title: 'Typing + Printing',
        items: [
          { name: 'Black & White', price: 'R15/page', description: "We type up your handwritten notes or rough draft and print the final copy in black and white.", requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'] },
          { name: 'Colour', price: 'R18/page', description: "We type up your handwritten notes or rough draft and print the final copy in full colour.", requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'] },
        ],
      },
      {
        title: 'CV Services',
        items: [
          { name: 'CV from Scratch', price: 'R30', description: 'A brand-new, professionally formatted CV built from your personal and work history — perfect if you don\u2019t have one yet.', requirements: ['Bring your ID document', 'Provide your personal details, education history, and work experience', 'Bring a recent photo if you want one included', 'Share contact details (phone number, email if available)'] },
          { name: 'CV Upgrade/Fix', price: 'R40', description: 'We take your existing CV and improve its layout, content, and formatting.', requirements: ['Bring your existing CV (digital file or printed copy)', 'Let us know what changes or updates you need', 'Provide any new information to be added'] },
          { name: 'Cover Letter', price: 'R30', description: 'A tailored cover letter written to match a specific job you\u2019re applying for.', requirements: ['Bring details of the job you are applying for', 'Bring your CV for reference', 'Mention key skills or experience you want highlighted'] },
        ],
      },
      {
        title: 'Other Documents',
        items: [
          { name: 'Affidavit / Letter', price: 'R20', description: 'A sworn written statement or formal letter, typed up and prepared for signing — some affidavits still require a Commissioner of Oaths.', requirements: ['Bring your ID document', 'Provide the details/facts that need to be included', 'Some affidavits may require a visit to the police station or Commissioner of Oaths to be sworn'] },
        ],
      },
      {
        title: 'Scanning',
        items: [
          { name: 'Scan to Digital', price: 'R5/page', description: 'We convert your physical paper documents into a digital file you can keep, email, or print again later.', requirements: ['Bring the original physical document(s) to be scanned', 'Let us know the file format you need (PDF, JPG, etc.)', 'Bring a USB or have WhatsApp/email ready to receive the file'] },
        ],
      },
      {
        title: 'Laminating',
        items: [
          { name: 'A5', price: 'R12', description: 'Protective plastic lamination for an A5-sized document or card, sealing it against wear, water, and creasing.', requirements: ['Bring the document or card to be laminated', 'Make sure the item is clean and flat'] },
          { name: 'A4', price: 'R15', description: 'Protective plastic lamination for a standard A4 document, sealing it against wear, water, and creasing.', requirements: ['Bring the document to be laminated', 'Make sure the document is clean and flat'] },
          { name: 'A3', price: 'R30', description: 'Protective plastic lamination for a larger A3 document or poster, sealing it against wear, water, and creasing.', requirements: ['Bring the document or poster to be laminated', 'Make sure the item is clean and flat'] },
        ],
      },
    ],
  },
  design: {
    iconName: 'PaintBrush',
    iconColor: '#F9D1B0',
    title: 'Design Hub',
    grad: 'linear-gradient(135deg, #B86F34 0%, #F4A261 100%)',
    desc: 'Professional designs for your brand, events and marketing — eye-catching and print-ready.',
    tagStyle: { bg: '#FEF3C7', color: '#B86F34' },
    tagStyleDark: { bg: '#3A2010', color: '#F9D1B0' },
    previews: ['Logo Design', 'Flyers & Posters', 'Invitations'],
    sections: [
      {
        title: 'Logos',
        items: [
          { name: 'Basic Logo', price: 'R300', description: 'A simple, clean logo design — one concept, ideal for a new business on a budget.', requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style (modern, classic, playful, etc.)', 'Mention any reference logos you like for inspiration'] },
          { name: 'Standard Logo', price: 'R500', description: 'A more developed logo design with multiple initial concepts to choose from before final delivery.', requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need multiple initial concepts'] },
          { name: 'Premium Logo', price: 'R800', description: 'A full branding-level logo package, including multiple concepts and a complete style guide with all the file formats you need.', requirements: ['Provide your business name and tagline (if any)', 'Share your brand vision, colours, and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need a full brand style guide and multiple file formats'] },
        ],
      },
      {
        title: 'Business Cards',
        items: [
          { name: 'Single Side', price: 'R120', description: 'A professionally designed business card, printed on one side.', requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Specify the quantity to be printed'] },
          { name: 'Double Side', price: 'R180', description: 'A professionally designed business card, printed front and back so you can include extra information.', requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Let us know what content goes on the back (e.g. services, social media, map)', 'Specify the quantity to be printed'] },
        ],
      },
      {
        title: 'Flyers & Posters',
        items: [
          { name: 'Simple', price: 'R150', description: 'A straightforward single-layout flyer or poster design for promotions, events, or announcements.', requirements: ['Provide the text/content to be included (event, promo, contact details)', 'Share any photos or logos to be used', 'Mention your preferred colours or style'] },
          { name: 'Custom', price: 'R250', description: 'A more tailored flyer or poster built around your specific size, layout, and intended use (print or digital).', requirements: ['Provide the text/content to be included', 'Share any photos or logos to be used', 'Mention your preferred colours or style direction', 'Specify size and intended use (print or digital)'] },
          { name: 'Complex', price: 'R350', description: 'A detailed, multi-element flyer or poster design with a more involved layout, built from your own reference designs.', requirements: ['Provide the text/content to be included', 'Share photos, logos, and any reference designs', 'Mention your preferred colours or style direction', 'Specify size, layout complexity, and intended use'] },
        ],
      },
      {
        title: 'Social Media',
        items: [
          { name: 'Post', price: 'R80', description: 'A single designed graphic ready to post on a platform like Facebook, Instagram, or WhatsApp Status.', requirements: ['Provide the text/message for the post', 'Share any photos or logos to be used', 'Mention the platform (Facebook, Instagram, WhatsApp Status, etc.)'] },
          { name: 'Post + Story', price: 'R120', description: 'A matching pair of designs — a feed post plus a story version — for consistent branding across formats.', requirements: ['Provide the text/message for the post and story', 'Share any photos or logos to be used', 'Mention the platform(s) the content is for'] },
        ],
      },
      {
        title: 'Invitations',
        items: [
          { name: 'Image/Static', price: 'R150', description: 'A designed image invitation for your event, ready to share digitally or print.', requirements: ['Provide event details (date, time, venue, host)', 'Share any photos or theme preferences', 'Mention your preferred colours or style'] },
          { name: 'Video', price: 'R300', description: 'An animated video invitation for your event, combining your photos, theme, and details into a short clip.', requirements: ['Provide event details (date, time, venue, host)', 'Share any photos, video clips, or theme preferences', 'Mention your preferred colours, music, or style'] },
        ],
      },
      {
        title: 'Revisions',
        items: [
          { name: 'While Busy', price: 'R50', description: 'A round of changes requested while your design project is still in progress.', requirements: ['Clearly describe the changes you would like made', 'This applies only while the project is still in progress'] },
          { name: 'After Completion', price: 'R70', description: 'A round of changes requested after your design has already been delivered and finalized.', requirements: ['Clearly describe the changes you would like made', 'This applies once the project has already been delivered/finalized'] },
        ],
      },
    ],
  },
  eservice: {
    iconName: 'Globe',
    iconColor: '#A9D6F2',
    title: 'E-Service Hub',
    grad: 'linear-gradient(135deg, #0F3F66 0%, #15537D 100%)',
    desc: "Government platforms made easy. We handle registrations, applications and updates so you don't have to stress.",
    tagStyle: { bg: '#EBF5FB', color: '#0F3F66' },
    tagStyleDark: { bg: '#1E3A52', color: '#A9D6F2' },
    previews: ['SASSA', 'SARS eFiling', 'UIF & CSD'],
    sections: [
      {
        title: 'SASSA',
        items: [
          { name: 'Status Check', price: 'R20', description: 'We check the current status of an existing SASSA grant or SRD application for you.', requirements: ['Bring your ID document', 'Bring your SASSA reference number or application number if you have one'] },
          { name: 'Payment/Balance Check', price: 'R15', description: 'We check your SASSA grant balance or confirm your next payment date.', requirements: ['Bring your ID document', 'Bring your SASSA card or grant details'] },
          { name: 'Update Details', price: 'R30', description: "We update your personal information — such as address or phone number — on your SASSA profile.", requirements: ['Bring your ID document', 'Bring proof of the new details (e.g. new address, new phone number)', 'Bring your SASSA reference number'] },
          { name: 'Reapplication', price: 'R40', description: 'We help you reapply for a SASSA grant after a previous application lapsed, was suspended, or was rejected.', requirements: ['Bring your ID document', 'Bring proof of previous application or rejection letter if available', 'Bring proof of income/affidavit of unemployment if required'] },
          { name: 'SRD Application', price: 'R40', description: 'We submit an application for the SASSA Social Relief of Distress (SRD) grant on your behalf.', requirements: ['Bring your ID document', 'Have your active cellphone number ready (for OTP/SMS)', 'Bring proof of bank account details if applying for bank payment'] },
          { name: 'Appeal', price: 'R40', description: 'We submit a formal appeal against a declined or suspended SASSA grant decision.', requirements: ['Bring your ID document', 'Bring the rejection/decline letter or SMS notification', 'Bring any supporting documents for your appeal'] },
          { name: 'Banking Update', price: 'R40', description: 'We update or correct the bank account your SASSA payments are sent to.', requirements: ['Bring your ID document', 'Bring your bank account details or bank confirmation letter', 'Bring your SASSA reference number'] },
          { name: 'Grant Application', price: 'R80', description: "We submit an application for an ongoing SASSA grant, such as a child support, disability, or older person's grant.", requirements: ['Bring your ID document', "Bring supporting documents (e.g. child's birth certificate, disability assessment, proof of income)", 'Have your active cellphone number ready for OTP/SMS confirmations'] },
        ],
      },
      {
        title: 'SARS',
        items: [
          { name: 'Enquiry / Statement / Updates', price: 'R50', description: 'General SARS enquiries — requesting a statement of account, or updating basic taxpayer details.', requirements: ['Bring your ID document', 'Bring your tax reference number if you have one'] },
          { name: 'New Taxpayer / eFiling', price: 'R70', description: 'We register you as a new SARS taxpayer and set up your eFiling profile.', requirements: ['Bring your ID document', 'Bring proof of address (utility bill, lease, or affidavit)', 'Have your active cellphone number and email ready'] },
          { name: 'Tax Pin / Penalty', price: 'R100', description: 'We retrieve your SARS tax compliance pin or help resolve an outstanding penalty.', requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring any SARS letters/notices relating to the penalty'] },
          { name: 'Tax Clearance', price: 'R120', description: 'We apply for a SARS Tax Clearance Certificate (Tax Compliance Status), often needed for tenders, loan applications, or emigration.', requirements: ['Bring your ID document', 'Bring your tax reference number', 'Make sure your tax returns are up to date (we can assist if not)'] },
          { name: 'Pin Submission', price: 'R120', description: 'We submit a SARS compliance pin in response to a specific request or letter from SARS.', requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring the relevant SARS request/letter'] },
          { name: 'Tax Return / VAT / PAYE', price: 'R200', description: 'We complete and submit your annual tax return, or your business\u2019s VAT/PAYE filings.', requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring income/expense documents (payslips, invoices, IRP5, bank statements as relevant)'] },
        ],
      },
      {
        title: 'PSIRA',
        items: [
          { name: 'PSIRA Status Check', price: 'R30', description: 'We check whether your PSIRA security registration is active and in good standing with the Private Security Industry Regulatory Authority.', requirements: ['Bring your ID document', 'Bring your PSIRA registration number'] },
          { name: 'Update / Certificate', price: 'R40', description: 'We update your PSIRA registration details or request a copy of your registration certificate.', requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Bring proof of the new details to be updated'] },
          { name: 'Lost Certificate', price: 'R50', description: 'We apply for a replacement PSIRA certificate if your original has been lost.', requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Affidavit confirming the certificate is lost may be required'] },
          { name: 'Renewal / New Registration', price: 'R80', description: 'We renew an existing PSIRA registration, or register you for the first time as a security service provider.', requirements: ['Bring your ID document', 'Bring proof of relevant training/qualification (for new registration)', 'Bring your PSIRA registration number (for renewal)', 'Have your active cellphone number ready'] },
          { name: 'ID Application', price: 'R100', description: 'We apply for your official PSIRA identification card.', requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Bring a recent passport-style photo if required'] },
        ],
      },
      {
        title: 'Online Applications',
        items: [
          { name: 'NSFAS Status Check', price: 'R20', description: 'We check the current status of your NSFAS student funding application.', requirements: ['Bring your ID document', 'Bring your NSFAS reference number or login details if you have them'] },
          { name: 'NSFAS Banking Update', price: 'R20', description: 'We update the bank account NSFAS uses to pay your student allowance.', requirements: ['Bring your ID document', 'Bring your bank account details or confirmation letter', 'Bring your NSFAS reference number'] },
          { name: 'Learnership Application', price: 'R30', description: 'We submit an application for an available learnership programme on your behalf.', requirements: ['Bring your ID document', 'Bring your highest qualification/certificate', 'Bring your CV if available'] },
          { name: 'Job / DPSA Application', price: 'R40', description: 'We submit an application for an advertised job, including government (DPSA) positions.', requirements: ['Bring your ID document', 'Bring your CV and certified qualifications', 'Have details of the specific position/post number ready'] },
          { name: 'Bursary Application', price: 'R40', description: 'We submit a bursary application to help fund your studies.', requirements: ['Bring your ID document', 'Bring your academic results/qualifications', 'Bring proof of household income if required', 'Bring acceptance letter from institution if applicable'] },
          { name: 'NSFAS Appeal', price: 'R50', description: 'We submit a formal appeal against a declined NSFAS funding decision.', requirements: ['Bring your ID document', 'Bring the NSFAS rejection/decline notification', 'Bring supporting documents (e.g. proof of income, motivation letter)'] },
          { name: 'NSFAS Application', price: 'R80', description: 'We submit a new NSFAS application for financial aid to help fund your studies.', requirements: ['Bring your ID document', 'Bring proof of household income or relevant supporting documents', 'Bring your academic results', 'Have your active cellphone number and email ready'] },
          { name: 'University Application', price: 'R100', description: 'We submit your application for admission to a university or college.', requirements: ['Bring your ID document', 'Bring certified academic results/matric certificate', 'Have application fee details ready if applicable', 'Have your active cellphone number and email ready'] },
        ],
      },
      {
        title: 'Email Services',
        items: [
          { name: 'Setup / Send / Receive', price: 'R15', description: 'We set up a new email account for you, or help you send and receive an important email.', requirements: ['Bring your ID document', 'Have an active cellphone number ready for verification', 'If sending/receiving, bring the document or details to be emailed'] },
        ],
      },
      {
        title: 'Business Services',
        items: [
          { name: 'Good Standing Letter', price: 'R60', description: 'We request a letter confirming your business or tax affairs are currently in good standing.', requirements: ['Bring your ID document', 'Bring your company registration number', 'Bring CIPC login details if available'] },
          { name: 'Google Business Setup', price: 'R80', description: 'We set up your business on Google so it appears in local searches and on Google Maps.', requirements: ['Bring your business name and physical address', 'Bring contact details (phone, email, website if any)', 'Bring your business logo and a few photos if available'] },
          { name: 'UIF Monthly Declaration', price: 'R100', description: "We submit your business's monthly UIF declaration to the Department of Labour.", requirements: ['Bring your UIF reference number', 'Bring employee details and monthly earnings information', 'Bring your UIF login details if available'] },
          { name: 'CSD Update', price: 'R120', description: 'We update your existing details on the government\u2019s Central Supplier Database (CSD).', requirements: ['Bring your company registration number', 'Bring your CSD supplier number', 'Bring proof of the details to be updated'] },
          { name: 'UIF Registration', price: 'R100', description: 'We register you or your employees for UIF (Unemployment Insurance Fund).', requirements: ['Bring your ID document', 'Bring company registration documents (if registering a business)', 'Bring employee details if registering employees'] },
          { name: 'UIF Claims', price: 'R200', description: 'We submit a UIF claim for benefits after losing a job, going on maternity leave, or a similar qualifying event.', requirements: ['Bring your ID document', 'Bring your UIF reference number', 'Bring termination letter/UI19 form and bank account details'] },
          { name: 'CSD Registration', price: 'R300', description: 'We register your business on the Central Supplier Database (CSD) so it can supply or bid for government contracts and tenders.', requirements: ['Bring your company registration documents (CIPC)', 'Bring your tax clearance certificate', 'Bring bank confirmation letter', 'Bring BEE certificate/affidavit if applicable'] },
        ],
      },
      {
        title: 'Digital Setup',
        items: [
          { name: 'Social Media Setup', price: 'R60', description: 'We set up business profiles on social media platforms like Facebook and Instagram.', requirements: ['Bring your business name and logo', 'Bring contact details and a short business description', 'Specify which platforms you want set up (Facebook, Instagram, etc.)'] },
          { name: "Learner's Licence Booking", price: 'R60', description: 'We book your learner\u2019s driving licence test slot at your preferred testing centre.', requirements: ['Bring your ID document', 'Have your active cellphone number ready for booking confirmation', 'Know your preferred testing centre and date range'] },
          { name: 'WhatsApp Business Setup', price: 'R80', description: 'We set up a WhatsApp Business profile for your company, including catalog and business details.', requirements: ['Bring your business name and logo', 'Have the dedicated business phone number ready', 'Bring a short business description and catalog items/prices if available'] },
        ],
      },
    ],
  },
  tech: {
    iconName: 'Desktop',
    iconColor: '#B8CCE0',
    title: 'Tech Hub',
    grad: 'linear-gradient(135deg, #2C3E50 0%, #4A6785 100%)',
    desc: 'From slow laptops to fresh Windows installs — everyday tech problems solved quickly and affordably.',
    tagStyle: { bg: '#F0F3F6', color: '#2C3E50' },
    tagStyleDark: { bg: '#1E2A38', color: '#B8CCE0' },
    previews: ['Windows Install', 'Virus Removal', 'PC Setup'],
    sections: [
      {
        title: 'Software',
        items: [
          { name: 'Software Install', price: 'R80', description: 'We install a specific software programme onto your device.', requirements: ['Bring the device (laptop/PC)', 'Bring the installation file or a valid license/product key if required', 'Make sure the device is charged or bring a charger'] },
          { name: 'Driver Installation', price: 'R100', description: 'We install the correct drivers so your hardware — printer, graphics card, and more — works properly with your device.', requirements: ['Bring the device (laptop/PC)', 'Know the device/hardware model (e.g. printer model, graphics card)', 'Make sure the device is charged or bring a charger'] },
          { name: 'App / Office Updates', price: 'R80', description: 'We update your installed apps or Microsoft Office to their latest versions.', requirements: ['Bring the device (laptop/PC)', 'Make sure the device is connected to power or fully charged', 'Have your software login/license details ready if required'] },
        ],
      },
      {
        title: 'Hardware',
        items: [
          { name: 'Printer Setup', price: 'R100', description: 'We connect and configure a printer so it works properly with your device.', requirements: ['Bring the printer and its power/USB cables', 'Bring the device (laptop/PC) the printer will connect to', 'Bring ink/toner cartridges if not already installed'] },
          { name: 'PC Setup', price: 'R250', description: 'A full setup of a new PC or laptop, configured and ready for everyday use.', requirements: ['Bring the PC/laptop and all its cables', 'Bring any software license keys you want installed', 'Let us know what the device will mainly be used for'] },
        ],
      },
      {
        title: 'Support',
        items: [
          { name: 'Troubleshooting', price: 'R150/hr', description: 'We diagnose and fix a specific issue with your device, billed hourly with a one-hour minimum call-out.', requirements: ['Bring the device experiencing the issue', 'Describe the problem clearly (when it started, error messages, etc.)', 'Minimum 1-hour call-out fee applies', 'Make sure the device is charged or bring a charger'] },
          { name: 'PC Cleanup', price: 'R150', description: 'We clear out junk files, optimize storage, and speed up a slow-running device.', requirements: ['Bring the device (laptop/PC)', 'Make sure the device is charged or bring a charger', 'Back up any important files beforehand if possible'] },
          { name: 'Virus / Malware Removal', price: 'R200', description: 'We scan for and remove viruses or malware that are slowing down or compromising your device.', requirements: ['Bring the device (laptop/PC)', 'Describe any symptoms noticed (pop-ups, slowness, strange behaviour)', 'Back up important files beforehand if possible'] },
          { name: 'OS Update', price: 'R200', description: 'We update your device\u2019s operating system to its latest available version.', requirements: ['Bring the device (laptop/PC)', 'Make sure the device is connected to power', 'Back up important files beforehand if possible'] },
        ],
      },
      {
        title: 'Windows & Office',
        items: [
          { name: 'Windows Install (No Activation)', price: 'R300', description: 'A fresh installation of Windows on your device, without an activation license included.', requirements: ['Bring the device (laptop/PC)', 'Back up all important files beforehand — installation will erase the drive', 'Make sure the device is connected to power'] },
          { name: 'Windows Install + Activation', price: 'R350', description: 'A fresh installation of Windows, fully activated using your own valid license.', requirements: ['Bring the device (laptop/PC)', 'Bring a valid Windows product key/license', 'Back up all important files beforehand — installation will erase the drive', 'Make sure the device is connected to power'] },
          { name: 'Activation Only', price: 'R100', description: 'We activate your existing Windows or Microsoft 365 installation using a valid license key you provide.', requirements: ['Bring the device (laptop/PC)', 'Bring a valid Windows or Microsoft 365 product key/license'] },
          { name: 'Microsoft 365 Setup', price: 'R150', description: 'We install and set up Microsoft 365 (Word, Excel, Outlook, and more) on your device.', requirements: ['Bring the device (laptop/PC)', 'Bring your Microsoft 365 account login or product key', 'Make sure the device is connected to the internet'] },
        ],
      },
    ],
  },
}

// ─── PROJECTS (Portfolio) ─────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: "shuttle-flyer",
    hub: "design",
    title: "Sol's Shuttle Services",
    tag: "Design Hub",
    shortDesc: "Branding package for a local shuttle service — flyer, logo, and business card.",
    image: "/Sol.jpg",
    images: ["/Sol.jpg", "/gallery/design/logo.jpg", "/gallery/design/business-card.jpg"],
    clientGoal: "Sol needed a complete brand package for his shuttle service — a flyer to share rates, a logo for brand identity, and business cards for customers.",
    whatWeDid: [
      "Designed full pricing layout (Day vs Evening rates)",
      "Structured pricing into clear distance ranges",
      "Added service areas section",
      "Included important notices (deposit, surcharge, negotiable distances)",
      "Created transport-themed visual design",
      "Positioned vehicle image for brand identity",
    ],
    tools: ["Adobe Illustrator", "Print + WhatsApp-friendly layout design", "High contrast readability (dark + gold theme)"],
    result: "The client received a professional, easy-to-read pricing flyer that clearly communicates services and builds trust with customers.",
  },
  {
    id: "cv-creation",
    hub: "doc",
    title: "CV Creation for First-Time Job Seeker",
    tag: "Document Hub",
    shortDesc: "Built a complete professional CV from scratch for a first-time job applicant.",
    image: "/gallery/docu/cv-1.jpg",
    images: ["/gallery/docu/cv-1.jpg", "/gallery/docu/cv-2.jpg", "/gallery/docu/cv-3.jpg"],
    clientGoal: "Client had no CV and needed a professional document to apply for jobs.",
    whatWeDid: [
      "Created CV from scratch",
      "Structured personal information clearly",
      "Added skills and experience sections",
      "Formatted document professionally",
      "Printed final CV",
    ],
    tools: ["Microsoft Word", "Clean, structured formatting"],
    result: "Client received a complete, professional CV ready for job applications.",
  },
  {
    id: "flyer-printing",
    hub: "print",
    title: "Colour Flyer Printing for Local Business",
    tag: "Print Hub",
    shortDesc: "High-quality A4 colour flyers printed and prepared for local business distribution.",
    image: "/gallery/print/flyers.jpg",
    images: ["/gallery/print/flyers.jpg", "/gallery/print/printer.jpg", "/gallery/print/laminated.jpg"],
    clientGoal: "Client needed high-quality printed flyers to promote their business.",
    whatWeDid: [
      "Printed A4 colour flyers",
      "Adjusted layout for proper print output",
      "Ensured alignment and clean margins",
    ],
    tools: ["High-quality print settings", "Paper and colour optimization"],
    result: "Client received clean, vibrant flyers ready for distribution.",
  },
  {
    id: "sassa-srd",
    hub: "eservice",
    title: "SASSA SRD Application Assistance",
    tag: "EServices Hub",
    shortDesc: "Assisted client with correctly completing and submitting their SRD grant application.",
    image: "/gallery/eservice/laptop-1.jpg",
    images: ["/gallery/eservice/laptop-1.jpg", "/gallery/eservice/laptop-2.jpg", "/gallery/eservice/laptop-3.jpg"],
    clientGoal: "Client needed help applying for SRD grant correctly.",
    whatWeDid: [
      "Completed SRD application",
      "Verified personal details",
      "Submitted application successfully",
    ],
    tools: ["Online government portal"],
    result: "Application submitted correctly without errors.",
  },
  {
    id: "laptop-cleanup",
    hub: "tech",
    title: "Laptop Cleanup and Software Installation",
    tag: "Tech Hub",
    shortDesc: "Removed viruses, cleaned system files and installed essential software on a slow laptop.",
    image: "/gallery/tech/cleaning.jpg",
    images: ["/gallery/tech/cleaning.jpg", "/gallery/tech/software.jpg", "/gallery/tech/setup.jpg"],
    clientGoal: "Client's laptop was slow and needed essential software installed.",
    whatWeDid: [
      "Removed viruses",
      "Cleaned system files",
      "Installed Microsoft Office",
      "Updated operating system",
    ],
    tools: ["System cleanup tools", "Software installation"],
    result: "Laptop became faster and ready for daily use.",
  },
] as const

export type Project = typeof PROJECTS[number]
export type ProjectData = typeof PROJECTS[number]
