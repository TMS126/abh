// components/services/services-page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { Megaphone, ArrowUp, ArrowRight, X } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"
import { useModalBackStack } from "./shared"
import { InlineSearchBar } from "./search-bar"
import { HubModal } from "./hub-modal"
import { ServiceDetailModal } from "./service-detail-modal"
import { HUB_ORDER, HUB_PREVIEWS, NOTICE, trackEvent, SelectedService } from "./lib"

const HUB_ICON_IMAGES: Record<HubId, string> = {
  print:    "/print-hub.webp",
  doc:      "/docu-hub.webp",
  design:   "/design-hub.webp",
  eservice: "/eservice-hub.webp",
  tech:     "/tech-hub.webp",
}

function NoticeNotification() {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        aria-label="Show notice to clients"
        className="relative mx-auto mb-10 flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full text-white font-black text-[0.78rem] tracking-tight shadow-lg transition-transform active:scale-95 hover:-translate-y-0.5 bg-brand-orange"
      >
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-950 border-2 border-white dark:border-zinc-950 flex items-center justify-center shadow-md">
          <Megaphone size={10} weight="fill" className="text-brand-blue dark:text-brand-light-blue" />
        </span>
        Notice
      </button>
    )
  }

  return (
    <div className="relative mx-auto w-full max-w-md mb-10 rounded-[14px] border border-brand-orange/20 bg-brand-orange/5 dark:bg-brand-orange/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={() => setExpanded(false)}
        aria-label="Collapse notice"
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/70 dark:bg-black/30 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <X size={12} weight="bold" />
      </button>
      <div className="w-9 h-9 rounded-[10px] bg-brand-orange flex items-center justify-center shrink-0">
        <Megaphone size={18} weight="fill" color="#fff" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5 pr-6">
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

function ClosingTagline() {
  return (
    <div className="mt-2 mb-4 text-center px-6 py-6">
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Why ApexbytesHub</p>
      <p className="font-sans font-black text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        From your first CV to your next big idea — one hub does it all, right here in Bothaville.
      </p>
      <div className="mt-6 h-px bg-zinc-200 dark:bg-zinc-800 max-w-[160px] mx-auto" />
    </div>
  )
}

function HubCta({ label, accent, pointsRight, previewActive }: { label: string; accent: string; pointsRight: boolean; previewActive?: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1 text-[0.78rem] font-black transition-colors duration-200 group-hover/hubcard:text-[var(--hub-accent)]",
        previewActive ? "text-[var(--hub-accent)]" : "text-zinc-400 dark:text-zinc-500"
      )}
      style={{ ["--hub-accent" as any]: accent }}
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 bottom-[-2px] h-[2px] bg-current transition-[width] duration-300 ease-linear group-hover/hubcard:w-full",
            previewActive ? "w-full" : "w-0"
          )}
        />
      </span>
      <ArrowRight size={12} weight="bold" aria-hidden="true" className={cn(!pointsRight && "rotate-180")} />
    </span>
  )
}

// Icon block — stretches to match the height of its sibling text column
// (via the parent's `items-stretch`) instead of a fixed pixel size, so
// every card's icon is exactly as tall as that card's own title→Explore
// content, whatever that happens to be. `mix-blend-mode: screen` makes
// the icon's black background behave as transparent against the card's
// own background in both themes — screening any base color with pure
// black returns the base unchanged, which is what makes the black square
// disappear. (Note: this is a CSS workaround, not a real transparent
// asset — bright whites in the icon will render slightly hot. Swap to a
// proper transparent-bg webp later and this can be simplified.)
function HubIconBlock({ hubId }: { hubId: HubId }) {
  return (
    <div className="relative shrink-0 h-full w-auto max-w-[110px] aspect-square flex items-end justify-center">
      <img
        src={HUB_ICON_IMAGES[hubId]}
        alt=""
        aria-hidden="true"
        className="w-full h-full object-contain transition-transform duration-300 group-hover/hubcard:-translate-y-1"
        style={{
          mixBlendMode: "screen",
          filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.28))",
        }}
      />
    </div>
  )
}

export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark       = resolvedTheme === "dark"
  const searchParams = useSearchParams()
  const router       = useRouter()
  const consumedHubParam = useRef<string | null>(null)

  const [activeHub,       setActiveHub]       = useState<HubId | null>(null)
  const [hubOriginSide,   setHubOriginSide]   = useState<"left" | "right">("right")
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
  const [showBackToTop,   setShowBackToTop]   = useState(false)
  const [touchedCard, setTouchedCard] = useState<HubId | null>(null)

  const isModalOpen = !!(activeHub || selectedService)

  const handleSelectService = (svc: SelectedService) => {
    trackEvent("view_service", {
      hub_id:        svc.hubId,
      service_name:  svc.name,
      section_title: svc.sectionTitle,
    })
    setSelectedService(svc)
  }

  const handleOpenHub = (hubId: HubId, originSide: "left" | "right") => {
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setHubOriginSide(originSide)
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
    if (hubParam && HUB_ORDER.includes(hubParam as HubId) && consumedHubParam.current !== hubParam) {
      consumedHubParam.current = hubParam
      handleOpenHub(hubParam as HubId, "right")
      router.replace("/services", { scroll: false })
    }
  }, [searchParams, router])

  // closeHub/closeService are now actually wired to the modals below —
  // this was the missing piece. Previously the modals' onClose props
  // called setActiveHub(null)/setSelectedService(null) directly, which
  // bypassed the hook's history bookkeeping entirely and was the primary
  // cause of the back-button eventually exiting the site (see shared.tsx).
  const { closeHub, closeService } = useModalBackStack(activeHub, setActiveHub, selectedService, setSelectedService)

  useEffect(() => {
    if (!isModalOpen) return
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
  }, [isModalOpen])

  return (
    <section className="min-h-screen bg-white dark:bg-[#081428] transition-colors duration-300 pb-24 overflow-x-hidden">

      <div
        className="max-w-[1248px] mx-auto px-4 md:px-8 flex flex-col items-center transition-opacity duration-200"
        style={{
          opacity: isModalOpen ? 0 : 1,
          pointerEvents: isModalOpen ? "none" : "auto",
        }}
        aria-hidden={isModalOpen}
      >

        <ScrollBounce className="w-full">
          <div className="pt-[calc(var(--nav-h,74px)+2rem)] pb-8 text-center w-full">
            <h1 className="abh-page-title mb-3">Our Service Hubs</h1>
            <p className="abh-tagline max-w-xl mx-auto">
              Explore our ecosystem. Tap a hub to view all available services and instant pricing.
            </p>
            <div className="abh-divider mx-auto" />
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.08} className="relative z-40 w-full mb-10 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.14} className="relative z-0 w-full flex justify-center">
          <NoticeNotification />
        </ScrollBounce>

        {/* ── DESKTOP cards ── */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-5 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub       = HUBS[hubId]
            const colors    = HUB_COLORS[hubId as HubKey]
            const accent    = isDark ? colors.accentDark : colors.accentLight
            const iconRight = index % 2 === 0

            return (
              <ScrollBounce key={hubId} delay={index * 0.06}>
                <div className="group/hubcard relative flex flex-col w-full text-left rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-transform duration-300 ease-out hover:z-20 hover:-translate-y-0.5 transform-gpu">
                  <div className={cn("flex items-stretch gap-5 p-5", !iconRight && "flex-row-reverse")}>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3
                        className="font-sans font-black text-[0.95rem] leading-tight transition-colors mb-1.5"
                        style={{ color: accent }}
                      >
                        {hub.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
                        {HUB_PREVIEWS[hubId].map((hint, i) => (
                          <span key={i} className="text-[0.66rem] font-medium text-zinc-400 dark:text-zinc-500">
                            {hint}
                          </span>
                        ))}
                      </div>
                      <p className="abh-body text-[0.76rem] line-clamp-2 leading-snug">
                        {hub.desc}
                      </p>
                    </div>

                    <HubIconBlock hubId={hubId} />
                  </div>

                  <div className="px-5 pb-4">
                    <button
                      onClick={() => handleOpenHub(hubId, "right")}
                      aria-label={`Open ${hub.title}`}
                    >
                      <HubCta label="View more" accent={accent} pointsRight={true} />
                    </button>
                  </div>
                </div>
              </ScrollBounce>
            )
          })}
        </div>

        {/* ── MOBILE cards ── */}
        <div className="flex md:hidden flex-col gap-6 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub        = HUBS[hubId]
            const colors     = HUB_COLORS[hubId as HubKey]
            const accent     = isDark ? colors.accentDark : colors.accentLight
            const iconRight  = index % 2 === 0
            const isTouched  = touchedCard === hubId

            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <div
                  className="group/hubcard flex items-stretch gap-6 w-full p-4 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 abh-shadow-card text-left transition-transform duration-150 active:scale-[0.98] transform-gpu"
                  onTouchStart={() => setTouchedCard(hubId)}
                  onTouchEnd={() => setTouchedCard(null)}
                  onTouchCancel={() => setTouchedCard(null)}
                >
                  <div className={cn("flex-1 min-w-0 flex flex-col justify-center", iconRight ? "text-left order-1" : "text-right order-2")}>
                    <h3 className="font-sans font-black text-[0.98rem] text-zinc-900 dark:text-zinc-50 leading-tight mb-1">
                      {hub.title}
                    </h3>
                    <p className="abh-body text-[0.76rem] line-clamp-2 leading-snug mb-2">
                      {hub.desc}
                    </p>
                    <div className={cn("inline-flex", !iconRight && "flex-row-reverse")}>
                      <button
                        onClick={() => handleOpenHub(hubId, iconRight ? "right" : "left")}
                        aria-label={`Open ${hub.title}`}
                      >
                        <HubCta label="Explore" accent={accent} pointsRight={iconRight} previewActive={isTouched} />
                      </button>
                    </div>
                  </div>

                  <div className={cn(iconRight ? "order-2" : "order-1")}>
                    <HubIconBlock hubId={hubId} />
                  </div>
                </div>
              </ScrollBounce>
            )
          })}
        </div>

        <ScrollBounce className="w-full">
          <ClosingTagline />
        </ScrollBounce>
      </div>

      <AnimatePresence>
        {activeHub && (
          <HubModal
            key="hub-modal"
            hubId={activeHub}
            originSide={hubOriginSide}
            onClose={closeHub}
            onSelectService={handleSelectService}
          />
        )}
        {selectedService && (
          <ServiceDetailModal key={selectedService.name} svc={selectedService} onClose={closeService} />
        )}
      </AnimatePresence>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 left-4 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
          showBackToTop && !isModalOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <ArrowUp size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
      </button>
    </section>
  )
} 