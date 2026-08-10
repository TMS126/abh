// lib/weather.ts
// Lightweight current-weather fetch for Bothaville (ApexbytesHub's home
// town), used to give the hero's status icon a small "feels real" touch —
// the icon reflects actual current weather + time of day, not just a
// generic dot. Open-Meteo is free and keyless, and since the business has
// one fixed location, no browser geolocation permission is needed either.

const BOTHAVILLE_LAT = -27.66
const BOTHAVILLE_LON = 26.58

export type WeatherCategory =
  | "clear-day" | "clear-night"
  | "partly-cloudy-day" | "partly-cloudy-night"
  | "cloudy" | "fog"
  | "rain" | "thunderstorm" | "snow"

export interface WeatherSnapshot {
  category: WeatherCategory
}

// Maps WMO weather codes (used by Open-Meteo) to a small icon category
// set. Full WMO code table: https://open-meteo.com/en/docs
function categorize(code: number, isDay: boolean): WeatherCategory {
  if (code === 0) return isDay ? "clear-day" : "clear-night"
  if (code === 1 || code === 2) return isDay ? "partly-cloudy-day" : "partly-cloudy-night"
  if (code === 3) return "cloudy"
  if (code === 45 || code === 48) return "fog"
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain"
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow"
  if ([95, 96, 99].includes(code)) return "thunderstorm"
  return isDay ? "clear-day" : "clear-night"
}

const CACHE_KEY = "abh-weather-cache-v1"
const CACHE_TTL_MS = 30 * 60 * 1000 // 30 min — weather doesn't need second-fresh accuracy

export async function getWeatherSnapshot(): Promise<WeatherSnapshot | null> {
  try {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as { category: WeatherCategory; ts: number }
        if (Date.now() - parsed.ts < CACHE_TTL_MS) return { category: parsed.category }
      }
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${BOTHAVILLE_LAT}&longitude=${BOTHAVILLE_LON}&current=weather_code,is_day`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const code = data?.current?.weather_code
    const isDay = data?.current?.is_day === 1
    if (typeof code !== "number") return null

    const category = categorize(code, isDay)

    if (typeof window !== "undefined") {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ category, ts: Date.now() }))
    }

    return { category }
  } catch {
    return null // network failure — caller falls back to a time-of-day-only icon
  }
  }
