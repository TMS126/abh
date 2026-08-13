// components/about/about-header.tsx
"use client"

import { useState } from "react"
import { BIZ } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

export function AboutHeader({ blueColor, blueOnPage }: { blueColor: string; blueOnPage: string }) {
  const [statsHovered, setStatsHovered] = useState(false)

  return (
    <section className="px-4 md:px-8 pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center">
      <div className="max-w-[1248px] mx-auto flex flex-col items-center">
        <ScrollBounce>
          <h1 className="abh-page-title mb-3">About Us</h1>
        </ScrollBounce>

        <p className="abh-tagline max-w-xl mx-auto">
          A local business built on community, trust, and real help — right here in Kgotsong.
        </p>

        <div className="abh-divider" />

        <ScrollBounce delay={0.1}>
          <div
            className="mt-8 w-full max-w-[560px] mx-auto grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700 rounded-[14px] overflow-hidden shadow-lg transition-colors duration-300"
            onMouseEnter={() => setStatsHovered(true)}
            onMouseLeave={() => setStatsHovered(false)}
          >
            {[
              { value: BIZ.hubCount, label: "Service Hubs" },
              { value: BIZ.serviceCount, label: "Services" },
              { value: "Since 2023", label: "Est. Kgotsong" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-5 px-3 transition-colors duration-300 cursor-default"
                style={{ backgroundColor: statsHovered ? `${blueColor}12` : "transparent" }}
              >
                <p className="font-sans font-black text-2xl leading-none transition-colors duration-300" style={{ color: blueOnPage }}>
                  {s.value}
                </p>
                <p
                  className="text-[0.74rem] font-medium uppercase tracking-widest mt-1.5 text-center transition-colors duration-300"
                  style={{ color: `${blueOnPage}cc` }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollBounce>
      </div>
    </section>
  )
}
