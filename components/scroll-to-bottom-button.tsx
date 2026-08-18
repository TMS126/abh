// components/scroll-to-bottom-button.tsx
// New — mirrors back-to-top-button.tsx exactly, inverted: appears while
// there's still meaningful distance left to scroll, hides once the person
// is within `threshold` of the actual bottom of the page. Sits near the
// top of the viewport (under the fixed navbar) rather than at the bottom,
// so it never overlaps BackToTopButton, which occupies the bottom of the
// screen on every page that uses it.
"use client"

import { useState, useEffect } from "react"
import { ArrowDown } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function ScrollToBottomButton({
  visible,
  topClass = "top-[calc(var(--nav-h,74px)+1rem)]",
  className,
}: {
  visible: boolean
  topClass?: string
  className?: string
}) {
  return (
    <button
      onClick={() =>
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
      }
      aria-label="Scroll to bottom"
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-[9990] w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105",
        topClass,
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-4 pointer-events-none",
        className
      )}
    >
      <ArrowDown size={20} weight="bold" className="text-brand-blue dark:text-brand-light-blue" />
    </button>
  )
}

// Visible whenever there's more than `threshold` px left to scroll before
// hitting the bottom of the document — the mirror image of useBackToTop's
// condition (which fires once you've scrolled past `threshold` px from
// the top).
export function useScrollToBottom(threshold = 600) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const distanceToBottom =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      setVisible(distanceToBottom > threshold)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [threshold])
  return visible
}
