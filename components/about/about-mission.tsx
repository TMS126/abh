// components/about/about-mission.tsx
"use client"

import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react"
import { ScrollBounce } from "@/components/scroll-bounce"

export function AboutMission({
  blueOnPage,
  missionBadgeBg,
  missionBadgeText,
}: {
  blueOnPage: string
  missionBadgeBg: string
  missionBadgeText: string
}) {
  return (
    <section className="px-4 md:px-8 py-16 transition-colors duration-300" aria-labelledby="mission-title">
      <ScrollBounce className="max-w-[750px] mx-auto">
        <div className="abh-card px-10 py-14 text-center bg-brand-blue/10 border-brand-blue/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-brand-blue rounded-full blur-[100px] opacity-10 -ml-28 -mb-28" aria-hidden="true" />

          <span
            className="text-[0.84rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block relative z-10"
            style={{ backgroundColor: missionBadgeBg, color: missionBadgeText }}
          >
            Our Mission
          </span>

          <h2 id="mission-title" className="abh-section-heading text-3xl mb-4 relative z-10">
            Bridging the digital gap — one person at a time.
          </h2>
          <p className="abh-body text-xl max-w-[500px] mx-auto mb-10 relative z-10">
            ApexbytesHub is that bridge — printing, design, IT support, and government services brought to people
            who need them most, in a community that deserves better access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <a href="/services" className="abh-btn-cta w-full sm:w-64 justify-center px-8 py-4">
              See All Services
              <ArrowRight size={16} weight="bold" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-64 px-8 py-4 rounded-[14px] font-black text-base border-2 transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
              style={{ borderColor: blueOnPage, color: blueOnPage }}
            >
              <EnvelopeSimple size={16} weight="bold" />
              Get in Touch
            </a>
          </div>
        </div>
      </ScrollBounce>
    </section>
  )
}
