"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { CaretDown, DownloadSimple, AddressBook, Clock, Sparkle, WhatsappLogo, Phone, EnvelopeSimple, MapPin } from "@phosphor-icons/react"
import { BRAND, BIZ, WA, FAQS, CONTACT_LINKS, HOURS } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { BusinessStatusFull } from "@/components/business-status"
import { ScrollBounce } from "@/components/scroll-bounce"

const FORM_HUBS: Record<string, { light: string; dark: string }> = {
  "Print Hub":                  { light: BRAND.blue,      dark: "#A9D6F2" },
  "Document Hub":               { light: BRAND.green,     dark: "#CDEB9F" },
  "Design Hub":                 { light: BRAND.orangeDark, dark: "#F9D1B0" },
  "E-Service Hub":              { light: "#15537D",        dark: "#A9D6F2" },
  "Tech Hub":                   { light: "#333333",        dark: "#B8CCE0" },
 "Not Sure — Help Me Choose":  { light: BRAND.neutral500, dark: "#9A9A9A" },
}
const CONTACT_GREY = { light: BRAND.dark100, dark: "#B8CCE0" }

const CONTACT_ICONS: Record<string, React.ElementType> = {
  "WhatsApp Us": WhatsappLogo,
  "Call Us":     Phone,
  "Email Us":    EnvelopeSimple,
  "Visit Us":    MapPin,
}
function downloadBusinessVCard() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:Theji Meje ApexbytesHub`,
    `N:ApexbytesHub;Theji Meje;;;`,
    `ORG:ApexbytesHub`,
    `TITLE:Founder & Lead Designer`,
    `TEL;TYPE=CELL,PREF:+27753338260`,
    `EMAIL;TYPE=WORK:apexbytesza@gmail.com`,
    `ADR;TYPE=WORK:;;5878 Mpumalanga Section;Kgotsong;Bothaville;9660;South Africa`,
    `URL:https://v0-apexbytes-hub-website.vercel.app/`,
    `NOTE:Apexbytes Hub — Print\\, Design\\, Docs\\, Tech & E-Services in Kgotsong\\, Bothaville.`,
    "END:VCARD",
  ].join("\r\n")

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = "ApexbytesHub.vcf"
  a.click()
  URL.revokeObjectURL(url)
}

function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const greyColor = mounted && resolvedTheme === "dark" ? CONTACT_GREY.dark : CONTACT_GREY.light

  return (
    <section className="px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-[980px] mx-auto">
        <ScrollBounce>
          <div className="mb-8">
            <h2 className="abh-section-heading mb-3 text-center">Frequently Asked Questions</h2>
            <p className="abh-body text-center max-w-xl mx-auto">
              Everything you need to know about orders, processing, and timelines.
            </p>
            <div className="abh-divider" />
          </div>
        </ScrollBounce>
        <div className="space-y-2">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <ScrollBounce key={index} delay={index * 0.05}>
                <div className="abh-card overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-[0.84rem] font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = greyColor }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "" }}
                  >
                    <span className="leading-snug">{faq.question}</span>
                    <CaretDown
                      weight="bold"
                      className={cn(
                        "w-4 h-4 shrink-0 text-zinc-500 transition-transform duration-300",
                        isOpen ? "rotate-180" : "rotate-0"
                      )}
                    />
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
              </ScrollBounce>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HubSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen,   setIsOpen]   = useState(false)
  const [mounted,  setMounted]  = useState(false)
  const ref                     = useRef<HTMLDivElement>(null)
  const { resolvedTheme }       = useTheme()
  const isDark                  = mounted && resolvedTheme === "dark"
  const options                 = Object.keys(FORM_HUBS)
  const colorFor  = (opt: string) => (isDark ? FORM_HUBS[opt].dark : FORM_HUBS[opt].light)
  const activeColor             = value ? colorFor(value) : undefined

  useEffect(() => { setMounted(true) }, [])

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
        className="w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-background text-[0.84rem] font-semibold transition-all flex items-center justify-between gap-3 border-zinc-100 dark:border-zinc-800"
        style={{
          borderColor: value ? activeColor : (isOpen ? BRAND.blue : undefined),
          color:       value ? activeColor : (isDark ? "#9A9A9A" : "#777777"),
        }}
      >
        <span>{value || "Select a hub"}</span>
        <CaretDown
          weight="bold"
          className={cn(
            "w-4 h-4 shrink-0 transition-transform duration-300",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[14px] shadow-xl overflow-hidden">
          {options.map((opt) => {
            const color = colorFor(opt)
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

function ContactPageInner() {
  const searchParams = useSearchParams()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === "dark"
  const greyColor = isDark ? CONTACT_GREY.dark : CONTACT_GREY.light
  const [formData,  setFormData]  = useState({ name: "", phone: "", service: "", message: "" })
  const [touched,   setTouched]   = useState<Record<string, boolean>>({})
  const [vcardDone, setVcardDone] = useState(false)
  const [prefilled, setPrefilled] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const serviceParam = searchParams.get("service")
    const messageParam = searchParams.get("message")
    if (!serviceParam && !messageParam) return

    setFormData((prev) => ({
      ...prev,
      service: serviceParam && FORM_HUBS[serviceParam] ? serviceParam : prev.service,
      message: messageParam ?? prev.message,
    }))
    setPrefilled(true)
  }, [searchParams])

  const isNameValid    = (val: string) => val.trim().length >= 2
  const isPhoneValid   = (val: string) => /^[0-9+\s-]{10,15}$/.test(val.trim())
  const isMessageValid = (val: string) => val.trim().length >= 5
  const isFormValid    =
    isNameValid(formData.name) &&
    isPhoneValid(formData.phone) &&
    isMessageValid(formData.message) &&
    formData.service

  const handleSubmit = () => {
    if (!isFormValid) return
    const serviceLine = formData.service.startsWith("Not Sure")
      ? "I'm not sure which service I need yet — could you help me figure it out?"
      : `I'm interested in your ${formData.service}.`
    const msg = `Hi ${BIZ.name}! My name is ${formData.name.trim()}. ${serviceLine} \n\nMessage: ${formData.message.trim()}`
    window.open(
      `https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(msg)}`,
      "_blank"
    )
  }

  const handleVCard = () => {
    downloadBusinessVCard()
    setVcardDone(true)
    setTimeout(() => setVcardDone(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <section className="px-4 md:px-8 pt-[calc(var(--nav-h)+2rem)] pb-8">
        <div className="max-w-[980px] mx-auto">
          <ScrollBounce>
            <h1 className="abh-page-title mb-3">Contact Us</h1>
          </ScrollBounce>
          <p className="abh-tagline max-w-xl mx-auto text-center">
            We're here and ready to help — reach out any way you prefer.
          </p>
          <div className="abh-divider" />
        </div>
      </section>

      {/* ── Main grid ── */}
      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-[980px] mx-auto grid md:grid-cols-2 gap-10 items-stretch">

          <div className="flex flex-col justify-between gap-6">

            <ScrollBounce>
              <div className="text-center">
                <h2 className="abh-section-heading mb-1">Get In Touch</h2>
                <p className="abh-body">WhatsApp, call, email or visit us in {BIZ.location}.</p>
              </div>
            </ScrollBounce>

            <div className="grid grid-cols-2 gap-3">
              {CONTACT_LINKS.map((c, index) => {
                const Icon = CONTACT_ICONS[c.title] ?? Phone
                const dotColor = "dotLight" in c
                  ? (isDark ? c.dotDark : c.dotLight)
                  : c.dot
                return (
                  <ScrollBounce key={c.title} delay={index * 0.08}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center justify-center text-center gap-2 p-4 min-h-[104px] abh-card border-transparent transition-all duration-200 active:scale-[0.97]"
                      style={{ borderColor: "transparent" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = dotColor }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent" }}
                    >
                      <span
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-colors duration-200 text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900"
                        style={{ ["--icon-color" as any]: dotColor }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = dotColor; e.currentTarget.style.backgroundColor = `${dotColor}15` }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.backgroundColor = "" }}
                      >
                        <Icon size={20} weight="fill" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{c.title}</p>
                        <p className="abh-muted break-words text-xs">{c.value}</p>
                      </div>
                    </a>
                  </ScrollBounce>
                )
              })}
            </div>

            <ScrollBounce delay={0.1}>
              <div className="abh-card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${greyColor}15`, color: greyColor }}
                  >
                    <AddressBook size={20} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Save Our Contact</p>
                    <p className="abh-muted">Add ApexbytesHub to your phone</p>
                  </div>
                </div>
                <button
                  onClick={handleVCard}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-[14px] font-medium text-sm text-white transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND.blue }}
                >
                  <DownloadSimple size={16} weight="bold" />
                  {vcardDone ? "Saved!" : "Download"}
                </button>
              </div>
            </ScrollBounce>

            <ScrollBounce delay={0.15}>
              <div className="abh-card p-5 flex-1">
                <span
                  className="text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-1.5 mb-3"
                  style={{ color: greyColor }}
                >
                  <Clock weight="fill" size={14} /> Business Hours
                </span>
                <div className="space-y-3">
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-500 mb-1">
                      {HOURS.printAndDoc.label}
                    </p>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {HOURS.printAndDoc.hours}
                    </p>
                    <p
                      className="flex items-center gap-1.5 text-xs font-medium mt-1"
                      style={{ color: BRAND.blue }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: BRAND.blue }}
                      />
                      Open on public holidays
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-500 mb-1">
                      {HOURS.techDesignEservice.label}
                    </p>
                    {HOURS.techDesignEservice.lines.map((l) => (
                      <p key={l} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{l}</p>
                    ))}
                    <p className="flex items-center gap-1.5 text-xs font-medium mt-1 text-zinc-500 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-zinc-400 dark:bg-zinc-500" />
                      Sunday &amp; Public Holidays · Closed
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 mb-2">
                      Current Status
                    </p>
                    <BusinessStatusFull />
                  </div>
                </div>
              </div>
            </ScrollBounce>
          </div>

          {/* Right column — form card */}
          <ScrollBounce delay={0.2}>
            <div className="abh-card p-8 flex flex-col h-full">
              <h2 className="abh-section-heading mb-2">Send a Message</h2>
              {prefilled && (
                <p className="flex items-center gap-1.5 text-[0.7rem] font-bold mb-4" style={{ color: greyColor }}>
                  <Sparkle size={14} weight="fill" />
                  Prefilled from the gallery — feel free to edit before sending
                </p>
              )}
              <div className={cn("flex flex-col gap-4 flex-1", !prefilled && "mt-4")}>
                {[
                  { label: "Your Name",     type: "text", key: "name",  validate: isNameValid,  error: "Name too short"     },
                  { label: "Phone Number",  type: "tel",  key: "phone", validate: isPhoneValid, error: "Invalid phone number" },
                ].map((f) => {
                  const err = touched[f.key] && !f.validate(formData[f.key as keyof typeof formData])
                  return (
                    <div key={f.key}>
                      <label className="abh-label block mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        value={formData[f.key as keyof typeof formData]}
                        className={cn(
                          "w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-all outline-none",
                          err
                            ? "border-red-500"
                            : "border-zinc-100 dark:border-zinc-800 focus:border-brand-blue"
                        )}
                        onBlur={() => setTouched({ ...touched, [f.key]: true })}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      />
                      {err && (
                        <p className="text-[0.65rem] font-black text-red-500 mt-1 uppercase tracking-widest">
                          {f.error}
                        </p>
                      )}
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

                <div className="flex-1 flex flex-col">
                  <label className="abh-label block mb-1.5">Your Message</label>
                  <textarea
                    className={cn(
                      "w-full flex-1 px-4 py-3 border rounded-[14px] bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-all outline-none resize-none",
                      touched.message && !isMessageValid(formData.message)
                        ? "border-red-500"
                        : "border-zinc-100 dark:border-zinc-800 focus:border-brand-blue"
                    )}
                    rows={4}
                    value={formData.message}
                    onBlur={() => setTouched({ ...touched, message: true })}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="mt-auto w-full py-4 rounded-[14px] font-black text-sm text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                  style={{ backgroundColor: BRAND.blue }}
                >
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </ScrollBounce>

        </div>
      </section>

      <FAQAccordion />
    </div>
  )
}

function ContactSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <section className="px-4 md:px-8 pt-[calc(var(--nav-h)+2rem)] pb-8">
        <div className="max-w-[980px] mx-auto">
          <h1 className="abh-page-title mb-3">Contact Us</h1>
          <div className="abh-divider" />
        </div>
      </section>
    </div>
  )
}

export function ContactPage() {
  return (
    <Suspense fallback={<ContactSkeleton />}>
      <ContactPageInner />
    </Suspense>
  )
                    } 
