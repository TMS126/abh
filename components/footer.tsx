"use client"

import { useState } from "react"
import { 
  WhatsappLogo, 
  EnvelopeSimple, 
  MapPin, 
  Phone, 
  X, 
  Printer, 
  FileText, 
  Palette, 
  Globe, 
  Cpu, 
  Receipt,
  Info,
  Heart
} from "@phosphor-icons/react"

interface FooterProps {
  onNavigate: (page: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const [isTermsOpen, setIsTermsOpen] = useState(false)

  const pages = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About Us" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
  ]

  return (
    <footer className="bg-[#0F3F66] text-white px-4 md:px-8 py-10 md:py-12 relative font-sans">
      {/* Dynamic Scoped Keyframes for smooth backdrop-blur animation */}
      <style jsx global>{`
        @keyframes customFadeIn {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-modal-fade {
          animation: customFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

        {/* Brand */}
        <div>
          <h3 className="font-black text-xl md:text-2xl mb-2 tracking-tight">
            Apexbytes<span className="text-[#F4A261]">Hub</span>
          </h3>
          <p className="text-[#A9D6F2] text-[0.83rem] leading-relaxed">
            Your local tech and print partner in Kgotsong. Five hubs, 50+ services — all in one friendly place.[span_0](start_span)[span_0](end_span)
          </p>
        </div>

        {/* Pages */}
        <div>
          <h4 className="font-bold text-[0.85rem] text-[#F4A261] mb-4 tracking-wider uppercase">
            Pages
          </h4>
          <ul className="flex flex-col gap-2">
            {pages.map((page) => (
              <li
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className="text-[#A9D6F2] text-[0.83rem] cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {page.label}[span_1](start_span)[span_1](end_span)
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-[0.85rem] text-[#F4A261] mb-4 tracking-wider uppercase">
            Contact
          </h4>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="https://wa.me/27753338260"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#A9D6F2] text-[0.83rem] hover:text-white transition-colors duration-200 no-underline"
              >
                <WhatsappLogo weight="fill" className="w-4 h-4 text-[#25D366] shrink-0" />
                075 333 8260[span_2](start_span)[span_2](end_span)
              </a>
            </li>
            <li>
              <a
                href="tel:+27753338260"
                className="flex items-center gap-2 text-[#A9D6F2] text-[0.83rem] hover:text-white transition-colors duration-200 no-underline"
              >
                <Phone weight="fill" className="w-4 h-4 text-[#1E6FA8] shrink-0" />
                075 333 8260[span_3](start_span)[span_3](end_span)
              </a>
            </li>
            <li>
              <a
                href="mailto:apexbytesza@gmail.com"
                className="flex items-center gap-2 text-[#A9D6F2] text-[0.83rem] hover:text-white transition-colors duration-200 no-underline"
              >
                <EnvelopeSimple weight="fill" className="w-4 h-4 text-[#D9894B] shrink-0" />
                apexbytesza@gmail.com[span_4](start_span)[span_4](end_span)
              </a>
            </li>
            <li className="flex items-start gap-2 text-[#A9D6F2] text-[0.83rem]">
              <MapPin weight="fill" className="w-4 h-4 text-[#6FBF1A] shrink-0 mt-0.5" />
              5878 Mpumalanga Section, Kgotsong, Bothaville, 9660[span_5](start_span)[span_5](end_span)
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1080px] mx-auto border-t border-white/10 pt-5 flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
        <p className="text-[#A9D6F2] text-[0.78rem]">
          © 2026 ApexbytesHub. All rights reserved.[span_6](start_span)[span_6](end_span)
          <span className="mx-2">|</span>
          <button 
            onClick={() => setIsTermsOpen(true)}
            className="underline text-[#F4A261] hover:text-white transition-colors font-bold focus:outline-none"
          >
            Terms &amp; Policies
          </button>
        </p>
        <p className="text-[#A9D6F2] text-[0.78rem] inline-flex items-center gap-1">
          Made with <Heart weight="fill" className="w-3.5 h-3.5 text-red-500 inline" /> for the Kgotsong community
        </p>
      </div>

      {/* ── INTERACTIVE TERMS & POLICIES MODAL OVERLAY ── */}
      {isTermsOpen && (
        <div 
          onClick={() => setIsTermsOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 w-full max-w-2xl rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-modal-fade"
          >
            {/* Top Header Block */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <div>
                <h3 className="font-black text-lg text-[#1E6FA8] dark:text-[#A9D6F2]">
                  Terms &amp; Service Policies
                </h3>
                <p className="text-[0.7rem] text-zinc-500 dark:text-zinc-400 mt-0.5">Apexbytes Hub • Full Service Rules</p>
              </div>
              <button 
                onClick={() => setIsTermsOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Scrollable Policy Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-[0.82rem] md:text-sm leading-relaxed">
              
              {/* 1. OPERATIONAL RULE */}
              <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#F4A261] flex items-center gap-2">
                  <Info weight="fill" className="w-4 h-4" /> ApexbytesHub Operational Rule
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 text-[0.8rem] md:text-[0.85rem]">
                  Apexbytes Hub operates as a premium, home-based digital service and design studio in Kgotsong, Bothaville. By starting any order sequence or sending us a message through our automated WhatsApp channels, you confirm that you fully agree to and align with all our operational rules and terms listed below.
                </p>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* 2. PRINT HUB */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#1E6FA8] dark:text-[#A9D6F2] flex items-center gap-2">
                  <Printer weight="fill" className="w-4 h-4" /> Print Hub – Everything Paper
                </h4>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 list-disc list-inside pl-1">
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Printing Services:</strong> Black &amp; White, Colour, and Bulk printing are done to high quality standards. For bulk printing discounts, your entire order track must be submitted together. You must confirm your digital layout before we push large print runs.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Copying Services:</strong> Fast, clear photocopying for all your official layout documents. Please make sure to check your printed pages for completeness before leaving the shop.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Photo Printing:</strong> Glossy photo printing in standard 4x6 and A4 sizes. Please send high-resolution digital files through WhatsApp to avoid any blurry prints.</li>
                </ul>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* 3. DOCUMENT HUB */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#1E6FA8] dark:text-[#A9D6F2] flex items-center gap-2">
                  <FileText weight="fill" className="w-4 h-4" /> Document Hub – All Document Work
                </h4>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 list-disc list-inside pl-1">
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Document Assistance:</strong> Full CV creation, custom typing, text editing, and application page formatting. You are responsible for ensuring that all structural text and certification info you provide is correct.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Scanning Services:</strong> Turning physical papers into clean digital files sent straight to your device.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Laminating Services:</strong> Durable A5, A4, and A3 hot laminating for protection. Please collect your laminated items promptly. We hold digital file records safely for only 30 days before secure deletion.</li>
                </ul>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* 4. DESIGN HUB */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#1E6FA8] dark:text-[#A9D6F2] flex items-center gap-2">
                  <Palette weight="fill" className="w-4 h-4" /> Design Hub – Creative Work
                </h4>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 list-disc list-inside pl-1">
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Branding Design:</strong> Professional logo creation and business card vector layouts engineered exclusively inside Adobe Illustrator. No cheap generic templates used.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Marketing &amp; Events:</strong> Custom flyers, local posters, social media banners, invitations, and public announcements. Every design brief includes two rounds of small adjustments. Major layout redesigns outside the original plan will count as a new job. Intellectual rights unlock completely upon finalized payment setup.</li>
                </ul>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* 5. E-SERVICE HUB */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#1E6FA8] dark:text-[#A9D6F2] flex items-center gap-2">
                  <Globe weight="fill" className="w-4 h-4" /> e-Service Hub – External Systems
                </h4>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 list-disc list-inside pl-1">
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Government Services &amp; Online Applications:</strong> Admin help for filling out forms and submissions across official portals (SARS, SASSA, CSD, PSIRA, UIF, etc.). We manage your submissions fast, but Apexbytes Hub is not responsible for external government portal network downtime.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">SASSA Status Checks:</strong> Fixed at R20 per verification lookup. This fee covers our administrative labor to log into the portal, track the file, and print your official reference slip. The R20 fee is payable immediately upon execution, regardless of the system outcome.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Email Services:</strong> Fast assistance with setting up new personal email profiles, writing out formal messages, and sending or receiving official documents.</li>
                </ul>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* 6. TECH HUB */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#1E6FA8] dark:text-[#A9D6F2] flex items-center gap-2">
                  <Cpu weight="fill" className="w-4 h-4" /> Tech Hub – Computer Work
                </h4>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 list-disc list-inside pl-1">
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Software &amp; Hardware Assistance:</strong> Safe installation of desktop programs, basic operating updates, and physical hardware or home printer connections.</li>
                  <li><strong className="text-zinc-900 dark:text-zinc-100">Troubleshooting &amp; Support:</strong> Virus removals, performance tune-ups, and structural computer optimizations. Please ensure you back up your critical documents and family photos before we handle performance work. We are not liable for data loss on previously corrupted hardware.</li>
                </ul>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* 7. BUSINESS ADMINISTRATION */}
              <div className="space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-[#F4A261] flex items-center gap-2">
                  <Receipt weight="fill" className="w-4 h-4" /> Business Administration &amp; Essentials
                </h4>
                <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 list-disc list-inside pl-1">
                  <li><span className="font-bold text-zinc-900 dark:text-zinc-100">Turnaround Metrics:</span> Basic printing, photocopying work, and portal verifications are generally finished same-day. Custom graphics engineering, text layout typing, and complex multi-page CV packages require 24 to 48 hours for precise vector alignment.</li>
                  <li><span className="font-bold text-zinc-900 dark:text-zinc-100">Order Process &amp; WhatsApp Rule:</span> Hit any service category button across our platform to launch a pre-filled template message straight into our active chat thread. Send all reference layout files and raw copy text clearly within that channel.</li>
                  <li><span className="font-bold text-zinc-900 dark:text-zinc-100">Payment &amp; Studio Delivery:</span> Immediate administrative lookups and small printing batches operate on cash-on-delivery. High-volume print jobs or custom brand identity design suites require an authorization deposit before processing begins. Physical collection happens directly at our designated home collection point in Mpumalanga Section, Kgotsong, Bothaville.</li>
                </ul>
              </div>

            </div>

            {/* Bottom Dismiss Footer Area */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
              <button 
                onClick={() => setIsTermsOpen(false)}
                className="px-5 py-2 font-bold text-xs bg-[#1E6FA8] text-white hover:bg-[#15537D] rounded-full transition-colors"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
