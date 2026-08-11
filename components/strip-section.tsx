// components/strip-section.tsx
"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Rocket, CurrencyDollar, HandHeart, MapPin, WhatsappLogo } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { BRAND, WA, STRIP_ITEMS } from "@/lib/brand"
import { ScrollBounce } from "@/components/scroll-bounce"
import { getReadableTextColor } from "@/lib/color-utils"

export function StripSection() {
  return (
    <section aria-label="Why choose us" className="bg-background py-12 md:py-16 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-[1080px] mx-auto">
        <ScrollBounce>
          <div className="text-center mb-10">
            <p className="text-[0.78rem] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-2">
              Why ApexbytesHub
            </p>
            <h2 className="font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50">
              Fast, Friendly &amp; Local
            </h2>
          </div>
        </ScrollBounce>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {STRIP_ITEMS.map((item, index) => (
            <ScrollBounce key={index} delay={index * 0.08} className="h-full">
              <StripCard item={item} />
            </ScrollBounce>
          ))}
        </div>
      </div>
    </section>
  )
}

function StripCard({ item }: { item: any }) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [hovered, setHovered] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  const color = isDark ? BRAND.lightBlue : BRAND.blue
  const neutralColor = isDark ? "#a1a1aa" : "#71717a"
  const hoverTextColor = getReadableTextColor(color)
  const hoverDescColor = hoverTextColor === "#ffffff" ? "rgba(255,255,255,0.9)" : "rgba(24,24,27,0.75)"

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative rounded-[14px] p-6 transition-all duration-300 group overflow-hidden h-full",
        "abh-shadow-card hover:-translate-y-1"
      )}
      style={{ backgroundColor: hovered ? color : undefined }}
    >
      <div
        className={cn(
          "absolute inset-0 bg-white dark:bg-zinc-900 transition-opacity duration-300 pointer-events-none",
          hovered ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="mb-5 transition-colors duration-300" style={{ color: hovered ? hoverTextColor : neutralColor }}>
          {item.iconName === "Rocket" && <Rocket weight="fill" className="w-6 h-6" aria-hidden="true" />}
          {item.iconName === "CurrencyDollar" && <CurrencyDollar weight="fill" className="w-6 h-6" aria-hidden="true" />}
          {item.iconName === "HandHeart" && <HandHeart weight="fill" className="w-6 h-6" aria-hidden="true" />}
          {item.iconName === "MapPin" && <MapPin weight="fill" className="w-6 h-6" aria-hidden="true" />}
        </div>
        <div>
          <h3 className="font-sans font-semibold text-base mb-1 transition-colors duration-300" style={{ color: hovered ? hoverTextColor : undefined }}>
            <span className={hovered ? "" : "text-zinc-800 dark:text-zinc-200"}>{item.title}</span>
          </h3>
          <p className="text-base leading-relaxed transition-colors duration-300" style={{ color: hovered ? hoverDescColor : undefined }}>
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
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  const ctaBlue = isDark ? BRAND.lightBlue : BRAND.blue
  const ctaTextOnBlue = getReadableTextColor(ctaBlue)

  return (
    <section aria-label="Call to action" className="px-4 md:px-8 py-16 transition-colors duration-300 bg-background">
      <ScrollBounce className="max-w-[750px] mx-auto">
        <div className="abh-card px-10 py-14 text-center bg-brand-blue/10 border-brand-blue/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-brand-blue rounded-full blur-[100px] opacity-10 -ml-28 -mb-28" aria-hidden="true" />

          {/* "Get In Touch" is a label badge, not a WhatsApp action —
              stays blue on purpose. */}
          <span
            className="text-[0.84rem] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block relative z-10"
            style={{ backgroundColor: ctaBlue, color: ctaTextOnBlue }}
          >
            Get In Touch
          </span>

          <h2 className="abh-section-heading text-3xl mb-4 relative z-10">{title}</h2>
          <p className="abh-body text-xl max-w-[500px] mx-auto mb-10 relative z-10">{description}</p>
          <div className="flex justify-center relative z-10">
            {/* FIX: this button opens WhatsApp but was styled blue — now
                the shared .abh-wa-btn class (this is what Home's
                "WhatsApp Us Now" and Services' "Chat With Us" both render
                through, so this one swap fixes both pages). */}
            <a
              href={buttonHref || WA.general}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onButtonClick}
              className="abh-wa-btn text-lg px-8 py-4 shadow-xl hover:scale-[1.04] hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
            >
              <WhatsappLogo weight="fill" className="w-6 h-6 shrink-0" aria-hidden="true" />
              {buttonText}
            </a>
          </div>
        </div>
      </ScrollBounce>
    </section>
  )
          } 
