"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Sun, Moon, X } from "@phosphor-icons/react"
import { BIZ, NAV_ITEMS } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { BusinessStatusNavbar } from "@/components/business-status"

export function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

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

  const pillClass = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 rounded-[14px] border border-gray-200 dark:border-zinc-800 shadow-sm"

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 pt-5 h-[--nav-h] items-center pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-[1200px]">

          {/* Logo — always visible */}
          <div
            className={cn(pillClass, "flex items-center cursor-pointer select-none pointer-events-auto group transition-all duration-300", isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0")}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            onClick={() => navigate("/")}
          >
            <div
              className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-[14px] overflow-hidden transition-all duration-300"
              style={mounted && theme === "dark" ? { filter: "invert(1) sepia(1) saturate(2.5) hue-rotate(150deg) brightness(0.85)" } : undefined}
            >
              <Image src="/logo.png" alt="" fill priority sizes="36px" className="object-contain" />
            </div>
            <div className="font-sans font-black text-[1.1rem] leading-none tracking-tight transition-all duration-500 overflow-hidden flex items-center" style={{ maxWidth: isTextExpanded ? "180px" : "0px", opacity: isTextExpanded ? 1 : 0 }}>
              <span className="text-brand-blue dark:text-brand-light-blue whitespace-nowrap">Apexbytes</span><span className="text-brand-green dark:text-brand-light-green whitespace-nowrap">Hub</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className={cn(pillClass, "hidden md:flex items-center gap-1 px-1 pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn("px-4 py-2 rounded-[14px] text-[0.84rem] font-black transition-all duration-300", isActive ? "bg-brand-blue text-white" : "text-zinc-500 dark:text-zinc-400 hover:text-brand-blue")}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className={cn(pillClass, "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-4 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform">
              {mounted && (theme === "dark" ? <Moon size={20} weight="fill" className="text-brand-light-blue" /> : <Sun size={20} weight="fill" className="text-brand-orange" />)}
            </button>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
            <BusinessStatusNavbar />

            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 md:hidden" />

            <button ref={menuTriggerRef} onClick={() => setMenuOpen(true)} className={cn("flex items-center justify-center w-7 h-7 active:scale-90 md:hidden", menuOpen ? "opacity-0" : "opacity-100")}>
              <div className="w-4 h-[12px] flex flex-col justify-between items-center">
                <span className="w-full h-[2.5px] bg-brand-orange dark:bg-brand-light-blue rounded-full" />
                <span className="w-full h-[2.5px] bg-brand-orange dark:bg-brand-light-blue rounded-full" />
                <span className="w-full h-[2.5px] bg-brand-orange dark:bg-brand-light-blue rounded-full" />
              </div>
            </button>

            <button onClick={() => setMenuOpen(false)} className={cn("flex items-center justify-center w-7 h-7 active:scale-90 absolute right-3", menuOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
              <X size={20} weight="bold" className="text-brand-orange" />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Menu */}
      <div
        ref={menuRef}
        className={cn("fixed inset-0 z-[9998] flex flex-col items-center justify-center transition-opacity duration-300 overflow-hidden", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
      >
        {/* Rotational fade background */}
        <div
          className={cn("absolute -inset-[50%] transition-opacity duration-700", menuOpen ? "opacity-100 animate-[spin_16s_linear_infinite]" : "opacity-0")}
          style={{ background: "conic-gradient(from 0deg, rgba(30,111,168,0.18), rgba(111,191,26,0.16), rgba(244,162,97,0.16), rgba(30,111,168,0.18))" }}
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />

        {/* Nav links — centered */}
        <nav className="relative z-10 w-full max-w-[320px] px-6 flex flex-col items-center gap-6">
          <div className={cn("flex flex-col items-center gap-2.5 w-full transition-all duration-300", menuOpen ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-4 opacity-0")}>
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname === item.path
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{ transitionDelay: menuOpen ? `${idx * 60}ms` : "0ms" }}
                  className={cn(
                    "py-3 px-8 rounded-[14px] font-sans font-extrabold text-base transition-all duration-300 active:scale-95 text-center w-[180px] shadow-sm",
                    isActive
                      ? "text-brand-blue dark:text-brand-light-blue"
                      : "text-zinc-700 dark:text-zinc-200 hover:text-brand-blue",
                    menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                >
                  {/* Active indicator */}
                  <span className="flex items-center justify-center gap-2">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-light-blue shrink-0" />
                    )}
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Logo at bottom of menu — plain, adapts to light/dark */}
        <div
          className={cn(
            "absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 select-none transition-all duration-500 z-10",
            menuOpen ? "opacity-40" : "opacity-0"
          )}
          aria-hidden="true"
        >
          <div
            className="relative w-7 h-7 shrink-0"
            style={
              mounted && theme === "dark"
                ? { filter: "brightness(0) invert(1)" }      // white in dark mode
                : { filter: "brightness(0)" }                  // black in light mode
            }
          >
            <Image src="/logo.png" alt="" fill sizes="28px" className="object-contain" />
          </div>
          <span className="font-sans font-black text-sm tracking-tight text-zinc-900 dark:text-white">
            ApexbytesHub
          </span>
        </div>
      </div>
    </>
  )
}
 
 
