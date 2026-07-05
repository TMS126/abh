"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, WhatsappLogo, PaperPlaneTilt, Check, CaretDown } from "@phosphor-icons/react"
import { BIZ } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

const WA_NUMBER  = "27753338260"
const GREETING   = "Hi there 👋 Tell us what you need and we'll get back to you right away!"

// ── WhatsApp's actual wallpaper/tick colors — kept purely as the backdrop
// feel and status accents. Bubble fills below no longer use WA's solid
// bubbleIn/bubbleOut colors; those are replaced by the glass tokens further
// down so the panel matches the Quote Calculator widget's frosted style. ──
const WA = {
  wallpaperLight: "#E5DDD5",
  wallpaperDark:  "#0B141A",
  textLight:      "#111B21",
  textDark:       "#E9EDEF",
  subLight:       "#667781",
  subDark:        "#8696A0",
  accent:         "#25D366",
  tick:           "#53BDEB",
} as const

// ── Same glass tokens used in QuoteCalculatorWidget, reused here so both
// FAB panels share one visual language. ─────────────────────────────────
const GLASS = {
  panel:   "bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10",
  header:  "bg-white/50 dark:bg-zinc-900/40 backdrop-blur-xl border-b border-white/40 dark:border-white/10",
  bubbleIn:  "bg-white/70 dark:bg-zinc-900/55 backdrop-blur-md border border-white/60 dark:border-white/10",
  bubbleOut: "bg-[#25D366]/15 dark:bg-[#25D366]/12 backdrop-blur-md border border-[#25D366]/30",
  pill:    "bg-zinc-100/80 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
  btn:     "bg-zinc-100/70 dark:bg-white/[0.07] border border-white/60 dark:border-white/10",
  composeBar: "bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border-t border-white/40 dark:border-white/10",
  composeField: "bg-white/80 dark:bg-white/[0.06] border border-white/70 dark:border-white/10",
} as const

const HUBS = [
  { id: "print",    label: "Print Hub",     hint: "Printing, copying, photos" },
  { id: "doc",      label: "Docu Hub",      hint: "CVs, typing, laminating" },
  { id: "design",   label: "Design Hub",    hint: "Logos, flyers, branding" },
  { id: "eservice", label: "E-Service Hub", hint: "SASSA, SARS, NSFAS, PSIRA" },
  { id: "tech",     label: "Tech Hub",      hint: "PC repairs, software, setup" },
  { id: "other",    label: "Not sure yet",  hint: "We'll help you figure it out" },
]

// Faint tiled doodle pattern approximating WhatsApp's chat wallpaper —
// generated as an inline SVG so no external asset is needed.
function buildWallpaperPattern(strokeColor: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <g fill="none" stroke="${strokeColor}" stroke-width="1.2" opacity="0.35">
        <circle cx="20" cy="30" r="6" />
        <path d="M60 20 q10 -15 20 0 q10 15 20 0" />
        <path d="M120 60 l8 8 l-8 8 l-8 -8 z" />
        <circle cx="170" cy="40" r="4" />
        <path d="M30 110 q8 10 16 0 q8 -10 16 0" />
        <path d="M100 140 l10 10 m0 -10 l-10 10" />
        <circle cx="160" cy="150" r="5" />
        <path d="M60 170 q10 -12 20 0" />
      </g>
    </svg>
  `
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function WhatsAppFAB() {
  const { resolvedTheme }           = useTheme()
  const isDark                       = resolvedTheme === "dark"
  const [isOpen,  setIsOpen, isOtherOpen] = useExclusiveWidget("whatsapp")
  const [visible, setVisible]        = useState(false)
  const [scrolled, setScrolled]      = useState(false)
  const [name,    setName]           = useState("")
  const [hub,     setHub]            = useState("")
  const [note,    setNote]           = useState("")
  const [step,    setStep]           = useState<"form" | "sent">("form")
  const [isMenuOpen, setIsMenuOpen]  = useState(false)
  const [openTime, setOpenTime]      = useState("")
  const [sentTime, setSentTime]      = useState("")

  const nameRef                      = useRef<HTMLInputElement>(null)
  const menuRef                      = useRef<HTMLDivElement>(null)
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

  // Focus name + stamp the greeting bubble's time on open
  useEffect(() => {
    if (isOpen && step === "form") {
      setOpenTime(formatTime())
      setTimeout(() => nameRef.current?.focus(), 200)
    }
  }, [isOpen, step])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [isOpen])

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

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
    setTimeout(() => {
      setStep("form");
      setName("");
      setHub("");
      setNote("");
      setIsMenuOpen(false);
    }, 400)
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
    setSentTime(formatTime())
    setStep("sent")
  }

  // ── Theme-derived tokens ────────────────────────────────────────────────
  const wallpaperBg  = isDark ? WA.wallpaperDark    : WA.wallpaperLight
  const textColor    = isDark ? WA.textDark         : WA.textLight
  const subColor     = isDark ? WA.subDark          : WA.subLight
  const wallpaperPattern = buildWallpaperPattern(isDark ? "#FFFFFF" : "#000000")

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
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[420px] max-h-[75vh]",
            "rounded-[20px] shadow-2xl flex flex-col overflow-hidden",
            "animate-in slide-in-from-bottom-4 fade-in duration-300",
            GLASS.panel
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)" }}
        >
          {/* Specular highlight strip — same touch as the Quote Calculator panel */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none z-10" />

          {/* ── Glass header — logo.png in a neutral frame, no color tint,
              so it reads as a plain brand mark rather than a WhatsApp-teal
              chat header. More breathing room (py-5, gap-3.5) than before. ── */}
          <div className={cn("flex items-center gap-3.5 px-5 py-5 shrink-0", GLASS.header)}>
            <div
              className={cn(
                "w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 p-1.5",
                "bg-zinc-100/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10"
              )}
            >
              <div className="relative w-full h-full">
                <Image src="/logo.png" alt="" fill sizes="48px" className="object-contain" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-black text-[1.02rem] leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                {BIZ.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-[0.7rem] font-semibold text-zinc-500 dark:text-zinc-400">
                  Online · replies within 15 min
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={cn("w-9 h-9 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0", GLASS.btn)}
              aria-label="Close"
            >
              <X size={17} weight="bold" />
            </button>
          </div>

          {/* ── Chat body — wallpaper background kept for the "chat" feel,
              bubbles now glass instead of solid WhatsApp bubble colors ── */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative"
            style={{ backgroundColor: wallpaperBg, backgroundImage: wallpaperPattern, backgroundSize: "200px 200px" }}
          >
            {step === "form" ? (
              <div className="relative z-10 px-4 py-5 flex flex-col gap-3">

                {/* Greeting — incoming glass bubble */}
                <div className={cn("relative self-start max-w-[85%] px-4 py-3 rounded-[16px] rounded-tl-[4px] shadow-sm", GLASS.bubbleIn)}>
                  <p className="text-[0.84rem] leading-relaxed pr-10" style={{ color: textColor }}>
                    {GREETING}
                  </p>
                  <span className="absolute bottom-1.5 right-3 text-[0.6rem]" style={{ color: subColor }}>
                    {openTime}
                  </span>
                </div>

                {/* Name — incoming glass bubble containing the field */}
                <div className={cn("relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-[16px] rounded-tl-[4px] shadow-sm", GLASS.bubbleIn)}>
                  <label className="text-[0.62rem] font-black uppercase tracking-widest block mb-1.5" style={{ color: subColor }}>
                    Your Name
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thembi"
                    className="w-full bg-transparent text-[0.86rem] font-semibold outline-none border-none"
                    style={{ color: textColor }}
                  />
                </div>

                {/* Hub selector — incoming glass bubble containing dropdown trigger */}
                <div className={cn("relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-[16px] rounded-tl-[4px] shadow-sm", GLASS.bubbleIn)} ref={menuRef}>
                  <label className="text-[0.62rem] font-black uppercase tracking-widest block mb-1.5" style={{ color: subColor }}>
                    What do you need help with?
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <div className="flex flex-col min-w-0">
                      {selectedHub ? (
                        <>
                          <span className="text-[0.84rem] font-black leading-tight" style={{ color: textColor }}>
                            {selectedHub.label}
                          </span>
                          <span className="text-[0.66rem] font-semibold mt-0.5 truncate" style={{ color: subColor }}>
                            {selectedHub.hint}
                          </span>
                        </>
                      ) : (
                        <span className="text-[0.86rem] font-semibold" style={{ color: subColor }}>
                          Select an option...
                        </span>
                      )}
                    </div>
                    <CaretDown
                      size={16}
                      weight="bold"
                      className={cn("transition-transform duration-200 shrink-0", isMenuOpen && "rotate-180")}
                      style={{ color: subColor }}
                    />
                  </button>

                  {/* Dropdown menu — floating overlay, keeps its own frosted look */}
                  {isMenuOpen && (
                    <div
                      className={cn(
                        "absolute left-0 right-0 z-[9999] mt-2.5 p-1.5",
                        "rounded-[18px] shadow-xl border border-white/20 dark:border-white/10",
                        "animate-in fade-in zoom-in-95 duration-150 origin-top",
                        "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl"
                      )}
                    >
                      <div className="flex flex-col gap-1 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                        {HUBS.map((h) => {
                          const isSelected = hub === h.id
                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => {
                                setHub(h.id)
                                setIsMenuOpen(false)
                              }}
                              className={cn(
                                "w-full px-3 py-2.5 rounded-[12px] text-left flex items-center gap-3 transition-colors",
                                isSelected
                                  ? "bg-[#25D366]/10"
                                  : "hover:bg-zinc-100 dark:hover:bg-white/5"
                              )}
                            >
                              <div
                                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                                style={{
                                  borderColor:     isSelected ? "#25D366" : "#d1d5db",
                                  backgroundColor: isSelected ? "#25D366" : "transparent",
                                }}
                              >
                                {isSelected && <Check size={8} weight="bold" className="text-white" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className={cn(
                                  "text-[0.78rem] font-black leading-tight",
                                  isSelected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"
                                )}>
                                  {h.label}
                                </span>
                                <span className="text-[0.64rem] font-semibold text-zinc-400 mt-0.5">
                                  {h.hint}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional note — incoming glass bubble */}
                <div className={cn("relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-[16px] rounded-tl-[4px] shadow-sm", GLASS.bubbleIn)}>
                  <label className="text-[0.62rem] font-black uppercase tracking-widest block mb-1.5" style={{ color: subColor }}>
                    Anything else? <span className="normal-case font-semibold opacity-60">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. I need a CV today and want to collect by 3pm…"
                    rows={2}
                    className="w-full bg-transparent text-[0.86rem] font-semibold outline-none border-none resize-none"
                    style={{ color: textColor }}
                  />
                </div>

              </div>
            ) : (
              /* Sent confirmation — outgoing glass bubble, tinted WhatsApp green, WA-style ticks */
              <div className="relative z-10 min-h-full px-4 py-5 flex flex-col justify-end items-end gap-3">
                <div className={cn("relative max-w-[85%] px-4 py-3 rounded-[16px] rounded-tr-[4px] shadow-sm", GLASS.bubbleOut)}>
                  <p className="text-[0.84rem] leading-relaxed pr-14" style={{ color: textColor }}>
                    Message ready — opening WhatsApp now…
                  </p>
                  <span className="absolute bottom-1.5 right-3 flex items-center gap-0.5 text-[0.6rem]" style={{ color: subColor }}>
                    {sentTime}
                    <span className="relative w-3.5 h-2.5 inline-block ml-0.5">
                      <Check size={11} weight="bold" className="absolute left-0" style={{ color: WA.tick }} />
                      <Check size={11} weight="bold" className="absolute left-[3px]" style={{ color: WA.tick }} />
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className={cn("px-5 py-2.5 rounded-full text-[0.78rem] font-bold shadow-sm transition-colors", GLASS.composeField)}
                  style={{ color: textColor }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* ── Compose bar — glass instead of solid, send button stays
              WhatsApp green so the action still reads clearly as "send" ── */}
          {step === "form" && (
            <div className={cn("shrink-0 flex items-center gap-2.5 px-4 py-3.5", GLASS.composeBar)}>
              <div
                className={cn("flex-1 rounded-full px-4 py-3 text-[0.82rem] font-medium truncate shadow-sm", GLASS.composeField)}
                style={{ color: isValid ? textColor : subColor }}
              >
                {isValid ? "Ready to send your message" : "Fill in your name & topic to continue"}
              </div>
              <button
                onClick={handleSend}
                disabled={!isValid}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-transform active:scale-90 disabled:opacity-40 disabled:active:scale-100 shadow-md"
                style={{ backgroundColor: WA.accent }}
                aria-label="Send"
              >
                <PaperPlaneTilt size={18} weight="fill" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FAB — unchanged: still the WhatsApp icon, still green ───── */}
      <div
        className={cn(
          "fixed z-[9992] right-4 bottom-6 group/wa",
          "transition-all duration-300",
          !visible && "opacity-0 pointer-events-none",
          (scrolled && !isOpen) || isOtherOpen
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 scale-100"
        )}
      >
        <div className="flex items-center justify-end gap-2">
          {/* Slide-out label */}
          <span className={cn(
            "text-[0.65rem] font-black uppercase tracking-widest whitespace-nowrap",
            "bg-white dark:bg-zinc-900 text-[#25D366]",
            "px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800",
            "transition-all duration-300 origin-right",
            isOpen
              ? "opacity-0 scale-x-0 pointer-events-none"
              : "opacity-0 scale-x-0 group-hover/wa:opacity-100 group-hover/wa:scale-x-100"
          )}>
            Chat
          </span>

          <button
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? "Close WhatsApp chat" : `Chat with ${BIZ.name} on WhatsApp`}
            className="relative w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-transform duration-200"
            style={{ backgroundColor: "#25D366" }}
          >
            {!isOpen && (
              <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
            )}
            {isOpen ? <X size={22} weight="bold" /> : <WhatsappLogo size={28} weight="fill" />}
          </button>
        </div>
      </div>
    </>
  )
                                                }  
