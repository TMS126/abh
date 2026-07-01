1| // lib/data.ts — Content only. Styling comes from @/lib/brand.
2| import { HUB_COLORS, HUB_NAMES, type HubKey } from '@/lib/brand'
3| 
4| // ─── TYPES ───────────────────────────────────────────────────────────…
5| 
6| export type HubId = HubKey
7| 
8| export interface ServiceItem {
9|   name: string
10|   price: string
11|   requirements: string[]
12|   description?: string
13| }
14| 
15| export interface HubSection {
16|   title: string
17|   items: ServiceItem[]
18| }
19| 
20| export interface Hub {
21|   iconName: string
22|   iconColor: string
23|   title: string
24|   grad: string
25|   desc: string
26|   sections: HubSection[]
27|   previews: string[]
28|   tagStyle: { bg: string; color: string }
29|   tagStyleDark: { bg: string; color: string }
30| }
31| 
32| // ─── PRICING ──────────────────────────────────────────────────────────…
33| 
34| export const PRICING = {
35|   print: {
36|     'B&W Print': 'R5/page',
37|     'Colour Print': 'R8/page',
38|     'B&W Copy': 'R3/page',
39|     'Colour Copy': 'R5/page',
40|     'Glossy Photo (4x6)': 'R20',
41|     'Glossy Photo (A4)': 'R40'
42|   },
…
346|     ]
347|   },
348| 
349|   eservice: {
350|     iconName: 'Globe',
351|     iconColor: HUB_COLORS.eservice.light,
352|     title: HUB_NAMES.eservice,
353|     grad: HUB_COLORS.eservice.gradient,
354|     desc: `Government platforms made easy — we handle applications, updates, and registrations.`,
355|     tagStyle: { bg: HUB_COLORS.eservice.tagBg, color: HUB_COLORS.eservice.tagText },
356|     tagStyleDark: { bg: HUB_COLORS.eservice.tagBgDark, color: HUB_COLORS.eservice.tagTextDark },
357|     previews: ['SASSA', 'SARS', 'NSFAS', 'UIF', 'CSD'],
358|     sections: [
359|       {
360|         title: 'SASSA',
361|         items: [
362|           { name: 'Status Check', price: 'R20', description: `Check grant/application status.`, requirements: ['ID', 'Reference number'] },
363|           { name: 'Payment/Balance Check', price: 'R15', description: `Check payment status.`, requirements: ['ID', 'SASSA card details'] },
364|           { name: 'Update Details', price: 'R30', description: `Update SASSA profile information.`, requirements: ['ID', 'New details proof'] },
365|           { name: 'SRD Application', price: 'R40', description: `Apply for R350 SRD grant.`, requirements: ['ID', 'Phone number'] },
366|           { name: 'Reapplication', price: 'R40', description: `Reapply for declined/lapsed grant.`, requirements: ['ID', 'Previous record'] },
367|           { name: 'Appeal', price: 'R40', description: `Appeal rejected application.`, requirements: ['ID', 'Decline notice'] },
368|           { name: 'Banking Update', price: 'R40', description: `Update payment banking details.`, requirements: ['ID', 'Bank proof'] },
369|           { name: 'Grant Application', price: 'R80', description: `Apply for full SASSA grants.`, requirements: ['ID', 'Supporting docs'] }
370|         ]
371|       },
372|       {
373|         title: 'SARS',
374|         items: [
375|           { name: 'Enquiry / Updates', price: 'R50', description: `SARS account queries.`, requirements: ['ID', 'Tax number'] },
376|           { name: 'New Taxpayer / eFiling', price: 'R70', description: `Register on SARS system.`, requirements: ['ID', 'Proof of address'] },
377|           { name: 'Tax Pin / Penalty', price: 'R100', description: `PIN or penalty handling.`, requirements: ['ID', 'SARS notice'] },
378|           { name: 'Tax Clearance', price: 'R120', description: `Tax clearance certificate.`, requirements: ['ID', 'Tax number'] },
379|           { name: 'Pin Submission', price: 'R120', description: `Submit SARS PIN.`, requirements: ['ID', 'Reference'] },
380|           { name: 'Tax Return / VAT / PAYE', price: 'R200', description: `Full tax filing.`, requirements: ['Income docs', 'ID'] }
381|         ]
382|       },
383|       {
384|         title: 'PSIRA',
385|         items: [
386|           { name: 'Status Check', price: 'R30', description: `Check registration status.`, requirements: ['ID', 'PSIRA number'] },
387|           { name: 'Update / Certificate', price: 'R40', description: `Update details or certificate.`, requirements: ['ID', 'PSIRA number'] },
388|           { name: 'Lost Certificate', price: 'R50', description: `Replacement certificate.`, requirements: ['ID', 'Affidavit'] },
389|           { name: 'Renewal / Registration', price: 'R80', description: `New or renewal registration.`, requirements: ['ID', 'Training docs'] },
390|           { name: 'ID Application', price: 'R100', description: `PSIRA ID card application.`, requirements: ['ID', 'Photo'] }
391|         ]
392|       },
393|       {
394|         title: 'Online Applications',
395|         items: [
396|           { name: 'NSFAS Status Check', price: 'R20', description: `Check NSFAS status.`, requirements: ['ID'] },
397|           { name: 'NSFAS Banking Update', price: 'R20', description: `Update NSFAS banking.`, requirements: ['ID', 'Bank proof'] },
398|           { name: 'Learnership Application', price: 'R30', description: `Apply for learnerships.`, requirements: ['ID', 'CV'] },
399|           { name: 'Job / DPSA Application', price: 'R40', description: `Government job applications.`, requirements: ['ID', 'CV'] },
400|           { name: 'Bursary Application', price: 'R40', description: `Apply for bursaries.`, requirements: ['Academic docs'] },
401|           { name: 'NSFAS Appeal', price: 'R50', description: `Appeal NSFAS decision.`, requirements: ['ID', 'Letter'] },
402|           { name: 'NSFAS Application', price: 'R80', description: `Full NSFAS application.`, requirements: ['ID', 'School results'] },
403|           { name: 'University Application', price: 'R100', description: `Apply to universities.`, requirements: ['Matric results'] }
404|         ]
405|       },
406|       {
407|         title: 'Digital Services',
408|         items: [
409|           { name: 'Email Setup / Send / Receive', price: 'R15', description: `Email account setup and sending official documents.`, requirements: ['Email address', 'Recipient info'] },
410|           { name: 'Google Business Setup', price: 'R80', description: `Set up a Google Business Profile.`, requirements: ['Business details'] },
411|           { name: 'Social Media Setup', price: 'R60', description: `Create and configure social pages.`, requirements: ['Business name', 'Logo'] }
412|         ]
413|       },
414|       {
415|         title: 'UIF & Business Services',
416|         items: [
417|           { name: 'UIF Monthly Declaration', price: 'R100', description: `Monthly UIF filing.`, requirements: ['Employer info'] },
418|           { name: 'UIF Registration', price: 'R100', description: `Register UIF account.`, requirements: ['Company docs'] },
419|           { name: 'UIF Claims', price: 'R200', description: `File UIF claim.`, requirements: ['UI19', 'Bank details'] },
420|           { name: 'CSD Registration', price: 'R300', description: `Supplier database registration.`, requirements: ['CIPC docs'] },
421|           { name: 'CSD Update', price: 'R120', description: `Update supplier profile.`, requirements: ['Company info'] },
422|           { name: 'Good Standing Letter', price: 'R60', description: `CIPC compliance proof.`, requirements: ['Company number'] },
423|           { name: 'Google Business Setup', price: 'R80', description: `Google listing setup.`, requirements: ['Business info'] }
424|         ]
425|       }
426|     ]
427|   },
428| 
429| ...
