// lib/sa-time.ts
// Single source of truth for "is ApexbytesHub open right now" — SAST-aware,
// SA-public-holiday-aware, and computed (not hardcoded) so it never needs
// yearly updates. Every component that needs business status (Contact's
// status panel, WhatsApp message prefixes, hero time-of-day copy) should
// call getBusinessStatus() from here rather than duplicating hour logic.

// ─── SAST time helpers ─────────────────────────────────────────────────
// South Africa has no daylight saving — SAST is a fixed UTC+2 year-round,
// so this never needs a timezone library or DST table.
const SAST_OFFSET_MINUTES = 2 * 60

export function getSASTNow(): Date {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utcMs + SAST_OFFSET_MINUTES * 60000)
}

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

// ─── SA Public Holidays — computed, not hardcoded ───────────────────────
// Generates the correct list for ANY year automatically — no yearly
// maintenance needed. Two moving parts:
// 1. Easter Sunday is calculated via the Anonymous Gregorian algorithm
//    (a standard, well-tested formula) — Good Friday and Family Day are
//    then derived as fixed offsets from it (-2 days, +1 day).
// 2. Fixed-date holidays that fall on a Sunday automatically roll to the
//    following Monday, per South Africa's Public Holidays Act — computed
//    per-year rather than hardcoded as a separate date.
function calculateEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function withSundayRollover(date: Date, name: string): { date: string; name: string }[] {
  const entries = [{ date: fmtDate(date), name }]
  if (date.getDay() === 0) {
    entries.push({ date: fmtDate(addDays(date, 1)), name: `${name} (observed)` })
  }
  return entries
}

function generateSAHolidays(year: number): { date: string; name: string }[] {
  const easterSunday = calculateEasterSunday(year)
  const goodFriday = addDays(easterSunday, -2)
  const familyDay = addDays(easterSunday, 1)

  return [
    ...withSundayRollover(new Date(year, 0, 1), "New Year's Day"),
    ...withSundayRollover(new Date(year, 2, 21), "Human Rights Day"),
    { date: fmtDate(goodFriday), name: "Good Friday" },
    { date: fmtDate(familyDay), name: "Family Day" },
    ...withSundayRollover(new Date(year, 3, 27), "Freedom Day"),
    ...withSundayRollover(new Date(year, 4, 1), "Workers' Day"),
    ...withSundayRollover(new Date(year, 5, 16), "Youth Day"),
    ...withSundayRollover(new Date(year, 7, 9), "National Women's Day"),
    ...withSundayRollover(new Date(year, 8, 24), "Heritage Day"),
    ...withSundayRollover(new Date(year, 11, 16), "Day of Reconciliation"),
    ...withSundayRollover(new Date(year, 11, 25), "Christmas Day"),
    ...withSundayRollover(new Date(year, 11, 26), "Day of Goodwill"),
  ]
}

const holidayCache = new Map<number, { date: string; name: string }[]>()

export function getHolidayFor(date: Date): { date: string; name: string } | null {
  const year = date.getFullYear()
  if (!holidayCache.has(year)) {
    holidayCache.set(year, generateSAHolidays(year))
  }
  const key = fmtDate(date)
  return holidayCache.get(year)!.find((h) => h.date === key) ?? null
}

export function isPublicHoliday(date: Date = getSASTNow()): boolean {
  return getHolidayFor(date) !== null
}

// ─── Business status ─────────────────────────────────────────────────
// Mirrors the two hub groupings from HOURS in lib/brand.ts:
// - printAndDoc: Mon–Sun 07:00–20:00, open on public holidays
// - techDesignEservice: Mon–Fri 09:00–17:00, Sat 09:00–12:00, closed
//   Sun & public holidays
export type BusinessStatus = {
  isHoliday: boolean
  holidayName: string | null
  printAndDoc: { open: boolean; label: string }
  techDesignEservice: { open: boolean; label: string }
  greeting: "morning" | "afternoon" | "evening" | "night"
}

export function getBusinessStatus(now: Date = getSASTNow()): BusinessStatus {
  const day = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const minutesNow = hour * 60 + minute

  const holiday = getHolidayFor(now)
  const isHoliday = holiday !== null

  const printOpenWindow = minutesNow >= 7 * 60 && minutesNow < 20 * 60
  const printAndDocOpen = printOpenWindow
  const printAndDocLabel = printAndDocOpen
    ? "Open now · closes 20:00"
    : minutesNow < 7 * 60
      ? "Opens today at 07:00"
      : "Closed for today · opens 07:00"

  let techOpen = false
  let techLabel = "Closed"
  if (isHoliday) {
    techLabel = `Closed — ${holiday!.name}`
  } else if (day === 0) {
    techLabel = "Closed — open again Monday"
  } else if (day >= 1 && day <= 5) {
    techOpen = minutesNow >= 9 * 60 && minutesNow < 17 * 60
    techLabel = techOpen
      ? "Open now · closes 17:00"
      : minutesNow < 9 * 60
        ? "Opens today at 09:00"
        : "Closed for today · opens 09:00 tomorrow"
  } else if (day === 6) {
    techOpen = minutesNow >= 9 * 60 && minutesNow < 12 * 60
    techLabel = techOpen
      ? "Open now · closes 12:00"
      : minutesNow < 9 * 60
        ? "Opens today at 09:00"
        : "Closed for the weekend · opens Monday 09:00"
  }

  const greeting: BusinessStatus["greeting"] =
    hour < 5 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : hour < 22 ? "evening" : "night"

  return {
    isHoliday,
    holidayName: holiday?.name ?? null,
    printAndDoc: { open: printAndDocOpen, label: printAndDocLabel },
    techDesignEservice: { open: techOpen, label: techLabel },
    greeting,
  }
}

// ─── WhatsApp message helper ─────────────────────────────────────────
// Prepends a short status line to any WhatsApp message when relevant, so
// a message sent outside hours or on a holiday already sets the right
// expectation instead of needing a manual reply first.
export function withStatusPrefix(message: string, now: Date = getSASTNow()): string {
  const status = getBusinessStatus(now)
  if (status.isHoliday) {
    return `[Sent on ${status.holidayName} — we'll reply as soon as we're back] ${message}`
  }
  if (!status.printAndDoc.open && !status.techDesignEservice.open) {
    return `[Sent outside business hours — we'll reply first thing] ${message}`
  }
  return message
}
