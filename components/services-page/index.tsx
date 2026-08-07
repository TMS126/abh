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
import { HUB_ORDER, HUB_PREVIEWS, NOTICE, trackEvent, getTurnaround, SelectedService } from "./lib"
import { sectionHasBulk } from "../quote-calculator/lib"

function NoticeNotification({ isDark }: { isDark: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const pillBg = isDark ? `${BRAND.orange}cc` : BRAND.orange

  return (
    <div
      className="mx-auto w-full overflow-hidden"
      style={{
        maxWidth: expanded ? "28rem" : "120px",
        borderRadius: "14px",
        border: expanded ? "1px solid rgba(var(--brand-orange-rgb, 249,115,22),0.2)" : "none",
        backgroundColor: expanded ? undefined : pillBg,
        boxShadow: expanded
          ? undefined
          : "0 4px 14px -4px rgba(0,0,0,0.22), 0 2px 6px -2px rgba(0,0,0,0.14)",
        transition:
          "max-width 300ms ease-in-out, box-shadow 300ms ease-in-out, background-color 300ms ease-in-out, border 300ms ease-in-out",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse notice" : "Show notice to clients"}
        className={cn(
          "w-full flex items-center gap-2 transition-all duration-300 ease-in-out active:scale-[0.97]",
          expanded
            ? "px-5 py-3.5 justify-between bg-brand-orange/5 dark:bg-brand-orange/10"
            : "pl-4 pr-5 py-2.5 justify-center"
        )}
      >
        {!expanded && (
          <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/25 shrink-0">
            <Megaphone size={11} weight="fill" color="#fff" aria-hidden="true" />
          </span>
        )}
        {expanded && (
          <div className="w-7 h-7 rounded-[8px] bg-brand-orange flex items-center justify-center shrink-0">
            <Megaphone size={14} weight="fill" color="#fff" aria-hidden="true" />
          </div>
        )}
        <span
          className={cn(
            "whitespace-nowrap font-black text-[0.9rem] tracking-tight transition-colors duration-300 ease-in-out",
            expanded ? "text-brand-orange flex-1 text-left" : "text-white"
          )}
        >
          {expanded ? "Notice to Clients" : "Notice"}
        </span>
        <X
          size={14}
          weight="bold"
          aria-hidden="true"
          className={cn(
            "shrink-0 transition-opacity duration-300 ease-in-out text-zinc-400",
            expanded ? "opacity-100" : "opacity-0 w-0 h-0"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pt-1">
            <p className="abh-body text-[1rem]">
              {NOTICE.text}
              <span className="font-black text-zinc-800 dark:text-zinc-100">{NOTICE.date}</span>
              {NOTICE.textAfter}
            </p>
          </div>
        </div>
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

export function ServicesPage() {
  const { resolvedTheme } = useTheme()
  const isDark       = resolvedTheme === "dark"
  const searchParams = useSearchParams()
  const router       = useRouter()
  const consumedParamsKey = useRef<string | null>(null)

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

        <ScrollBounce delay={0.08} className="relative z-0 w-full flex justify-center mb-6">
          <NoticeNotification isDark={isDark} />
        </ScrollBounce>

        <ScrollBounce delay={0.14} className="relative z-40 w-full mb-12 flex justify-center">
          <div id="abh-inline-search" className="w-full flex justify-center">
            <InlineSearchBar onSelect={handleSelectService} />
          </div>
        </ScrollBounce>

        {/* ── Desktop grid ── */}
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
                  <div
                    className="group/hubcard relative flex flex-col items-center text-center h-full rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 transform-gpu p-6 cursor-pointer"
                    onClick={() => handleOpenHub(hubId, "right")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleOpenHub(hubId, "right")}
                    aria-label={`Open ${hub.title}`}
                    style={{ ["--hub-accent" as any]: accent }}
                  >
                    <HubCornerIcon hubId={hubId} accent={accent} />
                    {hubHasBulk && <BulkRibbon />}

                    <h3 className="relative z-10 font-sans font-black text-[1.45rem] leading-tight mb-1.5 text-zinc-900 dark:text-zinc-50 group-hover/hubcard:text-[var(--hub-accent)] transition-colors duration-200">
                      {hub.title}
                    </h3>

                    <div className="relative z-10 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mb-2">
                      {HUB_PREVIEWS[hubId].map((hint, i) => (
                        <span key={i} className="text-[0.76rem] font-medium text-zinc-400 dark:text-zinc-500">
                          {hint}
                        </span>
                      ))}
                    </div>

                    <p className="relative z-10 abh-body text-[0.88rem] line-clamp-2 leading-snug mb-4 max-w-[190px]">
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

        {/* ── Mobile stacked cards ── */}
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
                  className="group/hubcard relative flex flex-col items-center text-center w-full rounded-[14px] bg-white dark:bg-zinc-950 abh-shadow-card overflow-hidden transition-all duration-200 active:scale-[0.98] transform-gpu p-6"
                  style={{ ["--hub-accent" as any]: accent }}
                >
                  <HubCornerIcon hubId={hubId} accent={accent} />
                  {hubHasBulk && <BulkRibbon />}

                  <h3 className="relative z-10 font-sans font-black text-[1.45rem] leading-tight mb-1.5 text-zinc-900 dark:text-zinc-50 group-hover/hubcard:text-[var(--hub-accent)] transition-colors duration-200">
                    {hub.title}
                  </h3>

                  <div className="relative z-10 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mb-2">
                    {HUB_PREVIEWS[hubId].map((hint, i) => (
                      <span key={i} className="text-[0.76rem] font-medium text-zinc-400 dark:text-zinc-500">
                        {hint}
                      </span>
                    ))}
                  </div>

                  <p className="relative z-10 abh-body text-[0.88rem] line-clamp-2 leading-snug mb-3 max-w-[260px]">
                    {hub.desc}
                  </p>

                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    {/* "Explore" now sits on a subtle dotted underline in
                        the hub's own accent color — always faintly visible,
                        fading to full strength on hover/press. */}
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
      </div>

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
