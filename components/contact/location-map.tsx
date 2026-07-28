// ─────────────────────────────────────────────────────────────────────────
// LocationMap — embedded OSM map with a static fallback card if it fails
// ─────────────────────────────────────────────────────────────────────────
"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "@phosphor-icons/react"
import { BRAND, BIZ } from "@/lib/brand"
import { MAP_EMBED_SRC, MAP_LOAD_TIMEOUT_MS } from "@/lib/contact-data"

export function LocationMap() {
  const [blocked, setBlocked] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    // If the iframe hasn't confirmed a successful load by the timeout,
    // assume it's blocked/failed and switch to the fallback card. The
    // previous version's updater (`(wasSet) => wasSet`) was a no-op and
    // never actually flipped this — fixed by setting `true` directly,
    // and only when loadedRef hasn't already been marked successful.
    const timer = setTimeout(() => {
      if (!loadedRef.current) setBlocked(true)
    }, MAP_LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [])

  const handleLoad = () => {
    loadedRef.current = true
  }

  if (blocked) {
    return (
      <div
        className="w-full h-[260px] flex flex-col items-center justify-center gap-3 bg-zinc-100 dark:bg-zinc-900 text-center px-6"
        role="img"
        aria-label="Map preview unavailable"
      >
        <MapPin size={32} weight="fill" className="text-zinc-400" aria-hidden="true" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Map preview unavailable — view it directly instead.
        </p>
        <a
          href={BIZ.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold underline"
          style={{ color: BRAND.blue }}
        >
          Open in Google Maps
        </a>
      </div>
    )
  }

  return (
    <iframe
      src={MAP_EMBED_SRC}
      title="ApexbytesHub location map"
      width="100%"
      height="260"
      style={{ border: 0, display: "block" }}
      loading="lazy"
      onLoad={handleLoad}
      onError={() => setBlocked(true)}
    />
  )
}