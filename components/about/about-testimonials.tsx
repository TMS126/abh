// components/about/about-testimonials.tsx
"use client"

import { useState } from "react"
import { Quotes, Star, UserCircle } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { SAMPLE_REVIEWS } from "@/components/testimonials-section"
import { ScrollBounce } from "@/components/scroll-bounce"

function CompactTestimonials() {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-5" aria-label="What clients say">
      {SAMPLE_REVIEWS.map((r, i) => {
        const isHovered = hovered === i
        return (
          <ScrollBounce key={r.name + i} delay={i * 0.1}>
            <li
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              className={cn(
                "rounded-[14px] bg-card p-5 flex flex-col items-center text-center outline-none transition-all duration-300 abh-shadow-elevated",
                isHovered && "-translate-y-1.5 shadow-lg"
              )}
            >
              <Quotes size={16} weight="fill" className="mb-2 opacity-30 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
              <p className="text-[0.92rem] font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">{r.quote}</p>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                aria-hidden="true"
              >
                <UserCircle size={30} weight="fill" />
              </div>
              <p className="text-[0.9rem] font-black text-zinc-800 dark:text-zinc-200">{r.name}</p>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    size={11}
                    weight="fill"
                    className={si < r.rating ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-200 dark:text-zinc-700"}
                  />
                ))}
              </div>
            </li>
          </ScrollBounce>
        )
      })}
    </ul>
  )
}

export function AboutTestimonials({ isDark }: { isDark: boolean }) {
  return (
    <section className="py-14 md:py-16 px-4 md:px-8 border-t border-zinc-100 dark:border-zinc-800/60" aria-labelledby="about-testimonials-title">
      <div className="max-w-[980px] mx-auto">
        <ScrollBounce>
          <div className="text-center mb-10">
            <h2 id="about-testimonials-title" className="font-sans font-black text-3xl md:text-4xl tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
              What Our Clients Say
            </h2>
            <p className="abh-tagline max-w-md mx-auto text-center">
              Real people, real services — a few words from the community we serve.
            </p>
            <div className="abh-divider" style={{ maxWidth: "120px" }} />
          </div>
        </ScrollBounce>

        <CompactTestimonials />
      </div>
    </section>
  )
}
