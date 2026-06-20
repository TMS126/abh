"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

// ─── SAST helpers ──────────────────────────────────────────────────────────────
// All times are in SAST (UTC+2). We convert the user's local time to SAST
// so the indicator is always correct regardless of where the visitor is.

function getSASTDate(): Date {
  const now  = new Date()
  const utc  = now.getTime() + now.getTimezoneOffset() * 60_000
  return new Date(utc + 2 * 60 * 60 * 1000) // UTC+2
}

function getSASTHour(): number {
  const d = getSASTDate()
  return d.getHours() + d.getMinutes() / 60
}

// 0 = Sunday … 6 = Saturday
function getSASTDay(): number {
  return getSASTDate().getDay()
}

// ─── Opening logic ────────────────────────────────────────────────────────────
// Print & Docu: Mon–Sun 07:00–20:00, including holidays
// Tech / Design / E-Service: Mon–Fri 09:00–17:00, Sat 09:00–12:00, Sun closed

interface HubStatus {
  open:      boolean
  label:     string         // e.g. "Print & Docu"
  nextEvent: string         // e.g. "Closes at 20:00" or "Opens Mon at 09:00"
}

function getPrintDocStatus(): HubStatus {
  const hour = getSASTHour()
  const open = hour >= 7 && hour < 20
  const label = "Print & Docu"

  if (open) {
    return { open: true, label, nextEvent: "Closes at 20:00" }
  }

  // Closed — find next opening
  if (hour < 7) {
    return { open: false, label, nextEvent: "Opens today at 07:00" }
  }
  // Past 20:00 — opens tomorrow at 07:00 (every day)
  return { open: false, label, nextEvent: "Opens tomorrow at 07:00" }
}

function getTechDesignStatus(): HubStatus {
  const hour = getSASTHour()
  const day  = getSASTDay() // 0=Sun, 1=Mon … 6=Sat
  const label = "Tech · Design · E-Service"

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Sunday — always closed
  if (day === 0) {
    return { open: false, label, nextEvent: "Opens Monday at 09:00" }
  }

  // Saturday — 09:00–12:00
  if (day === 6) {
    if (hour >= 9 && hour < 12)  return { open: true,  label, nextEvent: "Closes at 12:00" }
    if (hour < 9)                return { open: false, label, nextEvent: "Opens today at 09:00" }
    return { open: false, label, nextEvent: "Opens Monday at 09:00" }
  }

  // Mon–Fri — 09:00–17:00
  if (hour >= 9 && hour < 17) return { open: true, label, nextEvent: "Closes at 17:00" }
  if (hour < 9)               return { open: false, label, nextEvent: "Opens today at 09:00" }

  // Past 17:00 on a weekday — find next opening day
  if (day === 5) {
    // Friday evening — next is Saturday
    return { open: false, label, nextEvent: "Opens Saturday at 09:00" }
  }
  const nextDay = DAY_NAMES[day + 1]
  return { open: false, label, nextEvent: `Opens ${nextDay} at 09:00` }
}

// ─── Single hub status pill ───────────────────────────────────────────────────
function StatusPill({
  status,
  compact = false,
}: {
  status:   HubStatus
  compact?: boolean
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[0.62rem] font-bold tracking-wide whitespace-nowrap",
      status.open
        ? "bg-green-50  dark:bg-green-950/40 border-green-200  dark:border-green-800  text-green-700  dark:text-green-400"
        : "bg-zinc-50   dark:bg-zinc-900     border-zinc-200   dark:border-zinc-700   text-zinc-500   dark:text-zinc-400"
    )}>
      {/* Dot — pulses when open */}
      <span className={cn(
        "w-1.5 h-1.5 rounded-full shrink-0",
        status.open ? "bg-green-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"
      )} />

      {!compact && (
        <span className="font-black">{status.label}</span>
      )}

      <span className={cn(!compact && "font-normal opacity-70")}>
        {status.open ? "Open" : "Closed"}
      </span>

      {!compact && (
        <>
          <span className="opacity-40">·</span>
          <span>{status.nextEvent}</span>
        </>
      )}
    </div>
  )
}

// ─── Navbar variant — compact, horizontal pills ───────────────────────────────
// Drop <BusinessStatusNavbar /> inside your navbar, near the theme toggle
export function BusinessStatusNavbar() {
  const [printDoc,  setPrintDoc]  = useState<HubStatus | null>(null)
  const [techEtc,   setTechEtc]   = useState<HubStatus | null>(null)

  function refresh() {
    setPrintDoc(getPrintDocStatus())
    setTechEtc(getTechDesignStatus())
  }

  useEffect(() => {
    refresh()
    // Re-evaluate every 60 seconds so it auto-updates without a page reload
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!printDoc || !techEtc) return null

  return (
    <div className="hidden md:flex items-center gap-1.5">
      <StatusPill status={printDoc} compact />
      <StatusPill status={techEtc}  compact />
    </div>
  )
}

// ─── Footer / Contact variant — full pills with label + next event ────────────
// Drop <BusinessStatusFull /> anywhere you want the detailed view
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
