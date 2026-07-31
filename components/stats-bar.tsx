"use client"

import { useState } from "react"
import { PlusCircle, Gear, Wrench } from "@phosphor-icons/react"
import { BRAND, BIZ } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"

// ─── Stats Bar ────────────────────────────────────────────────────────────────
// Restyled to match the Pricing page's card language: raw colored icon
// (no filled circle background behind it), plain bordered white/dark
// surface, accent color reserved for the icon + hover border only —
// rather than the icon flipping to a solid color chip on hover.
export function StatsBar() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const stats = [
    { icon: PlusCircle, color: BRAND.blue,   value: BIZ.hubCount,    label: "Hubs"        },
    { icon: Gear,       color: BRAND.green,  value: BIZ.serviceCount, label: "Services"   },
    { icon: Wrench,     color: BRAND.orange, value: "Fast",           label: "Turnaround" },
  ]

  return (
    <section aria-label="Key stats" className="px-4 md:px-8 py-8 md:py-10 transition-colors duration-300">
      <div
        className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[560px] mx-auto"
        role="list"
        aria-label="Key stats"
      >
        {stats.map((stat, i) => {
          const isHov = hoveredCard === i
          const Icon  = stat.icon
          return (
            <ScrollBounce key={stat.label} delay={i * 0.08}>
              <div
                role="listitem"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setHoveredCard(isHov ? null : i)}
                aria-label={`${stat.value} ${stat.label}`}
                className="abh-card flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-center transition-shadow duration-200 hover:shadow-md cursor-pointer"
                style={{ borderColor: isHov ? stat.color : undefined }}
              >
                {/* Raw icon, no background chip — same treatment as
                    HubIcon on the Pricing page. */}
                <Icon
                  size={22}
                  weight="fill"
                  aria-hidden="true"
                  style={{ color: stat.color }}
                  className="mb-0.5"
                />
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                  {stat.value}
                </div>
                <div className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  {stat.label}
                </div>
              </div>
            </ScrollBounce>
          )
        })}
      </div>
    </section>
  )
      } 
