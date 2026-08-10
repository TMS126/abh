// components/business-status.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Clock } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { getBusinessStatus, type BusinessStatus } from "@/lib/sa-time"

interface HubStatus {
  open: boolean
  label: string
  nextEvent: string
  holidayNote?: string
}

// Maps the shared getBusinessStatus() output onto this component's
// existing pill shape, instead of duplicating hour-checking logic here
// like before. Holiday awareness comes through automatically:
// techDesignEservice closes entirely on public holidays (per
// HOURS.techDesignEservice in lib/brand.ts), while printAndDoc stays
// open every day including holidays — getBusinessStatus already encodes
// both rules; this just adds a small explanatory note for the holiday
// case on printAndDoc, since "Open" alone doesn't explain why it's still
// open on a day that's usually a red flag for "closed."
function deriveHubStatuses(status: BusinessStatus): { printDoc: HubStatus; techEtc: HubStatus } {
  const printDoc: HubStatus = {
    open: status.printAndDoc.open,
    label: "Print & Docu",
    nextEvent: status.printAndDoc.label,
    holidayNote: status.isHoliday ? `Today is ${status.holidayName} — still open as usual` : undefined,
  }
  const techEtc: HubStatus = {
    open: status.techDesignEservice.open,
    label: "Tech · Design · E-Service",
    nextEvent: status.techDesignEservice.label,
  }
  return { printDoc, techEtc }
}

function StatusPill({ status }: { status: HubStatus }) {
  return (
    <div
      className={cn(
        "inline-flex flex-col gap-1 px-2.5 py-1.5 rounded-2xl border text-[0.74rem] font-bold tracking-wide",
        status.open
          ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          : "bg-zinc-50  dark:bg-zinc-900     border-zinc-200  dark:border-zinc-700  text-zinc-500  dark:text-zinc-400"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              status.open ? "bg-green-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600"
            )}
          />
          <span className="font-black">{status.label}</span>
          <span className="font-normal opacity-70">{status.open ? "Open" : "Closed"}</span>
        </span>
        <span className="opacity-40">·</span>
        <span className="shrink-0">{status.nextEvent}</span>
      </div>
      {status.holidayNote && <p className="text-[0.68rem] font-medium opacity-70">{status.holidayNote}</p>}
    </div>
  )
}

export function BusinessStatusNavbar() {
  const [status, setStatus] = useState<BusinessStatus | null>(null)
  const [expanded, setExpanded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  function refresh() {
    setStatus(getBusinessStatus())
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

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

  if (!status) return null
  const { printDoc, techEtc } = deriveHubStatuses(status)

  const anyOpen = printDoc.open || techEtc.open
  const bothOpen = printDoc.open && techEtc.open

  const clockColor = bothOpen
    ? "text-green-500 dark:text-green-400"
    : anyOpen
      ? "text-brand-orange"
      : "text-zinc-400 dark:text-zinc-500"

  return (
    <div ref={wrapperRef} className="hidden md:flex items-center gap-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label="Show business hours"
        className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform"
      >
        <Clock size={18} weight="fill" className={clockColor} />
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-in-out flex items-center gap-1.5"
        style={{
          maxWidth: expanded ? "460px" : "0px",
          opacity: expanded ? 1 : 0,
          marginLeft: expanded ? "8px" : "0px",
        }}
      >
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.74rem] font-bold whitespace-nowrap",
            printDoc.open
              ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", printDoc.open ? "bg-green-500 animate-pulse" : "bg-zinc-400 dark:bg-zinc-600")} />
          <span className="font-black">{printDoc.label}</span>
          <span className="opacity-70 font-normal">{printDoc.open ? "Open" : "Closed"}</span>
          <span className="opacity-40">·</span>
          <span>{printDoc.nextEvent}</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.74rem] font-bold whitespace-nowrap",
            techEtc.open
              ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
              : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
          )}
        >
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

export function BusinessStatusFull() {
  const [status, setStatus] = useState<BusinessStatus | null>(null)

  function refresh() {
    setStatus(getBusinessStatus())
  }

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!status) return null
  const { printDoc, techEtc } = deriveHubStatuses(status)

  return (
    <div className="flex flex-col gap-2">
      <StatusPill status={printDoc} />
      <StatusPill status={techEtc} />
    </div>
  )
    } 
