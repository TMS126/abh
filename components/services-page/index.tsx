"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import Image from "next/image"
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

// ─── Notice pill / expanded notification ───────────────────────────────────
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

// ─── Closing tagline ────────────────────────────────────────────────────────
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

// ─── Explore/View-more CTA ──────────────────────────────────────────────────
// - showArrow: mobile passes false — no arrow icon on mobile at all.
// - pointsRight: desktop always passes true (default) so the arrow points
//   the same way on every card regardless of which side its icon sits on.
// - alwaysColored: mobile passes true so "Explore" reads in the hub's
//   accent color at rest, not muted-until-hover like desktop's "View more".
// - forceUnderline: mobile passes the card's touch-press state, so the
//   underline animates on touch instead of (unreliable) :hover.
function HubCta({
  label, accent, pointsRight = true, showArrow = true, forceUnderline = false, alwaysColored = false,
}: {
  label: string; accent: string; pointsRight?: boolean; showArrow?: boolean
  forceUnderline?: boolean; alwaysColored?: boolean
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1 text-[0.78rem] font-black transition-colors duration-200",
        !alwaysColored && "text-zinc-400 dark:text-zinc-500 group-hover/hubcard:text-[var(--hub-accent)]"
      )}
      style={{
        ["--hub-accent" as any]: accent,
        ...(alwaysColored ? { color: accent } : {}),
      }}
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 bottom-[-2px] h-[2px] bg-current transition-[width] duration-300 ease-linear",
            forceUnderline ? "w-full" : "w-0 group-hover/hubcard:w-full"
          )}
        />
      </span>
      {showArrow && (
        <ArrowRight size={12} weight="bold" aria-hidden="true" className={cn(!pointsRight && "rotate-180")} />
      )}
    </span>
  )
}

// ─── Mobile hub card ─────────────────────────────────────────────────────────
// Split into its own component (rather than inlined in the .map below)
// because it needs its own useState for touch/press feedback — hooks can't
// be called from inside an array .map callback.
//
// Per request: on mobile the CARD ITSELF no longer navigates anywhere —
// only the "Explore" button does. The card still reacts to touch with a
// purely visual press/scale effect (via pointer events) so it doesn't feel
// dead, but tapping empty card space does nothing except that visual dip.
// That same press state also drives the "Explore" underline animation.
function MobileHubCard({
  hub, hubId, accent, iconRight, onOpen,
}: {
  hub: (typeof HUBS)[HubId]; hubId: HubId; accent: string; iconRight: boolean; onOpen: () => void
}) {
  const [pressed, setPressed] = useState(false)
  const press = {
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onPointerCancel: () => setPressed(false),
  }

  return (
    <div
      {...press}
      className={cn(
        "group/hubcard flex items-center gap-5 w-full p-4 rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 abh-shadow-card transition-transform duration-150 ease-out",
        iconRight ? "flex-row" : "flex-row-reverse",
        pressed && "scale-[0.97]"
      )}
    >
      <div className={cn("flex-1 min-w-0", iconRight ? "text-left" : "text-right")}>
        <h3 className="font-sans font-black text-[0.98rem] text-zinc-900 dark:text-zinc-50 leading-tight mb-1">
          {hub.title}
        </h3>
        <p className="abh-body text-[0.76rem] line-clamp-2 leading-snug mb-2">
          {hub.desc}
        </p>
        <div className={cn("inline-flex", !iconRight && "flex-row-reverse")}>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen() }}
            aria-label={`Open ${hub.title}`}
          >
            <HubCta
              label="Explore"
              accent={accent}
              showArrow={false}
              alwaysColored
              forceUnderline={pressed}
            />
          </button>
        </div>
      </div>
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

        {/* ── DESKTOP cards — icon/text side alternates per card (index % 2)
            so cards read as "vice versa" of one another. Arrow direction
            no longer follows that alternation — every "View more" arrow
            points the same way regardless of card layout. ── */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-5 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const iconOnRight = index % 2 === 0

            return (
              <ScrollBounce key={hubId} delay={index * 0.06}>
                <div
                  className={cn(
                    "group/hubcard relative flex w-full items-center rounded-[14px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 abh-shadow-card p-5 gap-6",
                    iconOnRight ? "flex-row" : "flex-row-reverse"
                  )}
                >
                  <div className={cn("flex-1 min-w-0", iconOnRight ? "text-left" : "text-right")}>
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
                        onClick={() => handleOpenHub(hubId, iconOnRight ? "right" : "left")}
                        aria-label={`Open ${hub.title}`}
                      >
                        <HubCta label="View more" accent={accent} />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollBounce>
            )
          })}
        </div>

        {/* ── MOBILE cards — same icon treatment, alternating side. Card
            itself no longer navigates; only "Explore" does (see
            MobileHubCard). ── */}
        <div className="flex md:hidden flex-col gap-6 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const iconRight = index % 2 === 0

            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <MobileHubCard
                  hub={hub}
                  hubId={hubId}
                  accent={accent}
                  iconRight={iconRight}
                  onOpen={() => handleOpenHub(hubId, iconRight ? "right" : "left")}
                />
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
