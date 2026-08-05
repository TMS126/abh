// Utilities for generating booking slots based on a fixed SAST (UTC+2) business timezone.
// Assumes SAST is always UTC+2 (no DST). Keeps everything client-side and avoids external tz libs.

import { WA_BOOKING_CONFIG } from "./wa-booking-config"

function parseHM(time: string) {
  const [hh, mm] = time.split(":").map(Number)
  return hh * 60 + mm
}

function pad(n: number) { return n.toString().padStart(2, "0") }

export function generateSlotsForDate(hubId: string, date: Date) {
  const cfg = WA_BOOKING_CONFIG
  const ranges = cfg.hubAvailability[hubId] ?? cfg.hubAvailability.other
  const appointment = cfg.appointmentLengthMinutes
  const step = cfg.slotGranularityMinutes
  const slots: Array<{
    businessLabel: string // HH:MM (SAST)
    visitorLabel: string // HH:MM (visitor local)
    isoUTC: string // ISO timestamp for the slot start in UTC
    endBusinessLabel: string // HH:MM (SAST)
  }> = []

  // Business timezone offset for SAST is +2 hours from UTC
  const SAST_OFFSET_HOURS = 2

  const year = date.getFullYear()
  const month = date.getMonth() // 0-based
  const day = date.getDate()

  const visitorTZ = Intl.DateTimeFormat().resolvedOptions().timeZone

  for (const r of ranges) {
    const startMin = parseHM(r.start)
    const endMin = parseHM(r.end)

    for (let m = startMin; m + appointment <= endMin; m += step) {
      const hh = Math.floor(m / 60)
      const mm = m % 60
      // Create a UTC Date for the business-local time by subtracting SAST offset
      const utcTs = Date.UTC(year, month, day, hh - SAST_OFFSET_HOURS, mm)
      const startUtc = new Date(utcTs)
      // End time (business local)
      const endTotal = m + appointment
      const eh = Math.floor(endTotal / 60)
      const em = endTotal % 60
      const endUtcTs = Date.UTC(year, month, day, eh - SAST_OFFSET_HOURS, em)
      const endUtc = new Date(endUtcTs)

      const businessLabel = `${pad(hh)}:${pad(mm)}`
      const endBusinessLabel = `${pad(eh)}:${pad(em)}`
      const visitorLabel = startUtc.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

      slots.push({ businessLabel, visitorLabel, isoUTC: startUtc.toISOString(), endBusinessLabel })
    }
  }

  return slots
}
