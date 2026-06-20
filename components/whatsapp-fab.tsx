"use client"

import { useState, useEffect, useRef } from "react"
import { X, WhatsappLogo, PaperPlaneTilt } from "@phosphor-icons/react"
import { BIZ, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

const WA_NUMBER = "27753338260"
const GREETING  = `Hi there 👋 How can we help you today?`
const REPLY_TIME = "Typically replies within 30 minutes"

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return mobile
}

export function WhatsAppFAB() {
  const [open,    setOpen]    = useState(false)
  const [message, setMessage] = useState("")
  const [visible, setVisible] = useState(false)
  const inputRef              = useRef<HTMLTextAreaElement>(null)
  const isMobile              = useIsMobile()

  // Mount delay
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  // Focus input when popup opens
  useEffect(() => {
    if (open && !isMobile) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open, isMobile])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [open])

  const handleFabClick = () => {
    if (isMobile) {
      // On mobile — go straight to WhatsApp
      window.open(
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi ${BIZ.name}! I'd like to get in touch.`)}`,
        "_blank"
      )
    } else {
      setOpen((o) => !o)
    }
  }

  const handleSend = () => {
    const text = message.trim() || `Hi ${BIZ.name}! I'd like to get in touch.`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
    setMessage("")
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      {/* ── Chat popup (desktop only) ───────────────────────── */}
      <div
        className={cn(
          "fixed bottom-[5.5rem] right-6 z-[9990] w-[320px] rounded-[14px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-700",
          "transition-all duration-300 origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
          "hidden md:flex flex-col"
        )}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: "#075E54" }}
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ backgroundColor: BRAND.blue }}
          >
            TM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight truncate">{BIZ.name}</p>
            <p className="text-white/70 text-[0.65rem] font-semibold leading-tight">{REPLY_TIME}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors shrink-0"
            aria-label="Close chat"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Chat body */}
        <div
          className="flex-1 px-4 py-4 min-h-[140px]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundColor: "#ECE5DD",
          }}
        >
          {/* Greeting bubble */}
          <div className="flex items-end gap-2 mb-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-black text-white shrink-0 mb-0.5"
              style={{ backgroundColor: BRAND.blue }}
            >
              TM
            </div>
            <div
              className="relative max-w-[220px] px-3 py-2 rounded-[8px] rounded-tl-none text-[0.78rem] text-zinc-800 leading-relaxed shadow-sm"
              style={{ backgroundColor: "#ffffff" }}
            >
              {GREETING}
              {/* Tail */}
              <span
                className="absolute -left-[6px] top-0 w-0 h-0"
                style={{
                  borderTop: "8px solid #ffffff",
                  borderLeft: "7px solid transparent",
                }}
              />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div
          className="flex items-end gap-2 px-3 py-2.5 border-t"
          style={{ backgroundColor: "#F0F0F0", borderColor: "#D9D9D9" }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 resize-none rounded-full px-4 py-2 text-[0.82rem] text-zinc-800 bg-white focus:outline-none leading-snug max-h-[80px] overflow-y-auto"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
          />
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-all active:scale-90 hover:brightness-110"
            style={{ backgroundColor: "#25D366" }}
            aria-label="Send message"
          >
            <PaperPlaneTilt size={16} weight="fill" />
          </button>
        </div>

        {/* Footer note */}
        <div
          className="px-4 py-1.5 flex items-center justify-center gap-1.5"
          style={{ backgroundColor: "#F0F0F0" }}
        >
          <WhatsappLogo size={11} weight="fill" style={{ color: "#25D366" }} />
          <p className="text-[0.58rem] font-bold text-zinc-400 tracking-wide">
            Powered by WhatsApp
          </p>
        </div>
      </div>

      {/* ── FAB button ───────────────────────────────────────── */}
      <button
        onClick={handleFabClick}
        aria-label={open ? "Close WhatsApp chat" : `Chat with ${BIZ.name} on WhatsApp`}
        className={cn(
          "fixed bottom-[5.5rem] right-6 z-[9990]",
          "w-14 h-14 rounded-full flex items-center justify-center",
          "text-white shadow-xl",
          "transition-all duration-300 active:scale-95 hover:-translate-y-0.5",
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
 
