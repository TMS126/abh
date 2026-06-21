"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Calculator, X, Plus, Minus, Trash, WhatsappLogo, CaretDown, SealPercent, Printer, FileText, PaintBrush, Globe, Desktop } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, waLink } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

// ─── BULK PRICING TIERS ───────────────────────────────────────────────────────
const BULK_TIERS: Record<string, { min: number; rate: number }[]> = {
  "print-Copying-Black & White":        [{ min: 10, rate: 2 }, { min: 100, rate: 1 }],
  "print-Copying-Colour":               [{ min: 10, rate: 4 }, { min: 50,  rate: 3 }],
  "print-Printing-Black & White":       [{ min: 10, rate: 4 }, { min: 100, rate: 3 }],
  "print-Printing-Colour":              [{ min: 10, rate: 7 }, { min: 50,  rate: 5 }],
  "doc-Typing + Printing-Black & White":[{ min: 10, rate: 10 }],
  "doc-Typing + Printing-Colour":       [{ min: 10, rate: 11 }],
}

const SECTION_LABEL: Record<string, string> = {
  "Printing": "Print", "Copying": "Copy", "Typing + Printing": "Typing",
}
function getDisplayName(sectionTitle: string, name: string): string {
  if ((name === "Black & White" || name === "Colour") && SECTION_LABEL[sectionTitle])
    return `${name} ${SECTION_LABEL[sectionTitle]}`
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
  id: string; hubId: HubId; sectionTitle: string; name: string
  unitPrice: number; unit: string | null; qty: number
}

const STORAGE_KEY = "apexbytes-quote-cart"

// ─── Liquid glass style helpers ────────────────────────────────────────────────
// All visual depth is achieved via CSS properties — no canvas, no filters on
// scroll containers, no blur inside lists. A single backdrop-filter on the
// panel shell is the only GPU layer.
const GLASS = {
  panel: "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10",
  section: "bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10",
  item: "bg-white/80 dark:bg-white/[0.06] border border-white/70 dark:border-white/[0.08]",
  pill: "bg-zinc-100/80 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
  btn: "bg-zinc-100/70 dark:bg-white/[0.07] border border-white/60 dark:border-white/10",
} as const

export function QuoteCalculatorWidget() {
  const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === "dark"
  const [isOpen, setIsOpen]     = useExclusiveWidget("calculator")
  const [openHub, setOpenHub]   = useState<HubId | null>(null)
  const [openSections, setOpenSections] = useState<Record<HubId, number | null>>({} as Record<HubId, number | null>)
  const [cart, setCart]         = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const isScrolling             = useRef(false)
  const scrollTimer             = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Persist cart
  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setCart(JSON.parse(s)) } catch {}
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch {}
  }, [cart, hydrated])

  // Fade FAB while scrolling
  useEffect(() => {
    const onScroll = () => {
      setScrolled(true)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => setScrolled(false), 200)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); if (scrollTimer.current) clearTimeout(scrollTimer.current) }
  }, [])

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const getAccent     = (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.tagTextDark : c.tagText }
  const getSolid      = (id: HubId) => HUB_COLORS[id as HubKey].tagText
  const titleAccent   = isDark ? HUB_COLORS.design.tagTextDark : HUB_COLORS.design.tagText

  const addItem = (hubId: HubId, sectionTitle: string, name: string, price: string) => {
    const { amount, unit } = parsePrice(price)
    const id = `${hubId}-${sectionTitle}-${name}`
    setCart(prev => {
      const ex = prev.find(i => i.id === id)
      if (ex) return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id, hubId, sectionTitle, name, unitPrice: amount, unit, qty: 1 }]
    })
  }

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id))
  const updateQty  = (id: string, qty: number) => {
    if (qty < 1) { removeItem(id); return }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }
  const setQtyDraft = (id: string, raw: string) => {
    if (raw === "") { setCart(prev => prev.map(i => i.id === id ? { ...i, qty: 0 } : i)); return }
    const n = parseInt(raw, 10)
    if (!isNaN(n) && n >= 0) setCart(prev => prev.map(i => i.id === id ? { ...i, qty: n } : i))
  }
  const handleQtyBlur = (id: string, qty: number) => {
    if (qty < 1) setCart(prev => prev.map(i => i.id === id ? { ...i, qty: 1 } : i))
  }
  const clearCart = () => setCart([])

  const itemCount    = cart.reduce((s, i) => s + (i.qty || 1), 0)
  const total        = useMemo(() => cart.reduce((s, i) => s + getEffectiveRate(i.id, i.qty || 1, i.unitPrice) * (i.qty || 1), 0), [cart])
  const totalSavings = useMemo(() => cart.reduce((s, i) => s + (i.unitPrice - getEffectiveRate(i.id, i.qty || 1, i.unitPrice)) * (i.qty || 1), 0), [cart])

  const sendQuote = () => {
    let msg = `Hi ${BIZ.name}! I'd like a quote for:\n\n`
    cart.forEach(item => {
      const qty = item.qty || 1
      const effRate = getEffectiveRate(item.id, qty, item.unitPrice)
      const qtyLabel = item.unit ? `${qty} ${item.unit}${qty > 1 ? "s" : ""}` : `x${qty}`
      msg += `• ${getDisplayName(item.sectionTitle, item.name)} — ${qtyLabel} @ R${effRate} = R${effRate * qty}\n`
    })
    msg += `\nTotal: R${total}`
    if (totalSavings > 0) msg += ` (saved R${totalSavings} with bulk pricing)`
    window.open(waLink(msg), "_blank")
  }

  const toggleSection = (hubId: HubId, sIdx: number) => {
    setOpenSections(prev => ({ ...prev, [hubId]: prev[hubId] === sIdx ? null : sIdx }))
  }

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-[9992] w-14 h-14 rounded-full bg-brand-blue text-white shadow-xl flex items-center justify-center active:scale-95 transition-all duration-300 hover:-translate-y-0.5",
          scrolled && !isOpen
            ? "opacity-0 pointer-events-none"
            : isOpen
              ? "opacity-100"
              : "opacity-60 hover:opacity-100"
        )}
        aria-label={isOpen ? "Close quotation calculator" : "Open quotation calculator"}
      >
        {isOpen ? <X size={22} weight="bold" /> : <Calculator size={26} weight="fill" />}
        {!isOpen && itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-brand-orange text-white text-[0.65rem] font-black flex items-center justify-center border-2 border-white dark:border-zinc-950">
            {itemCount}
          </span>
        )}
      </button>

      {/* ── Calculator panel ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300",
            GLASS.panel
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)" }}
        >
          {/* Specular highlight strip */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-white/20 dark:border-white/10"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)" }}
          >
            <h3 className="font-sans font-black text-lg" style={{ color: titleAccent }}>Quotation Calculator</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors", GLASS.btn)}
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">

            {/* ── Cart ───────────────────────────────────────────────── */}
            {cart.length > 0 && (
              <div className="p-4 border-b border-white/20 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400">Your Quote</span>
                  <button onClick={clearCart} className="text-[0.65rem] font-bold text-zinc-400 hover:text-red-500 transition-colors">Clear all</button>
                </div>
                {cart.map(item => {
                  const qty = item.qty || 1
                  const effRate = getEffectiveRate(item.id, qty, item.unitPrice)
                  const lineTotal = effRate * qty
                  const discounted = effRate < item.unitPrice
                  const hint = getBulkHint(item.id, qty, effRate, item.unitPrice)
                  const displayName = getDisplayName(item.sectionTitle, item.name)
                  const accent = getAccent(item.hubId)
                  return (
                    <div key={item.id} className={cn("p-3 rounded-[14px] shadow-sm space-y-2", GLASS.item)}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{displayName}</p>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500 shrink-0 transition-colors"><Trash size={14} weight="bold" /></button>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {discounted && <span className="text-red-400 line-through">R{item.unitPrice}{item.unit ? `/${item.unit}` : ""}</span>}
                        <span className="font-bold text-zinc-700 dark:text-zinc-200" style={{ color: discounted ? accent : undefined }}>R{effRate}{item.unit ? `/${item.unit}` : ""}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(item.id, qty - 1)} className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors", GLASS.btn)}><Minus size={12} weight="bold" /></button>
                          <input
                            type="number" min={1}
                            value={item.qty === 0 ? "" : item.qty}
                            onChange={e => setQtyDraft(item.id, e.target.value)}
                            onBlur={() => handleQtyBlur(item.id, item.qty)}
                            placeholder="1"
                            className="w-10 text-center text-xs font-black bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100"
                          />
                          <button onClick={() => updateQty(item.id, qty + 1)} className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors", GLASS.btn)}><Plus size={12} weight="bold" /></button>
                        </div>
                        <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">R{lineTotal}</span>
                      </div>
                      {hint && (
                        <p className={cn("text-[0.6rem] font-bold", discounted ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")}>{hint}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Add Services ───────────────────────────────────────── */}
            <div className="p-4 space-y-2">
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 px-1">Add a Service</span>
              {HUB_ORDER.map(hubId => {
                const hub = HUBS[hubId]
                const accent = getAccent(hubId)
                const solidAccent = getSolid(hubId)
                const isHubOpen = openHub === hubId

                return (
                  <div key={hubId} className={cn("rounded-[14px] overflow-hidden", GLASS.section)}>
                    {/* Hub header */}
                    <button
                      onClick={() => setOpenHub(isHubOpen ? null : hubId)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accent}20`, color: accent }}
                      >
                        <HubIcon id={hubId} />
                      </div>
                      <span className="flex-1 text-xs font-black text-zinc-800 dark:text-zinc-200">{hub.title}</span>
                      <CaretDown
                        size={14}
                        className={cn("transition-transform duration-300", isHubOpen ? "rotate-180" : "rotate-0")}
                        style={{ color: isHubOpen ? accent : undefined }}
                      />
                    </button>

                    {/* Hub body: category accordions */}
                    {isHubOpen && (
                      <div className="border-t border-white/20 dark:border-white/10">
                        {hub.sections.map((section, sIdx) => {
                          const isSectionOpen = openSections[hubId] === sIdx

                          return (
                            <div
                              key={sIdx}
                              className={cn(sIdx > 0 && "border-t border-white/15 dark:border-white/[0.07]")}
                            >
                              {/* Category pill — accordion trigger */}
                              <button
                                onClick={() => toggleSection(hubId, sIdx)}
                                className="w-full flex items-center justify-between px-3 py-2 transition-colors hover:bg-white/20 dark:hover:bg-white/5"
                              >
                                <span
                                  className="text-[0.65rem] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full"
                                  style={
                                    isSectionOpen
                                      ? { backgroundColor: solidAccent, color: "#fff" }
                                      : { backgroundColor: `${accent}18`, color: accent }
                                  }
                                >
                                  {section.title}
                                </span>
                                <CaretDown
                                  size={12}
                                  className={cn("mr-1 transition-transform duration-200", isSectionOpen ? "rotate-180" : "rotate-0")}
                                  style={{ color: accent }}
                                />
                              </button>

                              {/* Items */}
                              {isSectionOpen && (
                                <div className="px-3 pb-3 pt-1 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                  {section.items.map((item, iIdx) => {
                                    const itemId = `${hubId}-${section.title}-${item.name}`
                                    const hasBulk = !!BULK_TIERS[itemId]
                                    return (
                                      <div
                                        key={iIdx}
                                        className={cn("flex items-center justify-between gap-2 p-2 rounded-[10px] shadow-sm", GLASS.item)}
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
                                          onClick={() => addItem(hubId, section.title, item.name, item.price)}
                                          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm active:scale-90 transition-transform"
                                          style={{ backgroundColor: solidAccent }}
                                          aria-label={`Add ${item.name}`}
                                        >
                                          <Plus size={13} weight="bold" />
                                        </button>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────────────────── */}
          {cart.length > 0 && (
            <div
              className="px-4 pb-4 pt-3 shrink-0 border-t border-white/20 dark:border-white/10 space-y-3"
              style={{ background: "linear-gradient(to top, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%)" }}
            >
              {totalSavings > 0 && (
                <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-emerald-600 dark:text-emerald-400">
                  <SealPercent size={14} weight="fill" />
                  Saving R{totalSavings} with bulk pricing
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-zinc-500">Total</span>
                <span className="text-2xl font-black text-brand-blue dark:text-brand-light-blue">R{total}</span>
              </div>
              <button
                onClick={sendQuote}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-black text-sm text-white active:scale-95 transition-all shadow-lg"
                style={{ backgroundColor: "#25D366" }}
              >
                <WhatsappLogo size={20} weight="fill" /> Send Quote via WhatsApp
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
 
