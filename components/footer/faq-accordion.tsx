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
      {/*
        Morphing container: narrow pill when closed, full-width card when open.
        max-width, border-radius, and shadow all transition together.
      */}
      <div
        className={cn(
          "w-full overflow-hidden border transition-[border-color,background-color,box-shadow] duration-300 ease-in-out",
          isOpen
            ? "max-w-2xl bg-white dark:bg-zinc-900/80 border-zinc-100 dark:border-zinc-800 shadow-lg"
            : "max-w-[120px] bg-white dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-700/50 shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.22)]"
        )}
        style={{
          borderRadius: isOpen ? "18px" : "999px",
          transition:
            "max-width 320ms ease-out, border-radius 320ms ease-out, border-color 250ms, background-color 250ms, box-shadow 250ms",
        }}
      >
        {/* Pill / card header button */}
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls="faq-accordion-panel"
          className={cn(
            "w-full flex items-center gap-2 transition-all duration-300",
            isOpen
              ? "px-6 py-4 justify-between text-[0.9rem] font-semibold text-zinc-700 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800"
              : "px-5 py-2.5 justify-center text-[0.84rem] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          )}
        >
          <span className={cn("whitespace-nowrap", isOpen && "text-left")}>{isOpen ? "Frequently Asked Questions" : "FAQs"}</span>
          <CaretDown
            className={cn(
              "w-3.5 h-3.5 shrink-0 text-zinc-400",
              isOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/* Expandable panel — grid-rows accordion technique */}
        <div
          id="faq-accordion-panel"
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="p-4 space-y-2">
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
                      <h4 className="text-[1.2rem] font-black text-zinc-800 dark:text-zinc-100 leading-snug">
                        {faq.question}
                      </h4>
                      <CaretDown
                        className={cn("w-3.5 h-3.5 text-zinc-400 shrink-0", open && "rotate-180")}
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
                        <div className="px-5 pb-5 pt-1 text-[1.1rem] text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
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
      </div>
    </div>
  )
}
