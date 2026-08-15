"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Calculator, X, WhatsappLogo, CaretDown, SealPercent, ArrowCounterClockwise, FloppyDisk, FilePdf, BookmarkSimple, Trash, ArrowsOutSimple, ArrowsInSimple } from "@phosphor-icons/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { HUB_COLORS, HubKey, BIZ, waLink } from "@/lib/brand"
import { HUBS, HubId } from "@/lib/data"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"
import { GLASS, HOME_BLUE, getReadableTextColor } from "./shared"
import {
  CartItem, SavedQuote, STORAGE_KEY, STORAGE_KEY_SAVED,
  getDisplayName, getEffectiveRate, parsePrice, quoteTotals,
} from "./lib"
import { CartItemChip } from "./cart-item-chip"
import { CartItemCard } from "./cart-item-card"
import { HubBrowser } from "./hub-browser"
import { exportQuotePdf } from "./pdf-export"

const VIEW_KEY = "apexbytes-quote-view"

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
  const chipRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [announce, setAnnounce] = useState("")

  const [undoStack, setUndoStack] = useState<{ item: CartItem; index: number } | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [savedHydrated, setSavedHydrated] = useState(false)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [saveNameDraft, setSaveNameDraft] = useState("")
  const [showSavedList, setShowSavedList] = useState(false)

  const [miniExpanded, setMiniExpanded] = useState(false)

  // ── Expand view toggle: compact chip strip (default) vs full horizontal cards ──
  const [expandView, setExpandView] = useState(false)
  useEffect(() => {
    try { const s = localStorage.getItem(VIEW_KEY); if (s === "expanded") setExpandView(true) } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(VIEW_KEY, expandView ? "expanded" : "compact") } catch {}
  }, [expandView])

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

  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      window.history.pushState({ abhCalc: true }, "")
    }
    wasOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const onPop = () => { if (isOpen) setIsOpen(false) }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [isOpen])

  useEffect(() => {
    if (isOpen || cart.length === 0) setMiniExpanded(false)
  }, [isOpen, cart.length])

  useEffect(() => {
    const handler = (e: Event) => {
      const { hubId, sectionTitle, name, price } = (e as CustomEvent).detail
      addItem(hubId, sectionTitle, name, price)
    }
    window.addEventListener("abh:add-to-quote", handler)
    return () => window.removeEventListener("abh:add-to-quote", handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { hubId, sectionTitle, name } = (e as CustomEvent).detail
      const id = `${hubId}-${sectionTitle}-${name}`
      stepQty(id, -1)
    }
    window.addEventListener("abh:remove-from-quote", handler)
    return () => window.removeEventListener("abh:remove-from-quote", handler)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { id, delta } = (e as CustomEvent).detail
      stepQty(id, delta)
    }
    window.addEventListener("abh:step-quote-qty", handler)
    return () => window.removeEventListener("abh:step-quote-qty", handler)
  }, [])

  useEffect(() => {
    if (!highlightId) return
    const id = highlightId
    let raf1: number, raf2: number
    const tryScroll = () => {
      const el = chipRefs.current[id]
      if (el) {
        el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
      } else {
        raf2 = requestAnimationFrame(tryScroll)
      }
    }
    raf1 = requestAnimationFrame(tryScroll)
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

  const getAccent     = (id: HubId) => { const c = HUB_COLORS[id as HubKey]; return isDark ? c.accentDark : c.accentLight }
  const getSolid      = (id: HubId) => HUB_COLORS[id as HubKey].accentLight
  const titleAccent   = isDark ? HUB_COLORS.design.accentDark : HUB_COLORS.design.accentLight
  const fabColor      = isDark ? HOME_BLUE.dark : HOME_BLUE.light
  const fabTextColor  = useMemo(() => getReadableTextColor(fabColor), [fabColor])

  const hubsInCart = useMemo(() => Array.from(new Set(cart.map(i => i.hubId))), [cart])

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

  // Fixed: side effects (undo state + timer) now run outside the setCart
  // updater, using the current `cart` closure directly — avoids the undo
  // banner state getting tangled up with React re-invoking the updater.
  const removeItem = (id: string) => {
    const index = cart.findIndex(i => i.id === id)
    if (index === -1) return
    const item = cart[index]
    setCart(prev => prev.filter(i => i.id !== id))
    setUndoStack({ item, index })
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setUndoStack(null), 6000)
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

  const stepQty = (id: string, delta: number) => {
    const item = cart.find(i => i.id === id)
    if (!item) return
    const newQty = (item.qty || 1) + delta
    if (newQty < 1) {
      const index = cart.findIndex(i => i.id === id)
      setCart(prev => prev.filter(i => i.id !== id))
      setUndoStack({ item, index })
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
      undoTimerRef.current = setTimeout(() => setUndoStack(null), 6000)
      return
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i))
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
  const sectionSubtotal = (hubId: HubId, sectionTitle: string) => {
    const items = cart.filter(i => i.hubId === hubId && i.sectionTitle === sectionTitle)
    if (items.length === 0) return null
    return quoteTotals(items)
  }
  const getItemQty = (id: string) => cart.find(i => i.id === id)?.qty ?? 0

  const buildQuoteMessage = (items: CartItem[]) => {
    const t = quoteTotals(items)
    let msg = `Hi ${BIZ.name}! I'd like a quote for:\n\n`
    items.forEach(item => {
      const qty = item.qty || 1
      const effRate = getEffectiveRate(item.id, item.name, qty, item.unitPrice)
      const qtyLabel = item.unit ? `${qty} ${item.unit}${qty > 1 ? "s" : ""}` : `x${qty}`
      const label = `${getDisplayName(item.sectionTitle, item.name)} - ${item.sectionTitle} (${HUBS[item.hubId].title})`
      msg += `• ${label} — ${qtyLabel} @ R${effRate} = R${effRate * qty}\n`
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

  const fabVisible = !isOpen && !(scrolled && !isOpen) && !isOtherOpen
  const showMiniBar = cart.length > 0 && !isOpen && fabVisible

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">{announce}</span>

      <style>{`
        @keyframes abh-calc-grow {
          0% { opacity: 0; transform: scale(0.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        .abh-calc-grow {
          animation: abh-calc-grow 280ms cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: calc(100% - 26px) 100%;
        }
        @media (prefers-reduced-motion: reduce) {
          .abh-calc-grow { animation: none; }
        }
        .abh-chip-strip { scrollbar-width: none; -ms-overflow-style: none; }
        .abh-chip-strip::-webkit-scrollbar { display: none; }
      `}</style>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/70 backdrop-blur transition-opacity duration-200 ease-out motion-reduce:transition-none"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "fixed z-[9992] right-4 md:right-6 bottom-[5.5rem] flex items-center justify-end group/calc",
          "transition-all duration-200 ease-out motion-reduce:transition-none transform-gpu",
          fabVisible
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 pointer-events-none scale-90"
        )}
      >
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "-mr-3 flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full shadow-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 active:scale-95 transition-all duration-250 ease-out origin-right motion-reduce:transition-none transform-gpu overflow-hidden whitespace-nowrap",
            showMiniBar && miniExpanded
              ? "opacity-100 max-w-[220px] scale-100"
              : "opacity-0 max-w-0 scale-95 pl-0 pr-0 pointer-events-none"
          )}
        >
          {hubsInCart.length > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              {hubsInCart.map(hubId => (
                <span
                  key={hubId}
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getAccent(hubId) }}
                  aria-hidden="true"
                />
              ))}
            </span>
          )}
          <span className="text-xs font-black text-zinc-700 dark:text-zinc-200">R{total}</span>
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400">View quote</span>
        </button>

        <div className="relative flex items-center justify-end gap-2">
          <span
            className={cn(
              "text-[0.65rem] font-black uppercase tracking-widest whitespace-nowrap pointer-events-none overflow-hidden",
              "bg-white dark:bg-zinc-900",
              "px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800",
              "transition-all duration-200 ease-out origin-right motion-reduce:transition-none transform-gpu",
              "max-w-0 opacity-0 scale-x-0 group-hover/calc:max-w-[100px] group-hover/calc:opacity-100 group-hover/calc:scale-x-100"
            )}
            style={{ color: fabColor }}
          >
            Quote
          </span>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open quotation calculator"
            aria-haspopup="dialog"
            className="relative w-14 h-14 flex items-center justify-center active:scale-90 hover:scale-110 transition-transform duration-150 ease-out motion-reduce:transition-none transform-gpu"
          >
            <Calculator
              size={34}
              weight="fill"
              style={{ color: fabColor, filter: `drop-shadow(0 4px 10px ${fabColor}80) drop-shadow(0 2px 4px rgba(0,0,0,0.3))` }}
            />
          </button>

          {itemCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMiniExpanded(v => !v) }}
              aria-label={miniExpanded ? "Hide quote total" : "Show quote total"}
              className="absolute -top-0.5 -right-0.5 min-w-[22px] h-[22px] px-1 rounded-full bg-brand-orange text-white text-[0.65rem] font-black flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-md active:scale-90 transition-transform duration-150"
            >
              {itemCount}
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Quotation Calculator"
          className={cn(
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden transform-gpu abh-calc-grow",
            GLASS.panel
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
        >
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-zinc-100 dark:border-white/10">
            <h3 className="font-sans font-black text-lg" style={{ color: titleAccent }}>Quotation Calculator</h3>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close quotation calculator"
              className={cn("w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-150", GLASS.btn)}
            >
              <X size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">

            {/* Undo banner: independent of cart.length so it still shows
                after removing the last item in the cart. */}
            {undoStack && (
              <div className="sticky top-0 z-20 p-3 border-b border-zinc-100 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-[12px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-[0.7rem] font-bold truncate">{getDisplayName(undoStack.item.sectionTitle, undoStack.item.name)} removed</span>
                  <button
                    onClick={undoRemove}
                    className="shrink-0 flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 dark:bg-black/10 hover:bg-white/25 dark:hover:bg-black/20 transition-colors"
                  >
                    <ArrowCounterClockwise size={12} weight="bold" aria-hidden="true" /> Undo
                  </button>
                </div>
              </div>
            )}

            {/* ── Sticky quote block ── */}
            {cart.length > 0 && (
              <div
                className="sticky top-0 z-10 border-b border-zinc-100 dark:border-white/10 shadow-[0_4px_10px_-6px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_10px_-6px_rgba(0,0,0,0.4)]"
                style={{
                  background: isDark
                    ? `linear-gradient(180deg, ${fabColor}14 0%, rgba(24,24,27,0.97) 70%)`
                    : `linear-gradient(180deg, ${fabColor}0d 0%, rgba(255,255,255,0.97) 70%)`,
                  backdropFilter: "blur(6px)",
                }}
              >
                <div className="p-4 space-y-2.5">

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.72rem] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-200">
                      Your Quote · {itemCount} item{itemCount === 1 ? "" : "s"} · R{total}
                    </span>

                    {/* Expand / Save / Clear — icon-only, grouped in a pill container */}
                    <div className="flex items-center gap-1 p-1 rounded-full bg-zinc-100/80 dark:bg-white/5 shrink-0">
                      <button
                        onClick={() => setExpandView(v => !v)}
                        aria-pressed={expandView}
                        aria-label={expandView ? "Switch to compact view" : "Switch to expanded view"}
                        title={expandView ? "Compact view" : "Expand view"}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-white/10 transition-colors"
                      >
                        {expandView
                          ? <ArrowsInSimple size={14} weight="bold" aria-hidden="true" />
                          : <ArrowsOutSimple size={14} weight="bold" aria-hidden="true" />}
                      </button>
                      <button
                        onClick={() => setShowSaveForm(v => !v)}
                        aria-label="Save quote"
                        title="Save quote"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-300 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-white/10 transition-colors"
                      >
                        <FloppyDisk size={14} weight="bold" aria-hidden="true" />
                      </button>
                      <button
                        onClick={clearCart}
                        aria-label="Clear quote"
                        title="Clear quote"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-300 hover:text-red-500 hover:bg-white dark:hover:bg-white/10 transition-colors"
                      >
                        <Trash size={14} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {showSaveForm && (
                    <div className="flex items-center gap-2 p-2 rounded-[12px] bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 animate-in fade-in slide-in-from-top-1 duration-150">
                      <label htmlFor="save-quote-name" className="sr-only">Name this quote (optional)</label>
                      <input
                        id="save-quote-name"
                        autoFocus
                        value={saveNameDraft}
                        onChange={e => setSaveNameDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") confirmSaveQuote() }}
                        placeholder="Name this quote (optional)"
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-[8px] bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none border border-zinc-100 dark:border-zinc-800"
                      />
                      <button
                        onClick={confirmSaveQuote}
                        className="shrink-0 px-3 py-1.5 rounded-[8px] text-xs font-black"
                        style={{ backgroundColor: fabColor, color: fabTextColor }}
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <div
                    role="list"
                    aria-label="Items in your quote"
                    className="abh-chip-strip flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-1"
                  >
                    {cart.map(item =>
                      expandView ? (
                        <CartItemCard
                          key={item.id}
                          item={item}
                          accent={getAccent(item.hubId)}
                          isHighlighted={highlightId === item.id}
                          cardRef={(el) => { chipRefs.current[item.id] = el }}
                          onRemove={removeItem}
                          onClickStep={handleClickStep}
                          onPressStart={handlePressStart}
                          onPressEnd={handlePressEnd}
                        />
                      ) : (
                        <CartItemChip
                          key={item.id}
                          item={item}
                          accent={getAccent(item.hubId)}
                          isHighlighted={highlightId === item.id}
                          chipRef={(el) => { chipRefs.current[item.id] = el }}
                          onRemove={removeItem}
                          onClickStep={handleClickStep}
                          onPressStart={handlePressStart}
                          onPressEnd={handlePressEnd}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {savedQuotes.length > 0 && (
              <div className="px-4 pt-4">
                <button
                  onClick={() => setShowSavedList(v => !v)}
                  aria-expanded={showSavedList}
                  aria-controls="saved-quotes-panel"
                  className="w-full flex items-center justify-between gap-2 text-[0.65rem] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-300 px-1 mb-2"
                >
                  <span className="flex items-center gap-1.5"><BookmarkSimple size={13} weight="bold" aria-hidden="true" /> Saved Quotes ({savedQuotes.length})</span>
                  <CaretDown size={12} className={cn("transition-transform duration-200", showSavedList ? "rotate-180" : "rotate-0")} aria-hidden="true" />
                </button>
                <div id="saved-quotes-panel" className={cn("grid transition-[grid-template-rows] duration-250 ease-out motion-reduce:transition-none", showSavedList ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
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
                              <button onClick={() => loadSavedQuote(q)} className="px-2.5 py-1 rounded-[8px] text-[0.65rem] font-black" style={{ backgroundColor: fabColor, color: fabTextColor }}>Load</button>
                              <button onClick={() => deleteSavedQuote(q.id)} aria-label={`Delete saved quote ${q.name}`} className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"><Trash size={12} weight="bold" aria-hidden="true" /></button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <HubBrowser
              openHub={openHub}
              setOpenHub={setOpenHub}
              openSections={openSections}
              toggleSection={toggleSection}
              getAccent={getAccent}
              getSolid={getSolid}
              hubSubtotal={hubSubtotal}
              sectionSubtotal={sectionSubtotal}
              getItemQty={getItemQty}
              onAddItem={addItem}
            />
          </div>

          {cart.length > 0 && (
            <div className="px-4 pb-4 pt-3 shrink-0 border-t border-zinc-100 dark:border-white/10 space-y-3 shadow-[0_-6px_14px_-6px_rgba(0,0,0,0.15)] dark:shadow-[0_-6px_14px_-6px_rgba(0,0,0,0.5)]">
              {totalSavings > 0 && (
                <div className="flex items-center gap-1.5 text-[0.7rem] font-bold text-emerald-600 dark:text-emerald-400">
                  <SealPercent size={14} weight="fill" aria-hidden="true" />
                  Saving R{totalSavings} with bulk pricing
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-zinc-500">Total</span>
                <span className="text-2xl font-black" style={{ color: fabColor }}>R{total}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportQuotePdf(cart)}
                  className={cn("shrink-0 w-12 h-12 rounded-[14px] flex items-center justify-center transition-all duration-150 active:scale-95 shadow-md hover:shadow-lg transform-gpu", GLASS.btn)}
                  aria-label="Download or print quote as PDF"
                  title="Download / print as PDF"
                >
                  <FilePdf size={20} weight="bold" className="text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
                </button>
                <button
                  onClick={sendQuote}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-black text-sm text-emerald-950 active:scale-95 transition-transform duration-150 shadow-lg transform-gpu"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <WhatsappLogo size={20} weight="fill" aria-hidden="true" /> Send Quote via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
} 
