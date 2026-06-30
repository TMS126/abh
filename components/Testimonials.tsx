"use client"

import { Star, Quotes, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { HubId } from "@/lib/data"

function HubIcon({ id, size = 14, color }: { id: HubId; size?: number; color?: string }) {
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
  rating: number // 1–5
  quote: string
}

// ─── PLACEHOLDER REVIEWS ───────────────────────────────────────────────────────
// Sample content only — swap these out for real client quotes whenever
// they're ready. Keep the shape (name, initials, hubId, serviceUsed, rating,
// quote) the same and everything below will render correctly.
export const SAMPLE_REVIEWS: Review[] = [
  {
    name: "Lerato M.",
    initials: "LM",
    hubId: "doc",
    serviceUsed: "CV from Scratch",
    rating: 5,
    quote: "I had never had a proper CV before. They built mine from nothing and I got called for an interview the same week. Patient and explained everything.",
  },
  {
    name: "Sipho K.",
    initials: "SK",
    hubId: "eservice",
    serviceUsed: "SASSA SRD Application",
    rating: 5,
    quote: "I tried doing the SASSA application myself online and kept getting stuck. They sorted it out in minutes and explained what went wrong before.",
  },
  {
    name: "Naledi T.",
    initials: "NT",
    hubId: "design",
    serviceUsed: "Standard Logo",
    rating: 5,
    quote: "Gave them a rough idea for my business and they came back with a logo that actually looks professional. Fast turnaround too.",
  },
  {
    name: "Thabo R.",
    initials: "TR",
    hubId: "print",
    serviceUsed: "Colour Flyer Printing",
    rating: 4,
    quote: "Printed my flyers same day, good quality and fair pricing for bulk. Will be back for my next event.",
  },
  {
    name: "Bongiwe N.",
    initials: "BN",
    hubId: "tech",
    serviceUsed: "Virus / Malware Removal",
    rating: 5,
    quote: "My laptop was almost unusable from all the pop-ups. They cleaned it up and it runs like new. Very honest about what was actually wrong.",
  },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          weight="fill"
          className={i < rating ? "text-amber-400" : "text-zinc-200 dark:text-zinc-700"}
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

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-[1300px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50 mb-3 text-center">{title}</h2>
          <p className="text-sm md:text-base font-medium text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">{subtitle}</p>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 px-1 -mx-1 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
          {reviews.map((r, idx) => {
            const colors = HUB_COLORS[r.hubId as HubKey]
            const accent = isDark ? colors.tagTextDark : colors.tagText
            const solidAccent = colors.tagText // saturated — safe as a solid fill behind white text in either theme

            return (
              <div
                key={idx}
                className="shrink-0 w-[280px] md:w-auto rounded-[14px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] p-6 flex flex-col"
              >
                <Quotes size={22} weight="fill" style={{ color: `${accent}` }} className="mb-3 opacity-50" />

                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1 mb-5">
                  {r.quote}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ backgroundColor: solidAccent }}
                  >
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{r.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${accent}15`, color: accent }}
                      >
                        <HubIcon id={r.hubId} size={10} />
                        {r.serviceUsed}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <Stars rating={r.rating} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
 
