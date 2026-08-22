// components/navbar/mobile-menu.tsx
"use client"

import { useEffect, useRef } from "react"
import { NAV_ITEMS, BRAND, TOKEN } from "@/lib/brand"
import { cn } from "@/lib/utils"

// FIX: was a hardcoded "#F4A261" duplicated from navbar.tsx via a
// "keep in sync" comment. That hex is the OLD, WCAG-failing --brand-orange
// value (documented in globals.css as "was #F4A261 at 2.06:1") — still
// failing here as both text color AND border color (border also needs
// ≥3:1 for non-text UI components, which 2.06:1 fails too). Now imports
// the same verified TOKEN.orangeText used in navbar.tsx directly, so
// there's a real single source of truth instead of a manually-synced copy.
const HOVER_TEXT = TOKEN.orangeText

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

            if (item.isCta) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={menuOpen ? 0 : -1}
                  style={{
                    transitionDelay: menuOpen ? `${idx * 60}ms` : "0ms",
                    backgroundColor: BRAND.blue,
                    color: "#ffffff",
                  }}
                  className={cn(
                    "py-3 px-8 rounded-[14px] font-sans text-[1.2rem] font-semibold transition-all duration-300 active:scale-95 text-center w-[180px] shadow-sm",
                    menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                >
                  {item.label}
                </button>
              )
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={isActive ? "page" : undefined}
                tabIndex={menuOpen ? 0 : -1}
                style={{
                  transitionDelay: menuOpen ? `${idx * 60}ms` : "0ms",
                  color: isActive ? HOVER_TEXT : neutralColor,
                  borderColor: isActive ? HOVER_TEXT : "transparent",
                }}
                className={cn(
                  "py-3 px-8 rounded-[14px] font-sans text-[1.2rem] border-2 bg-transparent transition-all duration-300 active:scale-95 text-center w-[180px] shadow-sm",
                  isActive ? "font-semibold" : "font-medium",
                  menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}
              >
                {item.label}
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
        <img
          src="/logo.png"
          alt=""
          className="relative w-8 h-8 shrink-0 object-contain transition-[filter] duration-300"
          style={{ filter: "brightness(0) invert(1) contrast(0.6)" }}
        />
      </div>
    </div>
  )
    }
