"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, WhatsappLogo, PaperPlaneTilt, Check } from "@phosphor-icons/react"
import { BIZ } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

const WA_NUMBER  = "27753338260"
const GREETING   = "Hi there 👋 Tell us what you need and we'll get back to you right away!"

// ── WhatsApp's actual palette — restored as real solid colors for every
// surface that's meant to read as an authentic WhatsApp chat (header,
// wallpaper, bubbles, compose bar). The glass/frosted treatment made these
// hard to read against the page background, so header/bubbles/compose are
// back to true WA colors rather than translucency. ──────────────────────
const WA = {
  headerLight:   "#075E54",
  headerDark:    "#1F2C34",
  wallpaperLight: "#E5DDD5",
  wallpaperDark:  "#0B141A",
  bubbleInLight:  "#FFFFFF",
  bubbleInDark:   "#202C33",
  bubbleOutLight: "#D9FDD3",
  bubbleOutDark:  "#005C4B",
  textLight:      "#111B21",
  textDark:       "#E9EDEF",
  subLight:       "#667781",
  subDark:        "#8696A0",
  composeBarLight:"#F0F2F5",
  composeBarDark: "#1F2C34",
  composeFieldLight: "#FFFFFF",
  composeFieldDark:  "#2A3942",
  accent:         "#25D366",
  tick:           "#53BDEB",
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
  const [hubPicking, setHubPicking]  = useState(false)
  const [openTime, setOpenTime]      = useState("")
  const [sentTime, setSentTime]      = useState("")

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
      setHubPicking(false);
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

  // ── Theme-derived tokens — real WhatsApp colors ─────────────────────────
  const headerBg     = isDark ? WA.headerDark      : WA.headerLight
  const wallpaperBg  = isDark ? WA.wallpaperDark    : WA.wallpaperLight
  const bubbleIn     = isDark ? WA.bubbleInDark     : WA.bubbleInLight
  const bubbleOut    = isDark ? WA.bubbleOutDark    : WA.bubbleOutLight
  const textColor    = isDark ? WA.textDark         : WA.textLight
  const subColor     = isDark ? WA.subDark          : WA.subLight
  const composeBarBg = isDark ? WA.composeBarDark   : WA.composeBarLight
  const composeField = isDark ? WA.composeFieldDark : WA.composeFieldLight
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
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh]",
            "rounded-[20px] shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-zinc-950",
            "animate-in slide-in-from-bottom-4 fade-in duration-300"
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
        >
          {/* ── WhatsApp-style header — solid teal bar, real WA color.
              logo.png replaces the old avatar glyph, tinted via filter so
              it's a dark mark in light mode and a light mark in dark mode
              regardless of the file's own colors — same trick used for the
              navbar's watermark logo. ── */}
          <div
            className="flex items-center gap-3.5 px-5 py-5 shrink-0"
            style={{ backgroundColor: headerBg }}
          >
            <div className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 bg-white/90 p-1.5">
              <div
                className="relative w-full h-full"
                style={{ filter: isDark ? "brightness(0) invert(1)" : "brightness(0)" }}
              >
                <Image src="/logo.png" alt="" fill sizes="44px" className="object-contain" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-black text-[0.98rem] leading-tight tracking-tight text-white truncate">
                {BIZ.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <p className="text-[0.7rem] font-medium text-white/80">
                  Online · replies within 15 min
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* ── Chat body — real WA wallpaper + solid bubble colors ──── */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative"
            style={{ backgroundColor: wallpaperBg, backgroundImage: wallpaperPattern, backgroundSize: "200px 200px" }}
          >
            {step === "form" ? (
              <div className="relative z-10 px-4 py-5 flex flex-col gap-3">

                {/* Greeting — incoming message bubble */}
                <div
                  className="relative self-start max-w-[85%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm"
                  style={{ backgroundColor: bubbleIn }}
                >
                  <p className="text-[0.84rem] leading-relaxed pr-10" style={{ color: textColor }}>
                    {GREETING}
                  </p>
                  <span className="absolute bottom-1.5 right-3 text-[0.6rem]" style={{ color: subColor }}>
                    {openTime}
                  </span>
                </div>

                {/* Name — incoming bubble containing the field */}
                <div
                  className="relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm"
                  style={{ backgroundColor: bubbleIn }}
                >
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

                {/* Hub selector — no longer a floating dropdown. Tapping
                    the summary row reveals pills INLINE, in normal
                    document flow, so they push the note bubble down
                    instead of floating over it. Pills appear immediately
                    below the question, not lower over other content. */}
                <div
                  className="relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm"
                  style={{ backgroundColor: bubbleIn }}
                >
                  <label className="text-[0.62rem] font-black uppercase tracking-widest block mb-1.5" style={{ color: subColor }}>
                    What do you need help with?
                  </label>

                  <button
                    type="button"
                    onClick={() => setHubPicking(!hubPicking)}
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
                          Tap to choose...
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Pill grid — expands inline below the question */}
                  {hubPicking && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: `${subColor}30` }}>
                      {HUBS.map((h) => {
                        const isSelected = hub === h.id
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => { setHub(h.id); setHubPicking(false) }}
                            className={cn(
                              "px-3 py-2 rounded-full text-[0.74rem] font-black transition-colors border",
                              isSelected ? "text-white" : "hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                            style={{
                              backgroundColor: isSelected ? WA.accent : "transparent",
                              borderColor:     isSelected ? WA.accent : `${subColor}40`,
                              color:           isSelected ? "#fff" : textColor,
                            }}
                          >
                            {h.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Optional note — incoming bubble */}
                <div
                  className="relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm"
                  style={{ backgroundColor: bubbleIn }}
                >
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
              /* Sent confirmation — outgoing message bubble, real WA mint + ticks */
              <div className="relative z-10 min-h-full px-4 py-5 flex flex-col justify-end items-end gap-3">
                <div
                  className="relative max-w-[85%] px-4 py-3 rounded-lg rounded-tr-none shadow-sm"
                  style={{ backgroundColor: bubbleOut }}
                >
                  <p className="text-[0.84rem] leading-relaxed pr-14" style={{ color: isDark ? WA.textDark : WA.textLight }}>
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
                  className="px-5 py-2.5 rounded-full text-[0.78rem] font-bold shadow-sm"
                  style={{ backgroundColor: composeField, color: textColor }}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* ── Compose bar — real WA solid colors ───────────────────── */}
          {step === "form" && (
            <div
              className="shrink-0 flex items-center gap-2.5 px-4 py-3.5"
              style={{ backgroundColor: composeBarBg }}
            >
              <div
                className="flex-1 rounded-full px-4 py-3 text-[0.82rem] font-medium truncate shadow-sm"
                style={{ backgroundColor: composeField, color: isValid ? textColor : subColor }}
              >
                {isValid ? "Ready to send your message" : "Fill in your name & topic to continue"}
              </div>
              <button
                onClick={handleSend}
                disabled={!isValid}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-transform active:scale-90 disabled:opacity-40 disabled:active:scale-100"
                style={{ backgroundColor: WA.accent }}
                aria-label="Send"
              >
                <PaperPlaneTilt size={18} weight="fill" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────── */}
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
