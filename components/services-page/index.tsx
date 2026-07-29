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
import { useModalBackStack, HubIcon } from "./shared"
import { InlineSearchBar } from "./search-bar"
import { HubModal } from "./hub-modal"
import { ServiceDetailModal } from "./service-detail-modal"
import { HUB_ORDER, HUB_PREVIEWS, NOTICE, trackEvent, SelectedService } from "./lib"

const HUB_IMAGES: Record<HubId, string> = {
  print:    "/1_PRINT_HUB_white.webp",
  doc:      "/2_DOCUMENT_HUB_white.webp",
  design:   "/3_DESIGN_HUB_white.webp",
  eservice: "/4_APPLICATIONS_HUB_white.webp",
  tech:     "/5_TECH_HUB_white.webp",
}

// ─── Notice pill / expanded notification ───────────────────────────────────
// Collapsed: a small centered pill labeled "Notice" with a mini icon badge
// (brand blue) representing the notice type sitting on its top-left corner,
// like a notification-count badge. Tap to expand into the full message;
// tap the close button on the expanded card to collapse back to the pill.
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

// ─── Closing tagline — no background/border container, just a muted
// divider beneath the text ──────────────────────────────────────────────
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

// ─── Explore/View-more CTA — neutral by default, accent-colored on hover.
// Triggers off the CARD's hover state (group/hubcard), not its own hover,
// so hovering anywhere on the card animates it. Arrow always sits right
// after the word (the "e" end of "more"/"Explore"), rotated 180° when the
// modal opens from the left. ────────────────────────────────────────────
function HubCta({ label, accent, pointsRight }: { label: string; accent: string; pointsRight: boolean }) {
  return (
    <span
      className="relative inline-flex items-center gap-1 text-[0.78rem] font-black text-zinc-400 dark:text-zinc-500 transition-colors duration-200 group-hover/hubcard:text-[var(--hub-accent)]"
      style={{ ["--hub-accent" as any]: accent }}
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className="absolute left-0 bottom-[-2px] h-[2px] w-0 bg-current transition-[width] duration-300 ease-linear group-hover/hubcard:w-full"
        />
      </span>
      <ArrowRight size={12} weight="bold" aria-hidden="true" className={cn(!pointsRight && "rotate-180")} />
    </span>
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
  const [hubOriginSide,   setHubOriginSide]   = useState<"left" | "right">("right")
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
  const [showBackToTop,   setShowBackToTop]   = useState(false)

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

  useModalBackStack(activeHub, setActiveHub, selectedService, setSelectedService)

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

        <ScrollBounce delay={0.08} className="relative z-40 w-full mb-10 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        <ScrollBounce delay={0.14} className="relative z-0 w-full flex justify-center">
          <NoticeNotification />
        </ScrollBounce>

        {/* ── DESKTOP cards — only "View more" navigates; hovering
            anywhere on the card still animates the CTA (group/hubcard).
            No border-color hover, no whole-card click. transform-gpu +
            backface-hidden on the scaling elements avoids the blurry
            text/image that plain CSS scale can cause on hover. ── */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-5 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight

            return (
              <ScrollBounce key={hubId} delay={index * 0.06}>
                <div
                  className="group/hubcard relative flex flex-col w-full text-left rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-300 ease-out hover:z-20 hover:scale-[1.03] transform-gpu [backface-visibility:hidden]"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img
                      src={HUB_IMAGES[hubId]}
                      alt={`${hub.title} example`}
                      className="w-full h-full object-cover grayscale contrast-125 brightness-105 transition-all duration-500 group-hover/hubcard:grayscale-0 group-hover/hubcard:contrast-100 group-hover/hubcard:brightness-100 group-hover/hubcard:scale-105 transform-gpu [backface-visibility:hidden]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 p-4">
                    <h3
                      className="font-sans font-black text-[0.95rem] leading-tight transition-colors"
                      style={{ color: accent }}
                    >
                      {hub.title}
                    </h3>

                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {HUB_PREVIEWS[hubId].map((hint, i) => (
                        <span key={i} className="text-[0.66rem] font-medium text-zinc-400 dark:text-zinc-500">
                          {hint}
                        </span>
                      ))}
                    </div>

                    <p className="abh-body text-[0.76rem] line-clamp-2 leading-snug">
                      {hub.desc}
                    </p>

                    <div className="mt-2">
                      <button
                        onClick={() => handleOpenHub(hubId, "right")}
                        aria-label={`Open ${hub.title}`}
                      >
                        <HubCta label="View more" accent={accent} pointsRight={true} />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollBounce>
            )
          })}
        </div>

        {/* ── MOBILE cards — whole card still opens the modal (exception
            kept for mobile per request). ── */}
        <div className="flex md:hidden flex-col gap-6 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub        = HUBS[hubId]
            const colors     = HUB_COLORS[hubId as HubKey]
            const accent     = isDark ? colors.accentDark : colors.accentLight
            const imageRight = index % 2 === 0

            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <button
                  onClick={() => handleOpenHub(hubId, imageRight ? "right" : "left")}
                  aria-label={`Open ${hub.title}`}
                  className={cn(
                    "group/hubcard flex items-center gap-4 w-full p-4 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 abh-shadow-card text-left transition-all duration-200 active:scale-[0.99]",
                    imageRight ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <div
                    className="relative w-24 h-24 shrink-0 overflow-hidden rounded-[14px] border-2"
                    style={{ borderColor: `${accent}30` }}
                  >
                    <img
                      src={HUB_IMAGES[hubId]}
                      alt={`${hub.title} example`}
                      className="w-full h-full object-cover grayscale contrast-125 brightness-105 transition-all duration-500 group-hover/hubcard:grayscale-0 group-hover/hubcard:contrast-100 group-hover/hubcard:brightness-100 transform-gpu [backface-visibility:hidden]"
                    />
                  </div>

                  <div className={cn("flex-1 min-w-0", imageRight ? "text-left" : "text-right")}>
                    <h3 className="font-sans font-black text-[0.98rem] text-zinc-900 dark:text-zinc-50 leading-tight mb-1">
                      {hub.title}
                    </h3>
                    <p className="abh-body text-[0.76rem] line-clamp-2 leading-snug mb-2">
                      {hub.desc}
                    </p>
                    <div className={cn("inline-flex", !imageRight && "flex-row-reverse")}>
                      <HubCta label="Explore" accent={accent} pointsRight={imageRight} />
                    </div>
                  </div>
                </button>
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
            onClose={() => setActiveHub(null)}
            onSelectService={handleSelectService}
          />
        )}
        {selectedService && (
          <ServiceDetailModal key={selectedService.name} svc={selectedService} onClose={() => setSelectedService(null)} />
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