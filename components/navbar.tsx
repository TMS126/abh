// components/navbar.tsx
"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { Sun, Moon } from "@phosphor-icons/react"
import { NAV_ITEMS, BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"
import { useNavVisibility, useMobileMenu, useLogoAnimation, useNavContrast } from "@/hooks/use-navbar"
import { MobileMenu } from "@/components/navbar/mobile-menu"

const HOVER_ORANGE = "#F4A261"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
  const [desktopNavOpen, setDesktopNavOpen] = useState(false)
  const [contactHovered, setContactHovered] = useState(false)
  const [ctaPulse, setCtaPulse] = useState(false)

  const navVisible = useNavVisibility()
  const { menuOpen, setMenuOpen } = useMobileMenu()
  const { isTextExpanded, handleLogoMouseEnter, handleLogoMouseLeave } = useLogoAnimation()
  const isDarkBehind = useNavContrast()
  const isLogoDarkBehind = useNavContrast(0.07)

  const desktopNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => setDesktopNavOpen(false), [pathname])

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

  // ── CTA emphasis after deep scroll ───────────────────────────────────
  useEffect(() => {
    setCtaPulse(false)
    if (pathname === "/contact") return
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 2) {
        setCtaPulse(true)
        window.removeEventListener("scroll", onScroll)
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  const navigate = useCallback(
    (path: string) => {
      router.push(path)
      setMenuOpen(false)
      setDesktopNavOpen(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [router, setMenuOpen]
  )

  const handleThemeToggle = () => setTheme(theme === "dark" ? "light" : "dark")

  const glassPillClass = "backdrop-blur-md py-2 rounded-[14px] pointer-events-auto"

  const neutralColor = useMemo(() => {
    if (!mounted) return "#3f3f46"
    if (isDarkBehind) return "#f4f4f5"
    if (theme === "dark") return "#e4e4e7"
    return "#3f3f46"
  }, [mounted, theme, isDarkBehind])

  const logoNeutralColor = useMemo(() => {
    if (!mounted) return "#3f3f46"
    if (isLogoDarkBehind) return "#f4f4f5"
    if (theme === "dark") return "#e4e4e7"
    return "#3f3f46"
  }, [mounted, theme, isLogoDarkBehind])

  const useLightLogoIcon = mounted && (isLogoDarkBehind || theme === "dark")

  const hubColor = useMemo(() => {
    if (!mounted) return BRAND.green
    if (isLogoDarkBehind) return BRAND.lightGreen
    return theme === "dark" ? BRAND.lightGreen : BRAND.green
  }, [mounted, theme, isLogoDarkBehind])

  const handleNavFocus = () => setDesktopNavOpen(true)
  const handleNavBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!desktopNavRef.current?.contains(e.relatedTarget as Node)) {
      setDesktopNavOpen(false)
    }
  }

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[10000] -translate-y-24 focus:translate-y-0 transition-transform duration-200 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-sm px-4 py-2 rounded-[10px] shadow-lg outline-2 outline-brand-blue"
      >
        Skip to content
      </a>

      {/* NOTE: .abh-cta-pulse keyframes now live in globals.css — see that
          file's PART 1. Previously an inline <style> tag here got
          re-injected into the DOM on every route change since this
          component remounts per-page. */}

      <header
        className="fixed left-0 right-0 top-[var(--banner-h,0px)] z-[9999] flex flex-col pointer-events-none transition-[top] duration-300 ease-out"
      >
        <div className="flex justify-center px-4 md:px-8 pt-5 h-[--nav-h] items-center">
          <div className="relative flex items-center justify-between w-full max-w-[1200px]">
            {/* Logo */}
            <div
              role="button"
              tabIndex={0}
              aria-label="ApexbytesHub — go to homepage"
              className={cn(
                glassPillClass,
                "flex items-center cursor-pointer select-none pointer-events-auto group transition-all duration-300",
                isTextExpanded ? "pl-3 pr-4 gap-2.5" : "px-2.5 gap-0",
                menuOpen || !navVisible
                  ? "opacity-0 -translate-y-20 pointer-events-none"
                  : "opacity-100 translate-y-0 pointer-events-auto"
              )}
              style={{ transition: "opacity 300ms, transform 300ms" }}
              onMouseEnter={handleLogoMouseEnter}
              onMouseLeave={handleLogoMouseLeave}
              onClick={() => navigate("/")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/") }
              }}
            >
              <img
                src="/logo.png"
                alt=""
                aria-hidden="true"
                className="relative w-8 h-8 md:w-9 md:h-9 shrink-0 object-contain transition-[filter] duration-300"
                style={{ filter: useLightLogoIcon ? "brightness(0) invert(1)" : "brightness(0)" }}
              />
              <div
                className="font-sans font-black text-[1.32rem] leading-none tracking-tight transition-all duration-500 overflow-hidden flex items-center"
                style={{ maxWidth: isTextExpanded ? "180px" : "0px" }}
              >
                <span className="whitespace-nowrap transition-colors duration-300" style={{ color: BRAND.blue }}>
                  Apexbytes
                </span>
                <span className="whitespace-nowrap transition-colors duration-300" style={{ color: hubColor }}>
                  Hub
                </span>
              </div>
            </div>

            {/* Desktop nav */}
            <div
              ref={desktopNavRef}
              onMouseEnter={() => setDesktopNavOpen(true)}
              onMouseLeave={() => setDesktopNavOpen(false)}
              onFocus={handleNavFocus}
              onBlur={handleNavBlur}
              className={cn(
                "hidden md:flex items-center pointer-events-auto absolute left-1/2 -translate-x-1/2 transition-all duration-300",
                !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100"
              )}
            >
              <div className={cn("flex items-center py-2 transition-all duration-300 ease-out", desktopNavOpen ? "gap-1 px-1" : "px-2")}>
                <button
                  onClick={() => setDesktopNavOpen((v) => !v)}
                  aria-label={desktopNavOpen ? "Collapse navigation" : "Expand navigation"}
                  aria-expanded={desktopNavOpen}
                  className="relative flex items-center justify-center shrink-0 w-9 h-9"
                >
                  <span className="w-4 h-[12px] flex flex-col justify-between items-center" aria-hidden="true">
                    <span
                      className="w-full h-[2px] rounded-full transition-transform duration-300 ease-out"
                      style={{
                        backgroundColor: neutralColor,
                        transform: desktopNavOpen ? "translateY(5px) rotate(45deg)" : "none",
                      }}
                    />
                    <span
                      className="w-full h-[2px] rounded-full transition-all duration-200 ease-out"
                      style={{
                        backgroundColor: neutralColor,
                        opacity: desktopNavOpen ? 0 : 1,
                        transform: desktopNavOpen ? "scaleX(0)" : "scaleX(1)",
                      }}
                    />
                    <span
                      className="w-full h-[2px] rounded-full transition-transform duration-300 ease-out"
                      style={{
                        backgroundColor: neutralColor,
                        transform: desktopNavOpen ? "translateY(-5px) rotate(-45deg)" : "none",
                      }}
                    />
                  </span>
                </button>

                <div
                  className={cn(
                    "flex items-center gap-1 transition-all duration-300 ease-out backdrop-blur-md rounded-[14px]",
                    desktopNavOpen ? "opacity-100 translate-x-0 max-w-[600px] px-1" : "opacity-0 -translate-x-2 max-w-0 pointer-events-none"
                  )}
                >
                  {NAV_ITEMS.map((item, idx) => {
                    const isActive = pathname === item.path

                    if (item.isCta) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.path)}
                          onMouseEnter={() => setContactHovered(true)}
                          onMouseLeave={() => setContactHovered(false)}
                          aria-current={isActive ? "page" : undefined}
                          style={{
                            transitionDelay: desktopNavOpen ? `${idx * 30}ms` : "0ms",
                            backgroundColor: contactHovered ? HOVER_ORANGE : BRAND.blue,
                            borderColor: contactHovered ? HOVER_ORANGE : BRAND.blue,
                            color: "#ffffff",
                          }}
                          className={cn(
                            "px-4 py-2 rounded-[10px] text-base whitespace-nowrap border-2 font-black transition-all duration-200",
                            desktopNavOpen ? "opacity-100 scale-100" : "opacity-0 scale-75",
                            ctaPulse && "abh-cta-pulse"
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
                        aria-current={isActive ? "page" : undefined}
                        style={{
                          transitionDelay: desktopNavOpen ? `${idx * 30}ms` : "0ms",
                          color: isActive ? HOVER_ORANGE : neutralColor,
                        }}
                        className={cn(
                          "px-3.5 py-2 text-base whitespace-nowrap bg-transparent border-2 border-transparent transition-all duration-200",
                          desktopNavOpen ? "opacity-100 scale-100" : "opacity-0 scale-75",
                          isActive ? "font-black" : "font-medium"
                        )}
                        onMouseEnter={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = HOVER_ORANGE
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.color = neutralColor
                        }}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div
              className={cn(
                glassPillClass,
                "flex items-center gap-3 pl-3 pr-3 pointer-events-auto ml-4 transition-all duration-300",
                !navVisible && !menuOpen ? "-translate-y-20 opacity-0" : "translate-y-0 opacity-100"
              )}
              style={{ transition: "opacity 300ms, transform 300ms" }}
            >
              <button
                onClick={handleThemeToggle}
                className="flex items-center justify-center w-7 h-7 active:scale-90 transition-transform"
                aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
              >
                {mounted &&
                  (theme === "dark" ? (
                    <Moon size={20} weight="fill" style={{ color: neutralColor }} className="transition-colors duration-300" />
                  ) : (
                    <Sun size={20} weight="fill" style={{ color: neutralColor }} className="transition-colors duration-300" />
                  ))}
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="flex items-center justify-center w-7 h-7 active:scale-90 md:hidden"
              >
                <span className="relative w-4 h-[12px] flex flex-col justify-between items-center" aria-hidden="true">
                  <span
                    className="w-full h-[2.5px] rounded-full transition-transform duration-300 ease-out"
                    style={{
                      backgroundColor: neutralColor,
                      transform: menuOpen ? "translateY(4.75px) rotate(45deg)" : "none",
                    }}
                  />
                  <span
                    className="w-full h-[2.5px] rounded-full transition-all duration-200 ease-out"
                    style={{
                      backgroundColor: neutralColor,
                      opacity: menuOpen ? 0 : 1,
                      transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
                    }}
                  />
                  <span
                    className="w-full h-[2.5px] rounded-full transition-transform duration-300 ease-out"
                    style={{
                      backgroundColor: neutralColor,
                      transform: menuOpen ? "translateY(-4.75px) rotate(-45deg)" : "none",
                    }}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} pathname={pathname} navigate={navigate} neutralColor={neutralColor} />
    </>
  )
                  }
