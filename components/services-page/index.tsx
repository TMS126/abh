/* components/services-page/index.tsx — PART 1 OF 2 */
"use client"

/**
 * ════════════════════════════════════════════════════════════════════════
 * SERVICES PAGE
 *
 * TWO COMPLETELY DIFFERENT LAYOUTS, SAME DATA/LOGIC UNDERNEATH:
 *
 * MOBILE (< md breakpoint):
 *   Same 5 hubs, same tap-to-open-HubModal behavior as before — ONLY the
 *   visual card style changed, to the icon-tile look with images from
 *   /public (phub.png, dochub.png, dhub.png, ehub.png, thub.png).
 *
 * DESKTOP (>= md breakpoint):
 *   On first load: the original 5 big cards, completely unchanged.
 *   Click a card -> it shrinks into a small pill and joins a pill row at
 *   the top alongside pills for the other 4 hubs (the clicked one is
 *   highlighted). Below the pills, that hub's SECTIONS render as cards
 *   (e.g. "SASSA", "SARS", "Online Applications"). Click a section card
 *   and it expands in place (accordion) to show that section's individual
 *   services as a simple list. Click a service -> opens the existing
 *   ServiceDetailModal, exactly as before. Click a different pill to
 *   switch hubs; nothing here changes the underlying HUBS data or the
 *   modals themselves.
 * ════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Megaphone, ArrowRight, CaretRight, CaretDown, WarningCircle } from "@phosphor-icons/react"
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

// Diagonal "Bulk" ribbon — ONLY used on the original, untouched 5-card
// desktop landing view (kept "like now", per instruction). Never used on
// the new mobile tiles or desktop pill/section cards — those use the
// smaller CornerDot below instead, since a diagonal ribbon would collide
// with the new icon artwork in a denser layout.
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

// Circular orange badge — ONLY used on the original 5-card desktop
// landing view, same reasoning as BulkRibbon above.
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

// Small unobtrusive dot — used on the NEW mobile tiles and desktop
// pill/section cards. Two independent dots can render side by side
// (bulk + notice) without ever overlapping the icon artwork or text.
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
// MOBILE HUB CARD — icon-tile style, using the /public hub images.
// Interaction is UNCHANGED from before: tapping it still calls
// onClick -> handleOpenHub -> opens the existing HubModal. Only the
// visuals are new. Info shown (title, preview tags, description) is the
// same info that was already there, just laid out differently.
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
      {/* Top row: title + chevron affordance */}
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

      {/* Icon tile — gradient square with the hub's PNG icon centered */}
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

        {/* Bulk/Notice dots — top-right of the tile, small and stacked
            horizontally, never overlapping the centered icon artwork */}
        {(hubHasBulk || hubHasNotice) && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {hubHasNotice && <CornerDot color={TOKEN.warningBg} label="Notice for some services" />}
            {hubHasBulk && <CornerDot color="#ffffff" label="Bulk pricing available" />}
          </div>
        )}
      </div>

      {/* Info line — service count + category count, real data only */}
      <p className="text-[0.82rem] font-bold text-zinc-500 dark:text-zinc-400">
        {itemCount} services <span className="opacity-50">·</span> {hub.sections.length} categories
      </p>
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════
// DESKTOP PILL — the shrunk version of a hub card once any hub has been
// selected. All 5 hubs render as pills; the currently-active one is
// visually highlighted (solid accent fill), the rest are outlined.
// ══════════════════════════════════════════════════════════════════════
function DesktopHubPill({
  hubId, title, accent, isActive, onClick,
}: {
  hubId: HubId
  title: string
  accent: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full font-black text-[0.9rem] transition-all duration-200 active:scale-95 border-2"
      )}
      style={
        isActive
          ? { backgroundColor: accent, borderColor: accent, color: "#ffffff" }
          : { backgroundColor: "transparent", borderColor: accent, color: accent }
      }
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : `${accent}15` }}
      >
        <HubIcon id={hubId} size={13} color={isActive ? "#ffffff" : accent} />
      </span>
      {title}
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════
// DESKTOP SECTION CARD — shows one section of the active hub (e.g.
// "SASSA"). Click toggles it open/closed; when open, its services list
// out directly beneath it. Only one section is open at a time per hub,
// keeping the view from getting overwhelming.
// ══════════════════════════════════════════════════════════════════════
function DesktopSectionCard({
  section, hubId, accent, isExpanded, onToggle, onSelectService,
}: {
  section: (typeof HUBS)[HubId]["sections"][number]
  hubId: HubId
  accent: string
  isExpanded: boolean
  onToggle: () => void
  onSelectService: (svc: SelectedService) => void
}) {
  const sectionHasNotice = section.items.some((i) => !!i.notice)
  const sectionHasBulkFlag = sectionHasBulk(hubId, section.title, section.items)

  return (
    <div className="rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
      >
        <div className="min-w-0 flex items-center gap-2">
          <span className="font-black text-[1.05rem] text-zinc-800 dark:text-zinc-100 truncate">
            {section.title}
          </span>
          {sectionHasNotice && <CornerDot color={TOKEN.warningBg} label="Notice for some services in this section" />}
          {sectionHasBulkFlag && <CornerDot color={accent} label="Bulk pricing available" />}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[0.78rem] font-bold text-zinc-400 dark:text-zinc-500">
            {section.items.length}
          </span>
          <CaretDown
            size={14}
            weight="bold"
            className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
            style={{ color: accent }}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 p-2 grid grid-cols-1 gap-1.5 animate-in fade-in duration-150">
          {section.items.map((item, idx) => (
            <button
              key={idx}
              onClick={() =>
                onSelectService({
                  name: item.name,
                  price: item.price,
                  hubId,
                  sectionTitle: section.title,
                  requirements: item.requirements,
                  desc: item.description,
                  turnaround: getTurnaround(section.title, item.name),
                  tips: item.tips ? [...item.tips] : undefined,
                  notice: item.notice,
                })
              }
              className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors duration-150 active:scale-[0.99] w-full text-left"
            >
              <span className="text-[0.92rem] font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 min-w-0">
                {itemHasBulk(hubId, section.title, item.name) && (
                  <span className="shrink-0 text-[0.55rem] font-black uppercase tracking-wide text-zinc-400">Bulk ·</span>
                )}
                {item.notice && (
                  <span aria-label="Notice" className="shrink-0 font-black text-[0.85rem] leading-none" style={{ color: TOKEN.warningBg }}>!</span>
                )}
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 ml-3 text-[0.92rem] font-black" style={{ color: accent }}>
                {item.price}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── PART 2 continues with the main ServicesPage component ──
/* components/services-page/index.tsx — PART 2 OF 2 */
/**
 * Continuation of the services page — the main exported component.
 * Everything defined in Part 1 (MobileHubCard, DesktopHubPill,
 * DesktopSectionCard, etc.) is used below.
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

  // ── DESKTOP-ONLY filter state ──
  // desktopActiveHub: which hub's pill is highlighted / whose sections
  // are showing below the pill row. null = still on the original 5-card
  // landing view (nothing selected yet).
  const [desktopActiveHub, setDesktopActiveHub] = useState<HubId | null>(null)
  // desktopExpandedSection: index of the currently open (expanded)
  // section card within the active hub. null = all collapsed.
  const [desktopExpandedSection, setDesktopExpandedSection] = useState<number | null>(null)

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

  // Called when a desktop hub CARD (initial landing view) is clicked —
  // switches into filter mode instead of opening the HubModal.
  const handleDesktopSelectHub = (hubId: HubId) => {
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setDesktopActiveHub(hubId)
    setDesktopExpandedSection(null)
  }

  // Called when a PILL is clicked to switch to a different hub while
  // already in filter mode.
  const handleDesktopSwitchHub = (hubId: HubId) => {
    if (hubId === desktopActiveHub) return
    trackEvent("view_hub", { hub_id: hubId, hub_name: HUBS[hubId].title })
    setDesktopActiveHub(hubId)
    setDesktopExpandedSection(null)
  }

  const handleDesktopToggleSection = (idx: number) => {
    setDesktopExpandedSection((prev) => (prev === idx ? null : idx))
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

        {/* ══════════════════ MOBILE — icon-tile cards, unchanged interaction ══════════════════ */}
        <div className="grid md:hidden grid-cols-2 gap-4 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const hubHasBulk = hub.sections.some((s) => sectionHasBulk(hubId, s.title, s.items))
            const hubHasNotice = hub.sections.some((s) => s.items.some((i) => !!i.notice))
            // Tech Hub is the odd one out (5th card) — spans both columns
            // on its own row so the 2-column grid doesn't leave a gap.
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

        {/* ══════════════════ DESKTOP — original 5-card landing (unchanged) ══════════════════ */}
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

        {/* ══════════════════ DESKTOP — filtered view (pills + sections) ══════════════════ */}
        {desktopActiveHub && desktopHub && (
          <div className="hidden md:flex flex-col items-center w-full animate-in fade-in duration-200">

            {/* Pill row — all 5 hubs, active one highlighted */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              {HUB_ORDER.map((hubId) => {
                const colors = HUB_COLORS[hubId as HubKey]
                const accent = isDark ? colors.accentDark : colors.accentLight
                return (
                  <DesktopHubPill
                    key={hubId}
                    hubId={hubId}
                    title={HUBS[hubId].title}
                    accent={accent}
                    isActive={hubId === desktopActiveHub}
                    onClick={() => handleDesktopSwitchHub(hubId)}
                  />
                )
              })}
            </div>

            {/* Section cards for the active hub */}
            <div className="w-full max-w-2xl flex flex-col gap-3">
              {(() => {
                const colors = HUB_COLORS[desktopActiveHub as HubKey]
                const accent = isDark ? colors.accentDark : colors.accentLight
                return desktopHub.sections.map((section, sIdx) => (
                  <DesktopSectionCard
                    key={sIdx}
                    section={section}
                    hubId={desktopActiveHub}
                    accent={accent}
                    isExpanded={desktopExpandedSection === sIdx}
                    onToggle={() => handleDesktopToggleSection(sIdx)}
                    onSelectService={handleSelectService}
                  />
                ))
              })()}
            </div>
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
