"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Rocket, CurrencyDollar, HandHeart, MapPin, WhatsappLogo } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, WA, STRIP_ITEMS } from "@/lib/brand"

export function StripSection() {
  return (
    <section aria-label="Why choose us" className="bg-background py-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STRIP_ITEMS.map((item, index) => (
          <StripCard key={index} item={item} />
        ))}
      </div>
    </section>
  )
}

function StripCard({ item }: { item: any }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === "dark"

  // All four icons now use a single fixed brand blue (light/dark pair),
  // per request — no longer per-item colors from STRIP_ICON_COLORS.
  const color = isDark ? BRAND.lightBlue : BRAND.blue
  const fillBlue = BRAND.blue

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative rounded-[14px] border p-6 transition-all duration-300 group overflow-hidden",
        "border-zinc-100 dark:border-zinc-800",
        "shadow-sm hover:-translate-y-1 hover:shadow-lg"
      )}
      style={{ backgroundColor: hovered ? fillBlue : undefined }}
    >
      {/* Non-hovered base surface — swapped out via opacity instead of
          className so the blue fill (set as the container's own
          backgroundColor above) can cleanly show through underneath on
          hover, rather than fighting a competing bg-white/bg-zinc-900
          class for priority. */}
      <div
        className={cn(
          "absolute inset-0 bg-white dark:bg-zinc-900 transition-opacity duration-300 pointer-events-none",
          hovered ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mb-5 transition-colors duration-300"
          style={{
            backgroundColor: hovered ? "rgba(255,255,255,0.2)" : `${color}15`,
            color: hovered ? "#ffffff" : color,
          }}
        >
          {item.iconName === "Rocket"          && <Rocket          weight="fill" className="w-5 h-5" aria-hidden="true" />}
          {item.iconName === "CurrencyDollar"  && <CurrencyDollar  weight="fill" className="w-5 h-5" aria-hidden="true" />}
          {item.iconName === "HandHeart"       && <HandHeart       weight="fill" className="w-5 h-5" aria-hidden="true" />}
          {item.iconName === "MapPin"          && <MapPin          weight="fill" className="w-5 h-5" aria-hidden="true" />}
        </div>
        <div>
          <h3
            className="font-sans font-semibold text-sm mb-1 transition-colors duration-300"
            style={{ color: hovered ? "#ffffff" : undefined }}
          >
            <span className={hovered ? "" : "text-zinc-800 dark:text-zinc-200"}>{item.title}</span>
          </h3>
          <p
            className="text-sm leading-relaxed transition-colors duration-300"
            style={{ color: hovered ? "rgba(255,255,255,0.9)" : undefined }}
          >
            <span className={hovered ? "" : "abh-body"}>{item.desc}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function CtaBar({
  title,
  description,
  buttonText,
  buttonHref,
  onButtonClick,
}: {
  title: string
  description: string
  buttonText: string
  buttonHref?: string
  onButtonClick?: () => void
}) {
  return (
    <section aria-label="Call to action" className="px-4 md:px-8 py-16 transition-colors duration-300 bg-background">
      <div className="max-w-[750px] mx-auto">
        <div className="abh-card px-10 py-14 text-center bg-brand-blue/5 border-brand-blue/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue rounded-full blur-[100px] opacity-10 -mr-32 -mt-32" aria-hidden="true" />
          <span className="abh-label text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full mb-6 inline-block">Get In Touch</span>
          <h2 className="abh-section-heading text-2xl mb-4 relative z-10">{title}</h2>
          <p className="abh-body text-lg max-w-[500px] mx-auto mb-10 relative z-10">{description}</p>
          <div className="flex justify-center relative z-10">
            <a
              href={buttonHref || WA.general}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onButtonClick}
              aria-label={buttonText}
              className="abh-wa-btn w-20 h-20 rounded-[18px] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <WhatsappLogo weight="fill" className="w-10 h-10" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
                    } 
