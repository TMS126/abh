"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Calculator, X, WhatsappLogo, CaretDown, SealPercent, ArrowCounterClockwise, FloppyDisk, FilePdf, BookmarkSimple, Trash } from "@phosphor-icons/react"
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
import { CartItemRow } from "./cart-item-row"
import { HubBrowser } from "./hub-browser"
import { exportQuotePdf } from "./pdf-export"

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

  const [miniExpanded, setMiniExpanded] = useState(false)

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

  // ─── Back-button close ──────────────────────────────────────────────────
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

  // ─── Add-to-quote listener (no longer auto-opens the panel) ────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const { hubId, sectionTitle, name, price } = (e as CustomEvent).detail
      addItem(hubId, sectionTitle, name, price)
    }
    window.addEventListener("abh:add-to-quote", handler)
    return () => window.removeEventListener("abh:add-to-quote", handler)
  }, [])

  useEffect(() => {
    if (!highlightId) return
    const id = highlightId
    let raf1: number, raf2: number
    const tryScroll = () => {
      const el = qtyInputRefs.current[id]
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
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

  const fabVisible = !(scrolled && !isOpen) && !isOtherOpen
  const showMiniBar = cart.length > 0 && !isOpen && fabVisible

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">{announce}</span>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/45 transition-opacity duration-200 ease-out motion-reduce:transition-none"
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
              isOpen
                ? "max-w-0 opacity-0 scale-x-0"
                : "max-w-0 opacity-0 scale-x-0 group-hover/calc:max-w-[100px] group-hover/calc:opacity-100 group-hover/calc:scale-x-100"
            )}
            style={{ color: fabColor }}
          >
            Quote
          </span>

          <button
            onClick={() => setIsOpen(o => !o)}
            className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-transform duration-150 ease-out motion-reduce:transition-none transform-gpu"
            style={{ backgroundColor: fabColor, color: fabTextColor, boxShadow: `0 8px 24px ${fabColor}55, 0 4px 10px rgba(0,0,0,0.25)` }}
            aria-label={isOpen ? "Close quotation calculator" : "Open quotation calculator"}
          >
            {isOpen ? <X size={22} weight="bold" /> : <Calculator size={26} weight="fill" />}
          </button>

          {!isOpen && itemCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMiniExpanded(v => !v) }}
              aria-label={miniExpanded ? "Hide quote total" : "Show quote total"}
              className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-brand-orange text-white text-[0.65rem] font-black flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-md active:scale-90 transition-transform duration-150"
            >
              {itemCount}
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh] rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-220 ease-out motion-reduce:animate-none transform-gpu",
            GLASS.panel
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
        >
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/20 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-zinc-100 dark:border-white/10">
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
                <span className="text-xs font-bold truncate">{getDisplayName(undoStack.item.sectionTitle, undoStack.item.name)} - {undoStack.item.sectionTitle} removed</span>
                <button
                  onClick={undoRemove}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/15 dark:bg-black/10 hover:bg-white/25 dark:hover:bg-black/20 transition-colors"
                >
                  <ArrowCounterClockwise size={13} weight="bold" /> Undo
                </button>
              </div>
            )}

            {cart.length > 0 && (
              <div className="p-4 border-b border-zinc-100 dark:border-white/10 space-y-2">
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
                  <div className="flex items-center gap-2 p-2 rounded-[12px] bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 animate-in fade-in slide-in-from-top-1 duration-150">
                    <input
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

                {cart.map(item => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    accent={getAccent(item.hubId)}
                    isHighlighted={highlightId === item.id}
                    qtyInputRef={(el) => { qtyInputRefs.current[item.id] = el }}
                    onRemove={removeItem}
                    onClickStep={handleClickStep}
                    onPressStart={handlePressStart}
                    onPressEnd={handlePressEnd}
                    onQtyDraft={setQtyDraft}
                    onQtyBlur={handleQtyBlur}
                  />
                ))}
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

            <HubBrowser
              openHub={openHub}
              setOpenHub={setOpenHub}
              openSections={openSections}
              toggleSection={toggleSection}
              getAccent={getAccent}
              getSolid={getSolid}
              hubSubtotal={hubSubtotal}
              onAddItem={addItem}
            />
          </div>

          {cart.length > 0 && (
            <div className="px-4 pb-4 pt-3 shrink-0 border-t border-zinc-100 dark:border-white/10 space-y-3">
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
                  onClick={() => exportQuotePdf(cart)}
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
