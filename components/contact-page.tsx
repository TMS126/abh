"use client"

import { useState, useEffect, useRef } from "react"
import {
  PaperPlaneTilt,
  CaretDown,
  Clock,
  ChatCircleText,
  MapPin,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import {
    BRAND,
    BIZ,
    WA,
    HOURS,
    FAQS,
    CONTACT_LINKS,
    HUB_COLORS,
    HubKey,
  } from "@/lib/brand"

// ─── Hub options for the form selector ───────────────────────────────────────────────────────────────────
const FORM_HUBS: Record<string, string> = {
    "Print Hub":                HUB_COLORS.print.primary,
    "Document Hub":             HUB_COLORS.doc.primary,
    "Design Hub":               HUB_COLORS.design.primary,
    "E-Service Hub":            HUB_COLORS.eservice.primary,
    "Tech Hub":                 HUB_COLORS.tech.primary,
    "Not Sure — Please Advise": BRAND.neutral500,
  }

// ─── FAQ Accordion ────────────────────────────────────────────────────────────────────────────────────────────────────────
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="px-4 md:px-8 py-14 md:py-16">
      <div className="max-w-[750px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="abh-section-heading mb-3">
            Frequently Asked Questions
          </h2>
          <p className="abh-body">
            Everything you need to know about orders, processing, and timelines.
          </p>
          <div className="abh-divider" />
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className="abh-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-[0.84rem] font-semibold text-zinc-800 dark:text-zinc-200 hover:text-brand-blue transition-colors"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <CaretDown
                    weight="bold"
                    className="w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-400 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <div
                  className="transition-all duration-300 ease-in-out overflow-hidden"
                  style={{ maxHeight: isOpen ? "800px" : "0px", opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-5 pb-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 abh-body">
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

// ─── Hub Selector ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
function HubSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen]   = useState(false)
  const ref                   = useRef<HTMLDivElement>(null)
  const options               = Object.keys(FORM_HUBS)
  const activeColor           = value ? FORM_HUBS[value] : undefined

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-zinc-100 dark:border-zinc-800 rounded-[14px] bg-white dark:bg-background text-[0.84rem] font-semibold text-zinc-800 dark:text-zinc-200 transition-all flex items-center justify-between gap-3"
        style={{
          borderColor: activeColor ?? (isOpen ? BRAND.blue : undefined),
          color: value ? activeColor : undefined,
        }}
      >
        <span>{value || "Select a hub"}</span>
        <CaretDown
          weight="bold"
          className="w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-400 transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-background border border-zinc-100 dark:border-zinc-800 rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
          {options.map((opt) => {
            const color = FORM_HUBS[opt]
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false) }}
                className="w-full px-4 py-3 text-left text-[0.84rem] font-semibold flex items-center gap-3 text-zinc-800 dark:text-zinc-200 transition-colors"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${color}1A`
                  e.currentTarget.style.color = color
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = ""
                  e.currentTarget.style.color = ""
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Contact Page ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", phone: "", service: "", message: "",
  })

  const sanitize = (str: string) => str.trim().replace(/[<>]/g, "");

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const isPhoneValid = (phone: string) => /^\+?[0-9\s-]{7,15}$/.test(phone.trim())
  const isNameValid = (name: string) => name.trim().length >= 2
  const isMessageValid = (msg: string) => msg.trim().length >= 5

  const isFormValid =
    isNameValid(formData.name) &&
    isPhoneValid(formData.phone) &&
    formData.service !== "" &&
    isMessageValid(formData.message)

  const handleSubmit = () => {
    if (!isFormValid) return;
    const sName = sanitize(formData.name);
    const sPhone = sanitize(formData.phone);
    const sService = sanitize(formData.service);
    const sMessage = sanitize(formData.message);

    const text = `Hello ${BIZ.name}!\n\nName: ${sName}\nPhone: ${sPhone}\nService: ${sService}\nMessage: ${sMessage}`;
    window.open(`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 pt-[74px]">

      {/* ── Page header ── */}
      <section className="abh-page-header">
        <h1 className="abh-page-title mb-3">Contact Us</h1>
        <p className="abh-tagline max-w-xl mx-auto">
          We're here and ready to help — reach out any way you prefer.
        </p>
        <div className="abh-divider" />
      </section>

      {/* ── Two-column section ── */}
      <section className="px-4 md:px-8 pb-14">
        <div className="max-w-[980px] mx-auto grid md:grid-cols-2 gap-10">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-8">

            {/* Get In Touch */}
            <div>
              <h2 className="abh-section-heading mb-1">Get In Touch</h2>
              <p className="abh-body">
                WhatsApp, call, email or visit us in {BIZ.location} — we're always happy to help.
              </p>
            </div>

            {/* Business Hours */}
            <div>
              <span className="text-[0.78rem] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-4">
                <Clock weight="fill" size={14} />
                Business Hours
              </span>
              <div className="grid grid-cols-1 gap-3">

                {/* Print & Document */}
                <div className="abh-card p-5">
                  <p className="text-[0.84rem] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                    {HOURS.printAndDoc.label}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
                      <span className="text-[0.92rem] font-semibold text-zinc-800 dark:text-zinc-200">
                        {HOURS.printAndDoc.hours}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="ml-3.5 text-[0.84rem] font-bold"
                        style={{ color: BRAND.green }}
                      >
                        {HOURS.printAndDoc.note}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tech / Design / E-Service */}
                <div className="abh-card p-5">
                  <p className="text-[0.84rem] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                    {HOURS.techDesignEservice.label}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {HOURS.techDesignEservice.lines.map((line) => (
                      <div key={line} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
                        <span className="text-[0.92rem] font-semibold text-zinc-800 dark:text-zinc-200">
                          {line}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <span
                        className="ml-3.5 text-[0.84rem] font-bold"
                        style={{ color: BRAND.orangeDark }}
                      >
                        {HOURS.techDesignEservice.note}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Response nudge */}
            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-[14px] border"
              style={{
                borderColor: `${BRAND.whatsapp}4D`,
                backgroundColor: `${BRAND.whatsapp}0D`,
              }}
            >
              <ChatCircleText
                weight="fill"
                size={20}
                className="shrink-0 mt-0.5"
                style={{ color: BRAND.whatsapp }}
              />
              <p className="text-[0.92rem] font-semibold text-zinc-700 dark:text-zinc-300 leading-snug">
                <span style={{ color: BRAND.whatsapp }}>WhatsApp is fastest.</span>{" "}
                {HOURS.responseTime}
              </p>
            </div>

            {/* Contact links */}
            <div className="flex flex-col gap-3">
              {CONTACT_LINKS.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 p-4 abh-card hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.dot }}
                  />
                  <div className="min-w-0">
                    <p className="text-[0.92rem] font-semibold text-zinc-800 dark:text-zinc-200">
                      {c.title}
                    </p>
                    <p className="abh-muted break-words">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Right column: form ── */}
          <div className="abh-card p-6 md:p-8 shadow-sm h-fit">
            <h2 className="abh-section-heading mb-6">Send a Message</h2>
            <div className="space-y-4">

              {[
                { label: "Your Name",              type: "text",  placeholder: "e.g. Theji Koena",  key: "name", validate: isNameValid, error: "Please enter at least 2 characters" },
                { label: "Phone / WhatsApp Number", type: "tel",   placeholder: `e.g. ${BIZ.phone}`, key: "phone", validate: isPhoneValid, error: "Please enter a valid phone number" },
              ].map((field) => {
                const showError = touched[field.key] && !field.validate(formData[field.key as keyof typeof formData])
                return (
                  <div key={field.key}>
                    <label className="abh-label block mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className={cn(
                        "w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-background text-[0.84rem] font-semibold transition-all outline-none",
                        showError 
                          ? "border-red-500 text-red-600 dark:text-red-400" 
                          : "border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:border-brand-blue"
                      )}
                      onBlur={() => setTouched({ ...touched, [field.key]: true })}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                    />
                    {showError && <p className="text-[0.68rem] font-bold text-red-500 mt-1">{field.error}</p>}
                  </div>
                )
              })}

              <div>
                <label className="abh-label block mb-1.5">Service Needed</label>
                <HubSelect
                  value={formData.service}
                  onChange={(val) => setFormData({ ...formData, service: val })}
                />
              </div>

              <div>
                <label className="abh-label block mb-1.5">Your Message</label>
                <textarea
                  placeholder="Tell us what you need..."
                  className={cn(
                    "w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-background text-[0.84rem] font-semibold transition-all outline-none resize-none",
                    touched.message && !isMessageValid(formData.message)
                      ? "border-red-500 text-red-600 dark:text-red-400"
                      : "border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:border-brand-blue"
                  )}
                  rows={5}
                  onBlur={() => setTouched({ ...touched, message: true })}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
                {touched.message && !isMessageValid(formData.message) && (
                  <p className="text-[0.68rem] font-bold text-red-500 mt-1">Please enter at least 5 characters</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="w-full py-3.5 rounded-[14px] font-bold text-[0.84rem] text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                style={{ backgroundColor: BRAND.blue }}
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      <FAQAccordion />

    </div>
  )
}
