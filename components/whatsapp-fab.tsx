"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, WhatsappLogo, PaperPlaneTilt, Check, CaretDown, Lightning } from "@phosphor-icons/react"
import { BIZ } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

const WA_NUMBER  = "27753338260"
const GREETING   = "Hi there 👋 Tell us what you need and we'll get back to you right away!"
const NAME_STORAGE_KEY = "apexbytes-wa-name"

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
  avatarBgLight:  "#E9EDEF",
  avatarBgDark:   "#2A3942",
} as const

const HUBS = [
  { id: "print",    label: "Print Hub",     hint: "Printing, copying, photos" },
  { id: "doc",      label: "Docu Hub",      hint: "CVs, typing, laminating" },
  { id: "design",   label: "Design Hub",    hint: "Logos, flyers, branding" },
  { id: "eservice", label: "E-Service Hub", hint: "SASSA, SARS, NSFAS, PSIRA" },
  { id: "tech",     label: "Tech Hub",      hint: "PC repairs, software, setup" },
  { id: "other",    label: "Not sure yet",  hint: "We'll help you figure it out" },
]

// Quick-reply chips for the optional note — tapping one appends a ready-
// made phrase instead of requiring the person to type it out, especially
// handy on a phone keyboard.
const QUICK_NOTES = [
  "Need it today",
  "Can I WhatsApp a photo?",
  "What time do you close?",
  "How much will this cost?",
]

function buildWallpaperPattern(strokeColor: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <g fill="none" stroke="${strokeColor}" stroke-width="1.2" opacity="0.28">
        <circle cx="24" cy="34" r="6" />
        <path d="M70 24 q10 -15 20 0 q10 15 20 0" />
        <path d="M140 66 l8 8 l-8 8 l-8 -8 z" />
        <path d="M190 34 q14 0 14 14 v8 q0 14 -14 14 h-14 l-8 8 v-10 h0 q-14 0 -14 -14 v-6 q0 -14 14 -14 z" />
        <circle cx="36" cy="130" r="4" />
        <path d="M36 150 q8 10 16 0 q8 -10 16 0" />
        <path d="M118 178 l10 10 m0 -10 l-10 10" />
        <circle cx="190" cy="190" r="5" />
        <path d="M70 216 q10 -12 20 0" />
      </g>
    </svg>
  `
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDateLabel(date: Date) {
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOf(new Date()) - startOf(date)) / 86400000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return date.toLocaleDateString([], { day: "numeric", month: "long" })
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
  const [openDate, setOpenDate]      = useState<Date | null>(null)
  const [sentTime, setSentTime]      = useState("")
  const [showGreeting, setShowGreeting] = useState(false) // gated by a brief "typing…" beat
  const [nameRemembered, setNameRemembered] = useState(false)

  const nameRef                      = useRef<HTMLInputElement>(null)
  const scrollTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const greetingTimer                = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Remember the person's name across visits — loaded once on mount, and
  // saved whenever it changes so returning users never have to retype it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_STORAGE_KEY)
      if (saved) { setName(saved); setNameRemembered(true) }
    } catch {}
  }, [])
  useEffect(() => {
    try {
      if (name.trim().length > 1) localStorage.setItem(NAME_STORAGE_KEY, name.trim())
    } catch {}
  }, [name])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(t)
  }, [])

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

  useEffect(() => {
    if (isOpen && step === "form") {
      const now = new Date()
      setOpenTime(formatTime())
      setOpenDate(now)
      setShowGreeting(false)
      if (greetingTimer.current) clearTimeout(greetingTimer.current)
      // Brief "typing…" beat before the greeting appears — small touch
      // that makes the widget feel like a live chat rather than a form
      // dressed up as one.
      greetingTimer.current = setTimeout(() => setShowGreeting(true), 550)
      setTimeout(() => nameRef.current?.focus(), 700)
    }
    return () => { if (greetingTimer.current) clearTimeout(greetingTimer.current) }
  }, [isOpen, step])

  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [isOpen])

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
      setHub("");
      setNote("");
      setHubPicking(false);
      // Name is intentionally NOT cleared — it's remembered for next time.
    }, 400)
  }

  // Lets someone send a second message in the same session without
  // closing/reopening the whole widget — keeps name, resets hub/note.
  const handleSendAnother = () => {
    setStep("form")
    setHub("")
    setNote("")
    setHubPicking(false)
    const now = new Date()
    setOpenTime(formatTime())
    setOpenDate(now)
    setShowGreeting(true)
  }

  const isValid     = name.trim().length > 1 && hub !== ""
  const selectedHub = HUBS.find(h => h.id === hub)

  const addQuickNote = (phrase: string) => {
    setNote(prev => (prev.trim() ? `${prev.trim()} ${phrase}` : phrase))
  }

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

  const headerBg      = isDark ? "rgba(31,44,52,0.55)"   : "rgba(7,94,84,0.65)"
  const wallpaperBg    = isDark ? "rgba(11,20,26,0.5)"    : "rgba(229,221,213,0.45)"
  const bubbleIn       = isDark ? "rgba(32,44,51,0.6)"    : "rgba(255,255,255,0.65)"
  const bubbleOut      = isDark ? "rgba(0,92,75,0.55)"    : "rgba(217,253,211,0.7)"
  const textColor      = isDark ? WA.textDark             : WA.textLight
  const subColor       = isDark ? WA.subDark              : WA.subLight
  const composeBarBg   = isDark ? "rgba(31,44,52,0.5)"    : "rgba(240,242,245,0.55)"
  const composeField    = isDark ? "rgba(42,57,66,0.7)"    : "rgba(255,255,255,0.75)"
  const avatarBg       = isDark ? WA.avatarBgDark         : WA.avatarBgLight
  const wallpaperPattern = buildWallpaperPattern(isDark ? "#FFFFFF" : "#000000")

  const dateLabel = openDate ? formatDateLabel(openDate) : ""

  const DateDivider = () => (
    <div className="flex justify-center mb-1">
      <span
        className="text-[0.62rem] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm backdrop-blur-md"
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)",
          color: subColor,
        }}
      >
        {dateLabel}
      </span>
    </div>
  )

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/30 backdrop-blur-sm transition-opacity duration-200 ease-out motion-reduce:transition-none"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ── Panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[400px] max-h-[75vh]",
            "rounded-[20px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl backdrop-saturate-150",
            "border border-white/40 dark:border-white/10",
            "animate-in slide-in-from-bottom-4 fade-in duration-200 ease-out motion-reduce:animate-none transform-gpu"
          )}
          style={{ boxShadow: `0 10px 40px rgba(37,211,102,0.18), 0 8px 28px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)` }}
        >
          <div
            className="relative flex items-center gap-3.5 px-5 py-5 shrink-0 backdrop-blur-xl"
            style={{ backgroundColor: headerBg }}
          >
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 p-2"
              style={{ backgroundColor: avatarBg }}
            >
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors duration-150 shrink-0"
              aria-label="Close"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative"
            style={{ backgroundColor: wallpaperBg, backgroundImage: wallpaperPattern, backgroundSize: "240px 240px" }}
          >
            {step === "form" ? (
              <div className="relative z-10 px-4 py-5 flex flex-col gap-3">

                {openDate && <DateDivider />}

                {/* Typing indicator — brief beat before the greeting
                    lands, purely cosmetic but makes the open feel alive. */}
                {!showGreeting && (
                  <div
                    className="self-start px-4 py-3 rounded-lg rounded-tl-none shadow-sm backdrop-blur-md flex items-center gap-1"
                    style={{ backgroundColor: bubbleIn }}
                  >
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: subColor, animationDelay: `${i * 120}ms`, animationDuration: "900ms" }}
                      />
                    ))}
                  </div>
                )}

                {showGreeting && (
                  <div
                    className="relative self-start max-w-[85%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-left-1 duration-200 ease-out motion-reduce:animate-none"
                    style={{ backgroundColor: bubbleIn }}
                  >
                    <p className="text-[0.84rem] leading-relaxed pr-10" style={{ color: textColor }}>
                      {GREETING}
                    </p>
                    <span className="absolute bottom-1.5 right-3 text-[0.6rem]" style={{ color: subColor }}>
                      {openTime}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm backdrop-blur-md transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    showGreeting ? "opacity-100" : "opacity-0"
                  )}
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
                  <div className="flex items-center justify-between mt-1.5">
                    {nameRemembered && name.trim().length > 1 ? (
                      <span className="text-[0.6rem] font-bold" style={{ color: WA.accent }}>Remembered from last time</span>
                    ) : <span />}
                    <span className="text-[0.6rem]" style={{ color: subColor }}>{openTime}</span>
                  </div>
                </div>

                <div
                  className={cn(
                    "relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm backdrop-blur-md transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    showGreeting ? "opacity-100" : "opacity-0"
                  )}
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
                    <CaretDown
                      size={15}
                      weight="bold"
                      className="transition-transform duration-200 ease-out motion-reduce:transition-none shrink-0"
                      style={{ color: subColor, transform: hubPicking ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-250 ease-out motion-reduce:transition-none",
                      hubPicking ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="flex flex-wrap gap-2 mt-3 pt-3 border-t"
                        style={{ borderColor: `${subColor}30` }}
                      >
                        {HUBS.map((h, idx) => {
                          const isSelected = hub === h.id
                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => { setHub(h.id); setHubPicking(false) }}
                              style={{
                                backgroundColor: isSelected ? WA.accent : "transparent",
                                borderColor:     isSelected ? WA.accent : `${subColor}40`,
                                color:           isSelected ? "#fff" : textColor,
                                transitionDelay: hubPicking ? `${idx * 25}ms` : "0ms",
                              }}
                              className={cn(
                                "px-3.5 py-2 rounded-full text-[0.74rem] font-black border transition-all duration-150 ease-out motion-reduce:transition-none",
                                "shadow-sm hover:-translate-y-0.5 hover:shadow-md active:scale-95 transform-gpu",
                                hubPicking ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                                !isSelected && "hover:bg-black/5 dark:hover:bg-white/5"
                              )}
                            >
                              {h.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-1.5">
                    <span className="text-[0.6rem]" style={{ color: subColor }}>{openTime}</span>
                  </div>
                </div>

                <div
                  className={cn(
                    "relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm backdrop-blur-md transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    showGreeting ? "opacity-100" : "opacity-0"
                  )}
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

                  {/* Quick-reply chips — sized down (smaller padding, text,
                      and icon than before) so they read as compact
                      shortcuts rather than competing visually with the
                      textarea above them. */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {QUICK_NOTES.map((phrase) => (
                      <button
                        key={phrase}
                        type="button"
                        onClick={() => addQuickNote(phrase)}
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[0.6rem] font-bold border transition-all duration-150 ease-out motion-reduce:transition-none active:scale-95 hover:-translate-y-0.5"
                        style={{ borderColor: `${subColor}35`, color: textColor, backgroundColor: `${WA.accent}12` }}
                      >
                        <Lightning size={8} weight="fill" style={{ color: WA.accent }} />
                        {phrase}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end mt-1.5">
                    <span className="text-[0.6rem]" style={{ color: subColor }}>{openTime}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="relative z-10 min-h-full px-4 py-5 flex flex-col justify-end items-end gap-3">
                {openDate && <DateDivider />}
                <div
                  className="relative max-w-[85%] px-4 py-3 rounded-lg rounded-tr-none shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-right-1 duration-200 ease-out motion-reduce:animate-none"
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendAnother}
                    className="px-4 py-2.5 rounded-full text-[0.78rem] font-bold shadow-sm backdrop-blur-md transition-transform duration-150 active:scale-95"
                    style={{ backgroundColor: `${WA.accent}20`, color: isDark ? WA.textDark : WA.textLight }}
                  >
                    Send another
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full text-[0.78rem] font-bold shadow-sm backdrop-blur-md transition-transform duration-150 active:scale-95"
                    style={{ backgroundColor: composeField, color: textColor }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {step === "form" && (
            <div
              className="relative shrink-0 flex items-center gap-2.5 px-4 py-3.5 backdrop-blur-xl"
              style={{ backgroundColor: composeBarBg }}
            >
              <div
                className="flex-1 rounded-full px-4 py-3 text-[0.82rem] font-medium truncate shadow-sm backdrop-blur-md"
                style={{ backgroundColor: composeField, color: isValid ? textColor : subColor }}
              >
                {isValid ? "Ready to send your message" : "Fill in your name & topic to continue"}
              </div>
              <button
                onClick={handleSend}
                disabled={!isValid}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-transform duration-150 ease-out active:scale-90 disabled:opacity-40 disabled:active:scale-100 transform-gpu"
                style={{ backgroundColor: WA.accent }}
                aria-label="Send"
              >
                <PaperPlaneTilt size={18} weight="fill" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────── 
          Position now flips to bottom-24 while open — matching the
          panel's own offset — so it reads as attached to the panel's
          bottom-right corner instead of floating separately below it. */}
      <div
        className={cn(
          "fixed z-[9992] right-4 group/wa",
          isOpen ? "bottom-24" : "bottom-6",
          "transition-all duration-200 ease-out motion-reduce:transition-none transform-gpu",
          !visible && "opacity-0 pointer-events-none",
          (scrolled && !isOpen) || isOtherOpen
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 scale-100 pointer-events-auto"
        )}
      >
        <div className="flex items-center justify-end gap-2">
          <span className={cn(
            "text-[0.65rem] font-black uppercase tracking-widest whitespace-nowrap pointer-events-none",
            "bg-white dark:bg-zinc-900 text-[#25D366]",
            "px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800",
            "transition-all duration-200 ease-out origin-right motion-reduce:transition-none transform-gpu",
            isOpen
              ? "opacity-0 scale-x-0"
              : "opacity-0 scale-x-0 group-hover/wa:opacity-100 group-hover/wa:scale-x-100"
          )}>
            Chat
          </span>

          <button
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? "Close WhatsApp chat" : `Chat with ${BIZ.name} on WhatsApp`}
            className="relative w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center active:scale-95 hover:scale-105 transition-transform duration-150 ease-out motion-reduce:transition-none transform-gpu"
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
