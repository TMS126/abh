"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { Megaphone, ArrowUp } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"
import { useModalBackStack, HubIcon } from "./shared"
import { InlineSearchBar } from "./search-bar"
import { HubModal } from "./hub-modal"
import { ServiceDetailModal } from "./service-detail-modal"
import { HUB_ORDER, HUB_PREVIEWS, NOTICE, trackEvent, SelectedService } from "./lib"

// ─── Notice Banner ────────────────────────────────────────────────────────────
function NoticeBanner() {
  return (
    <div className="relative mx-auto w-full max-w-md mb-10 rounded-[14px] border border-[#F4A261]/20 bg-[#F4A261]/5 dark:bg-[#F4A261]/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-9 h-9 rounded-[10px] bg-[#F4A261] flex items-center justify-center shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <span className="abh-eyebrow text-[#D9894B] dark:text-[#F4A261] block mb-1">Notice to Clients</span>
        <p className="abh-body text-[0.84rem]">
          {NOTICE.text}<span className="font-black text-zinc-800 dark:text-zinc-100">{NOTICE.date}</span>{NOTICE.textAfter}
        </p>
      </div>
    </div>
  )
}

// ─── Closing tagline ──────────────────────────────────────────────────────────
function ClosingTagline() {
  return (
    <div className="relative mt-2 mb-4 overflow-hidden rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-6 py-10 md:py-12 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#1E6FA8]" />
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Why ApexbytesHub</p>
      <p className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        From your first CV to your next big idea — one hub does it all, right here in Bothaville.
      </p>
    </div>
  )
}

// ─── Services Page ────────────────────────────────────────────────────────────
export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark       = resolvedTheme === "dark"
  const searchParams = useSearchParams()

  const [activeHub,       setActiveHub]       = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
  const [showBackToTop,   setShowBackToTop]   = useState(false)
  const [hoveredMainHub,  setHoveredMainHub]  = useState<HubId | null>(null)

  const handleSelectService = (svc: SelectedService) => {
    trackEvent("view_service", { hub_id: svc.hubId, service_name: svc.name, section_title: svc.sectionTitle })
    setSelectedService(svc)
  }

  const handleOpenHub = (hubId: HubId) => {
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setActiveHub(hubId)
  }

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const svc = (e as CustomEvent<SelectedService>).detail
      if (svc) handleSelectService(svc)
    }
    window.addEventListener("abh:selectService", handler)
    return () => window.removeEventListener("abh:selectService", handler)
  }, [])

  useEffect(() => {
    const hubParam = searchParams.get("hub")
    if (hubParam && HUB_ORDER.includes(hubParam as HubId)) setActiveHub(hubParam as HubId)
  }, [searchParams])

  useModalBackStack(activeHub, setActiveHub, selectedService, setSelectedService)

  // Scroll lock
  useEffect(() => {
    const isOpen = !!(activeHub || selectedService)
    if (!isOpen) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"; style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""; style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [activeHub, selectedService])

  return (
    <section className="min-h-screen bg-white dark:bg-[#081428] transition-colors duration-300 pb-24">
      <div className="max-w-[1248px] mx-auto px-4 md:px-8 flex flex-col items-center">

        {/* Hero */}
        <ScrollBounce className="w-full">
          <div className="pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center w-full">
            <h1 className="abh-page-title mb-3">Our Service Hubs</h1>
            <p className="abh-tagline max-w-xl mx-auto">Explore our ecosystem. Tap a hub to view all available services and instant pricing.</p>
            <div className="abh-divider mx-auto" />
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.08} className="w-full mb-10 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.14} className="w-full">
          <div className="w-full"><NoticeBanner /></div>
        </ScrollBounce>

        {/* Hub cards */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-5 md:gap-4 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub      = HUBS[hubId]
            const colors   = HUB_COLORS[hubId as HubKey]
            const accent   = isDark ? colors.accentDark : colors.accentLight
            const isHovered = hoveredMainHub === hubId
            const neutralIconColor = isDark ? "#a1a1aa" : "#71717a"
            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <button
                  onClick={() => handleOpenHub(hubId)}
                  onMouseEnter={() => setHoveredMainHub(hubId)}
                  onMouseLeave={() => setHoveredMainHub(null)}
                  className="group flex flex-col items-center p-6 md:p-7 rounded-[14px] border bg-white dark:bg-zinc-950 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 text-center w-full h-full"
                  style={{ borderColor: isHovered ? accent : undefined }}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-[14px] flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-md"
                    style={{
                      backgroundColor: isHovered ? `${accent}12` : (isDark ? "rgba(161,161,170,0.12)" : "rgba(113,113,122,0.08)"),
                      color: isHovered ? accent : neutralIconColor,
                    }}
                  >
                    <HubIcon id={hubId} size={32} />
                  </div>

                  {/* Title */}
                  <h3
                    className="font-sans font-black text-lg md:text-xl text-zinc-900 dark:text-zinc-50 mb-2 transition-colors"
                    style={{ color: isHovered ? accent : undefined }}
                  >
                    {hub.title}
                  </h3>

                  <div
                    className="h-[3px] w-10 rounded-full mb-4 transition-all duration-300"
                    style={{ backgroundColor: accent }}
                  />

                  {/* Description */}
                  <p className="abh-body text-[0.82rem] line-clamp-2 mb-5">{hub.desc}</p>

                  {/* Preview hints */}
                  <div className="flex flex-col items-center gap-1 mb-5 px-3 py-2.5 rounded-[10px] bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 w-full">
                    {HUB_PREVIEWS[hubId].map((hint, i) => (
                      <span key={i} className="text-[0.72rem] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">{hint}</span>
                    ))}
                  </div>
                </button>
              </ScrollBounce>
            )
          })}
        </div>

        <ScrollBounce className="w-full">
          <div className="w-full"><ClosingTagline /></div>
        </ScrollBounce>
      </div>

      <HubModal hubId={activeHub} onClose={() => setActiveHub(null)} onSelectService={handleSelectService} />

      <AnimatePresence>
        {selectedService && (
          <ServiceDetailModal key={selectedService.name} svc={selectedService} onClose={() => setSelectedService(null)} />
        )}
      </AnimatePresence>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 left-4 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
          showBackToTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <ArrowUp size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
      </button>
    </section>
  )
}
