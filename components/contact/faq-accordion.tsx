"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { CaretDown } from "@phosphor-icons/react"
import { FAQS } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { ScrollBounce } from "@/components/scroll-bounce"
import { CONTACT_GREY } from "@/lib/contact-data"

export function FAQAccordion() {
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
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-[1rem] font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = greyColor }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "" }}
                  >
                    <span className="leading-snug">{faq.question}</span>
                    <CaretDown
                      weight="bold"
                      aria-hidden="true"
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