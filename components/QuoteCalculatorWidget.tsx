"use client"

import { useState, useMemo, useEffect } from "react"
import { Calculator, X, Plus, Minus, Trash, WhatsappLogo, CaretDown, SealPercent, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, waLink } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

const GOLD = "#C9A227"

// ─── BULK PRICING TIERS ──────────────────────────────────────────────────────
const BULK_TIERS: Record<string, { min: number; rate: number }[]> = {
  "print-Copying-Black & White":        [{ min: 10, rate: 2 }, { min: 100, rate: 1 }],
  "print-Copying-Colour":               [{ min: 10, rate: 4 }, { min: 50,  rate: 3 }],
  "print-Printing-Black & White":       [{ min: 10, rate: 4 }, { min: 100, rate: 3 }],
  "print-Printing-Colour":              [{ min: 10, rate: 7 }, { min: 50,  rate: 5 }],
  "doc-Typing + Printing-Black & White":[{ min: 10, rate: 10 }],
  "doc-Typing + Printing-Colour":       [{ min: 10, rate: 11 }],
}

// Returns the maximum qty tier min for an item (used to cap the input)
function getBulkMax(id: string): number | null {
  const tiers = BULK_TIERS[id]
  if (!tiers || tiers.length === 0) return null
  return tiers[tiers.length - 1].min * 10 // allow up to 10x the highest tier min
}

const SECTION_LABEL: Record<string, string> = {
  "Printing": "Print",
  "Copying": "Copy",
  "Typing + Printing": "Typing",
}
function getDisplayName(sectionTitle: string, name: string): string {
  if ((name === "Black & White" || name === "Colour") && SECTION_LABEL[sectionTitle]) {
    return `${name} ${SECTION_LABEL[sectionTitle]}`
  }
  return name
}

function getEffectiveRate(id: string, qty: number, fallback: number): number {
  const tiers = BULK_TIERS[id]
  if (!tiers) return fallback
  let rate = fallback
  for (const t of tiers) { if (qty >= t.min) rate = t.rate }
  return rate
}

function getNextTier(id: string, qty: number) {
  const tiers = BULK_TIERS[id]
  if (!tiers) return null
  return tiers.find(t => qty < t.min) ?? null
}

function getBulkHint(id: string, qty: number, effRate: number, baseRate: number): string | null {
  const next = getNextTier(id, qty)
  const discounted = effRate < baseRate
  if (next) {
    const needed = next.min - qty
    return discounted
      ? `Bulk rate applied — add ${needed} more for R${next.rate} each`
      : `Add ${needed} more to unlock R${next.rate} each`
  }
  return discounted ? "Best bulk rate applied" : null
}

function HubIcon({ id, size = 16, color }: { id: HubId; size?: number; color?: string }) {
  const p = { size, weight: "fill" as const, color: color ?? "currentColor", "aria-hidden": true }
  switch (id) {
    case "print":    return <Printer    {...p} />
    case "doc":      return <FileText   {...p} />
    case "design":   return <PaintBrush {...p} />
    case "eservice": return <Globe      {...p} />
    case "tech":     return <Desktop    {...p} />
  }
}

function parsePrice(price: string): { amount: number; unit: string | null } {
  const match = price.match(/R(\d+(?:\.\d+)?)(?:\/(.+))?/)
  if (!match) return { amount: 0, unit: null }
  return { amount: parseFloat(match[1]), unit: match[2] ?? null }
}

interface CartItem {
  id: string
  hubId: HubId
  sectionTitle: string
  name: string
  unitPrice: number
  unit: string | null
  qty: number
}

const STORAGE_KEY = "apexbytes-quote-cart"

export function QuoteCalculatorWidget() {
  const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === "dark"
  const [isOpen, setIsOpen] = useState(false)
  const [openHub, setOpenHub] = useState<HubId | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // ── Persist cart to localStorage ─────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setCart(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch {}
  }, [cart, hydrated])

  const getAccent = (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.tagTextDark : c.tagText }
  const titleAccent = isDark ? HUB_COLORS.design.tagTextDark : HUB_COLORS.design.tagText

  const addItem = (hubId: HubId, sectionTitle: string, name: string, price: string) => {
    const { amount, unit } = parsePrice(price)
    const id = `${hubId}-${sectionTitle}-${name}`
    setCart(prev => {
      const existing = prev.find(i => i.id === id)
      if (existing) return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id, hubId, sectionTitle, name, unitPrice: amount, unit, qty: 1 }]
    })
  }

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { removeItem(id); return }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }
  const clearCart = () => setCart([])

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + getEffectiveRate(i.id, i.qty, i.unitPrice) * i.qty, 0),
    [cart]
  )
  const totalSavings = useMemo(
    () => cart.reduce((sum, i) => sum + (i.unitPrice - getEffectiveRate(i.id, i.qty, i.unitPrice)) * i.qty, 0),
    [cart]
  )
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0)

  const sendQuote = () => {
    let msg = `Hi ${BIZ.name}! I'd like a quote for:\n\n`
    cart.forEach(item => {
      const effRate = getEffectiveRate(item.id, item.qty, item.unitPrice)
      const lineTotal = effRate * item.qty
      const qtyLabel = item.unit ? `${item.qty} ${item.unit}${item.qty > 1 ? "s" : ""}` : `x${item.qty}`
      msg += `• ${getDisplayName(item.sectionTitle, item.name)} — ${qtyLabel} @ R${effRate} = R${lineTotal}\n`
    })
    msg += `\nTotal: R${total}`
    if (totalSavings > 0) msg += ` (saved R${totalSavings} with bulk pricing)`
    window.open(waLink(msg), "_blank")
  }

  return (
    <>
      {/* ── Backdrop blur overlay ─────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── FAB trigger button ────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[9992]">
        {itemCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 z-10 min-w-[22px] h-[22px] px-1 rounded-full text-white text-[0.65rem] font-black flex items-center justify-center border-2 border-white dark:border-zinc-950" style={{ backgroundColor: GOLD }}>
            {itemCount}
          </span>
        )}
        <button
          onClick={() => setIsOpen(o => !o)}
          className="relative w-14 h-14 rounded-full bg-brand-blue text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform hover:-translate-y-0.5"
          aria-label="Open quotation calculator"
        >
          <Calculator size={26} weight="fill" />
        </button>
      </div>

      {/* ── Calculator panel ──────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[420px] max-h-[78vh] bg-white dark:bg-zinc-950 rounded-[16px] shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ borderColor: `${GOLD}33`, boxShadow: `0 0 40px ${GOLD}14, 0 25px 50px -12px rgba(0,0,0,0.4)` }}
        >
          {/* Gold accent line */}
          <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <h3 className="font-sans font-black text-xl" style={{ color: titleAccent }}>Quotation Calculator</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              aria-label="Close"
            >
              <X size={17} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">

            {/* ── Cart items ──────────────────────────────────────────── */}
            {cart.length > 0 && (
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Your Quote</span>
                  <button onClick={clearCart} className="text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors">Clear all</button>
                </div>
                {cart.map(item => {
                  const effRate = getEffectiveRate(item.id, item.qty, item.unitPrice)
                  const lineTotal = effRate * item.qty
                  const discounted = effRate < item.unitPrice
                  const hint = getBulkHint(item.id, item.qty, effRate, item.unitPrice)
                  const displayName = getDisplayName(item.sectionTitle, item.name)
                  const bulkMax = getBulkMax(item.id)
                  return (
                    <div key={item.id} className="p-3.5 rounded-[14px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 truncate">{displayName}</p>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500 shrink-0 transition-colors"><Trash size={15} weight="bold" /></button>
                      </div>

                      {/* Pricing row */}
                      <div className="flex items-baseline gap-4 font-mono">
                        <span className="text-xs text-zinc-400">
                          <span className="font-sans font-bold uppercase tracking-wider text-[0.6rem] mr-1 align-middle">Orig</span>
                          R{item.unitPrice}{item.unit ? `/${item.unit}` : ""}
                        </span>
                        <span className="text-sm font-bold" style={{ color: discounted ? GOLD : undefined }}>
                          <span className="font-sans font-bold uppercase tracking-wider text-[0.6rem] mr-1 align-middle" style={{ color: discounted ? GOLD : undefined }}>Rate</span>
                          R{effRate}{item.unit ? `/${item.unit}` : ""}
                        </span>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <Minus size={13} weight="bold" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={bulkMax ?? undefined}
                            value={item.qty}
                            onChange={e => {
                              const raw = parseInt(e.target.value) || 1
                              const capped = bulkMax ? Math.min(raw, bulkMax) : raw
                              updateQty(item.id, Math.max(1, capped))
                            }}
                            className="w-12 text-center text-sm font-mono font-black bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <Plus size={13} weight="bold" />
                          </button>
                        </div>
                        <span className="text-base font-mono font-black text-zinc-900 dark:text-zinc-50">R{lineTotal}</span>
                      </div>

                      {hint && (
                        <p className="text-xs font-bold pl-0.5" style={{ color: discounted ? GOLD : "#9CA3AF" }}>
                          {hint}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Add services ────────────────────────────────────────── */}
            <div className="p-4 space-y-2.5">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Add a Service</span>
              {HUB_ORDER.map(hubId => {
                const hub = HUBS[hubId]; const accent = getAccent(hubId); const isHubOpen = openHub === hubId
                return (
                  <div key={hubId} className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                    {/* Hub accordion trigger */}
                    <button
                      onClick={() => setOpenHub(isHubOpen ? null : hubId)}
                      className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}18`, color: accent }}>
                        <HubIcon id={hubId} size={18} />
                      </div>
                      <span className="flex-1 text-sm font-black text-zinc-800 dark:text-zinc-200">{hub.title}</span>
                      <CaretDown size={15} className={cn("transition-transform duration-300", isHubOpen ? "rotate-180" : "rotate-0")} style={{ color: isHubOpen ? accent : undefined }} />
                    </button>

                    {/* Hub content: sections as categories */}
                    {isHubOpen && (
                      <div className="border-t border-zinc-100 dark:border-zinc-800">
                        {hub.sections.map((section, sIdx) => (
                          <div key={sIdx} className={cn(sIdx > 0 && "border-t border-zinc-100 dark:border-zinc-800")}>
                            {/* Section header — styled like service modal category pill */}
                            <div
                              className="px-3.5 py-2 flex items-center gap-2"
                              style={{ backgroundColor: `${accent}0D` }}
                            >
                              <span
                                className="text-[0.65rem] font-black uppercase tracking-[0.18em]"
                                style={{ color: accent }}
                              >
                                {section.title}
                              </span>
                            </div>

                            {/* Items under this section */}
                            <div className="px-3 pb-3 pt-2 space-y-2">
                              {section.items.map((item, iIdx) => {
                                const itemId = `${hubId}-${section.title}-${item.name}`
                                const hasBulk = !!BULK_TIERS[itemId]
                                return (
                                  <div
                                    key={iIdx}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[10px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 truncate">{getDisplayName(section.title, item.name)}</p>
                                      <p className="text-xs font-medium text-zinc-400 font-mono mt-0.5">
                                        {item.price}
                                        {hasBulk && (
                                          <span className="font-sans font-semibold ml-1.5" style={{ color: GOLD }}>· bulk</span>
                                        )}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => addItem(hubId, section.title, item.name, item.price)}
                                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"
                                      style={{ backgroundColor: accent }}
                                      aria-label={`Add ${item.name}`}
                                    >
                                      <Plus size={15} weight="bold" />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Footer: total + CTA ─────────────────────────────────────── */}
          {cart.length > 0 && (
            <div className="px-4 pb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0 space-y-3">
              {totalSavings > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-bold font-mono" style={{ color: GOLD }}>
                  <SealPercent size={15} weight="fill" />
                  Saving R{totalSavings} with bulk pricing
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-zinc-500">Total</span>
                <span className="text-3xl font-mono font-black text-brand-blue dark:text-brand-light-blue">R{total}</span>
              </div>
              <button
                onClick={sendQuote}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-black text-base text-white active:scale-95 transition-all shadow-md"
                style={{ backgroundColor: "#25D366" }}
              >
                <WhatsappLogo size={22} weight="fill" /> Send Quote via WhatsApp
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
