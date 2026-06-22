
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

export type HubId = 'print' | 'doc' | 'design' | 'eservice' | 'tech'

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
          {
            name: 'Black & White',
            price: 'R5/page',
            description: 'We print your digital file in crisp black and white on standard A4 paper. Send your file via USB, WhatsApp, or email — we handle the rest. Bulk discounts apply from 10 pages.',
            requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'],
          },
          {
            name: 'Colour',
            price: 'R8/page',
            description: 'Full-colour printing for documents, presentations, flyers, and anything that needs to stand out. We print your digital file directly — just send it over and collect.',
            requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'],
          },
        ],
      },
      {
        title: 'Copying',
        items: [
          {
            name: 'Black & White',
            price: 'R3/page',
            description: 'Bring in your original physical document and we\'ll make as many black and white copies as you need — fast and at one of the most affordable rates around. Great for ID copies, forms, and school work.',
            requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'],
          },
          {
            name: 'Colour',
            price: 'R5/page',
            description: 'Need an exact colour copy of a certificate, flyer, or photo? Bring in the original and we\'ll reproduce it faithfully in full colour. Perfect for keeping originals safe while sharing copies.',
            requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'],
          },
        ],
      },
      {
        title: 'Photo Printing',
        items: [
          {
            name: '4x6 Glossy',
            price: 'R20',
            description: 'The classic photo size — 4x6 inches printed on glossy photo paper for sharp colour and a professional finish. Perfect for framing, albums, or sending to family.',
            requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'],
          },
          {
            name: 'A4 Glossy',
            price: 'R40',
            description: 'Your photo printed large on glossy A4 photo paper. Great for portraits, event photos, or anything you want to display prominently. High resolution recommended for the cleanest result.',
            requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'],
          },
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
          {
            name: 'Black & White',
            price: 'R15/page',
            description: 'You bring your handwritten notes or rough draft, and we type it up neatly and print it out in black and white. Ideal for letters, applications, forms, and school assignments.',
            requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'],
          },
          {
            name: 'Colour',
            price: 'R18/page',
            description: 'Same as our typing service but printed in full colour — useful when your document includes colour tables, headings, charts, or needs to make a strong visual impression.',
            requirements: ['Bring your handwritten notes or rough draft', 'Clearly state any formatting preferences (font, spacing, layout)', 'Let us know the number of pages and copies needed'],
          },
        ],
      },
      {
        title: 'CV Services',
        items: [
          {
            name: 'CV from Scratch',
            price: 'R30',
            description: 'Never had a CV before? We build one for you from the ground up — personal details, education, skills, and work experience — all formatted neatly and ready to hand in or email to employers.',
            requirements: ['Bring your ID document', 'Provide your personal details, education history, and work experience', 'Bring a recent photo if you want one included', 'Share contact details (phone number, email if available)'],
          },
          {
            name: 'CV Upgrade/Fix',
            price: 'R40',
            description: 'Already have a CV but it\'s outdated, poorly formatted, or missing key information? We clean it up, restructure it, and add your latest experience so it looks professional and up to date.',
            requirements: ['Bring your existing CV (digital file or printed copy)', 'Let us know what changes or updates you need', 'Provide any new information to be added'],
          },
          {
            name: 'Cover Letter',
            price: 'R30',
            description: 'A strong cover letter introduces you to a potential employer before they even read your CV. We write a personalised one based on the job you\'re applying for, highlighting your key strengths.',
            requirements: ['Bring details of the job you are applying for', 'Bring your CV for reference', 'Mention key skills or experience you want highlighted'],
          },
        ],
      },
      {
        title: 'Other Documents',
        items: [
          {
            name: 'Affidavit / Letter',
            price: 'R20',
            description: 'Need an official written statement or a formal letter typed out? We draft and type affidavits, motivation letters, consent letters, and general correspondence to the correct format.',
            requirements: ['Bring your ID document', 'Provide the details/facts that need to be included', 'Some affidavits may require a visit to the police station or Commissioner of Oaths to be sworn'],
          },
        ],
      },
      {
        title: 'Scanning',
        items: [
          {
            name: 'Scan to Digital',
            price: 'R5/page',
            description: 'Turn your physical documents into digital files you can store, send, or email. We scan your paperwork and deliver it as a PDF or image directly to your phone, USB, or email.',
            requirements: ['Bring the original physical document(s) to be scanned', 'Let us know the file format you need (PDF, JPG, etc.)', 'Bring a USB or have WhatsApp/email ready to receive the file'],
          },
        ],
      },
      {
        title: 'Laminating',
        items: [
          {
            name: 'A5',
            price: 'R15',
            description: 'Protect your A5-sized documents, ID copies, cards, and certificates with a clear laminate seal. Laminating keeps paper from tearing, fading, or getting wet — great for anything you carry daily.',
            requirements: ['Bring the document or card to be laminated', 'Make sure the item is clean and flat'],
          },
          {
            name: 'A4',
            price: 'R20',
            description: 'Seal and protect full A4 documents — certificates, results, and important letters — in a clear laminate that makes them durable, waterproof, and presentable for years to come.',
            requirements: ['Bring the document to be laminated', 'Make sure the document is clean and flat'],
          },
          {
            name: 'A3',
            price: 'R30',
            description: 'Laminating for large A3 documents like posters, schedules, menus, and price lists. The extra-large laminate pouch keeps them looking sharp even when displayed in busy environments.',
            requirements: ['Bring the document or poster to be laminated', 'Make sure the item is clean and flat'],
          },
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
          {
            name: 'Basic Logo',
            price: 'R300',
            description: 'A clean, simple logo built around your business name. One concept, one round of refinement, delivered in standard formats. Ideal if you\'re just starting out and need something professional fast.',
            requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style (modern, classic, playful, etc.)', 'Mention any reference logos you like for inspiration'],
          },
          {
            name: 'Standard Logo',
            price: 'R500',
            description: 'A more detailed logo with refined typography, iconography, and colour palette. Includes multiple initial concepts so you can choose the direction that best fits your brand — ideal for growing businesses.',
            requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need multiple initial concepts'],
          },
          {
            name: 'Premium Logo',
            price: 'R800',
            description: 'A full brand identity treatment — custom icon, refined typography, complete colour system, and multiple file formats (PNG, SVG, PDF). Includes a brand style guide so you always use your logo correctly. Best for established or growing businesses serious about their brand.',
            requirements: ['Provide your business name and tagline (if any)', 'Share your brand vision, colours, and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need a full brand style guide and multiple file formats'],
          },
        ],
      },
      {
        title: 'Business Cards',
        items: [
          {
            name: 'Single Side',
            price: 'R120',
            description: 'A professionally designed business card printed on one side — your name, business, contact details, and logo laid out cleanly. The first impression you leave in someone\'s hand.',
            requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Specify the quantity to be printed'],
          },
          {
            name: 'Double Side',
            price: 'R180',
            description: 'Make the most of both sides. Front carries your identity; the back can feature your services, social handles, a QR code, or a map. More information, same compact card — maximise every interaction.',
            requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Let us know what content goes on the back (e.g. services, social media, map)', 'Specify the quantity to be printed'],
          },
        ],
      },
      {
        title: 'Flyers & Posters',
        items: [
          {
            name: 'Simple',
            price: 'R150',
            description: 'A clean, straightforward flyer with your key information — event details, promo, or announcement — laid out clearly without heavy customisation. Fast turnaround, print-ready.',
            requirements: ['Provide the text/content to be included (event, promo, contact details)', 'Share any photos or logos to be used', 'Mention your preferred colours or style'],
          },
          {
            name: 'Custom',
            price: 'R250',
            description: 'A fully designed flyer or poster built around your brand and message. Custom layout, imagery placement, colour matching, and typography — designed to grab attention and communicate clearly.',
            requirements: ['Provide the text/content to be included', 'Share any photos or logos to be used', 'Mention your preferred colours or style direction', 'Specify size and intended use (print or digital)'],
          },
          {
            name: 'Complex',
            price: 'R350',
            description: 'For designs that need real creative work — multi-section layouts, detailed imagery, event programmes, or anything with a lot of content that must still look polished and well-structured.',
            requirements: ['Provide the text/content to be included', 'Share photos, logos, and any reference designs', 'Mention your preferred colours or style direction', 'Specify size, layout complexity, and intended use'],
          },
        ],
      },
      {
        title: 'Social Media',
        items: [
          {
            name: 'Post',
            price: 'R80',
            description: 'A single branded social media post sized and designed for your platform of choice. Whether it\'s a promotion, announcement, or product highlight — we make it scroll-stopping and on-brand.',
            requirements: ['Provide the text/message for the post', 'Share any photos or logos to be used', 'Mention the platform (Facebook, Instagram, WhatsApp Status, etc.)'],
          },
          {
            name: 'Post + Story',
            price: 'R120',
            description: 'Your content designed in two formats at once — a standard post and a matching story. Same message, adapted for both placements so your brand looks consistent across your feed and your stories.',
            requirements: ['Provide the text/message for the post and story', 'Share any photos or logos to be used', 'Mention the platform(s) the content is for'],
          },
        ],
      },
      {
        title: 'Invitations',
        items: [
          {
            name: 'Image/Static',
            price: 'R150',
            description: 'A beautifully designed static invitation — the kind you save, share on WhatsApp, or print out. Includes event name, date, time, venue, and your theme or aesthetic direction. Clean, elegant, shareable.',
            requirements: ['Provide event details (date, time, venue, host)', 'Share any photos or theme preferences', 'Mention your preferred colours or style'],
          },
          {
            name: 'Video',
            price: 'R300',
            description: 'An animated video invitation that plays like a short clip — text reveals, music, transitions, and your event details brought to life. Makes a far stronger impression when shared on WhatsApp or social media.',
            requirements: ['Provide event details (date, time, venue, host)', 'Share any photos, video clips, or theme preferences', 'Mention your preferred colours, music, or style'],
          },
        ],
      },
      {
        title: 'Revisions',
        items: [
          {
            name: 'While Busy',
            price: 'R50',
            description: 'Changed your mind mid-way? No problem. Revisions requested while the design is still actively being worked on cost less because we haven\'t finalised anything yet — it\'s easier to adjust on the fly.',
            requirements: ['Clearly describe the changes you would like made', 'This applies only while the project is still in progress'],
          },
          {
            name: 'After Completion',
            price: 'R70',
            description: 'Need changes after your design has already been delivered and signed off? Post-completion revisions require us to reopen the project file and rework finished elements — this is charged at a slightly higher rate to reflect that.',
            requirements: ['Clearly describe the changes you would like made', 'This applies once the project has already been delivered/finalized'],
          },
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
          {
            name: 'Status Check',
            price: 'R20',
            description: 'We log into the SASSA portal or use the official channels to check the current status of your grant or application — whether it\'s approved, pending, declined, or under review. You\'ll know exactly where things stand before you leave.',
            requirements: ['Bring your ID document', 'Bring your SASSA reference number or application number if you have one'],
          },
          {
            name: 'Payment/Balance Check',
            price: 'R15',
            description: 'We check your SASSA grant payment status — whether your latest payment has been processed, what the amount is, and when it\'s expected. Useful if your money hasn\'t come through or you need confirmation.',
            requirements: ['Bring your ID document', 'Bring your SASSA card or grant details'],
          },
          {
            name: 'Update Details',
            price: 'R30',
            description: 'Changed your phone number, address, or personal details? We update your SASSA profile on the official system so your account stays current and payments or communications don\'t get disrupted.',
            requirements: ['Bring your ID document', 'Bring proof of the new details (e.g. new address, new phone number)', 'Bring your SASSA reference number'],
          },
          {
            name: 'Reapplication',
            price: 'R40',
            description: 'If your grant lapsed, was cancelled, or you\'ve been asked to reapply, we complete the full reapplication process on your behalf through the correct SASSA channels — correctly the first time.',
            requirements: ['Bring your ID document', 'Bring proof of previous application or rejection letter if available', 'Bring proof of income/affidavit of unemployment if required'],
          },
          {
            name: 'SRD Application',
            price: 'R40',
            description: 'We submit your Social Relief of Distress (R350) grant application through the official SASSA SRD portal. We fill in all required details, verify your information, and confirm submission so you have proof it went through.',
            requirements: ['Bring your ID document', 'Have your active cellphone number ready (for OTP/SMS)', 'Bring proof of bank account details if applying for bank payment'],
          },
          {
            name: 'Appeal',
            price: 'R40',
            description: 'Declined for a grant you believe you qualify for? We submit a formal appeal on your behalf through the correct SASSA appeal process, ensuring your reasons are clearly stated and your supporting documents are attached.',
            requirements: ['Bring your ID document', 'Bring the rejection/decline letter or SMS notification', 'Bring any supporting documents for your appeal'],
          },
          {
            name: 'Banking Update',
            price: 'R40',
            description: 'Need your SASSA grant paid into a different bank account? We update your banking details on the SASSA system so your next payment goes to the right place — avoiding delays or missed payments.',
            requirements: ['Bring your ID document', 'Bring your bank account details or bank confirmation letter', 'Bring your SASSA reference number'],
          },
          {
            name: 'Grant Application',
            price: 'R80',
            description: 'Applying for a formal SASSA grant — such as the Child Support Grant, Older Persons Grant, or Disability Grant? We complete the full application with all required supporting documents and submit it correctly. More involved than an SRD, but we handle all the steps.',
            requirements: ['Bring your ID document', "Bring supporting documents (e.g. child's birth certificate, disability assessment, proof of income)", 'Have your active cellphone number ready for OTP/SMS confirmations'],
          },
        ],
      },
      {
        title: 'SARS',
        items: [
          {
            name: 'Enquiry / Statement / Updates',
            price: 'R50',
            description: 'Need to know your tax status, get a statement of account, or update basic details on your SARS profile? We log into eFiling and handle the enquiry or update on your behalf — no queues, no confusion.',
            requirements: ['Bring your ID document', 'Bring your tax reference number if you have one'],
          },
          {
            name: 'New Taxpayer / eFiling',
            price: 'R70',
            description: 'Never registered with SARS before? We register you as a new taxpayer, get your tax reference number, and set up your eFiling profile — so you\'re officially in the system and ready to file returns.',
            requirements: ['Bring your ID document', 'Bring proof of address (utility bill, lease, or affidavit)', 'Have your active cellphone number and email ready'],
          },
          {
            name: 'Tax Pin / Penalty',
            price: 'R100',
            description: 'Got a tax penalty notice or need to retrieve your tax PIN? We handle both — whether it\'s requesting a remission of the penalty or retrieving your SARS PIN through the correct eFiling process.',
            requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring any SARS letters/notices relating to the penalty'],
          },
          {
            name: 'Tax Clearance',
            price: 'R120',
            description: 'A Tax Clearance Certificate (or Tax Compliance Status PIN) proves you\'re up to date with SARS. We apply for it through eFiling — commonly needed for tenders, business contracts, visa applications, and emigration.',
            requirements: ['Bring your ID document', 'Bring your tax reference number', 'Make sure your tax returns are up to date (we can assist if not)'],
          },
          {
            name: 'Pin Submission',
            price: 'R120',
            description: 'Some SARS processes require you to submit a specific PIN or reference. We handle the submission correctly through eFiling so the right information reaches SARS without errors that could delay your matter.',
            requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring the relevant SARS request/letter'],
          },
          {
            name: 'Tax Return / VAT / PAYE',
            price: 'R200',
            description: 'Your annual tax return, VAT201, or PAYE submission completed and filed on eFiling. We work through your income, expenses, and supporting documents to ensure your return is accurate, compliant, and submitted on time.',
            requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring income/expense documents (payslips, invoices, IRP5, bank statements as relevant)'],
          },
        ],
      },
      {
        title: 'PSIRA',
        items: [
          {
            name: 'PSIRA Status Check',
            price: 'R30',
            description: 'We check your PSIRA registration status online — whether your certificate is active, expired, or pending renewal. Important to know before starting work at any security-regulated site.',
            requirements: ['Bring your ID document', 'Bring your PSIRA registration number'],
          },
          {
            name: 'Update / Certificate',
            price: 'R40',
            description: 'Need to update your PSIRA profile details or request a copy of your certificate? We handle the online update or certificate request through the PSIRA portal so your records are current.',
            requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Bring proof of the new details to be updated'],
          },
          {
            name: 'Lost Certificate',
            price: 'R50',
            description: 'Lost your PSIRA certificate? We apply for a replacement through the official PSIRA system. You\'ll need an affidavit confirming the loss, which we can assist with typing before submission.',
            requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Affidavit confirming the certificate is lost may be required'],
          },
          {
            name: 'Renewal / New Registration',
            price: 'R80',
            description: 'Registering with PSIRA for the first time or renewing an expired registration? We complete the full online application with your training certificates and personal details — keeping your security career compliant.',
            requirements: ['Bring your ID document', 'Bring proof of relevant training/qualification (for new registration)', 'Bring your PSIRA registration number (for renewal)', 'Have your active cellphone number ready'],
          },
          {
            name: 'ID Application',
            price: 'R100',
            description: 'Applying for your PSIRA identity card — the physical ID required on duty. We submit the application through the PSIRA portal with the required documentation and a recent photo.',
            requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Bring a recent passport-style photo if required'],
          },
        ],
      },
      {
        title: 'Online Applications',
        items: [
          {
            name: 'NSFAS Status Check',
            price: 'R20',
            description: 'We check your NSFAS application or funding status on myNSFAS — whether you\'re approved, awaiting verification, or declined. Know your status before registration so you can plan accordingly.',
            requirements: ['Bring your ID document', 'Bring your NSFAS reference number or login details if you have them'],
          },
          {
            name: 'NSFAS Banking Update',
            price: 'R20',
            description: 'NSFAS requires accurate banking details to pay your allowances. If your bank details have changed or were entered incorrectly, we update them on myNSFAS so your money reaches you without delays.',
            requirements: ['Bring your ID document', 'Bring your bank account details or confirmation letter', 'Bring your NSFAS reference number'],
          },
          {
            name: 'Learnership Application',
            price: 'R30',
            description: 'Learnerships are government-backed training programmes that pay you while you learn a skill. We find the right opportunity and complete the online application on your behalf with your CV and supporting documents.',
            requirements: ['Bring your ID document', 'Bring your highest qualification/certificate', 'Bring your CV if available'],
          },
          {
            name: 'Job / DPSA Application',
            price: 'R40',
            description: 'Applying for a government or public service position? We complete your online job application on the DPSA or relevant portal — accurately filling in the Z83 form and attaching your CV and qualifications correctly.',
            requirements: ['Bring your ID document', 'Bring your CV and certified qualifications', 'Have details of the specific position/post number ready'],
          },
          {
            name: 'Bursary Application',
            price: 'R40',
            description: 'Bursary applications are competitive and detail-sensitive — a single mistake can disqualify you. We complete your bursary application online, ensuring all fields are correct and all required documents are attached.',
            requirements: ['Bring your ID document', 'Bring your academic results/qualifications', 'Bring proof of household income if required', 'Bring acceptance letter from institution if applicable'],
          },
          {
            name: 'NSFAS Appeal',
            price: 'R50',
            description: 'If NSFAS declined your application and you believe it was unfair, you have the right to appeal. We submit your appeal through myNSFAS with a clear motivation and supporting documents to give you the best chance of a reversal.',
            requirements: ['Bring your ID document', 'Bring the NSFAS rejection/decline notification', 'Bring supporting documents (e.g. proof of income, motivation letter)'],
          },
          {
            name: 'NSFAS Application',
            price: 'R80',
            description: 'Applying for NSFAS funding for the first time? We complete your full application on myNSFAS — personal details, household income, institution choice, and all supporting documents — submitted correctly to avoid rejections.',
            requirements: ['Bring your ID document', 'Bring proof of household income or relevant supporting documents', 'Bring your academic results', 'Have your active cellphone number and email ready'],
          },
          {
            name: 'University Application',
            price: 'R100',
            description: 'Applying to university through the CAO, institutional portals, or directly? We complete the full online application — programme selection, personal information, academic records, and required uploads — giving your application the best possible presentation.',
            requirements: ['Bring your ID document', 'Bring certified academic results/matric certificate', 'Have application fee details ready if applicable', 'Have your active cellphone number and email ready'],
          },
        ],
      },
      {
        title: 'Email Services',
        items: [
          {
            name: 'Setup / Send / Receive',
            price: 'R15',
            description: 'Don\'t have an email address yet, or need help accessing one? We create a new Gmail or similar account for you, or help you log in and send/receive specific emails. Many government applications require an email — we\'ve got you covered.',
            requirements: ['Bring your ID document', 'Have an active cellphone number ready for verification', 'If sending/receiving, bring the document or details to be emailed'],
          },
        ],
      },
      {
        title: 'Business Services',
        items: [
          {
            name: 'Good Standing Letter',
            price: 'R60',
            description: 'A CIPC Good Standing Letter (Compliance Checklist) confirms your company is registered and compliant. Commonly required for tenders and contracts. We retrieve it from the CIPC portal and hand it to you ready to use.',
            requirements: ['Bring your ID document', 'Bring your company registration number', 'Bring CIPC login details if available'],
          },
          {
            name: 'Google Business Setup',
            price: 'R80',
            description: 'Get your business listed on Google Maps and visible in local searches. We create and verify your Google Business Profile — business name, address, hours, photos, and contact details — so customers can find you when they search.',
            requirements: ['Bring your business name and physical address', 'Bring contact details (phone, email, website if any)', 'Bring your business logo and a few photos if available'],
          },
          {
            name: 'UIF Monthly Declaration',
            price: 'R100',
            description: 'Employers must declare employee details and earnings to UIF every month. We log into the UIF system and submit your monthly declaration accurately and on time — keeping your business compliant with labour law.',
            requirements: ['Bring your UIF reference number', 'Bring employee details and monthly earnings information', 'Bring your UIF login details if available'],
          },
          {
            name: 'CSD Update',
            price: 'R120',
            description: 'Your Central Supplier Database (CSD) profile must stay current for government procurement. If your banking details, tax status, or company info has changed, we update your CSD profile so you remain active and eligible for payments.',
            requirements: ['Bring your company registration number', 'Bring your CSD supplier number', 'Bring proof of the details to be updated'],
          },
          {
            name: 'UIF Registration',
            price: 'R100',
            description: 'Every employer who pays UIF-eligible staff must register with the UIF. We complete your employer or employee UIF registration on the Department of Labour portal — a legal requirement for contributing to the Unemployment Insurance Fund.',
            requirements: ['Bring your ID document', 'Bring company registration documents (if registering a business)', 'Bring employee details if registering employees'],
          },
          {
            name: 'UIF Claims',
            price: 'R200',
            description: 'Lost your job or went on maternity leave? You may be entitled to UIF benefits. We complete and submit your UIF claim online — UI2.1, UI19, and all required documents — giving you the best chance of a successful payout.',
            requirements: ['Bring your ID document', 'Bring your UIF reference number', 'Bring termination letter/UI19 form and bank account details'],
          },
          {
            name: 'CSD Registration',
            price: 'R300',
            description: 'Register your business on the Central Supplier Database to qualify for government contracts and tenders. We complete the full CSD registration — company details, tax status, banking info, and BEE level — so you\'re ready to do business with the state.',
            requirements: ['Bring your company registration documents (CIPC)', 'Bring your tax clearance certificate', 'Bring bank confirmation letter', 'Bring BEE certificate/affidavit if applicable'],
          },
        ],
      },
      {
        title: 'Digital Setup',
        items: [
          {
            name: 'Social Media Setup',
            price: 'R60',
            description: 'Get your business on Facebook, Instagram, or any other platform with a properly set-up profile — logo, bio, contact details, and category all configured correctly from the start. First impressions online matter.',
            requirements: ['Bring your business name and logo', 'Bring contact details and a short business description', 'Specify which platforms you want set up (Facebook, Instagram, etc.)'],
          },
          {
            name: "Learner's Licence Booking",
            price: 'R60',
            description: 'We book your learner\'s licence test at the traffic department through the online booking system, selecting your preferred testing centre and date. Skip the walk-in queues — book it properly the first time.',
            requirements: ['Bring your ID document', 'Have your active cellphone number ready for booking confirmation', 'Know your preferred testing centre and date range'],
          },
          {
            name: 'WhatsApp Business Setup',
            price: 'R80',
            description: 'WhatsApp Business lets you run a professional presence on the world\'s most-used messaging app — automated replies, business hours, product catalogue, and a verified business name. We set the whole thing up on your dedicated business number.',
            requirements: ['Bring your business name and logo', 'Have the dedicated business phone number ready', 'Bring a short business description and catalog items/prices if available'],
          },
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
          {
            name: 'Software Install',
            price: 'R80',
            description: 'Need a specific program installed on your laptop or PC? We install it cleanly — whether it\'s from a file you bring or a download — and confirm it\'s running correctly before you leave. No bloatware, no guesswork.',
            requirements: ['Bring the device (laptop/PC)', 'Bring the installation file or a valid license/product key if required', 'Make sure the device is charged or bring a charger'],
          },
          {
            name: 'Driver Installation',
            price: 'R100',
            description: 'Drivers are the software that let your hardware talk to Windows — if something isn\'t working (sound, display, printer, USB), it\'s often a missing or outdated driver. We identify what\'s needed and install the correct version.',
            requirements: ['Bring the device (laptop/PC)', 'Know the device/hardware model (e.g. printer model, graphics card)', 'Make sure the device is charged or bring a charger'],
          },
          {
            name: 'App / Office Updates',
            price: 'R80',
            description: 'Running old versions of Microsoft Office, Windows apps, or other software can cause crashes, security issues, and compatibility problems. We update everything to the latest stable version and verify it\'s working correctly.',
            requirements: ['Bring the device (laptop/PC)', 'Make sure the device is connected to power or fully charged', 'Have your software login/license details ready if required'],
          },
        ],
      },
      {
        title: 'Hardware',
        items: [
          {
            name: 'Printer Setup',
            price: 'R100',
            description: 'Got a printer that won\'t connect, isn\'t being detected, or won\'t print? We physically connect it, install the correct drivers, and test it until it\'s fully working — wired or wireless.',
            requirements: ['Bring the printer and its power/USB cables', 'Bring the device (laptop/PC) the printer will connect to', 'Bring ink/toner cartridges if not already installed'],
          },
          {
            name: 'PC Setup',
            price: 'R250',
            description: 'Brand new PC or laptop? We do the full setup — Windows configuration, account creation, privacy settings, essential software installation, and making sure everything is running optimally before it goes home with you.',
            requirements: ['Bring the PC/laptop and all its cables', 'Bring any software license keys you want installed', 'Let us know what the device will mainly be used for'],
          },
        ],
      },
      {
        title: 'Support',
        items: [
          {
            name: 'Troubleshooting',
            price: 'R150/hr',
            description: 'Something\'s wrong but you\'re not sure what? We diagnose and investigate the issue — whether it\'s crashes, error messages, slow performance, or strange behaviour — and work through it systematically. Charged per hour so you only pay for time actually spent.',
            requirements: ['Bring the device experiencing the issue', 'Describe the problem clearly (when it started, error messages, etc.)', 'Minimum 1-hour call-out fee applies', 'Make sure the device is charged or bring a charger'],
          },
          {
            name: 'PC Cleanup',
            price: 'R150',
            description: 'A slow laptop is usually just a cluttered one. We clear out junk files, disable unnecessary startup programs, uninstall bloatware, and give your system a thorough digital spring clean so it runs noticeably faster.',
            requirements: ['Bring the device (laptop/PC)', 'Make sure the device is charged or bring a charger', 'Back up any important files beforehand if possible'],
          },
          {
            name: 'Virus / Malware Removal',
            price: 'R200',
            description: 'Pop-ups everywhere, your browser going somewhere strange, or your PC doing things on its own? You likely have malware. We run a full scan, remove all threats, and secure your system so it doesn\'t happen again.',
            requirements: ['Bring the device (laptop/PC)', 'Describe any symptoms noticed (pop-ups, slowness, strange behaviour)', 'Back up important files beforehand if possible'],
          },
          {
            name: 'OS Update',
            price: 'R200',
            description: 'Windows updates can be slow, confusing, or broken — especially on older machines. We handle the full OS update process, resolve any errors that come up, and make sure your system is on a stable, up-to-date version of Windows.',
            requirements: ['Bring the device (laptop/PC)', 'Make sure the device is connected to power', 'Back up important files beforehand if possible'],
          },
        ],
      },
      {
        title: 'Windows & Office',
        items: [
          {
            name: 'Windows Install (No Activation)',
            price: 'R300',
            description: 'A completely fresh Windows installation — wiping the drive and starting from scratch. Ideal if your current Windows is beyond repair, badly corrupted, or you\'re repurposing a device. Comes without a product key — Windows runs in trial mode until you activate it.',
            requirements: ['Bring the device (laptop/PC)', 'Back up all important files beforehand — installation will erase the drive', 'Make sure the device is connected to power'],
          },
          {
            name: 'Windows Install + Activation',
            price: 'R350',
            description: 'Everything in the standard Windows install, plus full activation with a genuine product key. Your Windows will be licensed, personalised, and fully functional with no watermark and no trial limitations.',
            requirements: ['Bring the device (laptop/PC)', 'Bring a valid Windows product key/license', 'Back up all important files beforehand — installation will erase the drive', 'Make sure the device is connected to power'],
          },
          {
            name: 'Activation Only',
            price: 'R100',
            description: 'Already have Windows installed but it\'s showing as unlicensed or unactivated? We activate it using the correct method so you get rid of the "Activate Windows" watermark and gain access to all features.',
            requirements: ['Bring the device (laptop/PC)', 'Bring a valid Windows or Microsoft 365 product key/license'],
          },
          {
            name: 'Microsoft 365 Setup',
            price: 'R150',
            description: 'Microsoft 365 includes Word, Excel, PowerPoint, Outlook and more. We install and configure the full suite on your device, link it to your account, and make sure everything is licensed and ready to use for work or school.',
            requirements: ['Bring the device (laptop/PC)', 'Bring your Microsoft 365 account login or product key', 'Make sure the device is connected to the internet'],
          },
        ],
      },
    ],
  },
}

// ─── PROJECTS (Portfolio) ─────────────────────────────────────────────────────
export const PROJECTS = [
 {
    id: "vasep-branding",
    hub: "design",
    title: "VASEP — Visual Arts Skills Empowerment Projects",
    tag: "Design Hub",
    shortDesc: "Full logo and brand identity for a local arts empowerment organisation.",
    image: "/vsp1.jpg",
    images: ["/Vspsktch.jpeg", "/vsp1.jpg", "/Vspm.jpg" ],
    clientType: "client" as const,
    clientGoal: "VASEP needed a logo that shows what they do — arts, skills, and community. Something colourful, meaningful, and strong enough to put on merch.",
    whatWeDid: [
      "Designed a custom logo using a paint palette as the base symbol",
      "Used multiple colours to represent different art disciplines and people",
      "Added paint brushes crossing the palette for that creative feel",
      "Placed a paint bottle on top as the hero element",
      "Set VASEP in bold uppercase with full name underneath",
      "Mocked up the logo on a t-shirt to show how it looks on merch",
    ],
    tools: ["Adobe Illustrator", "Vector logo design", "T-shirt mockup"],
    result: "The client had a full logo ready for print, digital. Colourful, clean, and instantly recognisable as an arts organisation.",
  },
  
  {
    id: "shuttle-flyer",
    hub: "design",
    title: "Sol's Shuttle Services",
    tag: "Design Hub",
    shortDesc: "Branding package for a local shuttle service — flyer, logo, and business card.",
    image: "/Sol.jpg",
    images: ["/Sol2.jpg", "/Sol.jpg"],
    clientType: "client" as const,
    clientGoal: "A client needed a complete brand package for his shuttle service — a flyer to share rates, a logo for brand identity, and business cards for customers.",
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
    image: "/gallery/docu/cv-2.jpg",
    images: ["/gallery/docu/cv-1.jpg", "/gallery/docu/cv-2.jpg", "/gallery/docu/cv-3.jpg"],
    clientType: "sample" as const,
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
    image: "/gallery/print/printer.jpg",
    images: [ "/gallery/print/printer.jpg", "/gallery/print/laminated.jpg"],
    clientType: "sample" as const,
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
    clientType: "sample" as const,
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
    clientType: "sample" as const,
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
  // ─── Pure African Herbs ───────────────────────────────────────────────────────
  {
    id: "pure-african-herbs",
    hub: "design",
    title: "Pure African Herbs — Flyer & A-Board Design",
    tag: "Design Hub",
    shortDesc: "Health services flyer and A-board poster for a local herbal specialist in Bothaville.",
    image: "/Ahm.jpg",
    images: ["/Aphp1.png","/Aphp2.png", "/Ahm.jpg" ],
    clientType: "client" as const,
    clientGoal: "The client needed a professional flyer for their herbal health practice — something that lists conditions they treat, contact details, pricing, and hours. It also needed to work as a big A-board outside the shop.",
    whatWeDid: [
      "Designed a green health-themed layout matching the herbal brand",
      "Organised conditions treated into a clean bullet list",
      "Added pricing, specialist name, and contact numbers clearly",
      "Included shop address and trading hours at the bottom",
      "Created an A-board version for outdoor display",
      "Added organic and no-side-effects trust badges",
    ],
    tools: ["Adobe Illustrator", "Print-ready A4 and A-board format"],
    result: "Client had a professional flyer and A-board ready to attract walk-ins and answer common questions before clients even step inside.",
  },

  // ─── Apexbytes Business Card ──────────────────────────────────────────────────
  {
    id: "apexbytes-business-card",
    hub: "design",
    title: "Apexbytes Business Card Design",
    tag: "Design Hub",
    shortDesc: "Double-sided business card for the Apexbytes brand — clean, minimal, and professional.",
    image: "/abbc.jpg",
    images: ["/abbc.jpg"],
    clientType: "client" as const,
    clientGoal: "Design a business card that looks clean and professional — something that represents the Apexbytes brand without being too busy.",
    whatWeDid: [
      "Designed front with brand logo, founder name, and role",
      "Back features the brand icon large on a dark navy background in orange",
      "Kept everything minimal — no clutter, just the essentials",
      "Double-sided layout with strong contrast between front and back",
    ],
    tools: ["Adobe Illustrator", "Double-sided business card format"],
    result: "A sharp, professional card that stands out and represents the brand well.",
  },

  // ─── Wedding Party Programme ──────────────────────────────────────────────────
  {
    id: "wedding-party-programme",
    hub: "design",
    title: "Wedding Party Programme",
    tag: "Design Hub",
    shortDesc: "Printed wedding party programme with roles, names, and a celebratory layout.",
    image: "/Wp.png",
    images: ["/Wp.png"],
    clientType: "client" as const,
    clientGoal: "The client needed a clean printed programme listing everyone's role at the wedding reception — from MC to cake cutting.",
    whatWeDid: [
      "Designed a blue and white wedding layout with decorative elements",
      "Listed all roles on the left with matching names on the right",
      "Added floral and ribbon decorations to keep the celebratory feel",
      "Used a dividing gold line between roles and names for readability",
      "Made it print-ready at A4 size",
    ],
    tools: ["Adobe Illustrator", "Print-ready A4 layout"],
    result: "The client received a beautiful, easy-to-read programme that felt personal and matched the wedding's colours.",
  },

  // ─── Illusion Technologies ────────────────────────────────────────────────────
  {
    id: "illusion-technologies",
    hub: "design",
    title: "Illusion Technologies — Brand Identity",
    tag: "Design Hub",
    shortDesc: "Full corporate brand identity concept for a drone tech company. Portfolio practice project.",
    image: "/Itw.jpg",
    images: ["/20230527_194537.jpg", "/Itp.jpg", "/Itw.jpg", "/Itm2.jpg"],
    clientType: "practice" as const,
    clientGoal: "Explore what a premium tech brand identity looks like — logo design, mockups on buildings and office spaces, business card design, and a brand showcase layout.",
    whatWeDid: [
      "Designed the Illusion Technologies wordmark with a custom S-letter detail",
      "Added a small blue accent on the S to break the dark monotone",
      "Created logo variants on white and dark backgrounds",
      "Mocked up the logo on a glass office building exterior",
      "Mocked up the brand in an office interior setting",
      "Designed matching business cards on dark textured stock",
      "Built a full brand showcase poster layout",
    ],
    tools: ["Adobe Illustrator", "Photoshop mockups", "Brand presentation layout"],
    result: "A complete brand identity concept showing how Illusion Technologies would look across digital and physical touchpoints. Done as a portfolio piece to demonstrate premium corporate branding skills.",
  },

  // ─── Before & After: Logo Rebrand ────────────────────────────────────────────
  {
    id: "logo-rebrand-ba",
    hub: "design",
    title: "Logo Rebrand — Before & After",
    tag: "Design Hub",
    shortDesc: "Side-by-side transformation of a flat, dated logo into a clean modern brand mark.",
    image: "/gallery/design/rebrand-after.jpg",
    images: ["/gallery/design/rebrand-after.jpg", "/gallery/design/rebrand-before.jpg"],
    beforeImage: "/Vspsktch.jpeg",
    afterImage: "/vsp1.jpg",
    clientType: "client" as const,
    clientGoal: "The client had a logo they made years ago in PowerPoint — blocky text, clashing colours, no clear identity. They needed something they could actually be proud to put on a business card and social media.",
    whatWeDid: [
      "Audited the existing logo and identified what was hurting the brand",
      "Rebuilt the wordmark with a professional typeface and custom weight",
      "Replaced the colour palette with a single, intentional accent colour",
      "Redesigned the icon mark to be clean and scalable at any size",
      "Delivered in PNG, SVG, and PDF — white and dark background variants",
    ],
    tools: ["Adobe Illustrator", "Vector logo design", "Brand colour system"],
    result: "The client immediately updated their WhatsApp, Facebook, and business cards. The new logo looks the same whether it's on a phone screen or a printed banner.",
  },
] as const

export type ProjectData = {
  id: string
  hub: string
  title: string
  tag: string
  shortDesc: string
  image: string
  images: string[]
  clientType?: "client" | "practice" | "sample"
  clientGoal: string
  whatWeDid: string[]
  tools: string[]
  result: string
  beforeImage?: string
  afterImage?: string
}
export type Project = typeof PROJECTS[number]
 
 
