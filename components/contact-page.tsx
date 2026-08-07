// components/contact/contact-page.tsx
"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { DownloadSimple, AddressBook, Clock, Sparkle, WhatsappLogo, Phone, EnvelopeSimple } from "@phosphor-icons/react"
import { BRAND, BIZ, CONTACT_LINKS, HOURS } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { BusinessStatusFull } from "@/components/business-status"
import { ScrollBounce } from "@/components/scroll-bounce"
import { FORM_HUB_KEYS, getFormHubColor, CONTACT_GREY, downloadBusinessVCard } from "@/lib/contact-data"
import { LocationMap } from "@/components/contact/location-map"
import { FAQAccordion } from "@/components/contact/faq-accordion"
import { HubSelect } from "@/components/contact/hub-select"
import { FieldErrorTooltip } from "@/components/contact/field-error-tooltip"

const CONTACT_ICONS: Record<string, React.ElementType> = {
  "WhatsApp Us": WhatsappLogo,
  "Call Us": Phone,
  "Email Us": EnvelopeSimple,
}

const GRID_CONTACT_LINKS = CONTACT_LINKS.filter((c) => c.title !== "Visit Us")

function ContactPageInner() {
  const searchParams = useSearchParams()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === "dark"
  const greyColor = isDark ? CONTACT_GREY.dark : CONTACT_GREY.light

  const [formData, setFormData] = useState({ name: "", phone: "", service: "", message: "" })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [vcardDone, setVcardDone] = useState(false)
  const [prefilled, setPrefilled] = useState(false)
  const [glowActive, setGlowActive] = useState(false)
  const formCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const serviceParam = searchParams.get("service")
    const messageParam = searchParams.get("message")
    if (!serviceParam && !messageParam) return

    setFormData((prev) => ({
      ...prev,
      service: serviceParam && serviceParam in FORM_HUB_KEYS ? serviceParam : prev.service,
      message: messageParam ?? prev.message,
    }))
    setPrefilled(true)
  }, [searchParams])

  useEffect(() => {
    if (!prefilled || !mounted) return
    const id = requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      setGlowActive(true)
    })
    const stopTimer = setTimeout(() => setGlowActive(false), 2600)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(stopTimer)
    }
  }, [prefilled, mounted])

  const glowColor = formData.service ? getFormHubColor(formData.service, isDark) : BRAND.blue

  const isNameValid = (val: string) => val.trim().length >= 2
  const isPhoneValid = (val: string) => /^[0-9+\s-]{10,15}$/.test(val.trim())
  const isMessageValid = (val: string) => val.trim().length >= 5
  const isFormValid = isNameValid(formData.name) && isPhoneValid(formData.phone) && isMessageValid(formData.message) && formData.service

  const handleSubmit = () => {
    if (!isFormValid) return
    const serviceLine = formData.service.startsWith("Not Sure")
      ? "I'm not sure which service I need yet — could you help me figure it out?"
      : `I'm interested in your ${formData.service}.`
    const msg = `Hi ${BIZ.name}! My name is ${formData.name.trim()}. ${serviceLine} \n\nMessage: ${formData.message.trim()}`
    window.open(`https://wa.me/${BIZ.phoneE164.replace("+", "")}?text=${encodeURIComponent(msg)}`, "_blank")
  }

  const handleVCard = () => {
    downloadBusinessVCard()
    setVcardDone(true)
    setTimeout(() => setVcardDone(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes abh-inquire-glow {
          0%   { box-shadow: 0 0 0 0 transparent; }
          15%  { box-shadow: 0 0 0 2px var(--glow-color), 0 0 22px 3px var(--glow-color); }
          40%  { box-shadow: 0 0 0 0 transparent; }
          55%  { box-shadow: 0 0 0 2px var(--glow-color), 0 0 22px 3px var(--glow-color); }
          80%, 100% { box-shadow: 0 0 0 0 transparent; }
        }
        .abh-inquire-glow-active {
          animation: abh-inquire-glow 2.4s ease-in-out 1;
        }
      `}</style>

      <section className="px-4 md:px-8 pt-[calc(var(--nav-h)+2rem)] pb-8">
        <div className="max-w-[980px] mx-auto">
          <ScrollBounce>
            <h1 className="abh-page-title mb-3">Contact Us</h1>
          </ScrollBounce>
          <p className="abh-tagline max-w-xl mx-auto text-center">We're here and ready to help — reach out any way you prefer.</p>
          <div className="abh-divider" />
        </div>
      </section>

      <section className="px-4 md:px-8 pb-16">
        <div className="max-w-[980px] mx-auto grid md:grid-cols-2 gap-10 items-stretch">
          <div className="flex flex-col justify-between gap-6">
            <ScrollBounce>
              <div className="text-center">
                <h2 className="abh-section-heading mb-1">Get In Touch</h2>
                <p className="abh-body">WhatsApp, call, email or visit us in {BIZ.location}.</p>
              </div>
            </ScrollBounce>

            {/* Contact cards — icon is now raw (no colored bg chip),
                and the value text (e.g. the email address) no longer
                truncates. It wraps cleanly onto a second line instead
                of being cut off or overflowing the card. Card height is
                no longer fixed to a single-line assumption, so nothing
                overlaps below it. */}
            <div className="grid grid-cols-3 gap-3 items-stretch">
              {GRID_CONTACT_LINKS.map((c, index) => {
                const Icon = CONTACT_ICONS[c.title] ?? Phone
                const dotColor = "dotLight" in c ? (isDark ? c.dotDark : c.dotLight) : c.dot
                return (
                  <ScrollBounce key={c.title} delay={index * 0.08}>
                    <a
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={c.title}
                      className="group flex flex-col items-center justify-center text-center gap-2 p-4 h-full min-h-[104px] abh-card abh-shadow-contact-card border-transparent transition-all duration-200 active:scale-[0.97]"
                      style={{ borderColor: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = dotColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
                    >
                      <Icon size={22} weight="fill" aria-hidden="true" style={{ color: dotColor }} />
                      <div className="min-w-0 w-full">
                        <p className="text-base font-medium text-zinc-800 dark:text-zinc-200 truncate">{c.title}</p>
                        <p className="abh-muted text-sm leading-snug break-words">{c.value}</p>
                      </div>
                    </a>
                  </ScrollBounce>
                )
              })}
            </div>

            <ScrollBounce delay={0.24}>
              <div className="rounded-[14px] overflow-hidden" style={{ boxShadow: "0 2px 16px -2px rgba(0,0,0,0.10), 0 1px 4px -1px rgba(0,0,0,0.06)" }}>
                <LocationMap />
              </div>
            </ScrollBounce>

            <ScrollBounce delay={0.1}>
              <div className="abh-card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <AddressBook size={22} weight="fill" aria-hidden="true" style={{ color: greyColor }} />
                  <div className="min-w-0">
                    <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">Save Our Contact</p>
                    <p className="abh-muted">Add ApexbytesHub to your phone</p>
                  </div>
                </div>
                <button
                  onClick={handleVCard}
                  aria-label={vcardDone ? "Contact saved" : "Download contact card"}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-[14px] font-medium text-base text-white transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND.blue }}
                >
                  <DownloadSimple size={16} weight="bold" aria-hidden="true" />
                  {vcardDone ? "Saved!" : "Download"}
                </button>
              </div>
            </ScrollBounce>

            <ScrollBounce delay={0.15}>
              <div className="abh-card p-5 flex-1">
                <span className="text-[0.78rem] font-black uppercase tracking-widest flex items-center gap-1.5 mb-3" style={{ color: greyColor }}>
                  <Clock weight="fill" size={14} aria-hidden="true" /> Business Hours
                </span>
                <div className="space-y-3">
                  <div>
                    <p className="text-[0.78rem] font-black uppercase tracking-widest text-zinc-500 mb-1">{HOURS.printAndDoc.label}</p>
                    <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">{HOURS.printAndDoc.hours}</p>
                    <p className="flex items-center gap-1.5 text-sm font-medium mt-1" style={{ color: BRAND.blue }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: BRAND.blue }} aria-hidden="true" />
                      Open on public holidays
                    </p>
                  </div>
                  <div>
                    <p className="text-[0.78rem] font-black uppercase tracking-widest text-zinc-500 mb-1">{HOURS.techDesignEservice.label}</p>
                    {HOURS.techDesignEservice.lines.map((l) => (
                      <p key={l} className="text-base font-medium text-zinc-700 dark:text-zinc-300">{l}</p>
                    ))}
                    <p className="flex items-center gap-1.5 text-sm font-medium mt-1 text-zinc-500 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-zinc-400 dark:bg-zinc-500" aria-hidden="true" />
                      Sunday &amp; Public Holidays · Closed
                    </p>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[0.78rem] font-black uppercase tracking-widest text-zinc-400 mb-2">Current Status</p>
                    <BusinessStatusFull />
                  </div>
                </div>
              </div>
            </ScrollBounce>
          </div>

          <ScrollBounce delay={0.2}>
            <div ref={formCardRef} className="abh-card p-8 flex flex-col h-full rounded-[14px]">
              <h2 className="abh-section-heading mb-2">Send a Message</h2>
              {prefilled && (
                <p className="flex items-center gap-1.5 text-[0.84rem] font-bold mb-4" style={{ color: greyColor }}>
                  <Sparkle size={14} weight="fill" aria-hidden="true" />
                  Prefilled from the gallery — feel free to edit before sending
                </p>
              )}
              <div className={cn("flex flex-col gap-4 flex-1", !prefilled && "mt-4")}>
                {[
                  { label: "Your Name", type: "text", key: "name", validate: isNameValid, error: "Name too short" },
                  { label: "Phone Number", type: "tel", key: "phone", validate: isPhoneValid, error: "Invalid phone number" },
                ].map((f) => {
                  const rawValue = formData[f.key as keyof typeof formData]
                  const err = touched[f.key] && !f.validate(rawValue)
                  const errMessage = !rawValue.trim() ? "This field is required." : f.error
                  return (
                    <div key={f.key}>
                      <label htmlFor={`contact-${f.key}`} className="abh-label block mb-1.5">{f.label}</label>
                      <input
                        id={`contact-${f.key}`}
                        type={f.type}
                        value={rawValue}
                        aria-invalid={err}
                        className={cn(
                          "w-full px-4 py-3 border rounded-[14px] bg-white dark:bg-zinc-900 text-base font-medium text-zinc-800 dark:text-zinc-200 transition-all outline-none",
                          err ? "border-red-500" : "border-zinc-100 dark:border-zinc-800 focus:border-brand-blue"
                        )}
                        onBlur={() => setTouched({ ...touched, [f.key]: true })}
                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      />
                      {err && <FieldErrorTooltip message={errMessage} />}
                    </div>
                  )
                })}

                <div>
                  <label className="abh-label block mb-1.5">Service Needed</label>
                  <HubSelect value={formData.service} onChange={(val) => setFormData({ ...formData, service: val })} />
                </div>

                <div className="flex-1 flex flex-col">
                  <label htmlFor="contact-message" className="abh-label block mb-1.5">Your Message</label>
                  <div className={cn("flex-1 flex flex-col rounded-[14px]", glowActive && "abh-inquire-glow-active")} style={{ ["--glow-color" as any]: glowColor }}>
                    <textarea
                      id="contact-message"
                      aria-invalid={touched.message && !isMessageValid(formData.message)}
                      className={cn(
                        "w-full flex-1 px-4 py-3 border rounded-[14px] bg-white dark:bg-zinc-900 text-base font-medium text-zinc-800 dark:text-zinc-200 transition-all outline-none resize-none",
                        touched.message && !isMessageValid(formData.message) ? "border-red-500" : "border-zinc-100 dark:border-zinc-800 focus:border-brand-blue"
                      )}
                      rows={4}
                      value={formData.message}
                      onBlur={() => setTouched({ ...touched, message: true })}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  {touched.message && !isMessageValid(formData.message) && (
                    <FieldErrorTooltip message={!formData.message.trim() ? "This field is required." : "Message too short"} />
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="mt-auto w-full py-4 rounded-[14px] font-black text-base text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg"
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