"use client"

import { CaretDown, SealPercent, Plus } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { HUBS, HubId } from "@/lib/data"
import { GLASS, HubIcon } from "./shared"
import { HUB_ORDER, BULK_TIERS, isScanItem, hubHasBulk, sectionHasBulk, getDisplayName } from "./lib"

interface HubBrowserProps {
  openHub: HubId | null
  setOpenHub: (h: HubId | null) => void
  openSections: Record<HubId, number | null>
  toggleSection: (hubId: HubId, sIdx: number) => void
  getAccent: (id: HubId) => string
  getSolid: (id: HubId) => string
  hubSubtotal: (hubId: HubId) => { total: number; savings: number; count: number } | null
  onAddItem: (hubId: HubId, sectionTitle: string, name: string, price: string) => void
}

export function HubBrowser({
  openHub, setOpenHub, openSections, toggleSection,
  getAccent, getSolid, hubSubtotal, onAddItem,
}: HubBrowserProps) {
  return (
    <div className="p-4 space-y-2">
      <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 px-1">Add a Service</span>
      {HUB_ORDER.map(hubId => {
        const hub = HUBS[hubId]
        const accent = getAccent(hubId)
        const solidAccent = getSolid(hubId)
        const isHubOpen = openHub === hubId
        const subtotal = hubSubtotal(hubId)
        const hubBulk = hubHasBulk(hubId)

        return (
          <div key={hubId} className={cn("rounded-[14px] overflow-hidden", GLASS.section)}>
            <button
              onClick={() => setOpenHub(isHubOpen ? null : hubId)}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-100/70 dark:hover:bg-white/5 transition-colors duration-150"
            >
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accent}20`, color: accent }}
              >
                <HubIcon id={hubId} />
              </div>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-black truncate" style={{ color: accent }}>{hub.title}</span>
                  {hubBulk && (
                    <SealPercent size={12} weight="fill" style={{ color: accent }} className="shrink-0" aria-label="Bulk pricing available" />
                  )}
                </span>
                {subtotal && (
                  <span className="block text-[0.62rem] font-bold mt-0.5" style={{ color: accent }}>
                    {subtotal.count} item{subtotal.count === 1 ? "" : "s"} · R{subtotal.total}
                  </span>
                )}
              </span>
              <CaretDown
                size={14}
                className="transition-transform duration-200 ease-out motion-reduce:transition-none shrink-0"
                style={{ color: isHubOpen ? accent : undefined, transform: isHubOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                isHubOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-zinc-100 dark:border-white/10">
                  {hub.sections.map((section, sIdx) => {
                    const isSectionOpen = openSections[hubId] === sIdx
                    const sectionBulk = sectionHasBulk(hubId, section.title, section.items)

                    return (
                      <div
                        key={sIdx}
                        className={cn(sIdx > 0 && "border-t border-zinc-100 dark:border-white/[0.07]")}
                      >
                        <button
                          onClick={() => toggleSection(hubId, sIdx)}
                          className="w-full flex items-center justify-between px-3 py-2 transition-colors duration-150 hover:bg-zinc-100/70 dark:hover:bg-white/5"
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              className="text-[0.65rem] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full transition-colors duration-200"
                              style={
                                isSectionOpen
                                  ? { backgroundColor: solidAccent, color: "#fff" }
                                  : { backgroundColor: `${accent}18`, color: accent }
                              }
                            >
                              {section.title}
                            </span>
                            {sectionBulk && (
                              <SealPercent size={11} weight="fill" style={{ color: accent }} aria-label="Bulk pricing available" />
                            )}
                          </span>
                          <CaretDown
                            size={12}
                            className="mr-1 transition-transform duration-200 ease-out motion-reduce:transition-none"
                            style={{ color: accent, transform: isSectionOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </button>

                        <div
                          className={cn(
                            "grid transition-[grid-template-rows] duration-250 ease-out motion-reduce:transition-none",
                            isSectionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="px-3 pb-3 pt-1 space-y-1.5">
                              {section.items.map((item, iIdx) => {
                                const itemId = `${hubId}-${section.title}-${item.name}`
                                const hasBulk = !!BULK_TIERS[itemId] || isScanItem(item.name)
                                return (
                                  <div
                                    key={iIdx}
                                    className={cn("flex items-center justify-between gap-2 p-2 rounded-[10px] shadow-sm border-l-2 transition-colors duration-150", GLASS.item)}
                                    style={{ backgroundColor: `${accent}08`, borderLeftColor: `${accent}70` }}
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                                        {getDisplayName(section.title, item.name)}
                                      </p>
                                      <p className="text-[0.65rem] font-medium text-zinc-400">
                                        {item.price}
                                        {hasBulk && <span className="font-bold ml-1" style={{ color: accent }}>· bulk</span>}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => onAddItem(hubId, section.title, item.name, item.price)}
                                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform duration-150 transform-gpu"
                                      style={{ backgroundColor: solidAccent }}
                                      aria-label={`Add ${item.name}`}
                                    >
                                      <Plus size={13} weight="bold" />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
