"use client"

import { useState, useEffect, useRef } from "react"
import { X, WhatsappLogo, PaperPlaneTilt } from "@phosphor-icons/react"
import { BIZ, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

const WA_NUMBER = "27753338260"

const HUBS = [
  { id: "print",    label: "Print Hub",      hint: "Printing, copying, photos" },
  { id: "doc",      label: "Docu Hub",       hint: "CVs, typing, laminating" },
  { id: "design",   label: "Design Hub",     hint: "Logos, flyers, branding" },
  { id: "eservice", label: "E-Service Hub",  hint: "SASSA, SARS, NSFAS, PSIRA" },
  { id: "tech",     label: "Tech Hub",       hint: "PC repairs, software, setup" },
  { id: "other",    label: "Not sure yet",   hint: "We'll help you figure it out" },
]

export function WhatsAppFAB() {
  const [open,    setOpen]    = useState(false)
  const [visible, setVisible] = useState(false)
  const [name,    setName]    = useState("")
  const [hub,     setHub]     = useState("")
  const [note,    setNote]    = useState("")
  const [step,    setStep]    = useState<"form" | "sent">("form")
  const nameRef               = useRef<HTMLInputElement>(null)

  // Mount delay
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  // Focus name input on open
  useEffect(() => {
    if (open && step === "form") setTimeout(() => nameRef.current?.focus(), 200)
  }, [open, step])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = "fixed"
    style.top = `-${scrollY}px`
    style.left = "0"; style.right = "0"; style.width = "100%"; style.overflow = "hidden"
    return () => {
      style.position = ""; style.top = ""; style.left = ""
      style.right = ""; style.width = ""; style.overflow = ""
      window.scrollTo(0, scrollY)
    }
  }, [open])

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => { setStep("form"); setName(""); setHub(""); setNote("") }, 400)
  }

  const selectedHub = HUBS.find(h => h.id === hub)
  const isValid     = name.trim().length > 1 && hub !== ""

  const handleSend = () => {
    if (!isValid) return
    const hubLabel = selectedHub?.label ?? hub
    const message  = [
      `Hi ${BIZ.name}! 👋`,
      `My name is ${name.trim()}.`,
      `I need help with: *${hubLabel}*`,
      note.trim() ? `More details: ${note.trim()}` : "",
    ].filter(Boolean).join("\n")

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank")
    setStep("sent")
  }

  return (
    <>
      {/* ── Overlay ──────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[10100] flex items-end md:items-center justify-center",
          "transition-all duration-300",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          onClick={handleClose}
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Panel */}
        <div
          className={cn(
            "relative w-full md:w-[400px] bg-white dark:bg-zinc-900 rounded-t-[24px] md:rounded-[14px]",
            "shadow-2xl overflow-hidden transition-all duration-300",
            open
              ? "translate-y-0 opacity-100"
              : "translate-y-full md:translate-y-8 opacity-0"
          )}
        >
          {/* WhatsApp-style header */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{ backgroundColor: "#075E54" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
              style={{ backgroundColor: BRAND.blue }}
            >
              TM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm leading-tight">{BIZ.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-white/70 text-[0.62rem] font-semibold">Online · replies in ~30 min</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Body */}
          {step === "form" ? (
            <div className="px-5 py-6 flex flex-col gap-4 overflow-y-auto overscroll-contain max-h-[70dvh]">

              {/* Greeting bubble */}
              <div
                className="self-start relative max-w-[85%] px-4 py-3 rounded-[12px] rounded-tl-none text-[0.82rem] text-zinc-800 leading-relaxed shadow-sm"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
              >
                Hi there 👋 Tell us a bit about what you need and we'll get back to you right away!
                <span
                  className="absolute -left-[6px] top-0 w-0 h-0"
                  style={{ borderTop: "8px solid #e5e7eb", borderLeft: "7px solid transparent" }}
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                  Your Name
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Thembi"
                  className="w-full px-4 py-3 rounded-[14px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[0.84rem] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#25D366] transition-colors"
                />
              </div>

              {/* Hub selector — inline, no floating dropdown */}
              <div>
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                  What do you need help with?
                </label>
                <div className="flex flex-col gap-2">
                  {HUBS.map((h) => {
                    const isSelected = hub === h.id
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHub(h.id)}
                        className="w-full px-4 py-3 rounded-[14px] border text-left flex items-center gap-3 transition-all duration-150 active:scale-[0.98]"
                        style={{
                          borderColor:     isSelected ? "#25D366" : undefined,
                          backgroundColor: isSelected ? "#25D36610" : undefined,
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150"
                          style={{
                            borderColor:     isSelected ? "#25D366" : "#d1d5db",
                            backgroundColor: isSelected ? "#25D366" : "transparent",
                          }}
                        >
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                          )}
                        </span>
                        <span className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-[0.82rem] font-black leading-tight",
                            isSelected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-300"
                          )}>
                            {h.label}
                          </span>
                          <span className="text-[0.68rem] font-semibold text-zinc-400 mt-0.5">{h.hint}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                  Anything else? <span className="normal-case font-semibold">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. I need a CV from scratch and want it today…"
                  rows={2}
                  className="w-full px-4 py-3 rounded-[14px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[0.84rem] font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#25D366] transition-colors resize-none"
                />
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!isValid}
                className="flex items-center justify-center gap-2.5 w-full py-4 rounded-[14px] font-black text-sm text-white transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 mt-1"
                style={{ backgroundColor: "#25D366" }}
              >
                <PaperPlaneTilt size={16} weight="fill" />
                Open WhatsApp to Send
              </button>
            </div>
          ) : (
            /* Sent state */
            <div className="px-5 py-10 flex flex-col items-center text-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#25D36620" }}
              >
                <WhatsappLogo size={32} weight="fill" style={{ color: "#25D366" }} />
              </div>
              <div>
                <p className="font-black text-lg text-zinc-900 dark:text-zinc-50 mb-1">WhatsApp opened!</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Your message is pre-filled. Just hit <strong>Send</strong> in WhatsApp and we'll get back to you shortly.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-2 px-6 py-2.5 rounded-[14px] border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FAB button ───────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : `Chat with ${BIZ.name} on WhatsApp`}
        className={cn(
          "fixed bottom-[5.5rem] right-6 z-[9990]",
          "w-14 h-14 rounded-full flex items-center justify-center",
          "text-white shadow-xl transition-all duration-300 active:scale-95 hover:-translate-y-0.5",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ backgroundColor: "#25D366" }}
      >
        <span className={cn(
          "absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20",
          open && "hidden"
        )} />
        <div className="transition-all duration-200">
          {open
            ? <X size={24} weight="bold" />
            : <WhatsappLogo size={28} weight="fill" />
          }
        </div>
      </button>
    </>
  )
}
 
