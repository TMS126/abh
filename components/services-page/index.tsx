/* components/services-page/index.tsx */
"use client"

/**
 * ════════════════════════════════════════════════════════════════════════
 * SERVICES PAGE — the main /services page showing all 5 hub cards.
 *
 * NOTICE BADGE:
 *   A small round orange "!" badge appears in the top-right corner of a
 *   hub's card (both the desktop grid and the mobile stacked list) if ANY
 *   service inside ANY section of that hub currently has a `notice` set.
 *   Fully dynamic — no hub name hardcoded, just checks the data.
 * ════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Megaphone, ArrowRight, WarningCircle } from "@phosphor-icons/react"
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
import { sectionHasBulk } from "../quote-calculator/lib"
import { NoticePill } from "@/components/notice-pill"
import { BackToTopButton, useBackToTop } from "@/components/back-to-top-button"

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

  return (
    <section className="min-h-screen bg-white dark:bg-[#081428] transition-colors duration-300 pb-24 overflow-x-hidden">

      {/* FIX: was a plain <div> — layout changes (the notice pill expanding/
          collapsing above) now animate smoothly instead of snapping,
          because this wrapper tracks and tweens its own height via
          framer-motion's `layout` prop. Everything below the pill (search
          bar, hub grid) shifts down/up in sync with it. */}
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
              <span className="font-black" style={{ color: TOKEN.blueText }}</span>
              {NOTICE.textAfter}
            </NoticePill>
          </ScrollBounce>
        )}

        <ScrollBounce delay={0.14} className="relative z-40 w-full mb-12 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        {/* ══════════════════ DESKTOP GRID ══════════════════ */}
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
                  {/* FIX: p-6 → px-6 py-8. Same horizontal footprint, more
                      breathing room top/bottom — bumped the internal gaps
                      below too so it reads as one evenly-spaced card, not
                      just padding at the edges. */}
                  <div
                    className="group/hubcard relative flex flex-col items-center text-center h-full rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 transform-gpu px-6 py-8 cursor-pointer"
                    onClick={() => handleOpenHub(hubId, "right")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleOpenHub(hubId, "right")}
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

        {/* ══════════════════ MOBILE STACKED CARDS ══════════════════ */}
        <div className="flex md:hidden flex-col gap-6 pb-2 w-full">
          {HUB_ORDER.map((hubId, index) => {
            const hub    = HUBS[hubId]
            const colors = HUB_COLORS[hubId as HubKey]
            const accent = isDark ? colors.accentDark : colors.accentLight
            const hubHasBulk = hub.sections.some((s) => sectionHasBulk(hubId, s.title, s.items))
            const hubHasNotice = hub.sections.some((s) => s.items.some((i) => !!i.notice))

            return (
              <ScrollBounce key={hubId} delay={index * 0.08}>
                <button
                  onClick={() => handleOpenHub(hubId, "right")}
                  aria-label={`Open ${hub.title}`}
                  className="group/hubcard relative flex flex-col items-center text-center w-full rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-200 active:scale-[0.98] transform-gpu px-6 py-8"
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

                  <p className="relative z-10 abh-body text-[0.88rem] line-clamp-2 leading-snug mb-4 max-w-[260px]">
                    {hub.desc}
                  </p>

                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[0.88rem] font-black text-zinc-400 dark:text-zinc-500 group-hover/hubcard:text-[var(--hub-accent)] transition-colors duration-200">
                      <span
                        className="border-b-2 border-dotted pb-0.5 opacity-45 group-hover/hubcard:opacity-100 transition-opacity duration-200"
                        style={{ borderColor: accent }}
                      >
                        Explore
                      </span>
                      <ArrowRight size={12} weight="bold" aria-hidden="true" />
                    </span>
                    <span
                      className="block w-1.5 h-1.5 rounded-full opacity-0 group-hover/hubcard:opacity-100 transition-opacity duration-200"
                      style={{ backgroundColor: accent }}
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </ScrollBounce>
            )
          })}
        </div>

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
