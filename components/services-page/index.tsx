// components/services-page/index.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { Megaphone, ArrowUp, ArrowRight, X } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BRAND, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"
import { useModalBackStack, HubIcon } from "./shared"
import { InlineSearchBar } from "./search-bar"
import { HubModal } from "./hub-modal"
import { ServiceDetailModal } from "./service-detail-modal"
import { HUB_ORDER, HUB_PREVIEWS, NOTICE, trackEvent, SelectedService } from "./lib"
import { sectionHasBulk } from "../quote-calculator/lib"

// A distinct, muted orange for the bulk-pricing ribbon — deliberately
// different from BRAND.orange (used for the Notice pill) so the two
// don't visually compete or get confused with each other.
const BULK_RIBBON_ORANGE = "#B45309"

function NoticeNotification({ isDark }: { isDark: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const pillBg = isDark ? `${BRAND.orange}cc` : BRAND.orange

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        aria-label="Show notice to clients"
        style={{
          backgroundColor: pillBg,
          boxShadow: "0 4px 14px -4px rgba(0,0,0,0.25), 0 2px 6px -2px rgba(0,0,0,0.15)",
        }}
        className="relative mx-auto mb-6 flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full text-white font-black text-[0.94rem] tracking-tight transition-transform active:scale-95 hover:-translate-y-0.5"
      >
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-950 border-2 border-white dark:border-zinc-950 flex items-center justify-center shadow-md">
          <Megaphone size={10} weight="fill" className="text-brand-blue dark:text-brand-light-blue" />
        </span>
        Notice
      </button>
    )
  }

  return (
    <div className="relative mx-auto w-full max-w-md mb-6 rounded-[14px] border border-brand-orange/20 bg-brand-orange/5 dark:bg-brand-orange/10 px-5 py-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
        <p className="abh-body text-[1rem]">
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
      <p className="font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        From your first CV to your next big idea — one hub does it all, right here in Bothaville.
      </p>
      <div className="mt-6 h-px bg-zinc-200 dark:bg-zinc-800 max-w-[160px] mx-auto" />
    </div>
  )
}

function HubCta({ label, accent, pointsRight }: { label: string; accent: string; pointsRight: boolean }) {
  return (
    <span
      className="relative inline-flex items-center gap-1 text-[0.94rem] font-black text-zinc-400 dark:text-zinc-500 transition-colors duration-200 group-hover/hubcard:text-[var(--hub-accent)]"
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

// ============================================================
// Hub corner icon (bottom-right watermark icon)
// No rotation (tilt 0). Neutral by default, richer than before
// (zinc-300/600 instead of 200/700) so it doesn't read as dull,
// and only shifts to the hub's accent color + a subtle scale-up
// on hover — the color swap is the ONLY thing that changes on
// interaction, everything else (position, size, tilt) stays fixed.
// ============================================================

function HubCornerIcon({ hubId, accent }: { hubId: HubId; accent: string }) {
  return (
    <div
      className="pointer-events-none absolute -bottom-4 -right-4 w-24 h-24 flex items-center justify-center text-zinc-300 dark:text-zinc-600 opacity-90 transition-all duration-300 group-hover/hubcard:opacity-100 group-hover/hubcard:text-[var(--hub-accent)] group-hover/hubcard:scale-105"
      style={{ ["--hub-accent" as any]: accent }}
      aria-hidden="true"
    >
      <HubIcon id={hubId} size={72} color="currentColor" />
    </div>
  )
}

// ============================================================
// Bulk-pricing ribbon
// Only rendered when a hub actually has bulk pricing somewhere
// in its sections. Small, muted, diagonal — sits in the top-right
// corner (opposite the bottom-right HubCornerIcon), clipped by the
// card's existing overflow-hidden so it never spills outside it.
// ============================================================

function BulkRibbon() {
  return (
    <div className="absolute top-4 -right-8 rotate-45 z-20 pointer-events-none">
      <span
        className="block w-28 text-center py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-white"
        style={{ backgroundColor: BULK_RIBBON_ORANGE, boxShadow: "0 3px 8px -2px rgba(0,0,0,0.35)" }}
      >
        Bulk
      </span>
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

        {/* Notice now sits ABOVE the search bar, not below it */}
        <ScrollBounce delay={0.08} className="relative z-0 w-full flex justify-center">
          <NoticeNotification isDark={isDark} />
        </ScrollBounce>

        <ScrollBounce delay={0.14} className="relative z-40 w-full mb-10 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        {/* ── Desktop grid — gap-6 (was gap-5): a bit more breathing
            room between hub cards without changing the layout shape ── */}
        <div className="hidden md:grid md:grid-cols-6 gap-6 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const hubHasBulk = hub.sections.some((s) => sectionHasBulk(hubId, s.title, s.items))

            return (
              <div
                key={hubId}
                className={cn(
                  "col-span-2",
                  index === 3 && "md:col-start-2",
                  index === 4 && "md:col-start-4"
                )}
              >
                <ScrollBounce delay={index * 0.06}>
                  <div className="group/hubcard relative flex flex-col items-center text-center h-full rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-elevated overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 transform-gpu p-6 pt-7">
                    <HubCornerIcon hubId={hubId} accent={accent} />
                    {hubHasBulk && <BulkRibbon />}

                    <h3 className="relative z-10 font-sans font-black text-[1.14rem] leading-tight mb-1.5 text-zinc-900 dark:text-zinc-50">
                      {hub.title}
                    </h3>

                    <div className="relative z-10 flex flex-wrap justify-center gap-x-2 gap-y-0.5 mb-1.5">
                      {HUB_PREVIEWS[hubId].map((hint, i) => (
                        <span key={i} className="text-[0.79rem] font-medium text-zinc-400 dark:text-zinc-500">
                          {hint}
                        </span>
                      ))}
                    </div>

                    <p className="relative z-10 abh-body text-[0.91rem] line-clamp-2 leading-snug mb-4 max-w-[200px]">
                      {hub.desc}
                    </p>

                    <button
                      onClick={() => handleOpenHub(hubId, "right")}
                      aria-label={`Open ${hub.title}`}
                      className="relative z-10 mt-auto"
                    >
                      <HubCta label="View more" accent={accent} pointsRight={true} />
                    </button>
                  </div>
                </ScrollBounce>
              </div>
            )
          })}
        </div>

        {/* ── Mobile stacked cards — gap-6, hub title now neutral to
            match the desktop treatment (was accent-colored) ── */}
        <div className="flex md:hidden flex-col gap-6 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const hubHasBulk = hub.sections.some((s) => sectionHasBulk(hubId, s.title, s.items))

            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <button
                  onClick={() => handleOpenHub(hubId, "right")}
                  aria-label={`Open ${hub.title}`}
                  className="group/hubcard relative flex flex-col items-center text-center w-full rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-elevated overflow-hidden transition-transform duration-200 active:scale-[0.98] transform-gpu p-6 pt-7"
                >
                  <HubCornerIcon hubId={hubId} accent={accent} />
                  {hubHasBulk && <BulkRibbon />}

                  <h3 className="relative z-10 font-sans font-black text-[1.18rem] leading-tight mb-1.5 text-zinc-900 dark:text-zinc-50">
                    {hub.title}
                  </h3>

                  <div className="relative z-10 flex flex-wrap justify-center gap-x-2 gap-y-0.5 mb-1.5">
                    {HUB_PREVIEWS[hubId].map((hint, i) => (
                      <span key={i} className="text-[0.79rem] font-medium text-zinc-400 dark:text-zinc-500">
                        {hint}
                      </span>
                    ))}
                  </div>

                  <p className="relative z-10 abh-body text-[0.91rem] line-clamp-2 leading-snug mb-3 max-w-[260px]">
                    {hub.desc}
                  </p>

                  <span className="relative z-10 inline-flex items-center gap-1 text-[0.94rem] font-black" style={{ color: accent }}>
                    Explore
                    <ArrowRight size={12} weight="bold" aria-hidden="true" />
                  </span>
                </button>
              </ScrollBounce>
            )
          })}
        </div>

        <ScrollBounce className="w-full mt-14 md:mt-20">
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
