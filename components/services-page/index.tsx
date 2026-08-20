/* components/services-page/index.tsx — PART 1 OF 2 */
"use client"

/**
 * ════════════════════════════════════════════════════════════════════════
 * SERVICES PAGE
 *
 * MOBILE: unchanged from previous pass — icon-tile cards, taps open the
 * existing HubModal exactly as before.
 *
 * DESKTOP — THREE LEVELS, ALL CARD GRIDS (no accordion anywhere):
 *   Level 0: original 5 big hub cards (unchanged)
 *   Level 1: hub pill row (top) + that hub's SECTION cards in a grid
 *   Level 2: hub pill row + a smaller SECTION pill row + that section's
 *            SERVICE cards in a grid (tapping a service card opens the
 *            existing ServiceDetailModal, same as everywhere else)
 *
 * PILL CONTRAST FIX: inactive pills (both hub-level and section-level)
 * use a plain NEUTRAL border/text color, never the hub's own accent —
 * only the currently active pill shows color, as a solid accent fill
 * with a soft accent-tinted ring for depth. This stops the pill row from
 * looking like 5 clashing colors when nothing is "selected" yet.
 * ════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Megaphone, ArrowRight, CaretRight, CaretLeft, WarningCircle } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { BRAND, TOKEN, HUB_COLORS, HubKey } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { ScrollBounce } from "@/components/scroll-bounce"
import { useModalBackStack, HubIcon } from "./shared"
import { InlineSearchBar } from "./search-bar"
import { HubModal } from "./hub-modal"
import { ServiceDetailModal } from "./service-detail-modal"
import { HUB_ORDER, HUB_PREVIEWS, NOTICE, trackEvent, getTurnaround, SelectedService } from "./lib"
import { sectionHasBulk, itemHasBulk } from "../quote-calculator/lib"
import { NoticePill } from "@/components/notice-pill"
import { BackToTopButton, useBackToTop } from "@/components/back-to-top-button"

// ── Icon image path per hub — files already live in /public ──
const HUB_ICON_SRC: Record<HubId, string> = {
  print: "/phub.png",
  doc: "/dochub.png",
  design: "/dhub.png",
  eservice: "/ehub.png",
  tech: "/thub.png",
}

// ── Neutral colors used for INACTIVE pills, everywhere on desktop.
// Deliberately theme-aware but NOT hub-colored — this is the fix for
// the "pills look bad" issue: 5 different accent colors sitting inactive
// side by side reads as visual noise. Neutral until selected. ──
const PILL_NEUTRAL = {
  border: "var(--border)",
  text: "var(--muted-foreground)",
  hoverBg: "var(--muted)",
}

function ClosingTagline() {
  return (
    <div className="mt-2 mb-4 text-center px-6 py-6">
      <p className="abh-eyebrow text-zinc-400 dark:text-zinc-500 mb-3">Why ApexbytesHub</p>
      <p className="font-sans font-black text-2xl md:text-3xl text-zinc-900 dark:text-zinc-50 leading-snug max-w-2xl mx-auto">
        From your first CV to your next big idea — one hub does it all, right here in Bothaville.
      </p>
      <div className="abh-divider" />
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

// Diagonal "Bulk" ribbon — ONLY the original 5-card desktop landing view.
function BulkRibbon() {
  return (
    <div className="absolute top-4 -right-8 rotate-45 z-20 pointer-events-none">
      <span
        className="block w-28 text-center py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-white"
        style={{ backgroundColor: BRAND.blue, boxShadow: "0 4px 10px -2px rgba(30,111,168,0.55), 0 2px 4px -1px rgba(0,0,0,0.25)" }}
      >
        Bulk
      </span>
    </div>
  )
}

// Circular orange badge — ONLY the original 5-card desktop landing view.
function NoticeBadge() {
  return (
    <div className="absolute top-3 right-3 z-20 pointer-events-none">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#ffffff", color: TOKEN.warningBg, boxShadow: "0 2px 6px -1px rgba(0,0,0,0.2)" }}
        aria-label="Notice for some services in this hub"
      >
        <WarningCircle size={16} weight="bold" aria-hidden="true" />
      </div>
    </div>
  )
}

// Small unobtrusive dot — mobile tiles, section cards, service cards.
function CornerDot({ color, label }: { color: string; label: string }) {
  return (
    <span
      aria-label={label}
      className="w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: color, boxShadow: "0 0 0 2px var(--card)" }}
    />
  )
}

// ══════════════════════════════════════════════════════════════════════
// MOBILE HUB CARD — unchanged from previous pass.
// ══════════════════════════════════════════════════════════════════════
function MobileHubCard({
  hubId, hub, accent, gradient, hubHasBulk, hubHasNotice, onClick,
}: {
  hubId: HubId
  hub: (typeof HUBS)[HubId]
  accent: string
  gradient: string
  hubHasBulk: boolean
  hubHasNotice: boolean
  onClick: () => void
}) {
  const itemCount = hub.sections.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <button
      onClick={onClick}
      aria-label={`Open ${hub.title}`}
      className="w-full text-left rounded-[18px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-200 active:scale-[0.98] transform-gpu p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-sans font-black text-[1.1rem] leading-tight text-zinc-900 dark:text-zinc-50 truncate pr-2">
          {hub.title}
        </h3>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--muted)", color: accent }}
          aria-hidden="true"
        >
          <CaretRight size={13} weight="bold" />
        </span>
      </div>

      <div
        className="relative w-full aspect-[2/1.15] rounded-[14px] flex items-center justify-center mb-3 overflow-hidden"
        style={{ background: gradient }}
      >
        <Image
          src={HUB_ICON_SRC[hubId]}
          alt=""
          width={72}
          height={72}
          className="object-contain drop-shadow-lg"
          aria-hidden="true"
        />
        {(hubHasBulk || hubHasNotice) && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {hubHasNotice && <CornerDot color={TOKEN.warningBg} label="Notice for some services" />}
            {hubHasBulk && <CornerDot color="#ffffff" label="Bulk pricing available" />}
          </div>
        )}
      </div>

      <p className="text-[0.82rem] font-bold text-zinc-500 dark:text-zinc-400">
        {itemCount} services <span className="opacity-50">·</span> {hub.sections.length} categories
      </p>
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════
// PILL — shared by both the hub row and the section row. Inactive state
// is ALWAYS neutral (see PILL_NEUTRAL above) regardless of which hub or
// section it represents. Active state gets the accent as a solid fill
// plus a soft accent-tinted ring around it for a bit of depth, instead
// of a flat block — this is the actual contrast fix.
// ══════════════════════════════════════════════════════════════════════
function Pill({
  icon, label, accent, isActive, onClick, size = "md",
}: {
  icon?: React.ReactNode
  label: string
  accent: string
  isActive: boolean
  onClick: () => void
  size?: "md" | "sm"
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-black transition-all duration-200 active:scale-95 border",
        size === "md" ? "pl-2 pr-4 py-2 text-[0.9rem]" : "pl-2 pr-3.5 py-1.5 text-[0.82rem]"
      )}
      style={
        isActive
          ? {
              backgroundColor: accent,
              borderColor: accent,
              color: "#ffffff",
              boxShadow: `0 0 0 4px ${accent}22`,
            }
          : {
              backgroundColor: "transparent",
              borderColor: PILL_NEUTRAL.border,
              color: PILL_NEUTRAL.text,
            }
      }
    >
      {icon && (
        <span
          className={cn("rounded-full flex items-center justify-center shrink-0", size === "md" ? "w-6 h-6" : "w-5 h-5")}
          style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "var(--muted)" }}
        >
          {icon}
        </span>
      )}
      {label}
    </button>
  )
}

// A pill that acts as a "back" control at the start of the section row —
// visually neutral always (never colored), since it's a navigation
// action, not a filter choice.
function BackPill({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 pl-2.5 pr-3.5 py-1.5 rounded-full font-black text-[0.82rem] border transition-all duration-200 active:scale-95 hover:bg-[var(--muted)]"
      style={{ borderColor: PILL_NEUTRAL.border, color: PILL_NEUTRAL.text }}
    >
      <CaretLeft size={12} weight="bold" />
      {label}
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════
// SECTION CARD — Level 1. Grid card (not a bar, not an accordion) that
// represents one section of the active hub (e.g. "SASSA"). Clicking it
// drills into Level 2 to show that section's services.
// ══════════════════════════════════════════════════════════════════════
function SectionCard({
  section, accent, onClick,
}: {
  section: (typeof HUBS)[HubId]["sections"][number]
  accent: string
  onClick: () => void
}) {
  const hasNotice = section.items.some((i) => !!i.notice)

  return (
    <button
      onClick={onClick}
      className="group/sectioncard text-left rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] p-5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-black text-[1.02rem] text-zinc-800 dark:text-zinc-100 leading-tight">
          {section.title}
        </h4>
        {hasNotice && <CornerDot color={TOKEN.warningBg} label="Notice for some services in this section" />}
      </div>

      {section.desc && (
        <p className="text-[0.82rem] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2 mb-4">
          {section.desc}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[0.78rem] font-bold" style={{ color: accent }}>
          {section.items.length} service{section.items.length === 1 ? "" : "s"}
        </span>
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 group-hover/sectioncard:translate-x-0.5"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <CaretRight size={12} weight="bold" />
        </span>
      </div>
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════
// SERVICE CARD — Level 2. Grid card for one individual service inside
// the active section. Clicking it opens the existing ServiceDetailModal.
// ══════════════════════════════════════════════════════════════════════
function ServiceCard({
  item, accent, onClick,
}: {
  item: { name: string; price: string; notice?: string }
  accent: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] p-4"
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className="font-black text-[0.95rem] text-zinc-800 dark:text-zinc-100 leading-snug flex items-start gap-1.5 min-w-0">
          {item.notice && (
            <span aria-label="Notice" className="shrink-0 font-black leading-none mt-0.5" style={{ color: TOKEN.warningBg }}>!</span>
          )}
          <span>{item.name}</span>
        </span>
      </div>
      <span className="text-[1.05rem] font-black" style={{ color: accent }}>
        {item.price}
      </span>
    </button>
  )
}

// ── PART 2 continues with the main ServicesPage component ──
/* components/services-page/index.tsx — PART 2 OF 2 */
/**
 * Continuation of the services page — the main exported component.
 * Everything defined in Part 1 (MobileHubCard, Pill, BackPill,
 * SectionCard, ServiceCard, etc.) is used below.
 */

export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark       = resolvedTheme === "dark"
  const searchParams = useSearchParams()
  const router       = useRouter()
  const consumedParamsKey = useRef<string | null>(null)

  const [activeHub,       setActiveHub]       = useState<HubId | null>(null)
  const [hubOriginSide,   setHubOriginSide]   = useState<"left" | "right">("right")
  const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
  const [clientNoticeDismissed, setClientNoticeDismissed] = useState(false)
  const showBackToTop = useBackToTop()

  // ── DESKTOP-ONLY navigation state ──
  // desktopActiveHub: null = Level 0 (original 5-card landing).
  //                   set = Level 1 or 2, this hub's pill is active.
  const [desktopActiveHub, setDesktopActiveHub] = useState<HubId | null>(null)
  // desktopActiveSection: null = Level 1 (section cards showing).
  //                        set = Level 2 (service cards for this section).
  const [desktopActiveSection, setDesktopActiveSection] = useState<number | null>(null)

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

  // Desktop: clicking one of the original 5 landing cards -> Level 1
  const handleDesktopSelectHub = (hubId: HubId) => {
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setDesktopActiveHub(hubId)
    setDesktopActiveSection(null)
  }

  // Desktop: clicking a hub PILL to switch hubs while already filtered —
  // always drops back to Level 1 (section cards) for the new hub.
  const handleDesktopSwitchHub = (hubId: HubId) => {
    if (hubId === desktopActiveHub) return
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setDesktopActiveHub(hubId)
    setDesktopActiveSection(null)
  }

  // Desktop: clicking a section CARD -> Level 2
  const handleDesktopSelectSection = (idx: number) => {
    setDesktopActiveSection(idx)
  }

  // Desktop: clicking a section PILL to switch sections while in Level 2
  const handleDesktopSwitchSection = (idx: number) => {
    setDesktopActiveSection(idx)
  }

  // Desktop: "back" pill inside Level 2 -> return to Level 1
  const handleDesktopBackToSections = () => {
    setDesktopActiveSection(null)
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const svc = (e as CustomEvent<SelectedService>).detail
      if (svc) handleSelectService(svc)
    }
    window.addEventListener("abh:selectService", handler)
    return () => window.removeEventListener("abh:selectService", handler)
  }, [])

  useEffect(() => {
    const hubParam     = searchParams.get("hub")
    const sectionParam = searchParams.get("section")
    const serviceParam = searchParams.get("service")
    if (!hubParam || !HUB_ORDER.includes(hubParam as HubId)) return

    const paramsKey = `${hubParam}|${sectionParam ?? ""}|${serviceParam ?? ""}`
    if (consumedParamsKey.current === paramsKey) return
    consumedParamsKey.current = paramsKey

    if (sectionParam && serviceParam) {
      const section = HUBS[hubParam as HubId].sections.find((s) => s.title === sectionParam)
      const item = section?.items.find((i) => i.name === serviceParam)
      if (section && item) {
        handleSelectService({
          name: item.name, price: item.price, hubId: hubParam as HubId,
          sectionTitle: section.title, requirements: item.requirements,
          desc: item.description, turnaround: getTurnaround(section.title, item.name),
          tips: item.tips ? [...item.tips] : undefined,
          notice: item.notice,
        })
        router.replace("/services", { scroll: false })
        return
      }
    }

    handleOpenHub(hubParam as HubId, "right")
    router.replace("/services", { scroll: false })
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

  const desktopHub = desktopActiveHub ? HUBS[desktopActiveHub] : null
  const desktopHubAccent = desktopActiveHub
    ? (isDark ? HUB_COLORS[desktopActiveHub as HubKey].accentDark : HUB_COLORS[desktopActiveHub as HubKey].accentLight)
    : "#000000"
  const desktopActiveSectionData =
    desktopHub && desktopActiveSection !== null ? desktopHub.sections[desktopActiveSection] : null

  return (
    <section className="min-h-screen bg-white dark:bg-[#081428] transition-colors duration-300 pb-24 overflow-x-hidden">

      <motion.div
        layout
        transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
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

        {!clientNoticeDismissed && (
          <ScrollBounce delay={0.08} className="relative z-0 w-full flex justify-center mb-6">
            <NoticePill
              variant="warning"
              Icon={Megaphone}
              collapsedLabel="Notice"
              expandedLabel="Notice to Clients"
              isDark={isDark}
              onDismiss={() => setClientNoticeDismissed(true)}
            >
              {NOTICE.text}
              <span className="font-black" style={{ color: TOKEN.blueText }}>{NOTICE.date}</span>
              {NOTICE.textAfter}
            </NoticePill>
          </ScrollBounce>
        )}

        <ScrollBounce delay={0.14} className="relative z-40 w-full mb-12 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        {/* ══════════════════ MOBILE — icon-tile cards, unchanged ══════════════════ */}
        <div className="grid md:hidden grid-cols-2 gap-4 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const hubHasBulk = hub.sections.some((s) => sectionHasBulk(hubId, s.title, s.items))
            const hubHasNotice = hub.sections.some((s) => s.items.some((i) => !!i.notice))
            const spansFull = index === HUB_ORDER.length - 1 && HUB_ORDER.length % 2 !== 0

            return (
              <div key={hubId} className={cn(spansFull && "col-span-2")}>
                <ScrollBounce delay={index * 0.06}>
                  <MobileHubCard
                    hubId={hubId}
                    hub={hub}
                    accent={accent}
                    gradient={colors.gradient}
                    hubHasBulk={hubHasBulk}
                    hubHasNotice={hubHasNotice}
                    onClick={() => handleOpenHub(hubId, "right")}
                  />
                </ScrollBounce>
              </div>
            )
          })}
        </div>

        {/* ══════════════════ DESKTOP — Level 0: original 5-card landing ══════════════════ */}
        {!desktopActiveHub && (
          <div className="hidden md:grid md:grid-cols-6 gap-6 pb-2 w-full">
            {HUB_ORDER.map((hubId, index) => {
              const hub    = HUBS[hubId]
              const colors = HUB_COLORS[hubId as HubKey]
              const accent = isDark ? colors.accentDark : colors.accentLight
              const hubHasBulk = hub.sections.some((s) => sectionHasBulk(hubId, s.title, s.items))
              const hubHasNotice = hub.sections.some((s) => s.items.some((i) => !!i.notice))

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
                    <div
                      className="group/hubcard relative flex flex-col items-center text-center h-full rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 transform-gpu px-6 py-8 cursor-pointer"
                      onClick={() => handleDesktopSelectHub(hubId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleDesktopSelectHub(hubId)}
                      aria-label={`Open ${hub.title}`}
                      style={{ ["--hub-accent" as any]: accent }}
                    >
                      <HubCornerIcon hubId={hubId} accent={accent} />
                      {hubHasBulk && <BulkRibbon />}
                      {hubHasNotice && <NoticeBadge />}

                      <h3 className="relative z-10 font-sans font-black text-[1.45rem] leading-tight mb-2 text-zinc-900 dark:text-zinc-50 group-hover/hubcard:text-[var(--hub-accent)] transition-colors duration-200">
                        {hub.title}
                      </h3>

                      <div className="relative z-10 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mb-2.5">
                        {HUB_PREVIEWS[hubId].map((hint, i) => (
                          <span key={i} className="text-[0.76rem] font-medium text-zinc-400 dark:text-zinc-500">
                            {hint}
                          </span>
                        ))}
                      </div>

                      <p className="relative z-10 abh-body text-[0.88rem] line-clamp-2 leading-snug mb-6 max-w-[190px]">
                        {hub.desc}
                      </p>

                      <div className="relative z-10 mt-auto">
                        <HubCta label="View more" accent={accent} pointsRight={true} />
                      </div>
                    </div>
                  </ScrollBounce>
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════════ DESKTOP — Level 1 & 2: pills + card grids ══════════════════ */}
        {desktopActiveHub && desktopHub && (
          <div className="hidden md:flex flex-col items-center w-full animate-in fade-in duration-200">

            {/* Hub pill row — always visible once any hub is selected */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-6">
              {HUB_ORDER.map((hubId) => {
                const colors = HUB_COLORS[hubId as HubKey]
                const accent = isDark ? colors.accentDark : colors.accentLight
                return (
                  <Pill
                    key={hubId}
                    label={HUBS[hubId].title}
                    accent={accent}
                    isActive={hubId === desktopActiveHub}
                    onClick={() => handleDesktopSwitchHub(hubId)}
                    icon={<HubIcon id={hubId} size={13} color={hubId === desktopActiveHub ? "#ffffff" : accent} />}
                  />
                )
              })}
            </div>

            {/* Level 2 only: secondary section pill row + back pill */}
            {desktopActiveSectionData && (
              <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
                <BackPill onClick={handleDesktopBackToSections} label="All Sections" />
                {desktopHub.sections.map((section, sIdx) => (
                  <Pill
                    key={sIdx}
                    label={section.title}
                    accent={desktopHubAccent}
                    isActive={sIdx === desktopActiveSection}
                    onClick={() => handleDesktopSwitchSection(sIdx)}
                    size="sm"
                  />
                ))}
              </div>
            )}

            {/* Level 1: section cards grid */}
            {!desktopActiveSectionData && (
              <div className="w-full max-w-3xl grid grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                {desktopHub.sections.map((section, sIdx) => (
                  <SectionCard
                    key={sIdx}
                    section={section}
                    accent={desktopHubAccent}
                    onClick={() => handleDesktopSelectSection(sIdx)}
                  />
                ))}
              </div>
            )}

            {/* Level 2: service cards grid for the active section */}
            {desktopActiveSectionData && (
              <div className="w-full max-w-3xl">
                {desktopActiveSectionData.desc && (
                  <p className="text-center text-[0.9rem] text-zinc-500 dark:text-zinc-400 mb-5 max-w-xl mx-auto">
                    {desktopActiveSectionData.desc}
                  </p>
                )}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {desktopActiveSectionData.items.map((item, iIdx) => (
                    <ServiceCard
                      key={iIdx}
                      item={item}
                      accent={desktopHubAccent}
                      onClick={() =>
                        handleSelectService({
                          name: item.name,
                          price: item.price,
                          hubId: desktopActiveHub,
                          sectionTitle: desktopActiveSectionData.title,
                          requirements: item.requirements,
                          desc: item.description,
                          turnaround: getTurnaround(desktopActiveSectionData.title, item.name),
                          tips: item.tips ? [...item.tips] : undefined,
                          notice: item.notice,
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ScrollBounce className="w-full mt-14 md:mt-20">
          <ClosingTagline />
        </ScrollBounce>
      </motion.div>

      <AnimatePresence>
        {activeHub && (
          <HubModal
            key="hub-modal"
            hubId={activeHub}
            originSide={hubOriginSide}
            onClose={closeHub}
            onSelectService={handleSelectService}
            onSwitchHub={(id) => handleOpenHub(id, "right")}
          />
        )}
        {selectedService && (
          <ServiceDetailModal key={selectedService.name} svc={selectedService} onClose={closeService} />
        )}
      </AnimatePresence>

      <BackToTopButton visible={showBackToTop && !isModalOpen} />
    </section>
  )
    }
