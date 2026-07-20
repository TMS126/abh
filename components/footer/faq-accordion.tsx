"use client"

import { CaretDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { FAQS } from "@/lib/brand"

export function FaqAccordion({
  isOpen,
  onToggle,
  openIndex,
  onToggleIndex,
}: {
  isOpen: boolean
  onToggle: () => void
  openIndex: number | null
  onToggleIndex: (i: number) => void
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="faq-accordion-panel"
        className={cn(
          "inline-flex items-center gap-2 text-[0.75rem] font-black text-zinc-700 dark:text-zinc-200 hover:text-brand-blue transition-colors px-6 py-3 rounded-full border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900",
          "shadow-[0_8px_20px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.06)]",
          "dark:shadow-[0_8px_20px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.3)]"
        )}
      >
        Frequently Asked Questions
        <CaretDown
          className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id="faq-accordion-panel"
        className={cn(
          "grid w-full max-w-md transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden space-y-2">
          {FAQS.map((faq, i) => {
            const open = openIndex === i
            return (
              <div
                key={i}
                className={cn(
                  "rounded-[14px] border transition-all duration-200",
                  open
                    ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60"
                    : "border-transparent bg-white dark:bg-zinc-900/20 hover:border-zinc-100 dark:hover:border-zinc-800"
                )}
              >
                <button
                  onClick={() => onToggleIndex(i)}
                  aria-expanded={open}
                  aria-controls={`faq-inner-${i}`}
                  className="flex items-center justify-between w-full text-left gap-4 px-5 py-4"
                >
                  <h4 className="text-[0.85rem] font-black text-zinc-800 dark:text-zinc-100 leading-snug">
                    {faq.question}
                  </h4>
                  <CaretDown
                    className={cn(
                      "w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200",
                      open && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-inner-${i}`}
                  role="region"
                  aria-label={faq.question}
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-1 text-[0.8rem] text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
