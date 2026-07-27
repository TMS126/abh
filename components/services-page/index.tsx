"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
    <div className="relative mx-auto w-full max-w-md mb-10 rounded-[14px] border border-brand-orange/20 bg-brand-orange/5 dark:bg-brand-orange/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="w-9 h-9 rounded-[10px] bg-brand-orange flex items-center justify-center shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <span className="abh-eyebrow text-brand-orange block mb-1">Notice to Clients</span>
        <p className="abh-body text-[0.84rem]">
          {NOTICE.text}
          <span className="font-black text-zinc-800 dark:text-zinc-100">{NOTICE.date}</span>
          {NOTICE.textAfter}
        </p>
      </div>
    </div>
  )
}

// ─── Closing tagline ──────────────────────────────────────────────────────────
function ClosingTagline() {
  return (
    <div className="relative mt-2 mb-4 overflow-hidden rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-[#1E6FA8]/5 dark:bg-[#1E6FA8]/10 px-6 py-10 md:py-12 text-center abh-shadow-card">
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
  const router       = useRouter()
  const consumedHubParam = useRef<string | null>(null)

  const [activeHub,       setActiveHub]       = useState<HubId | null>(null)
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
  const [showBackToTop,   setShowBackToTop]   = useState(false)
  const [hoveredMainHub,  setHoveredMainHub]  = useState<HubId | null>(null)

  const handleSelectService = (svc: SelectedService) => {
    trackEvent("view_service", {
      hub_id:        svc.hubId,
      service_name:  svc.name,
      section_title: svc.sectionTitle,
    })
    setSelectedService(svc)
  }

  const handleOpenHub = (hubId: HubId) => {
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setActiveHub(hubId)
  }

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Global service-select event (fired by QuoteCalculatorWidget et al.)
  useEffect(() => {
    const handler = (e: Event) => {
      const svc = (e as CustomEvent<SelectedService>).detail
      if (svc) handleSelectService(svc)
    }
    window.addEventListener("abh:selectService", handler)
    return () => window.removeEventListener("abh:selectService", handler)
  }, [])

  // Deep-link via ?hub= query param — consumed once, then stripped from the
  // URL immediately so it can't reopen the hub on a back-nav or fresh visit.
  useEffect(() => {
    const hubParam = searchParams.get("hub")
    if (hubParam && HUB_ORDER.includes(hubParam as HubId) && consumedHubParam.current !== hubParam) {
      consumedHubParam.current = hubParam
      setActiveHub(hubParam as HubId)
      router.replace("/services", { scroll: false })
    }
  }, [searchParams, router])

  useModalBackStack(activeHub, setActiveHub, selectedService, setSelectedService)

  // Scroll lock while any modal is open
  useEffect(() => {
    const isOpen = !!(activeHub || selectedService)
    if (!isOpen) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"
    style.top      = `-${scrollY}px`
    style.left     = "0"
    style.right    = "0"
    style.width    = "100%"
    style.overflow = "hidden"
    return () => {
      style.position = ""
      style.top      = ""
      style.left     = ""
      style.right    = ""
      style.width    = ""
      style.overflow = ""
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
            <p className="abh-tagline max-w-xl mx-auto">
              Explore our ecosystem. Tap a hub to view all available services and instant pricing.
            </p>
            <div className="abh-divider mx-auto" />
          </div>
        </ScrollBounce>

        {/* Inline search */}
        <ScrollBounce delay={0.08} className="w-full mb-10 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        {/* Notice */}
        <ScrollBounce delay={0.14} className="w-full">
          <div className="w-full"><NoticeBanner /></div>
        </ScrollBounce>

        {/* Hub cards — full-width horizontal stack matching the pricing page layout */}
        <div className="flex flex-col gap-3 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub       = HUBS[hubId]
            const colors    = HUB_COLORS[hubId as HubKey]
            const accent    = isDark ? colors.accentDark : colors.accentLight
            const isHovered = hoveredMainHub === hubId
            const neutralBg = isDark ? "rgba(161,161,170,0.12)" : "rgba(113,113,122,0.08)"
            const neutralFg = isDark ? "#a1a1aa" : "#71717a"

            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <button
                  onClick={() => handleOpenHub(hubId)}
                  onMouseEnter={() => setHoveredMainHub(hubId)}
                  onMouseLeave={() => setHoveredMainHub(null)}
                  aria-label={`Open ${hub.title}`}
                  className="group abh-shadow-card flex flex-row items-center gap-4 px-5 py-4 rounded-[14px] border bg-white dark:bg-zinc-950 transition-all duration-300 active:scale-[0.99] text-left w-full"
                  style={{ borderColor: isHovered ? accent : undefined }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: isHovered ? `${accent}15` : neutralBg,
                      color:           isHovered ? accent : neutralFg,
                    }}
                  >
                    <HubIcon id={hubId} size={24} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-sans font-black text-[1.05rem] text-zinc-900 dark:text-zinc-50 leading-tight mb-1 transition-colors"
                      style={{ color: isHovered ? accent : undefined }}
                    >
                      {hub.title}
                    </h3>
                    <p className="abh-body text-[0.78rem] line-clamp-2 leading-snug mb-1.5">
                      {hub.desc}
                    </p>
                    {/* Service preview hints */}
                    <div className="flex flex-wrap gap-x-2.5">
                      {HUB_PREVIEWS[hubId].map((hint, i) => (
                        <span
                          key={i}
                          className="text-[0.62rem] font-medium text-zinc-400 dark:text-zinc-500"
                        >
                          {hint}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Explore bar — right-aligned, animates wider on hover */}
                  <div className="flex flex-col items-end shrink-0 self-end pb-1">
                    <div
                      className="h-[3px] rounded-full transition-all duration-300"
                      style={{
                        width:           isHovered ? "3rem" : "2.5rem",
                        backgroundColor: accent,
                      }}
                    />
                  </div>
                </button>
              </ScrollBounce>
            )
          })}
        </div>

        {/* Closing tagline */}
        <ScrollBounce className="w-full">
          <div className="w-full"><ClosingTagline /></div>
        </ScrollBounce>
      </div>

      {/* Modals — single guarded render each, inside AnimatePresence for exit animations */}
      <AnimatePresence>
        {activeHub && (
          <HubModal key="hub-modal" hubId={activeHub} onClose={() => setActiveHub(null)} onSelectService={handleSelectService} />
        )}
        {selectedService && (
          <ServiceDetailModal key={selectedService.name} svc={selectedService} onClose={() => setSelectedService(null)} />
        )}
      </AnimatePresence>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 left-4 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
          showBackToTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <ArrowUp size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
      </button>
    </section>
  )
        } 
