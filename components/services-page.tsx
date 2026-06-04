"use client"

import { useState } from "react"
import { ArrowRight, X, ChevronDown, WhatsappLogo, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { HUBS, type HubId } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

// ─── Hub icon renderer ───────────────────────────────────────────────────────

function HubIcon({ name, color, size = 32 }: { name: string; color: string; size?: number }) {
  const props = { size, color, weight: "fill" as const }
  switch (name) {
    case 'Printer': return <Printer {...props} />
    case 'FileText': return <FileText {...props} />
    case 'PaintBrush': return <PaintBrush {...props} />
    case 'Globe': return <Globe {...props} />
    case 'Desktop': return <Desktop {...props} />
    default: return null
  }
}

// ─── Service descriptions + WApp sample texts ───────────────────────────────

const SERVICE_INFO: Record<string, { desc: string; waText: string }> = {
  "Black & White": {
    desc: "Standard single-sided black & white printing on A4 80gsm paper.",
    waText: "Hi Apexbytes Hub! I need Black & White Printing. How many pages can I bring?",
  },
  "Colour": {
    desc: "Vibrant full-colour printing on A4 paper — great for forms, certificates and anything that needs to stand out.",
    waText: "Hi Apexbytes Hub! I need Colour Printing. How do I proceed?",
  },
  "4x6 Glossy": {
    desc: "High-quality glossy photo print at standard 4x6 size — ideal for portraits, memories and keepsakes.",
    waText: "Hi Apexbytes Hub! I'd like to print 4x6 Glossy Photos. What format should I send my images in?",
  },
  "A4 Glossy": {
    desc: "Large glossy photo print on A4 — perfect for framing, events or professional display.",
    waText: "Hi Apexbytes Hub! I need an A4 Glossy Photo Print. How do I send you my image?",
  },
  "CV from Scratch": {
    desc: "We build your CV from zero — professional layout, your details, ready to send to employers.",
    waText: "Hi Apexbytes Hub! I need a new CV created from scratch. What info do I need to bring?",
  },
  "CV Upgrade/Fix": {
    desc: "We update or improve your existing CV — better layout, corrected content, job-ready.",
    waText: "Hi Apexbytes Hub! I need my existing CV upgraded. Can I WhatsApp it to you?",
  },
  "Cover Letter": {
    desc: "A professional cover letter tailored to the job you're applying for.",
    waText: "Hi Apexbytes Hub! I need a cover letter written. Can you help?",
  },
  "Affidavit / Letter": {
    desc: "We type your affidavit or formal letter — ready for signing or submission.",
    waText: "Hi Apexbytes Hub! I need an affidavit or letter typed. Can you help?",
  },
  "Scan to Digital": {
    desc: "We scan your physical document and send it to you as a PDF or JPG.",
    waText: "Hi Apexbytes Hub! I need documents scanned to digital. How many pages can I bring?",
  },
  "A5": {
    desc: "Laminate your A5 document or card for protection and a professional finish.",
    waText: "Hi Apexbytes Hub! I need an A5 document laminated. Can I come in today?",
  },
  "A4": {
    desc: "Laminate your A4 document for long-lasting protection — great for certificates and IDs.",
    waText: "Hi Apexbytes Hub! I need an A4 document laminated. Can I come in today?",
  },
  "A3": {
    desc: "Laminate your A3 poster or document — durable, clean and professional.",
    waText: "Hi Apexbytes Hub! I need an A3 document laminated. Are you available today?",
  },
  "Basic Logo": {
    desc: "A clean, simple logo — one concept, two revisions, delivered as PNG/PDF.",
    waText: "Hi Apexbytes Hub! I need a Basic Logo designed. What info do you need from me?",
  },
  "Standard Logo": {
    desc: "A polished logo with more detail — includes multiple formats and a revision round.",
    waText: "Hi Apexbytes Hub! I'm interested in a Standard Logo. How do we start?",
  },
  "Premium Logo": {
    desc: "Full brand-ready logo — multiple concepts, colour variants, all file formats included.",
    waText: "Hi Apexbytes Hub! I want a Premium Logo for my brand. Can we discuss?",
  },
  "Single Side": {
    desc: "Business card design for one side — your name, number, and brand, print-ready.",
    waText: "Hi Apexbytes Hub! I need a single-sided business card designed. What details do I send?",
  },
  "Double Side": {
    desc: "Business card designed on both sides — more info, more impact.",
    waText: "Hi Apexbytes Hub! I need a double-sided business card designed. Can you help?",
  },
  "Simple": {
    desc: "A clean, straightforward flyer or poster with your text and basic layout.",
    waText: "Hi Apexbytes Hub! I need a simple flyer/poster designed. What do I send you?",
  },
  "Custom": {
    desc: "A fully customised flyer or poster with your brand colours, images and layout.",
    waText: "Hi Apexbytes Hub! I need a custom flyer/poster. Can we discuss the design?",
  },
  "Complex": {
    desc: "A detailed, premium design — multiple elements, high visual impact, print or digital ready.",
    waText: "Hi Apexbytes Hub! I need a complex flyer/poster design. How do we start?",
  },
  "Post": {
    desc: "A single branded social media post — sized and ready for Facebook, Instagram or WhatsApp.",
    waText: "Hi Apexbytes Hub! I need a social media post designed. What info do I send?",
  },
  "Post + Story": {
    desc: "A matching post and story set — consistent look across your social platforms.",
    waText: "Hi Apexbytes Hub! I need a social media Post + Story designed. Can you help?",
  },
  "Image/Static": {
    desc: "A beautifully designed static invitation image — for weddings, birthdays, graduations and more.",
    waText: "Hi Apexbytes Hub! I need a static invitation designed. What details do I send you?",
  },
  "Video": {
    desc: "An animated video invitation — eye-catching, shareable, perfect for WhatsApp and social media.",
    waText: "Hi Apexbytes Hub! I need a video invitation designed. How do we start?",
  },
  "While Busy": {
    desc: "One revision while the project is still in progress — small tweaks before final delivery.",
    waText: "Hi Apexbytes Hub! I'd like to request a revision on my current design project.",
  },
  "After Completion": {
    desc: "A revision after the final file has been delivered — changes to an already completed design.",
    waText: "Hi Apexbytes Hub! I need a revision on a completed design. Can you assist?",
  },
  "Status Check": {
    desc: "We check your SASSA application or grant status online on your behalf.",
    waText: "Hi Apexbytes Hub! I need my SASSA status checked. Can I come in?",
  },
  "Payment/Balance Check": {
    desc: "We check when your next SASSA payment is due or confirm your balance.",
    waText: "Hi Apexbytes Hub! I need to check my SASSA payment date or balance.",
  },
  "Update Details": {
    desc: "We update your personal or contact details on your SASSA profile.",
    waText: "Hi Apexbytes Hub! I need to update my SASSA details. Can you assist?",
  },
  "Reapplication": {
    desc: "We reapply for your SASSA grant after a rejection or lapse.",
    waText: "Hi Apexbytes Hub! I need to reapply for my SASSA grant. Can you help?",
  },
  "SRD Application": {
    desc: "We apply for the SASSA R370 Social Relief of Distress grant on your behalf.",
    waText: "Hi Apexbytes Hub! I need to apply for the SASSA SRD grant. What do I bring?",
  },
  "Appeal": {
    desc: "We submit a formal appeal if your SASSA application was declined.",
    waText: "Hi Apexbytes Hub! I need to appeal my SASSA rejection. Can you assist?",
  },
  "Banking Update": {
    desc: "We update your banking details on SASSA so your grant pays to the right account.",
    waText: "Hi Apexbytes Hub! I need to update my banking details on SASSA. What do I bring?",
  },
  "Grant Application": {
    desc: "We apply for a SASSA grant on your behalf — child support, disability, old age and more.",
    waText: "Hi Apexbytes Hub! I need to apply for a SASSA grant. Which documents do I need?",
  },
  "Enquiry / Statement": {
    desc: "We log into SARS eFiling and retrieve your account statement or answer your tax enquiry.",
    waText: "Hi Apexbytes Hub! I need a SARS enquiry or statement. Can you assist?",
  },
  "New Taxpayer / eFiling": {
    desc: "We register you as a new taxpayer or set up your SARS eFiling account.",
    waText: "Hi Apexbytes Hub! I need to register for SARS or set up eFiling. What do I bring?",
  },
  "Tax Pin / Penalty": {
    desc: "We retrieve your tax compliance PIN or submit a penalty remission request.",
    waText: "Hi Apexbytes Hub! I need help with my SARS Tax Pin or a penalty. Can you assist?",
  },
  "Tax Clearance": {
    desc: "We apply for your SARS Tax Clearance Certificate — needed for tenders, jobs and travel.",
    waText: "Hi Apexbytes Hub! I need a SARS Tax Clearance Certificate. What do I bring?",
  },
  "Tax Return / VAT / PAYE": {
    desc: "We file your annual tax return (ITR12), VAT or PAYE submission on SARS eFiling.",
    waText: "Hi Apexbytes Hub! I need help filing my SARS Tax Return / VAT / PAYE. Can you assist?",
  },
  "Pin Submission": {
    desc: "We submit your SARS compliance pin as part of a tender, contract or verification process.",
    waText: "Hi Apexbytes Hub! I need a SARS Pin Submission done. Can you help?",
  },
  "PSIRA Status Check": {
    desc: "We check your PSIRA registration status — confirm if you're active and compliant.",
    waText: "Hi Apexbytes Hub! I need my PSIRA status checked. Can I come in?",
  },
  "Update / Certificate": {
    desc: "We update your PSIRA details or help you obtain your registration certificate.",
    waText: "Hi Apexbytes Hub! I need my PSIRA details updated or a certificate. Can you assist?",
  },
  "Lost Certificate": {
    desc: "We apply for a replacement PSIRA certificate if yours has been lost or damaged.",
    waText: "Hi Apexbytes Hub! I lost my PSIRA certificate and need a replacement. Can you help?",
  },
  "Renewal / New Registration": {
    desc: "We renew your PSIRA registration or register you fresh as a new security officer.",
    waText: "Hi Apexbytes Hub! I need my PSIRA renewed or a new registration. What do I bring?",
  },
  "ID Application": {
    desc: "We assist with your PSIRA ID card application — submitted through the official portal.",
    waText: "Hi Apexbytes Hub! I need to apply for a PSIRA ID card. Can you assist?",
  },
  "NSFAS Status Check": {
    desc: "We check your NSFAS application or funding status on the NSFAS portal.",
    waText: "Hi Apexbytes Hub! I need my NSFAS status checked. Can I come in?",
  },
  "NSFAS Banking Update": {
    desc: "We update your banking details on the NSFAS system so your allowance pays correctly.",
    waText: "Hi Apexbytes Hub! I need to update my NSFAS banking details. What do I bring?",
  },
  "Learnership Application": {
    desc: "We find and apply for a learnership programme that matches your qualifications.",
    waText: "Hi Apexbytes Hub! I need help applying for a learnership. Can you assist?",
  },
  "Job / DPSA Application": {
    desc: "We apply for a government job on your behalf via DPSA or other job portals.",
    waText: "Hi Apexbytes Hub! I need help applying for a government job. Can you assist?",
  },
  "Bursary Application": {
    desc: "We find and apply for a bursary that suits your field of study.",
    waText: "Hi Apexbytes Hub! I need help applying for a bursary. Can you assist?",
  },
  "NSFAS Appeal": {
    desc: "We submit an NSFAS appeal if your application was rejected or funding was withdrawn.",
    waText: "Hi Apexbytes Hub! I need to appeal my NSFAS decision. Can you help?",
  },
  "NSFAS Application": {
    desc: "We complete and submit your NSFAS application for university or TVET college funding.",
    waText: "Hi Apexbytes Hub! I need to apply for NSFAS. What documents do I bring?",
  },
  "University Application": {
    desc: "We apply to a university of your choice on your behalf — fully completed and submitted.",
    waText: "Hi Apexbytes Hub! I need help applying to a university. Can you assist?",
  },
  "Setup / Send / Receive": {
    desc: "We set up your email account or help you send and receive important emails.",
    waText: "Hi Apexbytes Hub! I need help with email setup or sending/receiving emails. Can I come in?",
  },
  "Good Standing Letter": {
    desc: "We apply for your CIPC Letter of Good Standing — required for tenders and contracts.",
    waText: "Hi Apexbytes Hub! I need a Letter of Good Standing. Can you assist?",
  },
  "Google Business Setup": {
    desc: "We create and verify your Google Business Profile so customers can find you on Google Maps.",
    waText: "Hi Apexbytes Hub! I need a Google Business Profile set up. Can you help?",
  },
  "UIF Monthly Declaration": {
    desc: "We submit your monthly UIF employer declaration on uFiling on your behalf.",
    waText: "Hi Apexbytes Hub! I need help with my monthly UIF declaration. Can you assist?",
  },
  "CSD Update": {
    desc: "We update your business details on the Central Supplier Database.",
    waText: "Hi Apexbytes Hub! I need my CSD profile updated. What do I bring?",
  },
  "UIF Registration": {
    desc: "We register you or your business for UIF on the Department of Labour portal.",
    waText: "Hi Apexbytes Hub! I need to register for UIF. What documents do I need?",
  },
  "UIF Claims": {
    desc: "We submit your UIF unemployment, maternity or illness claim on your behalf.",
    waText: "Hi Apexbytes Hub! I need to claim from UIF. Can you assist me?",
  },
  "CSD Registration": {
    desc: "We register your business on the Central Supplier Database — required for government tenders.",
    waText: "Hi Apexbytes Hub! I need to register on the CSD. What documents do I bring?",
  },
  "Social Media Setup": {
    desc: "We create your Facebook, Instagram or TikTok business page — ready to post.",
    waText: "Hi Apexbytes Hub! I need a social media account set up for my business. Can you help?",
  },
  "Learner's Licence Booking": {
    desc: "We book your learner's licence test at the DLTC on the eNaTIS system.",
    waText: "Hi Apexbytes Hub! I need to book my learner's licence test. Can you assist?",
  },
  "WhatsApp Business Setup": {
    desc: "We set up your WhatsApp Business profile with your business name, hours and catalogue.",
    waText: "Hi Apexbytes Hub! I need my WhatsApp Business set up. Can you help?",
  },
  "Software Install": {
    desc: "We install any software or application you need on your laptop or PC.",
    waText: "Hi Apexbytes Hub! I need software installed on my device. Can I bring it in?",
  },
  "Driver Installation": {
    desc: "We find and install the correct drivers for your printer, sound, display or other hardware.",
    waText: "Hi Apexbytes Hub! I need drivers installed on my PC. Can I bring it in?",
  },
  "App / Office Updates": {
    desc: "We update your apps or Microsoft Office to the latest version.",
    waText: "Hi Apexbytes Hub! I need my apps or Office updated. Can I bring my device?",
  },
  "Printer Setup": {
    desc: "We set up your printer — install drivers, connect to your PC or laptop, and test print.",
    waText: "Hi Apexbytes Hub! I need my printer set up. Can I bring it in?",
  },
  "PC Setup": {
    desc: "We unbox, assemble and configure your new PC or laptop — ready to use out of the box.",
    waText: "Hi Apexbytes Hub! I need my PC set up. Can I bring it in?",
  },
  "Troubleshooting": {
    desc: "We diagnose and fix whatever issue your device has — billed per hour.",
    waText: "Hi Apexbytes Hub! I need help troubleshooting my device. Can I bring it in?",
  },
  "PC Cleanup": {
    desc: "We clean up your PC — remove junk files, fix startup, and make it run faster.",
    waText: "Hi Apexbytes Hub! I need my PC cleaned up and optimised. Can I bring it in?",
  },
  "Virus / Malware Removal": {
    desc: "We scan and remove viruses, malware and unwanted programs from your device.",
    waText: "Hi Apexbytes Hub! I think my PC has a virus. Can I bring it in for removal?",
  },
  "OS Update": {
    desc: "We run a full Windows OS update — keeping your system secure and up to date.",
    waText: "Hi Apexbytes Hub! I need my Windows updated. Can I bring my device in?",
  },
  "Windows Install (No Activation)": {
    desc: "We do a clean Windows installation without activation — your licence key needed separately.",
    waText: "Hi Apexbytes Hub! I need Windows installed on my PC. Can I bring it in?",
  },
  "Windows Install + Activation": {
    desc: "We install and fully activate Windows — your PC is licensed and ready to use.",
    waText: "Hi Apexbytes Hub! I need Windows installed and activated. Can I bring my PC in?",
  },
  "Activation Only": {
    desc: "We activate your existing Windows installation using a valid licence key.",
    waText: "Hi Apexbytes Hub! I need my Windows activated. Can I bring my device in?",
  },
  "Microsoft 365 Setup": {
    desc: "We set up Microsoft 365 on your device — Word, Excel, Outlook and more, ready to use.",
    waText: "Hi Apexbytes Hub! I need Microsoft 365 set up on my device. Can I bring it in?",
  },
}

// ─── Sub-service detail modal ────────────────────────────────────────────────

interface SubServiceModalProps {
  name: string
  price: string
  tagStyle: { bg: string; color: string }
  hubGrad: string
  onClose: () => void
}

function SubServiceModal({ name, price, tagStyle, hubGrad, onClose }: SubServiceModalProps) {
  const info = SERVICE_INFO[name] ?? {
    desc: "Professional service provided at Apexbytes Hub.",
    waText: `Hi Apexbytes Hub! I need help with ${name}. Can you assist?`,
  }
  const waUrl = `https://wa.me/27753338260?text=${encodeURIComponent(info.waText)}`

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-card rounded-[20px] max-w-[340px] w-full shadow-[0_24px_60px_rgba(0,0,0,0.4)] animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
        <div className="h-[6px] w-full" style={{ background: hubGrad }} />
        <div className="px-5 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-[28px] h-[28px] rounded-full bg-secondary flex items-center justify-center hover:bg-muted active:scale-90 transition-all duration-200"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <span
            className="inline-block px-3 py-1 rounded-2xl text-[0.75rem] font-bold font-sans mb-3"
            style={{ background: tagStyle.bg, color: tagStyle.color }}
          >
            {name}
          </span>
          <p className="text-foreground text-[0.88rem] leading-relaxed mb-4">{info.desc}</p>
          <p className="text-[1rem] font-black font-sans mb-4" style={{ color: tagStyle.color }}>{price}</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-[11px] font-sans font-extrabold text-[0.88rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5"
          >
            <WhatsappLogo weight="fill" className="w-5 h-5" /> WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Hub service modal ────────────────────────────────────────────────────────

interface ServiceModalProps {
  hubId: HubId | null
  onClose: () => void
  onNavigateContact: () => void
}

export function ServiceModal({ hubId, onClose, onNavigateContact }: ServiceModalProps) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0)
  const [subService, setSubService] = useState<{ name: string; price: string } | null>(null)
  const { theme } = useTheme()

  if (!hubId) return null

  const hub = HUBS[hubId]
  const isDark = theme === 'dark'
  const tagStyle = isDark ? hub.tagStyleDark : hub.tagStyle

  return (
    <>
      <div
        className="fixed inset-0 z-[99998] flex items-center justify-center p-4 md:p-6"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="absolute inset-0 backdrop-blur-[16px] backdrop-brightness-[0.38] backdrop-saturate-50 bg-[rgba(8,20,40,0.6)]"
          onClick={onClose}
        />
        <div className="relative z-10 bg-card rounded-[24px] max-w-[560px] w-full max-h-[88vh] overflow-hidden flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.45)] animate-in zoom-in-95 fade-in duration-300">
          <div className="px-6 md:px-8 py-5 md:py-6 relative shrink-0" style={{ background: hub.grad }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-[34px] h-[34px] rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/35 active:scale-90 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mb-2">
              <HubIcon name={hub.iconName} color={hub.iconColor} size={36} />
            </div>
            <h2 className="font-sans font-black text-xl md:text-2xl text-white">{hub.title}</h2>
          </div>

          <div className="px-5 md:px-7 py-5 overflow-y-auto flex-1">
            <p className="text-muted-foreground text-[0.88rem] leading-relaxed mb-5 pb-4 border-b border-border">
              {hub.desc}
            </p>

            <div className="space-y-2">
              {hub.sections.map((section, idx) => (
                <div key={idx} className="border border-border rounded-[13px] overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-secondary hover:bg-muted active:scale-[0.99] transition-all duration-200 ease-in-out cursor-pointer select-none"
                  >
                    <span className="font-sans font-extrabold text-[0.88rem] text-foreground">{section.title}</span>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", openAccordion === idx && "rotate-180")} />
                  </button>
                  <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", openAccordion === idx ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                    <div className="px-4 py-3 bg-background">
                      <p className="text-[0.73rem] text-muted-foreground mb-2 italic">Tap a service to see details & price</p>
                      <div className="flex flex-wrap gap-1.5">
                        {section.items.map((item, itemIdx) => (
                          <button
                            key={itemIdx}
                            onClick={() => setSubService({ name: item.name, price: item.price })}
                            className="inline-flex items-center px-3 py-1.5 rounded-2xl text-[0.76rem] font-semibold font-sans cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:scale-95"
                            style={{ background: tagStyle.bg, color: tagStyle.color }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-border">
              <a
                href="https://wa.me/27753338260"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-sans font-extrabold text-[0.88rem] bg-wa-green text-white hover:bg-[#1ebe5a] active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5"
              >
                <WhatsappLogo weight="fill" className="w-5 h-5" /> WhatsApp Us
              </a>
              <button
                onClick={() => { onClose(); onNavigateContact() }}
                className="flex-1 text-center py-3 px-4 rounded-xl font-sans font-extrabold text-[0.88rem] bg-secondary text-blue-1 border-2 border-blue-4 hover:bg-blue-4 active:scale-95 transition-all duration-200 ease-in-out hover:-translate-y-0.5"
              >
                Send Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>

      {subService && (
        <SubServiceModal
          name={subService.name}
          price={subService.price}
          tagStyle={tagStyle}
          hubGrad={hub.grad}
          onClose={() => setSubService(null)}
        />
      )}
    </>
  )
}

// ─── Hub card ────────────────────────────────────────────────────────────────

interface HubCardProps {
  hubId: HubId
  onSelect: (id: HubId) => void
}

function HubCard({ hubId, onSelect }: HubCardProps) {
  const hub = HUBS[hubId]
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const tagStyle = isDark ? hub.tagStyleDark : hub.tagStyle

  return (
    <div
      onClick={() => onSelect(hubId)}
      className="bg-card rounded-[22px] shadow-[var(--shadow)] border-2 border-[var(--card-border)] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(30,111,168,0.18)] active:scale-[0.98]"
    >
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: hub.grad }}>
        <HubIcon name={hub.iconName} color={hub.iconColor} size={28} />
        <h3 className="font-sans font-black text-lg text-white">{hub.title}</h3>
        <span className="ml-auto w-[30px] h-[30px] bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowRight weight="bold" className="w-4 h-4 text-white" />
        </span>
      </div>
      <div className="px-5 py-4 flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {hub.previews.map((preview) => (
            <span
              key={preview}
              className="inline-block px-3 py-1 rounded-[14px] text-[0.73rem] font-bold font-sans"
              style={{ background: tagStyle.bg, color: tagStyle.color }}
            >
              {preview}
            </span>
          ))}
        </div>
        <p className="text-[0.8rem] text-muted-foreground italic">Tap to see prices & full list...</p>
      </div>
    </div>
  )
}

// ─── Services page ────────────────────────────────────────────────────────────

interface ServicesPageProps {
  onNavigate: (page: string) => void
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const [selectedHub, setSelectedHub] = useState<HubId | null>(null)

  return (
    <>
      <div className="animate-fade-up">
        <section className="bg-gradient-to-br from-blue-3 via-blue-1 to-[#2980b9] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
          <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.2)_0%,transparent_70%)] rounded-full" />
          <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">Our Services</h1>
          <p className="text-blue-4 text-base mt-2 relative z-10">Five hubs, one place — tap any card to explore prices</p>
        </section>

        <section className="px-4 md:px-8 py-12 md:py-16">
          <div className="max-w-[680px] mx-auto mb-8 md:mb-10 text-center">
            <p className="text-muted-foreground text-[0.95rem] leading-relaxed">
              Tap any hub card to explore all services. Tap a service to see its description and price.
            </p>
          </div>
          <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {(Object.keys(HUBS) as HubId[]).map((hubId) => (
              <HubCard key={hubId} hubId={hubId} onSelect={setSelectedHub} />
            ))}
          </div>
        </section>
      </div>

      {selectedHub && (
        <ServiceModal
          hubId={selectedHub}
          onClose={() => setSelectedHub(null)}
          onNavigateContact={() => onNavigate("contact")}
        />
      )}
    </>
  )
}
