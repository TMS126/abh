"use client"

import { useEffect, useRef } from "react"
import { NAV_ITEMS, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  pathname: string
  navigate: (path: string) => void
  neutralColor: string
}

export function MobileMenu({ menuOpen, setMenuOpen, pathname, navigate, neutralColor }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // ── Accessibility: this is a full-screen takeover, so treat it like a
  // dialog — move focus in on open, restore it on close, trap Tab inside,
  // and let Escape close it (mirrors the pattern used by the other modals
  // across the site, e.g. services-page/shared.tsx's useFocusTrap). ──
  useEffect(() => {
    if (!menuOpen) return
    previouslyFocused.current = document.activeElement as HTMLElement
    containerRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); return }
      if (e.key !== "Tab" || !containerRef.current) return
      const focusable = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]; const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [menuOpen, setMenuOpen])

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      aria-hidden={!menuOpen}
      tabIndex={-1}
      className={cn("fixed inset-0 z-[9998] md:hidden transition-opacity duration-300 outline-none", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
    >
      <div
        className={cn("absolute -inset-[50%] transition-opacity duration-700", menuOpen ? "opacity-100 animate-[spin_16s_linear_infinite]" : "opacity-0")}
        style={{ background: "conic-gradient(from 0deg, rgba(30,111,168,0.18), rgba(111,191,26,0.16), rgba(244,162,97,0.16), rgba(30,111,168,0.18))" }}
      />
      <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
        <nav className="w-full max-w-[320px] flex flex-col items-center gap-2.5">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = pathname === item.path

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                tabIndex={menuOpen ? 0 : -1}
                style={{
                  transitionDelay: menuOpen ? `${idx * 60}ms` : "0ms",
                  ...(isActive ? { backgroundColor: BRAND.blue, color: "#ffffff" } : {}),
                }}
                className={cn(
                  "relative py-3 px-8 rounded-[14px] font-sans text-[1.2rem] transition-all duration-300 active:scale-95 text-center w-[180px] shadow-sm overflow-hidden",
                  isActive ? "font-semibold" : "font-medium text-zinc-700 dark:text-zinc-100 hover:text-brand-blue dark:hover:text-brand-blue bg-transparent",
                  item.isCta && !isActive && "border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
                  menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 -translate-x-1/2 bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: BRAND.green }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div
        className={cn(
          "absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center select-none transition-all duration-500 z-10",
          menuOpen ? "opacity-30" : "opacity-0"
        )}
        aria-hidden="true"
      >
        <div
          className="relative w-8 h-8 shrink-0 transition-colors duration-300"
          style={{
            backgroundColor: neutralColor,
            WebkitMaskImage: "url(/logo.png)",
            maskImage: "url(/logo.png)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      </div>
    </div>
  )
} 