"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { Sun, Moon, X, List } from "@phosphor-icons/react"
import { NAV_ITEMS, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [mounted,        setMounted]        = useState(false)
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [navVisible,     setNavVisible]     = useState(true)
  const [isTextExpanded, setIsTextExpanded] = useState(true)
  // Desktop nav-pill expand state — separate from the mobile `menuOpen`
  // full-screen menu, since this is a small inline hover/tap reveal
  // rather than a full overlay.
  const [desktopNavOpen, setDesktopNavOpen] = useState(false)
  const [contactHovered, setContactHovered] = useState(false)
  const desktopNavRef = useRef<HTMLDivElement>(null)

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

  // Tap-outside closes the desktop nav-pill — needed for the touch/tap
  // path, since there's no hover to fall back on to close it.
  useEffect(() => {
    if (!desktopNavOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setDesktopNavOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [desktopNavOpen])

  // Collapses the pill whenever the route changes (after navigating via
  // one of its links, or any other route change).
  useEffect(() => { setDesktopNavOpen(false) }, [pathname])

  const navigate = useCallback((path: string) => {
    router.push(path); setMenuOpen(false); setDesktopNavOpen(false); window.scrollTo({ top: 0, behavior: "smooth" })
  }, [router])

  const handleLogoMouseEnter = () => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    setIsTextExpanded(true)
  }
  const handleLogoMouseLeave = () => {
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    logoTimeoutRef.current = setTimeout(() => setIsTextExpanded(false), 1200)
  }

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const pillClass = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md py-2 rounded-[14px] border border-gray-200 dark:border-zinc-800 shadow-sm"

  // Single static brand color for every icon/indicator in the navbar —
  // no more per-route or per-hub swapping. Only the theme (light/dark)
  // changes which shade of blue is used.
  const iconColor = mounted && theme === "dark" ? BRAND.lightBlue : BRAND.blue
  const logoColor = iconColor

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[9999] flex justify-center px-4 md:px-8 pt-5 h-[--nav-h] items-center pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-[1200px]">

          {/* Logo — hides when menu is open, or when scrolling down (same
              show/hide-on-scroll-direction logic as the rest of the nav) */}
          <div
            className={cn(
              pillClass,
              "flex items-center cursor-pointer select-none pointer-events-auto group transition-all duration-300",
              isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0",
              menuOpen || (!navVisible) ? "opacity-0 -translate-y-20 pointer-events-none" : "opacity-100 translate-y-0 pointer-events-auto"
            )}
            onMouseEnter={handleLogoMouseEnter}
            onMouseLeave={handleLogoMouseLeave}
            onClick={() => navigate("/")}
          >
            <div
              className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-[14px] overflow-hidden transition-colors duration-300"
              style={{
                backgroundColor: logoColor,
                WebkitMaskImage: "url(/logo.png)",
                maskImage: "url(/logo.png)",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
              aria-hidden="true"
            />
            <div className="font-sans font-black text-[1.1rem] leading-none tracking-tight transition-all duration-500 overflow-hidden flex items-center" style={{ maxWidth: isTextExpanded ? "180px" : "0px" }}>
              <span
                className="whitespace-nowrap transition-colors duration-300"
                style={{
                  color: mounted && theme === "dark" ? BRAND.lightBlue : BRAND.blue
                }}
              >
                Apexbytes
              </span>
              <span
                className="whitespace-nowrap transition-colors duration-300"
                style={{
                  color: mounted && theme === "dark" ? BRAND.lightGreen : BRAND.green
                }}
              >
                Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav — a single pill, collapsed by default to just the
              hamburger lines. Hovering (or tapping, for touch devices
              without hover) grows it sideways to reveal all 5 links; it
              stays open while the pointer is anywhere over the pill OR
              the revealed links, only collapsing once the pointer leaves
              the whole group.

              Individual links: NO pill/background container when
              inactive — plain text only. Active (non-CTA) links get a
              blue border outline, no fill. The Contact link (CTA) keeps
              a neutral border by default and fills solid green only on
              hover. */}
          <div
            ref={desktopNavRef}
            onMouseEnter={() => setDesktopNavOpen(true)}
            onMouseLeave={() => setDesktopNavOpen(false)}
            className={cn(
              "hidden md:flex items-center pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-300",
              !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            <div
              className={cn(
                pillClass,
                "flex items-center overflow-hidden transition-[padding] duration-300 ease-out",
                desktopNavOpen ? "gap-1.5 px-2" : "px-3"
              )}
            >
              {/* Hamburger trigger — fades out (doesn't slide/morph) once
                  open. Also acts as the tap target for touch devices
                  without hover. */}
              <button
                onClick={() => setDesktopNavOpen(v => !v)}
                aria-label={desktopNavOpen ? "Collapse navigation" : "Expand navigation"}
                aria-expanded={desktopNavOpen}
                className={cn(
                  "relative flex items-center justify-center shrink-0 transition-all duration-200 ease-out",
                  desktopNavOpen ? "w-0 opacity-0 pointer-events-none" : "w-9 h-9 opacity-100"
                )}
              >
                <List size={18} weight="bold" style={{ color: iconColor }} className="transition-colors duration-300" />
              </button>

              {/* Revealed links — fade + slide in to replace the hamburger
                  rather than sitting alongside it. */}
              <div
                className={cn(
                  "flex items-center gap-1.5 transition-all duration-300 ease-out",
                  desktopNavOpen
                    ? "opacity-100 translate-x-0 max-w-[600px]"
                    : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
                )}
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.path

                  if (item.isCta) {
                    // Contact — neutral border by default, active gets a
                    // blue border like everything else, hover fills solid
                    // green regardless of active state.
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        onMouseEnter={() => setContactHovered(true)}
                        onMouseLeave={() => setContactHovered(false)}
                        style={
                          contactHovered
                            ? { backgroundColor: BRAND.green, borderColor: BRAND.green, color: "#ffffff" }
                            : undefined
                        }
                        className={cn(
                          "px-4 py-2 rounded-[10px] text-[0.84rem] whitespace-nowrap transition-all duration-200 border-2",
                          contactHovered
                            ? "font-black"
                            : isActive
                            ? "font-black border-brand-blue text-brand-blue dark:border-brand-light-blue dark:text-brand-light-blue"
                            : "font-medium border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400"
                        )}
                      >
                        {item.label}
                      </button>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "px-4 py-2 rounded-[10px] text-[0.84rem] whitespace-nowrap transition-all duration-200 border-2 border-transparent",
                        isActive
                          ? "font-black border-brand-blue text-brand-blue dark:border-brand-light-blue dark:text-brand-light-blue"
                          : "font-medium text-zinc-500 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-brand-light-blue"
                      )}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Controls — Always visible on desktop, hidden on mobile when
              menu is open. All icons now share the single static
              iconColor (brand blue), no per-route swapping. */}
          <div className={cn(pillClass, "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-4 transition-all duration-300", !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100")}>
            <button onClick={handleThemeToggle} className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform" aria-label="Toggle theme">
              {mounted && (
                theme === "dark"
                  ? <Moon size={20} weight="fill" style={{ color: iconColor }} className="transition-colors duration-300" />
                  : <Sun  size={20} weight="fill" style={{ color: iconColor }} className="transition-colors duration-300" />
              )}
            </button>

            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 md:hidden" />

            <button ref={menuTriggerRef} onClick={() => setMenuOpen(true)} className={cn("flex items-center justify-center w-7 h-7 active:scale-90 md:hidden", menuOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
              <div className="w-4 h-[12px] flex flex-col justify-between items-center">
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: iconColor }} />
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: iconColor }} />
                <span className="w-full h-[2.5px] rounded-full transition-colors duration-300" style={{ backgroundColor: iconColor }} />
              </div>
            </button>

            <button onClick={() => setMenuOpen(false)} className={cn("flex items-center justify-center w-7 h-7 active:scale-90 absolute right-3 md:hidden", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
              <X size={20} weight="bold" style={{ color: iconColor }} className="transition-colors duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={cn("fixed inset-0 z-[9998] md:hidden transition-opacity duration-300", menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}
      >
        {/* Rotational fade background */}
        <div
          className={cn("absolute -inset-[50%] transition-opacity duration-700", menuOpen ? "opacity-100 animate-[spin_16s_linear_infinite]" : "opacity-0")}
          style={{ background: "conic-gradient(from 0deg, rgba(30,111,168,0.18), rgba(111,191,26,0.16), rgba(244,162,97,0.16), rgba(30,111,168,0.18))" }}
        />
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />

        {/* Nav links — centered. Active link now gets a solid blue fill
            plus a side-line bar on the left edge as the "you are here"
            marker, replacing the old dot-before-label. */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">
          <nav className="w-full max-w-[320px] flex flex-col items-center gap-2.5">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname === item.path

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    transitionDelay: menuOpen ? `${idx * 60}ms` : "0ms",
                    ...(isActive
                      ? { backgroundColor: iconColor, color: "#ffffff" }
                      : {}),
                  }}
                  className={cn(
                    "relative py-3 px-8 rounded-[14px] font-sans text-base transition-all duration-300 active:scale-95 text-center w-[180px] shadow-sm overflow-hidden",
                    isActive
                      ? "font-semibold"
                      : "font-medium text-zinc-700 dark:text-zinc-200 hover:text-brand-blue bg-transparent",
                    item.isCta && !isActive && "border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
                    menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                >
                  {/* Side-line — vertical bar on the left edge, only for
                      the active link. Replaces the old dot marker. */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 w-[4px] rounded-r-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
                    />
                  )}
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Icon-only watermark at bottom of menu — static brand blue, no
            per-route tinting. */}
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
              backgroundColor: logoColor,
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
    </>
  )
}
