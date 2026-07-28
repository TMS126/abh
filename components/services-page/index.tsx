"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { Megaphone, ArrowUp, ArrowRight } from "@phosphor-icons/react"
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

// Same asset paths already used in the Hero collage — reused here rather
// than duplicated art, since this page didn't have per-hub photography
// wired in before.
const HUB_IMAGES: Record<HubId, string> = {
  print:    "/1_PRINT_HUB_white.webp",
  doc:      "/2_DOCUMENT_HUB_white.webp",
  design:   "/3_DESIGN_HUB_white.webp",
  eservice: "/4_APPLICATIONS_HUB_white.webp",
  tech:     "/5_TECH_HUB_white.webp",
}

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
  // Brief 3D flip on the desktop card's thumbnail when "View more" is
  // pressed, so opening the modal feels connected to the press instead of
  // instant. Purely visual — the modal opens right after the animation.
  const [spinningHub,     setSpinningHub]     = useState<HubId | null>(null)
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleViewMoreClick = (e: React.MouseEvent, hubId: HubId) => {
    e.stopPropagation()
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current)
    setSpinningHub(hubId)
    spinTimeoutRef.current = setTimeout(() => {
      handleOpenHub(hubId)
      setSpinningHub(null)
      spinTimeoutRef.current = null
    }, 420)
  }

  useEffect(() => {
    return () => { if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current) }
  }, [])

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
      {/* Keyframes for the desktop "View more" flip — same inline-<style>
          pattern already used elsewhere in this codebase (e.g. AbhLoader). */}
      <style>{`
        @keyframes abh-card-spin {
          from { transform: rotateY(0deg) scale(1); }
          50%  { transform: rotateY(180deg) scale(0.92); }
          to   { transform: rotateY(360deg) scale(1); }
        }
        .abh-card-spin { animation: abh-card-spin 0.42s ease-in-out; }
      `}</style>

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

        {/* Inline search — raised above the notice banner's own stacking context so its dropdown never gets painted over */}
        <ScrollBounce delay={0.08} className="relative z-40 w-full mb-10 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        {/* Notice */}
        <ScrollBounce delay={0.14} className="relative z-0 w-full">
          <div className="w-full"><NoticeBanner /></div>
        </ScrollBounce>

        {/* ── Hub cards — DESKTOP: card-grid layout, image on top, outlined
            "View more" CTA, hover-spotlight zoom with an accent ring
            (matches the reference screenshot's selected-card treatment). ── */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-5 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub       = HUBS[hubId]
            const colors    = HUB_COLORS[hubId as HubKey]
            const accent    = isDark ? colors.accentDark : colors.accentLight
            const isHovered = hoveredMainHub === hubId

            return (
              <ScrollBounce key={hubId} delay={index * 0.06}>
                <div
                  onMouseEnter={() => setHoveredMainHub(hubId)}
                  onMouseLeave={() => setHoveredMainHub(null)}
                  className={cn(
                    "relative flex flex-col rounded-[16px] border-2 bg-white dark:bg-zinc-950 overflow-hidden cursor-default transition-all duration-300 ease-out",
                    isHovered ? "z-20 scale-[1.06] shadow-2xl" : "z-0 scale-100 abh-shadow-card"
                  )}
                  style={{ borderColor: isHovered ? accent : "transparent" }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
                    style={{ perspective: "800px" }}
                  >
                    <img
                      src={HUB_IMAGES[hubId]}
                      alt={`${hub.title} example`}
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-500",
                        isHovered && "scale-110",
                        spinningHub === hubId && "abh-card-spin"
                      )}
                    />
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-2 p-4">
                    <h3
                      className="font-sans font-black text-[0.95rem] leading-tight transition-colors"
                      style={{ color: isHovered ? accent : undefined }}
                    >
                      {hub.title}
                    </h3>

                    {/* Preview hints — stand in for the reference's star
                        rating row, since these hubs don't carry ratings. */}
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

                    <button
                      onClick={(e) => handleViewMoreClick(e, hubId)}
                      className="mt-2 w-full px-3 py-2 rounded-[10px] border-2 text-[0.78rem] font-black transition-all duration-200 active:scale-95"
                      style={{ borderColor: accent, color: accent }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = `${accent}12` }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "" }}
                    >
                      View more
                    </button>
                  </div>
                </div>
              </ScrollBounce>
            )
          })}
        </div>

        {/* ── Hub cards — MOBILE: alternating blob-image rows, tap
            anywhere on the card to open. ── */}
        <div className="flex md:hidden flex-col gap-6 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub        = HUBS[hubId]
            const colors     = HUB_COLORS[hubId as HubKey]
            const accent     = isDark ? colors.accentDark : colors.accentLight
            const imageRight = index % 2 === 0

            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <button
                  onClick={() => handleOpenHub(hubId)}
                  aria-label={`Open ${hub.title}`}
                  className={cn(
                    "group flex items-center gap-4 w-full p-4 rounded-[20px] bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 abh-shadow-card text-left transition-all duration-200 active:scale-[0.98]",
                    imageRight ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  {/* Blob-shaped thumbnail */}
                  <div
                    className="relative w-24 h-24 shrink-0 overflow-hidden rounded-tl-[40px] rounded-br-[40px] rounded-tr-[14px] rounded-bl-[14px] border-2"
                    style={{ borderColor: `${accent}30` }}
                  >
                    <img
                      src={HUB_IMAGES[hubId]}
                      alt={`${hub.title} example`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Text */}
                  <div className={cn("flex-1 min-w-0", imageRight ? "text-left" : "text-right")}>
                    <h3 className="font-sans font-black text-[0.98rem] text-zinc-900 dark:text-zinc-50 leading-tight mb-1">
                      {hub.title}
                    </h3>
                    <p className="abh-body text-[0.76rem] line-clamp-2 leading-snug mb-2">
                      {hub.desc}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[0.7rem] font-black px-3 py-1.5 rounded-full text-white",
                        imageRight ? "flex-row" : "flex-row-reverse"
                      )}
                      style={{ backgroundColor: accent }}
                    >
                      Explore
                      <ArrowRight size={12} weight="bold" className={imageRight ? "" : "rotate-180"} />
                    </span>
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