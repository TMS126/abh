"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { WhatsappLogo, Phone, Envelope, MapPin, Clock, ChatCircleText, CaretDown } from "@phosphor-icons/react"
import { BRAND, BIZ, WA, FAQS, CONTACT_LINKS, HOURS } from "@/lib/brand"
import { cn } from "@/lib/utils"

const FORM_HUBS: Record<string, string> = {
  "Print Hub":      BRAND.blue,
  "Document Hub":   BRAND.green,
  "Design Hub":     BRAND.orangeDark,
  "E-Service Hub":  BRAND.lightBlue,
  "Tech Hub":       "#B8CCE0",
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="px-4 md:px-8 py-14 md:py-16">
      <div className="max-w-[750px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="abh-section-heading mb-3">Frequently Asked Questions</h2>
          <p className="abh-body">Everything you need to know about orders, processing, and timelines.</p>
          <div className="abh-divider" />
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="abh-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-[0.84rem] font-semibold text-zinc-800 dark:text-zinc-200 hover:text-brand-blue transition-colors"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <CaretDown weight="bold" className={cn("w-4 h-4 shrink-0 text-zinc-500 transition-transform duration-300", isOpen ? "rotate-180" : "rotate-0")} />
                </button>
                <div 
                  className={cn(
                    "grid transition-all duration-500 ease-in-out", 
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-8 pt-3 border-t border-zinc-100 dark:border-zinc-800 abh-body whitespace-pre-wrap">
                      {faq.answer}
                    </div>
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

function HubSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const options = Object.keys(FORM_HUBS)
  const activeColor = value ? FORM_HUBS[value] : undefined

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-zinc-100 dark:border-zinc-800 rounded-[14px] bg-white dark:bg-background text-[0.84rem] font-semibold text-zinc-800 dark:text-zinc-200 transition-all flex items-center justify-between gap-3"
        style={{ borderColor: activeColor ?? (isOpen ? BRAND.blue : undefined), color: value ? activeColor : undefined }}
      >
        <span>{value || "Select a hub"}</span>
        <CaretDown weight="bold" className={cn("w-4 h-4 shrink-0 transition-transform duration-300", isOpen ? "rotate-180" : "rotate-0")} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[14px] shadow-xl overflow-hidden">
          {options.map((opt) => {
            const color = FORM_HUBS[opt]
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false) }}
                className="w-full px-4 py-3 text-left text-[0.84rem] font-semibold flex items-center gap-3 text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                onMouseEnter={(e) => { e.currentTarget.style.color = color }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "inherit" }}
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

export function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", service: "", message: "" })
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const isNameValid = (val: string) => val.trim().length >= 2
  const isPhoneValid = (val: string) => /^[0-9+\s-]{10,15}$/.test(val.trim())
  const isMessageValid = (val: string) => val.trim().length >= 5
  const isFormValid = isNameValid(formData.name) && isPhoneValid(formData.phone) && isMessageValid(formData.message) && formData.service

  const handleSubmit = () => {
    if (!isFormValid) return
    const msg = `Hi ${BIZ.name}! My name is ${formData.name.trim()}. I'm interested in your ${formData.service}. \n\nMessage: ${formData.message.trim()}`
    window.open(`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-background pt-[calc(var(--nav-h)+2rem)]">
      <section className="abh-page-header">
        <h1 className="abh-page-title mb-3">Contact Us</h1>
        <p className="abh-tagline max-w-xl mx-auto">We're here and ready to help — reach out any way you prefer.</p>
        <div className="abh-divider" />
      </section>

      <section className="px-4 md:px-8 pb-14">
        <div className="max-w-[980px] mx-auto grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="abh-section-heading mb-1">Get In Touch</h2>
              <p className="abh-body">WhatsApp, call, email or visit us in {BIZ.location}.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {CONTACT_LINKS.map((c) => (
                <a key={c.title} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 abh-card hover:border-brand-blue transition-all">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                  <div className="min-w-0">
                    <p className="text-[0.92rem] font-black text-zinc-800 dark:text-zinc-200">{c.title}</p>
                    <p className="abh-muted break-words">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="abh-card p-5 bg-brand-blue/5 border-brand-blue/20">
              <span className="text-[0.78rem] font-black uppercase tracking-widest text-brand-blue flex items-center gap-1.5 mb-3">
                <Clock weight="fill" size={14} /> Business Hours
              </span>
              <div className="space-y-3">
                <div>
                  <p className="text-[0.7rem] font-black uppercase text-zinc-500 mb-1">{HOURS.printAndDoc.label}</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{HOURS.printAndDoc.hours}</p>
                  <p className="text-sm font-black mt-0.5" style={{ color: BRAND.green }}>Open on public holidays</p>
                </div>
                <div>
                  <p className="text-[0.7rem] font-black uppercase text-zinc-500 mb-1">{HOURS.techDesignEservice.label}</p>
                  {HOURS.techDesignEservice.lines.map(l => <p key={l} className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{l}</p>)}
                  <p className="text-sm font-black mt-0.5" style={{ color: BRAND.orangeDark }}>Sun & Public Holidays · Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="abh-card p-8 h-fit">
            <h2 className="abh-section-heading mb-6">Send a Message</h2>
            <div className="space-y-4">
              {[
                { label: "Your Name", type: "text", key: "name", validate: isNameValid, error: "Name too short" },
                { label: "Phone Number", type: "tel", key: "phone", validate: isPhoneValid, error: "Invalid phone" },
              ].map((f) => {
                const err = touched[f.key] && !f.validate(formData[f.key as keyof typeof formData])
                return (
                  <div key={f.key}>
                    <label className="abh-label block mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      className={cn("w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-zinc-900 text-[0.84rem] font-black transition-all outline-none", err ? "border-red-500" : "border-zinc-100 dark:border-zinc-800 focus:border-brand-blue")}
                      onBlur={() => setTouched({ ...touched, [f.key]: true })}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    />
                    {err && <p className="text-[0.65rem] font-black text-red-500 mt-1 uppercase tracking-widest">{f.error}</p>}
                  </div>
                )
              })}
              <div>
                <label className="abh-label block mb-1.5">Service Needed</label>
                <HubSelect value={formData.service} onChange={(val) => setFormData({ ...formData, service: val })} />
              </div>
              <div>
                <label className="abh-label block mb-1.5">Your Message</label>
                <textarea
                  className={cn("w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-zinc-900 text-[0.84rem] font-black transition-all outline-none resize-none", touched.message && !isMessageValid(formData.message) ? "border-red-500" : "border-zinc-100 dark:border-zinc-800 focus:border-brand-blue")}
                  rows={4}
                  onBlur={() => setTouched({ ...touched, message: true })}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="w-full py-4 rounded-[14px] font-black text-sm text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg"
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
 
