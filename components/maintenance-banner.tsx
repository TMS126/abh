// components/maintenance-banner.tsx
"use client"

import { useEffect, useState } from "react"
import { Wrench, X } from "@phosphor-icons/react"
import { MAINTENANCE_BANNER } from "@/lib/brand"

const DISMISS_KEY = `abh-maintenance-dismissed-v${MAINTENANCE_BANNER.version}`

export function MaintenanceBanner() {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1")
    } catch {
      // localStorage unavailable (private browsing, etc.) — default to showing the banner
    }
  }, [])

  const visible = MAINTENANCE_BANNER.active && mounted && !dismissed

  // Drives the shared --banner-h / --nav-h CSS variables (see globals.css)
  // so the header shifts down and every page's existing top padding grows
  // to match — no other file needs to know the banner exists.
  useEffect(() => {
    document.documentElement.classList.toggle("banner-active", visible)
    return () => { document.documentElement.classList.remove("banner-active") }
  }, [visible])

  if (!visible) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      // ignore — worst case the banner just reappears next visit
    }
  }

  return (
    <div
      role="region"
      aria-label="Site notice"
      className="fixed inset-x-0 top-0 z-[10000] flex items-center justify-center gap-3 px-4 py-2.5 text-white text-sm md:text-[0.92rem] font-medium shadow-md animate-in fade-in slide-in-from-top-2 duration-500"
      style={{ background: "linear-gradient(90deg, var(--brand-blue-dark) 0%, var(--brand-blue) 100%)" }}
    >
      <Wrench size={16} weight="fill" className="shrink-0 hidden sm:block opacity-90" aria-hidden="true" />
      <p className="flex-1 min-w-0 text-center leading-snug">
        {MAINTENANCE_BANNER.message}{" "}
        <a
          href={MAINTENANCE_BANNER.linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 font-bold whitespace-nowrap hover:text-white/90 transition-colors"
        >
          {MAINTENANCE_BANNER.linkText}
        </a>
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notice"
        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/15 active:scale-90 transition-all"
      >
        <X size={14} weight="bold" />
      </button>
    </div>
  )
}
