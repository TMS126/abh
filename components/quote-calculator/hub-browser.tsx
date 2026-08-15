"use client"

import { CaretDown, Plus, ShoppingBagOpen, Tag } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { HUBS, HubId } from "@/lib/data"
import { GLASS } from "./shared"
import { HUB_ORDER, BULK_TIERS, isScanItem, hubHasBulk, sectionHasBulk, getDisplayName } from "./lib"

interface Subtotal { total: number; savings: number; count: number }

interface HubBrowserProps {
  openHub: HubId | null
  setOpenHub: (h: HubId | null) => void
  openSections: Record<HubId, number | null>
  toggleSection: (hubId: HubId, sIdx: number) => void
  getAccent: (id: HubId) => string
  getSolid: (id: HubId) => string
  hubSubtotal: (hubId: HubId) => Subtotal | null
  sectionSubtotal: (hubId: HubId, sectionTitle: string) => Subtotal | null
  getItemQty: (itemId: string) => number
  onAddItem: (hubId: HubId, sectionTitle: string, name: string, price: string) => void
}

export function HubBrowser({
  openHub, setOpenHub, openSections, toggleSection,
  getAccent, getSolid, hubSubtotal, sectionSubtotal, getItemQty, onAddItem,
}: HubBrowserProps) {
  return (
    <div className="p-4 space-y-2">
      <span className="text-[0.78rem] font-black uppercase tracking-widest text-zinc-400 px-1">Add a Service</span>
      {HUB_ORDER.map(hubId => {
        const hub = HUBS[hubId]
        const accent = getAccent(hubId)
        const solidAccent = getSolid(hubId)
        const isHubOpen = openHub === hubId
        const hubSub = hubSubtotal(hubId)
        const hubBulk = hubHasBulk(hubId)
        const hubPanelId = `hub-panel-${hubId}`

        return (
          <div key={hubId} className={cn("rounded-[14px] overflow-hidden", GLASS.section)}>
            <button
              onClick={() => setOpenHub(isHubOpen ? null : hubId)}
              aria-expanded={isHubOpen}
              aria-controls={hubPanelId}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-zinc-100/70 dark:hover:bg-white/5 transition-colors duration-150"
            >
              <span className="flex-1 min-w-0 flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-[1.05rem] font-black truncate transition-colors duration-150",
                    !isHubOpen && "text-zinc-700 dark:text-zinc-200"
                  )}
                  style={isHubOpen ? { color: accent } : undefined}
                >
                  {hub.title}
                </span>

                {!isHubOpen && hubBulk && (
                  <span
                    className="flex items-center gap-0.5 text-[0.6rem] font-black px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                    aria-label="Bulk pricing available in this hub"
                  >
                    <Tag size={10} weight="fill" aria-hidden="true" /> Bulk
                  </span>
                )}

                {!isHubOpen && hubSub && (
                  <span
                    className="ml-auto shrink-0 flex items-center gap-1 text-[0.66rem] font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                    aria-label={`${hubSub.count} item${hubSub.count === 1 ? "" : "s"} in cart from ${hub.title}, total R${hubSub.total}`}
                  >
                    <ShoppingBagOpen size={11} weight="fill" aria-hidden="true" />
                    {hubSub.count} {hubSub.count === 1 ? "item" : "items"} · R{hubSub.total}
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
              id={hubPanelId}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                isHubOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                {/* Hub-level bracket line: encloses the whole section list while the hub is open */}
                <div className="relative border-t border-zinc-100 dark:border-white/10 pl-3">
                  <div
                    className="absolute left-1.5 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ backgroundColor: `${accent}50` }}
                    aria-hidden="true"
                  />
                  {hub.sections.map((section, sIdx) => {
                    const isSectionOpen = openSections[hubId] === sIdx
                    const anySectionOpen = openSections[hubId] != null
                    const secSub = sectionSubtotal(hubId, section.title)
                    const sectionBulk = sectionHasBulk(hubId, section.title, section.items)
                    const sectionPanelId = `section-panel-${hubId}-${sIdx}`

                    return (
                      <div
                        key={sIdx}
                        className={cn(sIdx > 0 && "border-t border-zinc-100 dark:border-white/[0.07]")}
                      >
                        <button
                          onClick={() => toggleSection(hubId, sIdx)}
                          aria-expanded={isSectionOpen}
                          aria-controls={sectionPanelId}
                          className="w-full flex items-center justify-between px-3 py-2 transition-colors duration-150 hover:bg-zinc-100/70 dark:hover:bg-white/5"
                        >
                          <span className="flex items-center gap-1.5">
                            {/* Pill only for the selected section; colored-flat when a sibling
                                is open; neutral when nothing in this hub is open */}
                            <span
                              className={cn(
                                "text-[0.78rem] font-black uppercase tracking-[0.15em] transition-colors duration-200",
                                isSectionOpen ? "px-2.5 py-1 rounded-full" : "px-0 py-1",
                                !isSectionOpen && !anySectionOpen && "text-zinc-500 dark:text-zinc-400"
                              )}
                              style={
                                isSectionOpen
                                  ? { backgroundColor: solidAccent, color: "#fff" }
                                  : anySectionOpen
                                    ? { color: accent }
                                    : undefined
                              }
                            >
                              {section.title}
                            </span>

                            {!isSectionOpen && sectionBulk && (
                              <span
                                className="flex items-center gap-0.5 text-[0.58rem] font-black px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: `${accent}18`, color: accent }}
                                aria-label="Bulk pricing available in this section"
                              >
                                <Tag size={9} weight="fill" aria-hidden="true" /> Bulk
                              </span>
                            )}

                            {!isSectionOpen && secSub && (
                              <span
                                className="flex items-center gap-0.5 text-[0.6rem] font-black px-1.5 py-0.5 rounded-full"
                                style={{ backgroundColor: `${accent}18`, color: accent }}
                                aria-label={`${secSub.count} item${secSub.count === 1 ? "" : "s"} in cart from ${section.title}`}
                              >
                                <ShoppingBagOpen size={10} weight="fill" aria-hidden="true" />
                                {secSub.count}
                              </span>
                            )}
                          </span>
                          <CaretDown
                            size={12}
                            className="mr-1 transition-transform duration-200 ease-out motion-reduce:transition-none"
                            style={{ color: accent, transform: isSectionOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </button>

                        <div
                          id={sectionPanelId}
                          className={cn(
                            "grid transition-[grid-template-rows] duration-250 ease-out motion-reduce:transition-none",
                            isSectionOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="relative px-3 pb-3 pt-1 pl-6 space-y-1.5">
                              <div
                                className="absolute left-3 top-1 bottom-3 w-0.5 rounded-full"
                                style={{ backgroundColor: `${accent}70` }}
                                aria-hidden="true"
                              />
                              {section.items.map((item, iIdx) => {
                                const itemId = `${hubId}-${section.title}-${item.name}`
                                const hasBulk = !!BULK_TIERS[itemId] || isScanItem(item.name)
                                const itemQty = getItemQty(itemId)
                                return (
                                  <div
                                    key={iIdx}
                                    className={cn("relative overflow-hidden flex items-center gap-2 p-2 rounded-[10px] shadow-sm transition-colors duration-150", GLASS.item)}
                                    style={{ backgroundColor: `${accent}08` }}
                                  >
                                    {hasBulk && (
                                      <span
                                        className="absolute -right-7 top-1.5 rotate-45 text-[0.55rem] font-black uppercase tracking-wider px-7 py-0.5 text-white"
                                        style={{ backgroundColor: solidAccent }}
                                        aria-hidden="true"
                                      >
                                        Bulk
                                      </span>
                                    )}
                                    {/* Item marker: dot instead of the old left border */}
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ backgroundColor: accent }}
                                      aria-hidden="true"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[0.9rem] font-bold text-zinc-700 dark:text-zinc-300 truncate">
                                        {getDisplayName(section.title, item.name)}
                                        {hasBulk && <span className="sr-only"> — bulk pricing available</span>}
                                      </p>
                                      <p className="text-[0.78rem] font-medium text-zinc-400">{item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {itemQty > 0 && (
                                        <span
                                          className="flex items-center gap-0.5 text-[0.6rem] font-black px-1.5 py-0.5 rounded-full"
                                          style={{ backgroundColor: `${accent}18`, color: accent }}
                                          aria-label={`${itemQty} already in your quote`}
                                        >
                                          <ShoppingBagOpen size={10} weight="fill" aria-hidden="true" />
                                          {itemQty}
                                        </span>
                                      )}
                                      <button
                                        onClick={() => onAddItem(hubId, section.title, item.name, item.price)}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform duration-150 transform-gpu"
                                        style={{ backgroundColor: solidAccent }}
                                        aria-label={`Add ${item.name}`}
                                      >
                                        <Plus size={13} weight="bold" aria-hidden="true" />
                                      </button>
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
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
                        }
