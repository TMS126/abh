import { HUB_COLORS, HUB_NAMES } from '@/lib/brand'
import type { Hub } from '../types'

export const printHub: Hub = {
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
       }
