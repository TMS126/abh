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
      answer: "Basic administrative services, digital checks, and standard print-and-laminate tasks are typically handled same day. Custom design work or full CV overhauls take between 24 to 48 hours depending on requirements.",
    },
    {
      question: "What are your payment terms?",
      answer: "We maintain clear, upfront pricing. Standard checks are payable upon execution. For premium custom design or high-volume print runs, we require confirmation before the production run begins. We accept cash and EFT.",
    },
    {
      question: "Do you use generic online templates for design projects?",
      answer: "No. All layouts, vector files, and brand assets are built from scratch using industry-standard design tools to ensure sharp, clean results — not generic consumer-level web templates.",
    },
  ]

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-secondary transition-colors duration-300">
      <div className="max-w-[750px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-sans font-black text-2xl md:text-3xl text-blue-3 dark:text-blue-4 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything you need to know about how we handle orders, processing and timelines.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="border border-border rounded-[16px] overflow-hidden bg-card transition-colors duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-sans font-bold text-[0.92rem] text-blue-3 dark:text-blue-4 hover:text-[#1E6FA8] transition-colors focus:outline-none active:scale-[0.99]"
                >
                  <span className="leading-tight">{faq.question}</span>
                  <CaretDown
                    weight="bold"
                    className="w-4 h-4 shrink-0 transition-transform duration-300 ease-in-out"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: isOpen ? "#1E6FA8" : "",
                    }}
                  />
                </button>
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{ maxHeight: isOpen ? "300px" : "0px", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-5 pb-5 border-t border-border text-muted-foreground text-[0.88rem] leading-relaxed pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Main Contact Page UI ──────────────────────────────────────────────────────

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
    message: "",
  })

  const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, "")
  const isPhoneValid = /^\d+$/.test(cleanPhone) && cleanPhone.length >= 7 && cleanPhone.length <= 15
  const isFormValid =
    formData.name.trim() !== "" &&
    isPhoneValid &&
    formData.service !== "" &&
    formData.message.trim() !== ""

  const handleSubmit = () => {
    if (!isFormValid) {
      alert("Please complete all fields and enter a valid phone number.")
      return
    }
    const text = `Hello Apexbytes Hub!\n\nName: ${formData.name}\nPhone: ${formData.phone}\nService: ${formData.service}\nMessage: ${formData.message}`
    window.open(`https://wa.me/27753338260?text=${encodeURIComponent(text)}`, "_blank")
  }

  const contactCards = [
    {
      icon: <WhatsappLogo weight="fill" className="w-6 h-6 text-[#25D366]" />,
      title: "WhatsApp Us",
      value: "075 333 8260",
      href: "https://wa.me/27753338260",
      color: "bg-[#DCFCE7]",
    },
    {
      icon: <Phone weight="fill" className="w-6 h-6 text-[#1E6FA8]" />,
      title: "Call Us",
      value: "075 333 8260",
      href: "tel:+27753338260",
      color: "bg-[#DBEAFE]",
    },
    {
      icon: <EnvelopeSimple weight="fill" className="w-6 h-6 text-[#D9894B]" />,
      title: "Email Us",
      value: "apexbytesza@gmail.com",
      href: "mailto:apexbytesza@gmail.com",
      color: "bg-[#FEF3C7]",
    },
    {
      icon: <MapPin weight="fill" className="w-6 h-6 text-[#9333ea]" />,
      title: "Visit Us",
      value: "5878 Mpumalanga, Kgotsong Location, 9660",
      href: "https://maps.google.com/?q=Kgotsong,Bothaville",
      color: "bg-[#F3E8FF]",
    },
  ]

  return (
    <div className="animate-fade-up">
      {/* Premium Original Gradient Header */}
      <section className="bg-gradient-to-br from-blue-3 via-blue-1 to-[#2980b9] px-4 md:px-8 py-12 md:py-14 text-center relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[60px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(169,214,242,0.2)_0%,transparent_70%)] rounded-full" />
        <h1 className="font-sans font-black text-2xl md:text-4xl text-white relative z-10">Contact Us</h1>
        <p className="text-blue-4 text-base mt-2 relative z-10">{"We're here and ready to help — reach out any way you prefer"}</p>
      </section>

      {/* Grid Content Block */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-[980px] mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          
          {/* Left Column: Direct Details & Interactive Map Embed */}
          <div className="space-y-6">
            <div>
              <h2 className="font-sans font-black text-xl md:text-2xl text-blue-3 dark:text-blue-4 mb-2">Get In Touch</h2>
              <p className="text-muted-foreground text-[0.9rem] mb-6">
                {"WhatsApp, call, email or visit us in Kgotsong — we're always happy to help."}
              </p>
            </div>

            {/* Original Business Hours Configuration */}
            <div className="bg-secondary rounded-[18px] p-5 border border-border/60 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-2.5">
                <Clock weight="bold" className="w-5 h-5 text-[#1E6FA8]" />
                <h4 className="font-sans font-black text-blue-3 dark:text-blue-4 text-[0.95rem] uppercase tracking-wider">Business Hours</h4>
              </div>
              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#1E6FA8] dark:text-[#A9D6F2] font-sans font-bold text-[0.85rem]">
                    <Printer weight="bold" className="w-4 h-4" />
                    <span>Print Hub</span>
                    <span className="text-muted-foreground/40 font-normal">|</span>
                    <FileText weight="bold" className="w-4 h-4" />
                    <span>Document Hub</span>
                  </div>
                  <p className="text-[0.85rem] text-foreground font-medium pl-6">
                    Mon – Sun: <span className="font-bold">07:00 – 20:00</span>{" "}
                    <span className="text-muted-foreground text-xs ml-1">(Open on holidays)</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#1E6FA8] dark:text-[#A9D6F2] font-sans font-bold text-[0.85rem]">
                    <Monitor weight="bold" className="w-4 h-4" />
                    <span>Tech Hub</span>
                    <span className="text-muted-foreground/40 font-normal">|</span>
                    <Palette weight="bold" className="w-4 h-4" />
                    <span>Design Hub</span>
                    <span className="text-muted-foreground/40 font-normal">|</span>
                    <Globe weight="bold" className="w-4 h-4" />
                    <span>E-Service</span>
                  </div>
                  <div className="text-[0.85rem] text-foreground font-medium pl-6 space-y-0.5">
                    <p>Mon – Fri: <span className="font-bold">09:00 – 17:00</span></p>
                    <p>Sat: <span className="font-bold">09:00 – 12:00</span></p>
                    <p className="text-muted-foreground text-xs font-semibold">
                      Sun & Holidays: <span className="text-[#D9894B]">Closed</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Original Interactive Communication Channels */}
            <div className="flex flex-col gap-3">
              {contactCards.map((card) => (
                <a
                  key={card.title}
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 bg-secondary rounded-[14px] p-4 transition-all duration-200 ease-in-out hover:bg-blue-4 dark:hover:bg-[#1E3A52] hover:translate-x-1.5 active:scale-[0.98] no-underline"
                >
                  <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-blue-3 dark:text-blue-4 text-[0.82rem]">{card.title}</h4>
                    <p className="text-muted-foreground text-[0.88rem] mt-0.5">{card.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Clean Open-Source Google Maps Embed Frame without API Key Errors */}
            <div className="bg-secondary border border-border rounded-[20px] p-3 shadow-inner h-[280px] overflow-hidden transition-colors duration-300">
              <iframe
                title="Apexbytes Hub Studio Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.348398436402!2d26.6150000!3d-27.3800000!2m3!1f0!2f0!3f0!3m2!1i1025!2i780!4f13.1!3m3!1m2!1s0x1e98eb792ff4cb97%3A0x63cdfa943627b03b!2sBothaville!5e0!3m2!1sen!2sza!4v1717684000000!5m2!1sen!2sza"
                className="w-full h-full rounded-[14px] border-0 grayscale dark:invert-[0.9] dark:hue-rotate-180 transition-all duration-300"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Premium Original Form Component Container */}
          <div className="bg-secondary rounded-[20px] p-6 md:p-8 transition-colors duration-300 h-fit">
            <h3 className="font-sans font-extrabold text-blue-3 dark:text-blue-4 text-lg mb-5">Send a Message</h3>

            <div className="mb-4">
              <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Your Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Thabo Mokoena"
                className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] transition-all duration-200 ease-in-out focus:border-primary outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Phone / WhatsApp Number</label>
              <input
                type="text"
                inputMode="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +27 75 333 8260"
                className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] transition-all duration-200 ease-in-out focus:border-primary outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Service Needed</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData((prev) => ({ ...prev, service: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] transition-all duration-200 ease-in-out focus:border-primary outline-none cursor-pointer"
              >
                <option value="">-- Select a hub --</option>
                <option>Print Hub</option>
                <option>Document Hub</option>
                <option>Design Hub</option>
                <option>E-Service Hub</option>
                <option>Tech Hub</option>
                <option>Not Sure — Please Advise</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-[0.82rem] font-semibold text-muted-foreground mb-1.5 font-sans">Your Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us what you need..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-border rounded-[10px] bg-background text-foreground text-[0.88rem] transition-all duration-200 ease-in-out focus:border-primary outline-none resize-y min-h-[95px]"
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
              Send to WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <FAQAccordion />
    </div>
  )
}
