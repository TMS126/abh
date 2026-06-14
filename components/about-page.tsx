"use client"

import { useState } from "react"
import { Target, Heart, Lightning, WhatsappLogo, ShieldCheck, Desktop, Printer, Scissors, DeviceMobile } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, BIZ, ABOUT_VALUES, ABOUT_STANDARDS } from "@/lib/brand"

function renderIcon(iconName: string, className: string) {
  switch (iconName) {
    case "Target":       return <Target       weight="bold" className={className} aria-hidden="true" />
    case "Heart":        return <Heart        weight="bold" className={className} aria-hidden="true" />
    case "Lightning":    return <Lightning    weight="bold" className={className} aria-hidden="true" />
    case "Desktop":      return <Desktop      weight="bold" className={className} aria-hidden="true" />
    case "Printer":      return <Printer      weight="bold" className={className} aria-hidden="true" />
    case "Scissors":     return <Scissors     weight="bold" className={className} aria-hidden="true" />
    case "DeviceMobile": return <DeviceMobile weight="bold" className={className} aria-hidden="true" />
    default:             return <Target       weight="bold" className={className} aria-hidden="true" />
  }
}

export function AboutPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <div className="animate-fade-up min-h-screen bg-background transition-colors duration-300 pt-[var(--nav-h)] pb-20">

      <section className="abh-page-header" aria-labelledby="about-title">
        <h1 id="about-title" className="abh-page-title mb-3">About Us</h1>
        <p className="abh-tagline max-w-xl mx-auto">Your local tech & print partner — right here in Kgotsong</p>
        <div className="abh-divider" aria-hidden="true" />
      </section>

      <section className="px-4 md:px-8 py-12 md:py-16" aria-label="Our story">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <h2 className="abh-section-heading mb-4">
              Your <span className="text-brand-orange">Neighbourhood</span> Digital Hub
            </h2>
            <p className="abh-body mb-6">
              {BIZ.name} is a home-based service business in {BIZ.location}. We started with one simple goal: make technology and important services accessible to everyone in our community — no jargon, no stress.
            </p>
            <p className="abh-body mb-8">
              We understand that not everyone is tech-savvy, and that's perfectly okay. That's exactly why we're here — to make things easy, friendly, and affordable.
            </p>

            <ul className="flex flex-col gap-6" aria-label="Our values">
              {ABOUT_VALUES.map((item, index) => (
                <li key={index} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-[14px] bg-brand-green/10 flex items-center justify-center shrink-0" aria-hidden="true">
                    {renderIcon(item.iconName, "w-6 h-6 text-brand-green")}
                  </div>
                  <div>
                    <h3 className="abh-card-heading text-base">{item.title}</h3>
                    <p className="abh-body text-sm mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="abh-card p-8 bg-zinc-50 dark:bg-[#27272A]/50" aria-label="Business overview">
            <h3 className="abh-card-heading text-2xl mb-1">{BIZ.name}</h3>
            <p className="abh-label text-zinc-500 mb-8">Serving Kgotsong & surrounding areas</p>
            <dl className="grid grid-cols-2 gap-4">
              {[
                { value: BIZ.hubCount,                                                                                      label: "Hubs" },
                { value: BIZ.serviceCount,                                                                                  label: "Services" },
                { value: <WhatsappLogo weight="fill" className="w-7 h-7 text-brand-orange" aria-hidden="true" />,           label: "WhatsApp Ready" },
                { value: <ShieldCheck  weight="fill" className="w-7 h-7 text-brand-orange" aria-hidden="true" />,           label: "Community Trusted" },
              ].map((stat, index) => (
                <div key={index} className="bg-white dark:bg-[#18181B] rounded-[14px] p-5 text-center flex flex-col justify-center items-center min-h-[100px] border border-zinc-100 dark:border-[#27272A]">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-black text-3xl text-brand-orange mb-1 flex items-center justify-center">{stat.value}</dd>
                  <div className="abh-label text-[0.6rem]" aria-hidden="true">{stat.label}</div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-zinc-50/50 dark:bg-[#27272A]/20" aria-labelledby="standards-title">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 id="standards-title" className="abh-section-heading mb-4">Our Everyday Toolkit Standards</h2>
            <p className="abh-tagline max-w-xl mx-auto">
              How we combine professional technical accuracy with hand-finished local care.
            </p>
            <div className="abh-divider" aria-hidden="true" />
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Standards">
            {ABOUT_STANDARDS.map((item) => {
              const isHovered = hoveredCard === item.id
              return (
                <li
                  key={item.id}
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onFocus={() => setHoveredCard(item.id)}
                  onBlur={() => setHoveredCard(null)}
                  tabIndex={0}
                  className={cn(
                    "abh-card p-6 transition-all duration-300 flex flex-col h-full outline-none",
                    isHovered ? "border-brand-blue shadow-lg -translate-y-1" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-[14px] flex items-center justify-center mb-6 transition-all duration-300 border",
                      isHovered ? "bg-brand-blue text-white border-transparent" : "bg-white dark:bg-[#18181B] text-brand-blue border-zinc-100 dark:border-[#27272A]"
                    )}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-6 h-6")}
                  </div>
                  <h3 className="abh-card-heading text-base mb-3 leading-tight">{item.title}</h3>
                  <p className="abh-body text-sm leading-relaxed grow">{item.description}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="px-4 md:px-8 py-20 text-center" aria-labelledby="mission-title">
        <div className="max-w-[700px] mx-auto abh-card p-10 bg-zinc-50 dark:bg-[#27272A]/50">
          <span className="abh-label text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-6 inline-block">Our Mission</span>
          <h2 id="mission-title" className="abh-section-heading mb-4">Bridging the Digital Gap in Our Community</h2>
          <p className="abh-body text-lg max-w-xl mx-auto">
            {BIZ.name} is that bridge — bringing printing, design, IT help, and government services to your doorstep.
          </p>
        </div>
      </section>
    </div>
  )
}
