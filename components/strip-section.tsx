"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Rocket, CurrencyDollar, HandHeart, MapPin, WhatsappLogo } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, WA, STRIP_ITEMS } from "@/lib/brand"

// Icon accent per strip item — kept here rather than in STRIP_ITEMS (brand.ts)
// since that array is content-only per its own convention; styling stays in
// the component. Each entry is a light/dark pair, verified against the
// chip's own tinted background (color+"15") sitting on white (light mode)
// or zinc-900 (dark mode) — a flat single color failed AA in dark mode for
// darker brand tones (same issue found with blueDark/dark100 elsewhere).
const STRIP_ICON_COLORS: Record<string, { light: string; dark: string }> = {
  Rocket:         { light: BRAND.blue,       dark: BRAND.lightBlue   },
  CurrencyDollar: { light: BRAND.greenDark,  dark: BRAND.lightGreen  },
  HandHeart:      { light: BRAND.orangeDark, dark: BRAND.lightOrange },
  MapPin:         { light: BRAND.blueMid,    dark: BRAND.lightBlue   },
}

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
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === "dark"

  const pair  = STRIP_ICON_COLORS[item.iconName] ?? { light: BRAND.blue, dark: BRAND.lightBlue }
  const color = isDark ? pair.dark : pair.light

  return (
    <div
      className={cn(
        "rounded-[14px] border p-6 transition-all duration-300 group",
        "bg-white dark:bg-zinc-900",
        "border-zinc-100 dark:border-zinc-800",
        "shadow-sm hover:-translate-y-1 hover:shadow-lg"
      )}
    >
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mb-5 transition-colors duration-300"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {item.iconName === "Rocket"          && <Rocket          weight="fill" className="w-5 h-5" aria-hidden="true" />}
        {item.iconName === "CurrencyDollar"  && <CurrencyDollar  weight="fill" className="w-5 h-5" aria-hidden="true" />}
        {item.iconName === "HandHeart"       && <HandHeart       weight="fill" className="w-5 h-5" aria-hidden="true" />}
        {item.iconName === "MapPin"          && <MapPin          weight="fill" className="w-5 h-5" aria-hidden="true" />}
      </div>
      <div>
        <h3 className="font-sans font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-1">{item.title}</h3>
        <p className="abh-body text-sm leading-relaxed">{item.desc}</p>
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
