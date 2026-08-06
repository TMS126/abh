"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, WhatsappLogo, PaperPlaneTilt, Check, CaretDown, Lightning, ArrowsClockwise } from "@phosphor-icons/react"
import { BIZ } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useExclusiveWidget } from "@/hooks/use-exclusive-widget"
import { WA_BOOKING_CONFIG } from "@/lib/wa-booking-config"
import { generateSlotsForDate } from "@/lib/slot-utils"
import dynamic from "next/dynamic"
import "react-day-picker/dist/style.css"
import { format } from "date-fns"
import { trackEvent } from "@/lib/analytics"

// Dynamically load DayPicker on the client only to avoid SSR/Turbopack
// export/import errors during build — DayPicker provides named exports.
const DayPicker = dynamic(() => import("react-day-picker").then(mod => mod.DayPicker), { ssr: false })

const WA_NUMBER  = "27753338260" // hardcoded per request
const GREETING   = "Hi there 👋 Tell us what you need and we'll get back to you right away!"
const NAME_STORAGE_KEY = "apexbytes-wa-name"

export function WhatsAppFAB() {
  const { resolvedTheme }           = useTheme()
  const isDark                       = resolvedTheme === "dark"
  const [isOpen,  setIsOpen, isOtherOpen] = useExclusiveWidget("whatsapp")
  const [visible, setVisible]        = useState(false)
  const [scrolled, setScrolled]      = useState(false)

  // Booking states
  const [name,    setName]           = useState("")
  const [hub,     setHub]            = useState("")
  const [note,    setNote]           = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [phone, setPhone]            = useState("")
  const [step,    setStep]           = useState<"form" | "sent">("form")
  const [hubPicking, setHubPicking]  = useState(false)

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [slots, setSlots] = useState<any[]>([])
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null)

  const nameRef                      = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(NAME_STORAGE_KEY)
      if (saved) setName(saved)
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
    if (isOpen && step === "form") {
      setTimeout(() => nameRef.current?.focus(), 300)
      trackEvent?.("wa_widget_open", { hub })
    }
  }, [isOpen, step])

  useEffect(() => {
    // regenerate slots when hub or date changes
    if (!selectedDate || !hub) { setSlots([]); setSelectedSlotIdx(null); return }
    const s = generateSlotsForDate(hub, selectedDate)
    // apply lead time filter
    const now = new Date()
    const leadMs = WA_BOOKING_CONFIG.leadTimeMinutes * 60 * 1000
    const filtered = s.filter(slot => new Date(slot.isoUTC).getTime() - leadMs > now.getTime())
    setSlots(filtered)
    setSelectedSlotIdx(filtered.length ? 0 : null)
  }, [hub, selectedDate])

  const HUBS = [
    { id: "print",    label: "Print Hub",     hint: "Printing, copying, photos" },
    { id: "doc",      label: "Docu Hub",      hint: "CVs, typing, laminating" },
    { id: "design",   label: "Design Hub",    hint: "Logos, flyers, branding" },
    { id: "eservice", label: "E-Service Hub", hint: "SASSA, SARS, NSFAS, PSIRA" },
    { id: "tech",     label: "Tech Hub",      hint: "PC repairs, software, setup" },
    { id: "other",    label: "Not sure yet",  hint: "We'll help you figure it out" },
  ]

  const isValid = name.trim().length > 1 && deviceModel.trim().length > 1 && hub !== "" && (selectedSlotIdx !== null || true)

  const handleSend = () => {
    if (!isValid) return
    const selectedSlot = selectedSlotIdx !== null ? slots[selectedSlotIdx] : null
    const appointmentLength = WA_BOOKING_CONFIG.appointmentLengthMinutes

    const slotText = selectedSlot
      ? `${selectedSlot.businessLabel} — ${selectedSlot.endBusinessLabel} (SAST) // your local ${selectedSlot.visitorLabel}`
      : "No preferred slot provided"

    const message = [
      `Hi ${BIZ.name}! 👋`,
      `My name is ${name.trim()}.`,
      `I need help with: *${HUBS.find(h=>h.id===hub)?.label ?? hub}*`,
      `Preferred slot: ${selectedSlot ? format(new Date(selectedSlot.isoUTC), "yyyy-MM-dd HH:mm") : "—"} — ${selectedSlot ? format(new Date(new Date(selectedSlot.isoUTC).getTime() + appointmentLength*60000), "HH:mm") : ""} (SAST)`,
      phone.trim() ? `Phone: ${phone.trim()}` : "",
      `Device model: ${deviceModel.trim()}`,
      note.trim() ? `More details: ${note.trim()}` : "",
    ].filter(Boolean).join("\n")

    // try to open wa.me, fallback to clipboard
    try {
      const opened = window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, "_blank")
      if (!opened) throw new Error("popup-blocked")
      setStep("sent")
      trackEvent?.("wa_send", { withSlot: !!selectedSlot })
    } catch (e) {
      try { navigator.clipboard.writeText(message); alert("Message copied to clipboard — paste it into WhatsApp.") } catch { alert("Unable to open WhatsApp. Please copy the message and send it to us on WhatsApp.") }
      trackEvent?.("wa_send_clipboard", { withSlot: !!selectedSlot })
      setStep("sent")
    }
  }

  const DateDivider = ({d}:{d:Date}) => (
    <div className="flex justify-center mb-1"><span className="text-[0.62rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-sm backdrop-blur-md">{format(d, 'EEEE, MMM d')}</span></div>
  )

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[9989] bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      {isOpen && (
        <div className={cn("fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-[9991] md:w-[520px] max-h-[80vh]", "rounded-[20px] shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl")}> 
          <div className="relative flex items-center gap-3.5 px-5 py-5 shrink-0 backdrop-blur-xl">
            <div className="w-11 h-11 rounded-full flex items-center justify-center p-2"><Image src="/logo.png" alt="" width={44} height={44} className="object-contain"/></div>
            <div className="flex-1 min-w-0">
              <h3 className="font-sans font-black text-[0.98rem] leading-tight tracking-tight text-white truncate">{BIZ.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5"><span className="relative flex h-2 w-2 shrink-0"><span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" /></span><p className="text-[0.7rem] font-medium text-white/80">Online · replies within 15 min</p></div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-white/90" aria-label="Close"><X size={18} weight="bold"/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4" style={{ background: isDark ? '#0B141A' : '#E5DDD5' }}>
            <DateDivider d={selectedDate ?? new Date()} />

            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Your name</label>
              <input ref={nameRef} value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 rounded-md" aria-required />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Your phone (optional)</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 rounded-md" />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Device model</label>
              <input value={deviceModel} onChange={e=>setDeviceModel(e.target.value)} className="w-full p-2 rounded-md" aria-required />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Service required</label>
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Printer setup" className="w-full p-2 rounded-md" aria-required />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">What do you need help with?</label>
              <div className="flex gap-2 flex-wrap">
                {HUBS.map(h => (
                  <button key={h.id} onClick={() => { setHub(h.id); setHubPicking(false) }} className={cn("px-3 py-1 rounded-full border", hub===h.id?"bg-green-500 text-white":"bg-transparent")}>{h.label}</button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Choose a preferred date</label>
              <DayPicker mode="single" onSelect={(d:any)=>setSelectedDate(d)} selected={selectedDate ?? undefined} disabled={{ before: new Date() }} />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Available slots (SAST / your local)</label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-auto">
                {slots.length === 0 && <div className="text-sm text-gray-500">No available slots for this date/hub (or within lead time).</div>}
                {slots.map((s, idx) => (
                  <button key={s.isoUTC} onClick={()=>setSelectedSlotIdx(idx)} className={cn("p-2 rounded-md text-left border", selectedSlotIdx===idx?"bg-green-500 text-white":"bg-white text-black") }>
                    <div className="flex justify-between"><div className="font-semibold">{s.businessLabel} — {s.endBusinessLabel} SAST</div><div className="text-sm text-gray-500">{s.visitorLabel}</div></div>
                  </button>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2">Note: these are preferred slots — we will confirm availability by WhatsApp.</div>
            </div>

          </div>

          {step === "form" && (
            <div className="p-4 flex items-center justify-between bg-white/80">
              <div className="text-sm">{isValid ? "Ready to send your message" : "Fill in required fields to continue"}</div>
              <div className="flex gap-2">
                <button onClick={handleSend} disabled={!isValid} className="px-4 py-2 rounded-full bg-green-600 text-white">Send on WhatsApp</button>
              </div>
            </div>
          )}

        </div>
      )}

      <div className={cn("fixed z-[9992] right-4 md:right-6 bottom-6", !visible && "opacity-0 pointer-events-none")}>
        <div className="flex items-center justify-end gap-2">
          <span className="text-[0.65rem] font-black uppercase tracking-widest bg-white text-[#25D366] px-2.5 py-1 rounded-full">Chat</span>
          <button onClick={()=>setIsOpen(o=>!o)} aria-label={`Chat with ${BIZ.name} on WhatsApp`} className="relative w-14 h-14 flex items-center justify-center">
            <WhatsappLogo size={32} weight="fill" style={{ color: '#25D366' }} />
          </button>
        </div>
      </div>
    </>
  )
}
