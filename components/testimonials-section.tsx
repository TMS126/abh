"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Star, Quotes, WhatsappLogo, CaretLeft, CaretRight, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { HUB_COLORS, HubKey, BIZ } from "@/lib/brand"
import { HubId } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"

function HubIcon({ id, size = 12, color }: { id: HubId; size?: number; color?: string }) {
  const p = { size, weight: "fill" as const, color: color ?? "currentColor", "aria-hidden": true }
  switch (id) {
    case "print":    return <Printer    {...p} />
    case "doc":      return <FileText   {...p} />
    case "design":   return <PaintBrush {...p} />
    case "eservice": return <Globe      {...p} />
    case "tech":     return <Desktop    {...p} />
  }
}

interface Review {
  name: string
  initials: string
  hubId: HubId
  serviceUsed: string
  rating: number
  quote: string
}

export const SAMPLE_REVIEWS: Review[] = [
  {
    name: "Sethembiso",
    initials: "SM",
    hubId: "doc",
    serviceUsed: "CV Writing & Design",
    rating: 5,
    quote: "They got my CV finished quickly and made sure it was ready before I even needed it. My mother called to say thank you for the great work — I'm really happy with how it turned out.",
  },
  {
    name: "Tseleng",
    initials: "TL",
    hubId: "doc",
    serviceUsed: "CV Printing",
    rating: 5,
    quote: "Quick and easy — my CV was printed and ready with no fuss at all. Thanks a lot for the help!",
  },
  {
    name: "Phumzile",
    initials: "PS",
    hubId: "doc",
    serviceUsed: "CV Job Seeker Package",
    rating: 5,
    quote: "The job seeker package came out sharp, exactly what I needed. Really happy with it, thank you!",
  },
]

function Stars({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          weight="fill"
          style={{ color: i < rating ? color : undefined }}
          className={i < rating ? "" : "text-zinc-200 dark:text-zinc-700"}
        />
      ))}
    </div>
  )
}

export function TestimonialsSection({
  reviews = SAMPLE_REVIEWS,
  title = "What Our Clients Say",
  subtitle = "Real people, real services — here's how we've helped the Kgotsong community.",
}: {
  reviews?: Review[]
  title?: string
  subtitle?: string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const n = reviews.length

  const [active, setActive] = useState(0)
  const [dragX, setDragX] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((i: number) => setActive(((i % n) + n) % n), [n])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])
  const next = useCallback(() => goTo(active + 1), [active, goTo])

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    setDragX(e.touches[0].clientX - touchStartX.current)
  }
  const onTouchEnd = () => {
    if (Math.abs(dragX) > 60) (dragX < 0 ? next() : prev())
    setDragX(0)
    touchStartX.current = null
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); prev() }
    if (e.key === "ArrowRight") { e.preventDefault(); next() }
  }

  const colorFor = (i: number) => {
    const c = HUB_COLORS[reviews[i].hubId as HubKey]
    return isDark ? c.tagTextDark : c.tagText
  }
  const solidFor = (i: number) => HUB_COLORS[reviews[i].hubId as HubKey].tagText

  const slotStyle = (offset: number): React.CSSProperties => {
    const abs = Math.abs(offset)
    if (abs === 0) {
      return {
        transform: `translateX(${dragX}px) scale(1)`,
        opacity: 1,
        zIndex: 30,
        filter: "none",
      }
    }
    if (abs === 1) {
      return {
        transform: `translateX(${offset * 78 + dragX * 0.4}%) scale(0.88) rotate(${offset * 2}deg)`,
        opacity: 0.55,
        zIndex: 20,
        filter: "blur(1.5px)",
      }
    }
    return {
      transform: `translateX(${offset * 130}%) scale(0.78)`,
      opacity: 0,
      zIndex: 10,
      filter: "blur(2px)",
      pointerEvents: "none",
    }
  }

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-[1300px] mx-auto">
        <ScrollBounce>
          <div className="text-center mb-12">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-2">
              Testimonials
            </p>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50 mb-3">{title}</h2>
            <p className="text-sm md:text-base font-medium text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">{subtitle}</p>
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.1}>
          <div
            ref={containerRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="relative w-full max-w-[640px] mx-auto h-[440px] sm:h-[420px] focus:outline-none rounded-[20px] focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            style={{ ["--tw-ring-color" as any]: colorFor(active) }}
          >
            {reviews.map((r, i) => {
              let offset = i - active
              if (offset > n / 2) offset -= n
              if (offset < -n / 2) offset += n
              if (Math.abs(offset) > 2) return null

              const accent = colorFor(i)
              const solid = solidFor(i)
              const isActive = offset === 0

              return (
                <div
                  key={r.name + i}
                  aria-hidden={!isActive}
                  className="absolute inset-0 transition-[transform,opacity,filter] duration-500 ease-out"
                  style={slotStyle(offset)}
                >
                  <div
                    onClick={() => !isActive && goTo(i)}
                    className="h-full rounded-[20px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center px-8 sm:px-12 py-6 overflow-hidden"
                    style={{
                      cursor: isActive ? "default" : "pointer",
                      boxShadow: isActive
                        ? `0 30px 60px -20px rgba(0,0,0,0.22), 0 10px 24px -8px rgba(0,0,0,0.12), 0 0 0 1px ${accent}10`
                        : "0 10px 30px -12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Quotes size={22} weight="fill" style={{ color: accent }} className="mb-3 opacity-40 shrink-0" />

                    <p className="text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 max-w-[46ch]">
                      {r.quote}
                    </p>

                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white mb-1.5 shrink-0"
                      style={{ backgroundColor: solid }}
                    >
                      {r.initials}
                    </div>

                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{r.name}</p>

                    <span
                      className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5"
                      style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                      <HubIcon id={r.hubId} size={10} />
                      {r.serviceUsed}
                    </span>

                    <div className="mt-2">
                      <Stars rating={r.rating} color={accent} />
                    </div>
                  </div>
                </div>
              )
            })}

            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-40 w-9 h-9 rounded-full items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ ["--tw-ring-color" as any]: colorFor(active) }}
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-40 w-9 h-9 rounded-full items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ ["--tw-ring-color" as any]: colorFor(active) }}
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </ScrollBounce>

        <div role="tablist" aria-label="Choose testimonial" className="flex items-center justify-center gap-2 mt-6">
          {reviews.map((_, i) => {
            const isActive = i === active
            const accent = colorFor(i)
            return (
              <button
                key={i}
                role="tab"
                aria-selected={isActive}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className="h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  width: isActive ? "22px" : "8px",
                  backgroundColor: isActive ? accent : undefined,
                  ["--tw-ring-color" as any]: accent,
                }}
              >
                <span
                  className={isActive ? "sr-only" : "block h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700"}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>

        <div className="flex justify-center mt-8">
          <a
            href={`https://wa.me/${BIZ.phoneE164.replace("+", "")}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <WhatsappLogo size={16} weight="fill" style={{ color: "#25D366" }} />
            Been helped by us? Send us your story/feedback on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
                  } 
