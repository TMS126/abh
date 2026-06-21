"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, WhatsappLogo, PaperPlaneTilt, Check } from "@phosphor-icons/react"
import { BIZ, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

const WA_NUMBER  = "27753338260"
const GREETING   = "Hi there 👋 Tell us what you need and we'll get back to you right away!"

// ── Same glass tokens as QuoteCalculatorWidget ─────────────────────────────────
const GLASS = {
  panel:   "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10",
  section: "bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10",
  item:    "bg-white/80 dark:bg-white/[0.06] border border-white/70 dark:border-white/[0.08]",
  btn:     "bg-zinc-100/70 dark:bg-white/[0.07] border border-white/60 dark:border-white/10",
} as const

const HUBS = [
  { id: "print",    label: "Print Hub",     hint: "Printing, copying, photos" },
  { id: "doc",      label: "Docu Hub",      hint: "CVs, typing, laminating" },
  { id: "design",   label: "Design Hub",    hint: "Logos, flyers, branding" },
  { id: "eservice", label: "E-Service Hub", hint: "SASSA, SARS, NSFAS, PSIRA" },
  { id: "tech",     label: "Tech Hub",      hint: "PC repairs, software, setup" },
  { id: "other",    label: "Not sure yet",  hint: "We'll help you figure it out" },
]

export function WhatsAppFAB() {
  const { resolvedTheme }           = useTheme()
  const isDark                       = resolvedTheme === "dark"
  const [isOpen,  setIsOpen]         = useExclusiveWidget("whatsapp")
  const [visible, setVisible]        = useState(false)
  const [scrolled, setScrolled]      = useState(false)
  const [name,    setName]           = useState("")
  const [hub,     setHub]            = useState("")
  const [note,    setNote]           = useState("")
  const [step,    setStep]           = useState<"form" | "sent">("form")
  const nameRef                      = useRef<HTMLInputElement>(null)
  const scrollTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mount delay
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // Hide completely while scrolling — same pattern as calculator
  useEffect(() => {
    const onScroll = () => {
      setScrolled(true)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => setScrolled(false), 300)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

  // Focus name on open
  useEffect(() => {
    if (isOpen && step === "form") setTimeout(() => nameRef.current?.focus(), 200)
  }, [isOpen, step])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [isOpen])

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"; style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""
      style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => { setStep("form"); setName(""); setHub(""); setNote("") }, 400)
  }

  const isValid     = name.trim().length > 1 && hub !== ""
  const selectedHub = HUBS.find(h => h.id === hub)

  const handleSend = () => {
    if (!isValid) return
    const message = [
      `Hi ${BIZ.name}! 👋`,
      `My name is ${name.trim()}.`,
      `I need help with: *${selectedHub?.label ?? hub}*`,
      note.trim() ? `More details: ${note.trim()}` : "",
    ].filter(Boolean).join("\n")
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank")
    setStep("sent")
  }

  // Accent color matching calculator's titleAccent pattern
  const accentColor = isDark ? "#CDEB9F" : "#25D366"

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ── Panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh]",
            "rounded-[20px] shadow-2xl flex flex-col overflow-hidden",
            "animate-in slide-in-from-bottom-4 fade-in duration-300",
            GLASS.panel
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3)" }}
        >
          {/* Specular highlight — same as calculator */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 shrink-0 border-b border-white/20 dark:border-white/10"
            style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)" }}
          >
            {/* Avatar */}
            <div
              className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{ backgroundColor: BRAND.blue }}
            >
              <Image src="/logo.png" alt="" fill sizes="36px" className="object-contain p-1.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-black text-lg leading-tight" style={{ color: accentColor }}>
                {BIZ.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-[0.62rem] font-semibold text-zinc-500 dark:text-zinc-400">
                  Online · replies in ~30 min
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors", GLASS.btn)}
              aria-label="Close"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
            {step === "form" ? (
              <div className="px-5 py-5 flex flex-col gap-4">

                {/* Greeting bubble */}
                <div className={cn("relative self-start max-w-[88%] px-4 py-3 rounded-[12px] rounded-tl-none text-[0.80rem] leading-relaxed shadow-sm", GLASS.item)}>
                  <span className="text-zinc-700 dark:text-zinc-300">{GREETING}</span>
                  <span
                    className="absolute -left-[6px] top-0 w-0 h-0"
                    style={{
                      borderTop: `8px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)"}`,
                      borderLeft: "7px solid transparent",
                    }}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="text-[0.62rem] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    Your Name
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thembi"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-[14px] text-[0.84rem] font-semibold",
                      "text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
                      "focus:outline-none transition-colors",
                      GLASS.item
                    )}
                  />
                </div>

                {/* Hub selector — inline radio cards */}
                <div>
                  <label className="text-[0.62rem] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    What do you need help with?
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {HUBS.map((h) => {
                      const isSelected = hub === h.id
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setHub(h.id)}
                          className={cn(
                            "w-full px-4 py-2.5 rounded-[14px] text-left flex items-center gap-3 transition-all duration-150 active:scale-[0.98]",
                            isSelected
                              ? "bg-[#25D366]/10 border border-[#25D366]/50"
                              : GLASS.item
                          )}
                        >
                          {/* Radio dot */}
                          <span
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150"
                            style={{
                              borderColor:     isSelected ? "#25D366" : "#d1d5db",
                              backgroundColor: isSelected ? "#25D366" : "transparent",
                            }}
                          >
                            {isSelected && <Check size={8} weight="bold" className="text-white" />}
                          </span>
                          <span className="flex flex-col min-w-0">
                            <span className={cn(
                              "text-[0.80rem] font-black leading-tight",
                              isSelected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"
                            )}>
                              {h.label}
                            </span>
                            <span className="text-[0.66rem] font-semibold text-zinc-400 mt-0.5">{h.hint}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Optional note */}
                <div>
                  <label className="text-[0.62rem] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    Anything else? <span className="normal-case font-semibold opacity-60">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. I need a CV today and want to collect by 3pm…"
                    rows={2}
                    className={cn(
                      "w-full px-4 py-2.5 rounded-[14px] text-[0.84rem] font-semibold",
                      "text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
                      "focus:outline-none resize-none transition-colors",
                      GLASS.item
                    )}
                  />
                </div>

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={!isValid}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-[14px] font-black text-sm text-white transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100 mb-1"
                  style={{ backgroundColor: "#25D366" }}
                >
                  <PaperPlaneTilt size={15} weight="fill" />
                  Open WhatsApp to Send
                </button>

              </div>
            ) : (
              /* Sent confirmation */
              <div className="px-5 py-10 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#25D366]/15">
                  <WhatsappLogo size={28} weight="fill" style={{ color: "#25D366" }} />
                </div>
                <div>
                  <p className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-1">WhatsApp opened!</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Your message is pre-filled. Hit <strong>Send</strong> in WhatsApp — we'll reply shortly.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className={cn("mt-1 px-6 py-2.5 rounded-[14px] text-sm font-bold text-zinc-600 dark:text-zinc-300 transition-colors", GLASS.btn)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? "Close WhatsApp chat" : `Chat with ${BIZ.name} on WhatsApp`}
        className={cn(
          "group fixed bottom-6 right-6 z-[9992] w-14 h-14 rounded-full text-white shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-300 active:scale-95 hover:-translate-y-0.5",
          visible ? "translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
          // Fully hide while scrolling — never visible mid-scroll
          scrolled && !isOpen
            ? "opacity-0 pointer-events-none"
            : isOpen
              ? "opacity-100"
              : "opacity-60 hover:opacity-100"
        )}
        style={{ backgroundColor: "#25D366", bottom: "5.5rem" }}
      >
        {/* Pulse ring — only when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
        )}
        {isOpen
          ? <X size={22} weight="bold" />
          : <WhatsappLogo size={28} weight="fill" />
        }
      </button>
    </>
  )
}
 
