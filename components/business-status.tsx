"use client"

import { useState, useEffect, useRef } from "react"
import { Clock } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

// ─── SAST helpers ──────────────────────────────────────────────────────────────
function getSASTDate(): Date {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000
  return new Date(utc + 2 * 60 * 60 * 1000)
}

function getSASTHour(): number {
  const d = getSASTDate()
  return d.getHours() + d.getMinutes() / 60
}

function getSASTDay(): number {
  return getSASTDate().getDay()
}

// ─── Opening logic ────────────────────────────────────────────────────────────
interface HubStatus {
  open:      boolean
  label:     string
  nextEvent: string
}

function getPrintDocStatus(): HubStatus {
  const hour = getSASTHour()
  const label = "Print & Docu"
  if (hour >= 7 && hour < 20) return { open: true, label, nextEvent: "Closes at 20:00" }
  if (hour < 7)               return { open: false, label, nextEvent: "Opens today at 07:00" }
  return { open: false, label, nextEvent: "Opens tomorrow at 07:00" }
}

function getTechDesignStatus(): HubStatus {
  const hour = getSASTHour()
  const day  = getSASTDay()
  const label = "Tech · Design · E-Service"
  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

  if (day === 0) return { open: false, label, nextEvent: "Opens Monday at 09:00" }
  if (day === 6) {
    if (hour >= 9 && hour < 12) return { open: true, label, nextEvent: "Closes at 12:00" }
    if (hour < 9)               return { open: false, label, nextEvent: "Opens today at 09:00" }
    return { open: false, label, nextEvent: "Opens Monday at 09:00" }
  }
  if (hour >= 9 && hour < 17) return { open: true, label, nextEvent: "Closes at 17:00" }
  if (hour < 9)               return { open: false, label, nextEvent: "Opens today at 09:00" }
  if (day === 5)              return { open: false, label, nextEvent: "Opens Saturday at 09:00" }
  return { open: false, label, nextEvent: `Opens ${DAY_NAMES[day + 1]} at 09:00` }
}

// ─── Full status pill (footer / contact) ──────────────────────────────────────
function StatusPill({ status }: { status: HubStatus }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.62rem] font-bold tracking-wide whitespace-nowrap",
      status.open
        ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
        : "bg-zinc-50  dark:bg-zinc-900     border-zinc-200  dark:border-zinc-700  text-zinc-500  dark:text-zinc-400"
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        status.open ? "bg-green-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"
      )} />
      <span className="font-black">{status.label}</span>
      <span className="font-normal opacity-70">{status.open ? "Open" : "Closed"}</span>
      <span className="opacity-40">·</span>
      <span>{status.nextEvent}</span>
    </div>
  )
}

// ─── Navbar variant ───────────────────────────────────────────────────────────
// A clock icon button that reflects the overall open/closed state via color.
// Click it to slide the two status pills open; click anywhere else to close.
// Mirrors the same expand/collapse animation as the logo pill.
export function BusinessStatusNavbar() {
  const [printDoc,  setPrintDoc]  = useState<HubStatus | null>(null)
  const [techEtc,   setTechEtc]   = useState<HubStatus | null>(null)
  const [expanded,  setExpanded]  = useState(false)
  const wrapperRef                = useRef<HTMLDivElement>(null)

  function refresh() {
    setPrintDoc(getPrintDocStatus())
    setTechEtc(getTechDesignStatus())
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

  // Close on outside click — same pattern as the logo timeout
  useEffect(() => {
    if (!expanded) return
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [expanded])

  if (!printDoc || !techEtc) return null

  // Both hubs open → green; any closed → zinc/neutral
  const anyOpen   = printDoc.open || techEtc.open
  const bothOpen  = printDoc.open && techEtc.open

  const clockColor = bothOpen
    ? "text-green-500 dark:text-green-400"
    : anyOpen
      ? "text-brand-orange"
      : "text-zinc-400 dark:text-zinc-500"

  return (
    <div ref={wrapperRef} className="hidden md:flex items-center gap-0">
      {/* Clock trigger */}
      <button
        onClick={() => setExpanded(v => !v)}
        aria-label="Show business hours"
        className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform"
      >
        <Clock size={18} weight="fill" className={clockColor} />
      </button>

      {/* Sliding status pills — same max-width trick as the logo text */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out flex items-center gap-1.5"
        style={{
          maxWidth:  expanded ? "440px" : "0px",
          opacity:   expanded ? 1 : 0,
          marginLeft: expanded ? "8px" : "0px",
        }}
      >
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.62rem] font-bold whitespace-nowrap",
          printDoc.open
            ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", printDoc.open ? "bg-green-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600")} />
          <span className="font-black">{printDoc.label}</span>
          <span className="opacity-70 font-normal">{printDoc.open ? "Open" : "Closed"}</span>
          <span className="opacity-40">·</span>
          <span>{printDoc.nextEvent}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.62rem] font-bold whitespace-nowrap",
          techEtc.open
            ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", techEtc.open ? "bg-green-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600")} />
          <span className="font-black">{techEtc.label}</span>
          <span className="opacity-70 font-normal">{techEtc.open ? "Open" : "Closed"}</span>
          <span className="opacity-40">·</span>
          <span>{techEtc.nextEvent}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Footer / Contact variant — full pills with label + next event ─────────────
export function BusinessStatusFull() {
  const [printDoc, setPrintDoc] = useState<HubStatus | null>(null)
  const [techEtc,  setTechEtc]  = useState<HubStatus | null>(null)

  function refresh() {
    setPrintDoc(getPrintDocStatus())
    setTechEtc(getTechDesignStatus())
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!printDoc || !techEtc) return null

  return (
    <div className="flex flex-col gap-2">
      <StatusPill status={printDoc} />
      <StatusPill status={techEtc}  />
    </div>
  )
}
 
