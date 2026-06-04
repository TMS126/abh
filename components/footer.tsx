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
    <footer className="bg-[var(--footer-bg)] text-white px-4 md:px-8 py-10 md:py-12 transition-colors duration-300 relative">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

        {/* Brand */}
        <div>
          <h3 className="font-sans font-black text-xl md:text-2xl mb-2">
            Apexbytes<span className="text-[#F4A261]">Hub</span>
          </h3>
          <p className="text-blue-4 text-[0.83rem] leading-relaxed">
            Your local tech and print partner in Kgotsong. Five hubs, 50+ services — all in one friendly place.[span_0](start_span)[span_0](end_span)
          </p>
        </div>

        {/* Pages */}
        <div>
          <h4 className="font-sans font-bold text-[0.85rem] text-orange-4 mb-4 tracking-wider uppercase">
            Pages
          </h4>
          <ul className="flex flex-col gap-2">
            {pages.map((page) => (
              <li
                key={page.id}
                onClick={() => onNavigate(page.id)}
                className="text-blue-4 text-[0.83rem] cursor-pointer transition-colors duration-200 hover:text-white"
              >
                {page.label}[span_1](start_span)[span_1](end_span)
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-sans font-bold text-[0.85rem] text-orange-4 mb-4 tracking-wider uppercase">
            Contact
          </h4>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="https://wa.me/27753338260"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-4 text-[0.83rem] hover:text-white transition-colors duration-200 no-underline"
              >
                <WhatsappLogo weight="fill" className="w-4 h-4 text-[#25D366] shrink-0" />
                075 333 8260[span_2](start_span)[span_2](end_span)
              </a>
            </li>
            <li>
              <a
                href="tel:+27753338260"
                className="flex items-center gap-2 text-blue-4 text-[0.83rem] hover:text-white transition-colors duration-200 no-underline"
              >
                <Phone weight="fill" className="w-4 h-4 text-[#1E6FA8] shrink-0" />
                075 333 8260[span_3](start_span)[span_3](end_span)
              </a>
            </li>
            <li>
              <a
                href="mailto:apexbytesza@gmail.com"
                className="flex items-center gap-2 text-blue-4 text-[0.83rem] hover:text-white transition-colors duration-200 no-underline"
              >
                <EnvelopeSimple weight="fill" className="w-4 h-4 text-[#D9894B] shrink-0" />
                apexbytesza@gmail.com[span_4](start_span)[span_4](end_span)
              </a>
            </li>
            <li className="flex items-start gap-2 text-blue-4 text-[0.83rem]">
              <MapPin weight="fill" className="w-4 h-4 text-[#9333ea] shrink-0 mt-0.5" />
              5878 Mpumalanga Section, Kgotsong, Bothaville, 9660[span_5](start_span)[span_5](end_span)
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1080px] mx-auto border-t border-white/10 pt-5 flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
        <p className="text-blue-4 text-[0.78rem]">
          © 2026 ApexbytesHub. All rights reserved.[span_6](start_span)[span_6](end_span)
          <span className="mx-2">|</span>
          <button 
            onClick={() => setIsTermsOpen(true)}
            className="underline text-[#F4A261] hover:text-white transition-colors font-bold focus:outline-none"
          >
            Terms &amp; Policies
          </button>
        </p>
        <p className="text-blue-4 text-[0.78rem] inline-flex items-center gap-1">
          Made with <Heart weight="fill" className="w-3.5 h-3.5 text-red-500 inline" /> for the Kgotsong community
        </p>
      </div>

      {/* ── INTERACTIVE TERMS & POLICIES MODAL OVERLAY ── */}
      {isTermsOpen && (
        <div 
          onClick={() => setIsTermsOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 w-full max-w-2xl rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Top Header Block */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <div>
                <h3 className="font-sans font-black text-lg text-[#1E6FA8] dark:text-[#A9D6F2]">
                  Terms &amp; Service Policies
                </h3>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">Apexbytes Hub • Effective June 2026</p>
              </div>
              <button 
                onClick={() => setIsTermsOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Scrollable Policy Layout Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-[0.82rem] md:text-sm leading-relaxed font-sans">
              
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-[#F4A261] mb-1">1. Operational Scope</h4>
                <p className="text-muted-foreground">
                  Apexbytes Hub operates as a premium, home-based digital service and design studio in Kgotsong, Bothaville. Initiating order sequences through our automated WhatsApp channels confirms full user alignment with these operational parameters.
                </p>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-[#1E6FA8] dark:text-[#A9D6F2] mb-3">2. Divisional Terms</h4>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <Printer weight="fill" className="w-4 h-4 text-[#1E6FA8] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Print Hub:</strong> Hard-copy processing, including bulk text duplication runs and glossy photo printing (4x6 and A4 sizes), requires explicit proof verification. Apexbytes Hub is not liable for structural text or visual layout errors present on client-approved mockups.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <FileText weight="fill" className="w-4 h-4 text-[#1E6FA8] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Document Hub:</strong> Clients retain full responsibility for the biographical accuracy of information submitted for CV writing, professional typing, formatting, and administrative templates. Digital outputs derived from hard scans are retained securely for a maximum of 30 days before permanent erasure.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Palette weight="fill" className="w-4 h-4 text-[#1E6FA8] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Design Hub:</strong> Custom vector packages, corporate brand logos, layout assets, flyers, and event cards are engineered entirely from scratch using Adobe Illustrator vector tools. Full reproduction permissions transfer to client control only upon complete payment authorization.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Globe weight="fill" className="w-4 h-4 text-[#1E6FA8] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">e-Service Hub:</strong> We execute fast-tracked portal lookup assistance (SARS, SASSA, CSD, PSIRA, UIF, online entries). Because these systems depend entirely on external public servers, we assume no liability for third-party service timeouts. Administrative verification tracking fees (such as our R20 SASSA status check) cover lookup processing labor and remain payable upon execution.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Cpu weight="fill" className="w-4 h-4 text-[#1E6FA8] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">Tech Hub:</strong> System optimizations, operating software updates, basic equipment setup, and local virus mitigation tasks require clients to securely secure independent data file backups before service processing begins.
                    </span>
                  </li>
                </ul>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-[#F4A261] mb-2 flex items-center gap-1.5">
                  <Receipt weight="fill" className="w-4 h-4" /> 3. Business Administration Rules
                </h4>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside pl-1">
                  <li><span className="font-bold text-foreground">Turnaround Metrics:</span> Basic printing and portal tracking are processed same-day. Complex multi-page CV typing or custom vector asset engineering holds an execution pipeline of 24 to 48 hours.</li>
                  <li><span className="font-bold text-foreground">Payment Pipeline:</span> Digital administrative lookups require completion payments. Custom vector portfolios or heavy-volume print runs necessitate complete authorization clearance before physical production cycles step forward.</li>
                  <li><span className="font-bold text-foreground">Studio Pickup:</span> Material items, laminated sheets, and hardware sets must be collected from our specified Kgotsong home studio location following direct mobile status notifications.</li>
                  <li><span className="font-bold text-foreground">Corrections Framework:</span> Original scopes of service allocate up to two layout amendment updates. Structural adjustments falling outside original specifications will be treated as fresh product requests.</li>
                </ul>
              </div>

            </div>

            {/* Bottom Dismiss Footer Area */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
              <button 
                onClick={() => setIsTermsOpen(false)}
                className="px-5 py-2 font-sans font-bold text-xs bg-[#1E6FA8] text-white hover:bg-[#15537D] rounded-full transition-colors"
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
 
