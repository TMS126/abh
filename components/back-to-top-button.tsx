// components/back-to-top-button.tsx
// Shared scroll-to-top button — previously copy-pasted identically across
// contact-page.tsx, services-page/index.tsx, about-page.tsx, and
// gallery-page.tsx. bottomClass lets contact-page clear its sticky mobile
// WhatsApp bar; every other page uses the default.
"use client"

import { ArrowUp } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function BackToTopButton({
  visible,
  bottomClass = "bottom-6",
  className,
}: {
  visible: boolean
  bottomClass?: string
  className?: string
}) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed left-4 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
        bottomClass,
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <ArrowUp size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
    </button>
  )
}

// Shared visibility hook — same 600px threshold + passive scroll listener
// every page re-implemented on its own.
export function useBackToTop(threshold = 600) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])
  return visible
}

import { useState, useEffect } from "react"
