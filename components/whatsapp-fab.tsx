"use client"

import { useState, useEffect, useRef } from "react"
import { WhatsappLogo } from "@phosphor-icons/react"
import { BIZ, WA } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function WhatsAppFAB() {
  const [scrolled,  setScrolled]  = useState(false)
  const [visible,   setVisible]   = useState(false)
  const scrollTimer               = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fade while scrolling, same pattern as calculator FAB
  useEffect(() => {
    const onScroll = () => {
      setScrolled(true)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => setScrolled(false), 200)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

  // Mount with a short delay so it doesn't pop in immediately on page load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <a
      href={WA.general}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${BIZ.name} on WhatsApp`}
      title="Chat with us on WhatsApp"
      className={cn(
        // Stacks above the calculator FAB (bottom-6 = 24px, h-14 = 56px, gap = 12px → bottom-24)
        "fixed bottom-[5.5rem] right-6 z-[9990]",
        "w-14 h-14 rounded-full flex items-center justify-center",
        "text-white shadow-xl",
        "transition-all duration-300 active:scale-95 hover:-translate-y-0.5",
        // Pulse ring
        "ring-0",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        scrolled ? "opacity-40" : "opacity-100",
      )}
      style={{ backgroundColor: "#25D366" }}
    >
      {/* Animated pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#25D366]" />
      <WhatsappLogo size={28} weight="fill" />
    </a>
  )
}
