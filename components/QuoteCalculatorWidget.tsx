"use client"

import { useState, useMemo } from "react"
import { Calculator, X, Plus, Minus, Trash, WhatsappLogo, CaretDown, SealPercent, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, waLink } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

// Signature accent for this widget only — an antique gold standing in for
// "exclusive pricing", deliberately separate from the site's brand-blue/orange
// so the calculator reads as its own premium instrument, not another card.
const GOLD = "#C9A227"

// ─── BULK PRICING TIERS (from the in-store price flyer) ──────────────────────
const BULK_TIERS: Record<string, { min: number; rate: number }[]> = {
  "print-Copying-Black & White":        [{ min: 10, rate: 2 }, { min: 100, rate: 1 }],
  "print-Copying-Colour":               [{ min: 10, rate: 4 }, { min: 50,  rate: 3 }],
  "print-Printing-Black & White":       [{ min: 10, rate: 4 }, { min: 100, rate: 3 }],
  "print-Printing-Colour":              [{ min: 10, rate: 7 }, { min: 50,  rate: 5 }],
  "doc-Typing + Printing-Black & White":[{ min: 10, rate: 10 }],
  "doc-Typing + Printing-Colour":       [{ min: 10, rate: 11 }],
}

// Disambiguates items that share a name across sections ("Black & White" /
// "Colour" exist in Printing, Copying, and Typing) into a readable label —
// "Black & White Print", "Colour Copy", "Black & White Typing".
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

export function QuoteCalculatorWidget() {
  const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === "dark"
  const [isOpen, setIsOpen] = useState(false)
  const [openHub, setOpenHub] = useState<HubId | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

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
      <div className="fixed bottom-6 right-6 z-[9990]">
        {itemCount > 0 && (
          <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: "rgba(201,162,39,0.4)" }} aria-hidden="true" />
        )}
        <button
          onClick={() => setIsOpen(o => !o)}
          className="relative w-14 h-14 rounded-full bg-brand-blue text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform hover:-translate-y-0.5"
          aria-label="Open quotation calculator"
        >
          <Calculator size={26} weight="fill" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full text-white text-[0.65rem] font-black flex items-center justify-center border-2 border-white dark:border-zinc-950" style={{ backgroundColor: GOLD }}>
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] bg-white dark:bg-zinc-950 rounded-[14px] shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300" style={{ borderColor: `${GOLD}33`, boxShadow: `0 0 40px ${GOLD}14, 0 25px 50px -12px rgba(0,0,0,0.4)` }}>
          <div className="h-[2px] w-full shrink-0" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>Exclusive Pricing</p>
              <h3 className="font-sans font-black text-lg" style={{ color: titleAccent }}>Quotation Calculator</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-200"><X size={16} weight="bold" /></button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {cart.length > 0 && (
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400">Your Quote</span>
                  <button onClick={clearCart} className="text-[0.65rem] font-bold text-zinc-400 hover:text-red-500">Clear all</button>
                </div>
                {cart.map(item => {
                  const effRate = getEffectiveRate(item.id, item.qty, item.unitPrice)
                  const lineTotal = effRate * item.qty
                  const discounted = effRate < item.unitPrice
                  const hint = getBulkHint(item.id, item.qty, effRate, item.unitPrice)
                  const displayName = getDisplayName(item.sectionTitle, item.name)
                  return (
                    <div key={item.id} className="p-3 rounded-[14px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{displayName}</p>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500 shrink-0"><Trash size={14} weight="bold" /></button>
                      </div>

                      <div className="flex items-baseline gap-4 font-mono">
                        <span className="text-[0.65rem] text-zinc-400">
                          <span className="font-sans font-bold uppercase tracking-wider text-[0.55rem] mr-1 align-middle">Orig</span>
                          R{item.unitPrice}{item.unit ? `/${item.unit}` : ""}
                        </span>
                        <span className="text-[0.7rem] font-bold" style={{ color: discounted ? GOLD : undefined }}>
                          <span className="font-sans font-bold uppercase tracking-wider text-[0.55rem] mr-1 align-middle" style={{ color: discounted ? GOLD : undefined }}>Live</span>
                          R{effRate}{item.unit ? `/${item.unit}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center"><Minus size={12} weight="bold" /></button>
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={e => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 text-center text-xs font-mono font-black bg-transparent border-none outline-none"
                          />
                          <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center"><Plus size={12} weight="bold" /></button>
                        </div>
                        <span className="text-sm font-mono font-black text-zinc-900 dark:text-zinc-50">R{lineTotal}</span>
                      </div>

                      {hint && (
                        <p className="text-[0.6rem] font-bold pl-0.5" style={{ color: discounted ? GOLD : "#9CA3AF" }}>
                          {hint}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="p-4 space-y-2">
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 px-1">Add a Service</span>
              {HUB_ORDER.map(hubId => {
                const hub = HUBS[hubId]; const accent = getAccent(hubId); const isHubOpen = openHub === hubId
                return (
                  <div key={hubId} className="rounded-[14px] border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                    <button onClick={() => setOpenHub(isHubOpen ? null : hubId)} className="w-full flex items-center gap-3 p-3 text-left">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15`, color: accent }}><HubIcon id={hubId} /></div>
                      <span className="flex-1 text-xs font-black text-zinc-800 dark:text-zinc-200">{hub.title}</span>
                      <CaretDown size={14} className={cn("transition-transform duration-300", isHubOpen ? "rotate-180" : "rotate-0")} style={{ color: isHubOpen ? accent : undefined }} />
                    </button>
                    {isHubOpen && (
                      <div className="px-3 pb-3 space-y-3">
                        {hub.sections.map((section, sIdx) => (
                          <div key={sIdx}>
                            <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">{section.title}</p>
                            <div className="space-y-1.5">
                              {section.items.map((item, iIdx) => {
                                const itemId = `${hubId}-${section.title}-${item.name}`
                                const hasBulk = !!BULK_TIERS[itemId]
                                return (
                                  <div key={iIdx} className="flex items-center justify-between gap-2 p-2 rounded-[10px] bg-zinc-50 dark:bg-zinc-900">
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{getDisplayName(section.title, item.name)}</p>
                                      <p className="text-[0.65rem] font-medium text-zinc-400 font-mono">
                                        {item.price}
                                        {hasBulk && <span className="font-sans font-bold ml-1" style={{ color: GOLD }}>· bulk pricing</span>}
                                      </p>
                                    </div>
                                    <button onClick={() => addItem(hubId, section.title, item.name, item.price)} className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: accent }}><Plus size={14} weight="bold" /></button>
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

          {cart.length > 0 && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0 space-y-3">
              {totalSavings > 0 && (
                <div className="flex items-center gap-1.5 text-[0.7rem] font-bold font-mono" style={{ color: GOLD }}>
                  <SealPercent size={14} weight="fill" />
                  Saving R{totalSavings} with bulk pricing
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-zinc-500">Total</span>
                <span className="text-2xl font-mono font-black text-brand-blue dark:text-brand-light-blue">R{total}</span>
              </div>
              <button onClick={sendQuote} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-black text-sm text-white active:scale-95 transition-all" style={{ backgroundColor: "#25D366" }}>
                <WhatsappLogo size={20} weight="fill" /> Send Quote via WhatsApp
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
