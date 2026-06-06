"use client"

import { useState } from "react"
import {
  WhatsappLogo,
  Phone,
  EnvelopeSimple,
  MapPin,
  Clock,
  PaperPlaneTilt,
  Printer,
  FileText,
  Monitor,
  Palette,
  Globe,
  CaretDown,
} from "@phosphor-icons/react"

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

interface FAQItem {
  question: string
  answer: string
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: "How do I send my files, photos, or CV information to you?",
      answer: "It is completely frictionless. When you click on any service on our platform, it automatically generates a pre-typed WhatsApp message for you. You can upload your documents, rough notes, or images directly through that WhatsApp chat to our studio workspace.",
    },
    {
      question: "Where do I collect my completed documents or prints?",
      answer: "Apexbytes Hub operates as a home-based studio in Kgotsong, Bothaville. You can collect physical prints, laminated materials directly from our location once we notify you. For digital-only services, files are sent straight back to your phone or email.",
    },
    {
      question: "How long does it take to complete a design or document task?",
      answer: "Basic administrative services, digital checks, and standard print-and-laminate tasks are typically handled same day. Custom design work or full CV overhauls take between 24 to 48 hours depending on scope.",
    },
  ]

  return (
    <div className="mt-8">
      <h3 className="font-sans font-black text-xl text-[#0F3F66] dark:text-[#A9D6F2] mb-4">Frequently Asked Questions</h3>
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <div key={idx} className="border border-border rounded-[12px] bg-card overflow-hidden transition-all">
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 font-sans font-bold text-left text-[0.9rem] text-foreground hover:bg-muted/50 transition-colors"
              >
                <span>{faq.question}</span>
                <CaretDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="p-4 pt-0 text-[0.85rem] text-muted-foreground leading-relaxed border-t border-border/50 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Contact Page Component ──────────────────────────────────────────────

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "General Inquiry",
    message: "",
  })

  const servicesList = [
    "General Inquiry",
    "Print Hub (Printing/Copying/Photos)",
    "Document Hub (CV Design/Typing/Laminating)",
    "Design Hub (Logo/Flyers/Invitations)",
    "E-Service Hub (SARS/PSIRA/Applications)",
    "Tech Hub (PC Setup/Windows/Software)",
  ]

  const isFormValid = formData.name.trim() !== "" && formData.phone.trim() !== ""

  const handleSubmit = () => {
    if (!isFormValid) return
    const waText = `Hi Apexbytes Hub! My name is ${formData.name}.\n\n*Phone:* ${formData.phone}\n*Service Category:* ${formData.service}\n*Message:* ${formData.message}`
    const waUrl = `https://wa.me/27753338260?text=${encodeURIComponent(waText)}`
    window.open(waUrl, "_blank")
  }

  return (
    <div className="max-w-[1140px] mx-auto px-4 md:px-8 py-10 md:py-16">
      {/* Page Heading */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-sans font-black text-3xl md:text-5xl text-[#0F3F66] dark:text-[#A9D6F2] mb-3">
          Let's Connect
        </h1>
        <p className="text-[#555555] dark:text-[#EDEDED] text-base max-w-[550px]">
          Have a project in mind or need an urgent service? Reach out through our quick layout channels or drop by our home studio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Hand: Interactive Studio Form Panel */}
        <div className="lg:col-span-7 bg-card border border-border rounded-[24px] p-6 md:p-8 shadow-sm">
          <h2 className="font-sans font-black text-xl text-[#0F3F66] dark:text-[#A9D6F2] mb-6">Send a Quick Message</h2>
          
          <div className="mb-4">
            <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Your Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Thabo Mokoena"
              className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] transition-all duration-200 focus:border-[#1E6FA8] outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. 075 333 8260"
              className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] transition-all duration-200 focus:border-[#1E6FA8] outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Target Service Hub</label>
            <div className="relative">
              <select
                value={formData.service}
                onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] appearance-none transition-all duration-200 focus:border-[#1E6FA8] outline-none cursor-pointer pr-10"
              >
                {servicesList.map((svc, i) => (
                  <option key={i} value={svc}>{svc}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
                <CaretDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Your Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us what you need..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] transition-all duration-200 focus:border-[#1E6FA8] outline-none resize-y min-h-[95px]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-[11px] font-sans font-extrabold text-base transition-all duration-200 ease-in-out ${
              isFormValid
                ? "bg-wa-green hover:bg-[#1ebe5a] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)] active:scale-[0.98]"
                : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
            }`}
          >
            <PaperPlaneTilt weight="fill" className="w-5 h-5" />
            Send via WhatsApp
          </button>
        </div>

        {/* Right Hand: Direct Contacts & Reintegrated Google Map Embed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm space-y-5">
            <h2 className="font-sans font-black text-xl text-[#0F3F66] dark:text-[#A9D6F2] mb-2">Direct Channels</h2>
            
            <a href="https://wa.me/27753338260" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="p-2.5 bg-wa-green/10 text-wa-green rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                <WhatsappLogo weight="fill" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[0.82rem] font-extrabold text-muted-foreground font-sans uppercase tracking-wider">WhatsApp Studio</h4>
                <p className="text-[0.95rem] font-bold text-foreground mt-0.5">+27 75 333 8260</p>
              </div>
            </a>

            <a href="tel:+27753338260" className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="p-2.5 bg-[#1E6FA8]/10 text-[#1E6FA8] rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                <Phone weight="fill" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[0.82rem] font-extrabold text-muted-foreground font-sans uppercase tracking-wider">Direct Call Line</h4>
                <p className="text-[0.95rem] font-bold text-foreground mt-0.5">+27 75 333 8260</p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-3 rounded-xl">
              <div className="p-2.5 bg-[#6FBF1A]/10 text-[#6FBF1A] rounded-xl shrink-0">
                <MapPin weight="fill" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[0.82rem] font-extrabold text-muted-foreground font-sans uppercase tracking-wider">Studio Location</h4>
                <p className="text-[0.95rem] font-bold text-foreground mt-0.5">Kgotsong, Bothaville, Free State</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 rounded-xl border-t border-border/60 pt-4">
              <div className="p-2.5 bg-[#F4A261]/10 text-[#F4A261] rounded-xl shrink-0">
                <Clock weight="fill" className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[0.82rem] font-extrabold text-muted-foreground font-sans uppercase tracking-wider">Operating Hours</h4>
                <p className="text-[0.9rem] font-bold text-foreground mt-0.5">Mon — Fri: 08:00 - 17:00</p>
                <p className="text-[0.9rem] font-bold text-foreground">Sat: 08:00 - 13:00 <span className="text-muted-foreground font-normal">(Closed Sundays)</span></p>
              </div>
            </div>
          </div>

          {/* Re-integrated Interactive Location Map Frame */}
          <div className="bg-card border border-border rounded-[24px] p-4 shadow-sm overflow-hidden h-[260px] relative group">
            <iframe
              title="Apexbytes Hub Studio Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m4!2sBothaville!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e99595bc624a045%3A0x6b63ca52f36f4553!2sBothaville!5e0!3m2!1sen!2sza!4v1717676000000!5m2!1sen!2sza"
              className="w-full h-full rounded-[16px] border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* FAQ Row section overlay underneath grids */}
      <div className="mt-12 max-w-[1140px]">
        <FAQAccordion />
      </div>
    </div>
  )
}
 
