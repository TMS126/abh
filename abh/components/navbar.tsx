"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Sun, Moon, CaretLeft } from "@phosphor-icons/react"
import { BRAND, BIZ, NAV_ITEMS } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useInstanceGuard } from "@/hooks/use-instance-guard"

export function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { active, deactivate } = useInstanceGuard()

  const [mounted,        setMounted]        = useState(false)
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [navVisible,     setNavVisible]     = useState(true)
  const [isTextExpanded, setIsTextExpanded] = useState(true)

  const lastScrollY    = useRef(0)
  const logoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuRef        = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 2670)
    return () => { if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current) }
  }, [mounted])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > 80) setNavVisible(y <= lastScrollY.current)
      else setNavVisible(true)
      lastScrollY.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); menuTriggerRef.current?.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen || !menuRef.current) return
    const focusables = menuRef.current.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]; const last = focusables[focusables.length - 1]
    first?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener("keydown", trap)
    return () => document.removeEventListener("keydown", trap)
  }, [menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  const navigate = useCallback((path: string) => {
    router.push(path); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" })
  }, [router])

  const handleLogoMouseEnter = () => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    setIsTextExpanded(true)
  }
  const handleLogoMouseLeave = () => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 1200)
  }

  /* ── Pill style shared between logo and controls ── */
  const pillClass = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 rounded-[14px] border border-gray-200 dark:border-zinc-800 shadow-sm"

  return (
    <>
      <a href="#main-content" className="skip-to-content">Skip to content</a>

      <header
        role="banner"
        className="fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 h-[--nav-h] items-center pointer-events-none"
      >
        <div className="flex items-center justify-between w-full max-w-[1200px]">

          {/* ── Logo — always visible ── */}
          <div
            className={cn(
              pillClass,
              "flex items-center cursor-pointer select-none pointer-events-auto group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300",
              isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0"
            )}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            onClick={() => navigate("/")}
            role="link"
            tabIndex={0}
            aria-label={`${BIZ.name} — Go to homepage`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/") } }}
          >
            <div className="relative w-6 h-6 md:w-7 md:h-7 shrink-0 group-hover:scale-105 forced-brand-logo rounded-[14px] overflow-hidden transition-transform duration-300">
              <Image src="/logo.png" alt="" aria-hidden="true" fill priority sizes="(max-width:768px) 24px,28px" className="object-contain" />
            </div>
            <div
              className="font-sans font-black text-[1.1rem] md:text-[1.15rem] leading-none tracking-tight transition-all duration-500 ease-in-out overflow-hidden flex items-center"
              style={{ maxWidth: isTextExpanded ? "180px" : "0px", opacity: isTextExpanded ? 1 : 0 }}
              aria-hidden="true"
            >
              <span className="text-brand-blue dark:text-brand-light-blue whitespace-nowrap">Apexbytes</span>
              <span className="text-brand-green dark:text-brand-light-green whitespace-nowrap ml-1">Hub</span>
            </div>
          </div>

          {/* ── Controls pill — hides on scroll down ── */}
          <div
            className={cn(
              pillClass,
              "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-auto transition-all duration-300",
              !navVisible && !menuOpen ? "-translate-y-20 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
            )}
          >
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center justify-center w-7 h-7 transition-transform duration-300 active:scale-90 cursor-pointer"
            >
              {!mounted ? (
                <div className="w-5 h-5" aria-hidden="true" />
              ) : theme === "dark" ? (
                <Moon size={20} weight="fill" className="text-brand-light-blue" aria-hidden="true" />
              ) : (
                <Sun size={20} weight="fill" className="text-brand-orange" aria-hidden="true" />
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />

            {/* Hamburger */}
            <button
              ref={menuTriggerRef}
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              className={cn(
                "flex items-center justify-center w-7 h-7 transition-all duration-300 active:scale-90 cursor-pointer",
                menuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              <div className="w-4 h-[12px] flex flex-col justify-between items-center" aria-hidden="true">
                <span className="w-full h-[2.5px] bg-brand-orange dark:bg-brand-light-blue rounded-full" />
                <span className="w-full h-[2.5px] bg-brand-orange dark:bg-brand-light-blue rounded-full" />
                <span className="w-full h-[2.5px] bg-brand-orange dark:bg-brand-light-blue rounded-full" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Fullscreen Drawer ── */}
      <div
        id="nav-drawer"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-0 z-[9998] flex flex-col items-center justify-center transition-all duration-300 overflow-hidden",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 backdrop-blur-md bg-white/80 dark:bg-[#081428]/85 cursor-pointer"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        <nav className="relative z-10 w-full max-w-[320px] px-6 flex flex-col items-center gap-6">
          <div
            className={cn(
              "flex flex-col items-center gap-2.5 w-full transition-all duration-300",
              menuOpen ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-4 opacity-0"
            )}
          >
            {NAV_ITEMS.map((item, index) => {
              const isActive = pathname === item.path && !item.isCta
              return (
                <div key={item.id} className="relative flex items-center w-full justify-center">
                  {isActive && (
                    <CaretLeft
                      weight="fill"
                      size={14}
                      className="absolute left-[calc(50%-90px)] text-brand-blue"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    onClick={() => navigate(item.path)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "py-2.5 px-8 rounded-[14px] font-sans font-extrabold text-sm transition-all duration-300 active:scale-95 text-center shadow-sm cursor-pointer w-[160px]",
                      item.isCta
                        ? "bg-brand-blue text-white active:bg-brand-orange hover:opacity-90 dark:bg-brand-blue dark:text-white dark:active:bg-brand-orange border-none"
                        : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    style={{ transitionDelay: menuOpen ? `${index * 35}ms` : "0ms" }}
                  >
                    {item.label}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Close button */}
          <button
            onClick={() => { setMenuOpen(false); menuTriggerRef.current?.focus() }}
            aria-label="Close navigation menu"
            className={cn(
              "p-3 rounded-full border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center transition-all duration-500 delay-150 hover:scale-105 active:scale-90 cursor-pointer",
              menuOpen ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 -translate-y-4"
            )}
          >
            <div className="w-6 h-6 flex items-center justify-center relative" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-6 h-6 absolute inset-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="x-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className="gradient-morph-stop-1" />
                    <stop offset="100%" className="gradient-morph-stop-2" />
                  </linearGradient>
                </defs>
                <path d="M4 4L20 20M20 4L4 20" stroke="url(#x-grad)" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </div>
          </button>
        </nav>

        <div
          className={cn(
            "relative z-10 text-center select-none transition-all duration-500 mt-4",
            menuOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
          )}
          style={{ transitionDelay: menuOpen ? `${NAV_ITEMS.length * 35 + 100}ms` : "0ms" }}
          aria-hidden="true"
        >
          <div className="font-sans font-black text-sm tracking-tight text-gray-500 dark:text-zinc-400">{BIZ.nameShort}</div>
          <p className="text-gray-400 dark:text-zinc-500 text-[0.68rem] font-bold tracking-widest mt-1">Founded by {BIZ.founder}</p>
        </div>
      </div>
    </>
  )
}
