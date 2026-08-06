"use client"

import { useState } from "react"
import { CaretDown } from "@phosphor-icons/react"
import { FAQS } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { ScrollBounce } from "@/components/scroll-bounce"

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
                <div
                  className={cn(
                    "rounded-[14px] border transition-all duration-200",
                    isOpen
                      ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60"
                      : "border-transparent bg-white dark:bg-zinc-900/20 hover:border-zinc-100 dark:hover:border-zinc-800"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`contact-faq-${index}`}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition-colors"
                  >
                    <h4 className="text-[1.2rem] font-black text-zinc-800 dark:text-zinc-100 leading-snug">
                      {faq.question}
                    </h4>
                    <CaretDown
                      weight="bold"
                      aria-hidden="true"
                      className={cn(
                        "w-3.5 h-3.5 shrink-0 text-zinc-400 transition-transform duration-300",
                        isOpen ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </button>
                  <div
                    id={`contact-faq-${index}`}
                    role="region"
                    aria-label={faq.question}
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5 pt-1 text-[1.1rem] text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
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
