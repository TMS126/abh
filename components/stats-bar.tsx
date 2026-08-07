"use client"

import { useState } from "react"
import { PlusCircle, Gear, Wrench, CalendarCheck } from "@phosphor-icons/react"
import { BRAND, BIZ } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const contrastWhite = 1.05 / (luminance + 0.05)
  const contrastDark = (luminance + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#18181b"
}

export function StatsBar() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const stats = [
    { icon: PlusCircle,    color: BRAND.blue,       value: BIZ.hubCount,        label: "Hubs" },
    { icon: Gear,          color: BRAND.green,      value: BIZ.serviceCount,    label: "Services" },
    { icon: Wrench,        color: BRAND.orange,     value: "Fast",              label: "Turnaround" },
    { icon: CalendarCheck, color: BRAND.teal,       value: `${new Date().getFullYear() - parseInt(BIZ.yearFounded)}+ yrs`, label: "Experience" },
  ]

  return (
    <section aria-label="Key stats" className="px-4 md:px-8 py-10 md:py-14 transition-colors duration-300">
      <ScrollBounce>
        <p className="text-center text-[0.78rem] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-2">
          By the Numbers
        </p>
        <h2 className="text-center font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50 mb-8">
          What We Bring to the Table
        </h2>
      </ScrollBounce>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-[720px] mx-auto" role="list" aria-label="Key stats">
        {stats.map((stat, i) => {
          const isHov = hoveredCard === i
          const Icon = stat.icon
          const textOnColor = getReadableTextColor(stat.color)
          return (
            <ScrollBounce key={stat.label} delay={i * 0.08}>
              <div
                role="listitem"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setHoveredCard(isHov ? null : i)}
                aria-label={`${stat.value} ${stat.label}`}
                className="abh-card flex flex-col items-center justify-center gap-2 py-6 px-3 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer"
                style={{
                  borderColor: isHov ? stat.color : undefined,
                  backgroundColor: isHov ? stat.color : undefined,
                }}
              >
                <Icon
                  size={24}
                  weight="fill"
                  aria-hidden="true"
                  style={{ color: isHov ? textOnColor : stat.color }}
                  className="mb-0.5 transition-colors duration-300"
                />
                <div
                  className="text-2xl font-black transition-colors duration-300"
                  style={{ color: isHov ? textOnColor : undefined }}
                >
                  <span className={isHov ? "" : "text-zinc-900 dark:text-zinc-50"}>{stat.value}</span>
                </div>
                <div
                  className="text-[0.72rem] font-black uppercase tracking-widest transition-colors duration-300"
                  style={{ color: isHov ? `${textOnColor}cc` : undefined }}
                >
                  <span className={isHov ? "" : "text-zinc-400 dark:text-zinc-500"}>{stat.label}</span>
                </div>
              </div>
            </ScrollBounce>
          )
        })}
      </div>
    </section>
  )
}
