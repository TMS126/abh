// components/whatsapp-fab.tsx
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowLeft, Phone, DotsThreeVertical, ImageSquare,
  PaperPlaneTilt, Microphone, Smiley, Paperclip, Camera,
  Check, CaretDown, Lightning, ArrowsClockwise, WhatsappLogo,
} from "@phosphor-icons/react"
import { BIZ, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"

const WA_NUMBER  = "27753338260"
const GREETING   = "Hi there 👋 Tell us what you need and we'll get back to you right away!"
const REPLY_TIME_NOTE = "We usually reply within 15–30 minutes."
const NAME_STORAGE_KEY = "apexbytes-wa-name"

// Shown once, only at open — exactly 2.6s, never replayed before later
// bubbles (name/hub/message all reveal together right after this).
const TYPING_DURATION = 2600
const SHAKE_DURATION  = 420

// ── Flat WhatsApp palette — solid hex only, no rgba/backdrop-blur glass.
// This widget deliberately mimics a real WhatsApp chat screen. ──
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

// ── Consistent type scale — everything in the panel now traces back to
// one of these four sizes instead of a dozen slightly-different rem
// values, per the "consistency in font sizing" request. ──
const TXT = {
  body:   "text-[0.86rem]",                 // greeting, inputs, textarea, dropdown option title
  label:  "text-[0.66rem] uppercase tracking-widest font-black", // "Your Name", section labels
  hint:   "text-[0.72rem]",                 // dropdown option subtext, hub hint
  time:   "text-[0.6rem]",                  // timestamps
} as const

const HUBS = [
  { id: "print",    label: "Print Hub",     hint: "Printing, copying, photos" },
  { id: "doc",      label: "Docu Hub",      hint: "CVs, typing, laminating" },
  { id: "design",   label: "Design Hub",    hint: "Logos, flyers, branding" },
  { id: "eservice", label: "E-Service Hub", hint: "SASSA, SARS, NSFAS, PSIRA" },
  { id: "tech",     label: "Tech Hub",      hint: "PC repairs, software, setup" },
  { id: "other",    label: "Not sure yet",  hint: "We'll help you figure it out" },
]

// Pool of quick-reply phrases for the optional note. Only ONE is shown at
// a time — tapping the shuffle icon swaps in a different random phrase;
// tapping the chip appends the currently-shown phrase to the note.
const QUICK_NOTES = [
  "Need it today", "Can I WhatsApp a photo?", "What time do you close?",
  "How much will this cost?", "Do I need to book first?", "Can you collect from me?",
  "Is this urgent?", "I'm not sure what I need", "Can I pay online?",
  "How long will it take?", "Do you deliver?", "Can I send the file now?",
  "I need this by tomorrow", "What documents should I bring?", "Is walk-in okay?",
  "Can someone call me instead?", "I have a few questions", "Can you quote me first?",
  "Do you work weekends?", "I need this urgently", "Can I collect later today?",
  "Do you accept cash only?", "Is there a discount for bulk?", "Can I get this printed too?",
  "I'll send more info shortly", "Just checking availability",
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

function randomQuickNoteIdx(exclude?: number) {
  if (QUICK_NOTES.length <= 1) return 0
  let next = exclude
  while (next === exclude) next = Math.floor(Math.random() * QUICK_NOTES.length)
  return next as number
}

// ── Typing loader — "typing" spells itself out letter by letter on a
// loop, three orbiting dots (big blue / medium green / small orange) spin
// around a shared center, and both the dot order and spin speed/direction
// are randomized once per mount so it plays a little differently every
// time the widget opens. Shown ONLY at the very start, for TYPING_DURATION. ──
function TypingLoader({ subColor }: { subColor: string }) {
  const word = "typing"
  const [letters, setLetters] = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setLetters(prev => (prev >= word.length ? 1 : prev + 1))
    }, 180)
    return () => clearInterval(id)
  }, [])

  const spin = useMemo(() => ({
    duration: (0.9 + Math.random() * 0.5).toFixed(2),
    direction: Math.random() > 0.5 ? "normal" : "reverse",
    startRotate: Math.floor(Math.random() * 360),
  }), [])

  const dots = useMemo(() => {
    const base = [
      { color: BRAND.blue,   size: 9, angle: 0   },
      { color: BRAND.green,  size: 7, angle: 120 },
      { color: BRAND.orange, size: 5, angle: 240 },
    ]
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[base[i], base[j]] = [base[j], base[i]]
    }
    return base
  }, [])

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={cn(TXT.body, "font-semibold tabular-nums w-[3.6em] inline-block")} style={{ color: subColor }}>
        {word.slice(0, letters)}
      </span>
      <span
        className="wa-spin-container relative inline-block"
        style={{
          width: 20, height: 20,
          animationDuration: `${spin.duration}s`,
          animationDirection: spin.direction,
          transform: `rotate(${spin.startRotate}deg)`,
        }}
      >
        {dots.map((d, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: d.size, height: d.size,
              backgroundColor: d.color,
              top: "50%", left: "50%",
              transform: `rotate(${d.angle}deg) translate(8px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </span>
    </span>
  )
}

export function WhatsAppFAB() {
  const router = useRouter()
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
  const [showGreeting, setShowGreeting] = useState(false) // gated by the 2.6s typing loader, shown once only
  const [nameRemembered, setNameRemembered] = useState(false)
  const [quickNoteIdx, setQuickNoteIdx] = useState(() => randomQuickNoteIdx())

  // Dead-button shake — any control with no real action (kebab menu,
  // paperclip, camera, or the send button while the form's incomplete)
  // triggers a brief shake instead of silently doing nothing.
  const [shakeKey, setShakeKey] = useState<string | null>(null)
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerShake = (key: string) => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current)
    setShakeKey(key)
    shakeTimerRef.current = setTimeout(() => setShakeKey(null), SHAKE_DURATION)
  }

  const nameRef                      = useRef<HTMLInputElement>(null)
  const scrollTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const greetingTimer                = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Remember the person's name across visits.
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
      setQuickNoteIdx(randomQuickNoteIdx())
      if (greetingTimer.current) clearTimeout(greetingTimer.current)
      // Typing loader shown for exactly TYPING_DURATION (2.6s), once,
      // before greeting/name/hub/message all reveal together.
      greetingTimer.current = setTimeout(() => setShowGreeting(true), TYPING_DURATION)
      setTimeout(() => nameRef.current?.focus(), TYPING_DURATION + 150)
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

  const handleSendAnother = () => {
    setStep("form")
    setHub("")
    setNote("")
    setHubPicking(false)
    const now = new Date()
    setOpenTime(formatTime())
    setOpenDate(now)
    setShowGreeting(true)
    setQuickNoteIdx(randomQuickNoteIdx())
  }

  // Gallery button: navigates AND closes the widget, rather than leaving
  // the panel open behind the new page.
  const handleGalleryClick = () => {
    handleClose()
    router.push("/gallery")
  }

  const isValid     = name.trim().length > 1 && hub !== ""
  const selectedHub = HUBS.find(h => h.id === hub)

  const addQuickNote = (phrase: string) => {
    setNote(prev => (prev.trim() ? `${prev.trim()} ${phrase}` : phrase))
  }
  const shuffleQuickNote = () => {
    setQuickNoteIdx(prev => randomQuickNoteIdx(prev))
  }

  const handleSend = () => {
    if (!isValid) { triggerShake("send"); return }
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

  const headerBg      = isDark ? WA.headerDark      : WA.headerLight
  const wallpaperBg    = isDark ? WA.wallpaperDark    : WA.wallpaperLight
  const bubbleIn       = isDark ? WA.bubbleInDark     : WA.bubbleInLight
  const bubbleOut      = isDark ? WA.bubbleOutDark    : WA.bubbleOutLight
  const textColor      = isDark ? WA.textDark         : WA.textLight
  const subColor       = isDark ? WA.subDark          : WA.subLight
  const composeBarBg   = isDark ? WA.composeBarDark   : WA.composeBarLight
  const composeField   = isDark ? WA.composeFieldDark : WA.composeFieldLight
  const avatarBg       = isDark ? WA.avatarBgDark     : WA.avatarBgLight
  const wallpaperPattern = buildWallpaperPattern(isDark ? "#FFFFFF" : "#000000")

  const dateLabel = openDate ? formatDateLabel(openDate) : ""

  const DateDivider = () => (
    <div className="flex justify-center mb-1">
      <span
        className={cn(TXT.time, "font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm")}
        style={{
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.7)",
          color: subColor,
        }}
      >
        {dateLabel}
      </span>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes wa-spin-container { to { transform: rotate(360deg); } }
        .wa-spin-container {
          animation-name: wa-spin-container;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes wa-shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .wa-shake { animation: wa-shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {/* ── Backdrop ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9989] bg-black/30 transition-opacity duration-200 ease-out motion-reduce:transition-none"
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
            "animate-in slide-in-from-bottom-4 fade-in duration-200 ease-out motion-reduce:animate-none transform-gpu"
          )}
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
        >
          {/* ── Header ── */}
          <div
            className="relative flex items-center gap-2.5 px-3 py-3 shrink-0"
            style={{ backgroundColor: headerBg }}
          >
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors duration-150 shrink-0"
              aria-label="Close"
            >
              <ArrowLeft size={20} weight="bold" />
            </button>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 p-1.5"
              style={{ backgroundColor: avatarBg }}
            >
              <div
                className="relative w-full h-full"
                style={{ filter: isDark ? "brightness(0) invert(1)" : "brightness(0)" }}
              >
                <Image src="/logo.png" alt="" fill sizes="36px" className="object-contain" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-black text-[0.9rem] leading-tight tracking-tight text-white truncate">
                {BIZ.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                </span>
                <p className={cn(TXT.hint, "font-medium text-white/80")}>online</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              {/* Functional — navigates AND closes the widget */}
              <button
                onClick={handleGalleryClick}
                aria-label="View our gallery"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/85 hover:bg-white/10 transition-colors duration-150"
              >
                <ImageSquare size={18} weight="fill" />
              </button>
              {/* Functional — real phone call */}
              <a
                href={`tel:${BIZ.phoneE164}`}
                aria-label="Call us"
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/85 hover:bg-white/10 transition-colors duration-150"
              >
                <Phone size={18} weight="fill" />
              </a>
              {/* Dead — no longer opens WhatsApp. Shakes on tap instead. */}
              <button
                onClick={() => triggerShake("kebab")}
                aria-label="More options"
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white/85 hover:bg-white/10 transition-colors duration-150",
                  shakeKey === "kebab" && "wa-shake"
                )}
              >
                <DotsThreeVertical size={20} weight="bold" />
              </button>
            </div>
          </div>

          {/* ── Chat area ─────────────────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative"
            style={{ backgroundColor: wallpaperBg, backgroundImage: wallpaperPattern, backgroundSize: "240px 240px" }}
          >
            {step === "form" ? (
              <div className="relative z-10 px-4 py-5 flex flex-col gap-3">

                {openDate && <DateDivider />}

                {/* Typing loader — shown exactly once, for 2.6s, never
                    repeated before later bubbles. */}
                {!showGreeting && (
                  <div
                    className="self-start px-4 py-3 rounded-lg rounded-tl-none shadow-sm"
                    style={{ backgroundColor: bubbleIn }}
                  >
                    <TypingLoader subColor={subColor} />
                  </div>
                )}

                {showGreeting && (
                  <div
                    className="relative self-start max-w-[85%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm animate-in fade-in slide-in-from-left-1 duration-200 ease-out motion-reduce:animate-none"
                    style={{ backgroundColor: bubbleIn }}
                  >
                    <p className={cn(TXT.body, "leading-relaxed pr-10")} style={{ color: textColor }}>
                      {GREETING}
                    </p>
                    <p className={cn(TXT.hint, "font-medium mt-1.5")} style={{ color: subColor }}>
                      {REPLY_TIME_NOTE}
                    </p>
                    <span className={cn(TXT.time, "absolute bottom-1.5 right-3")} style={{ color: subColor }}>
                      {openTime}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    showGreeting ? "opacity-100" : "opacity-0"
                  )}
                  style={{ backgroundColor: bubbleIn }}
                >
                  <label className={cn(TXT.label, "block mb-1.5")} style={{ color: subColor }}>
                    Your Name
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thembi"
                    className={cn(TXT.body, "w-full bg-transparent font-semibold outline-none border-none")}
                    style={{ color: textColor }}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    {nameRemembered && name.trim().length > 1 ? (
                      <span className={cn(TXT.time, "font-bold")} style={{ color: WA.accent }}>Remembered from last time</span>
                    ) : <span />}
                    <span className={TXT.time} style={{ color: subColor }}>{openTime}</span>
                  </div>
                </div>

                {/* Hub picker — same bubble/label layout as before, but
                    now a simple dropdown instead of accordion-of-pills. */}
                <div
                  className={cn(
                    "relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    showGreeting ? "opacity-100" : "opacity-0"
                  )}
                  style={{ backgroundColor: bubbleIn }}
                >
                  <label className={cn(TXT.label, "block mb-1.5")} style={{ color: subColor }}>
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
                          <span className={cn(TXT.body, "font-black leading-tight")} style={{ color: textColor }}>
                            {selectedHub.label}
                          </span>
                          <span className={cn(TXT.hint, "font-semibold mt-0.5 truncate")} style={{ color: subColor }}>
                            {selectedHub.hint}
                          </span>
                        </>
                      ) : (
                        <span className={cn(TXT.body, "font-semibold")} style={{ color: subColor }}>
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

                  {/* Simple dropdown list — replaces the old inline-pill
                      accordion, floats over the content below it. */}
                  {hubPicking && (
                    <div
                      className="absolute left-0 right-0 top-full mt-2 z-30 rounded-[14px] shadow-xl overflow-hidden border animate-in fade-in slide-in-from-top-1 duration-150 ease-out motion-reduce:animate-none"
                      style={{ backgroundColor: bubbleIn, borderColor: `${subColor}30` }}
                    >
                      {HUBS.map((h) => {
                        const isSelected = hub === h.id
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => { setHub(h.id); setHubPicking(false) }}
                            className="w-full text-left px-3.5 py-2.5 transition-colors duration-150"
                            style={{
                              backgroundColor: isSelected ? `${WA.accent}18` : "transparent",
                            }}
                          >
                            <span className={cn(TXT.body, "font-bold block")} style={{ color: isSelected ? WA.accent : textColor }}>
                              {h.label}
                            </span>
                            <span className={cn(TXT.hint, "block mt-0.5")} style={{ color: subColor }}>
                              {h.hint}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex justify-end mt-1.5">
                    <span className={TXT.time} style={{ color: subColor }}>{openTime}</span>
                  </div>
                </div>

                {/* Message bubble — real WhatsApp-style free typing */}
                <div
                  className={cn(
                    "relative self-start w-[92%] max-w-[92%] px-4 py-3 rounded-lg rounded-tl-none shadow-sm transition-opacity duration-200 ease-out motion-reduce:transition-none",
                    showGreeting ? "opacity-100" : "opacity-0"
                  )}
                  style={{ backgroundColor: bubbleIn }}
                >
                  <label className={cn(TXT.label, "block mb-1.5")} style={{ color: subColor }}>
                    Anything else? <span className="normal-case font-semibold opacity-60">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Anything else? Message here"
                    rows={2}
                    className={cn(TXT.body, "w-full bg-transparent font-semibold outline-none border-none resize-none")}
                    style={{ color: textColor }}
                  />

                  {/* Single random quick-reply chip */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => addQuickNote(QUICK_NOTES[quickNoteIdx])}
                      className={cn(TXT.hint, "flex-1 min-w-0 flex items-center gap-1 px-2 py-1 rounded-full font-bold border transition-all duration-150 ease-out motion-reduce:transition-none active:scale-95 hover:-translate-y-0.5")}
                      style={{ borderColor: `${subColor}35`, color: textColor, backgroundColor: `${WA.accent}12` }}
                    >
                      <Lightning size={9} weight="fill" style={{ color: WA.accent }} className="shrink-0" />
                      <span className="truncate">{QUICK_NOTES[quickNoteIdx]}</span>
                    </button>
                    <button
                      type="button"
                      onClick={shuffleQuickNote}
                      aria-label="Show another quick reply"
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-transform duration-150 ease-out active:scale-90 active:rotate-180"
                      style={{ borderColor: `${subColor}35`, color: subColor, backgroundColor: `${WA.accent}0a` }}
                    >
                      <ArrowsClockwise size={11} weight="bold" />
                    </button>
                  </div>

                  <div className="flex justify-end mt-1.5">
                    <span className={TXT.time} style={{ color: subColor }}>{openTime}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="relative z-10 min-h-full px-4 py-5 flex flex-col justify-end items-end gap-3">
                {openDate && <DateDivider />}
                <div
                  className="relative max-w-[85%] px-4 py-3 rounded-lg rounded-tr-none shadow-sm animate-in fade-in slide-in-from-right-1 duration-200 ease-out motion-reduce:animate-none"
                  style={{ backgroundColor: bubbleOut }}
                >
                  <p className={cn(TXT.body, "leading-relaxed pr-14")} style={{ color: isDark ? WA.textDark : WA.textLight }}>
                    Message ready — opening WhatsApp now…
                  </p>
                  <span className={cn(TXT.time, "absolute bottom-1.5 right-3 flex items-center gap-0.5")} style={{ color: subColor }}>
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
                    className={cn(TXT.hint, "px-4 py-2.5 rounded-full font-bold shadow-sm transition-transform duration-150 active:scale-95")}
                    style={{ backgroundColor: `${WA.accent}20`, color: isDark ? WA.textDark : WA.textLight }}
                  >
                    Send another
                  </button>
                  <button
                    onClick={handleClose}
                    className={cn(TXT.hint, "px-5 py-2.5 rounded-full font-bold shadow-sm transition-transform duration-150 active:scale-95")}
                    style={{ backgroundColor: composeField, color: textColor }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Compose bar ── */}
          {step === "form" && (
            <div
              className="relative shrink-0 flex items-end gap-2 px-2.5 py-2"
              style={{ backgroundColor: composeBarBg }}
            >
              <div
                className="flex-1 flex items-center gap-2 rounded-full px-3 py-2 shadow-sm min-w-0"
                style={{ backgroundColor: composeField }}
              >
                <Smiley size={20} weight="regular" style={{ color: subColor }} className="shrink-0" />
                <span className={cn(TXT.body, "flex-1 min-w-0 font-medium truncate")} style={{ color: isValid ? textColor : subColor }}>
                  {isValid ? "Ready to send your message" : "Fill in your name & topic to continue"}
                </span>
                {/* Dead decorative icons — shake instead of doing nothing silently */}
                <button
                  type="button"
                  onClick={() => triggerShake("paperclip")}
                  aria-label="Attach"
                  className={cn("shrink-0", shakeKey === "paperclip" && "wa-shake")}
                >
                  <Paperclip size={18} weight="regular" style={{ color: subColor }} />
                </button>
                <button
                  type="button"
                  onClick={() => triggerShake("camera")}
                  aria-label="Camera"
                  className={cn("shrink-0", shakeKey === "camera" && "wa-shake")}
                >
                  <Camera size={19} weight="regular" style={{ color: subColor }} />
                </button>
              </div>
              <button
                onClick={handleSend}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-transform duration-150 ease-out active:scale-90 transform-gpu",
                  !isValid && "opacity-60",
                  shakeKey === "send" && "wa-shake"
                )}
                style={{ backgroundColor: WA.accent }}
                aria-label={isValid ? "Send" : "Complete the form to send"}
              >
                {isValid ? <PaperPlaneTilt size={18} weight="fill" /> : <Microphone size={19} weight="fill" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────── */}
      <div
        data-widget="whatsapp-fab"
        className={cn(
          "fixed z-[9992] right-4 md:right-6 bottom-6 group/wa",
          "transition-all duration-200 ease-out motion-reduce:transition-none transform-gpu",
          !visible && "opacity-0 pointer-events-none",
          isOpen || (scrolled && !isOpen) || isOtherOpen
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 scale-100 pointer-events-auto"
        )}
      >
        <div className="flex items-center justify-end gap-2">
          <span className={cn(
            TXT.hint,
            "font-black uppercase tracking-widest whitespace-nowrap pointer-events-none overflow-hidden",
            "bg-white dark:bg-zinc-900 text-[#25D366]",
            "px-2.5 py-1 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800",
            "transition-all duration-200 ease-out origin-right motion-reduce:transition-none transform-gpu",
            "max-w-0 group-hover/wa:max-w-[100px] opacity-0 scale-x-0 group-hover/wa:opacity-100 group-hover/wa:scale-x-100"
          )}>
            Chat
          </span>
          <button
            onClick={() => setIsOpen(o => !o)}
            aria-label={isOpen ? "Close WhatsApp chat" : `Chat with ${BIZ.name} on WhatsApp`}
            className="relative w-14 h-14 flex items-center justify-center active:scale-90 hover:scale-110 transition-transform duration-150 ease-out motion-reduce:transition-none transform-gpu"
          >
            <WhatsappLogo
              size={32}
              weight="fill"
              style={{ color: WA.accent, filter: `drop-shadow(0 4px 10px ${WA.accent}80) drop-shadow(0 2px 4px rgba(0,0,0,0.3))` }}
            />
          </button>
        </div>
      </div>
    </>
  )
  } 
