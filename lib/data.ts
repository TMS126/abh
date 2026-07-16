// lib/data.ts — Content only. Styling comes from @/lib/brand.
import { HUB_COLORS, HUB_NAMES, type HubKey } from '@/lib/brand'

export const PRICING = {
  print: { 'B&W Print': 'R5/page', 'Colour Print': 'R8/page', 'B&W Copy': 'R3/page', 'Colour Copy': 'R5/page', 'Glossy Photo (4x6)': 'R20', 'Glossy Photo (A4)': 'R40' },
  doc: { 'Typing + Print (B&W)': 'R15/page', 'Typing + Print (Colour)': 'R18/page', 'Affidavit / Letter': 'R15/page', 'CV from Scratch': 'R30', 'CV Upgrade/Fix': 'R40', 'Cover Letter': 'R30', 'Scanning': 'R5/page', 'Laminating (A5)': 'R15', 'Laminating (A4)': 'R20', 'Laminating (A3)': 'R30' },
  design: { 'Logo — Basic': 'R300', 'Logo — Standard': 'R500', 'Logo — Premium': 'R800', 'Business Card (Single Side)': 'R120', 'Business Card (Double Side)': 'R180', 'Flyer / Poster — Simple': 'R150', 'Flyer / Poster — Custom': 'R250', 'Flyer / Poster — Complex': 'R350', 'Social Media Post': 'R80', 'Post + Story': 'R120', 'Static Invitation': 'R150', 'Video Invitation': 'R300', 'Business Profile — Basic (1pg)': 'R250', 'Business Profile — Standard (2-3pg)': 'R400', 'Business Profile — Premium (4-5pg)': 'R600', 'Business Profile — Extra Page': 'R80/page', 'Revision — While Busy': 'R50', 'Revision — After Completion': 'R70' },
  eservice: {
    'SASSA Status Check': 'R20', 'SASSA Update Details': 'R40', 'SASSA Reapplication': 'R40', 'SASSA SRD Application': 'R40', 'SASSA Appeal': 'R40', 'SASSA Banking Update': 'R50', 'SASSA Grant Application': 'R80',
    'SARS Enquiry / Statement / Updates': 'R50', 'SARS New Taxpayer / eFiling': 'R70', 'SARS Tax Pin / Penalty': 'R100', 'SARS Tax Clearance': 'R120', 'SARS Pin Submission': 'R120', 'SARS Tax Return / VAT / PAYE': 'R200',
    // PSIRA — temporarily disabled, uncomment to re-enable
    // 'PSIRA Status Check': 'R30', 'PSIRA Update / Certificate': 'R40', 'PSIRA Lost Certificate': 'R50', 'PSIRA Renewal / New Registration': 'R80', 'PSIRA ID Application': 'R100',
    'NSFAS Status Check': 'R20', 'NSFAS Banking Update': 'R40', 'Learnership Application': 'R40', 'Job / DPSA Application': 'R40', 'Bursary Application': 'R40', 'NSFAS Appeal': 'R50', 'NSFAS Application': 'R80', 'University Application': 'R100',
    'Email Setup / Send / Receive': 'R15', 'Good Standing Letter': 'R60', 'Google Business Setup': 'R80', 'UIF Monthly Declaration': 'R100', 'UIF Registration': 'R100', 'CSD Update': 'R120', 'UIF Claims': 'R200', 'CSD Registration': 'R300',
    'Social Media Setup': 'R60', "Learner's Licence Booking": 'R60', 'WhatsApp Business Setup': 'R80',
  },
  tech: { 'Software Install': 'R80', 'App / Office Updates': 'R80', 'Driver Installation': 'R100', 'Printer Setup': 'R100', 'Activation Only': 'R100', 'Microsoft 365 Setup': 'R150', 'Troubleshooting': 'R150/hr', 'PC Cleanup': 'R150', 'Virus / Malware Removal': 'R200', 'OS Update': 'R200', 'PC Setup': 'R250', 'Windows Install (No Activation)': 'R300', 'Windows Install + Activation': 'R350' },
} as const

export type HubId = HubKey

export interface ServiceItem { name: string; price: string; requirements: string[]; description?: string }
export interface HubSection { title: string; desc?: string; items: ServiceItem[] }
export interface Hub { iconName: string; iconColor: string; title: string; grad: string; desc: string; turnaround: string; sections: HubSection[]; previews: string[]; tagStyle: { bg: string; color: string }; tagStyleDark: { bg: string; color: string } }

export const HUBS: Record<HubId, Hub> = {
  print: {
    iconName: 'Printer', iconColor: HUB_COLORS.print.light, title: HUB_NAMES.print, grad: HUB_COLORS.print.gradient,
    desc: `Fast, clear and affordable printing for every need — from a single page to bulk jobs.`,
    turnaround: "Same-day, no exceptions.",
    tagStyle: { bg: HUB_COLORS.print.tagBg, color: HUB_COLORS.print.tagText },
    tagStyleDark: { bg: HUB_COLORS.print.tagBgDark, color: HUB_COLORS.print.tagTextDark },
    previews: ['B&W Printing', 'Colour Printing', 'Photo Prints'],
    sections: [
      { title: 'Printing', desc: `Digital file to printed page — B&W or full colour, on standard A4, ready while you wait.`, items: [
        { name: 'Black & White', price: 'R5/page', description: `We print your digital file in crisp black and white on standard A4 paper. Send your file via USB, WhatsApp, or email — we handle the rest. Bulk discounts apply from 10 pages.`, requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'] },
        { name: 'Colour', price: 'R8/page', description: `Full-colour printing for documents, presentations, flyers, and anything that needs to stand out. We print your digital file directly — just send it over and collect.`, requirements: ['Bring your file on a USB, phone, or send it via WhatsApp/email', 'Let us know the number of pages and copies needed', 'Specify paper size if not standard A4'] },
      ]},
      { title: 'Copying', desc: `Bring in the original document and walk out with as many copies as you need — B&W or colour.`, items: [
        { name: 'Black & White', price: 'R3/page', description: `Bring in your original physical document and we'll make as many black and white copies as you need — fast and at one of the most affordable rates around. Great for ID copies, forms, and school work.`, requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'] },
        { name: 'Colour', price: 'R5/page', description: `Need an exact colour copy of a certificate, flyer, or photo? Bring in the original and we'll reproduce it faithfully in full colour. Perfect for keeping originals safe while sharing copies.`, requirements: ['Bring the original physical document to be copied', 'Let us know the number of copies needed'] },
      ]},
      { title: 'Photo Printing', desc: `Glossy prints of your favourite photos, from wallet size up to A4 — sharp colour, professional finish.`, items: [
        { name: '4x6 Glossy', price: 'R20', description: `The classic photo size — 4x6 inches printed on glossy photo paper for sharp colour and a professional finish. Perfect for framing, albums, or sending to family.`, requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'] },
        { name: 'A4 Glossy', price: 'R40', description: `Your photo printed large on glossy A4 photo paper. Great for portraits, event photos, or anything you want to display prominently. High resolution recommended for the cleanest result.`, requirements: ['Send the photo via USB, phone, AirDrop, or WhatsApp', 'Use a high-resolution image for the best print quality'] },
      ]},
    ],
  },
  doc: {
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
        { name: 'CV from Scratch', price: 'R30', description: `Never had a CV before? We build one for you from the ground up — personal details, education, skills, and work experience — all formatted neatly and ready to hand in or email to employers.`, requirements: ['Bring your ID document', 'Provide your personal details, education history, and work experience', 'Bring a recent photo if you want one included', 'Share contact details (phone number, email if available)'] },
        { name: 'CV Upgrade/Fix', price: 'R40', description: `Already have a CV but it's outdated, poorly formatted, or missing key information? We clean it up, restructure it, and add your latest experience so it looks professional and up to date.`, requirements: ['Bring your existing CV (digital file or printed copy)', 'Let us know what changes or updates you need', 'Provide any new information to be added'] },
        { name: 'Cover Letter', price: 'R30', description: `A strong cover letter introduces you to a potential employer before they even read your CV. We write a personalised one based on the job you're applying for, highlighting your key strengths.`, requirements: ['Bring details of the job you are applying for', 'Bring your CV for reference', 'Mention key skills or experience you want highlighted'] },
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
  },
  design: {
    iconName: 'PaintBrush', iconColor: HUB_COLORS.design.light, title: HUB_NAMES.design, grad: HUB_COLORS.design.gradient,
    desc: `Professional designs for your brand, events and marketing — eye-catching and print-ready.`,
    turnaround: "2–3 business days, no exceptions.",
    tagStyle: { bg: HUB_COLORS.design.tagBg, color: HUB_COLORS.design.tagText },
    tagStyleDark: { bg: HUB_COLORS.design.tagBgDark, color: HUB_COLORS.design.tagTextDark },
    previews: ['Logo Design', 'Flyers & Posters', 'Invitations'],
    sections: [
      { title: 'Logos', desc: `A visual identity for your business — from a simple icon to a full brand package with colours and guidelines.`, items: [
        { name: 'Basic Logo', price: 'R300', description: `A clean, simple logo — icon or wordmark — designed to represent your business clearly. Delivered in standard formats ready to use on WhatsApp, Facebook, or print. Best for new businesses that need something professional without full branding.`, requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style (modern, classic, playful, etc.)', 'Mention any reference logos you like for inspiration'] },
        { name: 'Standard Logo', price: 'R500', description: `A more refined logo with multiple concepts to choose from — icon, wordmark, and combination mark options. Includes multiple file formats and colour variants (white version, black version, colour version). The right choice for businesses ready to build a real brand.`, requirements: ['Provide your business name and tagline (if any)', 'Share your preferred colours and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need multiple initial concepts'] },
        { name: 'Premium Logo', price: 'R800', description: `Full brand identity — logo, colour palette, typography, and a basic brand guide explaining how to use everything consistently. Delivered in all standard formats. For businesses that want to look established from day one.`, requirements: ['Provide your business name and tagline (if any)', 'Share your brand vision, colours, and style direction', 'Mention any reference logos you like for inspiration', 'Specify if you need a full brand style guide and multiple file formats'] },
      ]},
      { title: 'Business Cards', desc: `Single or double-sided cards designed to make the right first impression.`, items: [
        { name: 'Single Side', price: 'R120', description: `A professional single-sided business card designed with your name, role, business, and contact details. Clean layout, correct sizing for print, and ready to send to a printer or print with us.`, requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Specify the quantity to be printed'] },
        { name: 'Double Side', price: 'R180', description: `Front and back business card — front with your main details, back with services, social media, a QR code, or whatever makes sense for your business. More space, more impact.`, requirements: ['Provide your name, business name, and job title', 'Share contact details (phone, email, WhatsApp, address)', 'Provide your logo if you have one', 'Let us know what content goes on the back (e.g. services, social media, map)', 'Specify the quantity to be printed'] },
      ]},
      { title: 'Flyers & Posters', desc: `Eye-catching layouts for promotions, events, and announcements — from simple to fully custom.`, items: [
        { name: 'Simple', price: 'R150', description: `A clean, straightforward flyer with your key message, contact details, and basic design. Good for sales, events, or announcements where the information matters more than complex visuals.`, requirements: ['Provide the text/content to be included (event, promo, contact details)', 'Share any photos or logos to be used', 'Mention your preferred colours or style'] },
        { name: 'Custom', price: 'R250', description: `A fully designed flyer or poster built around your brand and message. Custom layout, imagery placement, colour matching, and typography — designed to grab attention and communicate clearly.`, requirements: ['Provide the text/content to be included', 'Share any photos or logos to be used', 'Mention your preferred colours or style direction', 'Specify size and intended use (print or digital)'] },
        { name: 'Complex', price: 'R350', description: `For designs that need real creative work — multi-section layouts, detailed imagery, event programmes, or anything with a lot of content that must still look polished and well-structured.`, requirements: ['Provide the text/content to be included', 'Share photos, logos, and any reference designs', 'Mention your preferred colours or style direction', 'Specify size, layout complexity, and intended use'] },
      ]},
      { title: 'Social Media', desc: `Branded posts and stories, sized and styled to look right on your platform of choice.`, items: [
        { name: 'Post', price: 'R80', description: `A single branded social media post sized and designed for your platform of choice. Whether it's a promotion, announcement, or product highlight — we make it scroll-stopping and on-brand.`, requirements: ['Provide the text/message for the post', 'Share any photos or logos to be used', 'Mention the platform (Facebook, Instagram, WhatsApp Status, etc.)'] },
        { name: 'Post + Story', price: 'R120', description: `Your content designed in two formats at once — a standard post and a matching story. Same message, adapted for both placements so your brand looks consistent across your feed and your stories.`, requirements: ['Provide the text/message for the post and story', 'Share any photos or logos to be used', 'Mention the platform(s) the content is for'] },
      ]},
      { title: 'Invitations', desc: `Elegant static designs or animated video invites for weddings, parties, and events.`, items: [
        { name: 'Image/Static', price: 'R150', description: `A beautifully designed static invitation — the kind you save, share on WhatsApp, or print out. Includes event name, date, time, venue, and your theme or aesthetic direction. Clean, elegant, shareable.`, requirements: ['Provide event details (date, time, venue, host)', 'Share any photos or theme preferences', 'Mention your preferred colours or style'] },
        { name: 'Video', price: 'R300', description: `An animated video invitation that plays like a short clip — text reveals, music, transitions, and your event details brought to life. Makes a far stronger impression when shared on WhatsApp or social media.`, requirements: ['Provide event details (date, time, venue, host)', 'Share any photos, video clips, or theme preferences', 'Mention your preferred colours, music, or style'] },
      ]},
      { title: 'Business Profile', desc: `A polished multi-page document telling your business's full story, team, and services.`, items: [
        { name: 'Basic (1 page)', price: 'R250', description: `A single polished page covering your logo, about-us blurb, services list, and contact details — clean and professional.`, requirements: ['Provide business name, logo, and short description', 'Share services/contact details to include'] },
        { name: 'Standard (2-3 pages)', price: 'R400', description: `Adds founder/team info, a more detailed service breakdown, and a testimonials section to the basic profile.`, requirements: ['Provide business name, logo, and description', 'Share founder/team info and services', 'Include any testimonials to feature'] },
        { name: 'Premium (4-5 pages)', price: 'R600', description: `A full company profile — history/story, services, team, testimonials, and achievements/gallery, professionally laid out throughout.`, requirements: ['Provide full business story/history', 'Share team, services, testimonials, and achievements', 'Provide any gallery images to include'] },
        { name: 'Additional Pages (beyond 5)', price: 'R80/page', description: `Extra pages added on top of the Premium tier's 5-page limit, for businesses needing a longer profile.`, requirements: ['Specify the additional content needed for extra pages'] },
      ]},
      { title: 'Revisions', desc: `Changes to work already in progress, or already delivered and signed off.`, items: [
        { name: 'While Busy', price: 'R50', description: `Changed your mind mid-way? No problem. Revisions requested while the design is still actively being worked on cost less because we haven't finalised anything yet — it's easier to adjust on the fly.`, requirements: ['Clearly describe the changes you would like made', 'This applies only while the project is still in progress'] },
        { name: 'After Completion', price: 'R70', description: `Need changes after your design has already been delivered and signed off? Post-completion revisions require us to reopen the project file and rework finished elements — this is charged at a slightly higher rate to reflect that.`, requirements: ['Clearly describe the changes you would like made', 'This applies once the project has already been delivered/finalized'] },
      ]},
    ],
  },
  eservice: {
    iconName: 'Globe', iconColor: HUB_COLORS.eservice.light, title: HUB_NAMES.eservice, grad: HUB_COLORS.eservice.gradient,
    desc: `Government platforms made easy. We handle registrations, applications and updates so you don't have to stress.`,
    turnaround: "Your submission is completed same-day to next-day. Government processing time afterward varies and is outside our control.",
    tagStyle: { bg: HUB_COLORS.eservice.tagBg, color: HUB_COLORS.eservice.tagText },
    tagStyleDark: { bg: HUB_COLORS.eservice.tagBgDark, color: HUB_COLORS.eservice.tagTextDark },
    previews: ['SASSA', 'SARS eFiling', 'UIF & CSD'],
    sections: [
      { title: 'SASSA', desc: `Grant status checks, applications, updates, and appeals — handled through the official SASSA channels.`, items: [
        { name: 'Status Check', price: 'R20', description: `We log into the SASSA portal or use the official channels to check the current status of your grant or application — whether it's approved, pending, declined, or under review. You'll know exactly where things stand before you leave.`, requirements: ['Bring your ID document', 'Bring your SASSA reference number or application number if you have one'] },
        { name: 'Update Details', price: 'R40', description: `Changed your phone number, address, or personal details? We update your SASSA profile on the official system so your account stays current and payments or communications don't get disrupted.`, requirements: ['Bring your ID document', 'Bring proof of the new details (e.g. new address, new phone number)', 'Bring your SASSA reference number'] },
        { name: 'Reapplication', price: 'R40', description: `If your grant lapsed, was cancelled, or you've been asked to reapply, we complete the full reapplication process on your behalf through the correct SASSA channels — correctly the first time.`, requirements: ['Bring your ID document', 'Bring proof of previous application or rejection letter if available', 'Bring proof of income/affidavit of unemployment if required'] },
        { name: 'SRD Application', price: 'R40', description: `We submit your Social Relief of Distress (R370) grant application through the official SASSA SRD portal. We fill in all required details, verify your information, and confirm submission so you have proof it went through.`, requirements: ['Bring your ID document', 'Have your active cellphone number ready (for OTP/SMS)', 'Bring proof of bank account details if applying for bank payment'] },
        { name: 'Appeal', price: 'R40', description: `Declined for a grant you believe you qualify for? We submit a formal appeal on your behalf through the correct SASSA appeal process, ensuring your reasons are clearly stated and your supporting documents are attached.`, requirements: ['Bring your ID document', 'Bring the rejection/decline letter or SMS notification', 'Bring any supporting documents for your appeal'] },
        { name: 'Banking Update', price: 'R50', description: `Need your SASSA grant paid into a different bank account? We update your banking details on the SASSA system so your next payment goes to the right place — avoiding delays or missed payments.`, requirements: ['Bring your ID document', 'Bring your bank account details or bank confirmation letter', 'Bring your SASSA reference number'] },
        { name: 'Grant Application', price: 'R80', description: `Applying for a formal SASSA grant — such as the Child Support Grant, Older Persons Grant, or Disability Grant? We complete the full application with all required supporting documents and submit it correctly.`, requirements: ['Bring your ID document', "Bring supporting documents (e.g. child's birth certificate, disability assessment, proof of income)", 'Have your active cellphone number ready for OTP/SMS confirmations'] },
      ]},
      { title: 'SARS', desc: `Tax registration, statements, clearance certificates, and returns filed correctly on eFiling.`, items: [
        { name: 'Enquiry / Statement / Updates', price: 'R50', description: `Need to know your tax status, get a statement of account, or update basic details on your SARS profile? We log into eFiling and handle the enquiry or update on your behalf — no queues, no confusion.`, requirements: ['Bring your ID document', 'Bring your tax reference number if you have one'] },
        { name: 'New Taxpayer / eFiling', price: 'R70', description: `Never registered with SARS before? We register you as a new taxpayer, get your tax reference number, and set up your eFiling profile — so you're officially in the system and ready to file returns.`, requirements: ['Bring your ID document', 'Bring proof of address (utility bill, lease, or affidavit)', 'Have your active cellphone number and email ready'] },
        { name: 'Tax Pin / Penalty', price: 'R100', description: `Got a tax penalty notice or need to retrieve your tax PIN? We handle both — whether it's requesting a remission of the penalty or retrieving your SARS PIN through the correct eFiling process.`, requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring any SARS letters/notices relating to the penalty'] },
        { name: 'Tax Clearance', price: 'R120', description: `A Tax Clearance Certificate (or Tax Compliance Status PIN) proves you're up to date with SARS. We apply for it through eFiling — commonly needed for tenders, business contracts, visa applications, and emigration.`, requirements: ['Bring your ID document', 'Bring your tax reference number', 'Make sure your tax returns are up to date (we can assist if not)'] },
        { name: 'Pin Submission', price: 'R120', description: `Some SARS processes require you to submit a specific PIN or reference. We handle the submission correctly through eFiling so the right information reaches SARS without errors that could delay your matter.`, requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring the relevant SARS request/letter'] },
        { name: 'Tax Return / VAT / PAYE', price: 'R200', description: `Your annual tax return, VAT201, or PAYE submission completed and filed on eFiling. We work through your income, expenses, and supporting documents to ensure your return is accurate, compliant, and submitted on time.`, requirements: ['Bring your ID document', 'Bring your tax reference number', 'Bring income/expense documents (payslips, invoices, IRP5, bank statements as relevant)'] },
      ]},
      /* PSIRA — temporarily disabled, re-enable by uncommenting this section
      { title: 'PSIRA', items: [
        { name: 'PSIRA Status Check', price: 'R30', description: `We check your PSIRA registration status online — whether your certificate is active, expired, or pending renewal. Important to know before starting work at any security-regulated site.`, requirements: ['Bring your ID document', 'Bring your PSIRA registration number'] },
        { name: 'Update / Certificate', price: 'R40', description: `Need to update your PSIRA profile details or request a copy of your certificate? We handle the online update or certificate request through the PSIRA portal so your records are current.`, requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Bring proof of the new details to be updated'] },
        { name: 'Lost Certificate', price: 'R50', description: `Lost your PSIRA certificate? We apply for a replacement through the official PSIRA system. You'll need an affidavit confirming the loss, which we can assist with typing before submission.`, requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Affidavit confirming the certificate is lost may be required'] },
        { name: 'Renewal / New Registration', price: 'R80', description: `Registering with PSIRA for the first time or renewing an expired registration? We complete the full online application with your training certificates and personal details — keeping your security career compliant.`, requirements: ['Bring your ID document', 'Bring proof of relevant training/qualification (for new registration)', 'Bring your PSIRA registration number (for renewal)', 'Have your active cellphone number ready'] },
        { name: 'ID Application', price: 'R100', description: `Applying for your PSIRA identity card — the physical ID required on duty. We submit the application through the PSIRA portal with the required documentation and a recent photo.`, requirements: ['Bring your ID document', 'Bring your PSIRA registration number', 'Bring a recent passport-style photo if required'] },
      ]},
      */
      { title: 'Online Applications', desc: `NSFAS, learnerships, bursaries, and job applications completed accurately online.`, items: [
        { name: 'NSFAS Status Check', price: 'R20', description: `We check your NSFAS application or funding status on myNSFAS — whether you're approved, awaiting verification, or declined. Know your status before registration so you can plan accordingly.`, requirements: ['Bring your ID document', 'Bring your NSFAS reference number or login details if you have them'] },
        { name: 'NSFAS Banking Update', price: 'R40', description: `NSFAS requires accurate banking details to pay your allowances. If your bank details have changed or were entered incorrectly, we update them on myNSFAS so your money reaches you without delays.`, requirements: ['Bring your ID document', 'Bring your bank account details or confirmation letter', 'Bring your NSFAS reference number'] },
        { name: 'Learnership Application', price: 'R40', description: `Learnerships are government-backed training programmes that pay you while you learn a skill. We find the right opportunity and complete the online application on your behalf with your CV and supporting documents.`, requirements: ['Bring your ID document', 'Bring your highest qualification/certificate', 'Bring your CV if available'] },
        { name: 'Job / DPSA Application', price: 'R40', description: `Applying for a government or public service position? We complete your online job application on the DPSA or relevant portal — accurately filling in the Z83 form and attaching your CV and qualifications correctly.`, requirements: ['Bring your ID document', 'Bring your CV and certified qualifications', 'Have details of the specific position/post number ready'] },
        { name: 'Bursary Application', price: 'R40', description: `Bursary applications are competitive and detail-sensitive — a single mistake can disqualify you. We complete your bursary application online, ensuring all fields are correct and all required documents are attached.`, requirements: ['Bring your ID document', 'Bring your academic results/qualifications', 'Bring proof of household income if required', 'Bring acceptance letter from institution if applicable'] },
        { name: 'NSFAS Appeal', price: 'R50', description: `If NSFAS declined your application and you believe it was unfair, you have the right to appeal. We submit your appeal through myNSFAS with a clear motivation and supporting documents to give you the best chance of a reversal.`, requirements: ['Bring your ID document', 'Bring the NSFAS rejection/decline notification', 'Bring supporting documents (e.g. proof of income, motivation letter)'] },
        { name: 'NSFAS Application', price: 'R80', description: `Applying for NSFAS funding for the first time? We complete your full application on myNSFAS — personal details, household income, institution choice, and all supporting documents — submitted correctly to avoid rejections.`, requirements: ['Bring your ID document', 'Bring proof of household income or relevant supporting documents', 'Bring your academic results', 'Have your active cellphone number and email ready'] },
        { name: 'University Application', price: 'R100', description: `Applying to university through the CAO, institutional portals, or directly? We complete the full online application — programme selection, personal information, academic records, and required uploads — giving your application the best possible presentation.`, requirements: ['Bring your ID document', 'Bring certified academic results/matric certificate', 'Have application fee details ready if applicable', 'Have your active cellphone number and email ready'] },
      ]},
      { title: 'Email Services', desc: `A working email address, set up and ready — plus help sending or receiving what you need.`, items: [
        { name: 'Setup / Send / Receive', price: 'R15', description: `Don't have an email address yet, or need help accessing one? We create a new Gmail or similar account for you, or help you log in and send/receive specific emails. Many government applications require an email — we've got you covered.`, requirements: ['Bring your ID document', 'Have an active cellphone number ready for verification', 'If sending/receiving, bring the document or details to be emailed'] },
      ]},
      { title: 'Business Services', desc: `CIPC, UIF, CSD, and Google Business — the admin that keeps a business compliant and visible.`, items: [
        { name: 'Good Standing Letter', price: 'R60', description: `A CIPC Good Standing Letter (Compliance Checklist) confirms your company is registered and compliant. Commonly required for tenders and contracts. We retrieve it from the CIPC portal and hand it to you ready to use.`, requirements: ['Bring your ID document', 'Bring your company registration number', 'Bring CIPC login details if available'] },
        { name: 'Google Business Setup', price: 'R80', description: `Get your business listed on Google Maps and visible in local searches. We create and verify your Google Business Profile — business name, address, hours, photos, and contact details — so customers can find you when they search.`, requirements: ['Bring your business name and physical address', 'Bring contact details (phone, email, website if any)', 'Bring your business logo and a few photos if available'] },
        { name: 'UIF Monthly Declaration', price: 'R100', description: `Employers must declare employee details and earnings to UIF every month. We log into the UIF system and submit your monthly declaration accurately and on time — keeping your business compliant with labour law.`, requirements: ['Bring your UIF reference number', 'Bring employee details and monthly earnings information', 'Bring your UIF login details if available'] },
        { name: 'UIF Registration', price: 'R100', description: `Every employer who pays UIF-eligible staff must register with the UIF. We complete your employer or employee UIF registration on the Department of Labour portal — a legal requirement for contributing to the Unemployment Insurance Fund.`, requirements: ['Bring your ID document', 'Bring company registration documents (if registering a business)', 'Bring employee details if registering employees'] },
        { name: 'CSD Update', price: 'R120', description: `Your Central Supplier Database (CSD) profile must stay current for government procurement. If your banking details, tax status, or company info has changed, we update your CSD profile so you remain active and eligible for payments.`, requirements: ['Bring your company registration number', 'Bring your CSD supplier number', 'Bring proof of the details to be updated'] },
        { name: 'UIF Claims', price: 'R200', description: `Lost your job or went on maternity leave? You may be entitled to UIF benefits. We complete and submit your UIF claim online — UI2.1, UI19, and all required documents — giving you the best chance of a successful payout.`, requirements: ['Bring your ID document', 'Bring your UIF reference number', 'Bring termination letter/UI19 form and bank account details'] },
        { name: 'CSD Registration', price: 'R300', description: `Register your business on the Central Supplier Database to qualify for government contracts and tenders. We complete the full CSD registration — company details, tax status, banking info, and BEE level — so you're ready to do business with the state.`, requirements: ['Bring your company registration documents (CIPC)', 'Bring your tax clearance certificate', 'Bring bank confirmation letter', 'Bring BEE certificate/affidavit if applicable'] },
      ]},
      { title: 'Digital Setup', desc: `Social media, WhatsApp Business, and learner's licence bookings, set up properly from the start.`, items: [
        { name: 'Social Media Setup', price: 'R60', description: `Get your business on Facebook, Instagram, or any other platform with a properly set-up profile — logo, bio, contact details, and category all configured correctly from the start. First impressions online matter.`, requirements: ['Bring your business name and logo', 'Bring contact details and a short business description', 'Specify which platforms you want set up (Facebook, Instagram, etc.)'] },
        { name: "Learner's Licence Booking", price: 'R60', description: `We book your learner's licence test at the traffic department through the online booking system, selecting your preferred testing centre and date. Skip the walk-in queues — book it properly the first time.`, requirements: ['Bring your ID document', 'Have your active cellphone number ready for booking confirmation', 'Know your preferred testing centre and date range'] },
        { name: 'WhatsApp Business Setup', price: 'R80', description: `WhatsApp Business lets you run a professional presence on the world's most-used messaging app — automated replies, business hours, product catalogue, and a verified business name. We set the whole thing up on your dedicated business number.`, requirements: ['Bring your business name and logo', 'Have the dedicated business phone number ready', 'Bring a short business description and catalog items/prices if available'] },
      ]},
    ],
  },
  tech: {
    iconName: 'Desktop', iconColor: HUB_COLORS.tech.light, title: HUB_NAMES.tech, grad: HUB_COLORS.tech.gradient,
    desc: `From slow laptops to fresh Windows installs — everyday tech problems solved quickly and affordably.`,
    turnaround: "Most services same-day. Virus/Malware Removal and OS Updates may take several hours. Windows Install & PC Setup: same-day, except next-day if drop-off is late or extra work is needed. Troubleshooting: same-day, hours vary.",
    tagStyle: { bg: HUB_COLORS.tech.tagBg, color: HUB_COLORS.tech.tagText },
    tagStyleDark: { bg: HUB_COLORS.tech.tagBgDark, color: HUB_COLORS.tech.tagTextDark },
    previews: ['Windows Install', 'Virus Removal', 'PC Setup'],
    sections: [
      { title: 'Software', desc: `Programs installed cleanly, drivers fixed, and everything kept up to date.`, items: [
        { name: 'Software Install', price: 'R80', description: `Need a specific program installed on your laptop or PC? We install it cleanly — whether it's from a file you bring or a download — and confirm it's running correctly before you leave. No bloatware, no guesswork.`, requirements: ['Bring the device (laptop/PC)', 'Bring the installation file or a valid license/product key if required', 'Make sure the device is charged or bring a charger'] },
        { name: 'Driver Installation', price: 'R100', description: `Drivers are the software that let your hardware talk to Windows — if something isn't working (sound, display, printer, USB), it's often a missing or outdated driver. We identify what's needed and install the correct version.`, requirements: ['Bring the device (laptop/PC)', 'Know the device/hardware model (e.g. printer model, graphics card)', 'Make sure the device is charged or bring a charger'] },
        { name: 'App / Office Updates', price: 'R80', description: `Running old versions of Microsoft Office, Windows apps, or other software can cause crashes, security issues, and compatibility problems. We update everything to the latest stable version and verify it's working correctly.`, requirements: ['Bring the device (laptop/PC)', 'Make sure the device is connected to power or fully charged', 'Have your software login/license details ready if required'] },
      ]},
      { title: 'Hardware', desc: `Printers connected and new devices set up right, out of the box.`, items: [
        { name: 'Printer Setup', price: 'R100', description: `Got a printer that won't connect, isn't being detected, or won't print? We physically connect it, install the correct drivers, and test it until it's fully working — wired or wireless.`, requirements: ['Bring the printer and its power/USB cables', 'Bring the device (laptop/PC) the printer will connect to', 'Bring ink/toner cartridges if not already installed'] },
        { name: 'PC Setup', price: 'R250', description: `Brand new PC or laptop? We do the full setup — Windows configuration, account creation, privacy settings, essential software installation, and making sure everything is running optimally before it goes home with you.`, requirements: ['Bring the PC/laptop and all its cables', 'Bring any software license keys you want installed', 'Let us know what the device will mainly be used for'] },
      ]},
      { title: 'Support', desc: `Diagnosing issues, cleaning up clutter, and clearing out viruses and malware.`, items: [
        { name: 'Troubleshooting', price: 'R150/hr', description: `Something's wrong but you're not sure what? We diagnose and investigate the issue — whether it's crashes, error messages, slow performance, or strange behaviour — and work through it systematically. Charged per hour so you only pay for time actually spent.`, requirements: ['Bring the device experiencing the issue', 'Describe the problem clearly (when it started, error messages, etc.)', 'Minimum 1-hour call-out fee applies', 'Make sure the device is charged or bring a charger'] },
        { name: 'PC Cleanup', price: 'R150', description: `A slow laptop is usually just a cluttered one. We clear out junk files, disable unnecessary startup programs, uninstall bloatware, and give your system a thorough digital spring clean so it runs noticeably faster.`, requirements: ['Bring the device (laptop/PC)', 'Make sure the device is charged or bring a charger', 'Back up any important files beforehand if possible'] },
        { name: 'Virus / Malware Removal', price: 'R200', description: `Pop-ups everywhere, your browser going somewhere strange, or your PC doing things on its own? You likely have malware. We run a full scan, remove all threats, and secure your system so it doesn't happen again.`, requirements: ['Bring the device (laptop/PC)', 'Describe any symptoms noticed (pop-ups, slowness, strange behaviour)', 'Back up important files beforehand if possible'] },
        { name: 'OS Update', price: 'R200', description: `Windows updates can be slow, confusing, or broken — especially on older machines. We handle the full OS update process, resolve any errors that come up, and make sure your system is on a stable, up-to-date version of Windows.`, requirements: ['Bring the device (laptop/PC)', 'Make sure the device is connected to power', 'Back up important files beforehand if possible'] },
      ]},
      { title: 'Windows & Office', desc: `Fresh Windows installs, activation, and Microsoft 365 — fully set up and licensed.`, items: [
        { name: 'Windows Install (No Activation)', price: 'R300', description: `A completely fresh Windows installation — wiping the drive and starting from scratch. Ideal if your current Windows is beyond repair, badly corrupted, or you're repurposing a device. Comes without a product key — Windows runs in trial mode until you activate it.`, requirements: ['Bring the device (laptop/PC)', 'Back up all important files beforehand — installation will erase the drive', 'Make sure the device is connected to power'] },
        { name: 'Windows Install + Activation', price: 'R350', description: `Everything in the standard Windows install, plus full activation with a genuine product key. Your Windows will be licensed, personalised, and fully functional with no watermark and no trial limitations.`, requirements: ['Bring the device (laptop/PC)', 'Bring a valid Windows product key/license', 'Back up all important files beforehand — installation will erase the drive', 'Make sure the device is connected to power'] },
        { name: 'Activation Only', price: 'R100', description: `Already have Windows installed but it's showing as unlicensed or unactivated? We activate it using the correct method so you get rid of the "Activate Windows" watermark and gain access to all features.`, requirements: ['Bring the device (laptop/PC)', 'Bring a valid Windows or Microsoft 365 product key/license'] },
        { name: 'Microsoft 365 Setup', price: 'R150', description: `Microsoft 365 includes Word, Excel, PowerPoint, Outlook and more. We install and configure the full suite on your device, link it to your account, and make sure everything is licensed and ready to use for work or school.`, requirements: ['Bring the device (laptop/PC)', 'Bring your Microsoft 365 account login or product key', 'Make sure the device is connected to the internet'] },
      ]},
    ],
  },
}

// ─── Turnaround times ────────────────────────────────────────────────────────
// Keyed by section title (shared across hubs where titles repeat, e.g.
// "Scanning"/"Laminating" under Docu Hub). Item-level overrides below for
// services that differ from their section's default estimate.
//
// Print/Docu/Design figures verified against realistic South African provider
// research (July 2026). SASSA/SARS/E-Service figures represent ApexbytesHub's
// own submission turnaround only — actual government processing afterward is
// separate, much longer (SASSA SRD alone typically runs 7–14+ business days
// end-to-end), and outside our control — see each hub's `turnaround` field
// above, which already carries that disclaimer to clients.
//
// KNOWN INCONSISTENCY: "Logos" section default below (5–10 working days) is
// now longer than the Standard/Premium Logo item-level overrides further
// down (2–3 / 3–5 days). Only the Basic Logo tier falls through to the
// section default, so as written a Basic Logo would show as slower than a
// Standard or Premium one. Needs a decision on what Standard/Premium should
// actually say before this reads correctly.
export const TURNAROUND: Record<string, string> = {
  // Print Hub
  "Printing":            "15–30 mins",
  "Copying":             "10–20 mins",
  "Photo Printing":      "1–3 working days",
  "Scanning":            "10–15 mins",
  "Laminating":          "10–20 mins",
  // Docu Hub
  "Typing + Printing":   "1–3 hours",
  "CV Services":         "24–48 hours",
  "Other Documents":     "2–4 hours",
  // Design Hub
  "Logos":               "5–10 working days",
  "Business Cards":      "1–2 days",
  "Flyers & Posters":    "1–2 days",
  "Social Media":        "24–48 hours",
  "Invitations":         "1–2 days",
  "Revisions":           "2–6 hours",
  // E-Service Hub
  "SASSA":               "24 hours",
  "SARS":                "24 hours",
  "PSIRA":               "1–2 days",
  "Online Applications": "24 hours",
  "Email Services":      "15–30 mins",
  "Business Services":   "1–2 days",
  "Digital Setup":       "2–4 hours",
  // Tech Hub
  "Software":            "1–3 hours",
  "Hardware":            "1–2 days",
  "Support":             "2–6 hours",
  "Windows & Office":    "2–4 hours",
}

// Item-level overrides for services that differ from their section's estimate
export const TURNAROUND_OVERRIDE: Record<string, string> = {
  "Premium Logo":              "3–5 days",
  "Standard Logo":             "2–3 days",
  "Video":                     "3–5 days",
  "Tax Return / VAT / PAYE":   "2–3 days",
  "CSD Registration":          "1–2 days",
  "UIF Claims":                "2–3 days",
}

export const TURNAROUND_DISCLAIMER =
  "Turnaround times are estimates based on standard volume. Factors such as load shedding, third-party system downtime (SARS/SASSA/PSIRA), or complex revision requests may affect final delivery. We appreciate your patience as we ensure the highest quality for your work."

// ─── PROJECTS (Portfolio) ─────────────────────────────────────────────────────
export const PROJECTS = [
  {
    id: "apexbytes-business-card", hub: "design" as HubId, title: "Apexbytes Business Card Design", tag: HUB_NAMES.design,
    shortDesc: "Double-sided business card for the (old) Apexbytes brand — clean, minimal, and professional.",
    image: "/abbc.jpg", images: ["/abbc.jpg"], clientType: "practice" as const,
    clientGoal: "Design a business card that looks clean and professional — something that represents the (old) Apexbytes brand without being too busy.",
    whatWeDid: ["Designed front with brand logo, founder name, and role","Back features the brand icon large on a dark navy background in orange","Kept everything minimal — no clutter, just the essentials","Double-sided layout with strong contrast between front and back"],
    tools: ["Adobe Illustrator", "Double-sided business card format"],
    result: "A sharp, professional card that stands out and represents the brand well.",
  },
  {
    id: "vasep-branding", hub: "design" as HubId, title: "VASEP — Visual Arts Skills Empowerment Projects", tag: HUB_NAMES.design,
    shortDesc: "Full logo for a local arts empowerment organisation, in Kgotsong.",
    image: "/vsp1.jpg", images: ["/Vspsktch.jpeg", "/vsp1.jpg", "/Vspm.jpg"], clientType: "client" as const,
    clientGoal: `VASEP needed a logo that shows what they do — arts, skills, and community. Something colourful, meaningful, and strong enough to put on merch.`,
    whatWeDid: ["Designed a custom logo using a paint palette as the base symbol","Used multiple colours to represent different art disciplines and people","Added paint brushes crossing the palette for that creative feel","Placed a paint bottle on top as the hero element","Set VASEP in bold uppercase with full name underneath","Mocked up the logo on a t-shirt to show how it looks on merch"],
    tools: ["Adobe Illustrator", "Vector logo design", "T-shirt mockup"],
    result: `The client had a full logo ready for print, digital. Colourful, clean, and instantly recognisable as an arts organisation.`,
  },
  {
    id: "shuttle-flyer", hub: "design" as HubId, title: "Sol's Shuttle Services", tag: HUB_NAMES.design,
    shortDesc: "A local shuttle service — flyer.",
    image: "/Sol.jpg", images: ["/Sol.jpg"], clientType: "client" as const,
    clientGoal: "Sol needed a complete design for his shuttle service — a flyer to share rates for customers.",
    whatWeDid: ["Designed full pricing layout (Day vs Evening rates)","Structured pricing into clear distance ranges","Added service areas section","Included important notices (deposit, surcharge, negotiable distances)","Created transport-themed visual design","Positioned vehicle image for brand identity"],
    tools: ["Adobe Illustrator", "Print + WhatsApp-friendly layout design", "High contrast readability (dark + gold theme)"],
    result: "The client received a professional, easy-to-read pricing flyer that clearly communicates services and builds trust with customers.",
  },
  {
    id: "cv-creation", hub: "doc" as HubId, title: "CV Creation for First-Time Job Seeker", tag: HUB_NAMES.doc,
    shortDesc: "Built a complete professional CV from scratch for a first-time job applicant.",
    image: "/gallery/docu/cv-2.jpg", images: ["/gallery/docu/cv-1.jpg", "/gallery/docu/cv-2.jpg", "/gallery/docu/cv-3.jpg"], clientType: "sample" as const,
    clientGoal: "Client had no CV and needed a professional document to apply for jobs.",
    whatWeDid: ["Created CV from scratch","Structured personal information clearly","Added skills and experience sections","Formatted document professionally","Printed final CV"],
    tools: ["Microsoft Word", "Clean, structured formatting"],
    result: "Client received a complete, professional CV ready for job applications.",
  },
  {
  id: "cv-modernization",
  hub: "doc" as HubId,
  title: "Professional CV Redesign & Modern Layouts",
  tag: HUB_NAMES.doc,
  shortDesc: "Transformed traditional text-heavy CVs into high-impact, modern layouts with clean typography and professional formatting.",
  image: "/gallery/docu/1000048082.webp",
  images: ["/cvs1.webp", "/gallery/docu/1000048085.webp"],
  clientType: "client" as const,
  clientGoal: "Clients needed to upgrade their outdated CV formats into eye-catching, professionally structured documents to stand out to recruiters.",
  whatWeDid: [
    "Redesigned the layout using contemporary sidebar color-blocking",
    "Integrated professional profile photo elements seamlessly",
    "Structured contact details, work experience, and education for rapid scanning",
    "Formatted a dedicated, clean section for professional references",
    "Delivered sharp, high-contrast premium prints of the final documents"
  ],
  tools: ["Advanced Document Formatting", "Modern Layout Design Principles"],
  result: "Provided clients with polished, executive-style CVs that elevate their professional presentation and confidence in the job market.",
},

  {
    id: "rekaofela-bulk-print", hub: "print" as HubId, title: "Rekaofeela Social Club — Constitution Print", tag: HUB_NAMES.print,
    shortDesc: "Typed and printed 100+ copies of a kasi stokvel group's official rules document.",
    image: "/rsc1.webp", images: ["/rsc2.jpg", "/rsc.jpg"], clientType: "client" as const,
    clientGoal: "Rekaofeela Social Club, a local stokvel group in Kgotsong, needed their official rules printed in bulk so every member could have a personal copy.",
    whatWeDid: ["Formatted the document clearly for easy reading","Printed 100+ copies in black and white","Ensured consistent print quality across the entire batch"],
    tools: ["Microsoft Word", "Canon Megatank — bulk B&W printing"],
    result: "Every Rekaofeela Social Club member received a clean, printed copy of the group's rules — professionally done and ready for their meeting.",
  },
  {
    id: "sassa-srd", hub: "eservice" as HubId, title: "SASSA SRD Application Assistance", tag: HUB_NAMES.eservice,
    shortDesc: "Assisted client with correctly completing and submitting their SRD grant application.",
    image: "/gallery/eservice/laptop-1.jpg", images: ["/gallery/eservice/laptop-1.jpg", "/gallery/eservice/laptop-2.jpg", "/gallery/eservice/laptop-3.jpg"], clientType: "sample" as const,
    clientGoal: "Client needed help applying for SRD grant correctly.",
    whatWeDid: ["Completed SRD application","Verified personal details","Submitted application successfully"],
    tools: ["Online government portal"],
    result: "Application submitted correctly without errors.",
  },
  {
    id: "laptop-cleanup", hub: "tech" as HubId, title: "Laptop Cleanup and Software Installation", tag: HUB_NAMES.tech,
    shortDesc: "Removed viruses, cleaned system files and installed essential software on a slow laptop.",
    image: "/gallery/tech/cleaning.jpg", images: ["/gallery/tech/cleaning.jpg", "/gallery/tech/software.jpg", "/gallery/tech/setup.jpg"], clientType: "sample" as const,
    clientGoal: "Client's laptop was slow and needed essential software installed.",
    whatWeDid: ["Removed viruses","Cleaned system files","Installed Microsoft Office","Updated operating system"],
    tools: ["System cleanup tools", "Software installation"],
    result: "Laptop became faster and ready for daily use.",
  },
  {
    id: "pure-african-herbs", hub: "design" as HubId, title: "Pure African Herbs — Flyer Design", tag: HUB_NAMES.design,
    shortDesc: "Health services poster for a local herbal specialist in Bothaville.",
    image: "/Ahm.jpg", images: ["/Aphp1.png", "/Aphp2.png", "/Ahm.jpg"], clientType: "client" as const,
    clientGoal: "The client needed a professional flyer for their herbal health practice — something that lists conditions they treat, contact details, pricing, and hours. It also needed to work as a big A-board outside the shop.",
    whatWeDid: ["Designed a green health-themed layout matching the herbal brand","Organised conditions treated into a clean bullet list","Added pricing, specialist name, and contact numbers clearly","Included shop address and trading hours at the bottom","Created an A-board version for outdoor display","Added organic and no-side-effects trust badges"],
    tools: ["Adobe Illustrator", "Print-ready A4 and A-board format"],
    result: "Client had a professional flyer and A-board ready to attract walk-ins and answer common questions before clients even step inside.",
  },
  
  {
    id: "wedding-party-programme", hub: "design" as HubId, title: "Wedding Party Programme", tag: HUB_NAMES.design,
    shortDesc: "Printed wedding party programme with roles, names, and a celebratory layout.",
    image: "/Wp.png", images: ["/wedding_party_blurred.jpg"], clientType: "client" as const, sensitive: true,
    clientGoal: `The client needed a clean printed programme listing everyone's role at the wedding reception — from MC to cake cutting.`,
    whatWeDid: ["Designed a blue and white wedding layout with decorative elements","Listed all roles on the left with matching names on the right","Added floral and ribbon decorations to keep the celebratory feel","Used a dividing gold line between roles and names for readability","Made it print-ready at A4 size"],
    tools: ["Adobe Illustrator", "Print-ready A4 (foldable) layout"],
    result: `The client received a beautiful, easy-to-read programme that felt personal and matched the wedding's colours.`,
  },
  {
    id: "illusion-technologies", hub: "design" as HubId, title: "Illusion Technologies — Brand Identity", tag: HUB_NAMES.design,
    shortDesc: "Full corporate brand identity concept for a drone tech company. Portfolio practice project.",
    image: "/Itw.jpg", images: ["/20230527_194537.jpg", "/Itp.jpg", "/Itw.jpg", "/Itm2.jpg"], clientType: "practice" as const,
    clientGoal: "Explore what a premium tech brand identity looks like — logo design, mockups on buildings and office spaces, business card design, and a brand showcase layout.",
    whatWeDid: ["Designed the Illusion Technologies wordmark with a custom S-letter detail","Added a small blue accent on the S to break the dark monotone","Created logo variants on white and dark backgrounds","Mocked up the logo on a glass office building exterior","Mocked up the brand in an office interior setting","Designed matching business cards on dark textured stock","Built a full brand showcase poster layout"],
    tools: ["Adobe Illustrator", "Photoshop mockups", "Brand presentation layout"],
    result: "A complete brand identity concept showing how Illusion Technologies would look across digital and physical touchpoints. Done as a portfolio piece to demonstrate premium corporate branding skills.",
  },
] as const

export type ProjectData = {
  id: string; hub: string; title: string; tag: string; shortDesc: string
  image: string; images: readonly string[]; clientType?: "client" | "practice" | "sample"
  sensitive?: boolean; clientGoal: string; whatWeDid: readonly string[]
  tools: readonly string[]; result: string
}
export type Project = typeof PROJECTS[number] 
