"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Calculator, X, Plus, Minus, Trash, WhatsappLogo, CaretDown, SealPercent, Printer, FileText, PaintBrush, Globe, Desktop, ArrowCounterClockwise, FloppyDisk, FilePdf, BookmarkSimple } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, BRAND, waLink } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

const HUB_ORDER: HubId[] = ["print", "doc", "design", "eservice", "tech"]

const HOME_BLUE = { light: BRAND.blue, dark: BRAND.lightBlue }

// Picks white or near-black based on actual WCAG relative luminance of the
// given background hex, rather than assuming "white always works." In
// dark mode fabColor resolves to BRAND.lightBlue (#A9D6F2) — a pale blue
// that white icons/text fail against, which is exactly the bug this
// fixes. Same helper already used in Navbar / AboutPage / Search widget.
function getReadableTextColor(hex: string): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const contrastWhite = 1.05 / (luminance + 0.05)
  const contrastDark  = (luminance + 0.05) / 0.062
  return contrastWhite >= contrastDark ? "#ffffff" : "#18181b"
}

// ─── BULK PRICING TIERS ───────────────────────────────────────────────────────
const BULK_TIERS: Record<string, { min: number; rate: number }[]> = {
  "print-Copying-Black & White":        [{ min: 10, rate: 2 }, { min: 100, rate: 1 }],
  "print-Copying-Colour":               [{ min: 10, rate: 4 }, { min: 50,  rate: 3 }],
  "print-Printing-Black & White":       [{ min: 10, rate: 4 }, { min: 100, rate: 3 }],
  "print-Printing-Colour":              [{ min: 10, rate: 7 }, { min: 50,  rate: 5 }],
  "doc-Typing + Printing-Black & White":[{ min: 10, rate: 10 }],
  "doc-Typing + Printing-Colour":       [{ min: 10, rate: 11 }],
}

const SCAN_BULK_MIN  = 5
const SCAN_BULK_RATE = 4
function isScanItem(name: string) {
  return /scan/i.test(name)
}

const SECTION_LABEL: Record<string, string> = {
  "Printing": "Print", "Copying": "Copy", "Typing + Printing": "Typing",
}
function getDisplayName(sectionTitle: string, name: string): string {
  if ((name === "Black & White" || name === "Colour") && SECTION_LABEL[sectionTitle])
    return `${name} ${SECTION_LABEL[sectionTitle]}`
  return name
}

function getEffectiveRate(id: string, name: string, qty: number, fallback: number): number {
  const tiers = BULK_TIERS[id]
  if (tiers) {
    let rate = fallback
    for (const t of tiers) { if (qty >= t.min) rate = t.rate }
    return rate
  }
  if (isScanItem(name) && qty >= SCAN_BULK_MIN) return Math.min(fallback, SCAN_BULK_RATE)
  return fallback
}

function getNextTier(id: string, name: string, qty: number) {
  const tiers = BULK_TIERS[id]
  if (tiers) return tiers.find(t => qty < t.min) ?? null
  if (isScanItem(name) && qty < SCAN_BULK_MIN) return { min: SCAN_BULK_MIN, rate: SCAN_BULK_RATE }
  return null
}

function getBulkHint(id: string, name: string, qty: number, effRate: number, baseRate: number): string | null {
  const next = getNextTier(id, name, qty)
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

interface SavedQuote {
  id: string; name: string; savedAt: number; items: CartItem[]
}

const STORAGE_KEY        = "apexbytes-quote-cart"
const STORAGE_KEY_SAVED  = "apexbytes-saved-quotes"

const GLASS = {
  panel: "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10",
  section: "bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10",
  item: "bg-white/80 dark:bg-white/[0.06] border border-white/70 dark:border-white/[0.08]",
  pill: "bg-zinc-100/80 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
  btn: "bg-zinc-100/70 dark:bg-white/[0.07] border border-white/60 dark:border-white/10",
} as const

function quoteTotals(items: CartItem[]) {
  const total = items.reduce((s, i) => s + getEffectiveRate(i.id, i.name, i.qty || 1, i.unitPrice) * (i.qty || 1), 0)
  const savings = items.reduce((s, i) => s + (i.unitPrice - getEffectiveRate(i.id, i.name, i.qty || 1, i.unitPrice)) * (i.qty || 1), 0)
  const count = items.reduce((s, i) => s + (i.qty || 1), 0)
  return { total, savings, count }
}

export function QuoteCalculatorWidget() {
  const { resolvedTheme } = useTheme(); const isDark = resolvedTheme === "dark"
  const [isOpen, setIsOpen, isOtherOpen] = useExclusiveWidget("calculator")
  const [openHub, setOpenHub]   = useState<HubId | null>(null)
  const [openSections, setOpenSections] = useState<Record<HubId, number | null>>({} as Record<HubId, number | null>)
  const [cart, setCart]         = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const scrollTimer             = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [scrolled, setScrolled] = useState(false)

  const [highlightId, setHighlightId] = useState<string | null>(null)
  const qtyInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [announce, setAnnounce] = useState("")

  const [undoStack, setUndoStack] = useState<{ item: CartItem; index: number } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [savedHydrated, setSavedHydrated] = useState(false)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveNameDraft, setSaveNameDraft] = useState("")
  const [showSavedList, setShowSavedList] = useState(false)

  const pressState = useRef<Record<string, { timeout?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval>; longPressed?: boolean }>>({})

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setCart(JSON.parse(s)) } catch {}
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)) } catch {}
  }, [cart, hydrated])

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY_SAVED); if (s) setSavedQuotes(JSON.parse(s)) } catch {}
    setSavedHydrated(true)
  }, [])
  useEffect(() => {
    if (!savedHydrated) return
    try { localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedQuotes)) } catch {}
  }, [savedQuotes, savedHydrated])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(true)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => setScrolled(false), 200)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); if (scrollTimer.current) clearTimeout(scrollTimer.current) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: Event) => {
      const { hubId, sectionTitle, name, price } = (e as CustomEvent).detail
      addItem(hubId, sectionTitle, name, price)
      setIsOpen(true)
    }
    window.addEventListener("abh:add-to-quote", handler)
    return () => window.removeEventListener("abh:add-to-quote", handler)
  }, [])

  useEffect(() => {
    if (!highlightId) return
    const id = highlightId
    let raf1: number, raf2: number
    const tryFocus = () => {
      const el = qtyInputRefs.current[id]
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        el.focus()
        el.select()
      } else {
        raf2 = requestAnimationFrame(tryFocus)
      }
    }
    raf1 = requestAnimationFrame(tryFocus)
    const clearT = setTimeout(() => setHighlightId(null), 900)
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); clearTimeout(clearT) }
  }, [highlightId])

  useEffect(() => {
    return () => {
      Object.values(pressState.current).forEach(s => {
        if (s.timeout) clearTimeout(s.timeout)
        if (s.interval) clearInterval(s.interval)
      })
    }
  }, [])

  const getAccent     = (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.tagTextDark : c.tagText }
  const getSolid      = (id: HubId) => HUB_COLORS[id as HubKey].tagText
  const titleAccent   = isDark ? HUB_COLORS.design.tagTextDark : HUB_COLORS.design.tagText
  const fabColor      = isDark ? HOME_BLUE.dark : HOME_BLUE.light
  // Icon/text color for anything sitting ON TOP of fabColor — computed
  // from its real luminance instead of assumed white, so it stays legible
  // even though fabColor swaps to a pale light-blue in dark mode.
  const fabTextColor  = useMemo(() => getReadableTextColor(fabColor), [fabColor])

  const addItem = (hubId: HubId, sectionTitle: string, name: string, price: string) => {
    const { amount, unit } = parsePrice(price)
    const id = `${hubId}-${sectionTitle}-${name}`
    let nextQty = 1
    setCart(prev => {
      const ex = prev.find(i => i.id === id)
      if (ex) { nextQty = ex.qty + 1; return prev.map(i => i.id === id ? { ...i, qty: nextQty } : i) }
      return [...prev, { id, hubId, sectionTitle, name, unitPrice: amount, unit, qty: 1 }]
    })
    setHighlightId(id)
    setAnnounce(`${getDisplayName(sectionTitle, name)} added — now ${nextQty} in your quote`)
  }

  const removeItem = (id: string) => {
    setCart(prev => {
      const index = prev.findIndex(i => i.id === id)
      if (index === -1) return prev
      const item = prev[index]
      setUndoStack({ item, index })
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => setUndoStack(null), 6000)
      return prev.filter(i => i.id !== id)
    })
  }

  const undoRemove = () => {
    if (!undoStack) return
    setCart(prev => {
      const next = [...prev]
      next.splice(Math.min(undoStack.index, next.length), 0, undoStack.item)
      return next
    })
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setUndoStack(null)
  }

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

  const stepQty = (id: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      if (!item) return prev
      const newQty = (item.qty || 1) + delta
      if (newQty < 1) {
        const index = prev.findIndex(i => i.id === id)
        setUndoStack({ item, index })
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
        undoTimerRef.current = setTimeout(() => setUndoStack(null), 6000)
        return prev.filter(i => i.id !== id)
      }
      return prev.map(i => i.id === id ? { ...i, qty: newQty } : i)
    })
  }

  const HOLD_DELAY = 420
  const REPEAT_MS  = 90
  const clearPress = (id: string) => {
    const s = pressState.current[id]
    if (s?.timeout) clearTimeout(s.timeout)
    if (s?.interval) clearInterval(s.interval)
    if (s) { s.timeout = undefined; s.interval = undefined }
  }
  const handlePressStart = (id: string, delta: number) => {
    clearPress(id)
    pressState.current[id] = { longPressed: false }
    pressState.current[id].timeout = setTimeout(() => {
      pressState.current[id].longPressed = true
      stepQty(id, delta)
      pressState.current[id].interval = setInterval(() => stepQty(id, delta), REPEAT_MS)
    }, HOLD_DELAY)
  }
  const handlePressEnd = (id: string) => clearPress(id)
  const handleClickStep = (id: string, delta: number) => {
    const s = pressState.current[id]
    if (s?.longPressed) { s.longPressed = false; return }
    stepQty(id, delta)
  }

  const clearCart = () => setCart([])

  const { total, savings: totalSavings, count: itemCount } = useMemo(() => quoteTotals(cart), [cart])

  const hubSubtotal = (hubId: HubId) => {
    const items = cart.filter(i => i.hubId === hubId)
    if (items.length === 0) return null
    return quoteTotals(items)
  }

  const buildQuoteMessage = (items: CartItem[]) => {
    const t = quoteTotals(items)
    let msg = `Hi ${BIZ.name}! I'd like a quote for:\n\n`
    items.forEach(item => {
      const qty = item.qty || 1
      const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
      const qtyLabel = item.unit ? `${qty} ${item.unit}${qty > 1 ? "s" : ""}` : `x${qty}`
      msg += `• ${getDisplayName(item.sectionTitle, item.name)} — ${qtyLabel} @ R${effRate} = R${effRate * qty}\n`
    })
    msg += `\nTotal: R${t.total}`
    if (t.savings > 0) msg += ` (saved R${t.savings} with bulk pricing)`
    return msg
  }

  const sendQuote = () => window.open(waLink(buildQuoteMessage(cart)), "_blank")

  const toggleSection = (hubId: HubId, sIdx: number) => {
    setOpenSections(prev => ({ ...prev, [hubId]: prev[hubId] === sIdx ? null : sIdx }))
  }

  const confirmSaveQuote = () => {
    if (cart.length === 0) return
    const name = saveNameDraft.trim() || `Quote — ${new Date().toLocaleDateString()}`
    setSavedQuotes(prev => [{ id: `q-${Date.now()}`, name, savedAt: Date.now(), items: cart }, ...prev])
    setSaveNameDraft("")
    setShowSaveForm(false)
  }
  const loadSavedQuote = (q: SavedQuote) => {
    setCart(q.items)
    setShowSavedList(false)
  }
  const deleteSavedQuote = (id: string) => setSavedQuotes(prev => prev.filter(q => q.id !== id))

  const exportQuotePdf = () => {
    if (cart.length === 0) return
    const t = quoteTotals(cart)
    const rows = cart.map(item => {
      const qty = item.qty || 1
      const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
      const displayName = getDisplayName(item.sectionTitle, item.name)
      const qtyLabel = item.unit ? `${qty} ${item.unit}${qty > 1 ? "s" : ""}` : `x${qty}`
      return `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;">${displayName}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;">${qtyLabel}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;">R${effRate}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;">R${effRate * qty}</td>
      </tr>`
    }).join("")

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
      <title>${BIZ.name} — Quote</title>
      <style>
        body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#18181b;padding:32px;max-width:640px;margin:0 auto;}
        h1{font-size:20px;margin:0 0 4px;}
        p.sub{color:#71717a;font-size:13px;margin:0 0 24px;}
        table{width:100%;border-collapse:collapse;font-size:13px;}
        th{text-align:left;padding:8px 10px;border-bottom:2px solid #18181b;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;}
        tfoot td{padding:12px 10px;font-weight:800;font-size:15px;border-top:2px solid #18181b;}
        .savings{color:#059669;font-size:12px;margin-top:6px;}
        .footer{margin-top:32px;font-size:11px;color:#a1a1aa;}
      </style></head><body>
      <h1>${BIZ.name} — Quotation</h1>
      <p class="sub">Generated ${new Date().toLocaleString()} · ${BIZ.location}</p>
      <table>
        <thead><tr><th>Service</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Line Total</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="3">Total</td><td style="text-align:right;">R${t.total}</td></tr></tfoot>
      </table>
      ${t.savings > 0 ? `<p class="savings">Includes R${t.savings} saved with bulk pricing.</p>` : ""}
      <p class="footer">${BIZ.phone} · ${BIZ.email} · This quote is an estimate and may change on confirmation.</p>
      <script>window.onload = () => window.print()<\/script>
      </body></html>`

    const win = window.open("", "_blank")
    if (win) { win.document.write(html); win.document.close() }
  }

  const fabVisible = !(scrolled && !isOpen) && !isOtherOpen
  const showMiniBar = cart.length > 0 && !isOpen && fabVisible

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">{announce}</span>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/30 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── FAB + attached mini-bar ────────────────────────────────────── */}
      <div
        className={cn(
          "fixed z-[9992] right-4 bottom-[5.5rem] flex flex-col items-end gap-2 group/calc",
          "transition-all duration-200 ease-out motion-reduce:transition-none transform-gpu",
          fabVisible
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 pointer-events-none scale-90"
        )}
      >
        {/* Mini-total pill — attached directly above the FAB. Badge circle
            now uses fabTextColor instead of hardcoded white, so it stays
            readable against the pale light-blue fabColor in dark mode. */}
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full shadow-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 active:scale-95 transition-all duration-200 ease-out origin-bottom-right motion-reduce:transition-none transform-gpu",
            showMiniBar ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-1 pointer-events-none"
          )}
        >
          <span
            className="min-w-[18px] h-[18px] px-1 rounded-full text-[0.6rem] font-black flex items-center justify-center"
            style={{ backgroundColor: fabColor, color: fabTextColor }}
          >
            {itemCount}
          </span>
          <span className="text-xs font-black text-zinc-700 dark:text-zinc-200">R{total}</span>
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400">View quote</span>
        </button>

        <div className="flex items-center justify-end gap-2">
          <span
            className={cn(
              "text-[0.65rem] font-black uppercase tracking-widest whitespace-nowrap pointer-events-none",
              "bg-white dark:bg-zinc-900",
              "px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800",
              "transition-all duration-200 ease-out origin-right motion-reduce:transition-none transform-gpu",
              isOpen
                ? "opacity-0 scale-x-0"
                : "opacity-0 scale-x-0 group-hover/calc:opacity-100 group-hover/calc:scale-x-100"
            )}
            style={{ color: fabColor }}
          >
            Quote
          </span>

          {/* FAB — icon color now computed from fabColor's luminance
              instead of hardcoded text-white, fixing the white-on-pale-
              blue contrast failure in dark mode. */}
          <button
            onClick={() => setIsOpen(o => !o)}
            className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-transform duration-150 ease-out motion-reduce:transition-none transform-gpu"
            style={{ backgroundColor: fabColor, color: fabTextColor }}
            aria-label={isOpen ? "Close quotation calculator" : "Open quotation calculator"}
          >
            {isOpen ? <X size={22} weight="bold" /> : <Calculator size={26} weight="fill" />}
            {!isOpen && itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-brand-orange text-white text-[0.65rem] font-black flex items-center justify-center border-2 border-white dark:border-zinc-950">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Calculator panel ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200 ease-out motion-reduce:animate-none transform-gpu",
            GLASS.panel
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)" }}
        >
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

          <div
            className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-white/20 dark:border-white/10"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)" }}
          >
            <h3 className="font-sans font-black text-lg" style={{ color: titleAccent }}>Quotation Calculator</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150", GLASS.btn)}
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">

            {undoStack && (
              <div className="mx-4 mt-4 flex items-center justify-between gap-3 p-3 rounded-[12px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="text-xs font-bold truncate">{getDisplayName(undoStack.item.sectionTitle, undoStack.item.name)} removed</span>
                <button
                  onClick={undoRemove}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 dark:bg-black/10 hover:bg-white/25 dark:hover:bg-black/20 transition-colors"
                >
                  <ArrowCounterClockwise size={13} weight="bold" /> Undo
                </button>
              </div>
            )}

            {cart.length > 0 && (
              <div className="p-4 border-b border-white/20 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400">
                    Your Quote · {itemCount} item{itemCount === 1 ? "" : "s"}
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setShowSaveForm(v => !v)}
                      className="flex items-center gap-1 text-[0.65rem] font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      <FloppyDisk size={13} weight="bold" /> Save
                    </button>
                    <button onClick={clearCart} className="text-[0.65rem] font-bold text-zinc-400 hover:text-red-500 transition-colors duration-150">Clear all</button>
                  </div>
                </div>

                {showSaveForm && (
                  <div className="flex items-center gap-2 p-2 rounded-[12px] bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 animate-in fade-in slide-in-from-top-1 duration-150">
                    <input
                      autoFocus
                      value={saveNameDraft}
                      onChange={e => setSaveNameDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") confirmSaveQuote() }}
                      placeholder="Name this quote (optional)"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none border border-zinc-100 dark:border-zinc-800"
                    />
                    {/* Save button — text color now computed instead of
                        hardcoded white. */}
                    <button
                      onClick={confirmSaveQuote}
                      className="shrink-0 px-3 py-1.5 rounded-[8px] text-xs font-black"
                      style={{ backgroundColor: fabColor, color: fabTextColor }}
                    >
                      Save
                    </button>
                  </div>
                )}

                {cart.map(item => {
                  const qty = item.qty || 1
                  const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
                  const lineTotal = effRate * qty
                  const discounted = effRate < item.unitPrice
                  const hint = getBulkHint(item.id, item.name, qty, effRate, item.unitPrice)
                  const displayName = getDisplayName(item.sectionTitle, item.name)
                  const accent = getAccent(item.hubId)
                  const isHighlighted = highlightId === item.id
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 rounded-[14px] shadow-sm space-y-2 transition-all duration-300 ease-out motion-reduce:transition-none",
                        GLASS.item,
                        isHighlighted && "ring-2 scale-[1.02]"
                      )}
                      style={isHighlighted ? { ["--tw-ring-color" as any]: accent } : undefined}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{displayName}</p>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-red-500 shrink-0 transition-colors duration-150"><Trash size={14} weight="bold" /></button>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {discounted && <span className="text-red-400 line-through">R{item.unitPrice}{item.unit ? `/${item.unit}` : ""}</span>}
                        <span className="font-bold text-zinc-700 dark:text-zinc-200" style={{ color: discounted ? accent : undefined }}>R{effRate}{item.unit ? `/${item.unit}` : ""}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleClickStep(item.id, -1)}
                            onPointerDown={() => handlePressStart(item.id, -1)}
                            onPointerUp={() => handlePressEnd(item.id)}
                            onPointerLeave={() => handlePressEnd(item.id)}
                            onPointerCancel={() => handlePressEnd(item.id)}
                            className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150 select-none touch-none", GLASS.btn)}
                          >
                            <Minus size={12} weight="bold" />
                          </button>
                          <input
                            ref={(el) => { qtyInputRefs.current[item.id] = el }}
                            type="number" min={1}
                            value={item.qty === 0 ? "" : item.qty}
                            onChange={e => setQtyDraft(item.id, e.target.value)}
                            onBlur={() => handleQtyBlur(item.id, item.qty)}
                            placeholder="1"
                            aria-label={`Quantity for ${displayName}`}
                            className="w-10 text-center text-xs font-black bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100"
                          />
                          <button
                            onClick={() => handleClickStep(item.id, 1)}
                            onPointerDown={() => handlePressStart(item.id, 1)}
                            onPointerUp={() => handlePressEnd(item.id)}
                            onPointerLeave={() => handlePressEnd(item.id)}
                            onPointerCancel={() => handlePressEnd(item.id)}
                            className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150 select-none touch-none", GLASS.btn)}
                          >
                            <Plus size={12} weight="bold" />
                          </button>
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

            {savedQuotes.length > 0 && (
              <div className="px-4 pt-4">
                <button
                  onClick={() => setShowSavedList(v => !v)}
                  className="w-full flex items-center justify-between gap-2 text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 px-1 mb-2"
                >
                  <span className="flex items-center gap-1.5"><BookmarkSimple size={13} weight="bold" /> Saved Quotes ({savedQuotes.length})</span>
                  <CaretDown size={12} className={cn("transition-transform duration-200", showSavedList ? "rotate-180" : "rotate-0")} />
                </button>
                <div className={cn("grid transition-[grid-template-rows] duration-250 ease-out motion-reduce:transition-none", showSavedList ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="space-y-1.5 pb-3">
                      {savedQuotes.map(q => {
                        const t = quoteTotals(q.items)
                        return (
                          <div key={q.id} className={cn("flex items-center justify-between gap-2 p-2.5 rounded-[10px]", GLASS.item)}>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">{q.name}</p>
                              <p className="text-[0.62rem] font-medium text-zinc-400">{t.count} item{t.count === 1 ? "" : "s"} · R{t.total}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Load button — text color now computed
                                  instead of hardcoded white. */}
                              <button onClick={() => loadSavedQuote(q)} className="px-2.5 py-1 rounded-[8px] text-[0.65rem] font-black" style={{ backgroundColor: fabColor, color: fabTextColor }}>Load</button>
                              <button onClick={() => deleteSavedQuote(q.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"><Trash size={12} weight="bold" /></button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 space-y-2">
              <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 px-1">Add a Service</span>
              {HUB_ORDER.map(hubId => {
                const hub = HUBS[hubId]
                const accent = getAccent(hubId)
                const solidAccent = getSolid(hubId)
                const isHubOpen = openHub === hubId
                const subtotal = hubSubtotal(hubId)

                return (
                  <div key={hubId} className={cn("rounded-[14px] overflow-hidden", GLASS.section)}>
                    <button
                      onClick={() => setOpenHub(isHubOpen ? null : hubId)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/20 dark:hover:bg-white/5 transition-colors duration-150"
                    >
                      <div
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accent}20`, color: accent }}
                      >
                        <HubIcon id={hubId} />
                      </div>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">{hub.title}</span>
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
                        <div className="border-t border-white/20 dark:border-white/10">
                          {hub.sections.map((section, sIdx) => {
                            const isSectionOpen = openSections[hubId] === sIdx

                            return (
                              <div
                                key={sIdx}
                                className={cn(sIdx > 0 && "border-t border-white/15 dark:border-white/[0.07]")}
                              >
                                <button
                                  onClick={() => toggleSection(hubId, sIdx)}
                                  className="w-full flex items-center justify-between px-3 py-2 transition-colors duration-150 hover:bg-white/20 dark:hover:bg-white/5"
                                >
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
                                              onClick={() => addItem(hubId, section.title, item.name, item.price)}
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
          </div>

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
                <span className="text-2xl font-black" style={{ color: fabColor }}>R{total}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportQuotePdf}
                  className={cn("shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center transition-transform duration-150 active:scale-95 transform-gpu", GLASS.btn)}
                  aria-label="Download or print quote as PDF"
                  title="Download / print as PDF"
                >
                  <FilePdf size={20} weight="bold" className="text-zinc-600 dark:text-zinc-300" />
                </button>
                <button
                  onClick={sendQuote}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-black text-sm text-white active:scale-95 transition-transform duration-150 shadow-lg transform-gpu"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <WhatsappLogo size={20} weight="fill" /> Send Quote via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
    } 
