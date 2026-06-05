"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, X, CaretDown, WhatsappLogo, Printer, FileText, PaintBrush, Globe, Desktop, ChatCircle } from "@phosphor-icons/react"
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
  "System Cleaning": {
    desc: "We clean your laptop or PC — removing dust and applying new thermal paste for better performance.",
    waText: "Hi Apexbytes Hub! I need my system cleaned. Can I bring it in?",
  },
  "Upgrade (RAM/SSD)": {
    desc: "We upgrade your laptop or PC with more RAM or a faster SSD — making it feel like new.",
    waText: "Hi Apexbytes Hub! I'm interested in an upgrade. Can you give me a quote?",
  },
}

export function ServicesPage() {
  const router = useRouter()
  const [activeHub, setActiveHub] = useState<HubId>("Print Hub")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const { theme } = useTheme()

  const currentHub = HUBS.find(h => h.id === activeHub)!

  const handleNavigate = (path: string) => {
    router.push(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#081428] py-12 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-[#0F3F66] dark:text-[#A9D6F2] mb-4 tracking-tight">
            Our Hubs &amp; Services
          </h2>
          <p className="text-gray-600 dark:text-white/60 text-base md:text-lg max-w-2xl mx-auto">
            We've organised our 50+ services into five specialized hubs to help you find exactly what you need, fast.
          </p>
        </div>

        {/* Hub Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-12">
          {HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => {
                setActiveHub(hub.id)
                setSelectedService(null)
              }}
              className={cn(
                "flex flex-col items-center justify-center p-4 md:p-6 rounded-[24px] transition-all duration-300 border-2",
                activeHub === hub.id
                  ? "bg-white dark:bg-white/5 border-[#1E6FA8] dark:border-[#A9D6F2] shadow-lg scale-105 z-10"
                  : "bg-gray-50 dark:bg-white/5 border-transparent hover:border-gray-200 dark:hover:border-white/10 opacity-70 hover:opacity-100"
              )}
            >
              <div className="mb-3">
                <HubIcon name={hub.icon} color={activeHub === hub.id ? "#1E6FA8" : "#999999"} />
              </div>
              <span className={cn(
                "text-[0.7rem] md:text-xs font-black uppercase tracking-widest text-center",
                activeHub === hub.id ? "text-[#1E6FA8] dark:text-[#A9D6F2]" : "text-gray-500 dark:text-white/40"
              )}>
                {hub.id}
              </span>
            </button>
          ))}
        </div>

        {/* Services List for Active Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Service Grid Area */}
          <div className="lg:col-span-8">
            <div className="bg-gray-50 dark:bg-white/5 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                  <HubIcon name={currentHub.icon} color="#1E6FA8" size={24} />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-[#0F3F66] dark:text-white">
                  {currentHub.id} <span className="text-gray-400 dark:text-white/20 font-normal ml-2">— {currentHub.services.length} Services</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentHub.services.map((service) => (
                  <button
                    key={service}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-2xl text-left transition-all duration-200 border",
                      selectedService === service
                        ? "bg-[#1E6FA8] border-[#1E6FA8] text-white shadow-md"
                        : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-[#1E6FA8] dark:hover:border-[#A9D6F2]"
                    )}
                  >
                    <span className="font-bold text-sm md:text-base">{service}</span>
                    <CaretDown 
                      size={16} 
                      weight="bold" 
                      className={cn(
                        "transition-transform duration-300",
                        selectedService === service ? "rotate-180" : "-rotate-90 group-hover:translate-x-1"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Service Detail Area */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              {selectedService ? (
                <div className="bg-white dark:bg-white/5 rounded-[32px] p-8 border-2 border-[#1E6FA8] dark:border-[#A9D6F2] shadow-xl animate-fade-in">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#1E6FA8] dark:text-[#A9D6F2] bg-[#1E6FA8]/5 dark:bg-[#A9D6F2]/10 px-3 py-1 rounded-full">
                      {activeHub}
                    </span>
                    <button 
                      onClick={() => setSelectedService(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    >
                      <X size={20} weight="bold" />
                    </button>
                  </div>
                  
                  <h4 className="text-2xl font-black text-[#0F3F66] dark:text-white mb-4 leading-tight">
                    {selectedService}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-white/70 text-sm md:text-base leading-relaxed mb-8">
                    {SERVICE_INFO[selectedService]?.desc || "Professional service delivered with care and precision at Apexbytes Hub."}
                  </p>

                  <div className="space-y-4">
                    <a
                      href={`https://wa.me/27753338260?text=${encodeURIComponent(SERVICE_INFO[selectedService]?.waText || `Hi Apexbytes Hub! I'm interested in your ${selectedService} service.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#1EBB58] text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-95"
                    >
                      <WhatsappLogo weight="fill" size={22} />
                      Order via WhatsApp
                    </a>
                    
                    <button
                      onClick={() => handleNavigate("/contact")}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-[#0F3F66] dark:text-white rounded-2xl font-bold text-sm transition-all"
                    >
                      <ChatCircle weight="bold" size={18} />
                      Ask a Question
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-white/5 rounded-[32px] p-8 border border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <ArrowRight size={24} className="text-gray-300 dark:text-white/20" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-400 dark:text-white/30 mb-2">Select a Service</h4>
                  <p className="text-sm text-gray-400 dark:text-white/20">
                    Click on any service in the list to see more details and order via WhatsApp.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Navigation Callout */}
        <div className="mt-20 p-8 md:p-12 bg-[#0F3F66] rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black mb-2">Not sure which service you need?</h3>
            <p className="text-[#A9D6F2] opacity-80">We're here to help you figure it out. Just reach out to us.</p>
          </div>
          <button 
            onClick={() => handleNavigate("/contact")}
            className="px-10 py-4 bg-[#F4A261] hover:bg-[#D9894B] text-white rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            Contact Us Now
          </button>
        </div>

      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
