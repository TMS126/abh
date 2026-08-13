// components/about/about-standards.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ABOUT_STANDARDS } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"
import { renderIcon } from "@/components/about/about-icons"

export function AboutStandards({ blueColor, neutralColor }: { blueColor: string; neutralColor: string }) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="py-14 md:py-16 px-4 md:px-8 bg-zinc-50/60 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800/60" aria-labelledby="standards-title">
      <div className="max-w-[980px] mx-auto">
        <ScrollBounce>
          <div className="text-center mb-10">
            <h2 id="standards-title" className="font-sans font-black text-3xl md:text-4xl tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              Our Everyday Toolkit
            </h2>
            <p className="abh-tagline max-w-md mx-auto text-center">
              Professional accuracy, hand-finished local care — how we actually do the work.
            </p>
            <div className="abh-divider" style={{ maxWidth: "120px" }} />
          </div>
        </ScrollBounce>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5" aria-label="Standards">
          {ABOUT_STANDARDS.map((item, index) => {
            const isHovered = hoveredCard === item.id
            return (
              <ScrollBounce key={item.id} delay={index * 0.1}>
                <li
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onFocus={() => setHoveredCard(item.id)}
                  onBlur={() => setHoveredCard(null)}
                  tabIndex={0}
                  className={cn(
                    "abh-card p-6 flex flex-col h-full outline-none transition-all duration-300 rounded-[14px] abh-shadow-elevated",
                    isHovered && "-translate-y-1.5 shadow-lg"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-[12px] flex items-center justify-center mb-5 transition-all duration-300 border shrink-0",
                      isHovered ? "text-white border-transparent scale-110" : "border-transparent"
                    )}
                    style={isHovered ? { backgroundColor: blueColor, color: "#ffffff" } : { backgroundColor: `${neutralColor}15`, color: neutralColor }}
                    aria-hidden="true"
                  >
                    {renderIcon(item.iconName, "w-5 h-5")}
                  </div>
                  <h3 className="font-sans font-semibold text-base leading-tight mb-2 text-zinc-800 dark:text-zinc-200">{item.title}</h3>
                  <p className="abh-body text-sm leading-relaxed grow">{item.description}</p>
                </li>
              </ScrollBounce>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
